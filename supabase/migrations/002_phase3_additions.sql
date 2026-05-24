-- =============================================================================
-- VenuePro Phase 3 Schema Migrations
-- =============================================================================

-- ─── 1. Halls & Organizations Additions ──────────────────────────────────────
alter table public.halls 
  add column if not exists floor_number integer default 0,
  add column if not exists description text,
  add column if not exists capacity_comfortable integer default 0,
  add column if not exists hall_length numeric,
  add column if not exists hall_width numeric,
  add column if not exists hall_height numeric,
  add column if not exists ceiling_height numeric,
  add column if not exists floors_within_hall integer default 1,
  add column if not exists amenities_config jsonb default '{}'::jsonb,
  add column if not exists facilities_config jsonb default '{}'::jsonb,
  add column if not exists pricing_config jsonb default '{}'::jsonb,
  add column if not exists media_config jsonb default '{}'::jsonb,
  add column if not exists images text[] default '{}'::text[],
  add column if not exists veg_price_per_plate_paise bigint,
  add column if not exists nonveg_price_per_plate_paise bigint,
  add column if not exists rules text[] default '{}'::text[],
  add column if not exists pricing_policy text,
  add column if not exists cancellation_policy text;

alter table public.organizations
  add column if not exists description text,
  add column if not exists images text[] default '{}'::text[],
  add column if not exists cover_image text,
  add column if not exists rating numeric default 0.0,
  add column if not exists reviews_count integer default 0;

-- ─── 2. Expenses Table ───────────────────────────────────────────────────────
create table if not exists public.expenses (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  title text not null,
  category text not null,
  amount_paise bigint not null,
  expense_date date default current_date not null,
  payment_mode text not null check (payment_mode in ('cash', 'upi', 'bank_transfer', 'cheque', 'card', 'online')),
  reference_number text,
  notes text,
  receipt_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_expenses_org on public.expenses(org_id);
create index if not exists idx_expenses_date on public.expenses(org_id, expense_date);

create trigger expenses_updated_at before update on public.expenses
  for each row execute function public.update_updated_at();

-- RLS for Expenses
alter table public.expenses enable row level security;

create policy "Users can view org expenses" on public.expenses
  for select using (org_id = public.get_user_org_id());

create policy "Owners, managers and finance can manage expenses" on public.expenses
  for all using (
    org_id = public.get_user_org_id() 
    and exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('owner', 'manager', 'finance')
    )
  );

-- ─── 3. Staff Invites Table ──────────────────────────────────────────────────
create table if not exists public.staff_invites (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  email text not null,
  role text not null check (role in ('manager', 'finance', 'staff')),
  invited_by uuid references public.profiles(id) on delete cascade,
  status text default 'pending' not null check (status in ('pending', 'accepted')),
  created_at timestamptz default now(),
  unique(org_id, email)
);

create index if not exists idx_staff_invites_email on public.staff_invites(email);

-- RLS for Staff Invites
alter table public.staff_invites enable row level security;

create policy "Users can view org invites" on public.staff_invites
  for select using (org_id = public.get_user_org_id());

create policy "Owners and managers can manage invites" on public.staff_invites
  for all using (
    org_id = public.get_user_org_id()
    and exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('owner', 'manager')
    )
  );

-- ─── 4. Re-creation of handle_new_user trigger with Invite Support ───────────
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_org_id uuid;
  v_org_name text;
  v_role text;
  v_invite_record record;
begin
  -- 1. Check if there is an active invite for this email
  select * into v_invite_record 
  from public.staff_invites 
  where email = new.email and status = 'pending' 
  limit 1;

  if v_invite_record.id is not null then
    -- User joined via invitation
    v_org_id := v_invite_record.org_id;
    v_role := v_invite_record.role;
    
    -- Mark invite as accepted
    update public.staff_invites 
    set status = 'accepted' 
    where id = v_invite_record.id;
  else
    -- Standard user sign up (creates new organization as Owner)
    v_org_id := coalesce(
      case 
        when new.raw_user_meta_data is not null and new.raw_user_meta_data ? 'org_id' 
        then (new.raw_user_meta_data->>'org_id')::uuid 
        else null 
      end,
      gen_random_uuid()
    );
    
    v_role := coalesce(
      case 
        when new.raw_user_meta_data is not null and new.raw_user_meta_data ? 'role' 
        then new.raw_user_meta_data->>'role' 
        else null 
      end, 
      'owner'
    );
  end if;

  -- Extract organization name
  v_org_name := coalesce(
    case 
      when new.raw_user_meta_data is not null and new.raw_user_meta_data ? 'org_name' 
      then new.raw_user_meta_data->>'org_name' 
      else null 
    end,
    'My Venue'
  );

  -- Ensure organization exists
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
    v_role
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_catalog;
