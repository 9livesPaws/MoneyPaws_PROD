import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;
function getClient(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!client) client = createClient(url!, anonKey!);
  return client;
}

/** Each install signs in anonymously so requests are tied to a stable device user id. */
async function ensureUser(sb: SupabaseClient): Promise<string> {
  const { data } = await sb.auth.getSession();
  if (data.session?.user) return data.session.user.id;
  const { data: anon, error } = await sb.auth.signInAnonymously();
  if (error || !anon.user) throw new Error(error?.message || 'Could not start session');
  return anon.user.id;
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
  const sb = getClient();
  if (!sb) throw new Error('Cash out is not available right now. Please try again later.');
  await ensureUser(sb);
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
