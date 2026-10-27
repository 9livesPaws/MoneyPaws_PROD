import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/fredoka';
import './index.css';
import { initAds, showBottomBanner, isNativeAds } from './utils/ads';

// Guard against third-party browser extension errors (e.g. MetaMask chrome-extension injection)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      (String(event.reason).includes('MetaMask') ||
        String(event.reason?.stack || '').includes('chrome-extension://'))
    ) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    if (
      event.filename?.includes('chrome-extension://') ||
      event.message?.includes('MetaMask')
    ) {
      event.preventDefault();
    }
  });
}

if (isNativeAds) document.documentElement.classList.add('native-app');

createRoot(document.getElementById('root')!).render(<App />);

// Native only (no-op on web): start AdMob and show the bottom banner above the nav bar.
initAds().then(() => showBottomBanner(64));
