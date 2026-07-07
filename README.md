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

## Production path

[`supabase/schema.sql`](supabase/schema.sql) defines PostgreSQL tables for a future Supabase migration. Local dev uses [`server/db.json`](server/db.json).

## Pricing (planned)

- **Starter** $9/mo — QR menu + admin
- **Pro** $19/mo — display board + review moderation

Ordering/cart is out of scope for this MVP.
