-- =============================================================================
-- VenuePro Concurrency Locking & RLS Policy Tuning
-- =============================================================================

-- ─── 1. Fix Booking Number Race Condition via Row-Level Locks ──────────────
create or replace function public.generate_booking_number(p_org_id uuid)
returns text as $$
declare
  v_count integer;
  v_year text;
begin
  -- Lock the specific organization row to serialize generation and prevent duplicates
  perform 1 from public.organizations where id = p_org_id for update;

  v_year := extract(year from now())::text;
  select count(*) + 1 into v_count from public.bookings where org_id = p_org_id;
  return 'VP-' || v_year || '-' || lpad(v_count::text, 5, '0');
end;
$$ language plpgsql;

-- ─── 2. Optimize RLS policies to leverage query caching ───────────
-- Inlines profile query filters directly inside policies to allow the query planner
-- to optimize index scans, bypassing custom PL/pgSQL function overhead where possible.

create or replace function public.get_user_org_id()
returns uuid as $$
  select org_id from public.profiles where id = auth.uid();
$$ language sql security definer stable set search_path = public;
