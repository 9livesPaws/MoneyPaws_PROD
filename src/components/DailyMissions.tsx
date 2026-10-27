import React from 'react';
import { Target, CheckCircle2, ChevronRight, Gift, Sparkles, Clock, Zap, ArrowRight, Award } from 'lucide-react';
import { sound } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { fireRewardConfetti, fireJackpotConfetti } from '../utils/confetti';
import { formatPhp } from '../utils/storage';

export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  current: number;
  target: number;
  pawsReward: number;
  phpReward: number;
  actionKey: 'walk' | 'game' | 'mine' | 'ad' | 'checkin';
}

interface DailyMissionsProps {
  stepsToday: number;
  gamesPlayedToday: number;
  tapMineCount: number;
  adsWatchedToday: number;
  hasClaimedCheckin: boolean;
  claimedMissionIds: string[];
  onClaimMission: (missionId: string, phpReward: number, pawsReward: number, title: string) => void;
  onOpenWalking: () => void;
  onOpenGames: () => void;
  onOpenWatchAd: () => void;
  onOpenDailyLogins: () => void;
  onScrollToMine: () => void;
}

export const DailyMissions: React.FC<DailyMissionsProps> = ({
  stepsToday,
  gamesPlayedToday,
  tapMineCount,
  adsWatchedToday,
  hasClaimedCheckin,
  claimedMissionIds,
  onClaimMission,
  onOpenWalking,
  onOpenGames,
  onOpenWatchAd,
  onOpenDailyLogins,
  onScrollToMine,
}) => {
  const missions: Mission[] = [
    {
      id: 'm-steps',
      title: 'Daily Walker',
      description: 'Complete 500 walking steps today',
      icon: '👟',
      current: stepsToday,
      target: 500,
      pawsReward: 100,
      phpReward: 0.10,
      actionKey: 'walk',
    },
    {
      id: 'm-game',
      title: 'Arcade Player',
      description: 'Play at least 1 mini-game (Fruit Tap or Wheel)',
      icon: '🎮',
      current: gamesPlayedToday,
      target: 1,
      pawsReward: 150,
      phpReward: 0.15,
      actionKey: 'game',
    },
    {
      id: 'm-mine',
      title: 'Paw Miner',
      description: 'Tap to mine at least 10 times today',
      icon: '🐾',
      current: tapMineCount,
      target: 10,
      pawsReward: 100,
      phpReward: 0.10,
      actionKey: 'mine',
    },
    {
      id: 'm-ad',
      title: 'Ad Explorer',
      description: 'Watch 1 sponsor clip to support rewards',
      icon: '📺',
      current: adsWatchedToday,
      target: 1,
      pawsReward: 150,
      phpReward: 0.15,
      actionKey: 'ad',
    },
    {
      id: 'm-checkin',
      title: 'Streak Keeper',
      description: 'Claim your daily login streak treat',
      icon: '📅',
      current: hasClaimedCheckin ? 1 : 0,
      target: 1,
      pawsReward: 100,
      phpReward: 0.10,
      actionKey: 'checkin',
    },
  ];

  const completedCount = missions.filter((m) => m.current >= m.target).length;
  const claimedCount = missions.filter((m) => claimedMissionIds.includes(m.id)).length;
  const allMissionsClaimed = claimedCount >= missions.length;
  const hasMegaBonusClaimed = claimedMissionIds.includes('m-mega-chest');
  const canClaimMegaBonus = completedCount >= 4 && !hasMegaBonusClaimed;

  const handleClaim = (mission: Mission) => {
    sound.playFanfare();
    haptics.claim();
    fireRewardConfetti(0.4);
    onClaimMission(mission.id, mission.phpReward, mission.pawsReward, mission.title);
  };

  const handleClaimMegaBonus = () => {
    sound.playFanfare();
    haptics.jackpot();
    fireJackpotConfetti();
    onClaimMission('m-mega-chest', 0.30, 300, '👑 Daily Master Bounty Mystery Chest');
  };

  const handleAction = (actionKey: Mission['actionKey']) => {
    sound.playClick();
    if (actionKey === 'walk') onOpenWalking();
    else if (actionKey === 'game') onOpenGames();
    else if (actionKey === 'mine') onScrollToMine();
    else if (actionKey === 'ad') onOpenWatchAd();
    else if (actionKey === 'checkin') onOpenDailyLogins();
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900/95 via-cyan-950/25 to-slate-900/95 border border-cyan-500/40 p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/30">
            <Target className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-fredoka text-base font-bold text-white tracking-tight">
                Daily Missions
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                +{missions.reduce((sum, m) => sum + m.pawsReward, 0) + 300} Paws
              </span>
            </div>
            <p className="text-[10px] text-cyan-300/80">
              Achieve easy daily tasks to boost micro-earnings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-full border border-slate-800">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>Resets Daily</span>
        </div>
      </div>

      {/* Daily Progress Gauge toward Master Bounty */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <span>Daily Goal:</span>
            <span className="text-cyan-300 font-mono">
              {completedCount} / {missions.length} Finished
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Master Chest: +₱0.30</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800 p-0.2">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
            style={{ width: `${Math.min(100, (completedCount / missions.length) * 100)}%` }}
          />
        </div>

        {/* Master Chest Claim Trigger */}
        {canClaimMegaBonus && (
          <button
            onClick={handleClaimMegaBonus}
            className="w-full mt-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
          >
            <Gift className="w-4 h-4 fill-slate-950" />
            <span>Claim Master Bounty Chest (+₱0.30 & Free Spin)!</span>
          </button>
        )}

        {hasMegaBonusClaimed && (
          <div className="w-full py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-center text-[10px] text-emerald-300 font-bold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Master Bounty Chest Claimed for Today!</span>
          </div>
        )}
      </div>

      {/* Missions List */}
      <div className="space-y-2">
        {missions.map((mission) => {
          const isCompleted = mission.current >= mission.target;
          const isClaimed = claimedMissionIds.includes(mission.id);
          const percent = Math.min(100, Math.round((mission.current / mission.target) * 100));

          return (
            <div
              key={mission.id}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                isClaimed
                  ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                  : isCompleted
                  ? 'bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-cyan-500/30'
              }`}
            >
              {/* Left: Icon & Description */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0 shadow-inner">
                  {mission.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white truncate block">
                      {mission.title}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-cyan-300 shrink-0">
                      +{formatPhp(mission.phpReward)}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {mission.description}
                  </p>

                  {/* Micro Progress Bar */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-400' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono font-semibold text-slate-400 shrink-0">
                      {Math.min(mission.current, mission.target)}/{mission.target}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Button */}
              <div className="shrink-0">
                {isClaimed ? (
                  <div className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Done</span>
                  </div>
                ) : isCompleted ? (
                  <button
                    onClick={() => handleClaim(mission)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-extrabold text-[11px] shadow-md shadow-emerald-500/30 cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 fill-slate-950" />
                    <span>Claim</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(mission.actionKey)}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] cursor-pointer transition-all flex items-center gap-0.5 active:scale-95"
                  >
                    <span>GO</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
