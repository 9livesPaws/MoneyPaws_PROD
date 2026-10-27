import React, { useState, useEffect } from 'react';
import { X, Play, CheckCircle2, Sparkles, ShieldCheck, ExternalLink } from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireRewardConfetti } from '../../utils/confetti';
import { isNativeAds, showRewardedAd } from '../../utils/ads';

interface WatchAndEarnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (paws: number) => void;
  adsWatchedToday: number;
}

interface SponsorAd {
  brand: string;
  tagline: string;
  productName: string;
  badge: string;
  icon: string;
  color: string;
  pawsReward: number;
}

const SPONSORS: SponsorAd[] = [
  {
    brand: 'PetNutrition Labs',
    tagline: 'Vet-Approved Gourmet Dog Treats & Health Supplements',
    productName: 'Omega Paw Chews Pro',
    badge: 'Sponsored',
    icon: '🍖',
    color: 'from-amber-600 to-orange-700',
    pawsReward: 85,
  },
  {
    brand: 'BatteryMaster Android',
    tagline: 'Extend Your Phone Life by 40% with Intelligent Sleep Modes',
    productName: 'Android Cooler & Battery Saver',
    badge: 'Featured App',
    icon: '⚡',
    color: 'from-emerald-600 to-teal-800',
    pawsReward: 90,
  },
  {
    brand: 'MicroPay Global',
    tagline: 'Instant Zero-Fee Peer-to-Peer Micro Transfers & Top-ups',
    productName: 'Daily Expense Cash Wallet',
    badge: 'Fintech Partner',
    icon: '💳',
    color: 'from-blue-600 to-indigo-800',
    pawsReward: 100,
  },
];

export const WatchAndEarnModal: React.FC<WatchAndEarnModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
  adsWatchedToday,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(12);
  const [adIndex, setAdIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [adMsg, setAdMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(false);
      setSecondsLeft(12);
      setIsCompleted(false);
      setAdLoading(false);
      setAdMsg('');
      setAdIndex(Math.floor(Math.random() * SPONSORS.length));
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isPlaying && secondsLeft <= 0) {
      setIsCompleted(true);
      setIsPlaying(false);
      sound.playFanfare();
      fireRewardConfetti(0.4);
    }
    return () => clearInterval(timer);
  }, [isPlaying, secondsLeft]);

  if (!isOpen) return null;

  const sponsor = SPONSORS[adIndex];
  const progressPercent = ((12 - secondsLeft) / 12) * 100;

  const handleStartWatch = async () => {
    sound.playClick();
    if (!isNativeAds) {
      setIsPlaying(true); // web preview only
      return;
    }
    if (adLoading) return;
    setAdLoading(true);
    setAdMsg('');
    const result = await showRewardedAd(); // real AdMob rewarded ad
    setAdLoading(false);
    if (result === 'rewarded') {
      onRewardClaimed(sponsor.pawsReward);
      onClose(); // the celebration screen appears right after
    } else if (result === 'dismissed') {
      setAdMsg('Ad closed early. Watch it to the end to earn your reward.');
    } else {
      setAdMsg('No ad available right now. Please try again in a moment.');
    }
  };

  const handleCollect = () => {
    sound.playCoin();
    onRewardClaimed(sponsor.pawsReward);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header bar */}
        <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
              {sponsor.badge}
            </span>
            <span className="text-[10px] text-slate-500">• {adsWatchedToday}/10 Today</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sponsor Video Screen Box */}
        <div className={`relative h-56 bg-gradient-to-br ${sponsor.color} flex flex-col items-center justify-center p-6 text-center text-white overflow-hidden select-none`}>
          {/* Animated background rings */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />

          <div className="text-5xl mb-2 animate-bounce">{sponsor.icon}</div>
          <h3 className="font-fredoka text-xl font-bold tracking-tight text-white drop-shadow">
            {sponsor.productName}
          </h3>
          <p className="text-xs text-white/85 mt-1 line-clamp-2 max-w-xs font-medium">
            {sponsor.tagline}
          </p>

          <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 border border-white/20 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Sample Sponsor (preview)</span>
          </div>

          {/* Progress / Play overlay */}
          {!isPlaying && !isCompleted && (
            <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center p-4">
              <button
                onClick={handleStartWatch}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-7 h-7 fill-slate-950 ml-1" />
              </button>
              <span className="text-xs font-bold text-amber-300 mt-3">
                Tap to Watch & Earn +200 PawCoins
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Duration: 12 seconds</span>
            </div>
          )}

          {isPlaying && (
            <div className="absolute top-3 right-3 bg-black/60 px-2.5 py-1 rounded-full border border-white/20 text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
              <span>⏱ {secondsLeft}s</span>
            </div>
          )}

          {isCompleted && (
            <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center p-4 animate-in zoom-in-95">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-1 animate-pulse" />
              <span className="font-fredoka text-lg font-bold text-white">Video Completed!</span>
              <div className="text-amber-400 font-extrabold text-xl font-mono mt-0.5 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                <span>+200 PawCoins (₱0.20)</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1">Ready to credit to your balance</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isPlaying && (
          <div className="w-full bg-slate-800 h-1.5">
            <div
              className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Bottom controls */}
        <div className="p-4 bg-slate-900 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Brand: <strong className="text-slate-200">{sponsor.brand}</strong></span>
            <span className="text-emerald-400 font-semibold font-mono">Reward: +200 PawCoins</span>
          </div>

          {isCompleted ? (
            <button
              onClick={handleCollect}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Collect +200 PawCoins</span>
            </button>
          ) : isPlaying ? (
            <div className="w-full py-2.5 text-center text-xs text-slate-400 bg-slate-800/60 rounded-xl border border-slate-700/60">
              Please watch till the end to unlock your reward ({secondsLeft}s remaining)...
            </div>
          ) : (
            <button
              onClick={handleStartWatch}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Start Watch & Earn (+200 PawCoins)</span>
            </button>
          )}

          {adMsg && (
            <p className="text-[11px] text-center text-rose-300">{adMsg}</p>
          )}
          {!isNativeAds && (
            <p className="text-[10px] text-center text-amber-400/80">
              Preview ad (web). Real Google AdMob ads play in the Android app.
            </p>
          )}
          <p className="text-[10px] text-center text-slate-500">
            MoneyPaws shares revenue from trusted sponsors directly to your daily earnings wallet.
          </p>
        </div>
      </div>
    </div>
  );
};
