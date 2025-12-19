# Weave Mobile App

React Native mobile application for Weave MVP built with Expo.

## Prerequisites

- **Node.js 20.19.4+** (required)
- npm (comes with Node.js)
- iOS Simulator (Xcode on macOS) or Expo Go app
- For Windows: PowerShell recommended (WSL may have permission issues)

## First-Time Setup

### Step 1: Install Dependencies

**Important:** Always use `npx expo install` for native packages to ensure JavaScript and native layers stay synchronized.

```bash
# Navigate to project directory
cd weave-mobile

# Install all dependencies (Expo will handle native packages automatically)
npx expo install --fix
```

This command:

- ✅ Installs all dependencies
- ✅ Ensures compatible versions for Expo SDK 54
- ✅ Syncs JavaScript and native module versions
- ✅ Fixes peer dependency issues automatically

### Step 2: Verify Installation

After installation, verify everything is set up correctly:

```bash
npx expo-doctor
```

**Expected Output:**

```
✔ Check Expo config for common issues
✔ Check package.json for common issues
✔ Check dependencies for packages that should not be installed directly
✔ Check for issues with metro config
✔ Check npm/ yarn/ pnpm versions
✔ Check Expo config (app.json/ app.config.js) schema
✔ Check that packages match versions required by installed Expo SDK
✔ Check that native modules do not use incompatible support packages

Didn't find any issues with the project!
```

If you see any warnings, follow the suggestions or refer to the [Troubleshooting Guide](#troubleshooting).

### Step 3: Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit `.env` and add your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=your-actual-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-supabase-anon-key
```

### Step 4: Start Development Server

```bash
npx expo start --clear
```

The `--clear` flag ensures a fresh start with cleared caches.

### Step 5: Run on Device or Simulator

**iOS Simulator:**

```bash
npx expo start --ios
```

Or press `i` in the terminal after running `npx expo start`.

**Android Emulator:**

```bash
npx expo start --android
```

Or press `a` in the terminal.

**Physical Device:**

1. Install the **Expo Go** app from the App Store (iOS) or Google Play (Android)
2. Scan the QR code shown in the terminal

## Project Structure

```
weave-mobile/
├── app/                    # Expo Router (file-based routing)
│   └── (tabs)/            # Tab-based navigation
│       └── index.tsx      # Home screen
├── src/
│   ├── components/        # Reusable UI components
│   ├── design-system/     # Design system components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API clients, Supabase client
│   ├── stores/            # Zustand state management
│   └── types/             # TypeScript type definitions
├── assets/                # Images, fonts, etc.
├── .env.example           # Environment variables template
├── app.json               # Expo configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript configuration
```

## Tech Stack

- **Framework:** Expo SDK 54.0.30
- **Runtime:** React Native 0.81.5
- **UI Library:** React 19.1.0 (required by RN 0.81+)
- **Routing:** Expo Router 6.0.21
- **State Management:** TanStack Query (server state), Zustand (UI state)
- **Styling:** NativeWind 5.0.0-preview.2 (Tailwind CSS for React Native)
- **Backend:** Supabase
- **Language:** TypeScript 5.9.2 (strict mode)

**Note:** React 19 is required and officially supported by React Native 0.81+. Do not downgrade to React 18.

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Development Guidelines

- **TypeScript Strict Mode:** Enabled for type safety
- **Code Quality:** ESLint + Prettier configured
- **Environment Variables:** Never commit `.env` file
- **State Management:** Use TanStack Query for server state, Zustand for UI state, useState for local state
- **Styling:** Use NativeWind (Tailwind) classes

### Important: Installing Packages

**Always use `npx expo install` for packages with native code:**

```bash
# ✅ GOOD - Syncs both JS and native automatically
npx expo install react-native-maps
npx expo install react-native-worklets-core

# ❌ BAD - Only updates JS, native stays old (causes crashes)
npm install react-native-maps
```

**Why?** React Native has two layers (JavaScript and native) that must stay synchronized. Using `npm install` only updates JavaScript, causing version mismatches and runtime crashes.

**After installing packages:**

```bash
# Verify no issues
npx expo-doctor

# Restart with cleared cache
npx expo start --clear
```

## Troubleshooting

### Quick Fixes

**Clear Metro Cache:**

```bash
npx expo start --clear
```

**Fix Peer Dependencies:**

```bash
npx expo install --fix
```

**Verify Installation:**

```bash
npx expo-doctor
```

### Common Issues

#### Port Already in Use

**Windows PowerShell:**

```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 8081).OwningProcess | Stop-Process
```

**WSL/Linux:**

```bash
lsof -ti:8081 | xargs kill -9
```

#### Babel Configuration Error

If you see an error like `.plugins is not a valid Plugin property`, the Metro bundler cache is out of sync with `babel.config.js`:

```bash
npx expo start --clear
```

This typically happens after changes to `babel.config.js` (e.g., adding NativeWind or design system imports). The `--clear` flag rebuilds the bundler cache from scratch.

#### Worklets Version Mismatch

**Error:** `WorkletsError: Mismatch between JavaScript and native`

**Solution:**

```bash
# Explicitly install worklets (syncs both JS and native)
npx expo install react-native-worklets-core

# Verify
npx expo-doctor

# Restart
npx expo start --clear
```

#### WSL/Windows Permission Errors

If you get `EACCES: permission denied` errors on Windows:

1. **Use PowerShell instead of WSL** (recommended)
2. Or run PowerShell as Administrator
3. Or delete `node_modules` first, then reinstall

**PowerShell:**

```powershell
Remove-Item -Path node_modules -Recurse -Force
npx expo install --fix
```

#### NativeWind Styling Not Working

**Checklist:**

- [ ] Is `@import "nativewind/theme"` in `global.css`?
- [ ] Is `withNativeWind` wrapping config in `metro.config.js`?
- [ ] Is `jsxImportSource: 'nativewind'` in `babel.config.js`?
- [ ] Did you restart Metro after config changes?

**Fix:**

```bash
# Verify config files, then:
npx expo start --clear
```

### Nuclear Reset (Last Resort)

If nothing else works, perform a complete clean install:

**Windows PowerShell:**

```powershell
Remove-Item -Path node_modules -Recurse -Force
Remove-Item -Path .expo -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path package-lock.json -Force -ErrorAction SilentlyContinue
npx expo install --fix
npx expo-doctor
npx expo start --clear
```

**WSL/Linux:**

```bash
rm -rf node_modules .expo package-lock.json
npx expo install --fix
npx expo-doctor
npx expo start --clear
```

### Comprehensive Troubleshooting Guide

For detailed troubleshooting instructions, version mismatch fixes, and advanced solutions, see:

📖 **[Complete Fix & Setup Guide](./debugging/fix-instructions.md)**

This guide includes:

- JS vs Native version mismatch explanations
- Step-by-step fix procedures
- Windows/WSL specific solutions
- Configuration file examples
- Prevention best practices

## Next Steps

- Story 0.2: Database schema setup
- Story 0.3: Authentication implementation
- Story 1.1: Onboarding flow

## Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [NativeWind Documentation](https://www.nativewind.dev/)
