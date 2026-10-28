#!/usr/bin/env bash
# Runs automatically after `npx cap sync` (npm hook "capacitor:sync:after").
# Makes the Android launch/window background dark so there is no white flash.
set -e
RES=android/app/src/main/res
[ -d "$RES" ] || exit 0

find "$RES" -name 'splash.png' -delete
mkdir -p "$RES/drawable"
cat > "$RES/drawable/splash.xml" <<'X'
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="#020617"/>
</shape>
X
cat > "$RES/values/mp_colors.xml" <<'X'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="mp_bg">#020617</color>
</resources>
X
if ! grep -q "windowBackground" "$RES/values/styles.xml"; then
  sed -i 's#<item name="android:background">@null</item>#<item name="android:background">@color/mp_bg</item><item name="android:windowBackground">@color/mp_bg</item>#' "$RES/values/styles.xml"
  sed -i 's#<item name="android:background">@drawable/splash</item>#<item name="android:background">@drawable/splash</item><item name="windowSplashScreenBackground">@color/mp_bg</item>#' "$RES/values/styles.xml"
fi
# Light status/navigation bar icons on the dark background
if ! grep -q "windowLightStatusBar" "$RES/values/styles.xml"; then
  sed -i 's#<item name="android:windowBackground">@color/mp_bg</item>#<item name="android:windowBackground">@color/mp_bg</item><item name="android:windowLightStatusBar">false</item><item name="android:windowLightNavigationBar">false</item>#' "$RES/values/styles.xml"
fi

# Android 15+ draws apps under the system bars. Keep the web page inside them (and above the ad banner)
JAVA_DIR=android/app/src/main/java/com/moneypaws/app
if [ -d "$JAVA_DIR" ]; then
cat > "$JAVA_DIR/MainActivity.java" <<'J'
package com.moneypaws.app;

import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private WebView appWebView;
    private int barLeft = 0;
    private int barTop = 0;
    private int barRight = 0;
    private int barBottom = 0;
    private int bannerPx = 0;

    public class AdBridge {
        @JavascriptInterface
        public void setBanner(final float heightDp) {
            runOnUiThread(() -> {
                float density = getResources().getDisplayMetrics().density;
                bannerPx = Math.round(Math.max(0f, heightDp) * density);
                applyMargins();
            });
        }
    }

    private void applyMargins() {
        if (appWebView == null) return;
        ViewGroup.LayoutParams lp = appWebView.getLayoutParams();
        if (lp instanceof ViewGroup.MarginLayoutParams) {
            ViewGroup.MarginLayoutParams m = (ViewGroup.MarginLayoutParams) lp;
            int bottom = barBottom + bannerPx;
            if (m.leftMargin == barLeft && m.topMargin == barTop && m.rightMargin == barRight && m.bottomMargin == bottom) {
                return; // nothing changed: avoid a needless relayout (it causes flicker)
            }
            m.setMargins(barLeft, barTop, barRight, bottom);
            appWebView.setLayoutParams(m);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        // Coming back from a full-screen ad can leave the WebView blank: ask it to redraw.
        if (appWebView != null) {
            appWebView.postDelayed(() -> {
                appWebView.requestLayout();
                appWebView.invalidate();
            }, 200);
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        appWebView = getBridge().getWebView();
        appWebView.addJavascriptInterface(new AdBridge(), "MPAds");
        ViewCompat.setOnApplyWindowInsetsListener(appWebView, (v, windowInsets) -> {
            Insets bars = windowInsets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets ime = windowInsets.getInsets(WindowInsetsCompat.Type.ime());
            barLeft = bars.left;
            barTop = bars.top;
            barRight = bars.right;
            barBottom = Math.max(bars.bottom, ime.bottom);
            applyMargins();
            return WindowInsetsCompat.CONSUMED;
        });
    }
}
J
fi
echo "android-patch: dark launch theme + insets bridge applied"
