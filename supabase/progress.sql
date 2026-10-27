-- Run ONCE in Supabase > SQL Editor. Stores each user's progress so you can see it, and so
-- users get their balance back after reinstalling the app.

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
