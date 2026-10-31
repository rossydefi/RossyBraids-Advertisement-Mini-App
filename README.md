# RossyBraids

Website, booking system, shop and owner dashboard for RossyBraids (luxury braids, locs, wigs and hair care).

- **Customers** (`/`): home page, live booking calendar, hair-care shop, before & after gallery, referral rewards, reviews, phone sign-in, installable PWA.
- **Owner** (`/admin`): bookings, orders, review moderation, the style gallery (upload photos and videos), reminders, availability and price/stock settings, CSV export.
- **Flyer designer** (`/flyer`): promotional flyer export (PNG, print, share).

React 19 + Vite + Tailwind on the front, Express + SQLite (Node's built-in `node:sqlite`) on the back. One process serves both.

## Run it locally

Needs **Node 22.13+** (Node 24 recommended, see `.nvmrc`).

```bash
npm install
cp .env.example .env      # optional for local use
npm run dev               # http://localhost:3000
```

The owner dashboard is at http://localhost:3000/admin. In development the password defaults to `rossy-admin`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | API + Vite dev server with hot reload on port 3000 |
| `npm run build` | Production build into `dist/` |
| `npm start` | Serves `dist/` and the API (`NODE_ENV=production`) |
| `npm test` | API integration tests + unit tests (Vitest) |
| `npm run lint` | TypeScript type-check |
| `npm run optimize-images` | Converts any new JPG/PNG in `src/assets/images` to resized WebP |

## Configuration (`.env`)

See `.env.example`. Everything is optional except in production, where `ADMIN_PASSWORD` is required.

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | Owner dashboard password. **Required in production.** |
| `APP_URL` | Public URL, used for payment redirects and SMS links |
| `DATA_DIR` | Where the SQLite database and uploaded inspiration photos live (default `./data`) |
| `SESSION_SECRET` | Signs sessions. Generated into `DATA_DIR` if empty |
| `PAYSTACK_SECRET_KEY` | Turns on deposits and online shop payments |
| `TERMII_API_KEY`, `TERMII_SENDER_ID`, `OWNER_PHONE` | SMS for sign-in codes, reminders and new booking/order alerts |
| `VITE_PLAUSIBLE_DOMAIN` | Enables Plausible analytics (build-time) |

### Online payments (Paystack)

1. Put your secret key in `PAYSTACK_SECRET_KEY`.
2. In the Paystack dashboard set the webhook URL to `<APP_URL>/api/payments/webhook`.
3. In `/admin` → Settings choose the deposit percentage and whether a deposit is required to book.

Without a key the site works as before: bookings and orders are saved and the customer finishes on WhatsApp.

### SMS (Termii)

Without a Termii key nothing is sent. Sign-in codes are shown on screen in development only, and the dashboard's Reminders tab offers one-click WhatsApp links instead. With a key the server also texts day-before appointment reminders and 4-week maintenance nudges, and alerts `OWNER_PHONE` about new bookings and orders.

## Deploying

```bash
npm ci
npm run build
ADMIN_PASSWORD=... APP_URL=https://rossybraids.com npm start
```

Use a host with a **persistent disk** and point `DATA_DIR` at it. The database is a single file; back it up by copying `rossybraids.db` (and the `uploads/` folder) while the app is idle, or with `sqlite3 rossybraids.db ".backup backup.db"`. Run behind HTTPS (the app trusts one proxy hop for client IPs).

## How it works

- **Prices are computed on the server** (`src/utils/pricing.ts` is shared) so a customer cannot change a total in the browser. Admin price overrides and stock counts apply on top of `src/data/flyerData.ts`.
- **Slots** can't be double-booked (unique index per date, slot and stylist). The owner can close weekdays, block dates and cap bookings per day.
- **Referral rewards** are issued and redeemed on the server. They are tied to the recipient's phone number, only for a first-time client, locked until the salon confirms the booking, then valid for 72 hours and usable once.
- **Gallery**: only the owner can upload, edit or delete (Admin → Gallery); clients can only view, watch and search. Uploads are saved in `data/uploads/` (photos and videos up to 150 MB). If you sit behind nginx or another proxy, raise its upload limit (for nginx, `client_max_body_size 150m;`) or large videos will be rejected. Until the first upload, clients see the sample styles that ship with the app.
- **Shop**: only the owner can add, edit, price or delete products (Admin → Shop); clients can browse, add to bag and order. Prices and stock are always applied on the server. Until the first product is added, clients see the sample products that ship with the app.
- **Home page**: the hero background cycles through your gallery uploads (photos and videos) and in-stock shop products, fading automatically from one to the next.
- **Reviews** are held until approved in `/admin`. The bundled sample testimonials are only shown until the first real review is approved.
- **Client sign-in** is phone + SMS code, so history follows a client across devices. Bookings made on a device are also remembered locally.

## Project layout

```
server/   Express API, SQLite, auth, payments, reminders (+ integration tests)
src/      React app (components, admin/, api/, hooks/, utils/, data/)
public/   PWA icons, robots.txt, sitemap.xml, og-image.jpg
scripts/  One-off tooling (image optimiser)
```

Content such as services, prices, products, stylists and time slots is in `src/data/flyerData.ts`.
