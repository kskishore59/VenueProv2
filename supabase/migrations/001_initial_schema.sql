-- =============================================================================
-- VenuePro — Complete Database Schema
-- Run this in your Supabase SQL Editor (or as a migration)
-- =============================================================================

-- ─── Extensions ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Organizations ──────────────────────────────────────────────────────────
create table if not exists public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  gstin text,
  address text,
  city text,
  state text,
  phone text,
  email text,
  logo_url text,
  settings jsonb default '{
    "currency": "INR",
    "timezone": "Asia/Kolkata",
    "date_format": "dd/MM/yyyy",
    "default_advance_percent": 25,
    "gst_enabled": true,
    "whatsapp_enabled": true,
    "sms_enabled": false,
    "email_notifications": true
  }'::jsonb,
  plan text default 'free' check (plan in ('free', 'starter', 'pro', 'enterprise')),
  created_at timestamptz default now()
);

-- ─── Profiles (user accounts linked to auth.users) ─────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  email text not null,
  full_name text not null,
  avatar_url text,
  role text default 'staff' check (role in ('owner', 'manager', 'staff', 'finance')),
  phone text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ─── Halls ──────────────────────────────────────────────────────────────────
create table if not exists public.halls (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  type text default 'banquet_hall' check (type in ('banquet_hall', 'conference_room', 'lawn', 'terrace', 'boardroom', 'other')),
  capacity_min integer default 0,
  capacity_max integer default 0,
  area_sqft integer,
  pricing jsonb default '{}'::jsonb,
  amenities text[] default '{}',
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- ─── Customers ──────────────────────────────────────────────────────────────
create table if not exists public.customers (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  phone text not null,
  email text,
  whatsapp text,
  gstin text,
  address text,
  notes text,
  source text default 'walk_in' check (source in ('walk_in', 'phone_call', 'whatsapp', 'google', 'referral', 'social_media', 'justdial', 'website', 'other')),
  tags text[] default '{}',
  created_at timestamptz default now(),

  -- Unique phone per org
  unique(org_id, phone)
);

-- ─── Bookings ───────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  hall_id uuid references public.halls(id) not null,
  customer_id uuid references public.customers(id) not null,
  booking_number text not null,
  event_type text not null check (event_type in (
    'wedding', 'reception', 'engagement', 'mehendi', 'haldi', 'sangeet',
    'birthday', 'anniversary', 'corporate', 'conference', 'pooja', 'other'
  )),
  event_date date not null,
  start_time time not null,
  end_time time not null,
  guest_count integer,
  status text default 'inquiry' check (status in ('inquiry', 'hold', 'confirmed', 'completed', 'cancelled')),
  total_amount_paise bigint default 0,
  advance_amount_paise bigint default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Unique booking number per org
  unique(org_id, booking_number)
);

-- ─── Payments ───────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  booking_id uuid references public.bookings(id) on delete cascade not null,
  amount_paise bigint not null,
  payment_type text default 'advance' check (payment_type in ('advance', 'installment', 'final', 'refund')),
  payment_mode text not null check (payment_mode in ('cash', 'upi', 'bank_transfer', 'cheque', 'card', 'online')),
  status text default 'received' check (status in ('pending', 'received', 'failed', 'refunded')),
  transaction_ref text,
  due_date date,
  paid_at timestamptz default now(),
  notes text,
  created_at timestamptz default now()
);

