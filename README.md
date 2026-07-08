# MenuBoard — QR Menu & Tablet Display

Digital menu for restaurants: customers scan a **QR code** on their phone, or staff open a **full-screen display board** on a tablet. Owners update prices, photos, nutrition, and item availability online — no reprinting.

## Features

### Public menu (`/menu/:slug`)
- Fast-food style category tabs
- Item photos, prices, featured items
- Item detail: description, **nutrition facts**, allergens
- **Customer reviews** (star rating + comment) — pending until owner approves

### Display board (`/display/:slug`)
- Full-screen tablet/TV layout with large typography
- Category tabs, live item grid
- **Enter fullscreen** for kiosk mode
- Auto-refreshes every **30 seconds** when menu changes in admin

### Admin (`/admin/:restaurantId`)
| Tab | Purpose |
|-----|---------|
| **Menu** | Categories + items CRUD, nutrition editor, sold-out & featured toggles |
| **Reviews** | Approve or reject customer-submitted reviews |
| **Branding** | Name, tagline, logo URL, accent color |
| **Display & QR** | Copy menu/display URLs, download QR PNG |

## Prerequisites

- Node.js 18+
- npm

## Supabase setup (production auth + database)

When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set, the app uses **Supabase Auth** and **PostgreSQL** with Row Level Security instead of json-server.

### 1. Run SQL in Supabase SQL Editor

Run in order:

1. [`supabase/schema.sql`](supabase/schema.sql) — tables, RLS policies, profile trigger
2. [`supabase/seed_demo.sql`](supabase/seed_demo.sql) — demo-burger & demo-taco sample data

### 2. Environment variables

Copy [`.env.example`](.env.example) to `.env` and fill in from **Project Settings → API**:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-jwt-key
```

Use the **Project URL** from the API settings page — do **not** append `/rest/v1/`. The Supabase JS client adds paths itself; using the REST URL causes auth 404 errors.

**Never** put the `service_role` key in the frontend or commit it to git.

### 3. Vercel

Add the same two env vars in your Vercel project settings, then redeploy.

### 4. Auth flow

| Step | Route |
|------|-------|
| Sign up | `/signup` → confirm email (if enabled) → `/login` |
| Log in | `/login` → your admin dashboard |
| Profile | `/profile` — name, email, password, business phone, plan |

Each account can own **one restaurant**. Demo restaurants are read-only previews.

**Login returns 400?** Common causes:

1. **Email not confirmed** — check inbox/spam, or click “Resend confirmation email” on the login page.
2. **Wrong password** — use the same password from signup.
3. **No account yet** — sign up first at `/signup`.

To skip email confirmation during testing: Supabase Dashboard → **Authentication** → **Providers** → **Email** → disable **Confirm email**, then sign up again.

Also add your site URL under **Authentication** → **URL Configuration** → **Redirect URLs**:
`https://your-app.vercel.app/login`

### Security

- **RLS** on all tables — public can read menus; only owners can write their data
- **Supabase Auth** handles password hashing, sessions, and email updates
- Demo restaurants (`is_demo = true`) cannot be modified or deleted
- Reviews: public submit as `pending`; only owners see/moderate all reviews

## Deploying to Vercel (without Supabase)

If Supabase env vars are **not** set, the app falls back to serverless API routes in [`api/`](api/) backed by `server/db.json` (ephemeral writes).

1. Import the repo in [Vercel](https://vercel.com) (framework preset: **Vite**)
2. Build command: `npm run build` · Output directory: `dist`
3. Deploy — demo menus at `/menu/demo-burger` and `/menu/demo-taco` should load immediately

## Local development

```bash
npm install
cp .env.example .env   # optional — enables Supabase when filled in
npm run dev
```

Without `.env`, local dev uses **json-server** at port 3002 (proxied via `/api`).

## Demo URLs

| Page | URL |
|------|-----|
| Home | http://localhost:5173/ |
| QR menu | http://localhost:5173/menu/demo-burger |
| Tablet display | http://localhost:5173/display/demo-burger |
| Admin | http://localhost:5173/admin/demo-burger |

## Create your own restaurant

1. **Sign up** at `/signup`, then **log in**
2. Go to **Get started** (`/get-started`) — requires login when Supabase is enabled
3. Enter restaurant name and URL slug
4. Add categories and items in **Admin → Menu**
5. Open **Display & QR** to copy links and download QR code


## Pricing (planned)

- **Starter** $9/mo — QR menu + admin
- **Pro** $19/mo — display board + review moderation

Ordering/cart is out of scope for this MVP.
