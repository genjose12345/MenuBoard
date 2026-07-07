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

## Setup

```bash
cd menu-price-board-qr
npm install
npm run dev
```

Starts:
- **Vite** at http://localhost:5173 (or next free port)
- **json-server** at http://localhost:3002 (proxied via `/api`)

## Demo URLs

| Page | URL |
|------|-----|
| Home | http://localhost:5173/ |
| QR menu | http://localhost:5173/menu/demo-burger |
| Tablet display | http://localhost:5173/display/demo-burger |
| Admin | http://localhost:5173/admin/demo-burger |

## Create your own restaurant

1. Go to **Get started** (`/get-started`)
2. Enter restaurant name and URL slug
3. Add categories and items in **Admin → Menu**
4. Open **Display & QR** to copy links and download QR code

## Deploying to Vercel

The frontend is a static Vite build; menu data is served by **serverless API routes** in [`api/`](api/) (same REST shape as json-server). Vercel maps `/api/*` to those functions automatically — no json-server process is needed in production.

1. Import the repo in [Vercel](https://vercel.com) (framework preset: **Vite**)
2. Build command: `npm run build` · Output directory: `dist`
3. Deploy — demo menus at `/menu/demo-burger` and `/menu/demo-taco` should load immediately

**Note:** Writes on Vercel use an in-memory copy of [`server/db.json`](server/db.json) per serverless instance. Demo edits and new restaurants work for a session but can reset after idle/cold starts. For persistent production data, migrate to Supabase (see below).

## Production path

[`supabase/schema.sql`](supabase/schema.sql) defines PostgreSQL tables for a future Supabase migration with real auth. Local dev uses [`server/db.json`](server/db.json) via json-server.

### Security (demo deployment)

- Login is **demo-only** (any email/password opens the demo admin) — not suitable for real owners without Supabase Auth.
- Admin routes are not server-protected; anyone with a restaurant ID can call write APIs. Use real auth before going live.
- API validates URLs, field lengths, and review ratings; demo restaurants cannot be deleted.

## Pricing (planned)

- **Starter** $9/mo — QR menu + admin
- **Pro** $19/mo — display board + review moderation

Ordering/cart is out of scope for this MVP.
