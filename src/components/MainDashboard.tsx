import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Menu, User, Sparkles, Footprints, Tv, Calendar, RefreshCw, Trophy, ArrowRight, ExternalLink, Share2 } from 'lucide-react';
import { sound } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { fireRewardConfetti } from '../utils/confetti';
import { formatPhp, formatPaws } from '../utils/storage';
import { CatMiner } from './CatArt';
import { Leaderboard } from './Leaderboard';
import { MiningCard } from './MiningCard';
import { HideableSection } from './HideableSection';
import { DailyMissions } from './DailyMissions';
import { DailyNewsTicker } from './DailyNewsTicker';
import { DailyLuckyChest, ChestReward } from './DailyLuckyChest';
import { DailyProgressRing } from './DailyProgressRing';
import { PersonalGoalsSummary } from './PersonalGoalsSummary';
import { DailyTriviaQuiz } from './DailyTriviaQuiz';
import { DailyHabitTracker } from './DailyHabitTracker';
const HabitsWeeklyConsistency = lazy(() => import('./HabitsWeeklyConsistency').then((m) => ({ default: m.HabitsWeeklyConsistency })));
const WeeklyPerformanceChart = lazy(() => import('./WeeklyPerformanceChart').then((m) => ({ default: m.WeeklyPerformanceChart })));
import { PersonalGoal } from '../types';

