import confetti from 'canvas-confetti';

export function fireRewardConfetti(originY = 0.6) {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: originY },
      colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#FBBF24'],
      disableForReducedMotion: true,
    });
  } catch {
    // Graceful fallback
  }
}

export function fireJackpotConfetti() {
  try {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#F59E0B', '#EAB308', '#10B981', '#38BDF8', '#F43F5E'],
      });
    }, 250);
  } catch {
    // Graceful fallback
  }
}
