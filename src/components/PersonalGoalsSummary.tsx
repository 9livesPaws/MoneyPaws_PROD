import React from 'react';
import { CheckCircle2, Flame, Sparkles, ArrowRight, CheckSquare } from 'lucide-react';
import { sound } from '../utils/sound';
import { PersonalGoal } from '../types';

interface PersonalGoalsSummaryProps {
  personalGoals: PersonalGoal[];
  onScrollToHabits: () => void;
}

export const PersonalGoalsSummary: React.FC<PersonalGoalsSummaryProps> = ({
  personalGoals,
  onScrollToHabits,
}) => {
  const totalGoals = personalGoals.length;
  const completedGoals = personalGoals.filter((g) => g.completed).length;
  const percent = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  const allCompleted = totalGoals > 0 && completedGoals === totalGoals;
  const remaining = totalGoals - completedGoals;

  // Motivational message
  let motivationalText = "Take 1 minute to check off your first daily habit & earn extra Paws!";
  if (allCompleted) {
    motivationalText = "All daily personal goals 100% completed! Incredible consistency today.";
  } else if (percent >= 66) {
    motivationalText = `Great momentum! Only ${remaining} habit${remaining > 1 ? 's' : ''} left for full bonus payout.`;
  } else if (percent > 0) {
    motivationalText = `You're ${percent}% of the way there. Keep building daily micro-discipline!`;
  }

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-slate-900/95 via-emerald-950/25 to-slate-900/95 border border-emerald-500/35 p-3.5 shadow-[0_0_15px_rgba(16,185,129,0.12)] flex flex-col gap-2.5">
      {/* Top Row: Title, Ratio Badge & Percentage */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 font-bold shrink-0">
            <CheckSquare className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-fredoka text-xs font-bold text-white tracking-wide">
                Personal Goals Summary
              </h3>
              {allCompleted && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                  All Done!
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">
              {completedGoals} of {totalGoals} Habits Checked Off
            </span>
          </div>
        </div>

        {/* Large Percentage Badge */}
        <div className="flex items-baseline gap-1 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-emerald-500/30 shrink-0">
          <span className="font-mono text-base font-black text-emerald-400 drop-shadow">
            {percent}%
          </span>
          <span className="text-[9px] uppercase font-bold text-slate-400">Done</span>
        </div>
      </div>

      {/* Visual Glowing Progress Bar */}
      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.7)] ${
            allCompleted
              ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 animate-pulse'
              : 'bg-gradient-to-r from-teal-500 to-emerald-400'
          }`}
          style={{ width: `${Math.max(4, percent)}%` }}
        />
      </div>

      {/* Bottom Motivational Footer & Quick Action */}
      <div className="flex items-center justify-between gap-2 pt-0.5 text-[11px]">
        <p className="text-[10px] text-slate-300/90 leading-tight flex-1 line-clamp-1">
          {allCompleted ? '🌟 ' : '⚡ '}
          {motivationalText}
        </p>

        <button
          onClick={() => {
            sound.playClick();
            onScrollToHabits();
          }}
          className="shrink-0 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer hover:underline"
        >
          <span>{allCompleted ? 'Review' : 'Check Off'}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
