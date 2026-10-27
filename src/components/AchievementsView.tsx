import React from 'react';
import { Award, CheckCircle2, Lock, Sparkles, X, ChevronRight, Trophy } from 'lucide-react';
import { sound } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { fireJackpotConfetti, fireRewardConfetti } from '../utils/confetti';
import { formatPhp } from '../utils/storage';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  current: number;
  target: number;
  rewardPhp: number;
  rewardPaws: number;
}

interface AchievementsViewProps {
  unlockedAchievementIds: string[];
  stepsToday: number;
  tapMineCount: number;
  consecutiveDays: number;
  referralCount: number;
  onClaimAchievement: (id: string, php: number, paws: number, title: string) => void;
  onClose: () => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  unlockedAchievementIds,
  stepsToday,
  tapMineCount,
  consecutiveDays,
  referralCount,
  onClaimAchievement,
  onClose,
}) => {
  const milestones: Milestone[] = [
    {
      id: 'ach-first-step',
      title: 'First 1,000 Steps',
      description: 'Walk and record at least 1,000 steps on the pedometer',
      icon: '👣',
      category: 'Pedometer',
      current: stepsToday,
      target: 1000,
      rewardPhp: 0.25,
      rewardPaws: 250,
    },
    {
      id: 'ach-first-mine',
      title: 'Master Miner',
      description: 'Tap the cloud mining button at least 25 times',
      icon: '🐾',
      category: 'Mining',
      current: tapMineCount,
      target: 25,
      rewardPhp: 0.25,
      rewardPaws: 250,
    },
    {
      id: 'ach-streak-7',
      title: 'Early Bird Streak',
      description: 'Log in and maintain a 7-day daily check-in streak',
      icon: '🔥',
      category: 'Consistency',
      current: consecutiveDays,
      target: 7,
      rewardPhp: 1.00,
      rewardPaws: 1000,
    },
    {
      id: 'ach-miner-100',
      title: 'Rig Overclocker',
      description: 'Reach 100 total taps on the Tap to Mine engine',
      icon: '⚡',
      category: 'Mining',
      current: tapMineCount,
      target: 100,
      rewardPhp: 0.75,
      rewardPaws: 750,
    },
    {
      id: 'ach-walker-5000',
      title: '5K Marathoner',
      description: 'Hit 5,000 daily walking steps in a single day',
      icon: '👟',
      category: 'Pedometer',
      current: stepsToday,
      target: 5000,
      rewardPhp: 1.50,
      rewardPaws: 1500,
    },
    {
      id: 'ach-referral-1',
      title: 'Squad Pioneer',
      description: 'Invite your first friend to earn daily income together',
      icon: '🤝',
      category: 'Community',
      current: referralCount,
      target: 1,
      rewardPhp: 1.00,
      rewardPaws: 1000,
    },
  ];

  const handleClaim = (milestone: Milestone) => {
    sound.playFanfare();
    haptics.jackpot();
    fireJackpotConfetti();
    onClaimAchievement(milestone.id, milestone.rewardPhp, milestone.rewardPaws, milestone.title);
  };

  const unlockedCount = unlockedAchievementIds.length;

  return (
    <div className="flex flex-col gap-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-bold">
            <Trophy className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <h3 className="font-fredoka text-lg font-bold text-white tracking-tight">
              Milestone Badges
            </h3>
            <p className="text-[11px] text-cyan-300/80">
              {unlockedCount} of {milestones.length} Badges Claimed
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${(unlockedCount / milestones.length) * 100}%` }}
        />
      </div>

      {/* Badges List */}
      <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-1">
        {milestones.map((m) => {
          const isClaimed = unlockedAchievementIds.includes(m.id);
          const isReadyToClaim = !isClaimed && m.current >= m.target;
          const percent = Math.min(100, Math.round((m.current / m.target) * 100));

          return (
            <div
              key={m.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isClaimed
                  ? 'bg-slate-950/40 border-slate-800/80 opacity-80'
                  : isReadyToClaim
                  ? 'bg-gradient-to-r from-amber-950/40 via-cyan-950/40 to-slate-950 border-amber-400/60 shadow-md shadow-amber-500/10'
                  : 'bg-slate-950/60 border-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                    isClaimed
                      ? 'bg-slate-900 border-slate-800 text-slate-400'
                      : isReadyToClaim
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-bounce'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {m.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white truncate block">
                      {m.title}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-400 shrink-0">
                      +{formatPhp(m.rewardPhp)}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {m.description}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isClaimed ? 'bg-emerald-400' : isReadyToClaim ? 'bg-amber-400' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono font-semibold text-slate-400 shrink-0">
                      {Math.min(m.current, m.target)}/{m.target}
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                {isClaimed ? (
                  <div className="px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Unlocked</span>
                  </div>
                ) : isReadyToClaim ? (
                  <button
                    onClick={() => handleClaim(m)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-extrabold text-[11px] shadow-md shadow-amber-500/30 cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 fill-slate-950" />
                    <span>Claim</span>
                  </button>
                ) : (
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-600">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
