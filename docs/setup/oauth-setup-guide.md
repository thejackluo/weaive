# OAuth Provider Setup Guide (Story 0.3)

Complete guide for configuring Google and Apple OAuth authentication in Supabase for the Weave mobile app.

## Prerequisites

- Supabase project created
- Access to Supabase dashboard
- Google Cloud Console access (for Google OAuth)
- Apple Developer account (for Apple OAuth, iOS only)
- Weave mobile app configured with deep link scheme: `weavelight://`

## Table of Contents

1. [Google OAuth Setup](#google-oauth-setup)
2. [Apple OAuth Setup](#apple-oauth-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Testing OAuth Flow](#testing-oauth-flow)
5. [Troubleshooting](#troubleshooting)

---

## Google OAuth Setup

### Step 1: Create OAuth Credentials in Google Cloud Console

1. **Go to Google Cloud Console**
   - Navigate to: https://console.cloud.google.com/
   - Create a new project or select existing project

2. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"

4. **Configure OAuth Consent Screen** (if not already configured)
   - Go to "OAuth consent screen"
   - Choose "External" for user type
   - Fill in required fields:
     - App name: `Weave`
     - User support email: Your support email
     - Developer contact email: Your contact email
   - Add scopes (minimum required):
     - `./auth/userinfo.email`
     - `./auth/userinfo.profile`
   - Save and continue

5. **Create Web Application Credentials**
   - Application type: **Web application**
   - Name: `Weave Web Client`
   - Authorized redirect URIs:
     ```
     https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
     ```
     Replace `<your-supabase-project-ref>` with your actual Supabase project reference ID
   - Click "Create"
   - **Save the Client ID and Client Secret** - you'll need these for Supabase

6. **Create iOS Application Credentials** (for mobile app)
   - Click "Create Credentials" → "OAuth client ID" again
   - Application type: **iOS**
   - Name: `Weave iOS Client`
   - Bundle ID: `com.weavelight.app` (must match app.json)
   - Click "Create"

7. **Create Android Application Credentials** (optional, for future Android support)
   - Application type: **Android**
   - Name: `Weave Android Client`
   - Package name: `com.weavelight.app`
   - SHA-1 certificate fingerprint: (obtain from your signing key)

### Step 2: Configure Google OAuth in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the provider list
4. Toggle "Enable Sign in with Google" to **ON**
5. Enter the credentials from Step 1:
   - **Client ID (OAuth)**: Your Google OAuth Client ID
   - **Client Secret (OAuth)**: Your Google OAuth Client Secret
6. Configure additional settings:
   - **Skip nonce check**: Leave **OFF** (recommended for security)
7. Click **Save**

---

## Apple OAuth Setup

### Step 1: Create App ID and Services ID in Apple Developer

1. **Create App ID**
   - Go to: https://developer.apple.com/account/resources/identifiers/list
   - Click "+" to create new identifier
   - Select "App IDs" → Continue
   - Description: `Weave`
   - Bundle ID: `com.weavelight.app` (explicit, must match app.json)
   - Capabilities: Enable **Sign in with Apple**
   - Click "Continue" → "Register"

2. **Create Services ID** (for web auth flow)
   - Click "+" to create new identifier
   - Select "Services IDs" → Continue
   - Description: `Weave Web`
   - Identifier: `com.weavelight.app.web`
   - Enable **Sign in with Apple**
   - Click "Configure" next to "Sign in with Apple"
   - Primary App ID: Select `com.weavelight.app`
   - Domains and Subdomains:
     ```
     <your-supabase-project-ref>.supabase.co
     ```
   - Return URLs:
     ```
     https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
     ```
   - Click "Save" → "Continue" → "Register"

3. **Create Private Key**
   - Go to "Keys" section
   - Click "+" to create new key
   - Key Name: `Weave Sign in with Apple Key`
   - Enable **Sign in with Apple**
   - Click "Configure" → Select Primary App ID: `com.weavelight.app`
   - Click "Save" → "Continue" → "Register"
   - **Download the key file** (you can only download once!)
   - **Save the Key ID** (displayed on the download screen)

### Step 2: Configure Apple OAuth in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Apple** in the provider list
4. Toggle "Enable Sign in with Apple" to **ON**
5. Enter the following credentials:
   - **Services ID**: `com.weavelight.app.web` (from Step 1.2)
   - **Team ID**: Your Apple Developer Team ID (found in your account)
   - **Key ID**: The Key ID from Step 1.3
   - **Private Key**: Open the downloaded `.p8` file and paste the entire contents
6. Click **Save**

---

## Supabase Configuration

### Verify Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Ensure these redirect URLs are configured:
   - **Site URL**: `weavelight://` (your app's deep link scheme)
   - **Redirect URLs** (add to allow list):
     ```
     weavelight://
     weavelight://auth/callback
     ```

### Email Templates (Optional)

If using email confirmation, customize email templates:
1. Go to **Authentication** → **Email Templates**
2. Customize:
   - Confirm signup
   - Invite user
   - Magic link
   - Change email address
   - Reset password

---

## Testing OAuth Flow

### Prerequisites for Testing

1. **Physical iOS Device** (recommended for Apple OAuth)
   - Apple OAuth may not work in iOS Simulator
   - Requires actual device with iCloud account

2. **Development Build**
   - Expo Go does **NOT** support OAuth properly
   - Must create development build with `eas build --profile development`

3. **Environment Variables**
   ```bash
   # weave-mobile/.env
   EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```

### Test Google OAuth

1. Start the app: `npx expo start --ios`
2. Navigate to login screen
3. Tap "Sign in with Google"
4. Browser should open with Google login
5. After successful login, browser should redirect to `weavelight://`
6. App should receive the redirect and complete authentication
7. Success toast should appear: "Signed in with Google! 🎉"
8. User should be redirected to home screen (tabs)

**Expected Behavior:**
- Browser opens → Google login → Consent screen (first time) → Redirect back to app → Success

**Logs to Check:**
```
[AUTH] Starting OAuth flow for provider: google
[AUTH] OAuth flow initiated: {...}
[AUTH] Session established: {...}
```

### Test Apple OAuth

1. Start the app: `npx expo start --ios` (on physical device)
2. Navigate to login screen
3. Tap "Sign in with Apple"
4. Apple authentication modal should appear
5. Choose Apple ID or create new
6. After approval, modal should dismiss
7. Success toast should appear: "Signed in with Apple! 🎉"
8. User should be redirected to home screen (tabs)

**Expected Behavior:**
- Modal appears → Apple ID selection → Face ID/Touch ID → Redirect back to app → Success

**Logs to Check:**
```
[AUTH] Starting OAuth flow for provider: apple
[AUTH] OAuth flow initiated: {...}
[AUTH] Session established: {...}
```

---

## Troubleshooting

### Common Issues

#### 1. "Invalid redirect URI" Error

**Problem:** Google/Apple rejects redirect URI

**Solution:**
- Verify redirect URL in Google Cloud Console/Apple Developer matches Supabase exactly
- Format: `https://<project-ref>.supabase.co/auth/v1/callback`
- Check for typos, extra spaces, or http vs https

#### 2. App Not Opening After OAuth

**Problem:** Browser doesn't redirect back to app

**Solution:**
- Verify deep link scheme in `app.json`: `"scheme": "weavelight"`
- Verify AuthContext uses matching scheme: `redirectTo: 'weavelight://'`
- For iOS: Ensure Associated Domains are configured (if using universal links)
- Test deep link manually: Open `weavelight://` in Safari on device

#### 3. "Session Missing" Error

**Problem:** `AuthSessionMissingError` after successful OAuth

**Solution:**
- Already fixed in AuthContext with `{ scope: 'local' }` parameter
- If still occurring, check Supabase client configuration in `lib/supabase.ts`

#### 4. Google OAuth "Access Blocked" Error

**Problem:** Google shows "This app isn't verified"

**Solution:**
- During development: Click "Advanced" → "Go to Weave (unsafe)"
- For production: Submit app for Google verification (OAuth consent screen review)
- Or: Add test users in Google Cloud Console → OAuth consent screen → Test users

#### 5. Apple OAuth Not Working in Simulator

**Problem:** Apple OAuth silently fails in iOS Simulator

**Solution:**
- Must use **physical iOS device** with iCloud account
- Simulator doesn't have Apple ID credentials
- Test on real device or use TestFlight

#### 6. Expo Go Compatibility

**Problem:** OAuth doesn't work in Expo Go

**Solution:**
- Expo Go has limitations with deep linking and OAuth
- Create development build: `eas build --profile development --platform ios`
- Or use local development build: `npx expo run:ios`

### Debug Checklist

When OAuth isn't working, check:

- [ ] Environment variables are correct (Supabase URL and anon key)
- [ ] Deep link scheme matches in app.json and AuthContext
- [ ] Redirect URIs match exactly in provider console and Supabase
- [ ] Using development build (not Expo Go)
- [ ] Bundle ID matches in app.json and provider console
- [ ] OAuth providers are enabled in Supabase dashboard
- [ ] Browser opens and loads OAuth provider login page
- [ ] Network requests succeed (check Supabase logs)
- [ ] App handles deep link redirect (check device logs)

### Useful Commands for Debugging

```bash
# View iOS device logs
xcrun simctl spawn booted log stream --predicate 'subsystem contains "com.weavelight.app"'

# View React Native logs
npx expo start --ios --clear

# Check Supabase auth logs
# Go to Supabase Dashboard → Logs → Auth

# Test deep link manually (iOS)
xcrun simctl openurl booted weavelight://

# Clear app data (iOS Simulator)
xcrun simctl erase all
```

---

## Security Best Practices

### Production Checklist

Before launching to production:

- [ ] Remove development redirect URLs from allow list
- [ ] Configure OAuth consent screen properly (Google)
- [ ] Submit for Google verification (if needed)
- [ ] Enable only necessary OAuth scopes
- [ ] Use environment variables for secrets (never commit)
- [ ] Enable email confirmation (Supabase Auth settings)
- [ ] Configure password policies (min length, complexity)
- [ ] Set up rate limiting for auth endpoints
- [ ] Monitor auth logs for suspicious activity
- [ ] Enable MFA for admin accounts

### Environment Variables

**Never commit these to git:**
```bash
# .env (git ignored)
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # Backend only!

# Google OAuth (backend only)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Apple OAuth (backend only)
APPLE_SERVICES_ID=com.weavelight.app.web
APPLE_TEAM_ID=XXX123
APPLE_KEY_ID=ABC123
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
```

### RLS Policies

Ensure Row Level Security is enabled for user data:
```sql
-- Example: Protect user_profiles table
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id);
```

---

## Additional Resources

### Documentation

- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **Apple Sign In**: https://developer.apple.com/sign-in-with-apple/
- **Expo Linking**: https://docs.expo.dev/guides/linking/
- **Expo Authentication**: https://docs.expo.dev/guides/authentication/

### Support

- **Supabase Discord**: https://discord.supabase.com/
- **Expo Discord**: https://chat.expo.dev/
- **GitHub Issues**: https://github.com/supabase/supabase/issues

---

## Notes

- OAuth implementation is complete in the codebase (Story 0.3)
- Deep link scheme is configured: `weavelight://`
- Success toasts are implemented for all auth flows
- Testing requires physical iOS device for Apple OAuth
- Google OAuth works in simulator and physical devices
- Production deployment requires additional OAuth provider verification
