import React, { useState } from 'react';
import { Trophy, Medal, Crown, Flame, Sparkles, TrendingUp, User, ChevronRight } from 'lucide-react';
import { formatPhp } from '../utils/storage';
import { sound } from '../utils/sound';

export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  badge: string;
  totalEarnedPhp: number;
  streakDays: number;
  primaryMethod: string;
}

interface LeaderboardProps {
  currentUserTotalEarned: number;
  currentUserName: string;
  onOpenProfile?: () => void;
}

const MOCK_ALL_TIME_LEADERS: LeaderboardUser[] = [
  {
    rank: 1,
    id: 'user-1',
    name: 'AlphaDoge_PH',
    avatar: '🐕',
    badge: 'Pack Legend',
    totalEarnedPhp: 1450.80,
    streakDays: 42,
    primaryMethod: 'GCash',
  },
  {
    rank: 2,
    id: 'user-2',
    name: 'CoffeeHunter99',
    avatar: '☕',
    badge: 'Master Miner',
    totalEarnedPhp: 985.40,
    streakDays: 29,
    primaryMethod: 'Maya',
  },
  {
    rank: 3,
    id: 'user-3',
    name: 'SwiftPaws_Walk',
    avatar: '👟',
    badge: '10K Walker Pro',
    totalEarnedPhp: 742.60,
    streakDays: 25,
    primaryMethod: 'GCash',
  },
  {
    rank: 4,
    id: 'user-4',
    name: 'CryptoPuppy_01',
    avatar: '🐾',
    badge: 'Rig Overclocker',
    totalEarnedPhp: 512.25,
    streakDays: 18,
    primaryMethod: 'Binance',
  },
  {
    rank: 5,
    id: 'user-5',
    name: 'SnackEarner_Mia',
    avatar: '🍩',
    badge: 'Fruit Slicer Ace',
    totalEarnedPhp: 430.15,
    streakDays: 16,
    primaryMethod: 'GCash',
  },
  {
    rank: 6,
    id: 'user-6',
    name: 'LuckyScratch77',
    avatar: '🎰',
    badge: 'Jackpot Winner',
    totalEarnedPhp: 388.90,
    streakDays: 14,
    primaryMethod: 'PayPal',
  },
  {
    rank: 7,
    id: 'user-7',
    name: 'StepHero_Ken',
    avatar: '⚡',
    badge: 'Pedometer Champion',
    totalEarnedPhp: 325.50,
    streakDays: 12,
    primaryMethod: 'Maya',
  },
  {
    rank: 8,
    id: 'user-8',
    name: 'DailyLoad_Dave',
    avatar: '📱',
    badge: 'Ad Watcher Elite',
    totalEarnedPhp: 295.20,
    streakDays: 11,
    primaryMethod: 'GCash',
  },
  {
    rank: 9,
    id: 'user-9',
    name: 'GoldenTrotter',
    avatar: '🦮',
    badge: 'Alpha Walker',
    totalEarnedPhp: 245.80,
    streakDays: 9,
    primaryMethod: 'ShopeePay',
  },
  {
    rank: 10,
    id: 'user-10',
    name: 'BreezePaws',
    avatar: '🦊',
    badge: 'Speed Miner',
    totalEarnedPhp: 210.00,
    streakDays: 8,
    primaryMethod: 'GCash',
  },
];

