-- ============================================================
-- SABHAL - Healthcare AI App
-- Supabase Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role text not null check (role in ('patient', 'doctor')),
  full_name text,
  created_at timestamp with time zone default now()
);

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Doctors can view all profiles (for patient lookup)
create policy "Doctors can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor'
    )
  );

-- ============================================================
-- CASES TABLE
-- ============================================================
create table public.cases (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,

  -- Patient Details
  patient_name text not null,
  age integer not null,
  gender text not null check (gender in ('male', 'female', 'other')),
  blood_group text not null,
  allergies text default '',

  -- Symptoms
  symptoms text not null,
  duration text not null,
  severity text not null check (severity in ('mild', 'moderate', 'severe')),

  -- AI Output
  ai_summary text,
  urgency_level text check (urgency_level in ('LOW', 'MEDIUM', 'HIGH')),
  recommendations text,

  -- Case Status
  status text not null default 'pending' check (status in ('pending', 'under_review', 'resolved')),

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS
alter table public.cases enable row level security;

-- Patients can only see their own cases
create policy "Patients can view own cases"
  on public.cases for select
  using (auth.uid() = patient_id);

-- Patients can insert their own cases
create policy "Patients can insert own cases"
  on public.cases for insert
  with check (auth.uid() = patient_id);

-- Patients can update their own cases (for AI result population)
create policy "Patients can update own cases"
  on public.cases for update
  using (auth.uid() = patient_id);

-- Doctors can view all cases
create policy "Doctors can view all cases"
  on public.cases for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor'
    )
  );

-- Doctors can update case status
create policy "Doctors can update case status"
  on public.cases for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'doctor'
    )
  );

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cases_updated_at
  before update on public.cases
  for each row execute procedure handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'patient'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();