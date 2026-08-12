#!/usr/bin/env bash
# Build a debug APK for Moodley Auth
# Requires: Android Studio / Android SDK with ANDROID_HOME set
set -e

echo "📦 Building Ionic app..."
npm run build

echo "🔄 Syncing to Android..."
npx cap sync android

echo "🔨 Building debug APK..."
cd android && ./gradlew assembleDebug

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "✅ APK ready: android/$APK_PATH"
echo ""
echo "To install directly on connected device:"
echo "  adb install android/$APK_PATH"
