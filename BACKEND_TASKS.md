# 📡 Backend Tasks — Digital Bazaar

This document is the **handoff to your backend AI agent**. Forward this entire folder (and especially the `supabase/*.sql` files) to that agent. Frontend code lives outside this folder — backend AI does NOT need to touch frontend code.

---

## 🎯 What's already done (frontend side)

✅ `@supabase/supabase-js` and `@supabase/ssr` installed
✅ `src/lib/supabase/client.ts` — browser client factory
✅ `src/lib/supabase/server.ts` — SSR client + admin (service-role) client
✅ `src/lib/supabase/types.ts` — TypeScript types matching the schema
✅ `.env.example` updated with Supabase variables

Frontend currently still uses the temporary JSON-file backend (`src/lib/db.ts`) so the demo works without real DB. Once backend AI confirms the schema is in place, I'll migrate every page/server action to Supabase.

---

## ✅ Tasks for backend AI (in order)

### 1. Run schema migration

In **Supabase dashboard → SQL Editor → New query**, paste and run the entire contents of:

> `supabase/schema.sql`

This creates:
- **Enums:** `user_role`, `reseller_status`, `delivery_type`, `inventory_status`, `order_status`, `deposit_method`, `deposit_status`, `withdraw_status`, `ticket_status`, `coupon_type`
- **Tables:** `profiles`, `categories`, `products`, `inventory_items`, `orders`, `order_items`, `deposits`, `withdraws`, `support_tickets`, `coupons`, `referrals`
- **Trigger:** `on_auth_user_created` — auto-creates a `profiles` row when a new user signs up via Supabase Auth
- **RPCs (SECURITY DEFINER):**
  - `checkout_with_wallet(user_id, lines, coupon, referral)` — atomic wallet checkout
  - `approve_deposit(deposit_id, note)` / `reject_deposit(deposit_id, note)`
  - `request_withdraw(amount, method, destination)`
  - `approve_withdraw(id)` / `reject_withdraw(id)`
  - `approve_reseller(user_id)` / `reject_reseller(user_id)`

Verify no errors. The script is idempotent (safe to re-run).

### 2. Apply RLS policies

In SQL Editor, paste and run:

> `supabase/policies.sql`

This enables Row Level Security on every table and adds least-privilege policies. Key invariants:
- **`inventory_items` is admin-only** for direct access. The `payload` column contains real CDKs / account creds — clients must NEVER select from this table directly. They go through `checkout_with_wallet` RPC.
- Profiles can read their own row. Admins read everything.
- Deposits: users insert as `pending` and read their own; only admins can update.

### 3. Seed sample data

Run:

> `supabase/seed.sql`

This inserts 4 categories, 10 products (BDT-priced), 2 coupons, and 10 dummy inventory items per product.

### 4. Create the admin & demo accounts

Use **Supabase Authentication → Users → Add user** OR run via SQL Editor with the `auth.admin` API. Create exactly these three users with passwords:

| Email | Password | Role |
|---|---|---|
| `admin@bazaar.dev` | `admin123` | admin |
| `reseller@bazaar.dev` | `reseller123` | reseller (approved) |
| `demo@bazaar.dev` | `user1234` | user |

After creation, run this SQL to elevate roles and seed wallet balances:

```sql
update public.profiles set role = 'admin' where email = 'admin@bazaar.dev';

update public.profiles set
  role = 'reseller',
  reseller_status = 'approved',
  referral_code = 'TOPDEAL',
  wallet_balance = 8500,
  total_earned = 12640
where email = 'reseller@bazaar.dev';

update public.profiles set wallet_balance = 1500 where email = 'demo@bazaar.dev';
```

### 5. (Optional) Create storage bucket for deposit screenshots

If you want users to upload deposit screenshots (instead of pasting URLs), create:

```sql
insert into storage.buckets (id, name, public)
values ('deposit-screenshots', 'deposit-screenshots', false);
```

Then add storage policies:
```sql
-- Owner can upload to their own folder
create policy "Owner can upload screenshots"
  on storage.objects for insert
  with check (
    bucket_id = 'deposit-screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can read their own files; admin reads all
create policy "Owner or admin reads screenshots"
  on storage.objects for select
  using (
    bucket_id = 'deposit-screenshots'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
```

### 6. Run verification queries

Before reporting back, run these queries in SQL Editor and copy the output. The frontend AI will use this to confirm everything is wired correctly.

