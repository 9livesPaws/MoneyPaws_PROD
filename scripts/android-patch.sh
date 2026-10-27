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
echo "android-patch: dark launch theme applied"
