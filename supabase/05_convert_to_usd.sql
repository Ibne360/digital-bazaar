-- ============================================================================
-- 05_convert_to_usd.sql
-- One-time migration: convert all BDT-denominated columns to USD using rate
-- 125 BDT = 1 USD. Run this ONCE in Supabase SQL Editor after upgrading the
-- frontend to USD. Wrapping in a transaction so it either fully applies or
-- rolls back cleanly.
-- ============================================================================

begin;

-- Conversion rate (BDT per USD).
-- IMPORTANT: keep this in sync with `BDT_PER_USD` in src/lib/constants.ts.
do $$
declare
  rate numeric := 125;
begin
  -- Products: retail & wholesale prices
  update public.products
     set retail_price    = round(retail_price    / rate, 2),
         wholesale_price = round(wholesale_price / rate, 2);

  -- Profile balances
  update public.profiles
     set wallet_balance = round(wallet_balance / rate, 2),
         total_earned   = round(total_earned   / rate, 2);

  -- Existing pending deposits: amount column now represents USD wallet credit
  update public.deposits
     set amount = round(amount / rate, 2);

  -- Existing pending withdraws: amount is wallet USD
  update public.withdraws
     set amount = round(amount / rate, 2);

  -- Historical orders
  update public.orders
     set subtotal              = round(subtotal              / rate, 2),
         discount              = round(discount              / rate, 2),
         total                 = round(total                 / rate, 2),
         wallet_balance_before = round(wallet_balance_before / rate, 2),
         wallet_balance_after  = round(wallet_balance_after  / rate, 2);

  update public.order_items
     set unit_price = round(unit_price / rate, 2),
         line_total = round(line_total / rate, 2);

  -- Coupon "max discount amount" if denominated in money (skip percent rows)
  update public.coupons
     set value = round(value / rate, 2)
   where type = 'amount';

  -- Referral tracking
  update public.referrals
     set amount     = round(amount     / rate, 2),
         commission = round(commission / rate, 2);
end $$;

commit;

-- ============================================================================
-- Fix the hardcoded "minimum withdrawal" check in request_withdraw RPC.
-- The original function used 500 (BDT). With USD wallet, minimum is $5.
-- Re-run this block after the data migration above.
-- ============================================================================
create or replace function public.request_withdraw(
  p_amount numeric,
  p_method text,
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

-- After running, verify with:
-- select id, name, retail_price, wholesale_price from public.products order by name;
-- select id, email, wallet_balance from public.profiles;
