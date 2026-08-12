#!/usr/bin/env bash
# Build a debug APK for Moodley Auth
# Requires: Android Studio / Android SDK with ANDROID_HOME set
set -e

export ANDROID_HOME="${ANDROID_HOME:-/home/sammy/Android/Sdk}"
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-21-openjdk}"

echo "📦 Building Ionic app..."
npm run build

echo "🔄 Syncing to Android..."
npx cap sync android

echo "🔨 Building debug APK..."
./android/gradlew -p android assembleDebug

APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "✅ APK ready: $APK_PATH"
echo ""
echo "To install directly on connected device:"
echo "  adb install $APK_PATH"
echo ""
echo "To upload to GitHub Releases:"
echo "  gh release upload v1.0.0 $APK_PATH#moodley-auth.apk --clobber"
