-- MenuBoard — Supabase schema stub (production migration path)

create table if not exists restaurants (
  id text primary key,
  slug text unique not null,
  name text not null,
  tagline text,
  logo_url text,
  branding jsonb not null default '{"primaryColor":"#ea580c"}'::jsonb,
  plan text not null default 'starter',
  created_at timestamptz not null default now()
);

create table if not exists menu_categories (
  id text primary key,
  restaurant_id text not null references restaurants(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  image_url text,
  active boolean not null default true
);

create table if not exists menu_items (
  id text primary key,
  restaurant_id text not null references restaurants(id) on delete cascade,
  category_id text not null references menu_categories(id) on delete cascade,
  name text not null,
  description text not null default '',
  price_cents int not null,
  image_url text not null default '',
  available boolean not null default true,
  featured boolean not null default false,
  sort_order int not null default 0,
  nutrition jsonb
);

create table if not exists item_reviews (
  id text primary key,
  restaurant_id text not null references restaurants(id) on delete cascade,
  item_id text not null references menu_items(id) on delete cascade,
  customer_name text,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists restaurant_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  restaurant_id text not null references restaurants(id) on delete cascade,
  unique (user_id)
);

create index if not exists idx_menu_categories_restaurant on menu_categories(restaurant_id);
create index if not exists idx_menu_items_restaurant on menu_items(restaurant_id);
create index if not exists idx_menu_items_category on menu_items(category_id);
create index if not exists idx_item_reviews_restaurant on item_reviews(restaurant_id);
create index if not exists idx_item_reviews_item on item_reviews(item_id);
