export const MINING_DURATION_MS = 3 * 60 * 60 * 1000; // one tap = 3 hours of mining
export const MINING_REWARD_PHP = 0.1; // per finished session (= 100 PawCoins)
export const MINING_DAILY_CAP_PHP = 0.3; // daily cap (= 300 PawCoins, 3 sessions)
export const MINING_MAX_SESSIONS = Math.round(MINING_DAILY_CAP_PHP / MINING_REWARD_PHP);

export const todayKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const formatCountdown = (ms: number): string => {
  const t = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
