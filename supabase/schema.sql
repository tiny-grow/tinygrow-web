-- ==============================================================================
-- TinyGrow E-Commerce Complete Database Migration
-- Paste this script into your Supabase Dashboard -> SQL Editor and click "Run"
--
-- QUICK FIX (If saving in admin doesn't persist, run these 7 lines in SQL Editor):
-- alter table public.categories disable row level security;
-- alter table public.products disable row level security;
-- alter table public.hero_banner disable row level security;
-- alter table public.about_section disable row level security;
-- alter table public.contact_information disable row level security;
-- alter table public.social_links disable row level security;
-- alter table public.promotions disable row level security;
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. TABLES DEFINITION
-- ==============================================================================

-- Categories Table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  display_order integer default 0,
  active boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Products Table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null default 0,
  image_url text,
  suitable_ages text[] default '{}',
  stock_status text default 'in_stock' check (stock_status in ('in_stock', 'out_of_stock', 'low_stock')),
  featured boolean default false,
  is_new_arrival boolean default false,
  is_toy boolean default false,
  is_accessory boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Add is_accessory column to existing databases (safe to run multiple times)
alter table public.products add column if not exists is_accessory boolean default false;

-- Hero Banner Table
create table if not exists public.hero_banner (
  id uuid primary key default gen_random_uuid(),
  badge_text text default 'NEW ARRIVALS',
  title text not null default 'Little Moments, Made to Grow',
  title_highlight text default 'Made to Grow',
  subtitle text default 'Soft clothing, little accessories and joyful toys for your little ones.',
  description text,
  image_url text,
  button_text text default 'Shop New Arrivals',
  button_link text default '/shop',
  feature_1_title text default 'Soft & Safe Materials',
  feature_2_title text default 'Gentle on Baby''s Skin',
  feature_3_title text default 'Fast & Reliable Delivery',
  feature_4_title text default 'Trusted by Parents',
  mobile_image_url text,
  mobile_banner_urls text[] default '{}',
  active boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Add mobile banner columns to existing hero_banner table (safe to run multiple times)
alter table public.hero_banner add column if not exists mobile_image_url text;
alter table public.hero_banner add column if not exists mobile_banner_urls text[] default '{}';

-- About Section Table
create table if not exists public.about_section (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Tiny Essentials for a Happier Tomorrow',
  description text default 'Every little detail is crafted with utmost love, organic safety and snuggly softness for your growing child.',
  image_url text,
  button_text text default 'Explore Now',
  button_link text default '/shop',
  feature_items jsonb default '["Premium Organic Quality", "100% Baby-Safe Materials", "Soft, Breathable & Hypoallergenic", "Perfect for Daily Smiles & Gifting"]'::jsonb,
  active boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Contact Information & Settings Table
create table if not exists public.contact_information (
  id uuid primary key default gen_random_uuid(),
  phone text default '+91 79947 02567',
  whatsapp_number text default '+917994702567',
  email text default 'support@tinygrow.com',
  address text default '123 Joyful Lane, Blossom Garden, City - 400001',
  business_hours text default 'Mon - Sat: 9:00 AM - 7:00 PM',
  announcement_text text default 'Free shipping on orders above ₹999 | Easy WhatsApp Ordering | 100% Baby-Safe Products',
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Social Links Table
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  active boolean default true,
  display_order integer default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Promotions Table (Homepage Highlights)
create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  card_key text not null unique,
  title text not null,
  subtitle text,
  tagline text,
  button_text text default 'Explore',
  button_link text default '/shop',
  image_url text,
  active boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 2. PERFORMANCE INDEXES
-- ==============================================================================
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_featured on public.products(featured);
create index if not exists idx_products_new_arrival on public.products(is_new_arrival);
create index if not exists idx_products_is_toy on public.products(is_toy);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_categories_display_order on public.categories(display_order);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.hero_banner enable row level security;
alter table public.about_section enable row level security;
alter table public.contact_information enable row level security;
alter table public.social_links enable row level security;
alter table public.promotions enable row level security;

-- Drop existing policies if they already exist to allow clean re-runs
drop policy if exists "Allow public read categories" on public.categories;
drop policy if exists "Allow authenticated insert categories" on public.categories;
drop policy if exists "Allow authenticated update categories" on public.categories;
drop policy if exists "Allow authenticated delete categories" on public.categories;
drop policy if exists "Allow all insert categories" on public.categories;
drop policy if exists "Allow all update categories" on public.categories;
drop policy if exists "Allow all delete categories" on public.categories;

drop policy if exists "Allow public read products" on public.products;
drop policy if exists "Allow authenticated insert products" on public.products;
drop policy if exists "Allow authenticated update products" on public.products;
drop policy if exists "Allow authenticated delete products" on public.products;
drop policy if exists "Allow all insert products" on public.products;
drop policy if exists "Allow all update products" on public.products;
drop policy if exists "Allow all delete products" on public.products;

drop policy if exists "Allow public read hero_banner" on public.hero_banner;
drop policy if exists "Allow authenticated insert hero_banner" on public.hero_banner;
drop policy if exists "Allow authenticated update hero_banner" on public.hero_banner;
drop policy if exists "Allow authenticated delete hero_banner" on public.hero_banner;
drop policy if exists "Allow all insert hero_banner" on public.hero_banner;
drop policy if exists "Allow all update hero_banner" on public.hero_banner;
drop policy if exists "Allow all delete hero_banner" on public.hero_banner;

drop policy if exists "Allow public read about_section" on public.about_section;
drop policy if exists "Allow authenticated insert about_section" on public.about_section;
drop policy if exists "Allow authenticated update about_section" on public.about_section;
drop policy if exists "Allow authenticated delete about_section" on public.about_section;
drop policy if exists "Allow all insert about_section" on public.about_section;
drop policy if exists "Allow all update about_section" on public.about_section;
drop policy if exists "Allow all delete about_section" on public.about_section;

drop policy if exists "Allow public read contact_information" on public.contact_information;
drop policy if exists "Allow authenticated insert contact_information" on public.contact_information;
drop policy if exists "Allow authenticated update contact_information" on public.contact_information;
drop policy if exists "Allow authenticated delete contact_information" on public.contact_information;
drop policy if exists "Allow all insert contact_information" on public.contact_information;
drop policy if exists "Allow all update contact_information" on public.contact_information;
drop policy if exists "Allow all delete contact_information" on public.contact_information;

drop policy if exists "Allow public read social_links" on public.social_links;
drop policy if exists "Allow authenticated insert social_links" on public.social_links;
drop policy if exists "Allow authenticated update social_links" on public.social_links;
drop policy if exists "Allow authenticated delete social_links" on public.social_links;
drop policy if exists "Allow all insert social_links" on public.social_links;
drop policy if exists "Allow all update social_links" on public.social_links;
drop policy if exists "Allow all delete social_links" on public.social_links;

drop policy if exists "Allow public read promotions" on public.promotions;
drop policy if exists "Allow authenticated insert promotions" on public.promotions;
drop policy if exists "Allow authenticated update promotions" on public.promotions;
drop policy if exists "Allow authenticated delete promotions" on public.promotions;
drop policy if exists "Allow all insert promotions" on public.promotions;
drop policy if exists "Allow all update promotions" on public.promotions;
drop policy if exists "Allow all delete promotions" on public.promotions;

-- 3A. Public Read Access (Storefront visitors)
create policy "Allow public read categories" on public.categories for select using (true);
create policy "Allow public read products" on public.products for select using (true);
create policy "Allow public read hero_banner" on public.hero_banner for select using (true);
create policy "Allow public read about_section" on public.about_section for select using (true);
create policy "Allow public read contact_information" on public.contact_information for select using (true);
create policy "Allow public read social_links" on public.social_links for select using (true);
create policy "Allow public read promotions" on public.promotions for select using (true);

-- 3B. Admin Management (Permits both authenticated sessions and anon admin portal)
create policy "Allow all insert categories" on public.categories for insert with check (true);
create policy "Allow all update categories" on public.categories for update using (true) with check (true);
create policy "Allow all delete categories" on public.categories for delete using (true);

create policy "Allow all insert products" on public.products for insert with check (true);
create policy "Allow all update products" on public.products for update using (true) with check (true);
create policy "Allow all delete products" on public.products for delete using (true);

create policy "Allow all insert hero_banner" on public.hero_banner for insert with check (true);
create policy "Allow all update hero_banner" on public.hero_banner for update using (true) with check (true);
create policy "Allow all delete hero_banner" on public.hero_banner for delete using (true);

create policy "Allow all insert about_section" on public.about_section for insert with check (true);
create policy "Allow all update about_section" on public.about_section for update using (true) with check (true);
create policy "Allow all delete about_section" on public.about_section for delete using (true);

create policy "Allow all insert contact_information" on public.contact_information for insert with check (true);
create policy "Allow all update contact_information" on public.contact_information for update using (true) with check (true);
create policy "Allow all delete contact_information" on public.contact_information for delete using (true);

create policy "Allow all insert social_links" on public.social_links for insert with check (true);
create policy "Allow all update social_links" on public.social_links for update using (true) with check (true);
create policy "Allow all delete social_links" on public.social_links for delete using (true);

create policy "Allow all insert promotions" on public.promotions for insert with check (true);
create policy "Allow all update promotions" on public.promotions for update using (true) with check (true);
create policy "Allow all delete promotions" on public.promotions for delete using (true);

-- ==============================================================================
-- 4. STARTER SEED DATA
-- ==============================================================================

-- 4A. Default Categories
insert into public.categories (name, slug, description, image_url, display_order, active)
values
  ('Baby Dresses', 'dresses', 'Soft, breathable and playful outfits crafted for gentle baby skin.', null, 1, true),
  ('Cute Accessories', 'accessories', 'Gentle bibs, warm socks, cozy booties and snuggly caps.', null, 2, true),
  ('Joyful Toys', 'toys', 'Safe, non-toxic developmental plushies and wooden Montessori toys.', null, 3, true)
on conflict (slug) do nothing;

-- 4B. Default Hero Banner
insert into public.hero_banner (
  badge_text,
  title,
  title_highlight,
  subtitle,
  image_url,
  button_text,
  button_link,
  feature_1_title,
  feature_2_title,
  feature_3_title,
  feature_4_title,
  active
)
values (
  'NEW ARRIVALS',
  'Little Moments, Made to Grow',
  'Made to Grow',
  'Soft clothing, little accessories and joyful toys for your little ones.',
  null,
  'Shop New Arrivals',
  '/shop',
  'Soft & Safe Materials',
  'Gentle on Baby''s Skin',
  'Fast & Reliable Delivery',
  'Trusted by Parents',
  true
)
on conflict do nothing;

-- 4C. Default About Section
insert into public.about_section (
  title,
  description,
  image_url,
  button_text,
  button_link,
  feature_items,
  active
)
values (
  'Tiny Essentials for a Happier Tomorrow',
  'At TinyGrow, we believe every child deserves pure softness and care. Our products are made with 100% certified organic cotton, hypoallergenic dyes, and hand-inspected safety so your baby can play, explore, and rest comfortably.',
  null,
  'Explore Collection',
  '/shop',
  '["100% Certified Organic Cotton", "Hypoallergenic & Chemical-Free", "Reinforced Snaps & Smooth Seams", "Tested Safe for Everyday Play"]'::jsonb,
  true
)
on conflict do nothing;

-- 4D. Default Contact Information
insert into public.contact_information (
  phone,
  whatsapp_number,
  email,
  address,
  business_hours,
  announcement_text
)
values (
  '+91 79947 02567',
  '+917994702567',
  'care@tinygrow.com',
  '123 Joyful Lane, Blossom Garden, City - 400001',
  'Mon - Sat: 9:00 AM - 7:00 PM',
  'Free shipping on orders above ₹999 | Easy WhatsApp Ordering | 100% Baby-Safe Products'
)
on conflict do nothing;

-- 4E. Default Social Links
insert into public.social_links (platform, url, display_order, active)
values
  ('WhatsApp', 'https://api.whatsapp.com/send?phone=917994702567', 1, true),
  ('Instagram', 'https://instagram.com/tinygrow', 2, true),
  ('Facebook', 'https://facebook.com/tinygrow', 3, true),
on conflict do nothing;

-- Ensure existing database rows have the updated WhatsApp number for orders
update public.contact_information
set
  phone = '+91 79947 02567',
  whatsapp_number = '+917994702567';

update public.social_links
set url = 'https://api.whatsapp.com/send?phone=917994702567'
where platform = 'WhatsApp';

-- 4F. Default Promotions
insert into public.promotions (
  card_key,
  title,
  subtitle,
  tagline,
  button_text,
  button_link,
  image_url,
  active
)
values
  (
    'special_offers',
    'Special Offers',
    'For your little happiness',
    'Save up to 30% on seasonal baby collections',
    'Shop Now',
    '/shop',
    null,
    true
  ),
  (
    'comfort_today',
    'Comfort Today',
    'Grow together everyday',
    'Ultra-soft daily wear essentials',
    'Explore',
    '/shop',
    null,
    true
  )
on conflict (card_key) do update
set
  title = excluded.title,
  subtitle = excluded.subtitle;

-- 4G. Starter Products
do $$
declare
  cat_dresses uuid;
  cat_accessories uuid;
  cat_toys uuid;
begin
  select id into cat_dresses from public.categories where slug = 'dresses' limit 1;
  select id into cat_accessories from public.categories where slug = 'accessories' limit 1;
  select id into cat_toys from public.categories where slug = 'toys' limit 1;

  -- Product 1: Organic Cotton Onesie
  insert into public.products (
    category_id, name, slug, description, price, image_url, suitable_ages, stock_status, featured, is_new_arrival, is_toy
  ) values (
    cat_dresses,
    'Soft Cotton Pastel Onesie',
    'soft-cotton-pastel-onesie',
    'Crafted from 100% ultra-soft breathable cotton with smooth snap buttons for hassle-free diaper changes.',
    599.00,
    null,
    array['0–3 Months', '3–6 Months', '6–12 Months'],
    'in_stock',
    true,
    true,
    false
  ) on conflict (slug) do nothing;

  -- Product 2: Floral Sleeveless Frock
  insert into public.products (
    category_id, name, slug, description, price, image_url, suitable_ages, stock_status, featured, is_new_arrival, is_toy
  ) values (
    cat_dresses,
    'Floral Summer Breezy Frock',
    'floral-summer-breezy-frock',
    'Lightweight, breathable, and adorned with delicate floral patterns for your baby girl''s cheerful outings.',
    799.00,
    null,
    array['6–12 Months', '1–2 Years', '2–3 Years'],
    'in_stock',
    true,
    true,
    false
  ) on conflict (slug) do nothing;

  -- Product 3: Organic Knitted Booties & Cap Set
  insert into public.products (
    category_id, name, slug, description, price, image_url, suitable_ages, stock_status, featured, is_new_arrival, is_toy
  ) values (
    cat_accessories,
    'Knitted Wool Booties & Beanie Set',
    'knitted-booties-beanie-set',
    'Handmade soft wool booties and matching cap that keeps tiny feet and ears cozy and snug all day long.',
    449.00,
    null,
    array['0–3 Months', '3–6 Months'],
    'in_stock',
    true,
    false,
    false
  ) on conflict (slug) do nothing;

  -- Product 4: Wooden Montessori Stacking Rings (Toy)
  insert into public.products (
    category_id, name, slug, description, price, image_url, suitable_ages, stock_status, featured, is_new_arrival, is_toy
  ) values (
    cat_toys,
    'Montessori Natural Wooden Stacker',
    'montessori-natural-wooden-stacker',
    'Smooth polished natural beechwood rings with organic non-toxic water-based food-grade dyes.',
    699.00,
    null,
    array['6–12 Months', '1–2 Years', '2–3 Years'],
    'in_stock',
    true,
    true,
    true
  ) on conflict (slug) do nothing;

  -- Product 5: Soft Plush Stuffed Bear (Toy)
  insert into public.products (
    category_id, name, slug, description, price, image_url, suitable_ages, stock_status, featured, is_new_arrival, is_toy
  ) values (
    cat_toys,
    'Snuggle Honey Teddy Bear Plush',
    'snuggle-honey-teddy-bear',
    'Ultra-soft plush companion stuffed with hypoallergenic organic cotton fill, embroidered eyes for 100% baby safety.',
    899.00,
    null,
    array['0–3 Months', '3–6 Months', '6–12 Months', '1–2 Years', '2–3 Years', '3–4 Years'],
    'in_stock',
    true,
    true,
    true
  ) on conflict (slug) do nothing;

  -- Product 6: Baby Silicon Teething Feeder Set
  insert into public.products (
    category_id, name, slug, description, price, image_url, suitable_ages, stock_status, featured, is_new_arrival, is_toy
  ) values (
    cat_accessories,
    'Food Grade Silicone Teether Rattle',
    'silicone-teether-rattle-set',
    'BPA-free, soothing textured surfaces that comfort tender gums while providing easy grip for small hands.',
    349.00,
    null,
    array['3–6 Months', '6–12 Months'],
    'in_stock',
    false,
    true,
    false
  ) on conflict (slug) do nothing;

end $$;
