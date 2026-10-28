import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const native = Capacitor.isNativePlatform();
const MINING_ID = 1001;
const DAILY_ID = 1002;

async function hasPermission(prompt: boolean): Promise<boolean> {
  if (!native) return false;
  try {
    let p = await LocalNotifications.checkPermissions();
    if (prompt && (p.display === 'prompt' || p.display === 'prompt-with-rationale')) {
      p = await LocalNotifications.requestPermissions();
    }
    return p.display === 'granted';
  } catch {
    return false;
  }
}

/** Daily 9:00 AM nudge. Only scheduled once the user has allowed notifications. */
export async function scheduleDailyReminder(): Promise<void> {
  if (!(await hasPermission(false))) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: DAILY_ID }] });
    await LocalNotifications.schedule({
      notifications: [
        {
          id: DAILY_ID,
          title: 'Good morning! 🐾',
          body: 'Claim your daily bonus and start your cat mining.',
          schedule: { on: { hour: 9, minute: 0 }, allowWhileIdle: true },
        },
      ],
    });
  } catch {
    /* notifications are optional */
  }
}

/** Reminds the user when the 3-hour mining session is done. `prompt` asks for permission if needed. */
export async function scheduleMiningDone(endsAt: number, prompt: boolean): Promise<void> {
  if (!native || endsAt <= Date.now()) return;
  if (!(await hasPermission(prompt))) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: MINING_ID }] });
    await LocalNotifications.schedule({
      notifications: [
        {
          id: MINING_ID,
          title: 'Your cat finished mining! 🐱⛏️',
          body: 'Open MoneyPaws and claim your PawCoins.',
          schedule: { at: new Date(endsAt), allowWhileIdle: true },
        },
      ],
    });
    await scheduleDailyReminder();
  } catch {
    /* notifications are optional */
  }
}

export async function cancelMiningDone(): Promise<void> {
  if (!native) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: MINING_ID }] });
  } catch {
    /* ignore */
  }
}
