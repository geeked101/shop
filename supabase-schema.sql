-- ================================================
-- SHOP APP — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── ZONES ──────────────────────────────────────
create table zones (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  is_active boolean default true,
  base_fare numeric default 50,
  per_km_rate numeric default 12.5,
  created_at timestamptz default now()
);

insert into zones (name) values
  ('CBD'), ('Westlands'), ('Roysambu'), ('Kilimani'),
  ('Lavington'), ('South B'), ('South C'), ('Mutomo'),
  ('Parklands'), ('Kasarani'), ('Eastleigh'), ('Ngong Rd');

-- ── USERS ──────────────────────────────────────
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique not null,
  name text not null default '',
  role text not null check (role in ('customer','vendor','rider','admin')) default 'customer',
  avatar_url text,
  created_at timestamptz default now()
);

-- ── ADDRESSES ──────────────────────────────────
create table addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  label text not null,
  address text not null,
  lat numeric not null,
  lng numeric not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- ── VENDORS ────────────────────────────────────
create table vendors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  description text default '',
  category text not null check (category in ('restaurant','pharmacy','grocery','shop')),
  phone text not null,
  address text not null,
  lat numeric not null default 0,
  lng numeric not null default 0,
  zone_id uuid references zones(id),
  logo_url text,
  status text default 'pending' check (status in ('pending','active','suspended')),
  rating numeric default 0,
  rating_count int default 0,
  min_order numeric default 300,
  is_open boolean default false,
  opening_hours jsonb default '{}',
  commission_rate numeric default 0.12,
  created_at timestamptz default now()
);

-- ── MENU ITEMS ─────────────────────────────────
create table menu_items (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references vendors(id) on delete cascade,
  name text not null,
  description text default '',
  price numeric not null,
  category text default 'General',
  image_url text,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- ── RIDERS ─────────────────────────────────────
create table riders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  phone text not null,
  plate text not null,
  zone_id uuid references zones(id),
  status text default 'pending' check (status in ('pending','active','suspended')),
  is_online boolean default false,
  lat numeric,
  lng numeric,
  rating numeric default 0,
  rating_count int default 0,
  total_trips int default 0,
  created_at timestamptz default now()
);

-- ── ORDERS ─────────────────────────────────────
create table orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references users(id),
  vendor_id uuid references vendors(id),
  rider_id uuid references riders(id),
  status text default 'pending' check (
    status in ('pending','confirmed','preparing','ready',
               'collecting','on_the_way','delivered','cancelled')
  ),
  subtotal numeric not null,
  delivery_fee numeric not null,
  service_fee numeric default 30,
  total numeric not null,
  delivery_address text not null,
  delivery_lat numeric not null,
  delivery_lng numeric not null,
  distance_km numeric not null,
  payment_method text check (payment_method in ('mpesa','cash')) default 'mpesa',
  payment_status text check (payment_status in ('pending','paid','failed')) default 'pending',
  mpesa_checkout_id text,
  mpesa_receipt text,
  note text,
  rating int check (rating between 1 and 5),
  review text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── ORDER ITEMS ────────────────────────────────
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  name text not null,
  price numeric not null,
  quantity int not null
);

-- ── MESSAGES ───────────────────────────────────
create table messages (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  sender_id uuid references users(id),
  receiver_id uuid references users(id),
  content text not null,
  created_at timestamptz default now()
);

-- ── PAYOUTS ────────────────────────────────────
create table payouts (
  id uuid primary key default uuid_generate_v4(),
  recipient_id uuid references users(id),
  recipient_type text check (recipient_type in ('vendor','rider')),
  amount numeric not null,
  status text default 'pending' check (status in ('pending','paid','failed')),
  mpesa_ref text,
  created_at timestamptz default now()
);

-- ── UPDATED AT TRIGGER ─────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- ── ROW LEVEL SECURITY ─────────────────────────
alter table users enable row level security;
alter table addresses enable row level security;
alter table vendors enable row level security;
alter table menu_items enable row level security;
alter table riders enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table messages enable row level security;
alter table payouts enable row level security;
alter table zones enable row level security;

-- Zones: public read
create policy "zones_public_read" on zones for select using (true);

-- Users: own record
create policy "users_own" on users for all using (auth.uid() = id);

-- Addresses: own records
create policy "addresses_own" on addresses for all using (auth.uid() = user_id);

-- Vendors: public read active vendors; vendors manage own
create policy "vendors_public_read" on vendors for select using (status = 'active');
create policy "vendors_own_write" on vendors for all using (auth.uid() = user_id);

-- Menu items: public read available; vendor manages own
create policy "menu_public_read" on menu_items for select using (is_available = true);
create policy "menu_vendor_write" on menu_items for all
  using (auth.uid() = (select user_id from vendors where id = vendor_id));

-- Riders: public read active
create policy "riders_public_read" on riders for select using (status = 'active');
create policy "riders_own_write" on riders for all using (auth.uid() = user_id);

-- Orders: customer/vendor/rider can see their own
create policy "orders_customer" on orders for all using (auth.uid() = customer_id);
create policy "orders_vendor" on orders for all
  using (auth.uid() = (select user_id from vendors where id = vendor_id));
create policy "orders_rider" on orders for all
  using (auth.uid() = (select user_id from riders where id = rider_id));

-- Order items: accessible via order
create policy "order_items_read" on order_items for select
  using (auth.uid() in (
    select customer_id from orders where id = order_id
    union select user_id from vendors v join orders o on v.id = o.vendor_id where o.id = order_id
  ));

-- Messages: participants only
create policy "messages_participants" on messages for all
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- ── REALTIME ───────────────────────────────────
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table riders;
