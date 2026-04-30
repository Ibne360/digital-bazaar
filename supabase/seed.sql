-- ============================================================================
-- Digital Bazaar — Sample seed data
-- ============================================================================
-- Run AFTER schema.sql + policies.sql.
-- Idempotent — uses upserts. Re-runnable.
-- Note: profiles are created automatically via the on_auth_user_created trigger
--       when admin/demo users sign up through Supabase Auth.
-- ============================================================================

-- ---------- Categories ----------
insert into public.categories (id, slug, name, icon, description, color) values
  ('cat_ai',     'ai',     'AI & Automation',   'Sparkles', 'ChatGPT, Gemini, ElevenLabs, Grok, Veo & more',  'from-violet-500 to-fuchsia-500'),
  ('cat_design', 'design', 'Design',            'Palette',  'Canva Pro, Figma, Adobe and creative essentials','from-pink-500 to-rose-500'),
  ('cat_dev',    'dev',    'Dev & Coding',      'Code2',    'GitHub Pack, Copilot, Cursor, Codex toolkits',   'from-cyan-500 to-blue-500'),
  ('cat_social', 'social', 'Social & Premium',  'Globe',    'X Premium, productivity & lifestyle subscriptions','from-emerald-500 to-teal-500')
on conflict (id) do update set
  name = excluded.name, slug = excluded.slug, description = excluded.description, color = excluded.color;

-- ---------- Coupons (USD) ----------
insert into public.coupons (id, code, type, value, active) values
  ('coupon_welcome10', 'WELCOME10', 'percent', 10,   true),
  ('coupon_flash50',   'FLASH50',   'fixed',   0.50, true)
on conflict (id) do update set value = excluded.value, active = excluded.active, type = excluded.type;

