import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, X, CheckCircle2, Clock, Zap, Crown, Award, ChevronRight } from 'lucide-react';
import { sound } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { fireRewardConfetti, fireJackpotConfetti } from '../utils/confetti';
import { formatPhp } from '../utils/storage';

export interface ChestReward {
  tierName: string;
  tierColor: string;
  badge: string;
  icon: string;
  php: number;
  paws: number;
  bonusSpins?: number;
  bonusCards?: number;
  description: string;
}

const POSSIBLE_REWARDS: ChestReward[] = [
  {
    tierName: 'Common Paw Stash',
    tierColor: 'from-blue-600 to-cyan-500 text-cyan-300',
    badge: 'Common 40%',
    icon: '🪙',
    php: 0.25,
    paws: 250,
    description: 'Instant micro-cash added to your daily balance!',
  },
  {
    tierName: 'Silver Bone Loot',
    tierColor: 'from-purple-600 to-indigo-500 text-purple-300',
    badge: 'Silver 35%',
    icon: '🦴',
    php: 0.50,
    paws: 500,
    bonusSpins: 1,
    description: 'Bonus ₱0.50 Cash plus 1 Free Lucky Wheel Spin!',
  },
  {
    tierName: 'Golden Alpha Chest',
    tierColor: 'from-amber-500 to-yellow-400 text-amber-300',
    badge: 'Gold 20%',
    icon: '👑',
    php: 1.50,
    paws: 1500,
    bonusCards: 1,
    description: 'Huge ₱1.50 Cash boost and 1 Scratch & Win Card!',
  },
  {
    tierName: 'Mythic Paw Jackpot',
    tierColor: 'from-rose-500 via-amber-400 to-emerald-400 text-yellow-300',
    badge: 'Mythic 5%',
    icon: '🌟',
    php: 5.00,
    paws: 5000,
    bonusSpins: 2,
    bonusCards: 2,
    description: 'GRAND JACKPOT! ₱5.00 Instant Cash + 2 Spins & 2 Scratchers!',
  },
];

interface DailyLuckyChestProps {
  lastLuckyChestDate: string;
  onClaimChest: (reward: ChestReward) => void;
  onOpenWatchAd?: () => void;
}

