-- Run ONCE in Supabase > SQL Editor. Lets users cash out to ONE (phone number or QR code image).

alter table public.cashout_requests drop constraint if exists cashout_requests_method_check;
alter table public.cashout_requests
  add constraint cashout_requests_method_check check (method in ('GCash','Maya','PayPal','ONE'));
alter table public.cashout_requests add column if not exists qr_path text;

-- Private storage for QR images (max 1 MB, JPEG/PNG only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payout-qr', 'payout-qr', false, 1048576, array['image/jpeg','image/png'])
on conflict (id) do update set public = false, file_size_limit = 1048576, allowed_mime_types = array['image/jpeg','image/png'];

drop policy if exists "upload own qr" on storage.objects;
drop policy if exists "read own qr" on storage.objects;
create policy "upload own qr" on storage.objects for insert to authenticated
  with check (bucket_id = 'payout-qr' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "read own qr" on storage.objects for select to authenticated
  using (bucket_id = 'payout-qr' and (storage.foldername(name))[1] = auth.uid()::text);

-- You view the QR images in: Supabase > Storage > payout-qr > (user id folder)