const MOCK_WEEKLY_LEADERS: LeaderboardUser[] = [
  {
    rank: 1,
    id: 'user-w1',
    name: 'SwiftPaws_Walk',
    avatar: '👟',
    badge: '10K Walker Pro',
    totalEarnedPhp: 185.60,
    streakDays: 25,
    primaryMethod: 'GCash',
  },
  {
    rank: 2,
    id: 'user-w2',
    name: 'AlphaDoge_PH',
    avatar: '🐕',
    badge: 'Pack Legend',
    totalEarnedPhp: 162.40,
    streakDays: 42,
    primaryMethod: 'GCash',
  },
  {
    rank: 3,
    id: 'user-w3',
    name: 'SnackEarner_Mia',
    avatar: '🍩',
    badge: 'Fruit Slicer Ace',
    totalEarnedPhp: 128.50,
    streakDays: 16,
    primaryMethod: 'GCash',
  },
  {
    rank: 4,
    id: 'user-w4',
    name: 'CoffeeHunter99',
    avatar: '☕',
    badge: 'Master Miner',
    totalEarnedPhp: 115.20,
    streakDays: 29,
    primaryMethod: 'Maya',
  },
  {
    rank: 5,
    id: 'user-w5',
    name: 'LuckyScratch77',
    avatar: '🎰',
    badge: 'Jackpot Winner',
    totalEarnedPhp: 94.80,
    streakDays: 14,
    primaryMethod: 'PayPal',
  },
  {
    rank: 6,
    id: 'user-w6',
    name: 'DailyLoad_Dave',
    avatar: '📱',
    badge: 'Ad Watcher Elite',
    totalEarnedPhp: 82.10,
    streakDays: 11,
    primaryMethod: 'GCash',
  },
  {
    rank: 7,
    id: 'user-w7',
    name: 'StepHero_Ken',
    avatar: '⚡',
    badge: 'Pedometer Champion',
    totalEarnedPhp: 76.50,
    streakDays: 12,
    primaryMethod: 'Maya',
  },
  {
    rank: 8,
    id: 'user-w8',
    name: 'GoldenTrotter',
    avatar: '🦮',
    badge: 'Alpha Walker',
    totalEarnedPhp: 65.40,
    streakDays: 9,
    primaryMethod: 'ShopeePay',
  },
  {
    rank: 9,
    id: 'user-w9',
    name: 'CryptoPuppy_01',
    avatar: '🐾',
    badge: 'Rig Overclocker',
    totalEarnedPhp: 58.20,
    streakDays: 18,
    primaryMethod: 'Binance',
  },
  {
    rank: 10,
    id: 'user-w10',
    name: 'BreezePaws',
    avatar: '🦊',
    badge: 'Speed Miner',
    totalEarnedPhp: 49.00,
    streakDays: 8,
    primaryMethod: 'GCash',
  },
];

const MOCK_TODAY_LEADERS: LeaderboardUser[] = [
  {
    rank: 1,
    id: 'user-t1',
    name: 'DailyLoad_Dave',
    avatar: '📱',
    badge: 'Ad Watcher Elite',
    totalEarnedPhp: 34.50,
    streakDays: 11,
    primaryMethod: 'GCash',
  },
  {
    rank: 2,
    id: 'user-t2',
    name: 'SwiftPaws_Walk',
    avatar: '👟',
    badge: '10K Walker Pro',
    totalEarnedPhp: 28.20,
    streakDays: 25,
    primaryMethod: 'GCash',
  },
  {
    rank: 3,
    id: 'user-t3',
    name: 'SnackEarner_Mia',
    avatar: '🍩',
    badge: 'Fruit Slicer Ace',
    totalEarnedPhp: 22.80,
    streakDays: 16,
    primaryMethod: 'GCash',
  },
  {
    rank: 4,
    id: 'user-t4',
    name: 'AlphaDoge_PH',
    avatar: '🐕',
    badge: 'Pack Legend',
    totalEarnedPhp: 19.40,
    streakDays: 42,
    primaryMethod: 'GCash',
  },
  {
    rank: 5,
    id: 'user-t5',
    name: 'CoffeeHunter99',
    avatar: '☕',
    badge: 'Master Miner',
    totalEarnedPhp: 16.70,
    streakDays: 29,
    primaryMethod: 'Maya',
  },
  {
    rank: 6,
    id: 'user-t6',
    name: 'LuckyScratch77',
    avatar: '🎰',
    badge: 'Jackpot Winner',
    totalEarnedPhp: 14.50,
    streakDays: 14,
    primaryMethod: 'PayPal',
  },
  {
    rank: 7,
    id: 'user-t7',
    name: 'StepHero_Ken',
    avatar: '⚡',
    badge: 'Pedometer Champion',
    totalEarnedPhp: 12.00,
    streakDays: 12,
    primaryMethod: 'Maya',
  },
  {
    rank: 8,
    id: 'user-t8',
    name: 'GoldenTrotter',
    avatar: '🦮',
    badge: 'Alpha Walker',
    totalEarnedPhp: 10.50,
    streakDays: 9,
    primaryMethod: 'ShopeePay',
  },
  {
    rank: 9,
    id: 'user-t9',
    name: 'BreezePaws',
    avatar: '🦊',
    badge: 'Speed Miner',
    totalEarnedPhp: 8.90,
    streakDays: 8,
    primaryMethod: 'GCash',
  },
  {
    rank: 10,
    id: 'user-t10',
    name: 'CryptoPuppy_01',
    avatar: '🐾',
    badge: 'Rig Overclocker',
    totalEarnedPhp: 7.60,
    streakDays: 18,
    primaryMethod: 'Binance',
  },
];

