import React, { useEffect, useState } from 'react';
import { CatMiner } from './CatArt';
import { sound } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { formatPhp, formatPaws } from '../utils/storage';
import {
  MINING_DAILY_CAP_PHP,
  MINING_MAX_SESSIONS,
  MINING_REWARD_PHP,
  formatCountdown,
} from '../utils/mining';

interface MiningCardProps {
  miningStartedAt: number | null;
  miningEndsAt: number | null;
  sessionsToday: number;
  earnedTodayPhp: number;
  onStart: () => void;
  onClaim: () => void;
}

const R = 46;
const C = 2 * Math.PI * R;

/** One-tap, 3-hour cat mining with a progress ring (percent + countdown). */
export const MiningCard: React.FC<MiningCardProps> = ({
  miningStartedAt,
  miningEndsAt,
  sessionsToday,
  earnedTodayPhp,
  onStart,
  onClaim,
}) => {
  const [now, setNow] = useState(() => Date.now());

  const active = miningEndsAt !== null;
  const ready = active && now >= (miningEndsAt as number);
  const mining = active && !ready;
  const capped = !active && sessionsToday >= MINING_MAX_SESSIONS;

  // tick once a second only while mining; refresh when the app comes back to the front
  useEffect(() => {
    setNow(Date.now());
    if (!mining) return;
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [mining, miningEndsAt]);

  useEffect(() => {
    const onVis = () => document.visibilityState === 'visible' && setNow(Date.now());
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const total = miningEndsAt && miningStartedAt ? miningEndsAt - miningStartedAt : 1;
  const percent = ready ? 100 : mining && miningStartedAt ? Math.min(99, Math.floor(((now - miningStartedAt) / total) * 100)) : 0;
  const remaining = miningEndsAt ? miningEndsAt - now : 0;
  const reward = Math.min(MINING_REWARD_PHP, Math.max(0, MINING_DAILY_CAP_PHP - earnedTodayPhp));

  const act = () => {
    if (ready) {
      sound.playCoin();
      haptics.claim();
      onClaim();
    } else if (!active && !capped) {
      sound.playCoin();
      haptics.tapMine();
      onStart();
    }
  };

  const ringColor = ready ? '#fbbf24' : '#22d3ee';

  return (
    <div
      id="mine-section"
      className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 via-cyan-950/30 to-slate-900/90 border border-cyan-500/40 p-5 flex flex-col items-center scroll-mt-6"
    >
      <button
        onClick={act}
        disabled={mining || capped}
        aria-label="Cat mining"
        className="relative w-44 h-44 cursor-pointer select-none active:scale-95 transition-transform disabled:cursor-default disabled:active:scale-100"
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={R} fill="#020617" stroke="#0f172a" strokeWidth="7" />
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C - (C * percent) / 100}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <CatMiner size={mining || ready ? 52 : 78} mining={mining} />
          {(mining || ready) && (
            <>
              <span className="font-mono text-xl font-extrabold text-white leading-none mt-1">{percent}%</span>
              <span className={`font-mono text-[11px] font-bold mt-0.5 ${ready ? 'text-amber-300' : 'text-cyan-300'}`}>
                {ready ? 'READY!' : formatCountdown(remaining)}
              </span>
            </>
          )}
        </div>
      </button>

      <button
        onClick={act}
        disabled={mining || capped}
        className={`mt-3 w-full max-w-[17rem] py-2.5 rounded-xl font-fredoka font-bold text-sm tracking-wide uppercase transition-all ${
          ready
            ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg animate-pulse cursor-pointer'
            : mining || capped
            ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg cursor-pointer active:scale-98'
        }`}
      >
        {ready
          ? `Claim ${formatPhp(reward)} (${formatPaws(Math.round(reward * 1000))} PawCoins)`
          : mining
          ? `Mining… earns ${formatPhp(MINING_REWARD_PHP)}`
          : capped
          ? 'Daily cap reached • back tomorrow'
          : 'Start mining • 3 hrs'}
      </button>

      <div className="w-full max-w-[17rem] mt-3">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
          <span>
            Today: <strong className="text-cyan-300 font-mono">{Math.min(sessionsToday, MINING_MAX_SESSIONS)}/{MINING_MAX_SESSIONS}</strong> sessions
          </span>
          <span className="font-mono">
            {formatPhp(Math.min(earnedTodayPhp, MINING_DAILY_CAP_PHP))} / {formatPhp(MINING_DAILY_CAP_PHP)} daily cap
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-amber-300 transition-all"
            style={{ width: `${Math.min(100, (earnedTodayPhp / MINING_DAILY_CAP_PHP) * 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-500 text-center mt-2">
          One tap, then your cat keeps mining for 3 hours, even with the app closed.
        </p>
      </div>
    </div>
  );
};
