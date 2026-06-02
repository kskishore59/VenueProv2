-- =============================================================================
-- VenuePro Super Admin Role & Policy Upgrades Migration
-- =============================================================================

-- ─── 1. Update Profiles Role Constraint Check ───────────────────────────────
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check 
  check (role in ('owner', 'manager', 'staff', 'finance', 'super_admin'));

-- ─── 2. Update Row-Level Security Policies for Organizations ────────────────
drop policy if exists "Organizations SELECT RLS" on public.organizations;
create policy "Organizations SELECT RLS" on public.organizations 
  for select using (id = public.get_user_org_id() or public.get_user_role() = 'super_admin');

drop policy if exists "Organizations UPDATE RLS" on public.organizations;
create policy "Organizations UPDATE RLS" on public.organizations 
  for update using (
    (id = public.get_user_org_id() and public.get_user_role() = 'owner') 
    or public.get_user_role() = 'super_admin'
  );

create policy "Organizations INSERT RLS" on public.organizations
  for insert with check (public.get_user_role() = 'super_admin');

-- ─── 3. Update Row-Level Security Policies for Profiles ─────────────────────
drop policy if exists "Profiles SELECT RLS" on public.profiles;
create policy "Profiles SELECT RLS" on public.profiles 
  for select using (org_id = public.get_user_org_id() or public.get_user_role() = 'super_admin');

drop policy if exists "Profiles UPDATE RLS" on public.profiles;
create policy "Profiles UPDATE RLS" on public.profiles 
  for update using (id = auth.uid() or public.get_user_role() = 'super_admin');

create policy "Profiles INSERT RLS" on public.profiles
  for insert with check (public.get_user_role() = 'super_admin');

-- ─── 4. Reconfigure SELECT Permissions on transactional tables for Audit ────
drop policy if exists "Bookings SELECT RLS" on public.bookings;
create policy "Bookings SELECT RLS" on public.bookings 
  for select using (org_id = public.get_user_org_id() or public.get_user_role() = 'super_admin');

drop policy if exists "Payments SELECT RLS" on public.payments;
create policy "Payments SELECT RLS" on public.payments 
  for select using (org_id = public.get_user_org_id() or public.get_user_role() = 'super_admin');

drop policy if exists "Leads SELECT RLS" on public.leads;
create policy "Leads SELECT RLS" on public.leads 
  for select using (org_id = public.get_user_org_id() or public.get_user_role() = 'super_admin');

drop policy if exists "Expenses SELECT RLS" on public.expenses;
create policy "Expenses SELECT RLS" on public.expenses 
  for select using (org_id = public.get_user_org_id() or public.get_user_role() = 'super_admin');

drop policy if exists "Halls SELECT RLS" on public.halls;
create policy "Halls SELECT RLS" on public.halls 
  for select using (org_id = public.get_user_org_id() or public.get_user_role() = 'super_admin');
