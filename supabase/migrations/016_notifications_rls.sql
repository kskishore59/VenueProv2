-- =============================================================================
-- VenuePro Notifications Row-Level Security Upgrades
-- =============================================================================

-- Drop existing policies if they exist
drop policy if exists "Users can view org notifications" on public.notifications;
drop policy if exists "Users can update org notifications (mark as read)" on public.notifications;
drop policy if exists "Users can delete org notifications" on public.notifications;
drop policy if exists "Users can insert org notifications" on public.notifications;
drop policy if exists "Notifications SELECT RLS" on public.notifications;
drop policy if exists "Notifications INSERT RLS" on public.notifications;
drop policy if exists "Notifications UPDATE RLS" on public.notifications;
drop policy if exists "Notifications DELETE RLS" on public.notifications;

-- Create comprehensive security policies for notifications
create policy "Notifications SELECT RLS" on public.notifications
  for select using (org_id = public.get_user_org_id() or public.get_user_role() = 'super_admin');

create policy "Notifications INSERT RLS" on public.notifications
  for insert with check (org_id = public.get_user_org_id() or public.get_user_role() = 'super_admin');

create policy "Notifications UPDATE RLS" on public.notifications
  for update using (org_id = public.get_user_org_id() or public.get_user_role() = 'super_admin');

create policy "Notifications DELETE RLS" on public.notifications
  for delete using (org_id = public.get_user_org_id() or public.get_user_role() = 'super_admin');