-- ---------- Products (USD prices — wallet uses USD; BDT methods convert at 125 BDT/USD) ----------
insert into public.products (id, slug, name, category_id, short_description, description, retail_price, wholesale_price, duration, warranty, delivery_type, delivery_instructions, badges, icon_bg, featured, active) values
  ('prod_chatgpt_plus','chatgpt-plus-1-month-cdk','ChatGPT Plus 1 Month CDK','cat_ai',
   'Activate ChatGPT Plus on your own account with a redeemable code.',
   'Unlock GPT-4o, advanced data analysis, file uploads, image generation and priority access for 30 days. Delivered as an instant CDK code you redeem on your existing OpenAI account — no shared logins.',
   6.80, 4.80, '1 Month', 'Full replacement during the month', 'license_key',
   'Redeem the CDK at chat.openai.com/redeem within 24 hours of purchase.',
   array['instant','hot'], 'from-emerald-500 to-teal-600', true, true),

  ('prod_canva_pro','canva-pro-3-year-invite','Canva Pro 3 Year Invite','cat_design',
   'Get invited to a Canva Pro team — full premium for 3 years.',
   'Includes 100M+ premium assets, brand kits, magic resize, background remover, AI tools and 1TB cloud storage. We add your email to a Canva Pro team — keep using your own login forever.',
   3.20, 1.80, '3 Years', '3-year replacement guarantee', 'invite_link',
   'Accept the invite email from Canva within 48 hours.',
   array['wholesale','instant'], 'from-pink-500 to-rose-600', true, true),

  ('prod_gemini_pro','gemini-pro-18-months','Gemini Pro 18 Months','cat_ai',
   'Google AI Pro / Gemini Advanced + 2TB Drive for 18 months.',
   'Gemini 2.5 Pro, Veo, Whisk, NotebookLM premium, Gemini in Workspace and 2TB Google One storage — activated on your own Google account. Full warranty.',
   17.60, 12.00, '18 Months', '18-month replacement', 'account',
   'Provide a Google account with no active subscription. We activate within 12h.',
   array['wholesale','hot'], 'from-blue-500 to-indigo-600', true, true),

  ('prod_github_pack','github-developer-pack-2-years','GitHub Developer Pack 2 Years','cat_dev',
   'Student Developer Pack benefits + Copilot Pro for 24 months.',
   'Includes GitHub Copilot Pro, Pro account features, free domains, JetBrains All Products, DigitalOcean credits, Notion Pro and 100+ partner perks. We enroll your GitHub.',
   12.00, 7.60, '2 Years', 'Replacement during plan', 'manual',
   'Submit GitHub username after checkout. Activated within 24h.',
   array['wholesale'], 'from-zinc-700 to-zinc-900', true, true),

  ('prod_elevenlabs','elevenlabs-creator-plan','ElevenLabs Creator Plan','cat_ai',
   '100k characters/month, pro voice cloning & commercial license.',
   'Top-tier AI voice generation with professional voice cloning, 192 kbps audio and commercial usage rights. 30-day rolling subscription on your own account.',
   8.80, 6.00, '1 Month', 'Monthly replacement', 'account',
   'Provide ElevenLabs login email after purchase.',
   array['instant'], 'from-amber-500 to-orange-600', false, true),

  ('prod_grok_super','grok-super-plans','Grok Super 1 Month','cat_ai',
   'xAI Grok Super tier — image, voice & code modes.',
   'Highest tier xAI Grok with priority access to new models, image generation, voice mode and large context window. Activated on your X / xAI account.',
   12.00, 8.40, '1 Month', '30-day replacement', 'account',
   'Provide your X account email after purchase.',
   array['limited','new'], 'from-slate-800 to-black', true, true),

  ('prod_veo3_credits','veo3-ultra-credits','Veo3 Ultra Credits Pack','cat_ai',
   '1,000 video generation credits for Google Veo 3 Ultra.',
   'Top-up credits added to your Google AI Ultra account. Generate cinematic 8s 1080p videos with Veo 3. Credits never expire while subscription is active.',
   20.00, 13.60, '1,000 Credits', 'Re-credit if not delivered', 'credits',
   'Send your AI Ultra subscription email — credits added within 6h.',
   array['new','limited'], 'from-purple-600 to-indigo-700', true, true),

  ('prod_x_premium','x-premium-twitter','X Premium+ (Twitter)','cat_social',
   'Verified blue check, ad-free X & creator tools.',
   'Premium+ tier with verified badge, ad-free timeline, longer posts, Grok access and creator monetisation. Subscription on your own X account.',
   8.80, 6.00, '1 Month', 'Monthly replacement', 'account',
   'Provide @handle and login email after purchase.',
   array['wholesale'], 'from-sky-500 to-blue-700', false, true),

  ('prod_cursor_pro','cursor-pro-1-year','Cursor Pro 1 Year','cat_dev',
   'AI-first code editor with frontier models, unlimited completions.',
   'Cursor Pro for 12 months — unlimited GPT-4o, Claude 3.5 Sonnet, fast composer agent and unlimited tab completions. Activated on your own email.',
   72.00, 52.00, '1 Year', '1-year replacement', 'account',
   'Provide Cursor account email after purchase. Activation within 12h.',
   array['hot','wholesale'], 'from-neutral-700 to-neutral-900', false, true),

  ('prod_copilot_pro','github-copilot-pro-1-year','GitHub Copilot Pro 1 Year','cat_dev',
   'Unlimited completions + chat in any IDE for 12 months.',
   'GitHub Copilot Pro on your own GitHub account — unlimited completions, Copilot Chat, code review and the new Copilot Workspace. 1-year warranty.',
   36.00, 24.00, '1 Year', '12-month replacement', 'manual',
   'Submit GitHub username — enrolled within 24h.',
   array['wholesale'], 'from-gray-700 to-slate-900', false, true)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  short_description = excluded.short_description,
  description = excluded.description,
  retail_price = excluded.retail_price,
  wholesale_price = excluded.wholesale_price,
  duration = excluded.duration,
  warranty = excluded.warranty,
  delivery_type = excluded.delivery_type,
  delivery_instructions = excluded.delivery_instructions,
  badges = excluded.badges,
  icon_bg = excluded.icon_bg,
  featured = excluded.featured,
  active = excluded.active;

-- ---------- Sample inventory (10 items per product) ----------
do $$
declare
  p record;
  i int;
  v_payload text;
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_key text;
  c int;
begin
  for p in select id, delivery_type from public.products loop
    -- only seed if no inventory yet
    perform 1 from public.inventory_items where product_id = p.id limit 1;
    if not found then
      for i in 1..10 loop
        v_key := '';
        for c in 1..16 loop
          v_key := v_key || substr(v_chars, (floor(random()*length(v_chars))::int)+1, 1);
          if c % 4 = 0 and c < 16 then v_key := v_key || '-'; end if;
        end loop;
        v_payload := case p.delivery_type
          when 'license_key' then v_key
          when 'invite_link' then 'https://canva.com/join/' || lower(substr(v_key, 1, 8))
          when 'account'     then '{"email":"sample-' || lower(substr(v_key,1,4)) || '@bazaar.io","password":"' || substr(v_key,1,12) || '"}'
          when 'credits'     then 'Credit voucher #' || substr(v_key,1,10)
          else 'Manual fulfilment ticket #' || substr(v_key,1,8)
        end;
        insert into public.inventory_items (product_id, payload) values (p.id, v_payload);
      end loop;
    end if;
  end loop;
end $$;