export const DailyLuckyChest: React.FC<DailyLuckyChestProps> = ({
  lastLuckyChestDate,
  onClaimChest,
  onOpenWatchAd,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [wonReward, setWonReward] = useState<ChestReward | null>(null);
  const [hasClaimedReward, setHasClaimedReward] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const isAvailableToday = lastLuckyChestDate !== todayStr;

  // Calculate live countdown to midnight reset
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeUntilReset(
        `${hours.toString().padStart(2, '0')}h ${minutes
          .toString()
          .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenChest = () => {
    if (!isAvailableToday) {
      sound.playClick();
      setIsModalOpen(true);
      return;
    }

    sound.playClick();
    setIsModalOpen(true);
    setIsOpening(true);
    setWonReward(null);
    setHasClaimedReward(false);

    // Realistic weighted random loot drop
    const rand = Math.random();
    let picked: ChestReward;
    if (rand < 0.40) {
      picked = POSSIBLE_REWARDS[0]; // Common 40%
    } else if (rand < 0.75) {
      picked = POSSIBLE_REWARDS[1]; // Silver 35%
    } else if (rand < 0.95) {
      picked = POSSIBLE_REWARDS[2]; // Gold 20%
    } else {
      picked = POSSIBLE_REWARDS[3]; // Mythic 5%
    }

    setTimeout(() => {
      setIsOpening(false);
      setWonReward(picked);
      if (picked.php >= 1.50) {
        sound.playFanfare();
        haptics.jackpot();
        fireJackpotConfetti();
      } else {
        sound.playCoin();
        haptics.claim();
        fireRewardConfetti(0.4);
      }
    }, 1500);
  };

  const handleCollect = () => {
    if (!wonReward || hasClaimedReward) return;
    sound.playCoin();
    haptics.claim();
    setHasClaimedReward(true);
    onClaimChest(wonReward);
    setTimeout(() => {
      setIsModalOpen(false);
    }, 600);
  };

  return (
    <>
      {/* DASHBOARD TRIGGER WIDGET */}
      <div
        onClick={handleOpenChest}
        className={`relative w-full rounded-2xl p-3.5 border transition-all cursor-pointer overflow-hidden flex items-center justify-between gap-3 shadow-lg select-none group ${
          isAvailableToday
            ? 'bg-gradient-to-r from-amber-950/40 via-cyan-950/40 to-slate-900 border-amber-400/60 hover:border-amber-400 shadow-amber-500/15 active:scale-98'
            : 'bg-slate-950/80 border-slate-800/80 hover:border-cyan-500/30'
        }`}
      >
        {/* Glow ambient highlight */}
        {isAvailableToday && (
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        )}

        {/* Left: Animated Chest Icon */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform ${
              isAvailableToday
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/30 group-hover:scale-110 animate-bounce'
                : 'bg-slate-900 border border-slate-700 text-slate-400'
            }`}
          >
            🎁
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-fredoka text-sm font-bold text-white tracking-tight">
                Daily Lucky Chest
              </h3>
              {isAvailableToday ? (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase tracking-wider animate-pulse">
                  Ready!
                </span>
              ) : (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
                  Opened
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-300 mt-0.5">
              {isAvailableToday
                ? 'Tap to unlock random cash, spins & bonus Paws!'
                : `Next Lucky Chest in ${timeUntilReset}`}
            </p>
          </div>
        </div>

        {/* Right: Action Pill */}
        <div className="shrink-0">
          {isAvailableToday ? (
            <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/25 flex items-center gap-1 group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>OPEN</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-cyan-400 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800">
              <Clock className="w-3 h-3" />
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </div>
          )}
        </div>
      </div>

      {/* FULL UNBOXING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center overflow-hidden">
            {/* Close button */}
            <button
              onClick={() => {
                sound.playClick();
                setIsModalOpen(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Ambient glows */}
            <div className="absolute -top-16 -left-16 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header info */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Mystery Loot Drop</span>
            </div>
            <h2 className="font-fredoka text-xl font-bold text-white">Daily Lucky Chest</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Every day unlocks a separate mystery roll with prizes up to ₱5.00 cash!
            </p>

            {/* Chest Animation Area */}
            <div className="my-6 relative w-44 h-44 flex flex-col items-center justify-center">
              {isOpening ? (
                <div className="flex flex-col items-center animate-bounce">
                  <div className="text-7xl filter drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] scale-110">
                    🎁
                  </div>
                  <span className="text-xs font-bold font-mono text-amber-300 mt-3 animate-pulse">
                    Unlocking mystery loot...
                  </span>
                </div>
              ) : wonReward ? (
                <div className="flex flex-col items-center animate-in zoom-in-95">
                  <div className="text-7xl mb-1 filter drop-shadow-[0_0_25px_rgba(245,158,11,0.9)] animate-float">
                    {wonReward.icon}
                  </div>
                  <div className={`mt-1 font-fredoka text-lg font-bold ${wonReward.tierColor}`}>
                    {wonReward.tierName}
                  </div>
                </div>
              ) : isAvailableToday ? (
                <div className="flex flex-col items-center">
                  <div className="text-7xl filter drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse">
                    🎁
                  </div>
                  <span className="text-xs font-semibold text-cyan-300 mt-2">
                    Tap &quot;Unlock Chest&quot; below!
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-6xl grayscale opacity-70 mb-2">🎁</div>
                  <span className="text-xs font-bold text-slate-400">Chest Already Claimed</span>
                  <span className="text-[11px] font-mono text-cyan-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Next in {timeUntilReset}
                  </span>
                </div>
              )}
            </div>

            {/* Revealed Prize Details */}
            {wonReward && (
              <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/15 border border-amber-400/50 mb-4 animate-in slide-in-from-bottom-2">
                <div className="text-2xl font-mono font-black text-amber-300 drop-shadow">
                  +{formatPhp(wonReward.php)} ({wonReward.paws} Paws)
                </div>

                <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
                  {wonReward.bonusSpins && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold">
                      +{wonReward.bonusSpins} Free Spin
                    </span>
                  )}
                  {wonReward.bonusCards && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                      +{wonReward.bonusCards} Scratch Card
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-300 mt-2">{wonReward.description}</p>
              </div>
            )}

            {/* Possible Loot Table Guide (when chest not yet opened or already claimed) */}
            {!wonReward && (
              <div className="w-full p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-left mb-4 text-[11px] space-y-1.5">
                <div className="flex justify-between font-bold text-slate-300 pb-1 border-b border-slate-800 text-[10px] uppercase">
                  <span>Possible Rewards</span>
                  <span>Probability</span>
                </div>
                <div className="flex justify-between text-cyan-300">
                  <span>🪙 Common Paw Stash (+₱0.25)</span>
                  <span className="font-mono">40%</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>🦴 Silver Loot (+₱0.50 & Spin)</span>
                  <span className="font-mono">35%</span>
                </div>
                <div className="flex justify-between text-amber-300">
                  <span>👑 Golden Alpha (+₱1.50 & Card)</span>
                  <span className="font-mono">20%</span>
                </div>
                <div className="flex justify-between text-yellow-300 font-bold">
                  <span>🌟 Mythic Jackpot (+₱5.00!)</span>
                  <span className="font-mono">5%</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {wonReward ? (
              <button
                onClick={handleCollect}
                disabled={hasClaimedReward}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/30 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4 stroke-[2.5]" />
                <span>{hasClaimedReward ? 'Prize Credited!' : 'Collect Prize & Credit Wallet'}</span>
              </button>
            ) : isAvailableToday ? (
              <button
                onClick={handleOpenChest}
                disabled={isOpening}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/30 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4 fill-slate-950" />
                <span>UNLOCK DAILY LUCKY CHEST</span>
              </button>
            ) : (
              <div className="w-full flex flex-col gap-2">
                <div className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                  ✅ You have already opened your lucky chest today. Come back after midnight!
                </div>
                {onOpenWatchAd && (
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      onOpenWatchAd();
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Watch Sponsor Clip for Extra Spins/Paws</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
