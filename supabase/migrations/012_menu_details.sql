-- =============================================================================
-- VenuePro Menu Details Table
-- =============================================================================

create table if not exists public.menus (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  price_paise bigint not null default 0,
  food_type text not null check (food_type in ('veg', 'non_veg', 'both', 'jain')),
  category text not null,
  tags text[] default '{}',
  items text[] default '{}',
  hall_ids uuid[] default '{}',
  created_at timestamptz default now()
);

-- Enable Row-Level Security (RLS)
alter table public.menus enable row level security;

-- Policies for menus
drop policy if exists "Menus SELECT RLS" on public.menus;
create policy "Menus SELECT RLS" on public.menus
  for select using (org_id = public.get_user_org_id() or public.get_user_role() = 'super_admin');

drop policy if exists "Menus INSERT/UPDATE/DELETE RLS" on public.menus;
create policy "Menus INSERT/UPDATE/DELETE RLS" on public.menus
  for all using (
    org_id = public.get_user_org_id()
    and (public.get_user_role() in ('owner', 'manager') or public.check_user_permission('settings', 'update'))
  );
