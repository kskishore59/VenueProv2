-- =============================================================================
-- VenuePro Organization Customizations Migration
-- Add terms_and_conditions column to organizations table
-- =============================================================================

alter table public.organizations add column if not exists terms_and_conditions text;
