import React, { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, Bell, ChevronRight, Zap, TrendingUp, Info } from 'lucide-react';
import { sound } from '../utils/sound';

export interface NewsItem {
  id: string;
  tag: string;
  tagColor: string;
  icon: string;
  message: string;
  highlight?: string;
}

const NEWS_UPDATES: NewsItem[] = [
  {
    id: 'news-1',
    tag: 'Daily Tip',
    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: '👟',
    message: 'Every 250 steps you walk can be converted into ₱0.15.',
    highlight: '250 steps = ₱0.15',
  },
  {
    id: 'news-2',
    tag: 'Cat Mining',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: '⛏️',
    message: 'Tap once and your cat mines for 3 hours. Claim up to ₱0.30 a day.',
    highlight: '3 hours per session',
  },
  {
    id: 'news-3',
    tag: 'Watch & Earn',
    tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    icon: '📺',
    message: 'Watch up to 10 short ads a day and earn ₱0.20 for each one.',
    highlight: '₱0.20 per ad',
  },
  {
    id: 'news-4',
    tag: 'Cash Out',
    tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: '💸',
    message: 'Cash out from ₱10 to GCash, Maya, PayPal or ONE.',
    highlight: 'From ₱10',
  },
  {
    id: 'news-5',
    tag: 'Our Mission',
    tagColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    icon: '☕',
    message: 'MoneyPaws helps with small daily expenses like coffee, snacks and mobile load.',
    highlight: 'Small daily wins',
  },
];

interface DailyNewsTickerProps {
  onOpenTipsModal?: () => void;
}

export const DailyNewsTicker: React.FC<DailyNewsTickerProps> = ({ onOpenTipsModal }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-advance news every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % NEWS_UPDATES.length);
        setIsAnimating(false);
      }, 250);
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    sound.playClick();
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % NEWS_UPDATES.length);
      setIsAnimating(false);
    }, 200);
  };

  const current = NEWS_UPDATES[currentIndex];

  return (
    <div
      onClick={handleNext}
      className="relative w-full rounded-xl bg-gradient-to-r from-slate-950/90 via-cyan-950/40 to-slate-950/90 border border-cyan-500/35 p-2 px-3 cursor-pointer hover:border-cyan-400/60 transition-all active:scale-98 select-none overflow-hidden group"
      title="Tap to cycle daily tips & news"
    >
      {/* Subtle ambient light bar */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

      <div className="flex items-center justify-between gap-2.5">
        {/* Left: Animated Icon + Tag badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-base select-none group-hover:scale-110 transition-transform">
            {current.icon}
          </span>
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${current.tagColor}`}
          >
            {current.tag}
          </span>
        </div>

        {/* Center: Rotating Message */}
        <div
          className={`flex-1 min-w-0 transition-all duration-300 ${
            isAnimating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
          }`}
        >
          <p className="text-[11px] text-slate-200 truncate font-medium">
            {current.message}
          </p>
        </div>

        {/* Right: Dot progress & cycle hint */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-0.5">
            {NEWS_UPDATES.map((_, idx) => (
              <span
                key={idx}
                className={`w-1 h-1 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-2.5 bg-cyan-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
        </div>
      </div>
    </div>
  );
};
