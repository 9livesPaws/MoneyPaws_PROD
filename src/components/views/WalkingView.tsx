import React, { useState, useEffect } from 'react';
import { Footprints, Flame, Trophy, Award, Zap, Check, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/sound';
import { haptics } from '../../utils/haptics';
import { fireRewardConfetti } from '../../utils/confetti';
import { formatPhp } from '../../utils/storage';

interface WalkingViewProps {
  stepsToday: number;
  stepsGoal: number;
  onAddSteps: (steps: number) => void;
  onConvertStepsToCash: (stepsToConvert: number, cashReward: number) => void;
  onClose?: () => void;
  onOpenSocialChallenge?: () => void;
}

export const WalkingView: React.FC<WalkingViewProps> = ({
  stepsToday,
  stepsGoal,
  onAddSteps,
  onConvertStepsToCash,
  onClose,
  onOpenSocialChallenge,
}) => {
  const [isSensorActive, setIsSensorActive] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [recentStepBurst, setRecentStepBurst] = useState(false);

  // Calculate stats
  const km = (stepsToday * 0.00075).toFixed(2);
  const calories = Math.round(stepsToday * 0.04);
  const progressPercent = Math.min(100, Math.round((stepsToday / stepsGoal) * 100));

  // Device motion sensor for real Android accelerometer step detection
  useEffect(() => {
    let lastZ = 0;
    let lastTime = Date.now();

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.z === null) return;

      const now = Date.now();
      const deltaZ = Math.abs(acc.z - lastZ);

      // Simple peak detection threshold for step counting
      if (deltaZ > 4.5 && now - lastTime > 320) {
        lastTime = now;
        lastZ = acc.z;
        sound.playStep();
        onAddSteps(1);
        setRecentStepBurst(true);
        setTimeout(() => setRecentStepBurst(false), 500);
      }
    };

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleMotion);
      setIsSensorActive(true);
    }

    return () => {
      if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, [onAddSteps]);

  // Step simulation button
  const handleSimulateStep = (amount: number = 25) => {
    sound.playStep();
    haptics.step();
    onAddSteps(amount);
    setRecentStepBurst(true);
    setTimeout(() => setRecentStepBurst(false), 400);
  };

  // Convert 500 steps to ₱0.25
  const canConvert = stepsToday >= 250;
  const convertibleSteps = Math.floor(stepsToday / 250) * 250;
  const convertibleReward = (convertibleSteps / 250) * 0.15; // ₱0.15 per 250 steps

  const handleConvert = () => {
    if (!canConvert) return;
    sound.playFanfare();
    haptics.claim();
    fireRewardConfetti(0.4);
    onConvertStepsToCash(convertibleSteps, convertibleReward);
  };

  return (
    <div className="flex flex-col gap-4 text-white">
      {/* Top Card: Circle Progress */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-cyan-950/40 border border-cyan-500/30 p-5 flex flex-col items-center justify-center text-center shadow-lg shadow-cyan-950/50">
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{isSensorActive ? 'Motion Sensor Active' : 'Pedometer Ready'}</span>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative w-44 h-44 my-2 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#0f172a"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress cyan ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#cyanGradient)"
              strokeWidth="8"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Footprints
              className={`w-7 h-7 text-cyan-400 mb-1 transition-transform ${
                recentStepBurst ? 'scale-125 text-amber-300' : ''
              }`}
            />
            <span className="text-2xl font-extrabold font-mono text-white tracking-tight">
              {stepsToday.toLocaleString()}
            </span>
            <span className="text-[11px] text-cyan-300/80 font-medium">
              Goal: {stepsGoal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 3 Metrics: km, calories, progress */}
        <div className="grid grid-cols-3 gap-2 w-full mt-2 pt-3 border-t border-slate-800/80 text-center">
          <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Distance</span>
            <span className="text-xs font-bold text-cyan-300 font-mono">{km} km</span>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Calories</span>
            <span className="text-xs font-bold text-orange-400 font-mono">{calories} kcal</span>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Progress</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Simulator / Walking Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleSimulateStep(50)}
          className="py-3 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Footprints className="w-4 h-4" />
          <span>Walk (+50 Steps)</span>
        </button>

        <button
          onClick={() => handleSimulateStep(200)}
          className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-cyan-300 font-bold text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Brisk Walk (+200 Steps)</span>
        </button>
      </div>

      {/* Convert Steps to Real Cash */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-emerald-950/40 border border-emerald-500/40 flex flex-col gap-2 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Convert Steps to Cash
            </h4>
            <p className="text-[11px] text-slate-400">Rate: 250 Steps = ₱0.15 Cash</p>
          </div>
          <div className="font-mono text-base font-extrabold text-emerald-300">
            {formatPhp(convertibleReward)}
          </div>
        </div>

        <button
          onClick={handleConvert}
          disabled={!canConvert}
          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            canConvert
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30 cursor-pointer active:scale-98'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>
            {canConvert
              ? `Convert ${convertibleSteps} Steps to ${formatPhp(convertibleReward)}`
              : 'Need at least 250 steps to convert'}
          </span>
        </button>
      </div>

      {/* Daily Milestones */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Daily Step Milestones</span>
        </h4>

        <div className="space-y-2">
          {[
            { target: 1000, reward: '₱0.50 Bonus', desc: 'Warm Up Walk' },
            { target: 3000, reward: '₱1.50 Bonus', desc: 'Neighbourhood Stroll' },
            { target: 5000, reward: '₱3.00 Bonus', desc: 'Daily Fitness Master' },
          ].map((milestone) => {
            const isReached = stepsToday >= milestone.target;
            return (
              <div
                key={milestone.target}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  isReached
                    ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isReached ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isReached ? <Check className="w-3 h-3 stroke-[3]" /> : '🐾'}
                  </div>
                  <div>
                    <span className="font-semibold block">{milestone.target.toLocaleString()} Steps</span>
                    <span className="text-[10px] text-slate-400">{milestone.desc}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-xs">
                  {milestone.reward}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {onOpenSocialChallenge && (
        <button
          onClick={() => {
            sound.playClick();
            onOpenSocialChallenge();
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-98 transition-all cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-amber-300" />
          <span>View Weekly Step Sprint Leaderboard</span>
        </button>
      )}
    </div>
  );
};
