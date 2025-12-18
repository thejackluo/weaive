# Weave Mobile App

React Native mobile application for Weave MVP built with Expo.

## Prerequisites

- Node.js 20+
- npm or yarn
- iOS Simulator (Xcode on macOS) or Expo Go app

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

> **⚠️ IMPORTANT:** When adding new packages to this Expo project, always use `npx expo install <package>` instead of `npm install <package>`. This ensures SDK-compatible versions are installed and prevents peer dependency conflicts.
>
> **Good:** `npx expo install react-native-screens`  
> **Bad:** `npm install react-native-screens`

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit `.env` and add your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=your-actual-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-supabase-anon-key
```

### 3. Start Development Server

```bash
npx expo start
```

### 4. Run on iOS Simulator

```bash
npx expo start --ios
```

Or press `i` in the terminal after running `npx expo start`.

### 5. Run on Physical Device

1. Install the **Expo Go** app from the App Store
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

- **Framework:** Expo SDK 53
- **Runtime:** React Native 0.79
- **UI Library:** React 19
- **Routing:** Expo Router v5
- **State Management:** TanStack Query (server state), Zustand (UI state)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Backend:** Supabase
- **Language:** TypeScript (strict mode)

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
- **Adding Packages:** Always use `npx expo install <package>` to ensure SDK compatibility

## Troubleshooting

### Port Already in Use

```bash
# Kill the process using port 8081
npx kill-port 8081
```

### Clear Cache

```bash
npx expo start --clear
```

### Reset Everything

```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### NativeWind Styles Not Working

If Tailwind classes aren't applying:

1. Verify `tailwindcss` is installed: `npm list tailwindcss`
2. Check `metro.config.js` has `withNativeWind()` wrapper
3. Clear Metro cache: `npx expo start -c`
4. See full troubleshooting: `docs/bugs/nativewind-styling-not-working.md`

**Prevention:** Always use `npx expo install` when adding packages to avoid missing peer dependencies.

## Next Steps

- Story 0.2: Database schema setup
- Story 0.3: Authentication implementation
- Story 1.1: Onboarding flow

## Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [NativeWind Documentation](https://www.nativewind.dev/)
