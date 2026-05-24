-- =============================================================================
-- VenuePro Backend Role-Based Access Control (RBAC) Migration
-- =============================================================================

-- ─── 1. Helper Functions for RBAC ──────────────────────────────────────────

create or replace function public.get_user_role()
returns text as $$
declare
  v_role text;
begin
  select role into v_role from public.profiles where id = auth.uid();
  return coalesce(v_role, 'staff'); -- default to staff if no profile
end;
$$ language plpgsql security definer stable;

create or replace function public.check_user_permission(p_resource text, p_action text)
returns boolean as $$
declare
  v_role text;
  v_org_id uuid;
  v_settings jsonb;
  v_custom_val jsonb;
  v_default boolean := false;
begin
  -- Get user profile role and org_id
  select role, org_id into v_role, v_org_id from public.profiles where id = auth.uid();
  
  if v_role is null then
    return false;
  end if;
  
  if v_role = 'owner' then
    return true;
  end if;

  -- 1. Try to fetch custom settings from organization
  select settings into v_settings from public.organizations where id = v_org_id;
  if v_settings is not null then
    v_custom_val := v_settings -> 'permissions' -> v_role -> p_resource -> p_action;
    if v_custom_val is not null then
      return v_custom_val::boolean;
    end if;
  end if;

  -- 2. Fallback to hardcoded defaults
  if v_role = 'manager' then
    if p_resource = 'bookings' then
      if p_action = 'read' or p_action = 'create' or p_action = 'update' then v_default := true; end if;
    elsif p_resource = 'payments' then
      if p_action = 'read' then v_default := true; end if;
    elsif p_resource = 'leads' then
      if p_action = 'read' or p_action = 'create' or p_action = 'update' or p_action = 'delete' then v_default := true; end if;
    elsif p_resource = 'customers' then
      if p_action = 'read' or p_action = 'create' or p_action = 'update' then v_default := true; end if;
    elsif p_resource = 'settings' then
      if p_action = 'read' then v_default := true; end if;
    end if;
  elsif v_role = 'finance' then
    if p_resource = 'bookings' then
      if p_action = 'read' then v_default := true; end if;
    elsif p_resource = 'payments' then
      if p_action = 'read' or p_action = 'create' or p_action = 'update' or p_action = 'delete' then v_default := true; end if;
    elsif p_resource = 'customers' then
      if p_action = 'read' then v_default := true; end if;
    elsif p_resource = 'expenses' then
      if p_action = 'read' or p_action = 'create' or p_action = 'update' or p_action = 'delete' then v_default := true; end if;
    end if;
  elsif v_role = 'staff' then
    if p_resource = 'bookings' then
      if p_action = 'read' then v_default := true; end if;
    elsif p_resource = 'customers' then
      if p_action = 'read' then v_default := true; end if;
    end if;
  end if;

  return v_default;
end;
$$ language plpgsql security definer stable;

-- ─── 2. Drop Legacy Policies ───────────────────────────────────────────────

-- Organizations
drop policy if exists "Users can view their org" on public.organizations;
drop policy if exists "Owners can update their org" on public.organizations;

-- Profiles
drop policy if exists "Users can view org profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- Halls
drop policy if exists "Users can view org halls" on public.halls;
drop policy if exists "Owners/managers can manage halls" on public.halls;

-- Customers
drop policy if exists "Users can view org customers" on public.customers;
drop policy if exists "Users can manage org customers" on public.customers;

-- Bookings
drop policy if exists "Users can view org bookings" on public.bookings;
drop policy if exists "Users can manage org bookings" on public.bookings;

-- Payments
drop policy if exists "Users can view org payments" on public.payments;
drop policy if exists "Users can manage org payments" on public.payments;

-- Leads
drop policy if exists "Users can view org leads" on public.leads;
drop policy if exists "Users can manage org leads" on public.leads;

-- Expenses
drop policy if exists "Users can view org expenses" on public.expenses;
drop policy if exists "Owners, managers and finance can manage expenses" on public.expenses;

-- Staff Invites
drop policy if exists "Users can view org invites" on public.staff_invites;
drop policy if exists "Owners and managers can manage invites" on public.staff_invites;

-- Notifications
drop policy if exists "Users can view org notifications" on public.notifications;
drop policy if exists "Users can update org notifications (mark as read)" on public.notifications;
drop policy if exists "Users can delete org notifications" on public.notifications;

-- Feedbacks
drop policy if exists "Authenticated users can submit feedback" on public.feedbacks;
drop policy if exists "Users can view their own feedback" on public.feedbacks;

-- ─── 3. Re-create Granular Backend RBAC Policies ───────────────────────────

-- Organizations
create policy "Organizations SELECT RLS" on public.organizations
  for select using (id = public.get_user_org_id());
