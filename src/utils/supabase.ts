import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!client) client = createClient(url!, anonKey!);
  return client;
}

/** True while a multi-step auth flow (password reset) is running, so the app doesn't jump ahead. */
let authBusy = false;
export const isAuthBusy = () => authBusy;

export const MIN_AGE = 18;

export function maxBirthdateIso(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - MIN_AGE);
  return d.toISOString().split('T')[0];
}

export function isAtLeast18(birthdateIso: string): boolean {
  const dob = new Date(birthdateIso);
  if (Number.isNaN(dob.getTime())) return false;
  const limit = new Date();
  limit.setHours(0, 0, 0, 0);
  limit.setFullYear(limit.getFullYear() - MIN_AGE);
  return dob.getTime() <= limit.getTime();
}

function friendly(message: string | undefined): string {
  const m = (message || '').toLowerCase();
  if (m.includes('invalid login')) return 'Wrong email or password.';
  if (m.includes('email not confirmed')) return 'Please confirm your email first, then log in.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'That email is already registered. Try logging in.';
  if (m.includes('database error saving new user')) return 'Could not create the account. Check that you are 18+ and the username is not already taken.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Please wait a few minutes and try again.';
  if (m.includes('token') && (m.includes('expired') || m.includes('invalid'))) return 'That code is wrong or expired. Request a new one.';
  if (m.includes('password') && m.includes('characters')) return 'Password must be at least 8 characters.';
  if (m.includes('fetch') || m.includes('network')) return 'No internet connection. Please try again.';
  return message || 'Something went wrong. Please try again.';
}

function need(): SupabaseClient {
  const sb = getSupabase();
  if (!sb) throw new Error('Sign in is not available right now. Please try again later.');
  return sb;
}

export async function signUp(input: { username: string; email: string; password: string; birthdate: string }) {
  const sb = need();
  const { data, error } = await sb.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: { data: { username: input.username.trim(), birthdate: input.birthdate } },
  });
  if (error) throw new Error(friendly(error.message));
  return { needsEmailConfirm: !data.session };
}

export async function signIn(email: string, password: string) {
  const { error } = await need().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(friendly(error.message));
}

export async function signOut() {
  await getSupabase()?.auth.signOut();
}

/** Step 1 of reset: emails a code (see README for the email template change). */
export async function sendResetCode(email: string) {
  const { error } = await need().auth.resetPasswordForEmail(email.trim());
  if (error) throw new Error(friendly(error.message));
}

/** Step 2 of reset: check the emailed code and set the new password. */
export async function resetPasswordWithCode(email: string, code: string, newPassword: string) {
  const sb = need();
  authBusy = true;
  try {
    const { error: vErr } = await sb.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'recovery' });
    if (vErr) throw new Error(friendly(vErr.message));
    const { error: uErr } = await sb.auth.updateUser({ password: newPassword });
    if (uErr) throw new Error(friendly(uErr.message));
  } finally {
    authBusy = false;
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session;
}

export interface CashOutRequestInput {
  method: string;
  account: string;
  amountPhp: number;
  pawcoins: number;
  userName: string;
  userEmail: string;
}

/** Saves a cash-out request. Returns a short reference id. Throws on failure. */
export async function submitCashOutRequest(input: CashOutRequestInput): Promise<string> {
  const sb = need();
  const session = await getCurrentSession();
  if (!session) throw new Error('Please log in again to cash out.');
  const { data, error } = await sb
    .from('cashout_requests')
    .insert({
      method: input.method,
      account: input.account,
      amount_php: input.amountPhp,
      pawcoins: input.pawcoins,
      user_name: input.userName,
      user_email: input.userEmail,
    })
    .select('id')
    .single();
  if (error || !data) throw new Error('Could not submit your request. Please try again.');
  return `MP-${String(data.id).slice(0, 8).toUpperCase()}`;
}
