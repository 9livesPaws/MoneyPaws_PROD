import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Menu, User, Sparkles, Footprints, Tv, Calendar, RefreshCw, Trophy, ArrowRight, ExternalLink, Share2 } from 'lucide-react';
import { sound } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { fireRewardConfetti } from '../utils/confetti';
import { formatPhp } from '../utils/storage';
import { Leaderboard } from './Leaderboard';
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
  onTapMine: () => void;
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

interface FloatingTap {
  id: number;
  x: number;
  y: number;
  text: string;
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
  onTapMine,
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
  const [floatingTaps, setFloatingTaps] = useState<FloatingTap[]>([]);
  const [isMiningPressed, setIsMiningPressed] = useState(false);
  const [nextId, setNextId] = useState(1);
  const [currentTime, setCurrentTime] = useState('12:04 AM');

  // Realistic Android clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle central "TAP TO MINE"
  const handleTap = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    sound.playCoin();
    haptics.tapMine();
    setIsMiningPressed(true);
    setTimeout(() => setIsMiningPressed(false), 150);

    // Get click coordinates for floating reward text
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const relX = clientX ? clientX - rect.left : rect.width / 2;
    const relY = clientY ? clientY - rect.top : rect.height / 2;

    const newFloat: FloatingTap = {
      id: nextId,
      x: relX,
      y: relY,
      text: '+₱0.01',
    };

    setNextId((prev) => prev + 1);
    setFloatingTaps((prev) => [...prev.slice(-6), newFloat]);

    onTapMine();

