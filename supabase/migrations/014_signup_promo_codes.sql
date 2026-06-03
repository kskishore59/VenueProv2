-- =============================================================================
-- VenuePro Registration SignUp Promo Codes
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_org_id uuid;
  v_org_name text;
  v_role text;
  v_invite_record record;
  v_promo_code text;
  v_trial_ends timestamptz := now() + interval '14 days';
  v_applied_promos text[] := '{}';
begin
  -- 1. Check if there is an active invite for this email
  select * into v_invite_record 
  from public.staff_invites 
  where email = new.email and status = 'pending' 
  limit 1;

  if v_invite_record.id is not null then
    -- User joined via invitation
    v_org_id := v_invite_record.org_id;
    v_role := v_invite_record.role;
    
    -- Mark invite as accepted
    update public.staff_invites 
    set status = 'accepted' 
    where id = v_invite_record.id;
  else
    -- Standard user sign up (creates new organization as Owner)
    v_org_id := coalesce(
      case 
        when new.raw_user_meta_data is not null and new.raw_user_meta_data ? 'org_id' 
        then (new.raw_user_meta_data->>'org_id')::uuid 
        else null 
      end,
      gen_random_uuid()
    );
    
    v_role := coalesce(
      case 
        when new.raw_user_meta_data is not null and new.raw_user_meta_data ? 'role' 
        then new.raw_user_meta_data->>'role' 
        else null 
      end, 
      'owner'
    );

    -- Extract promo code from raw_user_meta_data
    v_promo_code := case 
      when new.raw_user_meta_data is not null and new.raw_user_meta_data ? 'promo_code' 
      then new.raw_user_meta_data->>'promo_code' 
      else null 
    end;

    if v_promo_code is not null then
      v_promo_code := upper(trim(v_promo_code));
      if v_promo_code = 'TRIAL1M' then
        v_trial_ends := v_trial_ends + interval '1 month';
        v_applied_promos := array[v_promo_code];
      elsif v_promo_code = 'TRIAL2M' then
        v_trial_ends := v_trial_ends + interval '2 months';
        v_applied_promos := array[v_promo_code];
      elsif v_promo_code = 'TRIAL3M' then
        v_trial_ends := v_trial_ends + interval '3 months';
        v_applied_promos := array[v_promo_code];
      end if;
    end if;
  end if;

  -- Extract organization name
  v_org_name := coalesce(
    case 
      when new.raw_user_meta_data is not null and new.raw_user_meta_data ? 'org_name' 
      then new.raw_user_meta_data->>'org_name' 
      else null 
    end,
    'My Venue'
  );

  -- Ensure organization exists with calculated trial date and promo code tracking
  insert into public.organizations (id, name, slug, trial_ends_at, promo_codes_applied)
  values (v_org_id, v_org_name, 'org-' || substring(v_org_id::text from 1 for 8), v_trial_ends, v_applied_promos)
  on conflict (id) do nothing;

  -- Create profile linked to the user and organization
  insert into public.profiles (id, org_id, email, full_name, role)
  values (
    new.id,
    v_org_id,
    new.email,
    coalesce(
      case 
        when new.raw_user_meta_data is not null and new.raw_user_meta_data ? 'full_name' 
        then new.raw_user_meta_data->>'full_name' 
        else null 
      end, 
      split_part(new.email, '@', 1)
    ),
    v_role
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_catalog;
