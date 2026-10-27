import React, { useState } from 'react';
import { X, Trophy, Footprints, Flame, Sparkles, Award, Users, ArrowRight, Timer, Medal } from 'lucide-react';
import { sound } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { fireJackpotConfetti, fireRewardConfetti } from '../utils/confetti';
import { formatPhp } from '../utils/storage';

interface WeeklySocialChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserName: string;
  stepsToday: number;
  onOpenWalking: () => void;
  onClaimReward: (paws: number, php: number, title: string) => void;
}

interface StepLeader {
  rank: number;
  name: string;
  avatar: string;
  steps: number;
  city: string;
  rewardPaws: number;
  isCurrentUser?: boolean;
}

export const WeeklySocialChallengeModal: React.FC<WeeklySocialChallengeModalProps> = ({
  isOpen,
  onClose,
  currentUserName,
  stepsToday,
  onOpenWalking,
  onClaimReward,
}) => {
  const [hasClaimedMilestone, setHasClaimedMilestone] = useState(false);

  if (!isOpen) return null;

  // Realistic total weekly steps calculated with base + today's live steps
  const userWeeklySteps = 16840 + stepsToday;

  // Global leaderboard mock list
  const leaders: StepLeader[] = [
    { rank: 1, name: 'Maya Cruz', avatar: '🐱', steps: 48920, city: 'Cebu City', rewardPaws: 2500 },
    { rank: 2, name: 'Danilo Santos', avatar: '🐶', steps: 43450, city: 'Manila', rewardPaws: 1500 },
    { rank: 3, name: 'Jasmine Reyes', avatar: '🦊', steps: 39810, city: 'Davao City', rewardPaws: 1000 },
    { rank: 4, name: 'Gabriel Tan', avatar: '🦁', steps: 31200, city: 'Quezon City', rewardPaws: 500 },
    { rank: 5, name: 'Althea Dizon', avatar: '🐼', steps: 26500, city: 'Makati City', rewardPaws: 400 },
    {
      rank: 6,
      name: `${currentUserName} (You)`,
      avatar: '🐾',
      steps: userWeeklySteps,
      city: 'Live Device',
      rewardPaws: 300,
      isCurrentUser: true,
    },
    { rank: 7, name: 'Kenji Aquino', avatar: '🐯', steps: 18900, city: 'Taguig City', rewardPaws: 250 },
    { rank: 8, name: 'Bianca Ramos', avatar: '🐨', steps: 16400, city: 'Pasig City', rewardPaws: 250 },
    { rank: 9, name: 'Rafael Lim', avatar: '🐰', steps: 14200, city: 'Bacolod', rewardPaws: 200 },
    { rank: 10, name: 'Erika Flores', avatar: '🐹', steps: 12100, city: 'Iloilo City', rewardPaws: 200 },
  ];

  // Milestone condition: 15k steps
  const canClaimMilestone = userWeeklySteps >= 15000 && !hasClaimedMilestone;

  const handleClaimMilestone = () => {
    if (!canClaimMilestone) return;
    sound.playFanfare();
    haptics.jackpot();
    fireJackpotConfetti();
    setHasClaimedMilestone(true);
    onClaimReward(200, 0.20, 'Weekly Step Sprint: 15,000 Steps Milestone');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-950 border border-sky-500/40 rounded-3xl p-4 shadow-2xl flex flex-col gap-3 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-sky-950/80 via-cyan-950/40 to-blue-950/80 border border-sky-500/30 p-3.5 flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-[10px] text-sky-300 font-bold">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>Weekly Social Challenge</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
              <Timer className="w-3 h-3 text-cyan-400" />
              <span>Ends in 3d 14h</span>
            </div>
          </div>

          <h2 className="font-fredoka text-lg font-bold text-white mt-1">
            Global Step Sprint 🏃‍♂️
          </h2>
          <p className="text-[11px] text-slate-300 leading-tight">
            Compete with thousands of everyday walkers! Top 10 step leaders win extra bonus Paws &amp; cash rewards every Sunday.
          </p>

          {/* Prize Pool Row */}
          <div className="grid grid-cols-3 gap-1.5 mt-1.5 text-center text-[10px]">
            <div className="p-1.5 rounded-xl bg-slate-950/70 border border-amber-500/40">
              <span className="block text-amber-400 font-bold">🥇 1st Place</span>
              <span className="font-mono text-amber-300 font-bold">+2,500 Paws</span>
            </div>
            <div className="p-1.5 rounded-xl bg-slate-950/70 border border-slate-700">
              <span className="block text-slate-300 font-bold">🥈 2nd Place</span>
              <span className="font-mono text-slate-200 font-bold">+1,500 Paws</span>
            </div>
            <div className="p-1.5 rounded-xl bg-slate-950/70 border border-amber-700/50">
              <span className="block text-amber-600 font-bold">🥉 3rd Place</span>
              <span className="font-mono text-amber-500 font-bold">+1,000 Paws</span>
            </div>
          </div>
        </div>

        {/* User Current Standing Card */}
        <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-2xl shadow-md shadow-cyan-500/20">
              🐾
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white">Your Current Rank</span>
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black font-mono">
                  #6
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-base font-black text-cyan-300">
                  {userWeeklySteps.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">weekly steps</span>
              </div>
              <span className="text-[9px] text-emerald-400 font-semibold">
                Prize tier: +300 Paws (+₱0.30)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 shrink-0">
            {hasClaimedMilestone ? (
              <span className="px-2 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 text-center">
                Milestone Claimed ✅
              </span>
            ) : canClaimMilestone ? (
              <button
                onClick={handleClaimMilestone}
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-[10px] shadow-md shadow-amber-500/30 cursor-pointer active:scale-95 animate-bounce flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 fill-slate-950" />
                <span>Claim +200 Paws</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onOpenWalking();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] shadow-sm cursor-pointer active:scale-95 flex items-center gap-1"
              >
                <Footprints className="w-3 h-3" />
                <span>Walk More</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Leaderboard List */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 px-1">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Community Top Steppers</span>
            </span>
            <span className="text-[10px] text-slate-500">Live Global Sync</span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
            {leaders.map((leader) => {
              const isTop3 = leader.rank <= 3;

              return (
                <div
                  key={leader.rank}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all text-xs ${
                    leader.isCurrentUser
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                      : isTop3
                      ? 'bg-slate-900/90 border-amber-500/30'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Rank Number / Medal */}
                    <div className="w-6 text-center font-mono font-bold text-xs shrink-0">
                      {leader.rank === 1 && '🥇'}
                      {leader.rank === 2 && '🥈'}
                      {leader.rank === 3 && '🥉'}
                      {leader.rank > 3 && (
                        <span className="text-slate-400">#{leader.rank}</span>
                      )}
                    </div>

                    <span className="text-lg shrink-0">{leader.avatar}</span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold truncate ${
                            leader.isCurrentUser ? 'text-cyan-300' : 'text-slate-200'
                          }`}
                        >
                          {leader.name}
                        </span>
                        {leader.isCurrentUser && (
                          <span className="px-1 py-0.2 rounded bg-cyan-400 text-slate-950 text-[9px] font-black shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {leader.city}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-mono font-bold text-xs text-white">
                      {leader.steps.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-mono text-amber-400 font-semibold">
                      +{leader.rewardPaws} Paws
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <p className="text-[10px] text-slate-400">
            Walk, shake your phone, or jog to climb ranks!
          </p>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
              onOpenWalking();
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 text-slate-950 font-bold text-[11px] cursor-pointer flex items-center gap-1 active:scale-95 transition-all shadow-md shadow-sky-500/20"
          >
            <span>Log Steps Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
