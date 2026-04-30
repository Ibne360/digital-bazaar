-- ============================================================================
-- Digital Bazaar — Supabase Postgres Schema
-- ============================================================================
-- Run this entire file ONCE in the Supabase SQL editor.
-- Designed to be IDEMPOTENT (safe to re-run).
-- After running this, run `policies.sql` and (optionally) `seed.sql`.
-- ============================================================================

-- Required extensions
create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================
do $$ begin
  create type user_role as enum ('user', 'reseller', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type reseller_status as enum ('none', 'pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type delivery_type as enum ('account', 'license_key', 'invite_link', 'credits', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type inventory_status as enum ('available', 'delivered', 'reserved');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending', 'paid', 'delivered', 'refunded', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type deposit_method as enum ('bkash', 'nagad', 'rocket', 'bank', 'binance', 'usdt');
exception when duplicate_object then null; end $$;

do $$ begin
  create type deposit_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type withdraw_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_status as enum ('open', 'answered', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type coupon_type as enum ('percent', 'fixed');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- TABLE: profiles
-- One row per Supabase Auth user. Created via trigger when new auth.user.
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null default '',
  role user_role not null default 'user',
  reseller_status reseller_status not null default 'none',
  wallet_balance numeric(12, 2) not null default 0 check (wallet_balance >= 0),
  total_earned numeric(12, 2) not null default 0,
  referral_code text unique,
  created_at timestamptz not null default now()
);
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_referral_code_idx on public.profiles(referral_code);

-- ============================================================================
-- TABLE: categories
-- ============================================================================
create table if not exists public.categories (
  id text primary key,
  slug text not null unique,
  name text not null,
  icon text not null default 'Sparkles',
  description text not null default '',
  color text not null default 'from-violet-500 to-fuchsia-500',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- TABLE: products
-- ============================================================================
create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  category_id text not null references public.categories(id) on delete restrict,
  short_description text not null default '',
  description text not null default '',
  retail_price numeric(12, 2) not null check (retail_price >= 0),
  wholesale_price numeric(12, 2) not null check (wholesale_price >= 0),
  duration text not null default '',
  warranty text not null default '',
  delivery_type delivery_type not null default 'manual',
  delivery_instructions text not null default '',
  badges text[] not null default array[]::text[],
  image_url text,
  icon_bg text not null default 'from-indigo-500 to-violet-600',
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(active);
create index if not exists products_featured_idx on public.products(featured);

-- ============================================================================
-- TABLE: inventory_items (digital items waiting to be delivered)
-- ============================================================================
create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  payload text not null,
  status inventory_status not null default 'available',
  delivered_at timestamptz,
  order_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists inventory_status_idx
  on public.inventory_items(product_id, status);

-- ============================================================================
-- TABLE: orders
-- ============================================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subtotal numeric(12, 2) not null,
  discount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null,
  status order_status not null default 'pending',
  wallet_balance_before numeric(12, 2) not null default 0,
  wallet_balance_after numeric(12, 2) not null default 0,
  is_reseller boolean not null default false,
  coupon_code text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  delivered_at timestamptz
);
create index if not exists orders_user_idx on public.orders(user_id, created_at desc);
create index if not exists orders_status_idx on public.orders(status);

-- Backfill FK on inventory_items.order_id (after orders table exists)
do $$ begin
  alter table public.inventory_items
    add constraint inventory_items_order_id_fkey
    foreign key (order_id) references public.orders(id) on delete set null;
exception when duplicate_object then null; end $$;

-- ============================================================================
-- TABLE: order_items
-- ============================================================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null,
  total numeric(12, 2) not null,
  delivered_payloads jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ============================================================================
-- TABLE: deposits  (wallet top-up requests, manual approval)
-- ============================================================================
create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  method deposit_method not null,
  transaction_id text not null,
  sender_info text,
  screenshot_url text,
  note text,
  status deposit_status not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists deposits_user_idx on public.deposits(user_id, created_at desc);
create index if not exists deposits_status_idx on public.deposits(status);

-- ============================================================================
-- TABLE: withdraws
-- ============================================================================
create table if not exists public.withdraws (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  method deposit_method not null,
  destination text not null,
  status withdraw_status not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists withdraws_user_idx on public.withdraws(user_id, created_at desc);
create index if not exists withdraws_status_idx on public.withdraws(status);

-- ============================================================================
-- TABLE: support_tickets
-- ============================================================================
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  subject text not null,
  message text not null,
  status ticket_status not null default 'open',
  reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tickets_user_idx on public.support_tickets(user_id, created_at desc);
create index if not exists tickets_status_idx on public.support_tickets(status);

-- ============================================================================
-- TABLE: coupons
-- ============================================================================
create table if not exists public.coupons (
  id text primary key,
  code text not null unique,
  type coupon_type not null,
  value numeric(12, 2) not null check (value >= 0),
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- TABLE: referrals (commissions earned by resellers)
-- ============================================================================
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric(12, 2) not null,
  commission numeric(12, 2) not null,
  created_at timestamptz not null default now()
);
create index if not exists referrals_referrer_idx
  on public.referrals(referrer_id, created_at desc);

-- ============================================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- RPC: checkout_with_wallet
-- Atomic wallet checkout: validates balance, picks inventory, deducts wallet,
-- creates order + items + commission. Returns the order_id.
-- Frontend will call this via supabase.rpc('checkout_with_wallet', {...}).
-- ============================================================================
create or replace function public.checkout_with_wallet(
  p_user_id uuid,
  p_lines jsonb,           -- [{ product_id text, quantity int }]
  p_coupon_code text default null,
  p_referral_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.profiles;
  v_order_id uuid := gen_random_uuid();
  v_subtotal numeric(12,2) := 0;
  v_discount numeric(12,2) := 0;
  v_total numeric(12,2);
  v_is_reseller boolean;
  v_coupon record;
  v_has_coupon boolean := false;
  v_line jsonb;
  v_product public.products;
  v_unit_price numeric(12,2);
  v_line_total numeric(12,2);
  v_picked_payloads jsonb;
  v_referrer public.profiles;
  v_commission numeric(12,2);
  v_balance_before numeric(12,2);
  v_now timestamptz := now();
begin
  select * into v_user from public.profiles where id = p_user_id for update;
  if v_user is null then raise exception 'User not found'; end if;

  v_is_reseller := (v_user.role = 'reseller' and v_user.reseller_status = 'approved');

  -- Pass 1: compute subtotal
  for v_line in select * from jsonb_array_elements(p_lines) loop
    select * into v_product from public.products where id = (v_line->>'product_id');
    if v_product is null or not v_product.active then
      raise exception 'Product unavailable: %', v_line->>'product_id';
    end if;
    v_unit_price := case when v_is_reseller then v_product.wholesale_price else v_product.retail_price end;
    v_line_total := v_unit_price * (v_line->>'quantity')::int;
    v_subtotal := v_subtotal + v_line_total;
  end loop;

  -- Coupon
  if p_coupon_code is not null and length(p_coupon_code) > 0 then
    select * into v_coupon from public.coupons
      where upper(code) = upper(p_coupon_code) and active = true
      and (expires_at is null or expires_at > v_now);
    if FOUND then
      v_has_coupon := true;
      if v_coupon.type = 'percent' then
        v_discount := round(v_subtotal * v_coupon.value / 100, 2);
      else
        v_discount := least(v_coupon.value, v_subtotal);
      end if;
    end if;
  end if;

  v_total := greatest(0, v_subtotal - v_discount);

  if v_user.wallet_balance < v_total then
    raise exception 'Insufficient wallet balance' using errcode = 'P0001';
  end if;

  v_balance_before := v_user.wallet_balance;

  -- Create order shell
  insert into public.orders (
    id, user_id, subtotal, discount, total, status,
    wallet_balance_before, wallet_balance_after, is_reseller, coupon_code,
    paid_at, delivered_at
  ) values (
    v_order_id, p_user_id, v_subtotal, v_discount, v_total, 'delivered',
    v_balance_before, v_balance_before - v_total, v_is_reseller,
    case when v_has_coupon then v_coupon.code else null end,
    v_now, v_now
  );

  -- Pass 2: pick inventory + write order_items
  for v_line in select * from jsonb_array_elements(p_lines) loop
    select * into v_product from public.products where id = (v_line->>'product_id');
    v_unit_price := case when v_is_reseller then v_product.wholesale_price else v_product.retail_price end;
    v_line_total := v_unit_price * (v_line->>'quantity')::int;

    -- Lock & pick inventory rows
    with picked as (
      select id, payload from public.inventory_items
       where product_id = v_product.id and status = 'available'
       order by created_at
       limit (v_line->>'quantity')::int
       for update skip locked
    ),
    upd as (
      update public.inventory_items
         set status = 'delivered',
             delivered_at = v_now,
             order_id = v_order_id
       where id in (select id from picked)
       returning id, payload
    )
    select coalesce(jsonb_agg(jsonb_build_object('itemId', id::text, 'payload', payload)), '[]'::jsonb)
      into v_picked_payloads from upd;

    if jsonb_array_length(v_picked_payloads) < (v_line->>'quantity')::int then
      raise exception 'Out of stock: %', v_product.name;
    end if;

    insert into public.order_items (
      order_id, product_id, product_name, quantity, unit_price, total, delivered_payloads
    ) values (
      v_order_id, v_product.id, v_product.name,
      (v_line->>'quantity')::int, v_unit_price, v_line_total, v_picked_payloads
    );
  end loop;

  -- Deduct wallet
  update public.profiles
     set wallet_balance = wallet_balance - v_total
   where id = p_user_id;

  -- Referral commission (10% default)
  if p_referral_code is not null and length(p_referral_code) > 0 then
    select * into v_referrer from public.profiles
     where upper(referral_code) = upper(p_referral_code)
       and id <> p_user_id and role = 'reseller' and reseller_status = 'approved';
    if v_referrer is not null then
      v_commission := round(v_total * 0.10, 2);
      update public.profiles
         set wallet_balance = wallet_balance + v_commission,
             total_earned = total_earned + v_commission
       where id = v_referrer.id;
      insert into public.referrals (referrer_id, order_id, amount, commission)
      values (v_referrer.id, v_order_id, v_total, v_commission);
    end if;
  end if;

  return v_order_id;
end;
$$;

-- ============================================================================
-- RPC: approve_deposit  (admin only)
-- ============================================================================
create or replace function public.approve_deposit(
  p_deposit_id uuid,
  p_admin_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dep public.deposits;
  v_admin_role user_role;
begin
  select role into v_admin_role from public.profiles where id = auth.uid();
  if v_admin_role is distinct from 'admin' then
    raise exception 'Forbidden';
  end if;
  select * into v_dep from public.deposits where id = p_deposit_id for update;
  if v_dep is null then raise exception 'Deposit not found'; end if;
  if v_dep.status <> 'pending' then raise exception 'Already reviewed'; end if;
  update public.profiles
     set wallet_balance = wallet_balance + v_dep.amount
   where id = v_dep.user_id;
  update public.deposits
     set status = 'approved',
         admin_note = coalesce(p_admin_note, 'Approved'),
         reviewed_at = now()
   where id = p_deposit_id;
end;
$$;

-- ============================================================================
-- RPC: reject_deposit
-- ============================================================================
create or replace function public.reject_deposit(
  p_deposit_id uuid,
  p_admin_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_role user_role;
begin
  select role into v_admin_role from public.profiles where id = auth.uid();
  if v_admin_role is distinct from 'admin' then
    raise exception 'Forbidden';
  end if;
  update public.deposits
     set status = 'rejected',
         admin_note = coalesce(p_admin_note, 'Rejected'),
         reviewed_at = now()
   where id = p_deposit_id and status = 'pending';
end;
$$;

-- ============================================================================
-- RPC: request_withdraw  (user)
-- ============================================================================
create or replace function public.request_withdraw(
  p_amount numeric,
  p_method deposit_method,
  p_destination text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.profiles;
  v_id uuid := gen_random_uuid();
begin
  if auth.uid() is null then raise exception 'Unauthorized'; end if;
  select * into v_user from public.profiles where id = auth.uid() for update;
  if v_user is null then raise exception 'User not found'; end if;
  if v_user.role <> 'reseller' or v_user.reseller_status <> 'approved' then
    raise exception 'Reseller approval required';
  end if;
  if p_amount < 5 then raise exception 'Minimum withdrawal $5.00'; end if;
  if v_user.wallet_balance < p_amount then raise exception 'Insufficient balance'; end if;
  update public.profiles set wallet_balance = wallet_balance - p_amount where id = auth.uid();
  insert into public.withdraws (id, user_id, amount, method, destination)
  values (v_id, auth.uid(), p_amount, p_method, p_destination);
  return v_id;
end;
$$;

-- ============================================================================
-- RPC: approve_withdraw / reject_withdraw  (admin)
-- ============================================================================
create or replace function public.approve_withdraw(p_withdraw_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare v_admin_role user_role;
begin
  select role into v_admin_role from public.profiles where id = auth.uid();
  if v_admin_role is distinct from 'admin' then raise exception 'Forbidden'; end if;
  update public.withdraws
     set status = 'approved', reviewed_at = now()
   where id = p_withdraw_id and status = 'pending';
end; $$;

create or replace function public.reject_withdraw(p_withdraw_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_admin_role user_role;
  v_w public.withdraws;
begin
  select role into v_admin_role from public.profiles where id = auth.uid();
  if v_admin_role is distinct from 'admin' then raise exception 'Forbidden'; end if;
  select * into v_w from public.withdraws where id = p_withdraw_id for update;
  if v_w is null or v_w.status <> 'pending' then return; end if;
  -- Refund the held amount back to wallet
  update public.profiles set wallet_balance = wallet_balance + v_w.amount where id = v_w.user_id;
  update public.withdraws set status = 'rejected', reviewed_at = now() where id = p_withdraw_id;
end; $$;

-- ============================================================================
-- RPC: approve_reseller / reject_reseller
-- ============================================================================
create or replace function public.approve_reseller(p_user_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare v_admin_role user_role;
begin
  select role into v_admin_role from public.profiles where id = auth.uid();
  if v_admin_role is distinct from 'admin' then raise exception 'Forbidden'; end if;
  update public.profiles
     set role = 'reseller',
         reseller_status = 'approved',
         referral_code = coalesce(referral_code,
           upper(regexp_replace(split_part(name,' ',1), '[^a-zA-Z0-9]', '', 'g'))
           || lpad((floor(random()*900)+100)::int::text, 3, '0'))
   where id = p_user_id;
end; $$;

create or replace function public.reject_reseller(p_user_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare v_admin_role user_role;
begin
  select role into v_admin_role from public.profiles where id = auth.uid();
  if v_admin_role is distinct from 'admin' then raise exception 'Forbidden'; end if;
  update public.profiles set reseller_status = 'rejected' where id = p_user_id;
end; $$;
