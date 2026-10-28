-- ============================================================================
-- MoneyPaws: ONE file to set up Supabase. Paste ALL of it in SQL Editor and click Run.
-- Safe to run again at any time (it will not delete your data).
-- ============================================================================

-- ---------- 1) Cash-out requests ----------
create table if not exists public.cashout_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  method text not null,
  account text not null check (length(account) between 5 and 120),
  amount_php numeric not null check (amount_php in (10,20,50,100,500,1000)),
  pawcoins bigint not null,
  user_name text,
  user_email text,
  qr_path text,
  status text not null default 'PENDING' check (status in ('PENDING','PAID','REJECTED')),
  created_at timestamptz not null default now()
);
alter table public.cashout_requests add column if not exists qr_path text;
alter table public.cashout_requests drop constraint if exists cashout_requests_method_check;
alter table public.cashout_requests
  add constraint cashout_requests_method_check check (method in ('GCash','Maya','PayPal','ONE'));
alter table public.cashout_requests enable row level security;
drop policy if exists "insert own requests" on public.cashout_requests;
drop policy if exists "read own requests" on public.cashout_requests;
create policy "insert own requests" on public.cashout_requests
  for insert to authenticated with check (user_id = auth.uid() and status = 'PENDING');
create policy "read own requests" on public.cashout_requests
  for select to authenticated using (user_id = auth.uid());

-- ---------- 2) Profiles + 18+ rule ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  birthdate date not null,
  created_at timestamptz not null default now()
);
create unique index if not exists profiles_username_key on public.profiles (lower(username));
alter table public.profiles enable row level security;
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select to authenticated using (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  dob date;
  uname text;
begin
  begin
    dob := (new.raw_user_meta_data->>'birthdate')::date;
  exception when others then
    dob := null;
  end;
  uname := nullif(trim(new.raw_user_meta_data->>'username'), '');

  if dob is null or dob > (current_date - interval '18 years')::date then
    raise exception 'You must be at least 18 years old to register';
  end if;
  if uname is null or length(uname) < 3 or length(uname) > 24 then
    raise exception 'Username must be 3-24 characters';
  end if;

  insert into public.profiles (id, username, birthdate) values (new.id, uname, dob);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Tells the app the exact reason a sign-up would be refused (age / username taken)
create or replace function public.signup_precheck(p_username text, p_birthdate date)
returns text language plpgsql security definer set search_path = public as $$
begin
  if p_birthdate is null or p_birthdate > (current_date - interval '18 years')::date then
    return 'AGE';
  end if;
  if p_username is null or length(trim(p_username)) < 3 or length(trim(p_username)) > 24 then
    return 'USERNAME_INVALID';
  end if;
  if exists (select 1 from public.profiles where lower(username) = lower(trim(p_username))) then
    return 'USERNAME_TAKEN';
  end if;
  return 'OK';
end $$;
grant execute on function public.signup_precheck(text, date) to anon, authenticated;

-- ---------- 3) User progress (so you can see it, and users keep it after reinstall) ----------
create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text,
  email text,
  balance_php numeric not null default 0 check (balance_php >= 0),
  total_earned_php numeric not null default 0 check (total_earned_php >= 0),
  ads_watched_today int not null default 0,
  steps_today int not null default 0,
  games_played_today int not null default 0,
  tap_mine_count int not null default 0,
  consecutive_days int not null default 0,
  referral_count int not null default 0,
  state jsonb not null default '{}'::jsonb check (pg_column_size(state) < 200000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.user_progress enable row level security;
drop policy if exists "read own progress" on public.user_progress;
drop policy if exists "insert own progress" on public.user_progress;
drop policy if exists "update own progress" on public.user_progress;
create policy "read own progress"   on public.user_progress for select to authenticated using (user_id = auth.uid());
create policy "insert own progress" on public.user_progress for insert to authenticated with check (user_id = auth.uid());
create policy "update own progress" on public.user_progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- 4) Private storage for ONE QR code images ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payout-qr', 'payout-qr', false, 1048576, array['image/jpeg','image/png'])
on conflict (id) do update set public = false, file_size_limit = 1048576, allowed_mime_types = array['image/jpeg','image/png'];

drop policy if exists "upload own qr" on storage.objects;
drop policy if exists "read own qr" on storage.objects;
create policy "upload own qr" on storage.objects for insert to authenticated
  with check (bucket_id = 'payout-qr' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "read own qr" on storage.objects for select to authenticated
  using (bucket_id = 'payout-qr' and (storage.foldername(name))[1] = auth.uid()::text);
