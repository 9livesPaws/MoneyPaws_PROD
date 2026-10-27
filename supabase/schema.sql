-- Run this once in Supabase: SQL Editor > New query > paste > Run.
-- Also enable: Authentication > Sign In / Providers > "Allow anonymous sign-ins".

create table if not exists public.cashout_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  method text not null check (method in ('GCash','Maya','PayPal')),
  account text not null check (length(account) between 5 and 120),
  amount_php numeric not null check (amount_php in (10,20,50,100,500,1000)),
  pawcoins bigint not null,
  user_name text,
  user_email text,
  status text not null default 'PENDING' check (status in ('PENDING','PAID','REJECTED')),
  created_at timestamptz not null default now()
);

alter table public.cashout_requests enable row level security;

-- Users can create requests for themselves and see only their own.
-- They cannot edit or delete. You change status from the Supabase dashboard (service role).
create policy "insert own requests" on public.cashout_requests
  for insert to authenticated with check (user_id = auth.uid() and status = 'PENDING');
create policy "read own requests" on public.cashout_requests
  for select to authenticated using (user_id = auth.uid());
