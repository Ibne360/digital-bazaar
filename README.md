# 🛍️ Digital Bazaar

> Premium digital marketplace for AI subscriptions, design tools, dev kits, and digital credits — instant delivery, lifetime warranty, wholesale tier for resellers.

A production-ready Next.js 14 e-commerce frontend with **wallet-deposit checkout (BDT)**, three-role dashboards (user / reseller / admin), automated digital delivery, and Supabase-ready data layer.

---

## ✨ Features

### Public storefront
- Beautifully designed home, category and product pages with gradient cards, badges, dark/light mode
- BDT pricing throughout (৳)
- Shopping cart with coupon codes (`WELCOME10`, `FLASH50`)
- **Wallet checkout** — no credit cards. Users deposit via local methods (bKash, Nagad, Rocket, Bank, Binance, USDT TRC-20) and pay with their wallet balance.

### User dashboard (`/dashboard`)
- Live wallet card with balance & quick actions
- Deposit request form (auto-submits TrxID + sender info, awaits admin approval)
- Deposit history with status badges
- Orders with delivered keys/accounts visible (one-click copy)
- Support tickets with replies

### Reseller dashboard (`/reseller`)
- Application flow (`none → pending → approved/rejected`)
- Wholesale catalog (25-45% off retail prices)
- Personal referral link + code (`/r/<code>` and `?ref=<code>`)
- 10% commission on every referred sale (auto-credited to wallet)
- Withdraw requests to bKash/Bank/USDT (admin-approved)
- Earnings stats (last 30 days, total earned, referred sales count)

### Admin dashboard (`/admin`)
- Real-time overview: revenue, pending deposits/withdraws, low-stock alerts, reseller applications
- **Products CRUD** with rich form (badges, gradients, delivery types, retail/wholesale pricing)
- **Inventory manager** — bulk-add CDKs / accounts / invite links (one per line)
- **Deposits** — filter pending/approved/rejected, approve credits wallet, reject notifies user
- **Withdraws** — same workflow; reject auto-refunds the held balance
- **Users & resellers** — role badges, wallet adjust, approve/reject reseller applications
- **Orders** — full ledger including wallet snapshots
- **Support tickets** — reply directly from admin

### Architecture
- Next.js 14 App Router + Server Actions (no client-side mutation libraries needed)
- Tailwind CSS + custom shadcn-style primitives + dark mode via CSS vars
- Lucide icons throughout
- Type-safe end-to-end (TypeScript)
- Currently uses a JSON-file dev backend (`data/db.json`) — migration to Supabase is in progress (see `BACKEND_TASKS.md`)

---

## 🚀 Quick start

### 1. Install
```bash
npm install
```

### 2. Create `.env.local`
```env
SESSION_SECRET=any-32-char-random-string-for-development

# Optional during development (not yet wired) — required after Supabase migration
NEXT_PUBLIC_SUPABASE_URL=https://lgsxwrpluxupofyufekd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=<from Supabase Project Settings → API>
```

### 3. Run dev server
```bash
npm run dev
```
Open http://localhost:3000

The first run writes `data/db.json` with sample products, categories, demo users and inventory. Delete the file any time to reset.

---

## 🔑 Demo credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@bazaar.dev` | `admin123` |
| **Reseller** | `reseller@bazaar.dev` | `reseller123` |
| **User** | `demo@bazaar.dev` | `user1234` |

The reseller has wallet `৳8,500`, total-earned `৳12,640`, and referral code `TOPDEAL`.
The user has wallet `৳1,500` to test checkout immediately.

---

## 🧭 Walkthrough

### As a customer
1. Sign in as `demo@bazaar.dev`
2. Browse `/products`, click any product
3. Add to cart, go to `/cart`
4. Apply coupon `WELCOME10` (10% off) — checkout pays from your `৳1,500` wallet
5. Visit `/dashboard/orders` — your delivered keys/accounts are revealed (click copy)

### As a reseller
1. Sign in as `reseller@bazaar.dev`
2. Visit `/reseller/catalog` — every product shown with retail-vs-wholesale and margin
3. Copy your referral link from `/reseller`
4. Open the link in an incognito window, sign up a new user, place an order — switch back: your wallet auto-credited 10%
5. Try `/reseller/withdraw` — request payout to bKash

