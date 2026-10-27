-- For YOU only. Paste into Supabase > SQL Editor and click Run. (Users cannot run these.)

-- 1) All users with their progress, newest activity first
select p.username, p.email, p.balance_php, p.total_earned_php, p.ads_watched_today,
       p.steps_today, p.consecutive_days, p.referral_count, p.updated_at, u.created_at as joined
from public.user_progress p
join auth.users u on u.id = p.user_id
order by p.updated_at desc;

-- 2) Pending cash-outs, with the user's progress next to each request (check before you pay!)
select c.created_at, c.id, c.method, c.account, c.qr_path, c.amount_php, c.user_name, c.user_email,
       p.total_earned_php, p.ads_watched_today, p.consecutive_days
from public.cashout_requests c
left join public.user_progress p on p.user_id = c.user_id
where c.status = 'PENDING'
order by c.created_at;

-- 3) After you send the money, mark it paid (paste the request id between the quotes)
-- update public.cashout_requests set status = 'PAID' where id = 'PASTE-ID-HERE';
