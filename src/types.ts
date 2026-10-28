export interface MiningRig {
  id: string;
  name: string;
  pawsPerHour: number;
  costPhp: number;
  level: number;
  icon: string;
  description: string;
  unlocked: boolean;
}

export interface StepMilestone {
  steps: number;
  phpReward: number;
  claimed: boolean;
  label: string;
}

export interface PersonalGoal {
  id: string;
  title: string;
  icon: string;
  rewardPaws: number;
  completed: boolean;
  streakDays?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  rewardPhp: number;
  progress: number;
  maxProgress: number;
}

export interface Transaction {
  id: string;
  type: 'MINE_TAP' | 'WALK' | 'DAILY_LOGIN' | 'GAME_FRUIT' | 'GAME_SPIN' | 'GAME_SCRATCH' | 'WATCH_AD' | 'REFERRAL' | 'WITHDRAWAL' | 'DAILY_MISSION' | 'LUCKY_CHEST' | 'TRIVIA' | 'HABIT_GOAL' | 'ACHIEVEMENT';
  amountPhp: number;
  title: string;
  timestamp: number;
  status: 'COMPLETED' | 'PROCESSING' | 'PENDING';
  payoutMethod?: string;
  accountNumber?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'withdrawal' | 'mining' | 'pedometer' | 'referral' | 'other';
  message: string;
  userEmail: string;
  createdAt: number;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
}

export interface UserState {
  balancePhp: number; // In Philippine Peso (₱), e.g. 0.65
  targetThresholdPhp: number; // e.g. 5.50 or 50.00 for initial cashout
  totalEarnedPhp: number;
  tapMineCount: number; // completed cat-mining sessions (all time)
  dailyKey: string;
  miningStartedAt: number | null;
  miningEndsAt: number | null;
  miningDay: string;
  miningSessionsToday: number;
  miningEarnedTodayPhp: number;
  stepsToday: number;
  stepsGoal: number;
  gamesPlayedToday: number;
  claimedMissionIds: string[];
  minerBatteryPercent: number; // 0 to 100
  minerLastClaimed: number;
  consecutiveDays: number;
  lastCheckinDate: string; // YYYY-MM-DD
  lastLuckyChestDate: string; // YYYY-MM-DD
  freeSpins: number;
  freeScratchCards: number;
  adsWatchedToday: number;
  referralCode: string;
  referralCount: number;
  referralEarningsPhp: number;
  transactions: Transaction[];
  tickets: SupportTicket[];
  soundEnabled: boolean;
  theme: 'slate' | 'amoled';
  batterySaver: boolean;
  personalGoals: PersonalGoal[];
  triviaAnsweredDate: string;
  unlockedAchievementIds: string[];
  userName: string;
  userEmail: string;
}

export const SUPPORT_EMAIL = 'moneypaws.app.help@gmail.com';
export const APP_MISSION = 'To provide users with passive daily income—maybe not to pay giant bills, but to reliably help pay for small daily expenses like coffee, snacks, mobile load, and daily fares.';
