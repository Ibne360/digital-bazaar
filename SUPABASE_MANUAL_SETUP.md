 # 🪜 Supabase Manual Setup — SQL-Only Express Path (Bengali)

> ⚡ **এই guide-এ শুধু ৪টা SQL paste & run করতে হবে।** UI-তে শুধু account + project + keys copy করা ছাড়া আর কিছু লাগবে না।

> **Total steps:** 9 phases · **Time:** ~12-15 mins · **Required:** শুধু একটা email address

---

## 📌 যা যা হবে এই guide শেষে

✅ একটা Supabase project তৈরি হবে (PostgreSQL database + Auth + Storage)
✅ 11টা table, 10টা enum, 11টা RPC function — সব created
✅ Row-Level Security (RLS) enabled সব table-এ
✅ 4টা category, 10টা product (BDT pricing), 100টা inventory item — seeded
✅ 3টা demo user (admin, reseller, demo) — **auth.users-এ confirmed user**, profile auto-created via trigger, role/wallet/referral সব set
✅ `.env.local` ফাইল আপনার project root-এ ready
✅ আমাকে paste করার মতো একটা **verification report** generate হবে

> তারপর আমি সেই report দেখে Phase 2 migration শুরু করব (frontend-কে Supabase-এ জুড়ব)।

---

## 🗺️ পুরো flow এক নজরে

```
UI কাজ        ──→  Phase 1: Account + Project তৈরি         (5 min)
                  Phase 2: API Keys copy                    (2 min)
                  Phase 3: .env.local ফাইল তৈরি             (1 min)

SQL Editor   ──→  Phase 4: Run schema.sql                   (2 min) ⭐
  4× paste &       Phase 5: Run policies.sql                 (1 min)
  run only         Phase 6: Run seed.sql                     (1 min)
                  Phase 7: Run 04_create_demo_users.sql     (1 min) ⭐ users + roles
                  Phase 8: (Optional) Storage bucket SQL    (1 min)
                  Phase 9: 5 verification queries           (2 min)

Report       ──→  আমাকে paste করুন → আমি migration শুরু করব
```

---

## 🟦 Phase 1 — Supabase project তৈরি করা (5 mins)

### Step 1.1 — Sign up

1. Browser-এ যান: **https://supabase.com**
2. উপরে ডান কোণায় **"Start your project"** বা **"Sign in"** click করুন
3. **GitHub** দিয়ে sign in করুন (সবচেয়ে easy) — অথবা email দিয়ে account খুলুন

### Step 1.2 — New Project

1. Login করার পর Dashboard-এ যাবেন: **https://supabase.com/dashboard**
2. **"New project"** button-এ click করুন (সবুজ button উপরে)
3. আপনাকে একটা **Organization** select করতে বলবে — প্রথমবার হলে by default একটা organization থাকবে, সেটা select করুন
4. নিচের ফর্ম পূরণ করুন:

   | Field | Value (যা লিখবেন) |
   |---|---|
   | **Name** | `digital-bazaar` (যেকোনো নাম দিতে পারেন) |
   | **Database password** | একটা strong password তৈরি করুন (16+ characters) — **এটা কোথাও সেভ করে রাখুন**, পরে দরকার হতে পারে |
   | **Region** | **Singapore** (Bangladesh-এর কাছাকাছি, fast speed পাবেন) — না পেলে **Mumbai** |
   | **Pricing Plan** | **Free** ($0/month, যথেষ্ট for now) |

5. **"Create new project"** click করুন
6. Provisioning শুরু হবে — **~2 মিনিট wait করুন**। নিচে progress bar দেখাবে।

### Step 1.3 — Project ready হলে

Dashboard-এ ঢুকলে বাম পাশে sidebar দেখবেন:

```
🏠  Home
📊  Table Editor
🔍  SQL Editor          ← এটাই আমরা সবচেয়ে বেশি use করব
🔐  Authentication
💾  Storage
📁  Database
🔧  Edge Functions
⚙️  Project Settings    ← API keys এখানে আছে
```

---

## 🟦 Phase 2 — API Keys collect করা (2 mins)

### Step 2.1 — Settings-এ যান

1. বাম sidebar-এ একদম নিচে **⚙️ Project Settings** click করুন
2. ভেতরে আবার বাম দিকে **"API"** click করুন
3. দুটো section দেখবেন:

   #### 📌 Project URL section:
   ```
   Project URL: https://abcdefghijklmnop.supabase.co
   ```
   এটা **copy করে কোথাও রাখুন**। এটাই আপনার `NEXT_PUBLIC_SUPABASE_URL`।

   #### 📌 Project API keys section:
   দুইটা key দেখবেন:

   - **anon / public** — ক্লায়েন্ট-side use হবে (browser থেকে call হবে)
   - **service_role / secret** — সার্ভার-only। কখনো browser-এ expose করা যাবে না।

   দুটোতেই **"Reveal"** click করুন এবং **copy করে রাখুন**।

