-- =============================================================================
-- VenuePro Phase 2 — Notifications and Feedback Schema Migrations
-- =============================================================================

-- ─── 1. Notifications Table ──────────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null check (type in ('booking_created', 'booking_cancelled', 'payment_due', 'payment_received', 'lead_followup', 'system')),
  is_read boolean default false not null,
  link_to text,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_notifications_org_read on public.notifications(org_id, is_read);
create index if not exists idx_notifications_org_created on public.notifications(org_id, created_at desc);

-- Enable Row Level Security (RLS)
alter table public.notifications enable row level security;

-- RLS Policies
create policy "Users can view org notifications" on public.notifications
  for select using (org_id = public.get_user_org_id());

create policy "Users can update org notifications (mark as read)" on public.notifications
  for update using (org_id = public.get_user_org_id());

create policy "Users can delete org notifications" on public.notifications
  for delete using (org_id = public.get_user_org_id());


-- ─── 2. Feedback Table ───────────────────────────────────────────────────────
create table if not exists public.feedbacks (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  category text not null check (category in ('bug', 'feature_request', 'design', 'other')),
  message text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.feedbacks enable row level security;

-- RLS Policies
create policy "Authenticated users can submit feedback" on public.feedbacks
  for insert with check (auth.uid() = user_id);

create policy "Users can view their own feedback" on public.feedbacks
  for select using (auth.uid() = user_id);
