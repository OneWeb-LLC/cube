-- Cube satellite local profile projection.
-- Namespace: cube_* only. Never create ao_* tables from a satellite.
-- Apply in the shared One OS / OWeb Supabase project.

create table if not exists public.cube_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  one_id text,
  display_name text,
  email text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cube_profiles enable row level security;

drop policy if exists cube_profiles_select_own on public.cube_profiles;
create policy cube_profiles_select_own
  on public.cube_profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists cube_profiles_upsert_own on public.cube_profiles;
create policy cube_profiles_upsert_own
  on public.cube_profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists cube_profiles_update_own on public.cube_profiles;
create policy cube_profiles_update_own
  on public.cube_profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
