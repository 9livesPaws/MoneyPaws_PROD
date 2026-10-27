import React from 'react';
import { Target, Sparkles, Trophy, ArrowUpRight } from 'lucide-react';
import { formatPhp } from '../utils/storage';

interface DailyProgressRingProps {
  currentDailyEarnedPhp: number;
  dailyTargetPhp?: number; // default 5.00
  onOpenMissions?: () => void;
}

export const DailyProgressRing: React.FC<DailyProgressRingProps> = ({
  currentDailyEarnedPhp,
  dailyTargetPhp = 5.0,
  onOpenMissions,
}) => {
  const percent = Math.min(100, Math.max(0, (currentDailyEarnedPhp / dailyTargetPhp) * 100));
  const isGoalReached = currentDailyEarnedPhp >= dailyTargetPhp;

  // SVG circular calculation
  const radius = 38;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-slate-900/90 via-cyan-950/30 to-slate-900/90 border border-cyan-500/35 p-3.5 shadow-[0_0_15px_rgba(6,182,212,0.12)] flex items-center justify-between gap-3">
      {/* Left: Interactive Progress Ring */}
      <div className="relative w-22 h-22 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 90 90">
          {/* Background track circle */}
          <circle
            cx="45"
            cy="45"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800"
            fill="transparent"
          />

          {/* Glowing Animated Progress circle */}
          <circle
            cx="45"
            cy="45"
            r={radius}
            stroke="url(#cyanProgressGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]"
            fill="transparent"
          />

          <defs>
            <linearGradient id="cyanProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center percentage label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-xs font-black text-cyan-300 drop-shadow">
            {percent.toFixed(0)}%
          </span>
          <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">
            Goal
          </span>
        </div>
      </div>

      {/* Center & Right Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <div className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">
            <Target className="w-3.5 h-3.5" />
          </div>
          <span className="font-fredoka text-xs font-bold text-white tracking-wide truncate">
            Daily Income Target
          </span>
          {isGoalReached && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
              Achieved!
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1 mt-1">
          <span className="font-mono text-lg font-black text-cyan-300">
            {formatPhp(currentDailyEarnedPhp)}
          </span>
          <span className="text-xs text-slate-400 font-mono">/ {formatPhp(dailyTargetPhp)}</span>
        </div>

        <p className="text-[10px] text-slate-300/90 mt-0.5 line-clamp-1">
          {isGoalReached
            ? '🎉 Daily ₱5.00 goal reached! Extra bonuses unlocked.'
            : `Earn ${formatPhp(dailyTargetPhp - currentDailyEarnedPhp)} more today to finish your daily goal.`}
        </p>
      </div>

      {/* Action Shortcut */}
      {onOpenMissions && (
        <button
          onClick={onOpenMissions}
          className="shrink-0 p-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center"
          title="View Tasks to reach goal"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
