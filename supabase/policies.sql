-- ============================================================================
-- Digital Bazaar — Supabase Row Level Security (RLS) Policies
-- ============================================================================
-- Run this AFTER schema.sql.
-- Strategy:
--   * Public catalog data (categories, products, coupons) is readable by anyone
--     (anon + authenticated). Writes are admin-only.
--   * Personal data (profile, deposits, withdraws, orders, tickets, referrals)
--     is owner-only. Admin sees everything via admin policy.
--   * Inventory_items payloads are NEVER selectable by clients — only by SECURITY
--     DEFINER RPCs (checkout_with_wallet) and admin role.
-- ============================================================================

-- ============================================================================
-- Helper: is the current auth user an admin?
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_approved_reseller()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'reseller' and reseller_status = 'approved'
  );
$$;

-- ============================================================================
-- profiles
-- ============================================================================
alter table public.profiles enable row level security;

drop policy if exists "Profiles: owner read" on public.profiles;
create policy "Profiles: owner read" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "Profiles: owner update limited" on public.profiles;
create policy "Profiles: owner update limited" on public.profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- Inserts are handled by the on_auth_user_created trigger (security definer).
drop policy if exists "Profiles: admin insert" on public.profiles;
create policy "Profiles: admin insert" on public.profiles
  for insert with check (public.is_admin());

-- ============================================================================
-- categories  (public read, admin write)
-- ============================================================================
alter table public.categories enable row level security;

drop policy if exists "Categories: public read" on public.categories;
create policy "Categories: public read" on public.categories
  for select using (true);

drop policy if exists "Categories: admin write" on public.categories;
create policy "Categories: admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- products  (public read of active rows; admin all)
-- ============================================================================
alter table public.products enable row level security;

drop policy if exists "Products: public read active" on public.products;
create policy "Products: public read active" on public.products
  for select using (active = true or public.is_admin());

drop policy if exists "Products: admin write" on public.products;
create policy "Products: admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- inventory_items  (admin-only direct access; clients use RPCs)
-- ============================================================================
alter table public.inventory_items enable row level security;

drop policy if exists "Inventory: admin only" on public.inventory_items;
create policy "Inventory: admin only" on public.inventory_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- orders  (owner read, admin all)
-- ============================================================================
alter table public.orders enable row level security;

drop policy if exists "Orders: owner read" on public.orders;
create policy "Orders: owner read" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

-- Inserts/updates only via SECURITY DEFINER RPC (checkout_with_wallet)
drop policy if exists "Orders: admin write" on public.orders;
create policy "Orders: admin write" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- order_items
-- ============================================================================
alter table public.order_items enable row level security;

drop policy if exists "Order items: owner read" on public.order_items;
create policy "Order items: owner read" on public.order_items
  for select using (
    public.is_admin() or exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "Order items: admin write" on public.order_items;
create policy "Order items: admin write" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- deposits  (owner can insert + read own; admin all)
-- ============================================================================
alter table public.deposits enable row level security;

drop policy if exists "Deposits: owner read" on public.deposits;
create policy "Deposits: owner read" on public.deposits
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Deposits: owner insert" on public.deposits;
create policy "Deposits: owner insert" on public.deposits
  for insert with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Deposits: admin update" on public.deposits;
create policy "Deposits: admin update" on public.deposits
  for update using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- withdraws  (owner read; admin all; insert/approve/reject via RPC)
-- ============================================================================
alter table public.withdraws enable row level security;

drop policy if exists "Withdraws: owner read" on public.withdraws;
create policy "Withdraws: owner read" on public.withdraws
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Withdraws: admin write" on public.withdraws;
create policy "Withdraws: admin write" on public.withdraws
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- support_tickets
-- ============================================================================
alter table public.support_tickets enable row level security;

drop policy if exists "Tickets: owner read" on public.support_tickets;
create policy "Tickets: owner read" on public.support_tickets
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Tickets: owner insert" on public.support_tickets;
create policy "Tickets: owner insert" on public.support_tickets
  for insert with check (auth.uid() = user_id);

drop policy if exists "Tickets: admin update" on public.support_tickets;
create policy "Tickets: admin update" on public.support_tickets
  for update using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- coupons (public read of active; admin write)
-- ============================================================================
alter table public.coupons enable row level security;

drop policy if exists "Coupons: public read" on public.coupons;
create policy "Coupons: public read" on public.coupons
  for select using (active = true or public.is_admin());

drop policy if exists "Coupons: admin write" on public.coupons;
create policy "Coupons: admin write" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- referrals (referrer reads own; admin all)
-- ============================================================================
alter table public.referrals enable row level security;

drop policy if exists "Referrals: owner read" on public.referrals;
create policy "Referrals: owner read" on public.referrals
  for select using (auth.uid() = referrer_id or public.is_admin());

drop policy if exists "Referrals: admin write" on public.referrals;
create policy "Referrals: admin write" on public.referrals
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- GRANTS — table-level permissions for anon, authenticated, service_role
-- ============================================================================
-- IMPORTANT: RLS policies above only filter rows. Postgres ALSO requires
-- table-level GRANTs for the role to "touch" the table at all. Supabase does
-- NOT auto-grant on tables created via raw SQL, so we do it here explicitly.
--
-- service_role bypasses RLS but STILL needs GRANT to access tables. The admin
-- client in lib/supabase/server.ts uses service_role for inventory_items reads,
-- deposit/withdraw approvals, and admin dashboard queries.
-- ============================================================================

-- 1) Schema usage
grant usage on schema public to anon, authenticated, service_role;

-- 2) Read access for everyone (RLS will further restrict rows)
grant select on all tables    in schema public to anon, authenticated;
grant select on all sequences in schema public to anon, authenticated;

-- 3) Write access for authenticated users only
--    (RLS enforces: deposits/tickets owner-only, products admin-only, etc.)
grant insert, update, delete on all tables    in schema public to authenticated;
grant usage,  update         on all sequences in schema public to authenticated;

-- 4) Service role — full access on everything (bypasses RLS)
grant all on all tables     in schema public to service_role;
grant all on all sequences  in schema public to service_role;
grant all on all functions  in schema public to service_role;

-- 5) Function execution for clients (RPCs the frontend calls)
grant execute on all functions in schema public to anon, authenticated;

-- 6) Default privileges for any FUTURE tables / functions / sequences
alter default privileges in schema public
  grant select on tables to anon, authenticated;
alter default privileges in schema public
  grant insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated;
alter default privileges in schema public
  grant usage, update on sequences to authenticated;
alter default privileges in schema public
  grant all on sequences to service_role;
alter default privileges in schema public
  grant execute on functions to anon, authenticated;
alter default privileges in schema public
  grant all on functions to service_role;
