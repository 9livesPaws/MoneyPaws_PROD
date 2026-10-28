import { todayKey } from '../utils/mining';
import React from 'react';
import { X, Gift, Check, Flame, Sparkles, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { sound } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { fireRewardConfetti } from '../utils/confetti';

interface DailyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  consecutiveDays: number;
  lastCheckinDate: string;
  onClaimDaily: (day: number) => void;
}

interface DayReward {
  day: number;
  paws: number;
  bonus?: string;
  icon: string;
}

const STREAK_REWARDS: DayReward[] = [
  { day: 1, paws: 50, bonus: 'Welcome Seed', icon: '🌱' },
  { day: 2, paws: 100, bonus: '+1 Free Spin', icon: '🎡' },
  { day: 3, paws: 150, bonus: '+1 Scratch Card', icon: '🎫' },
  { day: 4, paws: 250, bonus: 'Coffee Boost', icon: '☕' },
  { day: 5, paws: 350, bonus: '+1 Spin & Scratch', icon: '⚡' },
  { day: 6, paws: 500, bonus: 'Super Paw Bag', icon: '💰' },
  { day: 7, paws: 1000, bonus: '$1.00 Jackpot + Mystery Box', icon: '👑' },
];

export const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({
  isOpen,
  onClose,
  consecutiveDays,
  lastCheckinDate,
  onClaimDaily,
}) => {
  if (!isOpen) return null;

  const todayStr = todayKey();
  const alreadyClaimedToday = lastCheckinDate === todayStr;
  const currentStreakDay = ((consecutiveDays - 1) % 7) + 1;

  const handleClaim = (day: number) => {
    sound.playFanfare();
    haptics.claim();
    fireRewardConfetti(0.5);
    onClaimDaily(day);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-5 shadow-2xl shadow-amber-500/10 overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-[radial-gradient(closest-side,rgba(245,158,11,0.30),transparent)] rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-[radial-gradient(closest-side,rgba(249,115,22,0.30),transparent)] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold mb-2">
            <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
            <span>{consecutiveDays}-Day Daily Login Streak</span>
          </div>
          <h2 className="font-fredoka text-2xl font-bold text-white flex items-center justify-center gap-2">
            <span>Daily Paw Treats</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Check in every day to claim bonus PawCoins for your daily expenses!
          </p>
        </div>

        {/* 7 Day Grid */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {STREAK_REWARDS.slice(0, 6).map((item) => {
            const isCompleted = item.day < currentStreakDay || (item.day === currentStreakDay && alreadyClaimedToday);
            const isCurrent = item.day === currentStreakDay && !alreadyClaimedToday;

            return (
              <div
                key={item.day}
                className={`relative rounded-xl p-2.5 flex flex-col items-center justify-between border transition-all text-center ${
                  isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : isCurrent
                    ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20 scale-102'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Day {item.day}
                </span>
                <span className="text-2xl my-1">{item.icon}</span>
                <div className="font-bold text-xs text-amber-300 font-mono">
                  +{item.paws}
                </div>
                {item.bonus && (
                  <span className="text-[8px] text-slate-300 leading-tight mt-0.5 truncate w-full">
                    {item.bonus}
                  </span>
                )}
                {isCompleted && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                    <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Day 7 Big Card spanning 2 columns */}
          {(() => {
            const item = STREAK_REWARDS[6];
            const isCompleted = item.day < currentStreakDay || (item.day === currentStreakDay && alreadyClaimedToday);
            const isCurrent = item.day === currentStreakDay && !alreadyClaimedToday;

            return (
              <div
                key={item.day}
                className={`col-span-2 relative rounded-xl p-3 flex items-center justify-between border transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : isCurrent
                    ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-amber-400 ring-2 ring-amber-400/50 shadow-xl shadow-amber-500/25'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Day 7 Grand Prize
                    </span>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="font-extrabold text-base text-amber-300 font-mono mt-0.5">
                    +1,000 Paws ($1.00)
                  </div>
                  <span className="text-[10px] text-orange-300 font-medium">
                    Mystery Gold Box Included
                  </span>
                </div>
                <div className="text-3xl animate-bounce">👑</div>
                {isCompleted && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                    <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* 30-Day Streak Trend Line Chart */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 mb-4 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
              <span>Streak Growth Trend (30 Days)</span>
            </span>
            <span className="text-[10px] text-orange-400 font-mono font-bold">
              Current: {consecutiveDays} Days 🔥
            </span>
          </div>

          <div className="w-full h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={Array.from({ length: 30 }, (_, i) => {
                  const day = i + 1;
                  // Simulates user's progressive streak building up to current streak
                  const daysOffset = 30 - day;
                  const simulatedStreak = Math.max(1, consecutiveDays - daysOffset);
                  return { day: `D${day}`, streak: simulatedStreak };
                })}
                margin={{ top: 5, right: 6, left: -25, bottom: 0 }}
              >
                <XAxis dataKey="day" stroke="#64748b" fontSize={8} interval={6} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#f59e0b', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                  formatter={(v: any) => [`${v} Days`, 'Streak']}
                />
                <Line
                  type="monotone"
                  dataKey="streak"
                  stroke="#fb923c"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Claim Action */}
        <div>
          {alreadyClaimedToday ? (
            <div className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center text-xs text-slate-400 font-medium">
              ✅ Today&apos;s reward already claimed! Come back tomorrow for Day {((consecutiveDays) % 7) + 1}.
            </div>
          ) : (
            <button
              onClick={() => handleClaim(currentStreakDay)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Gift className="w-4 h-4 stroke-[2.5]" />
              <span>Claim Day {currentStreakDay} Reward Now!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
