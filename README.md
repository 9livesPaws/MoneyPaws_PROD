# MoneyPaws

React + Vite app. Cash out: GCash, Maya, PayPal (ONE shown as a registration note).
Tiers: ₱10 = 10,000 PawCoins ... ₱1,000 = 1,000,000 PawCoins (1 PawCoin = ₱0.001).

## Run (web preview)
    npm install
    npm run dev

On web, "Watch & Earn" shows a labelled preview ad. AdMob only works in the native Android app.

## Build the APK on GitHub
1. Supabase setup (once):
   - SQL Editor: run `supabase/schema.sql`, then `supabase/auth_setup.sql` (profiles + server-side 18+ check).
   - SQL Editor: also run `supabase/one_wallet.sql` (ONE wallet + QR uploads).
   - SQL Editor: also run `supabase/progress.sql` (saves each user's progress so you can see it).
   - Authentication > Sign In / Providers: turn **Allow anonymous sign-ins OFF**.
   - Authentication > Sign In / Providers > Email: turn **Confirm email OFF** for now
     (confirmation links need a web page to land on; add one before Play Store).
   - Authentication > Emails > Templates > **Reset password**: replace the body with
     `<h2>Reset your MoneyPaws password</h2><p>Your code: <b>{{ .Token }}</b></p>`
     so users can type the code in the app (no web link needed).
2. GitHub repo > Settings > Secrets and variables > Actions > New repository secret:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Supabase > Project Settings > API; use the anon/public key, never service_role)
   - For real ads only: `ADMOB_APP_ID` (AdMob > Apps > App settings, looks like ca-app-pub-...~...),
     `ADMOB_REWARDED_ID` (the "Video Rewards" unit) and `ADMOB_BANNER_ID` (the "Bottom Banner" unit).
     Copy each with the copy button in AdMob; do not retype. (The Interstitial unit is not used by the app yet.)
3. Repo > Actions > "Build Android APK" > Run workflow
   (leave production_ads = false first to check with Google test ads).
4. When it finishes, download `moneypaws-apk` from the run's Artifacts and install `app-debug.apk` on a phone.

Never tap live ads on your own phone (AdMob can ban the account). Use production_ads = true only for the APK you give to users.
The APK is debug-signed, fine for sideloading. Google Play needs a release-signed AAB later.

## Payouts
Requests land in the `cashout_requests` table (status PENDING). Open Supabase > Table Editor, send the money yourself
via GCash/Maya/PayPal, then set status to PAID. Users cannot edit requests.

## Checking users and paying
Supabase > Table Editor > `user_progress` shows each user's balance and activity.
Supabase > SQL Editor: paste queries from `supabase/admin_queries.sql` (user list, pending cash-outs with progress, mark as paid).
