-- =============================================================================
-- VenuePro Phase 1 Performance & Security & Lead Widget Integration
-- =============================================================================

-- ─── 1. JWT RLS Caching Optimization ─────────────────────────────────────────
create or replace function public.get_user_org_id()
returns uuid as $$
declare
  v_claims jsonb;
  v_org_id text;
begin
  -- Attempt to extract org_id from JWT claims to prevent recursive profiles table scans
  begin
    v_claims := current_setting('request.jwt.claims', true)::jsonb;
    if v_claims is not null then
      v_org_id := v_claims -> 'user_metadata' ->> 'org_id';
      if v_org_id is not null and v_org_id <> '' then
        return v_org_id::uuid;
      end if;
    end if;
  exception when others then
    -- Handle case where current_setting fails (e.g. executing in sql runner without request)
  end;

  -- Fallback to database scan
  return (select org_id from public.profiles where id = auth.uid());
end;
$$ language plpgsql security definer stable set search_path = public;

create or replace function public.get_user_role()
returns text as $$
declare
  v_claims jsonb;
  v_role text;
begin
  -- Attempt to extract role from JWT claims to bypass profiles scan
  begin
    v_claims := current_setting('request.jwt.claims', true)::jsonb;
    if v_claims is not null then
      v_role := v_claims -> 'user_metadata' ->> 'role';
      if v_role is not null and v_role <> '' then
        return v_role;
      end if;
    end if;
  exception when others then
  end;

  -- Fallback to database scan
  return coalesce(
    (select role from public.profiles where id = auth.uid()),
    'staff'
  );
end;
$$ language plpgsql security definer stable set search_path = public;

-- ─── 2. Update New User Trigger to Sync Auth metadata ────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_org_id uuid;
  v_org_name text;
  v_role text;
begin
  -- Safely extract org_id or generate a new UUID
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

  v_role := coalesce(
    case 
      when new.raw_user_meta_data is not null and new.raw_user_meta_data ? 'role' 
      then new.raw_user_meta_data->>'role' 
      else null 
    end, 
    'owner'
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
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    v_role
  );

  -- Sync back org_id and role to raw_user_meta_data inside auth.users so they cache in the JWT
  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || 
                           jsonb_build_object('org_id', v_org_id, 'role', v_role)
  where id = new.id;

  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_catalog;

-- Backfill existing auth.users raw_user_meta_data
update auth.users u
set raw_user_meta_data = coalesce(u.raw_user_meta_data, '{}'::jsonb) || 
                         jsonb_build_object('org_id', p.org_id, 'role', p.role)
from public.profiles p
where p.id = u.id 
  and (u.raw_user_meta_data is null 
       or not (u.raw_user_meta_data ? 'org_id') 
       or not (u.raw_user_meta_data ? 'role'));

-- ─── 3. Soft Deletes Integration ─────────────────────────────────────────────
alter table public.bookings add column if not exists deleted_at timestamptz default null;
alter table public.payments add column if not exists deleted_at timestamptz default null;
alter table public.expenses add column if not exists deleted_at timestamptz default null;
alter table public.leads add column if not exists deleted_at timestamptz default null;
alter table public.customers add column if not exists deleted_at timestamptz default null;

-- Re-create Bookings policies to exclude soft-deleted records
drop policy if exists "Bookings SELECT RLS" on public.bookings;
create policy "Bookings SELECT RLS" on public.bookings
  for select using (org_id = public.get_user_org_id() and public.check_user_permission('bookings', 'read') and deleted_at is null);

drop policy if exists "Bookings UPDATE RLS" on public.bookings;
create policy "Bookings UPDATE RLS" on public.bookings
  for update using (org_id = public.get_user_org_id() and public.check_user_permission('bookings', 'update') and deleted_at is null);

-- Re-create Payments policies
drop policy if exists "Payments SELECT RLS" on public.payments;
create policy "Payments SELECT RLS" on public.payments
  for select using (org_id = public.get_user_org_id() and public.check_user_permission('payments', 'read') and deleted_at is null);

