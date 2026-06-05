-- =============================================================================
-- VenuePro Inventory Management & Allocation Schema
-- =============================================================================

-- ─── 1. Inventory Items Catalog ──────────────────────────────────────────────
create table if not exists public.inventory_items (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  category text not null check (category in ('furniture', 'av', 'decor', 'tableware', 'catering', 'other')),
  description text,
  total_quantity integer default 0 check (total_quantity >= 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.inventory_items enable row level security;

-- Policies
drop policy if exists "Inventory SELECT RLS" on public.inventory_items;
create policy "Inventory SELECT RLS" on public.inventory_items
  for select using (org_id = public.get_user_org_id());

drop policy if exists "Inventory WRITE RLS" on public.inventory_items;
create policy "Inventory WRITE RLS" on public.inventory_items
  for all using (
    org_id = public.get_user_org_id() 
    and (public.get_user_role() in ('owner', 'manager') or public.check_user_permission('settings', 'update'))
  );

-- Indexes
create index if not exists idx_inventory_org on public.inventory_items(org_id);
create index if not exists idx_inventory_category on public.inventory_items(org_id, category);

-- Auto-update updated_at trigger
create trigger inventory_items_updated_at before update on public.inventory_items
  for each row execute function public.update_updated_at();


-- ─── 2. Booking Inventory Allocations ────────────────────────────────────────
create table if not exists public.booking_inventory_allocations (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  booking_id uuid references public.bookings(id) on delete cascade not null,
  inventory_item_id uuid references public.inventory_items(id) on delete cascade not null,
  quantity integer default 1 check (quantity > 0),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.booking_inventory_allocations enable row level security;

-- Policies
drop policy if exists "Allocations SELECT RLS" on public.booking_inventory_allocations;
create policy "Allocations SELECT RLS" on public.booking_inventory_allocations
  for select using (org_id = public.get_user_org_id());

drop policy if exists "Allocations WRITE RLS" on public.booking_inventory_allocations;
create policy "Allocations WRITE RLS" on public.booking_inventory_allocations
  for all using (
    org_id = public.get_user_org_id() 
    and (public.get_user_role() in ('owner', 'manager') or public.check_user_permission('bookings', 'update'))
  );

-- Indexes
create index if not exists idx_allocations_org on public.booking_inventory_allocations(org_id);
create index if not exists idx_allocations_booking on public.booking_inventory_allocations(booking_id);
create index if not exists idx_allocations_item on public.booking_inventory_allocations(inventory_item_id);