### Step 2.2 — Save in a notepad temporarily

কোথাও temporary save করুন (Notepad/Word):

```
SUPABASE_URL=https://________.supabase.co
ANON_KEY=eyJhbGciOiJIUzI1...........(long string)
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1.........(long string)
```

> ⚠️ **Service role key** কখনো GitHub-এ push করবেন না, কাউকে screenshot-এ দেখাবেন না।

---

## 🟦 Phase 3 — `.env.local` ফাইল তৈরি (1 min)

### Step 3.1 — File create করুন

1. আপনার project folder-এ যান:
   ```
   c:\Users\moina\Desktop\Digital product selling website
   ```
2. সেখানে নতুন ফাইল তৈরি করুন: **`.env.local`** (ডট দিয়ে শুরু)
3. ভেতরে এইটা paste করুন (আপনার keys বসিয়ে):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://________.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1.........(your anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1.........(your service_role key)

# Temporary session secret (Phase 2 migration-এ remove হবে)
SESSION_SECRET=any-random-32-character-string-please-change-this
```

4. ফাইল save করুন।

### Step 3.2 — Verify

PowerShell terminal-এ চালান (project folder থেকে):

```powershell
Get-Content .env.local
```

আপনার সব keys দেখাবে → ✅ ready।

---

## 🟦 Phase 4 — Schema run করা (2 mins) ⭐ সবচেয়ে গুরুত্বপূর্ণ

এখানে সব tables, enums, triggers, RPC functions create হবে।

### Step 4.1 — SQL Editor খুলুন

1. Supabase Dashboard-এ বাম sidebar থেকে **"SQL Editor"** click করুন
2. উপরে ডানে **"+ New query"** click করুন (অথবা একটা empty editor দেখাবে)

### Step 4.2 — Schema paste করুন

1. আপনার project-এ এই ফাইল খুলুন: `supabase/schema.sql`
2. **পুরো ফাইলের content copy করুন** (Ctrl+A → Ctrl+C)
3. Supabase SQL Editor-এ paste করুন (Ctrl+V)

### Step 4.3 — Run করুন

1. ডান-নিচ কোণায় সবুজ **"Run"** button-এ click করুন (অথবা **Ctrl+Enter**)
2. **5-10 সেকেন্ড** wait করুন
3. নিচে output দেখাবে:
   - ✅ **"Success. No rows returned"** = perfect!
   - ❌ Error দেখালে → নিচে [Troubleshooting](#troubleshooting) section দেখুন

### Step 4.4 — Verify (Table Editor চেক)

1. বাম sidebar থেকে **"Table Editor"** click করুন
2. **11টা table** দেখা উচিত:
   - `categories`
   - `coupons`
   - `deposits`
   - `inventory_items`
   - `order_items`
   - `orders`
   - `products`
   - `profiles`
   - `referrals`
   - `support_tickets`
   - `withdraws`

✅ দেখলে → Phase 4 done!

---

## 🟦 Phase 5 — RLS Policies run করা (1 min)

এটা security layer — কে কোন data access করতে পারবে define করে।

### Step 5.1 — New Query

1. SQL Editor-এ আবার **"+ New query"** click করুন (অথবা পুরোনো query clear করুন)

### Step 5.2 — Paste & Run

1. `supabase/policies.sql` ফাইল খুলুন → পুরো content copy
2. SQL Editor-এ paste করুন
3. **"Run"** click করুন
4. ✅ "Success" দেখালে done

### Step 5.3 — Verify

Table Editor-এ যেকোনো table-এ click করে উপরে দেখুন: একটা **🛡️ "RLS enabled"** badge থাকবে (সবুজ)। যদি দেখায় → ✅ correct।

---

## 🟦 Phase 6 — Sample data seed করা (1 min)

### Step 6.1 — New Query

আগের মতোই **"+ New query"**

### Step 6.2 — Paste & Run

1. `supabase/seed.sql` ফাইল খুলুন → পুরো content copy
2. SQL Editor-এ paste করুন
3. **"Run"** click করুন
4. একটু সময় লাগবে (10-15 sec — কারণ 100টা inventory item insert হবে)

### Step 6.3 — Verify

Table Editor → `products` click করুন → 10টা row দেখাবে (ChatGPT Plus, Canva Pro, Gemini Pro ইত্যাদি)। ✅ correct!

---

## 🟦 Phase 7 — Demo users তৈরি (SQL-only) ⭐ (1 min)

> **আগের manual UI flow (Phase 7-8-9) এক SQL run-এ সংক্ষিপ্ত করা হয়েছে।**
>
> এই SQL সরাসরি `auth.users`-এ ৩ জন user insert করে — `email_confirmed_at = now()` সহ, তাই email verification লাগে না। `auth.identities`-ও populate হয় (password login-এর জন্য)। তারপর schema.sql-এর `on_auth_user_created` trigger automatically `public.profiles` row তৈরি করে। শেষে role/wallet/referral_code update করা হয়।
>
> ফলে **Authentication UI-তে যাওয়া লাগবে না**, **Email confirmation toggle করতে হবে না**, **manual profile creation workaround লাগবে না**।

### Step 7.1 — Paste & Run

1. SQL Editor → **"+ New query"**
2. আপনার project-এ এই ফাইল খুলুন: `supabase/04_create_demo_users.sql`
3. **পুরো content copy** করুন (Ctrl+A → Ctrl+C)
4. SQL Editor-এ paste (Ctrl+V) → **Run** click করুন (Ctrl+Enter)

### Step 7.2 — Output check

Run শেষে নিচে একটা table দেখাবে — 3টা row:

```
email                | role     | reseller_status | wallet_balance | referral_code | email_confirmed
---------------------+----------+-----------------+----------------+---------------+-----------------
admin@bazaar.dev     | admin    | none            | 0              | (auto-uuid)   | YES
demo@bazaar.dev      | user     | none            | 1500           | (auto-uuid)   | YES
reseller@bazaar.dev  | reseller | approved        | 8500           | TOPDEAL       | YES
```

✅ ৩টা row + সব `email_confirmed = YES` দেখলে → done!

### Step 7.3 — কী হয়েছে

এক SQL run-এ এই কাজগুলো সম্পন্ন হলো:

```
1. helper function create_confirmed_user() তৈরি (idempotent)
2. ৩ জন auth.users insert (encrypted password, email already confirmed)
3. ৩টা auth.identities insert (email/password login enable)
4. trigger fire হয়ে → ৩টা public.profiles auto-create
5. admin role assign
6. reseller approved + wallet ৮৫০০ + referral code TOPDEAL
7. demo user wallet ১৫০০
8. helper function drop (cleanup)
9. final verification query (output আপনি দেখলেন)
```

> **যদি error আসে:** নিচে [Troubleshooting](#troubleshooting) section-এর `04_create_demo_users.sql` errors দেখুন।

---

## 🟦 Phase 8 — (Optional) Storage Bucket তৈরি (1 min)

Deposit screenshot upload-এর জন্য। এখন skip করতে পারেন — পরেও যোগ করা যাবে।

### Step 8.1

SQL Editor-এ paste & Run:

```sql
-- Create bucket
insert into storage.buckets (id, name, public)
values ('deposit-screenshots', 'deposit-screenshots', false)
on conflict (id) do nothing;