drop policy if exists "Payments UPDATE RLS" on public.payments;
create policy "Payments UPDATE RLS" on public.payments
  for update using (org_id = public.get_user_org_id() and public.check_user_permission('payments', 'update') and deleted_at is null);

-- Re-create Expenses policies
drop policy if exists "Expenses SELECT RLS" on public.expenses;
create policy "Expenses SELECT RLS" on public.expenses
  for select using (org_id = public.get_user_org_id() and public.check_user_permission('expenses', 'read') and deleted_at is null);

drop policy if exists "Expenses UPDATE RLS" on public.expenses;
create policy "Expenses UPDATE RLS" on public.expenses
  for update using (org_id = public.get_user_org_id() and public.check_user_permission('expenses', 'update') and deleted_at is null);

-- Re-create Leads policies to support public submissions & exclude deleted
drop policy if exists "Leads SELECT RLS" on public.leads;
create policy "Leads SELECT RLS" on public.leads
  for select using (org_id = public.get_user_org_id() and public.check_user_permission('leads', 'read') and deleted_at is null);

drop policy if exists "Leads UPDATE RLS" on public.leads;
create policy "Leads UPDATE RLS" on public.leads
  for update using (org_id = public.get_user_org_id() and public.check_user_permission('leads', 'update') and deleted_at is null);

-- Re-create Customers policies
drop policy if exists "Customers SELECT RLS" on public.customers;
create policy "Customers SELECT RLS" on public.customers
  for select using (org_id = public.get_user_org_id() and public.check_user_permission('customers', 'read') and deleted_at is null);

drop policy if exists "Customers UPDATE RLS" on public.customers;
create policy "Customers UPDATE RLS" on public.customers
  for update using (org_id = public.get_user_org_id() and public.check_user_permission('customers', 'update') and deleted_at is null);

-- ─── 4. Transaction Audit Logging ────────────────────────────────────────────
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid,
  table_name text not null,
  record_id uuid not null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz default now()
);

-- Enable RLS for audit logs
alter table public.audit_logs enable row level security;

drop policy if exists "Audit logs SELECT RLS" on public.audit_logs;
create policy "Audit logs SELECT RLS" on public.audit_logs
  for select using (org_id = public.get_user_org_id() and public.get_user_role() in ('owner', 'manager'));

-- Audit trigger function
create or replace function public.audit_trigger_func()
returns trigger as $$
declare
  v_org_id uuid;
  v_user_id uuid := auth.uid();
begin
  if TG_OP = 'DELETE' then
    v_org_id := old.org_id;
  else
    v_org_id := new.org_id;
  end if;

  insert into public.audit_logs (
    org_id, user_id, table_name, record_id, action, old_data, new_data
  )
  values (
    v_org_id,
    v_user_id,
    TG_TABLE_NAME,
    case when TG_OP = 'DELETE' then old.id else new.id end,
    TG_OP,
    case when TG_OP = 'INSERT' then null else to_jsonb(old) end,
    case when TG_OP = 'DELETE' then null else to_jsonb(new) end
  );
  
  if TG_OP = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$ language plpgsql security definer set search_path = public;

-- Attach audit trigger to bookings, payments, expenses
drop trigger if exists audit_bookings_trigger on public.bookings;
create trigger audit_bookings_trigger
  after insert or update or delete on public.bookings
  for each row execute function public.audit_trigger_func();

drop trigger if exists audit_payments_trigger on public.payments;
create trigger audit_payments_trigger
  after insert or update or delete on public.payments
  for each row execute function public.audit_trigger_func();

drop trigger if exists audit_expenses_trigger on public.expenses;
create trigger audit_expenses_trigger
  after insert or update or delete on public.expenses
  for each row execute function public.audit_trigger_func();

-- ─── 5. Public Lead Inquiry Widget Insertion Policy ──────────────────────────
drop policy if exists "Leads INSERT RLS" on public.leads;
create policy "Leads INSERT RLS" on public.leads
  for insert with check (
    (org_id = public.get_user_org_id() and public.check_user_permission('leads', 'create'))
    or 
    (auth.uid() is null and exists (select 1 from public.organizations where id = org_id))
  );
