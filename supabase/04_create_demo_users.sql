-- ============================================================
-- 04 — Create Demo Users via SQL (SQL-only, no Auth UI needed)
-- ============================================================
-- Run this AFTER 01_schema.sql, 02_policies.sql, 03_seed.sql
-- This creates 3 fully-confirmed users (no email verification needed)
-- and updates their profile roles/wallets in one go.
-- ============================================================

-- Ensure pgcrypto extension is available (Supabase installs it in 'extensions' schema)
create extension if not exists pgcrypto with schema extensions;

-- Helper function to create a confirmed Supabase auth user via SQL
-- Inserts into auth.users + auth.identities with email_confirmed_at = now()
-- so the user can log in immediately without email verification.
--
-- IMPORTANT: search_path includes 'extensions' so gen_salt() and crypt() resolve.
-- We also fully-qualify them as extensions.crypt / extensions.gen_salt for safety.
create or replace function public.create_confirmed_user(
  p_email text,
  p_password text,
  p_name text default null
) returns uuid
language plpgsql
security definer
set search_path = public, extensions, auth
as $$
declare
  v_user_id uuid;
  v_existing uuid;
begin
  -- Idempotent: if user already exists, return their id
  select id into v_existing from auth.users where email = p_email;
  if v_existing is not null then
    return v_existing;
  end if;

  v_user_id := gen_random_uuid();

  -- Insert into auth.users with all required fields and email pre-confirmed
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('name', coalesce(p_name, split_part(p_email, '@', 1))),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Insert into auth.identities so password-grant login works
  insert into auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    p_email,
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', p_email, 'email_verified', true),
    'email',
    now(),
    now(),
    now()
  );

  return v_user_id;
end;
$$;

-- ============================================================
-- Create the 3 demo users
-- ============================================================
-- Note: the on_auth_user_created trigger (defined in schema.sql) will
-- automatically create matching public.profiles rows for each user.

select public.create_confirmed_user('admin@bazaar.dev',    'admin123',    'Bazaar Admin');
select public.create_confirmed_user('reseller@bazaar.dev', 'reseller123', 'TopDeal Reseller');
select public.create_confirmed_user('demo@bazaar.dev',     'user1234',    'Demo Customer');

-- ============================================================
-- Update profile roles, wallet balances, referral codes
-- ============================================================

-- 1) Promote admin
update public.profiles
   set role = 'admin'
 where email = 'admin@bazaar.dev';

-- 2) Approve reseller with starter balance + referral code + earnings history
update public.profiles
   set role            = 'reseller',
       reseller_status = 'approved',
       referral_code   = 'TOPDEAL',
       wallet_balance  = 8500,
       total_earned    = 12640
 where email = 'reseller@bazaar.dev';

-- 3) Give demo customer some wallet balance for instant testing
update public.profiles
   set wallet_balance = 1500
 where email = 'demo@bazaar.dev';

-- ============================================================
-- Drop the helper function (cleanup — not needed after this point)
-- ============================================================
drop function if exists public.create_confirmed_user(text, text, text);

-- ============================================================
-- Verify everything worked
-- ============================================================
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

-- ============================================================
-- Expected output (3 rows):
--   admin@bazaar.dev      | admin    | none      | 0     | (auto)   | YES
--   demo@bazaar.dev       | user     | none      | 1500  | (auto)   | YES
--   reseller@bazaar.dev   | reseller | approved  | 8500  | TOPDEAL  | YES
-- ============================================================
