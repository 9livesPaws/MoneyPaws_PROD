import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Gamepad2, Sparkles, RefreshCw, Trophy, Flame, Zap, Award, AlertCircle } from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireRewardConfetti, fireJackpotConfetti } from '../../utils/confetti';
import { formatPaws } from '../../utils/storage';

interface GamesViewProps {
  paws: number;
  freeSpins: number;
  freeScratchCards: number;
  onAddPaws: (paws: number, title: string, type: 'GAME_FRUIT' | 'GAME_SPIN' | 'GAME_SCRATCH') => void;
  onUseFreeSpin: () => void;
  onUseScratchCard: () => void;
  onOpenWatchAd: () => void;
}

type MiniGameTab = 'fruit' | 'wheel' | 'scratch';

/* ========================================================
   SUB-COMPONENT 1: FRUIT SLICER / CATCHER GAME
   ======================================================== */
interface FallingItem {
  id: number;
  x: number; // percentage 5 to 90
  y: number; // percentage -10 to 110
  speed: number;
  type: 'watermelon' | 'strawberry' | 'orange' | 'paw' | 'bomb';
  points: number;
  icon: string;
  size: number;
}

const FruitGame: React.FC<{
  onGameComplete: (points: number, pawsEarned: number) => void;
}> = ({ onGameComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [combo, setCombo] = useState(0);
  const [items, setItems] = useState<FallingItem[]>([]);
  const nextId = useRef(1);
  const animFrameRef = useRef<number | null>(null);

  const spawnItem = useCallback(() => {
    const rand = Math.random();
    let type: FallingItem['type'] = 'strawberry';
    let icon = '🍓';
    let points = 10;

    if (rand < 0.25) {
      type = 'watermelon';
      icon = '🍉';
      points = 15;
    } else if (rand < 0.5) {
      type = 'orange';
      icon = '🍊';
      points = 8;
    } else if (rand < 0.75) {
      type = 'strawberry';
      icon = '🍓';
      points = 10;
    } else if (rand < 0.88) {
      type = 'paw';
      icon = '🐾';
      points = 35;
    } else {
      type = 'bomb';
      icon = '💣';
      points = -25;
    }

    const newItem: FallingItem = {
      id: nextId.current++,
      x: 10 + Math.random() * 80,
      y: -5,
      speed: 0.65 + Math.random() * 0.7,
      type,
      points,
      icon,
      size: type === 'paw' ? 42 : type === 'watermelon' ? 44 : 36,
    };

    setItems((prev) => [...prev.slice(-12), newItem]);
  }, []);

  const handleSlice = (item: FallingItem) => {
    if (!isPlaying) return;

    if (item.type === 'bomb') {
      sound.playClick();
      setScore((prev) => Math.max(0, prev + item.points));
      setCombo(0);
    } else {
      sound.playFruitSlice();
      const currentMultiplier = Math.min(3, 1 + Math.floor(combo / 4) * 0.5);
      const earned = Math.round(item.points * currentMultiplier);
      setScore((prev) => prev + earned);
      setCombo((prev) => prev + 1);
    }

    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const startGame = () => {
    sound.playClick();
    setScore(0);
    setTimeLeft(25);
    setCombo(0);
    setItems([]);
    setIsPlaying(true);
  };

  // Game loop for moving items
  useEffect(() => {
    if (!isPlaying) return;

    let lastSpawn = Date.now();

    const updateLoop = () => {
      const now = Date.now();
      if (now - lastSpawn > 550) {
        spawnItem();
        lastSpawn = now;
      }

      setItems((prev) =>
        prev
          .map((item) => ({
            ...item,
            y: item.y + item.speed,
          }))
          .filter((item) => item.y < 105)
      );

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, spawnItem]);

  // Countdown timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsPlaying(false);
          const pawsEarned = Math.max(15, Math.round(score * 0.4));
          sound.playFanfare();
          fireRewardConfetti();
          onGameComplete(score, pawsEarned);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, score, onGameComplete]);

  return (
    <div className="flex flex-col gap-3">
      {/* Game Stage Area */}
      <div className="relative w-full h-80 bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-900 rounded-2xl border border-amber-500/30 overflow-hidden select-none touch-none shadow-inner">
        {/* Top bar inside canvas */}
        <div className="absolute top-2 left-3 right-3 z-10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800">
            <span className="text-amber-400 font-bold">Score:</span>
            <span className="font-mono text-white font-extrabold text-sm">{score}</span>
            {combo > 2 && (
              <span className="text-orange-400 font-bold animate-pulse text-[10px]">
                {combo}x Combo!
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800">
            <span className="text-slate-400">⏱</span>
            <span className="font-mono text-amber-300 font-extrabold">{timeLeft}s</span>
          </div>
        </div>

        {/* Falling items */}
        {isPlaying &&
          items.map((item) => (
            <button
              key={item.id}
              onPointerDown={() => handleSlice(item)}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                fontSize: `${item.size}px`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform active:scale-75 active:opacity-60 select-none p-2 animate-float"
            >
              <span>{item.icon}</span>
            </button>
          ))}

        {/* Start / Game Over Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-5 text-center">
            {timeLeft === 0 ? (
              <div className="flex flex-col items-center animate-in zoom-in-95">
                <Trophy className="w-12 h-12 text-amber-400 mb-1" />
                <h3 className="font-fredoka text-2xl font-bold text-white">Time&apos;s Up!</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Final Score: <strong className="text-amber-300 text-sm font-mono">{score}</strong>
                </p>
                <div className="mt-2 py-1 px-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  +{Math.max(15, Math.round(score * 0.4))} PawCoins Credited!
                </div>
                <button
                  onClick={startGame}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/30 cursor-pointer"
                >
                  Play Again
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-2 animate-bounce">🍉🐾🍓</div>
                <h3 className="font-fredoka text-xl font-bold text-white">Paw Fruit Slicer</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Tap or slice falling fruits to score points! Catch golden paws for huge bonus points. Avoid bombs!
                </p>
                <div className="flex items-center gap-3 my-3 text-[11px] text-slate-300">
                  <span>🍉 +15</span>
                  <span>🍓 +10</span>
                  <span>🐾 +35</span>
                  <span className="text-rose-400">💣 -25</span>
                </div>
                <button
                  onClick={startGame}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/30 cursor-pointer active:scale-95 transition-all"
                >
                  Start Game (Free)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-[11px] text-center text-slate-400">
        Every fruit score converts into real PawCoins toward your daily expenses!
      </p>
    </div>
  );
};

/* ========================================================
   SUB-COMPONENT 2: SPIN THE WHEEL GAME
   ======================================================== */
interface WheelSlice {
  label: string;
  paws: number;
  color: string;
  isJackpot?: boolean;
}

const WHEEL_SLICES: WheelSlice[] = [
  { label: '50 Paws', paws: 50, color: '#F59E0B' },
  { label: '100 Paws', paws: 100, color: '#3B82F6' },
  { label: '25 Paws', paws: 25, color: '#10B981' },
  { label: '1,500 Paws 👑', paws: 1500, color: '#EC4899', isJackpot: true },
  { label: '200 Paws', paws: 200, color: '#8B5CF6' },
  { label: '75 Paws', paws: 75, color: '#F97316' },
  { label: '500 Paws 💎', paws: 500, color: '#14B8A6' },
  { label: '150 Paws', paws: 150, color: '#EAB308' },
];

const SpinWheelGame: React.FC<{
  freeSpins: number;
  onSpinFinish: (paws: number, isJackpot: boolean) => void;
  onUseSpin: () => void;
  onOpenWatchAd: () => void;
}> = ({ freeSpins, onSpinFinish, onUseSpin, onOpenWatchAd }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const drawWheel = useCallback((currentAngle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 12;
    const numSlices = WHEEL_SLICES.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    ctx.clearRect(0, 0, width, height);

    // Save and rotate canvas
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentAngle);

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(0, 0, radius + 8, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#F59E0B';
    ctx.stroke();

    // Slices
    for (let i = 0; i < numSlices; i++) {
      const slice = WHEEL_SLICES[i];
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#0F172A';
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(slice.label, radius - 16, 4);
      ctx.restore();
    }

    // Center hub
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#F59E0B';
    ctx.stroke();

    ctx.restore();
  }, []);

  useEffect(() => {
    drawWheel(rotation);
  }, [drawWheel, rotation]);

  const handleSpin = () => {
    if (isSpinning) return;
    if (freeSpins <= 0) {
      sound.playClick();
      return;
    }

    sound.playClick();
    onUseSpin();
    setIsSpinning(true);

    // Pick random target slice
    const winningIndex = Math.floor(Math.random() * WHEEL_SLICES.length);
    const numSlices = WHEEL_SLICES.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    // Pointer is at the top (angle 3*PI/2)
    // Desired final angle so slice lands under pointer:
    const targetSliceCenter = winningIndex * sliceAngle + sliceAngle / 2;
    const extraRounds = 5 + Math.floor(Math.random() * 3);
    const targetAngle = (3 * Math.PI) / 2 - targetSliceCenter + extraRounds * Math.PI * 2;

    const startAngle = rotation % (Math.PI * 2);
    const totalRotation = targetAngle - startAngle;
    const duration = 4000;
    const startTime = performance.now();

    let lastTickAngle = startAngle;

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + totalRotation * ease;

      // Play tick sound when passing slices
      if (Math.abs(currentAngle - lastTickAngle) > sliceAngle * 0.7) {
        sound.playWheelTick();
        lastTickAngle = currentAngle;
      }

      setRotation(currentAngle);
      drawWheel(currentAngle);

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        setIsSpinning(false);
        const winning = WHEEL_SLICES[winningIndex];
        if (winning.isJackpot) {
          sound.playFanfare();
          fireJackpotConfetti();
        } else {
          sound.playCoin();
          fireRewardConfetti(0.5);
        }
        onSpinFinish(winning.paws, !!winning.isJackpot);
      }
    };

    requestAnimationFrame(animateSpin);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Wheel Container with Pointer */}
      <div className="relative flex items-center justify-center">
        {/* Top Pointer */}
        <div className="absolute -top-3 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-amber-400 drop-shadow-md" />

        {/* Center Paw Logo in Hub */}
        <div className="absolute z-10 w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-xs shadow-md pointer-events-none">
          🐾
        </div>

        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="rounded-full shadow-2xl shadow-amber-500/20 max-w-full"
        />
      </div>

      {/* Controls & Free Spins Counter */}
      <div className="w-full flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span>Available Spins:</span>
          <span className="font-mono font-bold text-amber-400 text-sm bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
            {freeSpins} Free
          </span>
        </div>

        {freeSpins > 0 ? (
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`w-full max-w-xs py-3 rounded-xl font-extrabold text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 ${
              isSpinning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 text-slate-950 shadow-amber-500/30'
            }`}
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{isSpinning ? 'Spinning Lucky Wheel...' : 'SPIN THE WHEEL NOW'}</span>
          </button>
        ) : (
          <div className="w-full max-w-xs flex flex-col gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onOpenWatchAd();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Watch 15s Clip to Get +2 Free Spins</span>
            </button>
            <p className="text-[10px] text-center text-slate-500">
              Spins refresh daily at midnight or via sponsor clips.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================================================
   SUB-COMPONENT 3: SCRATCH AND WIN CARD GAME
   ======================================================== */
interface ScratchPrize {
  title: string;
  icon: string;
  paws: number;
}

const SCRATCH_POSSIBILITIES: ScratchPrize[] = [
  { title: 'Triple Gold Bone', icon: '🦴', paws: 450 },
  { title: 'Triple Golden Paw', icon: '🐾', paws: 750 },
  { title: 'Triple Shiny Diamond', icon: '💎', paws: 1200 },
  { title: 'Double Pup Coin', icon: '🪙', paws: 150 },
  { title: 'Lucky Snack Treat', icon: '🍖', paws: 100 },
];

const ScratchCardGame: React.FC<{
  freeCards: number;
  onScratchComplete: (paws: number, title: string) => void;
  onUseCard: () => void;
  onOpenWatchAd: () => void;
}> = ({ freeCards, onScratchComplete, onUseCard, onOpenWatchAd }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const [revealedPercent, setRevealedPercent] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [activePrize, setActivePrize] = useState<ScratchPrize>(SCRATCH_POSSIBILITIES[0]);
  const [cardStarted, setCardStarted] = useState(false);

  // Initialize card surface
  const initScratchCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pick random prize
    const rand = Math.floor(Math.random() * SCRATCH_POSSIBILITIES.length);
    setActivePrize(SCRATCH_POSSIBILITIES[rand]);
    setRevealedPercent(0);
    setIsRevealed(false);

    // Reset composite mode
    ctx.globalCompositeOperation = 'source-over';

    // Silver metallic gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#94A3B8');
    grad.addColorStop(0.3, '#CBD5E1');
    grad.addColorStop(0.7, '#64748B');
    grad.addColorStop(1, '#94A3B8');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text on silver foil
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ SCRATCH WITH FINGER ✨', canvas.width / 2, canvas.height / 2 - 8);

    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Match 3 symbols to win up to 1,200 Paws!', canvas.width / 2, canvas.height / 2 + 14);
  }, []);

  useEffect(() => {
    if (cardStarted) {
      initScratchCanvas();
    }
  }, [cardStarted, initScratchCanvas]);

  const checkScratchCoverage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let transparentCount = 0;
    const totalPixels = pixels.length / 4;

    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] < 128) {
        transparentCount += 4;
      }
    }

    const percent = Math.min(100, Math.round((transparentCount / totalPixels) * 100));
    setRevealedPercent(percent);

    if (percent >= 50 && !isRevealed) {
      setIsRevealed(true);
      sound.playFanfare();
      fireRewardConfetti(0.4);
      onScratchComplete(activePrize.paws, activePrize.title);
    }
  };

  const scratchAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    sound.playScratch();
    checkScratchCoverage();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    scratchAt(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    scratchAt(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  const handleStartCard = () => {
    if (freeCards <= 0) {
      sound.playClick();
      return;
    }
    sound.playClick();
    onUseCard();
    setCardStarted(true);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Scratch Card Frame */}
      <div className="relative w-full max-w-xs h-56 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-600/10 to-amber-500/20 p-3 border-2 border-amber-500/40 shadow-xl overflow-hidden flex flex-col items-center justify-between">
        {/* Hidden Prize Underneath */}
        <div className="absolute inset-3 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl flex flex-col items-center justify-center p-3 text-center">
          <div className="flex items-center gap-3 text-4xl mb-1 animate-bounce">
            <span>{activePrize.icon}</span>
            <span>{activePrize.icon}</span>
            <span>{activePrize.icon}</span>
          </div>
          <span className="font-fredoka text-lg font-bold text-white">{activePrize.title}</span>
          <div className="text-amber-400 font-extrabold text-lg font-mono flex items-center gap-1 mt-0.5">
            <Sparkles className="w-4 h-4" />
            <span>+{activePrize.paws} Paws</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-0.5">
            Instant micro-credit to wallet
          </span>
        </div>

        {/* Scratch Canvas Foil on Top */}
        {cardStarted && (
          <canvas
            ref={canvasRef}
            width={280}
            height={190}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className={`relative z-10 rounded-xl cursor-crosshair touch-none transition-opacity duration-500 ${
              isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          />
        )}

        {/* Overlay if card hasn't started */}
        {!cardStarted && (
          <div className="relative z-20 w-full h-full bg-slate-900/90 rounded-xl flex flex-col items-center justify-center p-4 text-center">
            <div className="text-3xl mb-1">🎫✨</div>
            <h4 className="font-fredoka text-base font-bold text-white">Golden Lucky Scratcher</h4>
            <p className="text-xs text-slate-400 mt-1">
              Scratch off the silver coat with your finger to reveal instant match-3 prizes!
            </p>
            <button
              onClick={handleStartCard}
              disabled={freeCards <= 0}
              className={`mt-3 px-5 py-2 rounded-xl text-xs font-extrabold shadow-md cursor-pointer transition-all ${
                freeCards > 0
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {freeCards > 0 ? `Scratch Card (1 of ${freeCards} Free)` : 'No Cards Left'}
            </button>
          </div>
        )}
      </div>

      {/* Progress & Card Counter */}
      {cardStarted && (
        <div className="w-full max-w-xs flex items-center justify-between text-xs text-slate-400">
          <span>Scratch Progress:</span>
          <span className="font-mono font-bold text-amber-300">{revealedPercent}%</span>
        </div>
      )}

      {isRevealed && (
        <button
          onClick={() => {
            setCardStarted(false);
          }}
          className="w-full max-w-xs py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
        >
          Scratch Another Card
        </button>
      )}

      {freeCards <= 0 && !cardStarted && (
        <button
          onClick={() => {
            sound.playClick();
            onOpenWatchAd();
          }}
          className="w-full max-w-xs py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>Watch Sponsor Clip for +1 Free Scratcher</span>
        </button>
      )}
    </div>
  );
};

/* ========================================================
   MAIN GAMES VIEW CONTAINER
   ======================================================== */
export const GamesView: React.FC<GamesViewProps> = ({
  paws,
  freeSpins,
  freeScratchCards,
  onAddPaws,
  onUseFreeSpin,
  onUseScratchCard,
  onOpenWatchAd,
}) => {
  const [activeTab, setActiveTab] = useState<MiniGameTab>('fruit');

  return (
    <div className="flex flex-col gap-4 pb-20 animate-in fade-in duration-200">
      {/* Title & Banner */}
      <div className="bg-gradient-to-r from-purple-900/40 via-amber-900/30 to-purple-900/40 border border-purple-500/30 rounded-2xl p-4 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-md">
              🎮
            </div>
            <div>
              <h1 className="font-fredoka text-xl font-bold text-white">MoneyPaws Arcade</h1>
              <p className="text-xs text-slate-400">Play fun mini games & earn passive daily cash</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Balance</span>
            <div className="font-mono text-sm font-bold text-amber-300">
              {formatPaws(paws)} Paws
            </div>
          </div>
        </div>

        {/* Tab selection */}
        <div className="grid grid-cols-3 gap-2 mt-4 p-1 bg-slate-950/70 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('fruit');
            }}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'fruit'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🍉</span>
            <span>Fruit Game</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('wheel');
            }}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'wheel'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎡</span>
            <span>Spin Wheel</span>
            {freeSpins > 0 && (
              <span className="bg-emerald-400 text-slate-950 text-[9px] px-1 rounded-full font-extrabold">
                {freeSpins}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('scratch');
            }}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'scratch'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎫</span>
            <span>Scratch Card</span>
            {freeScratchCards > 0 && (
              <span className="bg-emerald-400 text-slate-950 text-[9px] px-1 rounded-full font-extrabold">
                {freeScratchCards}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Game Component */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-lg">
        {activeTab === 'fruit' && (
          <FruitGame
            onGameComplete={(points, pawsEarned) => {
              onAddPaws(pawsEarned, `Fruit Slicer Score (${points} pts)`, 'GAME_FRUIT');
            }}
          />
        )}

        {activeTab === 'wheel' && (
          <SpinWheelGame
            freeSpins={freeSpins}
            onUseSpin={onUseFreeSpin}
            onSpinFinish={(pawsEarned, isJackpot) => {
              onAddPaws(
                pawsEarned,
                isJackpot ? '👑 LUCKY WHEEL GRAND JACKPOT!' : 'Lucky Wheel Spin Reward',
                'GAME_SPIN'
              );
            }}
            onOpenWatchAd={onOpenWatchAd}
          />
        )}

        {activeTab === 'scratch' && (
          <ScratchCardGame
            freeCards={freeScratchCards}
            onUseCard={onUseScratchCard}
            onScratchComplete={(pawsEarned, prizeTitle) => {
              onAddPaws(pawsEarned, `Scratch & Win: ${prizeTitle}`, 'GAME_SCRATCH');
            }}
            onOpenWatchAd={onOpenWatchAd}
          />
        )}
      </div>
    </div>
  );
};
