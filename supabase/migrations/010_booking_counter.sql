-- =============================================================================
-- VenuePro Sequential Booking Counter Migration
-- =============================================================================

-- ─── 1. Add Counter Column to Organizations Table ───────────────────────────
alter table public.organizations 
  add column if not exists booking_counter integer default 0;

-- ─── 2. Backfill Counter with Existing Bookings count ────────────────────────
update public.organizations o
set booking_counter = coalesce((
  select count(*) 
  from public.bookings b 
  where b.org_id = o.id
), 0);

-- ─── 3. Re-create Booking Number Generator Function ──────────────────────────
create or replace function public.generate_booking_number(p_org_id uuid)
returns text as $$
declare
  v_counter integer;
  v_year text;
begin
  -- Atomically increment counter and lock the organization row to avoid race conditions
  update public.organizations
  set booking_counter = booking_counter + 1
  where id = p_org_id
  returning booking_counter into v_counter;

  v_year := extract(year from now())::text;
  return 'VP-' || v_year || '-' || lpad(v_counter::text, 5, '0');
end;
$$ language plpgsql;
