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

## OAuth Configuration

### Google Sign-In Setup

To enable Google Sign-In in the Weave mobile app, you need to configure both Google Cloud and Supabase.

#### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console:**
   - Navigate to [Google Cloud Console](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a New Project:**
   - Click the project dropdown at the top
   - Click "New Project"
   - Enter project name: `Weave MVP` (or your preferred name)
   - Click "Create"

#### Step 2: Configure OAuth Consent Screen

1. **Navigate to OAuth Consent Screen:**
   - In the left sidebar: APIs & Services → OAuth consent screen
   - Select "External" user type (for public app)
   - Click "Create"

2. **Fill Out App Information:**
   - **App name:** `Weave`
   - **User support email:** Your email address
   - **App logo:** Upload app icon (optional for testing)
   - **Application home page:** `https://weaveapp.com` (or temporary URL)
   - **Authorized domains:**
     - Add your Supabase project domain: `<project-ref>.supabase.co`
   - **Developer contact email:** Your email address
   - Click "Save and Continue"

3. **Scopes:**
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `email` - View your email address
     - `profile` - See your personal info
   - Click "Update" → "Save and Continue"

4. **Test Users (Optional):**
   - Add test user emails if in testing mode
   - Click "Save and Continue"

5. **Summary:**
   - Review and click "Back to Dashboard"

#### Step 3: Create OAuth 2.0 Credentials

1. **Navigate to Credentials:**
   - In the left sidebar: APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"

2. **Configure OAuth Client:**
   - **Application type:** Web application
   - **Name:** `Weave Mobile OAuth`
   - **Authorized JavaScript origins:** Leave empty for now
   - **Authorized redirect URIs:** Add your Supabase callback URL:
     ```
     https://<project-ref>.supabase.co/auth/v1/callback
     ```
     Replace `<project-ref>` with your actual Supabase project reference ID
   - Click "Create"

3. **Save Credentials:**
   - **Copy the Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
   - **Copy the Client Secret** (looks like: `GOCSPX-abc123xyz789`)
   - Store these securely - you'll need them for Supabase

#### Step 4: Configure Supabase

1. **Open Supabase Dashboard:**
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Select your Weave project

2. **Navigate to Auth Providers:**
   - In the left sidebar: Authentication → Providers
   - Find "Google" in the provider list

3. **Enable Google Provider:**
   - Toggle "Enable Sign in with Google" to ON
   - **Client ID:** Paste your Google OAuth Client ID
   - **Client Secret:** Paste your Google OAuth Client Secret
   - **Redirect URL:** Should auto-populate (verify it matches the URL you added to Google Console)
   - Click "Save"

#### Step 5: Configure Mobile App Deep Linking

1. **Update app.json:**
   - Open `app.json` in the project root
   - Verify the `scheme` field is set:
     ```json
     {
       "expo": {
         "scheme": "weavelight"
       }
     }
     ```

2. **Test Deep Link:**
   - The OAuth redirect will use: `weavelight://`
   - Supabase handles the callback automatically
   - Your app will receive the auth session via deep link

#### Step 6: Test Google Sign-In

1. **Start the app:**
   ```bash
   npx expo start --clear
   ```

2. **Open the app** and navigate to the login screen

3. **Tap "Sign in with Google":**
   - You should be redirected to Google's consent screen
   - Select your Google account
   - Review permissions (email, profile)
   - Click "Allow"
   - You should be redirected back to the app
   - You should see a success toast: "Signed in with Google! 🎉"

4. **Verify Authentication:**
   - Check that you're logged in (should see home screen)
   - Verify user data is in Supabase: Authentication → Users
   - Logout and try logging in again with Google

#### Troubleshooting Google OAuth

**Error: "redirect_uri_mismatch"**
- Verify the redirect URI in Google Console exactly matches:
  `https://<project-ref>.supabase.co/auth/v1/callback`
- Ensure no trailing slashes or typos

**Error: "Access blocked: This app's request is invalid"**
- Verify OAuth consent screen is fully configured
- Check that `email` and `profile` scopes are enabled
- Make sure the client ID/secret are correctly entered in Supabase

**OAuth popup opens but nothing happens:**
- Verify `scheme: "weavelight"` is in `app.json`
- Check that deep linking is working: Test with a simple deep link
- Verify Supabase Auth is configured correctly

**Sign-In works in browser but not in app:**
- This is expected! OAuth in React Native requires a development build
- Expo Go may have limitations with OAuth deep linking
- Build with: `npx expo prebuild && npx expo run:ios`

### Apple Sign-In Setup (iOS Only)

Apple Sign-In is currently **disabled** in the Weave app until full configuration is complete.

#### Why Apple Sign-In is Disabled

- Apple requires specific certificates and provisioning profiles
- App must be published to App Store Connect (or TestFlight)
- Requires Apple Developer Program membership ($99/year)
- Not required for MVP testing with Expo Go

#### Enabling Apple Sign-In (Future)

When you're ready to enable Apple Sign-In:

1. **Join Apple Developer Program:**
   - Sign up at: https://developer.apple.com/programs/
   - Cost: $99/year

2. **Configure Sign in with Apple:**
   - Create an App ID with "Sign in with Apple" capability
   - Create a Services ID for OAuth
   - Create a private key for authentication
   - Configure in Supabase: Authentication → Providers → Apple

3. **Re-enable Apple Button:**
   - Edit `app/(auth)/login.tsx` and `app/(auth)/signup.tsx`
   - Uncomment the Apple Sign-In button sections (lines 321-372)
   - Remove the disabled state and enable `handleOAuthSignIn('apple')`

4. **Test on Physical iOS Device:**
   - Apple Sign-In requires a real iOS device (not simulator)
   - Build with: `npx expo run:ios --device`
   - Test the full OAuth flow end-to-end

For now, Google Sign-In is fully functional and sufficient for MVP testing.

## Next Steps

- Story 0.2: Database schema setup
- Story 0.3: Authentication implementation
- Story 1.1: Onboarding flow

## Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Google OAuth Setup Guide](https://support.google.com/cloud/answer/6158849)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
