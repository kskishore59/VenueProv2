-- =============================================================================
-- VenuePro Trial & Subscriptions Migration
-- =============================================================================

-- Add subscription and trial fields to organizations table
alter table public.organizations 
  add column if not exists trial_ends_at timestamptz default (now() + interval '14 days'),
  add column if not exists subscription_status text default 'trial' check (subscription_status in ('trial', 'active', 'past_due', 'canceled', 'expired'));

-- Adjust default plan to 'pro' for new registrations (so they trial the Pro features)
alter table public.organizations 
  alter column plan set default 'pro';

-- Backfill existing organizations to have pro plan with trial ending 14 days from their creation
update public.organizations
set 
  plan = coalesce(plan, 'pro'),
  subscription_status = coalesce(subscription_status, 'trial'),
  trial_ends_at = coalesce(trial_ends_at, created_at + interval '14 days')
where trial_ends_at is null;
