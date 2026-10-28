/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AuthScreen } from './components/AuthScreen';
import { RewardCelebration } from './components/RewardCelebration';
import { scheduleMiningDone, cancelMiningDone, scheduleDailyReminder } from './utils/notify';
import { MINING_DAILY_CAP_PHP, MINING_DURATION_MS, MINING_REWARD_PHP, todayKey } from './utils/mining';
import { initAds, showBottomBanner, hideBanner, resumeBanner, removeBanner, isNativeAds } from './utils/ads';
import { pushProgress, pullProgress } from './utils/supabase';
import { getSupabase, getCurrentSession, isAuthBusy, signOut, supabaseConfigured } from './utils/supabase';
import { loadUserState, saveUserState, formatPhp, hasSavedState } from './utils/storage';
import { UserState, Transaction, SupportTicket, SUPPORT_EMAIL } from './types';
import { sound } from './utils/sound';
import { haptics } from './utils/haptics';
import { fireRewardConfetti } from './utils/confetti';
import { MainDashboard } from './components/MainDashboard';
import { CashOutModal } from './components/views/CashOutModal';
const DailyCheckinModal = lazy(() => import('./components/DailyCheckinModal').then((m) => ({ default: m.DailyCheckinModal })));
import { WatchAndEarnModal } from './components/views/WatchAndEarnModal';
import { WalkingView } from './components/views/WalkingView';
import { GamesView } from './components/views/GamesView';
import { MenuDrawer } from './components/MenuDrawer';
const ProfileModal = lazy(() => import('./components/ProfileModal').then((m) => ({ default: m.ProfileModal })));
import { ReferralModal } from './components/ReferralModal';
import { SupportView } from './components/views/SupportView';
import { ChestReward } from './components/DailyLuckyChest';
import { ShareEarningsModal } from './components/ShareEarningsModal';
import { AchievementsView } from './components/AchievementsView';
import { WeeklySocialChallengeModal } from './components/WeeklySocialChallengeModal';
import { Smartphone, Monitor, X, Sparkles, Home, Pickaxe, Gamepad2, Footprints as FootprintsIcon, User as UserIcon } from 'lucide-react';

interface MainAppProps {
  userId?: string;
  username?: string;
  email?: string;
  onSignOut?: () => void;
}