### As an admin
1. Sign in as `admin@bazaar.dev`
2. `/admin` — KPI cards & action queues
3. `/admin/deposits` — see the user's pending deposit (created above), approve it → user's wallet auto-credited
4. `/admin/products/new` — create a new product. Then open it and bulk-paste 50 CDKs into the inventory box → instantly sellable
5. `/admin/users?filter=pending` — approve any reseller applications

### Wallet → checkout flow
```
1. User submits deposit request (bKash TrxID etc.)        →  status=pending
2. Admin reviews + approves on /admin/deposits             →  wallet += amount
3. User adds products to cart, checks out                  →  wallet -= total
4. Inventory items auto-pulled and revealed to user        →  order delivered
5. (If referred) reseller wallet auto-credited 10%         →  earnings tracked
```

---

## 📂 Project structure

```
src/
├── app/
│   ├── (public)              home, products, product detail, cart
│   ├── login, register
│   ├── checkout/success
│   ├── dashboard/            user dashboard (wallet, deposit, orders, support)
│   ├── reseller/             reseller hub (apply, catalog, withdraw)
│   ├── admin/                admin dashboard (CRUD + queues)
│   └── actions.ts            all server actions (cart, auth, checkout, admin ops)
├── components/
│   ├── ui/                   shadcn-style primitives (button, card, input, badge, …)
│   ├── product-card.tsx
│   ├── product-form.tsx      shared admin product create/edit form
│   ├── dashboard-sidebar.tsx
│   ├── header.tsx, footer.tsx, theme-provider.tsx, …
│   └── …
└── lib/
    ├── auth.ts               jose-based JWT cookie sessions + bcrypt
    ├── db.ts                 JSON-file dev store
    ├── orders.ts             cart, checkout, inventory pulling
    ├── seed.ts               sample products / categories / users
    ├── constants.ts          deposit methods (bKash, Nagad, Rocket, Bank, Binance, USDT)
    ├── types.ts              all domain types
    ├── utils.ts              cn(), formatCurrency(BDT), timeAgo, slugify
    └── supabase/             supabase client + admin client + row types
supabase/
├── schema.sql                Postgres tables, enums, triggers, atomic checkout RPC
├── policies.sql              Row-level security (public catalog, owner-only personal data)
└── seed.sql                  Sample categories + 10 BDT products + 100 inventory items

BACKEND_TASKS.md              👈 Hand this to your backend AI agent
```

---

## 🌍 Currency / locale

- All amounts stored & displayed in **BDT (৳)**.
- `formatCurrency()` produces `৳1,500` style strings.
- All deposit methods are local: bKash, Nagad, Rocket, DBBL bank, Binance Pay, USDT TRC-20.

---

## 🗄️ Backend roadmap

The current `data/db.json` backend is a dev shortcut. Production switches to Supabase:

1. **Frontend (already done)** — `@supabase/supabase-js` + `@supabase/ssr` installed, client/server factories live in `src/lib/supabase/`.
2. **Backend (forward `BACKEND_TASKS.md` to your other AI agent)** — they execute `supabase/schema.sql`, `policies.sql`, `seed.sql` and create demo users via Supabase Auth.
3. **Migration (next phase)** — replace every `getDb()`/`mutate()` call in pages and server actions with Supabase queries / RPCs (`checkout_with_wallet`, `approve_deposit`, etc.).

See `BACKEND_TASKS.md` for the exact handoff.

---

## 🛠️ Tech stack

- **Next.js 14.2** (App Router, Server Actions, RSC)
- **TypeScript 5**
- **Tailwind CSS 3.4** + custom design tokens
- **Lucide React** icons
- **bcryptjs** + **jose** (JWT cookie sessions, ≤ Supabase migration)
- **@supabase/supabase-js**, **@supabase/ssr**
- **clsx**, **tailwind-merge**, **class-variance-authority** for component variants

---

## 📜 Scripts

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```

---

## 📝 License

Private project — all rights reserved.
