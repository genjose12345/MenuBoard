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

### 5. Email confirmation (required for “Confirm email” ON)

Supabase will **not send** confirmation emails unless these are configured:

#### A. URL Configuration (Supabase Dashboard → Authentication → URL Configuration)

| Field | Value |
|-------|-------|
| **Site URL** | `https://menu-board-beta.vercel.app` (your live URL) |
| **Redirect URLs** | `https://menu-board-beta.vercel.app/login` |

Add every domain you use (production + `http://localhost:5173/login` for local testing).

#### B. Vercel env var (required for correct email links)

```
VITE_SITE_URL=https://menu-board-beta.vercel.app
```

Redeploy after adding. Confirmation emails use this URL, not the Supabase REST URL.

#### C. Check if Supabase tried to send

Supabase Dashboard → **Authentication** → **Logs** — look for signup events and email errors.

#### D. Custom SMTP (required to edit email templates)

Supabase **blocks template editing** until Custom SMTP is enabled. You’ll see: *“Set up custom SMTP to edit templates.”* The built-in `noreply@mail.app.supabase.io` sender cannot be customized without this.

**Recommended: [Resend](https://resend.com) (free tier, works with Supabase)**

**Step 1 — Resend account**

1. Sign up at [resend.com](https://resend.com)
2. Go to **API Keys** → Create API Key → copy it (`re_...`)

**Step 2 — Sender address (pick one)**

| Option | Sender email | When to use |
|--------|----------------|-------------|
| **Quick test** | `onboarding@resend.dev` | No domain needed; can only send to your own verified email in Resend |
| **Production** | `noreply@yourdomain.com` | Add domain in Resend → **Domains** → verify DNS (DKIM/SPF) |

**Step 3 — Supabase SMTP Settings**

Supabase → **Authentication** → **Email** → **SMTP Settings**:

| Field | Value |
|-------|--------|
| Enable custom SMTP | ON |
| Sender email | `onboarding@resend.dev` (test) or `noreply@yourdomain.com` |
| Sender name | `MenuBoard` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | your Resend API key (`re_...`) |

Click **Save**.

**Step 4 — Customize the email (now unlocked)**

Authentication → **Email Templates** → **Confirm signup**

| Field | Example |
|-------|---------|
| **Subject** | `Confirm your MenuBoard account` |
| **Body** | HTML below — **must keep** `{{ .ConfirmationURL }}` |

```html
<h2>Welcome to MenuBoard</h2>
<p>Click below to confirm your email and start building your digital menu:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm my email</a></p>
<p>This link expires in 1 hour. If you didn't sign up, ignore this email.</p>
```

Docs: [Resend + Supabase SMTP](https://resend.com/docs/send-with-supabase-smtp) · [Supabase SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp)

#### E. If you signed up before email was working

1. Authentication → **Users** → delete the old unconfirmed user, **or**
2. Go to `/confirm-email` and click **Resend confirmation email**

After redeploy: sign up → you’ll land on `/confirm-email` with a resend button.

#### F. Fix `localhost:3000` in confirmation links

If clicking the email sends you to `http://localhost:3000/#error=...`, your **Site URL** is still the Supabase default.

1. Authentication → **URL Configuration**
2. Change **Site URL** from `http://localhost:3000` → `https://menu-board-beta.vercel.app`
3. Save, then **Resend** confirmation (old links are invalid)

The `otp_expired` error means the link was already used or is older than ~1 hour — request a fresh one.

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
