import React from 'react';
import { Volume2, VolumeX, Smartphone, Monitor, Flame } from 'lucide-react';
import { formatPaws, formatUsd } from '../utils/storage';
import { sound } from '../utils/sound';

interface HeaderProps {
  paws: number;
  streakDays: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  onOpenCheckin: () => void;
  onNavigateToWallet: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  paws,
  streakDays,
  soundEnabled,
  onToggleSound,
  isPhoneFrame,
  onTogglePhoneFrame,
  onOpenCheckin,
  onNavigateToWallet,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 shadow-lg shadow-black/20">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center shadow-md shadow-amber-500/25 ring-2 ring-amber-400/30">
            <span className="text-xl select-none animate-float">🐾</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-fredoka font-bold text-lg tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                MoneyPaws
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5">Daily Passive Rewards</p>
          </div>
        </div>

        {/* Right side: Streak + Balance + Controls */}
        <div className="flex items-center gap-2">
          {/* Daily Streak Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenCheckin();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 transition-all cursor-pointer text-xs font-semibold"
            title="Daily Check-in Streak"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-pulse" />
            <span>{streakDays}d</span>
          </button>

          {/* Balance Pill */}
          <button
            onClick={() => {
              sound.playClick();
              onNavigateToWallet();
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 rounded-full px-3 py-1 cursor-pointer transition-all shadow-sm"
            title="Click to view Wallet & Cashout"
          >
            <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[10px] shadow-sm">
              🐾
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs font-bold text-amber-300 font-mono">
                {formatPaws(paws)}
              </span>
              <span className="text-[9px] text-emerald-400 font-semibold font-mono">
                {formatUsd(paws)}
              </span>
            </div>
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs"
            title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Desktop Frame Mode Switch (only visible on md+ screens) */}
          <button
            onClick={onTogglePhoneFrame}
            className="hidden md:flex w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white items-center justify-center transition-colors cursor-pointer text-xs"
            title={isPhoneFrame ? 'Switch to Full Screen View' : 'Switch to Android Phone Preview'}
          >
            {isPhoneFrame ? (
              <Monitor className="w-4 h-4 text-sky-400" />
            ) : (
              <Smartphone className="w-4 h-4 text-sky-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
