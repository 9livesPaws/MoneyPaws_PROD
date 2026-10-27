import { UserState, Transaction } from '../types';

const STORAGE_KEY = 'moneypaws_app_state_v2';

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'MINE_TAP',
    amountPhp: 0.15,
    title: 'Tap to Mine - Paw Power Bonus',
    timestamp: Date.now() - 1000 * 60 * 20,
    status: 'COMPLETED',
  },
  {
    id: 'tx-2',
    type: 'DAILY_LOGIN',
    amountPhp: 0.50,
    title: 'Day 1 Daily Login Reward',
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
    status: 'COMPLETED',
  },
];

export const DEFAULT_USER_STATE: UserState = {
  balancePhp: 0.65, // Exactly matching screenshot "₱0.65"
  targetThresholdPhp: 10.00, // Lowest cash-out tier: ₱10 = 10,000 PawCoins
  totalEarnedPhp: 0.65,
  tapMineCount: 14,
  stepsToday: 1240,
  stepsGoal: 5000,
  gamesPlayedToday: 1,
  claimedMissionIds: [],
  minerBatteryPercent: 88,
  minerLastClaimed: Date.now() - 1000 * 60 * 15,
  consecutiveDays: 1,
  lastCheckinDate: '',
  lastLuckyChestDate: '',
  freeSpins: 3,
  freeScratchCards: 3,
  adsWatchedToday: 0,
  referralCode: 'PAW-ANDROID77',
  referralCount: 1,
  referralEarningsPhp: 0.20,
  transactions: INITIAL_TRANSACTIONS,
  tickets: [],
  soundEnabled: true,
  theme: 'slate',
  batterySaver: false,
  personalGoals: [
    { id: 'goal-1', title: 'Drink 8 glasses of water', icon: '💧', rewardPaws: 50, completed: false, streakDays: 4 },
    { id: 'goal-2', title: 'Take a 10-min brisk walk', icon: '👟', rewardPaws: 50, completed: true, streakDays: 7 },
    { id: 'goal-3', title: 'Track daily budget & savings', icon: '📊', rewardPaws: 50, completed: false, streakDays: 3 },
  ],
  triviaAnsweredDate: '',
  unlockedAchievementIds: ['ach-first-step', 'ach-first-mine'],
  userName: 'Paws Explorer',
  userEmail: 'user@moneypaws.com',
};

const keyFor = (userId?: string) => (userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY);

export function hasSavedState(userId?: string): boolean {
  try {
    return localStorage.getItem(keyFor(userId)) !== null;
  } catch {
    return false;
  }
}

export function loadUserState(userId?: string): UserState {
  if (typeof window === 'undefined') return DEFAULT_USER_STATE;
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return DEFAULT_USER_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_USER_STATE,
      ...parsed,
      targetThresholdPhp: DEFAULT_USER_STATE.targetThresholdPhp, // migrate old saved 5.50 target
    };
  } catch (err) {
    console.warn('Failed to load user state from localStorage:', err);
    return DEFAULT_USER_STATE;
  }
}

export function saveUserState(state: UserState, userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save user state:', err);
  }
}

export function formatPhp(amount: number): string {
  // Format matching the screenshot style: ₱0.65
  return `₱${amount.toFixed(2)}`;
}

export function formatPaws(paws: number): string {
  return paws.toLocaleString('en-US');
}

export function formatUsd(paws: number): string {
  const php = paws / 1000;
  return `₱${php.toFixed(2)}`;
}