-- ─── Leads ──────────────────────────────────────────────────────────────────
create table if not exists public.leads (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  phone text not null,
  email text,
  event_type text,
  tentative_date date,
  budget_min_paise bigint,
  budget_max_paise bigint,
  source text default 'walk_in' check (source in ('walk_in', 'phone_call', 'whatsapp', 'google', 'referral', 'social_media', 'justdial', 'website', 'other')),
  status text default 'new' check (status in ('new', 'contacted', 'visit_scheduled', 'negotiation', 'won', 'lost')),
  follow_up_date date,
  assigned_to uuid references public.profiles(id),
  notes text,
  hall_preference text,
  guest_count integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Indexes ────────────────────────────────────────────────────────────────
create index if not exists idx_halls_org on public.halls(org_id);
create index if not exists idx_customers_org on public.customers(org_id);
create index if not exists idx_customers_phone on public.customers(org_id, phone);
create index if not exists idx_bookings_org on public.bookings(org_id);
create index if not exists idx_bookings_date on public.bookings(org_id, event_date);
create index if not exists idx_bookings_hall_date on public.bookings(hall_id, event_date);
create index if not exists idx_bookings_customer on public.bookings(customer_id);
create index if not exists idx_payments_org on public.payments(org_id);
create index if not exists idx_payments_booking on public.payments(booking_id);
create index if not exists idx_leads_org on public.leads(org_id);
create index if not exists idx_leads_follow_up on public.leads(org_id, follow_up_date);

-- ─── Auto-update updated_at ────────────────────────────────────────────────
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.update_updated_at();
create trigger leads_updated_at before update on public.leads
  for each row execute function public.update_updated_at();

-- ─── Booking Number Sequence ────────────────────────────────────────────────
create or replace function public.generate_booking_number(p_org_id uuid)
returns text as $$
declare
  v_count integer;
  v_year text;
begin
  v_year := extract(year from now())::text;
  select count(*) + 1 into v_count from public.bookings where org_id = p_org_id;
  return 'VP-' || v_year || '-' || lpad(v_count::text, 5, '0');
end;
$$ language plpgsql;

-- ─── CRITICAL: Atomic Booking Conflict Check ────────────────────────────────
-- This prevents double-booking a hall on the same date+time
create or replace function public.create_booking_safe(
  p_org_id uuid,
  p_hall_id uuid,
  p_customer_id uuid,
  p_event_type text,
  p_event_date date,
  p_start_time time,
  p_end_time time,
  p_guest_count integer default null,
  p_total_amount_paise bigint default 0,
  p_advance_amount_paise bigint default 0,
  p_notes text default null,
  p_status text default 'confirmed'
)
returns jsonb as $$
declare
  v_conflict_count integer;
  v_booking_number text;
  v_new_booking_id uuid;
begin
  -- Lock the hall row to prevent race conditions
  perform 1 from public.halls where id = p_hall_id for update;

  -- Check for overlapping bookings on same hall + date
  select count(*) into v_conflict_count
  from public.bookings
  where hall_id = p_hall_id
    and event_date = p_event_date
    and status not in ('cancelled')
    and (p_start_time, p_end_time) overlaps (start_time, end_time);

  if v_conflict_count > 0 then
    return jsonb_build_object(
      'success', false,
      'error', 'CONFLICT',
      'message', 'This hall is already booked for the selected date and time.'
    );
  end if;

  -- Generate booking number
  v_booking_number := public.generate_booking_number(p_org_id);

  -- Insert the booking
  insert into public.bookings (
    org_id, hall_id, customer_id, booking_number,
    event_type, event_date, start_time, end_time,
    guest_count, status, total_amount_paise, advance_amount_paise, notes
  ) values (
    p_org_id, p_hall_id, p_customer_id, v_booking_number,
    p_event_type, p_event_date, p_start_time, p_end_time,
    p_guest_count, p_status, p_total_amount_paise, p_advance_amount_paise, p_notes
  )
  returning id into v_new_booking_id;

  return jsonb_build_object(
    'success', true,
    'booking_id', v_new_booking_id,
    'booking_number', v_booking_number
  );
end;
$$ language plpgsql;

-- ─── Dashboard Stats RPC ────────────────────────────────────────────────────
create or replace function public.get_dashboard_stats(p_org_id uuid)
returns jsonb as $$
declare
  v_today date := current_date;
  v_tomorrow date := current_date + 1;
  v_month_start date := date_trunc('month', current_date)::date;
  v_month_end date := (date_trunc('month', current_date) + interval '1 month' - interval '1 day')::date;
  v_todays_events integer;
  v_tomorrow_events integer;
  v_month_revenue bigint;
  v_month_bookings integer;
  v_pending_amount bigint;
  v_pending_customers integer;
begin
  -- Today's confirmed events
  select count(*) into v_todays_events
  from public.bookings
  where org_id = p_org_id and event_date = v_today and status in ('confirmed', 'completed');

  -- Tomorrow's events
  select count(*) into v_tomorrow_events
  from public.bookings
  where org_id = p_org_id and event_date = v_tomorrow and status in ('confirmed', 'hold');

  -- This month revenue (received payments)
  select coalesce(sum(p.amount_paise), 0) into v_month_revenue
  from public.payments p
  where p.org_id = p_org_id and p.status = 'received'
    and p.paid_at >= v_month_start and p.paid_at < v_month_end + 1;

  -- This month bookings count
  select count(*) into v_month_bookings
  from public.bookings
  where org_id = p_org_id and event_date between v_month_start and v_month_end
    and status != 'cancelled';

  -- Pending collections
  select coalesce(sum(b.total_amount_paise - coalesce(paid.total_paid, 0)), 0),
         count(distinct case when b.total_amount_paise > coalesce(paid.total_paid, 0) then b.customer_id end)
  into v_pending_amount, v_pending_customers
  from public.bookings b
  left join (
    select booking_id, sum(amount_paise) as total_paid
    from public.payments where status = 'received'
    group by booking_id
  ) paid on paid.booking_id = b.id
  where b.org_id = p_org_id and b.status in ('confirmed', 'hold');

  return jsonb_build_object(
    'todays_events', v_todays_events,
    'tomorrow_events', v_tomorrow_events,
    'this_month_revenue', v_month_revenue,
    'this_month_bookings', v_month_bookings,
    'pending_amount', v_pending_amount,
    'pending_customers', v_pending_customers
  );
end;
$$ language plpgsql;

-- ─── Row Level Security ─────────────────────────────────────────────────────
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.halls enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.leads enable row level security;

-- Helper: get current user's org_id
create or replace function public.get_user_org_id()
returns uuid as $$
  select org_id from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- Organizations: users can only see their own org
create policy "Users can view their org" on public.organizations
  for select using (id = public.get_user_org_id());
create policy "Owners can update their org" on public.organizations
  for update using (id = public.get_user_org_id());

-- Profiles: users can see profiles in their org
create policy "Users can view org profiles" on public.profiles
  for select using (org_id = public.get_user_org_id());
create policy "Users can update own profile" on public.profiles
  for update using (id = auth.uid());

-- Halls: org-scoped
create policy "Users can view org halls" on public.halls
  for select using (org_id = public.get_user_org_id());
create policy "Owners/managers can manage halls" on public.halls
  for all using (org_id = public.get_user_org_id());

-- Customers: org-scoped
create policy "Users can view org customers" on public.customers
  for select using (org_id = public.get_user_org_id());
create policy "Users can manage org customers" on public.customers
  for all using (org_id = public.get_user_org_id());

-- Bookings: org-scoped
create policy "Users can view org bookings" on public.bookings
  for select using (org_id = public.get_user_org_id());
create policy "Users can manage org bookings" on public.bookings
  for all using (org_id = public.get_user_org_id());

-- Payments: org-scoped
create policy "Users can view org payments" on public.payments
  for select using (org_id = public.get_user_org_id());
create policy "Users can manage org payments" on public.payments
  for all using (org_id = public.get_user_org_id());

-- Leads: org-scoped
create policy "Users can view org leads" on public.leads
  for select using (org_id = public.get_user_org_id());
create policy "Users can manage org leads" on public.leads
  for all using (org_id = public.get_user_org_id());

-- ─── Auto-create profile on signup ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_org_id uuid;
  v_org_name text;
begin
  -- Safely extract org_id or generate a new UUID using gen_random_uuid()
  v_org_id := coalesce(
    case 
      when new.raw_user_meta_data is not null and new.raw_user_meta_data ? 'org_id' 
      then (new.raw_user_meta_data->>'org_id')::uuid 
      else null 
    end,
    gen_random_uuid()
  );
  
  -- Safely extract org_name or default to 'My Venue'
  v_org_name := coalesce(
    case 
      when new.raw_user_meta_data is not null and new.raw_user_meta_data ? 'org_name' 
      then new.raw_user_meta_data->>'org_name' 
      else null 
    end,
    'My Venue'
  );

  -- Create organization if it does not exist
  insert into public.organizations (id, name, slug)
  values (v_org_id, v_org_name, 'org-' || substring(v_org_id::text from 1 for 8))
  on conflict (id) do nothing;

  -- Create profile linked to the user and organization
  insert into public.profiles (id, org_id, email, full_name, role)
  values (
    new.id,
    v_org_id,
    new.email,
    coalesce(
      case 
        when new.raw_user_meta_data is not null and new.raw_user_meta_data ? 'full_name' 
        then new.raw_user_meta_data->>'full_name' 
        else null 
      end, 
      split_part(new.email, '@', 1)
    ),
    coalesce(
      case 
        when new.raw_user_meta_data is not null and new.raw_user_meta_data ? 'role' 
        then new.raw_user_meta_data->>'role' 
        else null 
      end, 
      'owner'
    )
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_catalog;

-- Trigger (only create if not exists)
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end
$$;