interface MainDashboardProps {
  balancePhp: number;
  targetThresholdPhp: number;
  tapMineCount: number;
  currentUserTotalEarned: number;
  currentUserName: string;
  stepsToday: number;
  gamesPlayedToday: number;
  adsWatchedToday: number;
  hasClaimedCheckin: boolean;
  claimedMissionIds: string[];
  lastLuckyChestDate: string;
  theme?: 'slate' | 'amoled';
  batterySaver?: boolean;
  personalGoals: PersonalGoal[];
  triviaAnsweredDate: string;
  miningStartedAt: number | null;
  miningEndsAt: number | null;
  miningSessionsToday: number;
  miningEarnedTodayPhp: number;
  onStartMining: () => void;
  onClaimMining: () => void;
  onOpenCashOut: () => void;
  onOpenShareEarnings: () => void;
  onOpenMenu: () => void;
  onOpenProfile: () => void;
  onOpenDailyLogins: () => void;
  onOpenWatchAd: () => void;
  onOpenSpinWheel: () => void;
  onOpenWalking: () => void;
  onOpenScratchCards: () => void;
  onOpenFruitTap: () => void;
  onClaimMission: (missionId: string, phpReward: number, pawsReward: number, title: string) => void;
  onClaimChest: (reward: ChestReward) => void;
  onToggleGoal: (id: string) => void;
  onAddGoal: (title: string, icon: string) => void;
  onEditGoal?: (id: string, newTitle: string, newIcon: string) => void;
  onDeleteGoal?: (id: string) => void;
  onTriviaReward: (php: number, paws: number, title: string) => void;
  onOpenSocialChallenge?: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  balancePhp,
  targetThresholdPhp,
  tapMineCount,
  currentUserTotalEarned,
  currentUserName,
  stepsToday,
  gamesPlayedToday,
  adsWatchedToday,
  hasClaimedCheckin,
  claimedMissionIds,
  lastLuckyChestDate,
  theme = 'slate',
  batterySaver = false,
  personalGoals,
  triviaAnsweredDate,
  miningStartedAt,
  miningEndsAt,
  miningSessionsToday,
  miningEarnedTodayPhp,
  onStartMining,
  onClaimMining,
  onOpenCashOut,
  onOpenShareEarnings,
  onOpenMenu,
  onOpenProfile,
  onOpenDailyLogins,
  onOpenWatchAd,
  onOpenSpinWheel,
  onOpenWalking,
  onOpenScratchCards,
  onOpenFruitTap,
  onClaimMission,
  onClaimChest,
  onToggleGoal,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onTriviaReward,
  onOpenSocialChallenge,
}) => {
  const [hiddenSections, setHiddenSections] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mp_hidden_sections') || '[]');
    } catch {
      return [];
    }
  });
  const hideSection = (id: string) =>
    setHiddenSections((prev) => {
      const next = [...prev, id];
      try {
        localStorage.setItem('mp_hidden_sections', JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  const showAllSections = () => {
    setHiddenSections([]);
    try {
      localStorage.removeItem('mp_hidden_sections');
    } catch {
      /* ignore */
    }
  };

  // Threshold percentage
  const thresholdPercent = Math.min(100, Math.max(3, (balancePhp / targetThresholdPhp) * 100));

  return (
    <div className="w-full flex flex-col justify-start select-none">
      {/* Friendly header: mascot avatar + greeting + menu */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-3">
        <button
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer text-left"
          title="Your profile"
        >
          <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center shrink-0 overflow-hidden">
            <CatMiner size={44} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 leading-none">Welcome back,</p>
            <p className="font-fredoka text-lg font-bold text-white truncate leading-tight">{currentUserName}</p>
          </div>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenMenu();
          }}
          className="w-10 h-10 shrink-0 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 flex flex-col gap-3 mt-1">
        {/* DAILY NEWS / UPDATES TICKER */}
        <DailyNewsTicker />

        {/* BALANCE CARD */}
        <div className="rounded-2xl bg-gradient-to-br from-cyan-700 to-blue-700 p-4 text-white shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">Your balance</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-3xl">🪙</span>
                <span className="font-fredoka text-4xl font-bold tracking-tight">{formatPhp(balancePhp)}</span>
              </div>
              <div className="text-[11px] text-white/80 font-mono mt-0.5">
                = {formatPaws(Math.round(balancePhp * 1000))} PawCoins
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenCashOut();
                }}
                className="px-4 py-2 rounded-xl bg-white text-cyan-700 font-extrabold text-sm cursor-pointer active:scale-95 transition-transform"
              >
                Cash Out
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenShareEarnings();
                }}
                className="flex items-center gap-1 text-[11px] text-white/85 font-semibold cursor-pointer"
                title="Share your earnings"
              >
                <Share2 className="w-3 h-3" /> Share
              </button>
            </div>
          </div>

          <div className="mt-3">
            <div className="h-2.5 rounded-full bg-black/25 overflow-hidden">
              <div className="h-full rounded-full bg-amber-300 transition-all duration-500" style={{ width: `${thresholdPercent}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-white/85 mt-1.5 font-medium">
              <span>Minimum cash out</span>
              <span className="font-mono font-bold">
                {formatPhp(balancePhp)} / {formatPhp(targetThresholdPhp)}
              </span>
            </div>
          </div>
        </div>

        {/* MASCOT TIP */}
        <div className="flex items-end gap-2">
          <div className="shrink-0 -mb-1">
            <CatMiner size={58} />
          </div>
          <div className="flex-1 rounded-2xl rounded-bl-md bg-slate-800 border border-slate-700 px-3 py-2.5 text-[13px] text-slate-100 leading-snug">
            {miningEndsAt && miningEndsAt <= Date.now()
              ? 'Meow! Your mining session is done. Claim your PawCoins! 🎉'
              : !hasClaimedCheckin
              ? "Don't forget your daily login bonus today! 🎁"
              : balancePhp >= targetThresholdPhp
              ? 'You can cash out now! Tap Cash Out to get paid. 💸'
              : 'Keep going! Mine, walk, play and watch to reach your first cash out. 🐾'}
          </div>
        </div>

        {/* DAILY INCOME TARGET PROGRESS RING (5.00 GOAL) */}
        <DailyProgressRing
          currentDailyEarnedPhp={balancePhp}
          dailyTargetPhp={5.0}
          onOpenMissions={() => {
            document.getElementById('missions-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* PERSONAL GOALS COMPLETION SUMMARY */}
        <PersonalGoalsSummary
          personalGoals={personalGoals}
          onScrollToHabits={() => {
            document.getElementById('habits-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* DAILY LUCKY CHEST (DISTINCT DAILY MYSTERY DROP) */}
        <DailyLuckyChest
          lastLuckyChestDate={lastLuckyChestDate}
          onClaimChest={onClaimChest}
          onOpenWatchAd={onOpenWatchAd}
        />


        {/* HERO CARD: one-tap, 3-hour cat mining */}
        <MiningCard
          miningStartedAt={miningStartedAt}
          miningEndsAt={miningEndsAt}
          sessionsToday={miningSessionsToday}
          earnedTodayPhp={miningEarnedTodayPhp}
          onStart={onStartMining}
          onClaim={onClaimMining}
        />

        {/* 6 ACTION GRID CARDS (2 Columns x 3 Rows) */}
        <div className="grid grid-cols-2 gap-2.5 pb-6">
          {/* Card 1: Daily Logins */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenDailyLogins();
            }}
            className={`relative p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-cyan-950/20 hover:to-cyan-950/40 border flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-96 group min-h-[88px] ${
              !hasClaimedCheckin
                ? 'border-cyan-400 ring-2 ring-cyan-400/50 '
                : 'border-cyan-500/30 hover:border-cyan-400/60'
            }`}
          >
            {!hasClaimedCheckin && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className=" absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
            )}
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center text-2xl mb-1.5">
              <span className="text-2xl">📅</span>
              <span className="text-[10px] font-bold text-cyan-300 -ml-1">{new Date().getDate()}</span>
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
              Daily Logins
            </span>
          </button>

          {/* Card 2: Watch Rewarded Ad */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenWatchAd();
            }}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-96 group min-h-[88px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-2xl mb-1.5">
              📺
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
              Watch Rewarded Ad
            </span>
          </button>

          {/* Card 3: Spin the Wheel */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSpinWheel();
            }}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-96 group min-h-[88px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-2xl mb-1.5">
              🎡
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
              Spin the Wheel
            </span>
          </button>

          {/* Card 4: Walking Steps */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenWalking();
            }}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-96 group min-h-[88px] relative"
          >
            {onOpenSocialChallenge && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  onOpenSocialChallenge();
                }}
                className="absolute top-2 right-2 px-1.5 py-0.2 rounded-full bg-sky-500/25 border border-sky-400/40 text-[8px] font-bold text-sky-300 hover:text-white hover:bg-sky-500/40 transition-colors"
                title="View Weekly Step Sprint Challenge"
              >
                Sprint 🔥
              </span>
            )}
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-2xl mb-1.5">
              🚶
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
              Walking Steps
            </span>
            <span className="text-[9px] font-mono text-cyan-300/90 font-semibold mt-0.5">
              {stepsToday.toLocaleString()} steps
            </span>
          </button>

          {/* Card 5: Scratch & Win Paws */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenScratchCards();
            }}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-96 group min-h-[88px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-2xl mb-1.5">
              🎟️
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
              Scratch & Win Paws
            </span>
          </button>

          {/* Card 6: Fruit Tap */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenFruitTap();
            }}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-96 group min-h-[88px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-2xl mb-1.5">
              🍉
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
              Fruit Tap
            </span>
          </button>
        </div>

        {/* Daily Missions Component */}
        <div id="missions-section" className="pb-1 scroll-mt-4">
<HideableSection id="missions" hidden={hiddenSections} onHide={hideSection}>
          <DailyMissions
            stepsToday={stepsToday}
            gamesPlayedToday={gamesPlayedToday}
            tapMineCount={tapMineCount}
            adsWatchedToday={adsWatchedToday}
            hasClaimedCheckin={hasClaimedCheckin}
            claimedMissionIds={claimedMissionIds}
            onClaimMission={onClaimMission}
            onOpenWalking={onOpenWalking}
            onOpenGames={onOpenFruitTap}
            onOpenWatchAd={onOpenWatchAd}
            onOpenDailyLogins={onOpenDailyLogins}
            onScrollToMine={() => {
              document.getElementById('mine-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
</HideableSection>
        </div>

        {/* Daily Habit Tracker & Weekly Consistency Section */}
        <div id="habits-section" className="pb-1 scroll-mt-4 flex flex-col gap-2.5">
<HideableSection id="habitsWeekly" hidden={hiddenSections} onHide={hideSection}>
<Suspense fallback={<div className="h-40" />}>
          <HabitsWeeklyConsistency
            personalGoals={personalGoals}
            onScrollToHabits={() => {
              document.getElementById('habits-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
</Suspense>
</HideableSection>

<HideableSection id="habitTracker" hidden={hiddenSections} onHide={hideSection}>
          <DailyHabitTracker
            habits={personalGoals}
            onToggleHabit={onToggleGoal}
            onAddHabit={onAddGoal}
            onEditHabit={onEditGoal}
            onDeleteHabit={onDeleteGoal}
          />
</HideableSection>
        </div>

        {/* Daily Trivia Quiz Component */}
        <div className="pb-1">
<HideableSection id="trivia" hidden={hiddenSections} onHide={hideSection}>
          <DailyTriviaQuiz
            triviaAnsweredDate={triviaAnsweredDate}
            onRewardEarned={onTriviaReward}
          />
</HideableSection>
        </div>

        {/* 7-Day Cross-Activity Weekly Performance Analytics */}
        <div id="analytics-section" className="pb-1 scroll-mt-4">
<HideableSection id="weeklyPerf" hidden={hiddenSections} onHide={hideSection}>
<Suspense fallback={<div className="h-40" />}>
          <WeeklyPerformanceChart
            stepsToday={stepsToday}
            balancePhp={balancePhp}
            habitsCompletedCount={personalGoals.filter((g) => g.completed).length}
            totalHabitsCount={personalGoals.length}
          />
</Suspense>
</HideableSection>
        </div>

        {/* Live Top 10 Earners Leaderboard */}
        <div id="leaderboard-section" className="pb-4 scroll-mt-4">
<HideableSection id="leaderboard" hidden={hiddenSections} onHide={hideSection}>
          <Leaderboard
            currentUserTotalEarned={currentUserTotalEarned}
            currentUserName={currentUserName}
            onOpenProfile={onOpenProfile}
          />
</HideableSection>
        </div>

        {hiddenSections.length > 0 && (
          <button
            onClick={showAllSections}
            className="mx-auto mb-4 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-cyan-300 cursor-pointer"
          >
            Show hidden sections ({hiddenSections.length})
          </button>
        )}
      </div>
    </div>
  );
};
