-- MenuBoard — full Supabase schema with RLS
-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Restaurants
-- ---------------------------------------------------------------------------
create table if not exists public.restaurants (
  id text primary key,
  slug text unique not null,
  name text not null,
  tagline text,
  logo_url text,
  phone text,
  branding jsonb not null default '{"primaryColor":"#ea580c","displayLayout":"grid"}'::jsonb,
  plan text not null default 'starter' check (plan in ('starter', 'pro')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Menu data
-- ---------------------------------------------------------------------------
create table if not exists public.menu_categories (
  id text primary key,
  restaurant_id text not null references public.restaurants (id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  image_url text,
  active boolean not null default true
);

create table if not exists public.menu_items (
  id text primary key,
  restaurant_id text not null references public.restaurants (id) on delete cascade,
  category_id text not null references public.menu_categories (id) on delete cascade,
  name text not null,
  description text not null default '',
  price_cents int not null check (price_cents >= 0 and price_cents <= 1000000),
  image_url text not null default '',
  available boolean not null default true,
  featured boolean not null default false,
  sort_order int not null default 0,
  nutrition jsonb
);

create table if not exists public.item_reviews (
  id text primary key,
  restaurant_id text not null references public.restaurants (id) on delete cascade,
  item_id text not null references public.menu_items (id) on delete cascade,
  customer_name text,
  rating int not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 2 and 500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Owner accounts (one restaurant per user in MVP)
-- ---------------------------------------------------------------------------
create table if not exists public.restaurant_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  restaurant_id text not null references public.restaurants (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id),
  unique (restaurant_id)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_restaurants_slug on public.restaurants (slug);
create index if not exists idx_menu_categories_restaurant on public.menu_categories (restaurant_id);
create index if not exists idx_menu_items_restaurant on public.menu_items (restaurant_id);
create index if not exists idx_menu_items_category on public.menu_items (category_id);
create index if not exists idx_item_reviews_restaurant on public.item_reviews (restaurant_id);
create index if not exists idx_item_reviews_item on public.item_reviews (item_id);
create index if not exists idx_item_reviews_status on public.item_reviews (status);
create index if not exists idx_restaurant_accounts_user on public.restaurant_accounts (user_id);

-- ---------------------------------------------------------------------------
-- Helper: does the current user own this restaurant?
-- ---------------------------------------------------------------------------
create or replace function public.user_owns_restaurant(rid text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.restaurant_accounts ra
    where ra.user_id = auth.uid()
      and ra.restaurant_id = rid
  );
$$;

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- updated_at trigger for profiles
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.item_reviews enable row level security;
alter table public.restaurant_accounts enable row level security;

-- Profiles: own row only
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Restaurants: public read; owners write their own; authenticated users can create non-demo
drop policy if exists "restaurants_public_read" on public.restaurants;
create policy "restaurants_public_read" on public.restaurants
  for select using (true);

drop policy if exists "restaurants_owner_insert" on public.restaurants;
create policy "restaurants_owner_insert" on public.restaurants
  for insert to authenticated
  with check (is_demo = false);

drop policy if exists "restaurants_owner_update" on public.restaurants;
create policy "restaurants_owner_update" on public.restaurants
  for update to authenticated
  using (public.user_owns_restaurant(id) and is_demo = false)
  with check (public.user_owns_restaurant(id) and is_demo = false);

drop policy if exists "restaurants_owner_delete" on public.restaurants;
create policy "restaurants_owner_delete" on public.restaurants
  for delete to authenticated
  using (public.user_owns_restaurant(id) and is_demo = false);

-- Categories: public read; owner write (non-demo restaurants)
drop policy if exists "categories_public_read" on public.menu_categories;
create policy "categories_public_read" on public.menu_categories
  for select using (true);

drop policy if exists "categories_owner_insert" on public.menu_categories;
create policy "categories_owner_insert" on public.menu_categories
  for insert to authenticated
  with check (
    public.user_owns_restaurant(restaurant_id)
    and not (select is_demo from public.restaurants where id = restaurant_id)
  );

drop policy if exists "categories_owner_update" on public.menu_categories;
create policy "categories_owner_update" on public.menu_categories
  for update to authenticated
  using (
    public.user_owns_restaurant(restaurant_id)
    and not (select is_demo from public.restaurants where id = restaurant_id)
  );

drop policy if exists "categories_owner_delete" on public.menu_categories;
create policy "categories_owner_delete" on public.menu_categories
  for delete to authenticated
  using (
    public.user_owns_restaurant(restaurant_id)
    and not (select is_demo from public.restaurants where id = restaurant_id)
  );

-- Menu items: same pattern
drop policy if exists "items_public_read" on public.menu_items;
create policy "items_public_read" on public.menu_items
  for select using (true);

drop policy if exists "items_owner_insert" on public.menu_items;
create policy "items_owner_insert" on public.menu_items
  for insert to authenticated
  with check (
    public.user_owns_restaurant(restaurant_id)
    and not (select is_demo from public.restaurants where id = restaurant_id)
  );

drop policy if exists "items_owner_update" on public.menu_items;
create policy "items_owner_update" on public.menu_items
  for update to authenticated
  using (
    public.user_owns_restaurant(restaurant_id)
    and not (select is_demo from public.restaurants where id = restaurant_id)
  );

drop policy if exists "items_owner_delete" on public.menu_items;
create policy "items_owner_delete" on public.menu_items
  for delete to authenticated
  using (
    public.user_owns_restaurant(restaurant_id)
    and not (select is_demo from public.restaurants where id = restaurant_id)
  );

-- Reviews: public reads approved; owners read all + moderate; anyone can submit pending
drop policy if exists "reviews_public_read_approved" on public.item_reviews;
create policy "reviews_public_read_approved" on public.item_reviews
  for select using (status = 'approved');

drop policy if exists "reviews_owner_read_all" on public.item_reviews;
create policy "reviews_owner_read_all" on public.item_reviews
  for select to authenticated
  using (public.user_owns_restaurant(restaurant_id));

drop policy if exists "reviews_public_insert" on public.item_reviews;
create policy "reviews_public_insert" on public.item_reviews
  for insert
  with check (status = 'pending');

drop policy if exists "reviews_owner_update" on public.item_reviews;
create policy "reviews_owner_update" on public.item_reviews
  for update to authenticated
  using (public.user_owns_restaurant(restaurant_id))
  with check (public.user_owns_restaurant(restaurant_id));

-- Restaurant accounts: users see/link own account only
drop policy if exists "accounts_select_own" on public.restaurant_accounts;
create policy "accounts_select_own" on public.restaurant_accounts
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "accounts_insert_own" on public.restaurant_accounts;
create policy "accounts_insert_own" on public.restaurant_accounts
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "accounts_delete_own" on public.restaurant_accounts;
create policy "accounts_delete_own" on public.restaurant_accounts
  for delete to authenticated
  using (auth.uid() = user_id);