    // Occasional confetti on milestones
    if ((tapMineCount + 1) % 25 === 0) {
      fireRewardConfetti(0.4);
    }
  };

  // Clean up floating taps after animation
  useEffect(() => {
    if (floatingTaps.length === 0) return;
    const timer = setTimeout(() => {
      setFloatingTaps((prev) => prev.slice(1));
    }, 700);
    return () => clearTimeout(timer);
  }, [floatingTaps]);

  // Threshold percentage
  const thresholdPercent = Math.min(100, Math.max(3, (balancePhp / targetThresholdPhp) * 100));

  return (
    <div className="w-full flex flex-col justify-start select-none">
      {/* Android Top Status Bar */}
      <div className="w-full px-5 pt-1.5 pb-1 flex items-center justify-between text-[11px] font-medium text-slate-300">
        <span className="font-semibold text-slate-200">{currentTime}</span>
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <span className="text-[9px] font-mono font-bold bg-slate-800/80 px-1 py-0.2 rounded text-cyan-300">
            Vo LTE
          </span>
          <span className="text-[9px] font-mono font-bold bg-slate-800/80 px-1 py-0.2 rounded text-cyan-300">
            4G LTE
          </span>
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] text-cyan-300 font-mono">21%</span>
            <div className="w-4 h-2.5 rounded-xs border border-cyan-400 p-0.2 flex items-center">
              <div className="h-full bg-cyan-400 w-1/4 rounded-2xs" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Top Header Bar (Hamburger, Title, Profile Avatar) */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        {/* Hamburger Menu */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenMenu();
          }}
          className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-cyan-500/30 text-cyan-400 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-md shadow-cyan-950/40"
          title="Open Menu"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Brand Title with MoneyPaws Logo and Cyan Neon Glow */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 p-0.5 shadow-[0_0_14px_rgba(6,182,212,0.6)] flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-base">
              🐾
            </div>
          </div>
          <h1 className="font-fredoka text-2xl font-bold tracking-normal bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
            MoneyPaws
          </h1>
        </div>

        {/* Profile Avatar Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-cyan-500/30 text-cyan-400 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-md shadow-cyan-950/40"
          title="User Profile"
        >
          <User className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      <div className="px-4 flex flex-col gap-3 mt-1">
        {/* DAILY NEWS / UPDATES TICKER */}
        <DailyNewsTicker />

        {/* TOTAL EARNINGS BALANCE CARD */}
        <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/95 via-cyan-950/35 to-slate-900/95 border border-cyan-500/40 p-4 shadow-[0_0_20px_rgba(6,182,212,0.18)] overflow-hidden">
          {/* Subtle cyan ambient highlight */}
          <div className="absolute -top-10 left-1/4 w-40 h-20 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Top row: Label + Balance on left, Cash Out button on right */}
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/80">
                TOTAL EARNINGS BALANCE
              </span>
              <div className="font-mono text-3xl font-extrabold text-cyan-400 tracking-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.65)] mt-0.5">
                {formatPhp(balancePhp)}
              </div>
            </div>

            {/* Buttons: Share Earnings & Cash Out */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenShareEarnings();
                }}
                className="p-2 rounded-xl bg-slate-950/90 hover:bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(6,182,212,0.2)] flex items-center gap-1 text-xs font-bold"
                title="Share Earnings Card"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenCashOut();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-950/90 hover:bg-cyan-950/80 border-2 border-cyan-400 text-white font-extrabold text-xs tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_22px_rgba(6,182,212,0.65)] active:scale-95 transition-all cursor-pointer"
              >
                Cash Out
              </button>
            </div>
          </div>

          {/* Glowing Cyan Progress Bar */}
          <div className="w-full bg-slate-950/90 h-2 rounded-full mt-3 overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-500"
              style={{ width: `${thresholdPercent}%` }}
            />
          </div>

          {/* Subtext Underneath */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
            <span>Next Target Threshold:</span>
            <span className="font-mono text-cyan-300 font-bold flex items-center gap-1">
              <span>{`P.${(balancePhp % 1).toFixed(2).slice(2) || '65'}/ ${targetThresholdPhp.toFixed(3)}`}</span>
              <span className="text-cyan-400 text-xs">🐾</span>
            </span>
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

        {/* SCROLLING MARQUEE BANNER */}
        <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 px-3 py-1.5 overflow-hidden shadow-inner flex flex-col">
          <div className="whitespace-nowrap overflow-hidden flex items-center text-xs font-semibold text-slate-300">
            <div className="inline-block animate-[marquee_18s_linear_infinite] flex items-center gap-3">
              <span className="text-cyan-400">|</span>
              <span className="text-slate-200">ADS REWARDS</span>
              <span className="text-cyan-400">•</span>
              <span className="text-slate-200">🚶 WALKING STEPS</span>
              <span className="text-cyan-400">•</span>
              <span className="text-slate-200">ONE WALLET</span>
              <span className="text-cyan-400">•</span>
              <span className="text-amber-300">FRUIT TAP REWARDS</span>
              <span className="text-cyan-400">•</span>
              <span className="text-slate-200">LUCKY SPINS</span>
              <span className="text-cyan-400">•</span>
              <span className="text-emerald-300">DAILY PASSIVE CASH</span>
              <span className="text-cyan-400">•</span>
            </div>
          </div>
        </div>

        {/* HERO CENTER CARD: TAP TO MINE */}
        <div id="mine-section" className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 via-cyan-950/30 to-slate-900/90 border border-cyan-500/40 p-5 shadow-[0_0_25px_rgba(6,182,212,0.18)] flex flex-col items-center justify-center overflow-hidden scroll-mt-6">
          {/* Subtle cyan ring glow */}
          <div className="absolute w-52 h-52 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          {/* Central Circular Glowing Button */}
          <div className="relative">
            {/* Ambient Star Sparkle / Flare on upper right edge */}
            <div className="absolute -top-1.5 -right-1.5 z-20 pointer-events-none text-cyan-200 animate-pulse">
              <Sparkles className="w-5 h-5 filter drop-shadow-[0_0_8px_#38bdf8]" />
            </div>

            <button
              onClick={handleTap}
              className={`relative w-36 h-36 rounded-full bg-gradient-to-b from-cyan-500/30 via-slate-950 to-cyan-950/80 border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.5)] flex flex-col items-center justify-center transition-all cursor-pointer select-none active:scale-92 ${
                isMiningPressed ? 'scale-95 shadow-[0_0_45px_rgba(6,182,212,0.85)] border-cyan-300' : 'hover:scale-102'
              }`}
            >
              {/* Internal Cyan Circle Glow */}
              <div className="w-28 h-28 rounded-full bg-cyan-500/15 border border-cyan-400/40 flex flex-col items-center justify-center">
                {/* Two Cute Cyan Paw Prints */}
                <div className="flex items-center gap-1.5 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.9)] animate-float">
                  <span className="text-3xl select-none">🐾</span>
                  <span className="text-2xl select-none -mt-2">🐾</span>
                </div>
              </div>

              {/* Floating Tap Text */}
              {floatingTaps.map((f) => (
                <span
                  key={f.id}
                  style={{ left: `${f.x}px`, top: `${f.y}px` }}
                  className="absolute font-mono font-extrabold text-sm text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.9)] pointer-events-none -translate-x-1/2 -translate-y-8 animate-out fade-out slide-out-to-top duration-700"
                >
                  {f.text}
                </span>
              ))}
            </button>
          </div>

          {/* TAP TO MINE Text Underneath */}
          <span className="mt-3.5 font-fredoka font-bold text-base tracking-wider text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.7)] uppercase">
            TAP TO MINE
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            Taps Today: <strong className="text-cyan-300 font-mono">{tapMineCount}</strong> • Micro-payouts credited
          </span>
        </div>

        {/* 6 ACTION GRID CARDS (2 Columns x 3 Rows) */}
        <div className="grid grid-cols-2 gap-2.5 pb-6">
          {/* Card 1: Daily Logins */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenDailyLogins();
            }}
            className={`relative p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-cyan-950/20 hover:to-cyan-950/40 border shadow-[0_0_12px_rgba(6,182,212,0.1)] flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-96 group min-h-[88px] ${
              !hasClaimedCheckin
                ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.45)] ring-2 ring-cyan-400/50 animate-pulse'
                : 'border-cyan-500/30 hover:border-cyan-400/60'
            }`}
          >
            {!hasClaimedCheckin && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
            )}
            <div className={`text-2xl mb-1 flex items-center justify-center transition-transform ${!hasClaimedCheckin ? 'scale-110 drop-shadow-[0_0_8px_#38bdf8] animate-bounce' : 'group-hover:scale-110'}`}>
              <span className="text-2xl">📅</span>
              <span className="text-[10px] font-bold text-cyan-300 -ml-1">17</span>
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
            className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-cyan-950/20 hover:to-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.1)] flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-96 group min-h-[88px]"
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
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
            className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-cyan-950/20 hover:to-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.1)] flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-96 group min-h-[88px]"
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
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
            className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-cyan-950/20 hover:to-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.1)] flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-96 group min-h-[88px] relative"
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
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
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
            className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-cyan-950/20 hover:to-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.1)] flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-96 group min-h-[88px]"
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
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
            className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-cyan-950/20 hover:to-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.1)] flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-96 group min-h-[88px]"
          >
            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
              🍉
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
              Fruit Tap
            </span>
          </button>
        </div>

        {/* Daily Missions Component */}
        <div id="missions-section" className="pb-1 scroll-mt-4">
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
        </div>

        {/* Daily Habit Tracker & Weekly Consistency Section */}
        <div id="habits-section" className="pb-1 scroll-mt-4 flex flex-col gap-2.5">
