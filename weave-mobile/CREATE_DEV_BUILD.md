# Creating a Development Build for OAuth Testing

## Why Development Builds?

**Expo Go cannot handle OAuth redirects.** This is a fundamental limitation documented by Expo.

Development builds:
- ✅ Support OAuth redirects properly
- ✅ Use your custom `weavelight://` scheme
- ✅ Have fast refresh and all dev features
- ✅ Work exactly like production builds
- ✅ Can be debugged with Chrome DevTools

## Prerequisites

### iOS Development Build

**Requirements:**
- Mac with Xcode installed
- iOS Simulator or physical iPhone
- Apple Developer account (free tier is fine)

**Steps:**

1. **Install iOS dependencies** (if not already installed):
   ```bash
   # Install CocoaPods (if not installed)
   sudo gem install cocoapods

   # Verify Xcode is installed
   xcode-select --print-path
   ```

2. **Build and run on iOS Simulator**:
   ```bash
   cd weave-mobile
   npx expo run:ios
   ```

   This will:
   - Generate native iOS project in `ios/` directory
   - Install dependencies via CocoaPods
   - Build the app
   - Launch iOS Simulator
   - Install and run the app

3. **Build for physical iPhone** (optional):
   ```bash
   # Connect iPhone via USB
   # Trust the computer on your iPhone

   # Build and run on device
   npx expo run:ios --device
   ```

### Android Development Build

**Requirements:**
- Android Studio installed
- Android Emulator or physical Android device
- USB debugging enabled (for physical device)

**Steps:**

1. **Install Android Studio** (if not installed):
   - Download from: https://developer.android.com/studio
   - Install Android SDK, platform tools, and build tools
   - Set up environment variables (Android Studio should do this automatically)

2. **Build and run on Android Emulator**:
   ```bash
   cd weave-mobile
   npx expo run:android
   ```

   This will:
   - Generate native Android project in `android/` directory
   - Install dependencies via Gradle
   - Build the app
   - Launch Android Emulator (or prompt you to start one)
   - Install and run the app

3. **Build for physical Android device**:
   ```bash
   # Enable USB debugging on your Android device:
   # Settings → About Phone → Tap "Build Number" 7 times → Developer Options → Enable USB Debugging

   # Connect device via USB
   # Allow USB debugging when prompted on device

   # Verify device is connected
   adb devices

   # Build and run
   npx expo run:android --device
   ```

## After First Build

Once you've built the app once, you DON'T need to rebuild for every change:

```bash
# Just start the Metro bundler
npx expo start --dev-client

# Or use the shortcut
npx expo start
```

The app will hot-reload just like Expo Go!

## Testing OAuth

Once running in a development build:

1. **Open the app** (it will be installed on your device/simulator with your app icon)
2. **Tap "Continue with Google"**
3. **Sign in with Google** - OAuth screen will open
4. **Watch the magic happen** - After signing in, the browser will automatically redirect back to your app using `weavelight://`
5. **Success!** - You'll be navigated to the identity-bootup screen

## Troubleshooting

### iOS: "No development team selected"

Fix:
1. Open `ios/weavemobile.xcworkspace` in Xcode
2. Select your target in the project navigator
3. Go to "Signing & Capabilities" tab
4. Select your team (or add your Apple ID account)

### iOS: "Could not find iPhone simulator"

Fix:
```bash
# Open Xcode and install simulators
open -a Simulator
```

### Android: "SDK location not found"

Fix:
1. Create `android/local.properties` file
2. Add: `sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk` (adjust path for your system)

### Android: Emulator not starting

Fix:
```bash
# Launch Android Studio
# Tools → Device Manager → Create Virtual Device
# Select a device (e.g., Pixel 6)
# Select a system image (e.g., Android 13)
# Finish and launch the emulator
```

### App builds but OAuth still doesn't work

Verify:
1. Check console logs - redirect URI should show `weavelight://` not `exp://`
2. Verify Supabase has `weavelight://` in redirect URLs (already configured ✓)
3. Restart the app after building

### Metro bundler errors

Fix:
```bash
# Clear Metro cache
npx expo start --clear

# Or clear all caches
rm -rf node_modules
rm -rf ios/Pods ios/Podfile.lock
rm -rf android/.gradle android/build
npm install
npx expo run:ios # or npx expo run:android
```

## Development Workflow

**First time:**
```bash
npx expo run:ios  # Builds native app (takes ~5 minutes)
```

**Every other time:**
```bash
npx expo start  # Just starts Metro, app hot-reloads instantly
```

You only need to rebuild when:
- You add/remove native dependencies (libraries that require `npx expo install`)
- You modify `app.json` (change scheme, bundle ID, permissions, etc.)
- You update Expo SDK version

## Benefits of Development Builds

1. **OAuth works properly** - Uses `weavelight://` scheme
2. **Fast refresh** - Code updates instantly (just like Expo Go)
3. **Native debugging** - Chrome DevTools, React DevTools, Xcode debugger
4. **Test push notifications** - Push notifications don't work in Expo Go
5. **Test native modules** - Some libraries don't work in Expo Go
6. **Production parity** - Runs exactly like production builds

## Next Steps

After OAuth works:
1. Continue developing with fast refresh
2. Test other features (push notifications, etc.)
3. When ready for beta testing, use EAS Build for cloud builds
4. When ready for production, submit to App Store / Play Store

## Additional Resources

- Expo Development Builds: https://docs.expo.dev/develop/development-builds/introduction/
- Expo Run Commands: https://docs.expo.dev/more/expo-cli/#compiling
- OAuth with Expo: https://docs.expo.dev/guides/authentication/
