-- =============================================================================
-- VenuePro Trial Promo Codes Applied Column
-- =============================================================================

alter table public.organizations
  add column if not exists promo_codes_applied text[] default '{}';
