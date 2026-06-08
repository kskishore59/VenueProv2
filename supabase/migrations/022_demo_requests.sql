-- Create demo_requests table for landing page inquiries
create table if not exists public.demo_requests (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text not null,
  email text,
  venue_name text,
  city text,
  status text default 'pending' check (status in ('pending', 'contacted', 'scheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- Enable Row-Level Security
alter table public.demo_requests enable row level security;

-- Drop existing policies if they exist to prevent duplication
drop policy if exists "Anyone can insert demo requests" on public.demo_requests;
drop policy if exists "Authenticated users can read demo requests" on public.demo_requests;
drop policy if exists "Authenticated users can update demo requests" on public.demo_requests;
drop policy if exists "Super admins can read demo requests" on public.demo_requests;
drop policy if exists "Super admins can update demo requests" on public.demo_requests;
drop policy if exists "Super admins can delete demo requests" on public.demo_requests;

-- Create Policies
create policy "Anyone can insert demo requests" on public.demo_requests
  for insert with check (true);

create policy "Super admins can read demo requests" on public.demo_requests
  for select to authenticated using (
    public.get_user_role() = 'super_admin'
  );

create policy "Super admins can update demo requests" on public.demo_requests
  for update to authenticated using (
    public.get_user_role() = 'super_admin'
  );

create policy "Super admins can delete demo requests" on public.demo_requests
  for delete to authenticated using (
    public.get_user_role() = 'super_admin'
  );
