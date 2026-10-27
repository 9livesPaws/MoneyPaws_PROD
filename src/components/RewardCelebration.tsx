import React, { useEffect } from 'react';
import { fireRewardConfetti } from '../utils/confetti';
import { formatPaws, formatPhp } from '../utils/storage';
import { sound } from '../utils/sound';

interface RewardCelebrationProps {
  php: number;
  title: string;
  onDone: () => void;
}

/** Full-screen "you earned it" moment: confetti + PawCoins + peso value. Tap or wait to close. */
export const RewardCelebration: React.FC<RewardCelebrationProps> = ({ php, title, onDone }) => {
  const paws = Math.round(php * 1000);

  useEffect(() => {
    sound.playFanfare();
    fireRewardConfetti(0.45);
    const second = setTimeout(() => fireRewardConfetti(0.35), 350);
    const done = setTimeout(onDone, 3200);
    return () => {
      clearTimeout(second);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onClick={onDone}
      className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/70 animate-in fade-in duration-200 cursor-pointer"
    >
      <div className="w-full max-w-xs rounded-3xl bg-gradient-to-b from-slate-900 to-cyan-950 border border-amber-400/60 p-6 text-center shadow-2xl shadow-amber-500/20">
        <div className="text-5xl mb-1">🪙</div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">Reward claimed!</p>
        <p className="font-fredoka text-5xl font-bold text-white mt-2">+{formatPhp(php)}</p>
        <p className="font-mono text-sm font-bold text-cyan-300 mt-1">= {formatPaws(paws)} PawCoins</p>
        <p className="text-xs text-slate-300 mt-3 line-clamp-2">{title}</p>
        <p className="text-[10px] text-slate-500 mt-4">Tap to continue</p>
      </div>
    </div>
  );
};
