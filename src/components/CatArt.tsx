import React from 'react';

interface CatMinerProps {
  size?: number;
  mining?: boolean;
  className?: string;
}

/** Cute miner cat: hard hat with lamp + pickaxe. Pure SVG (no images, no heavy effects). */
export const CatMiner: React.FC<CatMinerProps> = ({ size = 64, mining = false, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="Cat miner" role="img">
    {/* ears */}
    <polygon points="20,44 27,14 47,30" fill="#f59e0b" />
    <polygon points="80,44 73,14 53,30" fill="#f59e0b" />
    <polygon points="26,38 29,22 40,31" fill="#fda4af" />
    <polygon points="74,38 71,22 60,31" fill="#fda4af" />
    {/* head */}
    <ellipse cx="50" cy="60" rx="33" ry="28" fill="#f59e0b" />
    <ellipse cx="50" cy="70" rx="17" ry="12" fill="#fde68a" />
    {/* hard hat */}
    <path d="M22 46 Q50 6 78 46 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
    <rect x="17" y="44" width="66" height="7" rx="3.5" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
    <circle cx="50" cy="27" r="6" fill="#fffbeb" stroke="#ca8a04" strokeWidth="1.5" />
    <circle cx="50" cy="27" r="2.6" fill="#fde047" />
    {/* eyes */}
    <g className="mp-blink">
      <ellipse cx="37" cy="62" rx="3.6" ry="4.6" fill="#0f172a" />
      <ellipse cx="63" cy="62" rx="3.6" ry="4.6" fill="#0f172a" />
      <circle cx="38.4" cy="60.4" r="1.2" fill="#fff" />
      <circle cx="64.4" cy="60.4" r="1.2" fill="#fff" />
    </g>
    {/* nose + mouth */}
    <polygon points="46.5,68 53.5,68 50,72.5" fill="#f472b6" />
    <path d="M50 72.5 Q46 78 41 75 M50 72.5 Q54 78 59 75" stroke="#78350f" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    {/* whiskers */}
    <path d="M30 70 L14 67 M30 74 L14 76 M70 70 L86 67 M70 74 L86 76" stroke="#78350f" strokeWidth="1.3" strokeLinecap="round" />
    {/* pickaxe */}
    <g className={mining ? 'mp-swing' : ''}>
      <line x1="80" y1="96" x2="92" y2="66" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
      <path d="M80 66 Q92 56 100 68" stroke="#94a3b8" strokeWidth="5" fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

/** Full-cover "ad is loading" scene: a cat bobbing among paw prints. */
export const CatLoader: React.FC<{ message?: string }> = ({ message = 'Loading your ad…' }) => (
  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-950 to-cyan-950">
    <span className="absolute top-6 left-6 text-2xl opacity-20 mp-float">🐾</span>
    <span className="absolute top-16 right-8 text-3xl opacity-15 mp-float" style={{ animationDelay: '0.6s' }}>🐾</span>
    <span className="absolute bottom-20 left-10 text-3xl opacity-15 mp-float" style={{ animationDelay: '1.1s' }}>🐾</span>
    <span className="absolute bottom-10 right-6 text-2xl opacity-20 mp-float" style={{ animationDelay: '0.3s' }}>🐾</span>
    <div className="mp-float">
      <CatMiner size={120} mining />
    </div>
    <p className="mt-4 font-fredoka text-lg font-bold text-white">{message}</p>
    <div className="mt-2 flex gap-1.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="mp-dot w-2 h-2 rounded-full bg-cyan-400" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
    <p className="mt-3 text-[11px] text-slate-400">Your reward is almost ready</p>
  </div>
);
