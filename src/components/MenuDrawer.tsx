import React, { useState } from 'react';
import { X, Mail, HeartHandshake, Shield, HelpCircle, Users, Volume2, VolumeX, Sparkles, ExternalLink, Trophy, Target, Share2, Award, BatteryCharging, Moon, Sun, Footprints } from 'lucide-react';
import { sound } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { SUPPORT_EMAIL, APP_MISSION } from '../types';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: 'slate' | 'amoled';
  onToggleTheme: () => void;
  batterySaver: boolean;
  onToggleBatterySaver: () => void;
  onOpenReferral: () => void;
  onOpenSupport: () => void;
  onOpenFaq: () => void;
  onOpenLeaderboard?: () => void;
  onOpenMissions?: () => void;
  onOpenShareEarnings?: () => void;
  onOpenAchievements?: () => void;
  onOpenSocialChallenge?: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  theme,
  onToggleTheme,
  batterySaver,
  onToggleBatterySaver,
  onOpenReferral,
  onOpenSupport,
  onOpenFaq,
  onOpenLeaderboard,
  onOpenMissions,
  onOpenShareEarnings,
  onOpenAchievements,
  onOpenSocialChallenge,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const handleSoundToggle = () => {
    sound.playClick();
    haptics.light();
    onToggleSound();
    onShowToast(
      !soundEnabled ? 'Sound & Haptic Feedback Enabled' : 'Sound & Haptics Muted',
      !soundEnabled ? '🔊' : '🔇'
    );
  };

  const handleThemeToggle = () => {
    sound.playClick();
    haptics.light();
    onToggleTheme();
    onShowToast(
      theme === 'slate' ? 'AMOLED True Black Activated (Saves Battery)' : 'Slate Dark Mode Activated',
      '🌙'
    );
  };

  const handleBatterySaverToggle = () => {
    sound.playClick();
    haptics.light();
    onToggleBatterySaver();
    onShowToast(
      !batterySaver ? 'Battery Saver Enabled: Reduced Animations' : 'Standard Performance Restored',
      '🔋'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => {
          sound.playClick();
          onClose();
        }}
        className="fixed inset-0 bg-black/80"
      />

      {/* Drawer panel */}
      <div
        className={`relative w-76 max-w-[85vw] h-full flex flex-col justify-between p-4 z-10 shadow-2xl animate-in slide-in-from-left duration-250 border-r ${
          theme === 'amoled'
            ? 'bg-black border-slate-800'
            : 'bg-slate-950 border-cyan-500/30'
        }`}
      >
        <div className="overflow-y-auto pr-1 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-lg">
                🐾
              </div>
              <div>
                <h3 className="font-fredoka text-base font-bold text-white tracking-tight">
                  MoneyPaws
                </h3>
                <span className="text-[10px] text-cyan-400 font-medium">Daily Micro-Income</span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mission Card */}
          <div className="mt-3.5 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 mb-1">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Our Mission</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {APP_MISSION}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="mt-4 space-y-1">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onOpenMissions?.();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 hover:text-cyan-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Target className="w-4 h-4 text-cyan-400" />
              <span>Daily Missions</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onOpenAchievements?.();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 hover:text-cyan-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4 text-yellow-400" />
              <span>Milestone Badges</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onOpenLeaderboard?.();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 hover:text-cyan-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Top 10 Leaderboard</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onOpenSocialChallenge?.();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 hover:text-cyan-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Footprints className="w-4 h-4 text-sky-400" />
                <span>Weekly Step Sprint</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Prize Pool
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onOpenShareEarnings?.();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 hover:text-cyan-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Share Earnings Card</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onOpenReferral();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 hover:text-cyan-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Invite Friends &amp; Earn</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onOpenSupport();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 hover:text-cyan-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Customer Support</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onOpenFaq();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 hover:text-cyan-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>FAQs &amp; Earning Guide</span>
            </button>
          </div>

          {/* System Toggles Section (Sound, AMOLED Theme, Battery Saver) */}
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-3 block mb-1">
              Preferences &amp; Power
            </span>

            {/* Sound Toggle */}
            <button
              onClick={handleSoundToggle}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <span>Sound &amp; Haptics</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${soundEnabled ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                {soundEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* AMOLED True Black Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Moon className={`w-4 h-4 ${theme === 'amoled' ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>AMOLED True Black</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${theme === 'amoled' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'}`}>
                {theme === 'amoled' ? 'ACTIVE' : 'SLATE'}
              </span>
            </button>

            {/* Battery Saver Mode Toggle */}
            <button
              onClick={handleBatterySaverToggle}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <BatteryCharging className={`w-4 h-4 ${batterySaver ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>Battery Saver</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${batterySaver ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                {batterySaver ? 'SAVER' : 'NORMAL'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer Contact Support */}
        <div className="pt-3 border-t border-slate-800/80 shrink-0">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
              Technical Assistance
            </span>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=MoneyPaws%20Support%20Inquiry`}
              className="text-cyan-300 hover:underline font-mono text-[11px] break-all block"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
          <p className="text-[9px] text-slate-500 text-center mt-2">
            MoneyPaws for Android • v2.5.0
          </p>
        </div>
      </div>
    </div>
  );
};