<Suspense fallback={<div className="h-40" />}>
          <HabitsWeeklyConsistency
            personalGoals={personalGoals}
            onScrollToHabits={() => {
              document.getElementById('habits-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
</Suspense>

          <DailyHabitTracker
            habits={personalGoals}
            onToggleHabit={onToggleGoal}
            onAddHabit={onAddGoal}
            onEditHabit={onEditGoal}
            onDeleteHabit={onDeleteGoal}
          />
        </div>

        {/* Daily Trivia Quiz Component */}
        <div className="pb-1">
          <DailyTriviaQuiz
            triviaAnsweredDate={triviaAnsweredDate}
            onRewardEarned={onTriviaReward}
          />
        </div>

        {/* 7-Day Cross-Activity Weekly Performance Analytics */}
        <div id="analytics-section" className="pb-1 scroll-mt-4">
<Suspense fallback={<div className="h-40" />}>
          <WeeklyPerformanceChart
            stepsToday={stepsToday}
            balancePhp={balancePhp}
            habitsCompletedCount={personalGoals.filter((g) => g.completed).length}
            totalHabitsCount={personalGoals.length}
          />
</Suspense>
        </div>

        {/* Live Top 10 Earners Leaderboard */}
        <div id="leaderboard-section" className="pb-4 scroll-mt-4">
          <Leaderboard
            currentUserTotalEarned={currentUserTotalEarned}
            currentUserName={currentUserName}
            onOpenProfile={onOpenProfile}
          />
        </div>
      </div>
    </div>
  );
};