create policy "Organizations UPDATE RLS" on public.organizations
  for update using (id = public.get_user_org_id() and public.get_user_role() = 'owner');

-- Profiles
create policy "Profiles SELECT RLS" on public.profiles
  for select using (org_id = public.get_user_org_id());
create policy "Profiles UPDATE RLS" on public.profiles
  for update using (id = auth.uid());

-- Halls
create policy "Halls SELECT RLS" on public.halls
  for select using (org_id = public.get_user_org_id());
create policy "Halls INSERT/UPDATE/DELETE RLS" on public.halls
  for all using (
    org_id = public.get_user_org_id() 
    and (public.get_user_role() in ('owner', 'manager') or public.check_user_permission('settings', 'update'))
  );

-- Customers
create policy "Customers SELECT RLS" on public.customers
  for select using (org_id = public.get_user_org_id() and public.check_user_permission('customers', 'read'));
create policy "Customers INSERT RLS" on public.customers
  for insert with check (org_id = public.get_user_org_id() and public.check_user_permission('customers', 'create'));
create policy "Customers UPDATE RLS" on public.customers
  for update using (org_id = public.get_user_org_id() and public.check_user_permission('customers', 'update'));
create policy "Customers DELETE RLS" on public.customers
  for delete using (org_id = public.get_user_org_id() and public.check_user_permission('customers', 'delete'));

-- Bookings
create policy "Bookings SELECT RLS" on public.bookings
  for select using (org_id = public.get_user_org_id() and public.check_user_permission('bookings', 'read'));
create policy "Bookings INSERT RLS" on public.bookings
  for insert with check (org_id = public.get_user_org_id() and public.check_user_permission('bookings', 'create'));
create policy "Bookings UPDATE RLS" on public.bookings
  for update using (org_id = public.get_user_org_id() and public.check_user_permission('bookings', 'update'));
create policy "Bookings DELETE RLS" on public.bookings
  for delete using (org_id = public.get_user_org_id() and public.check_user_permission('bookings', 'delete'));

-- Payments
create policy "Payments SELECT RLS" on public.payments
  for select using (org_id = public.get_user_org_id() and public.check_user_permission('payments', 'read'));
create policy "Payments INSERT RLS" on public.payments
  for insert with check (org_id = public.get_user_org_id() and public.check_user_permission('payments', 'create'));
create policy "Payments UPDATE RLS" on public.payments
  for update using (org_id = public.get_user_org_id() and public.check_user_permission('payments', 'update'));
create policy "Payments DELETE RLS" on public.payments
  for delete using (org_id = public.get_user_org_id() and public.check_user_permission('payments', 'delete'));

-- Leads
create policy "Leads SELECT RLS" on public.leads
  for select using (org_id = public.get_user_org_id() and public.check_user_permission('leads', 'read'));
create policy "Leads INSERT RLS" on public.leads
  for insert with check (org_id = public.get_user_org_id() and public.check_user_permission('leads', 'create'));
create policy "Leads UPDATE RLS" on public.leads
  for update using (org_id = public.get_user_org_id() and public.check_user_permission('leads', 'update'));
create policy "Leads DELETE RLS" on public.leads
  for delete using (org_id = public.get_user_org_id() and public.check_user_permission('leads', 'delete'));

-- Expenses
create policy "Expenses SELECT RLS" on public.expenses
  for select using (org_id = public.get_user_org_id() and public.check_user_permission('expenses', 'read'));
create policy "Expenses INSERT RLS" on public.expenses
  for insert with check (org_id = public.get_user_org_id() and public.check_user_permission('expenses', 'create'));
create policy "Expenses UPDATE RLS" on public.expenses
  for update using (org_id = public.get_user_org_id() and public.check_user_permission('expenses', 'update'));
create policy "Expenses DELETE RLS" on public.expenses
  for delete using (org_id = public.get_user_org_id() and public.check_user_permission('expenses', 'delete'));

-- Staff Invites
create policy "Invites SELECT RLS" on public.staff_invites
  for select using (org_id = public.get_user_org_id());
create policy "Invites ALL RLS" on public.staff_invites
  for all using (org_id = public.get_user_org_id() and public.get_user_role() in ('owner', 'manager'));

-- Notifications
create policy "Notifications SELECT RLS" on public.notifications
  for select using (org_id = public.get_user_org_id());
create policy "Notifications UPDATE RLS" on public.notifications
  for update using (org_id = public.get_user_org_id());
create policy "Notifications DELETE RLS" on public.notifications
  for delete using (org_id = public.get_user_org_id());

-- Feedbacks
create policy "Feedbacks INSERT RLS" on public.feedbacks
  for insert with check (auth.uid() = user_id);
create policy "Feedbacks SELECT RLS" on public.feedbacks
  for select using (auth.uid() = user_id);
