-- ============================================================
--  بورصة أسعار السودان — قاعدة البيانات الكاملة
--  الإصدار: 1.1 (مع إصلاح Security Definer View)
-- ============================================================

-- ============================================================
--  EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
--  ENUM TYPES
-- ============================================================
do $$ begin
  create type user_role as enum ('trader', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_status as enum ('active', 'sold', 'expired', 'banned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type currency_code as enum ('SDG', 'USD', 'SAR');
exception when duplicate_object then null; end $$;

-- ============================================================
--  PROFILES
-- ============================================================
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  phone         text not null unique,
  role          user_role not null default 'trader',
  state         text,
  city          text,
  is_verified   boolean default false,
  is_banned     boolean default false,
  rating_avg    numeric(3,2) default 0,
  rating_count  int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_profiles_role  on profiles(role);
create index if not exists idx_profiles_state on profiles(state);

-- ============================================================
--  CATEGORIES
-- ============================================================
create table if not exists categories (
  id          serial primary key,
  slug        text unique not null,
  name_ar     text not null,
  icon        text,
  sort_order  int default 0
);

insert into categories (slug, name_ar, icon, sort_order) values
  ('food',         'مواد غذائية',       '🌾', 1),
  ('vegetables',   'خضروات وفواكه',     '🥬', 2),
  ('meat',         'لحوم وطيور',        '🥩', 3),
  ('medicine',     'أدوية ومستلزمات',   '💊', 4),
  ('clothing',     'ملابس وأحذية',      '👕', 5),
  ('electronics',  'إلكترونيات',        '📱', 6),
  ('construction', 'مواد بناء',         '🧱', 7),
  ('cars',         'سيارات وقطع غيار',  '🚗', 8),
  ('other',        'أخرى',              '📦', 9)
on conflict (slug) do update set
  name_ar = excluded.name_ar,
  icon    = excluded.icon;

-- ============================================================
--  PRODUCTS
-- ============================================================
create table if not exists products (
  id              uuid primary key default uuid_generate_v4(),
  trader_id       uuid not null references profiles(id) on delete cascade,
  name            text not null check (char_length(name) between 2 and 120),
  description     text,
  category_id     int references categories(id),
  emoji           text default '📦' check (char_length(emoji) <= 8),
  qty             numeric(14,3) not null check (qty >= 0),
  unit            text not null,
  price           numeric(14,2) not null check (price >= 0),
  currency        currency_code not null default 'SDG',
  price_usd       numeric(14,2),
  state           text not null,
  city            text,
  market          text,
  min_order       numeric(14,3) default 1,
  status          product_status not null default 'active',
  views_count     int default 0,
  whatsapp_clicks int default 0,
  expires_at      timestamptz default (now() + interval '14 days'),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_products_status   on products(status);
create index if not exists idx_products_trader   on products(trader_id);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_state    on products(state);
create index if not exists idx_products_created  on products(created_at desc);

-- ============================================================
--  RATINGS
-- ============================================================
create table if not exists ratings (
  id          uuid primary key default uuid_generate_v4(),
  trader_id   uuid not null references profiles(id) on delete cascade,
  rater_id    uuid not null references profiles(id) on delete cascade,
  score       int not null check (score between 1 and 5),
  comment     text,
  created_at  timestamptz default now(),
  unique(trader_id, rater_id)
);

-- ============================================================
--  REPORTS
-- ============================================================
create table if not exists reports (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid references products(id) on delete cascade,
  reporter_id uuid references profiles(id) on delete set null,
  reason      text not null,
  status      text default 'pending',
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at  timestamptz default now()
);

create index if not exists idx_reports_status on reports(status);

-- ============================================================
--  TRIGGERS
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_products_updated on products;
create trigger trg_products_updated before update on products
  for each row execute function set_updated_at();

drop trigger if exists trg_profiles_updated on profiles;
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

create or replace function update_trader_rating()
returns trigger language plpgsql as $$
declare target_id uuid;
begin
  target_id := coalesce(new.trader_id, old.trader_id);
  update profiles
     set rating_avg   = coalesce((select avg(score) from ratings where trader_id = target_id), 0),
         rating_count = (select count(*) from ratings where trader_id = target_id)
   where id = target_id;
  return null;
end $$;

drop trigger if exists trg_rating_update on ratings;
create trigger trg_rating_update
after insert or update or delete on ratings
for each row execute function update_trader_rating();

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, phone, state, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    new.raw_user_meta_data->>'state',
    new.raw_user_meta_data->>'city'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table products enable row level security;
alter table ratings  enable row level security;
alter table reports  enable row level security;

drop policy if exists "profiles readable" on profiles;
create policy "profiles readable" on profiles for select using (true);

drop policy if exists "profiles self update" on profiles;
create policy "profiles self update" on profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "products public read" on products;
create policy "products public read" on products for select
  using (status = 'active' or auth.uid() = trader_id);

drop policy if exists "products trader insert" on products;
create policy "products trader insert" on products for insert
  with check (auth.uid() = trader_id);

drop policy if exists "products trader update" on products;
create policy "products trader update" on products for update
  using (auth.uid() = trader_id);

drop policy if exists "products trader delete" on products;
create policy "products trader delete" on products for delete
  using (auth.uid() = trader_id);

drop policy if exists "ratings read" on ratings;
create policy "ratings read" on ratings for select using (true);

drop policy if exists "ratings insert" on ratings;
create policy "ratings insert" on ratings for insert
  with check (auth.uid() = rater_id and auth.uid() <> trader_id);

drop policy if exists "reports insert" on reports;
create policy "reports insert" on reports for insert
  with check (auth.uid() = reporter_id);

-- ============================================================
--  VIEW: product_feed
--  ✅ مع security_invoker=true لإصلاح تحذير Supabase
-- ============================================================
drop view if exists public.product_feed;

create view public.product_feed
with (security_invoker = true)
as
select
  p.id, p.trader_id, p.name, p.description, p.category_id, p.emoji,
  p.qty, p.unit, p.price, p.currency, p.price_usd,
  p.state, p.city, p.market, p.min_order,
  p.status, p.views_count, p.whatsapp_clicks,
  p.expires_at, p.created_at, p.updated_at,
  pr.full_name    as trader_name,
  pr.phone        as trader_phone,
  pr.rating_avg   as trader_rating,
  pr.rating_count as trader_rating_count,
  pr.is_verified  as trader_verified,
  pr.is_banned    as trader_banned,
  c.name_ar       as category_name,
  c.slug          as category_slug,
  c.icon          as category_icon
from public.products p
join public.profiles pr on pr.id = p.trader_id
left join public.categories c on c.id = p.category_id
where p.status = 'active' and pr.is_banned = false;

grant select on public.product_feed to anon, authenticated;

-- ============================================================
--  FUNCTIONS: عدادات
-- ============================================================
create or replace function increment_views(pid uuid)
returns void language sql security definer as $$
  update products set views_count = views_count + 1 where id = pid;
$$;

grant execute on function increment_views(uuid) to anon, authenticated;

create or replace function increment_whatsapp_clicks(pid uuid)
returns void language sql security definer as $$
  update products set whatsapp_clicks = whatsapp_clicks + 1 where id = pid;
$$;

grant execute on function increment_whatsapp_clicks(uuid) to anon, authenticated;

create or replace function expire_old_products()
returns void language sql security definer as $$
  update products set status = 'expired'
  where status = 'active' and expires_at < now();
$$;

-- ============================================================
--  REALTIME
--  ⚠️ إذا ظهر خطأ "already added" — تجاهله (يعني مفعّل مسبقاً)
-- ============================================================
do $$ begin
  alter publication supabase_realtime add table products;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table reports;
exception when duplicate_object then null; end $$;

-- ============================================================
--  ✅ انتهى
-- ============================================================