-- Owner can upload to their own folder
drop policy if exists "Owner can upload screenshots" on storage.objects;
create policy "Owner can upload screenshots"
  on storage.objects for insert
  with check (
    bucket_id = 'deposit-screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner or admin can read
drop policy if exists "Owner or admin reads screenshots" on storage.objects;
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

✅ Done.

---

## 🟦 Phase 9 — Verification (সব ঠিক আছে কিনা check) ⭐

আমাকে যে report পাঠাবেন তার জন্য এই queries চালান। SQL Editor-এ যে কোনো query একসাথে paste করেও Run করতে পারেন।

### Step 9.1 — Query A: Tables exist?

```sql
select table_name, count(*) as col_count
  from information_schema.columns
 where table_schema = 'public'
 group by table_name
 order by table_name;
```

**Expected:** 11টা table list-এ আসবে।

### Step 9.2 — Query B: RLS enabled?

```sql
select tablename, rowsecurity
  from pg_tables
 where schemaname = 'public'
 order by tablename;
```

**Expected:** সব table-এ `rowsecurity = true`।

### Step 9.3 — Query C: RPCs exist?

```sql
select routine_name
  from information_schema.routines
 where routine_schema = 'public' and routine_type = 'FUNCTION'
 order by routine_name;
```

**Expected (11টা function):**
```
approve_deposit
approve_reseller
approve_withdraw
checkout_with_wallet
handle_new_user
is_admin
is_approved_reseller
reject_deposit
reject_reseller
reject_withdraw
request_withdraw
```

### Step 9.4 — Query D: Seed counts

```sql
select 'categories' as t, count(*)::text as n from public.categories
union all select 'products', count(*)::text from public.products
union all select 'coupons', count(*)::text from public.coupons
union all select 'inventory_items', count(*)::text from public.inventory_items;
```

**Expected:**
```
categories      | 4
products        | 10
coupons         | 2
inventory_items | 100
```

### Step 9.5 — Query E: Demo users + auth

```sql
select
  p.email,
  p.role,
  p.reseller_status,
  p.wallet_balance,
  p.referral_code,
  case when u.email_confirmed_at is not null then 'YES' else 'NO' end as email_confirmed
from public.profiles p
join auth.users u on u.id = p.id
where p.email in ('admin@bazaar.dev','reseller@bazaar.dev','demo@bazaar.dev')
order by p.email;
```

**Expected:** 3টা row, role/wallet সব ঠিক, email_confirmed = `YES`।

---

## 🟦 Phase 10 — আমাকে যা পাঠাবেন

উপরের সব verification queries-এর output copy করে আমাকে এই format-এ paste করুন:

```text
=== Supabase Setup Report ===

[1] Project URL: https://________.supabase.co
[2] Anon key (first 30 chars): eyJhbGciOiJIUzI1NiIsInR5cCI...
[3] Service role key: ✅ saved in .env.local

[4] Tables (Phase 9.1): 11 tables present ✅ — paste full output

[5] RLS (Phase 9.2): all rowsecurity = true ✅

[6] RPCs (Phase 9.3): 11 functions present
    approve_deposit, approve_reseller, approve_withdraw,
    checkout_with_wallet, handle_new_user, is_admin,
    is_approved_reseller, reject_deposit, reject_reseller,
    reject_withdraw, request_withdraw

[7] Seed counts (Phase 9.4):
    categories=4, products=10, coupons=2, inventory_items=100

[8] Demo users (Phase 9.5):
    admin@bazaar.dev      role=admin     wallet=0     confirmed=YES
    reseller@bazaar.dev   role=reseller  approved     wallet=8500  code=TOPDEAL  confirmed=YES
    demo@bazaar.dev       role=user      wallet=1500  confirmed=YES

[9] Storage bucket: created / skipped

[10] Errors faced (if any): ___
```

> **যদি কোনো query-তে error আসে বা output mismatch হয়, just পুরো error message paste করুন — আমি সাথে সাথে fix বলে দিব।**

---

## 🆘 Troubleshooting

### ❌ "relation already exists" error (Phase 4-6)

**Cause:** আগে partial run হয়েছিল।
**Fix:** Schema files **idempotent** (re-runnable)। আবার Run করুন — এবার পুরোটা সফল হবে।

### ❌ "function gen_random_uuid() does not exist"

**Cause:** `pgcrypto` extension enable হয়নি।
**Fix:** SQL Editor-এ চালান:
```sql
create extension if not exists "pgcrypto";
```
তারপর schema.sql পুনরায় run করুন।

### ❌ Phase 7: "function gen_salt(unknown) does not exist" / "function crypt does not exist"

**Cause:** Supabase-এ `pgcrypto` extension `extensions` schema-এ install করা থাকে (not `public`)। আপনার `04_create_demo_users.sql`-এ search_path বা explicit schema qualifier না থাকলে এই error আসবে।

**Fix:** updated `supabase/04_create_demo_users.sql` ফাইল আবার পুরোটা copy করে SQL Editor-এ paste & Run করুন। নতুন version-এ:
- search_path = `public, extensions, auth`
- function call fully qualified: `extensions.crypt(...)` ও `extensions.gen_salt('bf')`

> Database state পরিষ্কার আছে — error হওয়ার সময় কোনো user insert হয়নি, শুধু function definition তৈরি হয়েছিল। তাই cleanup লাগবে না, সরাসরি re-run করুন।

### ❌ Phase 7: "duplicate key value violates unique constraint users_email_key"

**Cause:** আগে user create হয়ে গিয়েছিল (manually বা partial run)।
**Fix:** `04_create_demo_users.sql` idempotent — `create_confirmed_user()` function existing user থাকলে skip করে। তবুও duplicate দেখালে এটা চালান:

```sql
-- Phase 7 আবার চালানোর আগে এই cleanup
delete from auth.users where email in ('admin@bazaar.dev','reseller@bazaar.dev','demo@bazaar.dev');
-- profiles cascade delete হবে। তারপর 04_create_demo_users.sql আবার run করুন।
```

### ❌ Phase 7: "permission denied for schema auth"

**Cause:** কিছু free-tier project-এ direct insert auth.users-এ permission নেই।
**Fix (alternative path):** Authentication → Users UI দিয়ে manually 3 জন user তৈরি করুন (Email + Password, Auto Confirm ✅), তারপর শুধু এই block রান করুন:

```sql
update public.profiles set role = 'admin' where email = 'admin@bazaar.dev';
update public.profiles set role = 'reseller', reseller_status = 'approved',
       referral_code = 'TOPDEAL', wallet_balance = 8500, total_earned = 12640
 where email = 'reseller@bazaar.dev';
update public.profiles set wallet_balance = 1500 where email = 'demo@bazaar.dev';
```

### ❌ Phase 9.1-এ 11-এর কম table দেখাচ্ছে

**Cause:** Phase 4 (schema.sql) পুরোটা run হয়নি।
**Fix:** SQL Editor-এ schema.sql পুরোটা আবার copy-paste করে Run করুন। Idempotent তাই duplicate error আসবে না।

### ❌ Phase 9.5-এ rows আসছে না বা profile auto-create হয়নি

**Cause:** `on_auth_user_created` trigger schema.sql থেকে create হয়নি (rare)।
**Fix:** Manual profile creation চালান:

```sql
insert into public.profiles (id, email, name, role)
select u.id, u.email,
       coalesce(u.raw_user_meta_data->>'name', split_part(u.email,'@',1)),
       case when u.email = 'admin@bazaar.dev' then 'admin'::user_role
            when u.email = 'reseller@bazaar.dev' then 'reseller'::user_role
            else 'user'::user_role end
  from auth.users u
 where u.email in ('admin@bazaar.dev','reseller@bazaar.dev','demo@bazaar.dev')
   and not exists (select 1 from public.profiles p where p.id = u.id);

-- তারপর Phase 7-এর শেষের update queries আবার চালান
```

### ❌ Free tier paused হয়ে গেছে

Supabase free tier 7 দিন inactive থাকলে paused হয়। Dashboard-এ গেলে **"Restore project"** button দেখাবে — click করলে আবার চালু হবে (1-2 মিনিট লাগবে)।

---

## 📋 Quick Checklist

Setup শেষে নিচের সব এ ✅ থাকা উচিত:

- [ ] **Phase 1-3 (UI):** Supabase project তৈরি, region Singapore/Mumbai, `.env.local`-এ 3টা key paste করা
- [ ] **Phase 4 (SQL):** `schema.sql` run done (11 tables, 11 RPCs created)
- [ ] **Phase 5 (SQL):** `policies.sql` run done (RLS enabled)
- [ ] **Phase 6 (SQL):** `seed.sql` run done (4 cats, 10 products, 100 inv)
- [ ] **Phase 7 (SQL):** `04_create_demo_users.sql` run done (3 confirmed users + roles + wallets)
- [ ] **Phase 8 (SQL, optional):** Storage bucket `deposit-screenshots`
- [ ] **Phase 9 (SQL):** 5টা verification query run, outputs collected
- [ ] **Phase 10:** Report আমাকে paste করেছেন

---

## 🚀 Report পাঠানোর পর কী হবে?

আমি Phase 9 report যাচাই করে confirm দিব। তারপর **Phase 2 migration** শুরু করব — এই কাজগুলো একটানা শেষ হবে:

1. `src/lib/auth.ts` → Supabase Auth (bcrypt+jose remove)
2. `src/middleware.ts` → Supabase SSR session refresh
3. `src/lib/orders.ts` → `rpc('checkout_with_wallet')` call
4. `src/app/actions.ts` → all 30+ actions migrated to Supabase
5. সব pages (`/dashboard`, `/admin`, `/reseller`, `/products`, etc.) → Supabase queries
6. JSON-file backend (`data/db.json`, `src/lib/db.ts`, `src/lib/seed.ts`) — delete
7. `bcryptjs`, `jose` packages — uninstall
8. End-to-end test → সব flow green

তারপর আপনার project **production-ready Supabase backend দিয়ে চলবে।** 🎉

---

## 💬 কোথাও আটকে গেলে

যেকোনো step-এ confusion হলে শুধু আমাকে বলুন:
- কোন phase-এ আছেন
- কী message/error দেখাচ্ছে (screenshot বা text)

আমি সাথে সাথে fix বলে দিব।

**Best of luck — শুরু করুন!** 🚀