```sql
-- A. Table & column count
select table_name, count(*) as col_count
from information_schema.columns
where table_schema = 'public'
group by table_name
order by table_name;

-- B. Confirm RLS is enabled on every table
select tablename, rowsecurity
from pg_tables where schemaname = 'public'
order by tablename;

-- C. Confirm RPCs exist
select routine_name from information_schema.routines
where routine_schema = 'public' and routine_type = 'FUNCTION'
order by routine_name;

-- D. Seed counts
select 'categories' as t, count(*) from public.categories
union all select 'products',  count(*) from public.products
union all select 'coupons',   count(*) from public.coupons
union all select 'inventory_items', count(*) from public.inventory_items;

-- E. Demo users + roles
select id, email, role, reseller_status, wallet_balance, referral_code
from public.profiles
where email in ('admin@bazaar.dev','reseller@bazaar.dev','demo@bazaar.dev');

-- F. Smoke test: simulate an admin approving a fake deposit (will rollback)
begin;
  insert into public.deposits (user_id, amount, method, transaction_id, status)
  select id, 500, 'bkash', 'TEST-TRX-001', 'pending'
    from public.profiles where email = 'demo@bazaar.dev';
  -- Simulate auth.uid() = admin
  set local request.jwt.claim.sub = (select id::text from public.profiles where email='admin@bazaar.dev');
  -- (skip if your local can't set claims; just verify the function exists)
  select proname from pg_proc where proname = 'approve_deposit';
rollback;
```

### 7. Send back to user (frontend AI) — fill in this template

Copy the template below, fill it in, and reply. The user will paste it back to me verbatim.

```text
=== Supabase setup report ===

[1] schema.sql executed:        OK / FAILED  (errors: ____)
[2] policies.sql executed:      OK / FAILED  (errors: ____)
[3] seed.sql executed:          OK / FAILED  (errors: ____)

[4] Verification query A — table count:
    profiles ___ cols, products ___ cols, orders ___ cols (paste full result)

[5] Verification query B — RLS enabled on:
    profiles=t, products=t, orders=t, ... (all should be t/true)

[6] Verification query C — RPCs present:
    approve_deposit, approve_reseller, approve_withdraw,
    checkout_with_wallet, handle_new_user, is_admin,
    is_approved_reseller, reject_deposit, reject_reseller,
    reject_withdraw, request_withdraw

[7] Verification query D — seed counts:
    categories=4, products=10, coupons=2, inventory_items=100

[8] Verification query E — demo users created:
    admin@bazaar.dev      role=admin     id=____
    reseller@bazaar.dev   role=reseller  status=approved  code=TOPDEAL  wallet=8500  id=____
    demo@bazaar.dev       role=user      wallet=1500  id=____

[9] Storage bucket `deposit-screenshots`: CREATED / SKIPPED

[10] Auth → Email confirmations: OFF (recommended for demo) / ON

[11] Service Role Key (paste into .env.local SUPABASE_SERVICE_ROLE_KEY):
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.____________________________

[12] Anon key match check (should equal NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.example):
     YES / NO  (if no, paste the correct one here)

[13] Anything that didn't work / blockers:
     ____
```

Once I receive this report, I (frontend AI) will execute Phase 2:
1. Replace `bcryptjs` + `jose` cookie auth with **Supabase Auth** in `src/lib/auth.ts` and `middleware.ts`.
2. Replace every `getDb()` / `mutate()` call across **35+ files** with Supabase queries.
3. Wire `actionCheckout` to call `supabase.rpc('checkout_with_wallet', ...)`.
4. Wire `actionApproveDeposit/Withdraw/Reseller` and `actionRequestWithdraw` to their respective RPCs.
5. Switch admin client (`createAdminClient()`) for operations that bypass RLS (admin dashboard analytics).
6. Remove `data/db.json`, `src/lib/db.ts`, `src/lib/seed.ts`, `bcryptjs`, `jose` — clean cut.
7. Update `.env.example` to remove `SESSION_SECRET`.
8. End-to-end test: signup → deposit → admin approve → cart → checkout → delivered keys → reseller commission.

---

## 🔐 Environment variables — user to set in `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://lgsxwrpluxupofyufekd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnc3h3cnBsdXh1cG9meXVmZWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1Mzg4MDAsImV4cCI6MjA5MTExNDgwMH0.5QelrfTc7qirqi6iwGny7U_luFz5rJbsk9ILevE2LSY
SUPABASE_SERVICE_ROLE_KEY=<get this from backend AI / Supabase dashboard → Project Settings → API>
SESSION_SECRET=<any 32+ char random string — used by JSON-fallback auth until migration completes>
```

---

## 🧠 Schema overview (for reference)

```text
auth.users (Supabase) ─── profiles (1:1, FK)
                           │
                           ├── orders ──── order_items
                           │     │
                           │     └── inventory_items (delivered payloads)
                           │
                           ├── deposits  (manual approval)
                           ├── withdraws (manual approval)
                           ├── support_tickets
                           └── referrals (commissions earned)

categories (public)  ──── products  ──── inventory_items
coupons (public)
```

---

## ⚠️ Things to watch

- The `checkout_with_wallet` RPC uses `for update` to lock rows safely. If you need higher throughput later, consider serializable transactions or Postgres advisory locks.
- `inventory_items.payload` is encrypted-at-rest by Supabase (AES) but plain in the database. For higher security, switch to `pgcrypto` symmetric encryption keyed off a vault secret. Out of scope for now.
- Service-role key is **server-only**. Never put it in `NEXT_PUBLIC_*` vars.
- Email confirmation: if you want users to be auto-confirmed without email verification (faster demo), set **Authentication → Providers → Email → "Enable email confirmations" = OFF** in Supabase dashboard.
