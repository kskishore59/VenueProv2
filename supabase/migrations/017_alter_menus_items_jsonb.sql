-- =============================================================================
-- VenuePro Menu Items JSONB Refactoring
-- =============================================================================

do $$
begin
  -- Only perform the refactoring if 'items' exists and is of array type (text[])
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
      and table_name = 'menus' 
      and column_name = 'items'
      and data_type = 'ARRAY'
  ) then
    -- 1. Rename old items column to items_old
    execute 'alter table public.menus rename column items to items_old';
    
    -- 2. Create the new jsonb column
    execute 'alter table public.menus add column items jsonb default ''[]''::jsonb';
    
    -- 3. Migrate data from items_old to items
    execute '
      update public.menus
      set items = (
        select coalesce(
          jsonb_agg(
            jsonb_build_object(
              ''name'', val,
              ''category'', ''Main Course'',
              ''type'', (
                case 
                  when food_type = ''veg'' then ''veg''
                  when food_type = ''non_veg'' then ''non_veg''
                  when food_type = ''jain'' then ''jain''
                  else ''veg''
                end
              ),
              ''description'', '''',
              ''extra_charge_paise'', 0,
              ''spiciness'', ''medium''
            )
          ),
          ''[]''::jsonb
        )
        from unnest(items_old) as val
      )
    ';
    
    -- 4. Drop the old items_old column
    execute 'alter table public.menus drop column items_old';
  else
    -- If 'items' column does not exist at all, make sure it is created as jsonb
    if not exists (
      select 1 from information_schema.columns 
      where table_schema = 'public' 
        and table_name = 'menus' 
        and column_name = 'items'
    ) then
      execute 'alter table public.menus add column items jsonb default ''[]''::jsonb';
    end if;
  end if;
end $$;
