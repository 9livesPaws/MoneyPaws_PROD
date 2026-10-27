// Dedicated Haptic Feedback Engine for Android and Mobile Web
// Uses Navigator.vibrate API with fallback handling

class HapticFeedback {
  public enabled: boolean = true;

  private trigger(pattern: number | number[]): boolean {
    if (!this.enabled) return false;
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      try {
        return navigator.vibrate(pattern);
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Subtle, crisp feedback for standard button interactions and tab clicks
   */
  public light(): boolean {
    return this.trigger(16);
  }

  /**
   * Specific tactile feedback for "TAP TO MINE" button
   * Gives a mechanical click and micro-recoil feel
   */
  public tapMine(): boolean {
    return this.trigger([32, 18, 24]);
  }

  /**
   * Rewarding vibration when claiming daily rewards, missions, or unboxing
   */
  public claim(): boolean {
    return this.trigger([45, 40, 80]);
  }

  /**
   * Celebratory pattern for jackpot prizes and grand rewards
   */
  public jackpot(): boolean {
    return this.trigger([60, 40, 100, 40, 160]);
  }

  /**
   * Subtle pedometer impact step pulse
   */
  public step(): boolean {
    return this.trigger(15);
  }

  /**
   * Micro vibration for scratching silver card foils
   */
  public scratch(): boolean {
    return this.trigger(12);
  }

  /**
   * Warning or error haptic pulse
   */
  public error(): boolean {
    return this.trigger([70, 50, 70]);
  }
}

export const haptics = new HapticFeedback();
