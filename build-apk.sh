#!/usr/bin/env bash
# Build Moodley Auth APK.
# Usage:
#   ./build-apk.sh nightly      # debug + nightly worker
#   ./build-apk.sh production   # release + production worker
#
# Requires: Android Studio / Android SDK with ANDROID_HOME set
set -euo pipefail

TARGET="${1:-nightly}"

export ANDROID_HOME="${ANDROID_HOME:-/home/sammy/Android/Sdk}"
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-21-openjdk}"

if [[ "$TARGET" == "production" ]]; then
  BUILD_CONFIG="production"
  GRADLE_TASK="assembleRelease"
  APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
else
  BUILD_CONFIG="development"
  GRADLE_TASK="assembleDebug"
  APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
fi

echo "📦 Building Ionic app ($BUILD_CONFIG)..."
npm run build -- --configuration "$BUILD_CONFIG"

echo "🔄 Syncing to Android..."
npx cap sync android

echo "🔨 Building APK ($GRADLE_TASK)..."
./android/gradlew -p android "$GRADLE_TASK"

echo ""
echo "✅ APK ready: $APK_PATH"
echo ""
echo "To install directly on connected device:"
echo "  adb install $APK_PATH"