type Timeframe = 'allTime' | 'weekly' | 'today';

export const Leaderboard: React.FC<LeaderboardProps> = ({
  currentUserTotalEarned,
  currentUserName,
  onOpenProfile,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('allTime');

  const leaders =
    timeframe === 'allTime'
      ? MOCK_ALL_TIME_LEADERS
      : timeframe === 'weekly'
      ? MOCK_WEEKLY_LEADERS
      : MOCK_TODAY_LEADERS;

  // Calculate current user's relative position
  const rank10Amount = leaders[9]?.totalEarnedPhp || 200;
  const gapToTop10 = Math.max(0, Number((rank10Amount - currentUserTotalEarned).toFixed(2)));
  const estimatedRank = currentUserTotalEarned >= rank10Amount ? 10 : 14;

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/40 ring-2 ring-amber-300">
          <Crown className="w-4 h-4 fill-slate-950" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 flex items-center justify-center text-slate-900 shadow-md shadow-slate-300/30 ring-2 ring-slate-200">
          <Medal className="w-4 h-4 fill-slate-900" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-700 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/30 ring-2 ring-amber-600">
          <Medal className="w-4 h-4 fill-white" />
        </div>
      );
    }
    return (
      <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 text-slate-400 flex items-center justify-center text-[11px] font-mono font-bold">
        #{rank}
      </div>
    );
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900/95 via-cyan-950/25 to-slate-900/95 border border-cyan-500/40 p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col gap-3.5">
      {/* Header with Title & Live Pulse */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30">
            <Trophy className="w-4 h-4 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-fredoka text-base font-bold text-white tracking-tight">
                Top Earners Hall
              </h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </div>
            <p className="text-[10px] text-cyan-300/80">Real MoneyPaws micro-payout champions</p>
          </div>
        </div>

        {/* Competitiveness badge */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] text-cyan-300 font-bold">
          <TrendingUp className="w-3 h-3 text-cyan-400" />
          <span>Live Ranks</span>
        </div>
      </div>

      {/* Timeframe Filter Buttons */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
        <button
          onClick={() => {
            sound.playClick();
            setTimeframe('allTime');
          }}
          className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center ${
            timeframe === 'allTime'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All-Time
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setTimeframe('weekly');
          }}
          className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center ${
            timeframe === 'weekly'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setTimeframe('today');
          }}
          className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center ${
            timeframe === 'today'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Today
        </button>
      </div>

      {/* Podium Top 3 Highlight Cards */}
      <div className="grid grid-cols-3 gap-2 pt-1 pb-2">
        {/* Rank 2 (Silver) */}
        <div className="flex flex-col items-center justify-end p-2.5 rounded-xl bg-slate-950/70 border border-slate-700/60 text-center relative order-1">
          <div className="text-xl mb-1">{leaders[1]?.avatar}</div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            {getRankBadge(2)}
          </div>
          <span className="text-[11px] font-bold text-slate-200 truncate w-full mt-1.5">
            {leaders[1]?.name}
          </span>
          <span className="text-xs font-mono font-extrabold text-cyan-300">
            {formatPhp(leaders[1]?.totalEarnedPhp || 0)}
          </span>
          <span className="text-[9px] text-slate-400 truncate w-full">
            {leaders[1]?.badge}
          </span>
        </div>

        {/* Rank 1 (Gold - Center & Elevated) */}
        <div className="flex flex-col items-center justify-end p-3 rounded-xl bg-gradient-to-b from-amber-500/20 to-slate-950/90 border border-amber-500/50 shadow-lg shadow-amber-500/10 text-center relative order-2 scale-104 -translate-y-1">
          <div className="text-2xl mb-1 animate-bounce">{leaders[0]?.avatar}</div>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            {getRankBadge(1)}
          </div>
          <span className="text-[11px] font-extrabold text-amber-200 truncate w-full mt-1.5">
            {leaders[0]?.name}
          </span>
          <span className="text-xs font-mono font-black text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
            {formatPhp(leaders[0]?.totalEarnedPhp || 0)}
          </span>
          <span className="text-[9px] text-amber-300/80 font-semibold truncate w-full">
            {leaders[0]?.badge}
          </span>
        </div>

        {/* Rank 3 (Bronze) */}
        <div className="flex flex-col items-center justify-end p-2.5 rounded-xl bg-slate-950/70 border border-orange-700/50 text-center relative order-3">
          <div className="text-xl mb-1">{leaders[2]?.avatar}</div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            {getRankBadge(3)}
          </div>
          <span className="text-[11px] font-bold text-slate-200 truncate w-full mt-1.5">
            {leaders[2]?.name}
          </span>
          <span className="text-xs font-mono font-extrabold text-cyan-300">
            {formatPhp(leaders[2]?.totalEarnedPhp || 0)}
          </span>
          <span className="text-[9px] text-slate-400 truncate w-full">
            {leaders[2]?.badge}
          </span>
        </div>
      </div>

      {/* Ranks 4 to 10 List */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {leaders.slice(3, 10).map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/30 transition-all text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-5 text-center font-mono font-bold text-slate-400 text-[11px]">
                #{user.rank}
              </span>
              <span className="text-base shrink-0">{user.avatar}</span>
              <div className="truncate">
                <span className="font-semibold text-slate-200 truncate block text-[11px]">
                  {user.name}
                </span>
                <span className="text-[9px] text-slate-400 flex items-center gap-1">
                  <span>{user.badge}</span>
                  <span>•</span>
                  <span className="text-cyan-400/80">{user.primaryMethod}</span>
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="font-mono font-bold text-cyan-300 text-xs">
                {formatPhp(user.totalEarnedPhp)}
              </div>
              <div className="text-[9px] text-orange-400 font-semibold flex items-center justify-end gap-0.5">
                <Flame className="w-2.5 h-2.5 fill-orange-400 text-orange-400" />
                <span>{user.streakDays}d streak</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Current User Pinned Rank Card */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-950 to-cyan-950/60 border-2 border-cyan-400/60 flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.25)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-sm shadow">
            🐾
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">{currentUserName}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                You (#{estimatedRank})
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {gapToTop10 > 0 ? (
                <>Only <strong className="text-amber-300 font-mono">{formatPhp(gapToTop10)}</strong> away from Top 10!</>
              ) : (
                <span className="text-emerald-400 font-bold">You are in the Top 10 Earners!</span>
              )}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] text-slate-400 uppercase font-semibold block">Total Earned</span>
          <span className="font-mono font-extrabold text-cyan-300 text-sm">
            {formatPhp(currentUserTotalEarned)}
          </span>
        </div>
      </div>
    </div>
  );
};
