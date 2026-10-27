-- Run ONCE in Supabase > SQL Editor (after schema.sql). Adds user profiles and enforces 18+ on the server.

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