function MainApp({ userId, username, email, onSignOut }: MainAppProps) {
  const [state, setState] = useState<UserState>(() => {
    const saved = loadUserState(userId);
    return {
      ...saved,
      userName: username || saved.userName,
      userEmail: email || saved.userEmail,
    };
  });
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [toast, setToast] = useState<{ message: string; icon?: string } | null>(null);

  // Modal / View states
  const [activeModal, setActiveModal] = useState<
    | null
    | 'cashout'
    | 'dailyLogins'
    | 'watchAd'
    | 'spinWheel'
    | 'walking'
    | 'scratch'
    | 'fruitTap'
    | 'menu'
    | 'profile'
    | 'referral'
    | 'support'
    | 'shareEarnings'
    | 'achievements'
    | 'socialChallenge'
  >(null);

  // Re-arm notifications when the app opens (only if the user already allowed them)
  useEffect(() => {
    const ends = stateRef.current.miningEndsAt;
    if (ends && ends > Date.now()) scheduleMiningDone(ends, false);
    scheduleDailyReminder();
  }, []);

  // Progress sync: restore after reinstall, then save to Supabase every 30s and when the app is backgrounded.
  const stateRef = useRef(state);
  stateRef.current = state;
  const syncReady = useRef(!userId || hasSavedState(userId));
  const lastSig = useRef('');

  useEffect(() => {
    if (!userId || syncReady.current) return;
    let alive = true;
    pullProgress(userId)
      .then((saved) => {
        if (alive && saved) setState({ ...saved, userName: username || saved.userName, userEmail: email || saved.userEmail });
      })
      .catch(() => {})
      .finally(() => {
        syncReady.current = true;
      });
    return () => {
      alive = false;
    };
  }, [userId, username, email]);

  useEffect(() => {
    if (!userId) return;
    const push = async () => {
      if (!syncReady.current) return;
      const s = stateRef.current;
      const sig = [s.balancePhp, s.totalEarnedPhp, s.adsWatchedToday, s.stepsToday, s.gamesPlayedToday, s.tapMineCount, s.miningEndsAt, s.consecutiveDays, s.referralCount, s.transactions.length].join('|');
      if (sig === lastSig.current) return;
      lastSig.current = sig;
      try {
        await pushProgress(userId, username || s.userName, email || s.userEmail, s);
      } catch {
        lastSig.current = ''; // try again next time
      }
    };
    const first = setTimeout(push, 5000);
    const iv = setInterval(push, 30000);
    const onVis = () => {
      if (document.visibilityState === 'hidden') push();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearTimeout(first);
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [userId, username, email]);


  // Synchronize sound & haptics enabled state
  useEffect(() => {
    sound.enabled = state.soundEnabled;
    haptics.enabled = state.soundEnabled;
  }, [state.soundEnabled]);

  // Persist state to localStorage on changes
  useEffect(() => {
    saveUserState(state, userId);
  }, [state, userId]);

  // Passive micro-mining tick (earns ₱0.01 every 45s while app is open)
  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        const nextBalance = Number((prev.balancePhp + 0.01).toFixed(2));
        const nextTotal = Number((prev.totalEarnedPhp + 0.01).toFixed(2));
        return {
          ...prev,
          balancePhp: nextBalance,
          totalEarnedPhp: nextTotal,
        };
      });
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  // Celebration screen (confetti + PawCoins + peso value) for claimed rewards
  const [celebration, setCelebration] = useState<{ php: number; title: string; key: number } | null>(null);
  const celebrate = useCallback((php: number, title: string) => {
    setCelebration({ php, title, key: Date.now() });
  }, []);

  // Add earnings helper
  const addEarnings = useCallback(
    (amount: number, title: string, type: Transaction['type']) => {
      setState((prev) => {
        const nextBalance = Number((prev.balancePhp + amount).toFixed(2));
        const nextTotal = Number((prev.totalEarnedPhp + amount).toFixed(2));

        const newTx: Transaction = {
          id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type,
          amountPhp: amount,
          title,
          timestamp: Date.now(),
          status: 'COMPLETED',
        };

        const isGame = type === 'GAME_FRUIT' || type === 'GAME_SPIN' || type === 'GAME_SCRATCH';

        return {
          ...prev,
          balancePhp: nextBalance,
          totalEarnedPhp: nextTotal,
          gamesPlayedToday: isGame ? prev.gamesPlayedToday + 1 : prev.gamesPlayedToday,
          transactions: [newTx, ...prev.transactions].slice(0, 50),
        };
      });
    },
    []
  );

  // CAT MINING: one tap starts a 3-hour session; claim the reward when it finishes (daily cap applies)
  const handleStartMining = useCallback(() => {
    const s0 = stateRef.current;
    const today = todayKey();
    const sessions = s0.miningDay === today ? s0.miningSessionsToday : 0;
    const earned = s0.miningDay === today ? s0.miningEarnedTodayPhp : 0;
    if (s0.miningEndsAt || earned >= MINING_DAILY_CAP_PHP - 0.0001) return;
    const now = Date.now();
    const endsAt = now + MINING_DURATION_MS;
    setState((prev) => ({
      ...prev,
      miningStartedAt: now,
      miningEndsAt: endsAt,
      miningDay: today,
      miningSessionsToday: sessions,
      miningEarnedTodayPhp: earned,
    }));
    scheduleMiningDone(endsAt, true); // asks for notification permission the first time
  }, []);

  const handleClaimMining = useCallback(() => {
    const s0 = stateRef.current;
    if (!s0.miningEndsAt || Date.now() < s0.miningEndsAt) return;
    const today = todayKey();
    const earned = s0.miningDay === today ? s0.miningEarnedTodayPhp : 0;
    const reward = Number(Math.min(MINING_REWARD_PHP, Math.max(0, MINING_DAILY_CAP_PHP - earned)).toFixed(2));
    cancelMiningDone();
    setState((prev) => ({
      ...prev,
      miningStartedAt: null,
      miningEndsAt: null,
      miningDay: today,
      miningSessionsToday: (prev.miningDay === today ? prev.miningSessionsToday : 0) + 1,
      miningEarnedTodayPhp: Number((earned + reward).toFixed(2)),
      tapMineCount: prev.tapMineCount + 1,
    }));
    if (reward > 0) {
      addEarnings(reward, 'Cat mining session', 'MINE_TAP');
      celebrate(reward, 'Cat mining session complete');
    }
  }, [addEarnings, celebrate]);

  // Add walking steps
  const handleAddSteps = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      stepsToday: prev.stepsToday + amount,
    }));
  }, []);

  // Convert steps to real balance
  const handleConvertSteps = useCallback(
    (stepsConverted: number, cashReward: number) => {
      celebrate(cashReward, `${stepsConverted} steps converted`);
      setState((prev) => {
        const nextBalance = Number((prev.balancePhp + cashReward).toFixed(2));
        const nextTotal = Number((prev.totalEarnedPhp + cashReward).toFixed(2));
        const nextSteps = Math.max(0, prev.stepsToday - stepsConverted);

        const newTx: Transaction = {
          id: `tx-walk-${Date.now()}`,
          type: 'WALK',
          amountPhp: cashReward,
          title: `Pedometer Step Conversion (${stepsConverted} steps)`,
          timestamp: Date.now(),
          status: 'COMPLETED',
        };

        return {
          ...prev,
          balancePhp: nextBalance,
          totalEarnedPhp: nextTotal,
          stepsToday: nextSteps,
          transactions: [newTx, ...prev.transactions].slice(0, 50),
        };
      });
    },
    []
  );

  // Daily Streak Claim
  const handleClaimDailyStreak = useCallback((day: number) => {
    const rewards = [0.50, 0.75, 1.00, 1.25, 1.50, 2.00, 5.00];
    const earned = rewards[Math.min(day - 1, rewards.length - 1)] || 0.50;
    celebrate(earned, `Day ${day} daily login bonus`);

    setState((prev) => {
      const nextBalance = Number((prev.balancePhp + earned).toFixed(2));
      const nextTotal = Number((prev.totalEarnedPhp + earned).toFixed(2));
      const todayStr = new Date().toISOString().split('T')[0];

      const newTx: Transaction = {
        id: `tx-daily-${Date.now()}`,
        type: 'DAILY_LOGIN',
        amountPhp: earned,
        title: `Day ${day} Daily Login Bonus`,
        timestamp: Date.now(),
        status: 'COMPLETED',
      };

      return {
        ...prev,
        balancePhp: nextBalance,
        totalEarnedPhp: nextTotal,
        consecutiveDays: prev.consecutiveDays + 1,
        lastCheckinDate: todayStr,
        freeSpins: prev.freeSpins + 1,
        freeScratchCards: prev.freeScratchCards + 1,
        transactions: [newTx, ...prev.transactions].slice(0, 50),
      };
    });
  }, []);

  // Watch Rewarded Ad Completed
  const handleAdRewardClaimed = useCallback((pawsScore: number) => {
    const cash = 0.20; // ₱0.20 per rewarded ad
    celebrate(cash, 'Rewarded ad watched');
    setState((prev) => {
      const nextBalance = Number((prev.balancePhp + cash).toFixed(2));
      const nextTotal = Number((prev.totalEarnedPhp + cash).toFixed(2));

      const newTx: Transaction = {
        id: `tx-ad-${Date.now()}`,
        type: 'WATCH_AD',
        amountPhp: cash,
        title: 'Watch Rewarded Ad Sponsor Bounty',
        timestamp: Date.now(),
        status: 'COMPLETED',
      };

      return {
        ...prev,
        balancePhp: nextBalance,
        totalEarnedPhp: nextTotal,
        adsWatchedToday: prev.adsWatchedToday + 1,
        freeSpins: prev.freeSpins + 1,
        transactions: [newTx, ...prev.transactions].slice(0, 50),
      };
    });
  }, [celebrate]);

  // Simulate friend referral
  const handleSimulateReferral = useCallback(() => {
    const bonus = 1.00; // ₱1.00 per referral
    setState((prev) => {
      const nextBalance = Number((prev.balancePhp + bonus).toFixed(2));
      const nextTotal = Number((prev.totalEarnedPhp + bonus).toFixed(2));
      const nextReferralEarnings = Number((prev.referralEarningsPhp + bonus).toFixed(2));

      const newTx: Transaction = {
        id: `tx-ref-${Date.now()}`,
        type: 'REFERRAL',
        amountPhp: bonus,
        title: 'New Friend Referral Credit',
        timestamp: Date.now(),
        status: 'COMPLETED',
      };

      return {
        ...prev,
        balancePhp: nextBalance,
        totalEarnedPhp: nextTotal,
        referralCount: prev.referralCount + 1,
        referralEarningsPhp: nextReferralEarnings,
        transactions: [newTx, ...prev.transactions].slice(0, 50),
      };
    });
  }, []);

  // Withdrawal Cash Out Request
  const handleWithdrawal = useCallback(
    (amount: number, method: string, account: string) => {
      setState((prev) => {
        const nextBalance = Math.max(0, Number((prev.balancePhp - amount).toFixed(2)));

        const newTx: Transaction = {
          id: `tx-wd-${Date.now()}`,
          type: 'WITHDRAWAL',
          amountPhp: -amount,
          title: `Cash Out via ${method}`,
          timestamp: Date.now(),
          status: 'PROCESSING',
          payoutMethod: method,
          accountNumber: account,
        };

        return {
          ...prev,
          balancePhp: nextBalance,
          transactions: [newTx, ...prev.transactions].slice(0, 50),
        };
      });
    },
    []
  );

  // Claim Daily Mission Reward
  const handleClaimMission = useCallback(
    (missionId: string, phpReward: number, pawsReward: number, title: string) => {
      celebrate(phpReward, `Mission: ${title}`);
      setState((prev) => {
        if (prev.claimedMissionIds.includes(missionId)) return prev;
        const nextBalance = Number((prev.balancePhp + phpReward).toFixed(2));
        const nextTotal = Number((prev.totalEarnedPhp + phpReward).toFixed(2));

        const newTx: Transaction = {
          id: `tx-mission-${Date.now()}`,
          type: 'DAILY_MISSION',
          amountPhp: phpReward,
          title: `Daily Mission: ${title} (+${pawsReward} Paws)`,
          timestamp: Date.now(),
          status: 'COMPLETED',
        };

        return {
          ...prev,
          balancePhp: nextBalance,
          totalEarnedPhp: nextTotal,
          claimedMissionIds: [...prev.claimedMissionIds, missionId],
          freeSpins: missionId === 'm-mega-chest' ? prev.freeSpins + 1 : prev.freeSpins,
          transactions: [newTx, ...prev.transactions].slice(0, 50),
        };
      });
    },
    []
  );

  // Claim Daily Lucky Chest (Distinct Mystery Event)
  const handleClaimLuckyChest = useCallback((reward: ChestReward) => {
    setState((prev) => {
      const todayStr = new Date().toISOString().split('T')[0];
      const nextBalance = Number((prev.balancePhp + reward.php).toFixed(2));
      const nextTotal = Number((prev.totalEarnedPhp + reward.php).toFixed(2));
      const bonusSpins = reward.bonusSpins || 0;
      const bonusCards = reward.bonusCards || 0;

      const newTx: Transaction = {
        id: `tx-chest-${Date.now()}`,
        type: 'LUCKY_CHEST',
        amountPhp: reward.php,
        title: `Daily Lucky Chest: ${reward.tierName} (+${reward.paws} Paws)`,
        timestamp: Date.now(),
        status: 'COMPLETED',
      };

      return {
        ...prev,
        balancePhp: nextBalance,
        totalEarnedPhp: nextTotal,
        lastLuckyChestDate: todayStr,
        freeSpins: prev.freeSpins + bonusSpins,
        freeScratchCards: prev.freeScratchCards + bonusCards,
        transactions: [newTx, ...prev.transactions].slice(0, 50),
      };
    });
  }, []);

  // Add Support Ticket
  const handleAddTicket = useCallback((ticket: SupportTicket) => {
    setState((prev) => ({
      ...prev,
      tickets: [ticket, ...prev.tickets],
    }));
  }, []);

  // Sound Toggle
  const handleToggleSound = useCallback(() => {
    setState((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  }, []);

  // Toast notification
  const showToast = useCallback((message: string, icon?: string) => {
    setToast({ message, icon });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Theme Toggle (Slate vs AMOLED True Black)
  const handleToggleTheme = useCallback(() => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'slate' ? 'amoled' : 'slate',
    }));
  }, []);

  // Battery Saver Mode Toggle
  const handleToggleBatterySaver = useCallback(() => {
    setState((prev) => ({
      ...prev,
      batterySaver: !prev.batterySaver,
    }));
  }, []);

  // Daily Habits (Toggle, Add, Edit, Delete)
  const handleToggleGoal = useCallback((id: string) => {
    setState((prev) => {
      const habit = prev.personalGoals.find((g) => g.id === id);
      if (!habit) return prev;
      const willBeCompleted = !habit.completed;
      const rewardPaws = willBeCompleted ? habit.rewardPaws : 0;
      const rewardPhp = Number((rewardPaws / 1000).toFixed(2));
      const nextBalance = Number((prev.balancePhp + rewardPhp).toFixed(2));
      const nextTotal = Number((prev.totalEarnedPhp + rewardPhp).toFixed(2));

      const updatedGoals = prev.personalGoals.map((g) => {
        if (g.id !== id) return g;
        const currentStreak = g.streakDays || 1;
        const newStreak = willBeCompleted ? currentStreak + 1 : Math.max(1, currentStreak - 1);
        return { ...g, completed: willBeCompleted, streakDays: newStreak };
      });

      const newTx: Transaction | undefined = willBeCompleted
        ? {
            id: `tx-habit-${Date.now()}`,
            type: 'HABIT_GOAL',
            amountPhp: rewardPhp,
            title: `Habit Completed: ${habit.title} (+${rewardPaws} Paws)`,
            timestamp: Date.now(),
            status: 'COMPLETED',
          }
        : undefined;

      return {
        ...prev,
        balancePhp: nextBalance,
        totalEarnedPhp: nextTotal,
        personalGoals: updatedGoals,
        transactions: newTx ? [newTx, ...prev.transactions].slice(0, 50) : prev.transactions,
      };
    });
  }, []);

  const handleAddGoal = useCallback((title: string, icon: string) => {
    setState((prev) => ({
      ...prev,
      personalGoals: [
        ...prev.personalGoals,
        { id: `goal-${Date.now()}`, title, icon, rewardPaws: 50, completed: false, streakDays: 1 },
      ],
    }));
    showToast(`Added habit: ${title}`, icon);
  }, [showToast]);

  const handleEditGoal = useCallback((id: string, newTitle: string, newIcon: string) => {
    setState((prev) => ({
      ...prev,
      personalGoals: prev.personalGoals.map((g) =>
        g.id === id ? { ...g, title: newTitle, icon: newIcon } : g
      ),
    }));
    showToast(`Updated habit: ${newTitle}`, newIcon);
  }, [showToast]);

  const handleDeleteGoal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      personalGoals: prev.personalGoals.filter((g) => g.id !== id),
    }));
    showToast('Habit removed', '🗑️');
  }, [showToast]);

  // Trivia Reward Handler
  const handleTriviaReward = useCallback((php: number, paws: number, title: string) => {
    celebrate(php, title);
    setState((prev) => {
      const todayStr = new Date().toISOString().split('T')[0];
      const nextBalance = Number((prev.balancePhp + php).toFixed(2));
      const nextTotal = Number((prev.totalEarnedPhp + php).toFixed(2));
      const newTx: Transaction = {
        id: `tx-trivia-${Date.now()}`,
        type: 'TRIVIA',
        amountPhp: php,
        title: `${title} (+${paws} Paws)`,
        timestamp: Date.now(),
        status: 'COMPLETED',
      };
      return {
        ...prev,
        balancePhp: nextBalance,
        totalEarnedPhp: nextTotal,
        triviaAnsweredDate: todayStr,
        transactions: [newTx, ...prev.transactions].slice(0, 50),
      };
    });
  }, []);

  // Milestone Badge Claim
  const handleClaimAchievement = useCallback((id: string, php: number, paws: number, title: string) => {
    celebrate(php, `Milestone: ${title}`);
    setState((prev) => {
      if (prev.unlockedAchievementIds.includes(id)) return prev;
      const nextBalance = Number((prev.balancePhp + php).toFixed(2));
      const nextTotal = Number((prev.totalEarnedPhp + php).toFixed(2));
      const newTx: Transaction = {
        id: `tx-ach-${Date.now()}`,
        type: 'ACHIEVEMENT',
        amountPhp: php,
        title: `Milestone Badge: ${title} (+${formatPhp(php)})`,
        timestamp: Date.now(),
        status: 'COMPLETED',
      };
      return {
        ...prev,
        balancePhp: nextBalance,
        totalEarnedPhp: nextTotal,
        unlockedAchievementIds: [...prev.unlockedAchievementIds, id],
        transactions: [newTx, ...prev.transactions].slice(0, 50),
      };
    });
    showToast(`Milestone Unlocked: ${title}!`, '🏆');
  }, [showToast]);

  // Social Challenge Reward Claim
  const handleSocialChallengeReward = useCallback((paws: number, php: number, title: string) => {
    celebrate(php, title);
    setState((prev) => {
      const nextBalance = Number((prev.balancePhp + php).toFixed(2));
      const nextTotal = Number((prev.totalEarnedPhp + php).toFixed(2));
      const newTx: Transaction = {
        id: `tx-challenge-${Date.now()}`,
        type: 'WALK',
        amountPhp: php,
        title: `${title} (+${paws} Paws)`,
        timestamp: Date.now(),
        status: 'COMPLETED',
      };
      return {
        ...prev,
        balancePhp: nextBalance,
        totalEarnedPhp: nextTotal,
        transactions: [newTx, ...prev.transactions].slice(0, 50),
      };
    });
    showToast(`Weekly Challenge Reward Claimed: +${paws} Paws!`, '🏃‍♂️');
  }, [showToast]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-0 md:p-4 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Top Floating View Switcher (Desktop only) */}
      <div className="hidden md:flex fixed top-3 right-4 z-40 items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-full border border-cyan-500/30 text-xs text-slate-300 shadow-xl">
        <span className="text-[11px] text-slate-400">Preview:</span>
        <button
          onClick={() => setIsPhoneFrame(true)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
            isPhoneFrame ? 'bg-cyan-500 text-slate-950' : 'hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Android Frame</span>
        </button>
        <button
          onClick={() => setIsPhoneFrame(false)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
            !isPhoneFrame ? 'bg-cyan-500 text-slate-950' : 'hover:text-white'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Full Width</span>
        </button>
      </div>

      {/* Main Container: Mobile Phone Shell or Responsive Canvas */}
      <main
        className={`w-full transition-all duration-300 ${
          isPhoneFrame
            ? 'max-w-[410px] min-h-[840px] bg-slate-950 rounded-none md:rounded-[44px] border-0 md:border-[10px] md:border-slate-800 shadow-none md:shadow-[0_0_60px_rgba(6,182,212,0.25)] relative overflow-hidden flex flex-col'
            : 'max-w-2xl min-h-screen bg-slate-950 shadow-2xl relative overflow-hidden flex flex-col'
        }`}
      >
        {/* Android Speaker Grill & Camera Punch-hole (Frame mode) */}
        {isPhoneFrame && (
          <div className="hidden md:flex absolute top-2 left-1/2 -translate-x-1/2 z-30 items-center gap-3 pointer-events-none">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950 ring-1 ring-cyan-500/40" />
            </div>
            <div className="w-12 h-1 rounded-full bg-slate-800" />
          </div>
        )}

        {/* Primary Screen Content: Exactly replicating the uploaded mockup */}
        <div className="flex-1 w-full overflow-y-auto pb-6 native-pad">
          <MainDashboard
            balancePhp={state.balancePhp}
            targetThresholdPhp={state.targetThresholdPhp}
            tapMineCount={state.miningDay === todayKey() ? state.miningSessionsToday : 0}
            currentUserTotalEarned={state.totalEarnedPhp}
            currentUserName={state.userName}
            stepsToday={state.stepsToday}
            gamesPlayedToday={state.gamesPlayedToday}
            adsWatchedToday={state.adsWatchedToday}
            hasClaimedCheckin={state.lastCheckinDate === new Date().toISOString().split('T')[0]}
            claimedMissionIds={state.claimedMissionIds}
            lastLuckyChestDate={state.lastLuckyChestDate}
            theme={state.theme}
            batterySaver={state.batterySaver}
            personalGoals={state.personalGoals}
            triviaAnsweredDate={state.triviaAnsweredDate}
            miningStartedAt={state.miningEndsAt ? state.miningStartedAt : null}
            miningEndsAt={state.miningEndsAt}
            miningSessionsToday={state.miningDay === todayKey() ? state.miningSessionsToday : 0}
            miningEarnedTodayPhp={state.miningDay === todayKey() ? state.miningEarnedTodayPhp : 0}
            onStartMining={handleStartMining}
            onClaimMining={handleClaimMining}
            onOpenCashOut={() => setActiveModal('cashout')}
            onOpenShareEarnings={() => setActiveModal('shareEarnings')}
            onOpenMenu={() => setActiveModal('menu')}
            onOpenProfile={() => setActiveModal('profile')}
            onOpenDailyLogins={() => setActiveModal('dailyLogins')}
            onOpenWatchAd={() => setActiveModal('watchAd')}
            onOpenSpinWheel={() => setActiveModal('spinWheel')}
            onOpenWalking={() => setActiveModal('walking')}
            onOpenScratchCards={() => setActiveModal('scratch')}
            onOpenFruitTap={() => setActiveModal('fruitTap')}
            onClaimMission={handleClaimMission}
            onClaimChest={handleClaimLuckyChest}
            onToggleGoal={handleToggleGoal}
            onAddGoal={handleAddGoal}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteGoal}
            onTriviaReward={handleTriviaReward}
            onOpenSocialChallenge={() => setActiveModal('socialChallenge')}
          />
        </div>

        {/* Mobile Bottom Navigation Bar (True native mobile feel) */}
        <div className="w-full bg-slate-950/95 border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around z-20 shrink-0 select-none">
          <button
            onClick={() => {
              sound.playClick();
              setActiveModal(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex flex-col items-center gap-0.5 text-cyan-400 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg"
          >
            <Home className="w-4 h-4" />
            <span className="text-[9px] font-semibold">Home</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveModal(null);
              document.getElementById('mine-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer py-1 px-2 rounded-lg"
          >
            <Pickaxe className="w-4 h-4" />
            <span className="text-[9px] font-semibold">Mine</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveModal('fruitTap');
            }}
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer py-1 px-2 rounded-lg"
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="text-[9px] font-semibold">Games</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveModal('walking');
            }}
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer py-1 px-2 rounded-lg"
          >
            <FootprintsIcon className="w-4 h-4" />
            <span className="text-[9px] font-semibold">Walk</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveModal('profile');
            }}
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer py-1 px-2 rounded-lg"
          >
            <UserIcon className="w-4 h-4" />
            <span className="text-[9px] font-semibold">Profile</span>
          </button>
        </div>

        {/* Android Home Navigation Pill Indicator */}
        <div className="w-full py-1.5 flex items-center justify-center bg-slate-950/80 pointer-events-none">
          <div className="w-32 h-1 rounded-full bg-slate-700/80" />
        </div>
      </main>

      {/* ========================================================
          MODALS & SUB-SCREENS
          ======================================================== */}

      {/* Cash Out Modal */}
      <CashOutModal
        isOpen={activeModal === 'cashout'}
        onClose={() => setActiveModal(null)}
        balancePhp={state.balancePhp}
        targetThresholdPhp={state.targetThresholdPhp}
        onWithdraw={handleWithdrawal}
        userName={state.userName}
        userEmail={state.userEmail}
      />

      {/* Daily Check-in Streak Modal */}
      <Suspense fallback={null}>
      <DailyCheckinModal
        isOpen={activeModal === 'dailyLogins'}
        onClose={() => setActiveModal(null)}
        consecutiveDays={state.consecutiveDays}
        lastCheckinDate={state.lastCheckinDate}
        onClaimDaily={handleClaimDailyStreak}
      />
      </Suspense>

      {/* Watch Rewarded Ad Modal */}
      <WatchAndEarnModal
        isOpen={activeModal === 'watchAd'}
        onClose={() => setActiveModal(null)}
        onRewardClaimed={handleAdRewardClaimed}
        adsWatchedToday={state.adsWatchedToday}
      />

      {/* Walking Steps Modal / View */}
      {activeModal === 'walking' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-slate-950 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                sound.playClick();
                setActiveModal(null);
              }}
              className="sticky top-0 z-30 self-end -mb-7 shrink-0 p-1.5 rounded-full bg-slate-900 border border-slate-600 text-slate-200 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <WalkingView
              stepsToday={state.stepsToday}
              stepsGoal={state.stepsGoal}
              onAddSteps={handleAddSteps}
              onConvertStepsToCash={handleConvertSteps}
              onClose={() => setActiveModal(null)}
              onOpenSocialChallenge={() => setActiveModal('socialChallenge')}
            />
          </div>
        </div>
      )}

      {/* Spin the Wheel Modal / View */}
      {activeModal === 'spinWheel' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-slate-950 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                sound.playClick();
                setActiveModal(null);
              }}
              className="sticky top-0 z-30 self-end -mb-7 shrink-0 p-1.5 rounded-full bg-slate-900 border border-slate-600 text-slate-200 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <GamesView
              paws={Math.round(state.balancePhp * 1000)}
              freeSpins={state.freeSpins}
              freeScratchCards={state.freeScratchCards}
              onAddPaws={(paws, title, type) => {
                const php = Number((paws / 1000).toFixed(2));
                addEarnings(php, title, type);
                if (php >= 0.01) celebrate(php, title);
              }}
              onUseFreeSpin={() => {
                setState((prev) => ({ ...prev, freeSpins: Math.max(0, prev.freeSpins - 1) }));
              }}
              onUseScratchCard={() => {
                setState((prev) => ({ ...prev, freeScratchCards: Math.max(0, prev.freeScratchCards - 1) }));
              }}
              onOpenWatchAd={() => {
                setActiveModal('watchAd');
              }}
            />
          </div>
        </div>
      )}

      {/* Scratch & Win Paws Modal / View */}
      {activeModal === 'scratch' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-slate-950 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                sound.playClick();
                setActiveModal(null);
              }}
              className="sticky top-0 z-30 self-end -mb-7 shrink-0 p-1.5 rounded-full bg-slate-900 border border-slate-600 text-slate-200 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <GamesView
              paws={Math.round(state.balancePhp * 1000)}
              freeSpins={state.freeSpins}
              freeScratchCards={state.freeScratchCards}
              onAddPaws={(paws, title, type) => {
                const php = Number((paws / 1000).toFixed(2));
                addEarnings(php, title, type);
                if (php >= 0.01) celebrate(php, title);
              }}
              onUseFreeSpin={() => {
                setState((prev) => ({ ...prev, freeSpins: Math.max(0, prev.freeSpins - 1) }));
              }}
              onUseScratchCard={() => {
                setState((prev) => ({ ...prev, freeScratchCards: Math.max(0, prev.freeScratchCards - 1) }));
              }}
              onOpenWatchAd={() => {
                setActiveModal('watchAd');
              }}
            />
          </div>
        </div>
      )}

      {/* Fruit Tap Modal / View */}
      {activeModal === 'fruitTap' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-slate-950 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                sound.playClick();
                setActiveModal(null);
              }}
              className="sticky top-0 z-30 self-end -mb-7 shrink-0 p-1.5 rounded-full bg-slate-900 border border-slate-600 text-slate-200 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <GamesView
              paws={Math.round(state.balancePhp * 1000)}
              freeSpins={state.freeSpins}
              freeScratchCards={state.freeScratchCards}
              onAddPaws={(paws, title, type) => {
                const php = Number((paws / 1000).toFixed(2));
                addEarnings(php, title, type);
                if (php >= 0.01) celebrate(php, title);
              }}
              onUseFreeSpin={() => {
                setState((prev) => ({ ...prev, freeSpins: Math.max(0, prev.freeSpins - 1) }));
              }}
              onUseScratchCard={() => {
                setState((prev) => ({ ...prev, freeScratchCards: Math.max(0, prev.freeScratchCards - 1) }));
              }}
              onOpenWatchAd={() => {
                setActiveModal('watchAd');
              }}
            />
          </div>
        </div>
      )}

      {/* Slide-out Menu Drawer */}
      <MenuDrawer
        isOpen={activeModal === 'menu'}
        onClose={() => setActiveModal(null)}
        soundEnabled={state.soundEnabled}
        onToggleSound={handleToggleSound}
        theme={state.theme}
        onToggleTheme={handleToggleTheme}
        batterySaver={state.batterySaver}
        onToggleBatterySaver={handleToggleBatterySaver}
        onOpenReferral={() => setActiveModal('referral')}
        onOpenSupport={() => setActiveModal('support')}
        onOpenFaq={() => setActiveModal('support')}
        onOpenLeaderboard={() => {
          setActiveModal(null);
          setTimeout(() => {
            document.getElementById('leaderboard-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        onOpenMissions={() => {
          setActiveModal(null);
          setTimeout(() => {
            document.getElementById('missions-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        onOpenShareEarnings={() => setActiveModal('shareEarnings')}
        onOpenAchievements={() => setActiveModal('achievements')}
        onOpenSocialChallenge={() => setActiveModal('socialChallenge')}
        onShowToast={showToast}
      />

      {/* User Profile Modal */}
      <Suspense fallback={null}>
      <ProfileModal
        isOpen={activeModal === 'profile'}
        onClose={() => setActiveModal(null)}
        userName={state.userName}
        userEmail={state.userEmail}
        onSignOut={onSignOut}
        balancePhp={state.balancePhp}
        totalEarnedPhp={state.totalEarnedPhp}
        consecutiveDays={state.consecutiveDays}
        referralCode={state.referralCode}
        onOpenSupport={() => setActiveModal('support')}
      />
      </Suspense>

      {/* Referral Program Modal */}
      <ReferralModal
        isOpen={activeModal === 'referral'}
        onClose={() => setActiveModal(null)}
        referralCode={state.referralCode}
        referralCount={state.referralCount}
        referralEarningsPhp={state.referralEarningsPhp}
        onSimulateReferral={handleSimulateReferral}
      />

      {/* Share Earnings Card Modal */}
      <ShareEarningsModal
        isOpen={activeModal === 'shareEarnings'}
        onClose={() => setActiveModal(null)}
        userName={state.userName}
        totalEarnedPhp={state.totalEarnedPhp}
        balancePhp={state.balancePhp}
        stepsToday={state.stepsToday}
        tapMineCount={state.tapMineCount}
        consecutiveDays={state.consecutiveDays}
        referralCode={state.referralCode}
      />

      {/* Support Center & FAQ Modal */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-slate-950 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                sound.playClick();
                setActiveModal(null);
              }}
              className="sticky top-0 z-30 self-end -mb-7 shrink-0 p-1.5 rounded-full bg-slate-900 border border-slate-600 text-slate-200 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <SupportView
              tickets={state.tickets}
              onAddTicket={handleAddTicket}
              onClose={() => setActiveModal(null)}
            />
          </div>
        </div>
      )}

      {/* Milestone Badges & Achievements Modal */}
      {activeModal === 'achievements' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-slate-950 border border-amber-500/40 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <AchievementsView
              unlockedAchievementIds={state.unlockedAchievementIds}
              stepsToday={state.stepsToday}
              tapMineCount={state.tapMineCount}
              consecutiveDays={state.consecutiveDays}
              referralCount={state.referralCount}
              onClaimAchievement={handleClaimAchievement}
              onClose={() => setActiveModal(null)}
            />
          </div>
        </div>
      )}

      {/* Weekly Social Challenge Modal */}
      <WeeklySocialChallengeModal
        isOpen={activeModal === 'socialChallenge'}
        onClose={() => setActiveModal(null)}
        currentUserName={state.userName}
        stepsToday={state.stepsToday}
        onOpenWalking={() => setActiveModal('walking')}
        onClaimReward={handleSocialChallengeReward}
      />

      {celebration && (
        <RewardCelebration
          key={celebration.key}
          php={celebration.php}
          title={celebration.title}
          onDone={() => setCelebration(null)}
        />
      )}

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/95 border border-cyan-400 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 duration-200 pointer-events-none">
          {toast.icon && <span className="text-sm">{toast.icon}</span>}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  // undefined = still checking, null = logged out
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  // Ads start a moment after the first screen is drawn (keeps startup fast); also on the login page.
  useEffect(() => {
    if (!isNativeAds) return;
    const t = setTimeout(() => {
      initAds().then(() => showBottomBanner());
    }, 1500);
    // Hide the banner while typing so it never covers the keyboard or inputs.
    let resumeTimer: ReturnType<typeof setTimeout>;
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
    const onIn = (e: FocusEvent) => {
      if (isField(e.target)) {
        clearTimeout(resumeTimer);
        hideBanner();
      }
    };
    const onOut = (e: FocusEvent) => {
      if (isField(e.target)) {
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(() => resumeBanner(), 400);
      }
    };
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      clearTimeout(t);
      clearTimeout(resumeTimer);
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
      removeBanner();
    };
  }, []);

  const refresh = useCallback(async () => {
    const s = await getCurrentSession();
    setSession(s);
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setSession(null);
      return;
    }
    refresh();
    const { data } = sb.auth.onAuthStateChange((_event, s) => {
      if (isAuthBusy()) return; // password reset in progress
      if (s?.user?.is_anonymous) {
        signOut(); // old test sessions are not allowed anymore
        setSession(null);
        return;
      }
      setSession(s);
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  if (!supabaseConfigured) {
    // Local development only: skip login when no Supabase keys are set.
    if (import.meta.env.DEV) return <MainApp />;
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
        <div className="max-w-xs space-y-2">
          <div className="text-5xl">🐾</div>
          <h1 className="font-fredoka text-xl font-bold">App not configured</h1>
          <p className="text-xs text-slate-400">
            This build is missing its Supabase keys. Add the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
            secrets in GitHub and build again.
          </p>
        </div>
      </div>
    );
  }

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-5xl">🐾</div>
    );
  }

  if (!session) {
    return <AuthScreen onAuthed={refresh} />;
  }

  const meta = (session.user.user_metadata || {}) as { username?: string };
  return (
    <MainApp
      key={session.user.id}
      userId={session.user.id}
      username={meta.username}
      email={session.user.email}
      onSignOut={async () => {
        await signOut();
        setSession(null);
      }}
    />
  );
}
