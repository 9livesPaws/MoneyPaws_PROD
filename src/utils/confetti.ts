import confetti from 'canvas-confetti';

/**
 * One permanent, transparent confetti canvas that is created at startup and reused.
 * (Creating and deleting a full-screen canvas on every burst can flash white on Android WebView.)
 */
let fire: ReturnType<typeof confetti.create> | null = null;

export function initConfetti(): void {
  if (fire || typeof document === 'undefined') return;
  try {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:100;';
    document.body.appendChild(canvas);
    fire = confetti.create(canvas, { resize: true, useWorker: false });
  } catch {
    fire = null;
  }
}

const COLORS = ['#F59E0B', '#2BC468', '#55DCB3', '#EC4899', '#FBBF24'];

export function fireRewardConfetti(originY = 0.6) {
  try {
    if (!fire) initConfetti();
    fire?.({
      particleCount: 45,
      spread: 70,
      origin: { y: originY },
      colors: COLORS,
      disableForReducedMotion: false,
    });
  } catch {
    // Graceful fallback
  }
}

export function fireJackpotConfetti() {
  try {
    if (!fire) initConfetti();
    const end = Date.now() + 2000;
    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      if (Date.now() > end) return clearInterval(interval);
      fire?.({
        particleCount: 25,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: COLORS,
      });
    }, 300);
  } catch {
    // Graceful fallback
  }
}
