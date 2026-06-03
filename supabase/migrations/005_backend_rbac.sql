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
drop policy if exists "Organizations SELECT RLS" on public.organizations;
create policy "Organizations SELECT RLS" on public.organizations
  for select using (id = public.get_user_org_id());
drop policy if exists "Organizations UPDATE RLS" on public.organizations;
create policy "Organizations UPDATE RLS" on public.organizations
  for update using (id = public.get_user_org_id() and public.get_user_role() = 'owner');

-- Profiles
drop policy if exists "Profiles SELECT RLS" on public.profiles;
create policy "Profiles SELECT RLS" on public.profiles
  for select using (org_id = public.get_user_org_id());
drop policy if exists "Profiles UPDATE RLS" on public.profiles;
create policy "Profiles UPDATE RLS" on public.profiles
  for update using (id = auth.uid());

-- Halls
drop policy if exists "Halls SELECT RLS" on public.halls;
create policy "Halls SELECT RLS" on public.halls
  for select using (org_id = public.get_user_org_id());
drop policy if exists "Halls INSERT/UPDATE/DELETE RLS" on public.halls;
create policy "Halls INSERT/UPDATE/DELETE RLS" on public.halls
  for all using (
    org_id = public.get_user_org_id() 
    and (public.get_user_role() in ('owner', 'manager') or public.check_user_permission('settings', 'update'))
  );

-- Customers
drop policy if exists "Customers SELECT RLS" on public.customers;
create policy "Customers SELECT RLS" on public.customers
  for select using (org_id = public.get_user_org_id() and public.check_user_permission('customers', 'read'));
drop policy if exists "Customers INSERT RLS" on public.customers;
create policy "Customers INSERT RLS" on public.customers
  for insert with check (org_id = public.get_user_org_id() and public.check_user_permission('customers', 'create'));
drop policy if exists "Customers UPDATE RLS" on public.customers;
create policy "Customers UPDATE RLS" on public.customers
  for update using (org_id = public.get_user_org_id() and public.check_user_permission('customers', 'update'));
drop policy if exists "Customers DELETE RLS" on public.customers;
create policy "Customers DELETE RLS" on public.customers
  for delete using (org_id = public.get_user_org_id() and public.check_user_permission('customers', 'delete'));

-- Bookings
drop policy if exists "Bookings SELECT RLS" on public.bookings;
create policy "Bookings SELECT RLS" on public.bookings
  for select using (org_id = public.get_user_org_id() and public.check_user_permission('bookings', 'read'));
drop policy if exists "Bookings INSERT RLS" on public.bookings;
create policy "Bookings INSERT RLS" on public.bookings
  for insert with check (org_id = public.get_user_org_id() and public.check_user_permission('bookings', 'create'));
drop policy if exists "Bookings UPDATE RLS" on public.bookings;
create policy "Bookings UPDATE RLS" on public.bookings
  for update using (org_id = public.get_user_org_id() and public.check_user_permission('bookings', 'update'));
drop policy if exists "Bookings DELETE RLS" on public.bookings;
create policy "Bookings DELETE RLS" on public.bookings
  for delete using (org_id = public.get_user_org_id() and public.check_user_permission('bookings', 'delete'));

-- Payments
drop policy if exists "Payments SELECT RLS" on public.payments;
create policy "Payments SELECT RLS" on public.payments
  for select using (org_id = public.get_user_org_id() and public.check_user_permission('payments', 'read'));
drop policy if exists "Payments INSERT RLS" on public.payments;
create policy "Payments INSERT RLS" on public.payments
  for insert with check (org_id = public.get_user_org_id() and public.check_user_permission('payments', 'create'));
drop policy if exists "Payments UPDATE RLS" on public.payments;
create policy "Payments UPDATE RLS" on public.payments
  for update using (org_id = public.get_user_org_id() and public.check_user_permission('payments', 'update'));
drop policy if exists "Payments DELETE RLS" on public.payments;
create policy "Payments DELETE RLS" on public.payments
  for delete using (org_id = public.get_user_org_id() and public.check_user_permission('payments', 'delete'));

-- Leads
drop policy if exists "Leads SELECT RLS" on public.leads;
create policy "Leads SELECT RLS" on public.leads
  for select using (org_id = public.get_user_org_id() and public.check_user_permission('leads', 'read'));
drop policy if exists "Leads INSERT RLS" on public.leads;
create policy "Leads INSERT RLS" on public.leads
  for insert with check (org_id = public.get_user_org_id() and public.check_user_permission('leads', 'create'));
drop policy if exists "Leads UPDATE RLS" on public.leads;
create policy "Leads UPDATE RLS" on public.leads
  for update using (org_id = public.get_user_org_id() and public.check_user_permission('leads', 'update'));
drop policy if exists "Leads DELETE RLS" on public.leads;
create policy "Leads DELETE RLS" on public.leads
  for delete using (org_id = public.get_user_org_id() and public.check_user_permission('leads', 'delete'));

-- Expenses
drop policy if exists "Expenses SELECT RLS" on public.expenses;
create policy "Expenses SELECT RLS" on public.expenses
  for select using (org_id = public.get_user_org_id() and public.check_user_permission('expenses', 'read'));
drop policy if exists "Expenses INSERT RLS" on public.expenses;
create policy "Expenses INSERT RLS" on public.expenses
  for insert with check (org_id = public.get_user_org_id() and public.check_user_permission('expenses', 'create'));
drop policy if exists "Expenses UPDATE RLS" on public.expenses;
create policy "Expenses UPDATE RLS" on public.expenses
  for update using (org_id = public.get_user_org_id() and public.check_user_permission('expenses', 'update'));
drop policy if exists "Expenses DELETE RLS" on public.expenses;
create policy "Expenses DELETE RLS" on public.expenses
  for delete using (org_id = public.get_user_org_id() and public.check_user_permission('expenses', 'delete'));

-- Staff Invites
drop policy if exists "Invites SELECT RLS" on public.staff_invites;
create policy "Invites SELECT RLS" on public.staff_invites
  for select using (org_id = public.get_user_org_id());
drop policy if exists "Invites ALL RLS" on public.staff_invites;
create policy "Invites ALL RLS" on public.staff_invites
  for all using (org_id = public.get_user_org_id() and public.get_user_role() in ('owner', 'manager'));

-- Notifications
drop policy if exists "Notifications SELECT RLS" on public.notifications;
create policy "Notifications SELECT RLS" on public.notifications
  for select using (org_id = public.get_user_org_id());
drop policy if exists "Notifications UPDATE RLS" on public.notifications;
create policy "Notifications UPDATE RLS" on public.notifications
  for update using (org_id = public.get_user_org_id());
drop policy if exists "Notifications DELETE RLS" on public.notifications;
create policy "Notifications DELETE RLS" on public.notifications
  for delete using (org_id = public.get_user_org_id());

-- Feedbacks
drop policy if exists "Feedbacks INSERT RLS" on public.feedbacks;
create policy "Feedbacks INSERT RLS" on public.feedbacks
  for insert with check (auth.uid() = user_id);
drop policy if exists "Feedbacks SELECT RLS" on public.feedbacks;
create policy "Feedbacks SELECT RLS" on public.feedbacks
  for select using (auth.uid() = user_id);
