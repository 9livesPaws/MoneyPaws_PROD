import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  RewardAdPluginEvents,
  BannerAdSize,
  BannerAdPosition,
  type AdMobRewardItem,
} from '@capacitor-community/admob';

/**
 * AdMob integration (native Android/iOS via Capacitor).
 * AdMob does not run in a normal browser, so on web `isNativeAds` is false
 * and the UI falls back to a clearly-labelled preview.
 *
 * Google's public TEST ids are used until you set VITE_ADMOB_PRODUCTION=true
 * and provide your real unit ids in .env (see .env.example).
 */
const TEST_REWARDED = 'ca-app-pub-3940256099942544/5224354917';
const TEST_BANNER = 'ca-app-pub-3940256099942544/6300978111';

const env = import.meta.env;
const IS_PRODUCTION = env.VITE_ADMOB_PRODUCTION === 'true';

export const REWARDED_UNIT_ID: string = IS_PRODUCTION
  ? (env.VITE_ADMOB_REWARDED_ID as string) || ''
  : TEST_REWARDED;
export const BANNER_UNIT_ID: string = IS_PRODUCTION
  ? (env.VITE_ADMOB_BANNER_ID as string) || ''
  : TEST_BANNER;

export const isNativeAds = Capacitor.isNativePlatform();

let initialized = false;

export async function initAds(): Promise<void> {
  if (!isNativeAds || initialized) return;
  try {
    await AdMob.initialize({ initializeForTesting: !IS_PRODUCTION });
    initialized = true;
  } catch (err) {
    console.warn('AdMob init failed:', err);
  }
}

export const BANNER_HEIGHT_PX = 50;

export async function showBottomBanner(): Promise<void> {
  if (!isNativeAds || !BANNER_UNIT_ID) return;
  try {
    await initAds();
    await AdMob.showBanner({
      adId: BANNER_UNIT_ID,
      adSize: BannerAdSize.BANNER, // fixed 320x50, so the layout never jumps
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: !IS_PRODUCTION,
    });
  } catch (err) {
    console.warn('Banner failed:', err);
  }
}

export async function hideBanner(): Promise<void> {
  if (!isNativeAds) return;
  try { await AdMob.hideBanner(); } catch { /* not shown */ }
}
export async function resumeBanner(): Promise<void> {
  if (!isNativeAds) return;
  try { await AdMob.resumeBanner(); } catch { /* not created */ }
}
export async function removeBanner(): Promise<void> {
  if (!isNativeAds) return;
  try { await AdMob.removeBanner(); } catch { /* not created */ }
}

export type RewardedResult = 'rewarded' | 'dismissed' | 'error';

/** Shows a real AdMob rewarded ad. Resolves 'rewarded' only if the user earned it. */
export async function showRewardedAd(): Promise<RewardedResult> {
  if (!isNativeAds || !REWARDED_UNIT_ID) return 'error';
  await initAds();

  let earned = false;
  const handles: { remove: () => Promise<void> }[] = [];
  try {
    return await new Promise<RewardedResult>(async (resolve) => {
      handles.push(
        await AdMob.addListener(RewardAdPluginEvents.Rewarded, (_item: AdMobRewardItem) => {
          earned = true;
        }),
        await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
          resolve(earned ? 'rewarded' : 'dismissed');
        }),
        await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => resolve('error')),
        await AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => resolve('error')),
      );
      try {
        await AdMob.prepareRewardVideoAd({ adId: REWARDED_UNIT_ID, isTesting: !IS_PRODUCTION });
        await AdMob.showRewardVideoAd();
      } catch {
        resolve('error');
      }
    });
  } finally {
    await Promise.all(handles.map((h) => h.remove().catch(() => {})));
  }
}
