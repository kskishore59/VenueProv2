-- =============================================================================
-- VenuePro Concurrency & Database Query Indexing Optimizations
-- =============================================================================

-- ─── 1. Enable Concurrency Range Extensions ────────────────────────────────
create extension if not exists btree_gist;

-- ─── 2. Enforce Double-Booking Exclusion Constraint ───────────────────────
-- Guarantees at the database level that no overlapping active bookings can 
-- exist for the same hall on the same date.
alter table public.bookings add constraint bookings_no_overlap exclude using gist (
  hall_id with =,
  event_date with =,
  tsrange(
    (event_date + start_time), 
    (event_date + end_time)
  ) with &&
) where (status != 'cancelled');

-- ─── 3. Query Indexing Optimizations ───────────────────────────────────────
-- Index for calendar day queries & dashboard listings
create index if not exists idx_bookings_org_date on public.bookings(org_id, event_date);

-- Indexes for foreign-key joins to prevent full table scans
create index if not exists idx_bookings_hall on public.bookings(hall_id);
create index if not exists idx_bookings_customer on public.bookings(customer_id);
create index if not exists idx_payments_booking on public.payments(booking_id);

-- Composite index for lead pipeline stage views
create index if not exists idx_leads_org_status on public.leads(org_id, status);

