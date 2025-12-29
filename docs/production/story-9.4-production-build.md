# Story 9.4: Production Build Configuration Guide

**Status:** Configured - Manual secrets required
**Platform:** iOS (EAS Build)
**Required For:** TestFlight distribution, App Store submission

---

## Overview

This guide covers production build configuration using **Expo Application Services (EAS Build)**. EAS Build handles:
- Native compilation in the cloud (no Xcode required locally)
- Automatic code signing
- Source map uploads to Sentry
- Environment-specific builds (development, preview, production)

---

## Build Profiles

### Development

```bash
eas build --profile development --platform ios
```

- **Purpose:** Local development with development client
- **Distribution:** Internal (ad-hoc)
- **Simulator:** Enabled
- **Environment:** `APP_ENV=development`

### Preview

```bash
eas build --profile preview --platform ios
```

- **Purpose:** Internal testing, QA, stakeholder review
- **Distribution:** Internal (ad-hoc)
- **Simulator:** Disabled (physical devices only)
- **Channel:** `preview` (for OTA updates)
- **Environment:** `APP_ENV=staging`

### Production

```bash
eas build --profile production --platform ios
```

- **Purpose:** TestFlight distribution, App Store submission
- **Distribution:** App Store
- **Simulator:** Disabled
- **Channel:** `production` (for OTA updates)
- **Environment:** `APP_ENV=production`
- **Auto-increment:** Build number automatically incremented
- **Sentry:** Source maps uploaded automatically

---

## Prerequisites

### 1. EAS CLI Installation

```bash
npm install -g eas-cli

# Login to Expo account
eas login
```

### 2. Configure EAS Project

```bash
cd weave-mobile

# Link to Expo project
eas init

# Project ID should match app.json:
# 958e77af-47be-49ec-a7e6-bbfa14552734
```

### 3. Apple Developer Account Setup

Required information (update `eas.json` submit section):

1. **Apple ID:** Your Apple ID email (e.g., `jack@weavelight.app`)
2. **ASC App ID:** App Store Connect app ID (numeric, e.g., `1234567890`)
3. **Team ID:** Apple Developer Team ID (e.g., `A1B2C3D4E5`)

**How to find:**
- **Apple ID:** Your Apple ID email
- **ASC App ID:** App Store Connect → Apps → Weave → App Information (under General section)
- **Team ID:** Apple Developer Portal → Membership section

---

## Environment Variables & Secrets

### Required Secrets

Add to EAS via CLI:

```bash
# Sentry auth token (for source map upload)
eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value YOUR_SENTRY_TOKEN_HERE --type string

# Apple App-Specific Password (for automatic submission)
eas secret:create --scope project --name EXPO_APPLE_APP_SPECIFIC_PASSWORD --value YOUR_APP_PASSWORD_HERE --type string

# Backend API URL (production)
eas secret:create --scope project --name API_BASE_URL --value https://weave-api-production.railway.app --type string
```

**How to get these:**

1. **SENTRY_AUTH_TOKEN:**
   - Go to [Sentry → Settings → Auth Tokens](https://sentry.io/settings/account/api/auth-tokens/)
   - Create token with `project:releases` scope
   - Copy token

2. **EXPO_APPLE_APP_SPECIFIC_PASSWORD:**
   - Go to [appleid.apple.com](https://appleid.apple.com/)
   - Sign in → Security → App-Specific Passwords
   - Generate password for "Expo Build"
   - Copy password (save it - won't be shown again)

3. **API_BASE_URL:**
   - Production: `https://weave-api-production.railway.app`
   - Staging: `https://weave-api-staging.railway.app` (if exists)

### View Secrets

```bash
# List all secrets
eas secret:list
```

---

## Code Signing

EAS Build handles iOS code signing automatically:

1. **First build:** EAS will prompt to generate certificates and provisioning profiles
2. **Automatic management:** EAS stores certificates securely and reuses them
3. **Manual certificates:** You can also upload existing certificates via `eas credentials`

**Recommended:** Let EAS manage certificates automatically.

---

## Building for Production

### Step 1: Update eas.json Placeholders

Replace placeholders in `eas.json`:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "jack@weavelight.app",
        "ascAppId": "1234567890",
        "appleTeamId": "A1B2C3D4E5"
      }
    }
  }
}
```

### Step 2: Build Production IPA

```bash
cd weave-mobile

# Build for iOS production
eas build --profile production --platform ios

# Wait for build to complete (15-30 minutes)
# Build will be available at: https://expo.dev/accounts/[username]/projects/weave-mobile/builds
```

### Step 3: Download & Test IPA

```bash
# Download IPA locally
eas build:download --id BUILD_ID_HERE

# Or install directly on device
eas build:run --id BUILD_ID_HERE --device
```

### Step 4: Submit to TestFlight

**Option A: Manual Upload**
1. Download IPA from EAS dashboard
2. Open Transporter app (Mac)
3. Drag IPA into Transporter
4. Submit to App Store Connect

**Option B: Automatic Submission (Recommended)**

```bash
# Submit to TestFlight automatically
eas submit --profile production --platform ios --id BUILD_ID_HERE

# Or submit latest build
eas submit --profile production --platform ios --latest
```

### Step 5: App Store Review Submission

1. Open [App Store Connect](https://appstoreconnect.apple.com/)
2. Select Weave app
3. Navigate to **TestFlight** tab
4. Select build → **Submit for Review**
5. Fill in:
   - What's New in This Version
   - Build Information
   - Review Information (test account, etc.)
6. Submit for Review

---

## Versioning Strategy

### Semantic Versioning

Follow semver: `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)

**Update in `app.json`:**

```json
{
  "expo": {
    "version": "1.0.0"
  }
}
```

### Build Number

EAS auto-increments build number (`autoIncrement: true` in eas.json).

**Format:** `version (build)` → e.g., `1.0.0 (42)`

---

## OTA Updates (Over-The-Air)

EAS Update allows pushing JavaScript/asset updates without resubmitting to App Store.

### Publish OTA Update

```bash
# Publish update to production channel
eas update --branch production --message "Fix: Journal screen crash"

# Publish to preview channel
eas update --branch preview --message "Feature: New onboarding flow"
```

### When to Use OTA Updates

✅ **Use for:**
- Bug fixes (JavaScript crashes)
- UI tweaks
- Content updates
- Performance improvements

❌ **Don't use for:**
- Native code changes (requires new build)
- New permissions (requires new build)
- Version updates (requires new build)

---

## Testing Checklist

Before submitting to App Store:

- [ ] Build completes successfully on EAS
- [ ] IPA installs on physical device
- [ ] App launches without crashes
- [ ] Push notifications work (TestFlight)
- [ ] In-App Purchases tested (Sandbox mode)
- [ ] Deep links open correct screens
- [ ] Sentry captures errors (test crash)
- [ ] API calls reach production backend
- [ ] All settings screens accessible
- [ ] Account deletion works (test account)
- [ ] Data export works (test account)

---

## Common Build Errors

### Error: "Provisioning profile doesn't include signing certificate"

**Fix:**
```bash
# Regenerate credentials
eas credentials --platform ios
# Select: "Set up a new iOS provisioning profile"
```

### Error: "Bundle identifier 'com.weavelight.app' is not available"

**Fix:**
- Verify bundle ID in [App Store Connect](https://appstoreconnect.apple.com/)
- Ensure it matches `app.json` and `eas.json`

### Error: "SENTRY_AUTH_TOKEN not set"

**Fix:**
```bash
# Add Sentry token to EAS secrets
eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value YOUR_TOKEN_HERE --type string
```

### Error: "Build failed: CocoaPods install failed"

**Fix:**
```bash
# Clear Expo cache
expo start --clear

# Rebuild
eas build --profile production --platform ios --clear-cache
```

---

## Production Build Commands Reference

```bash
# Build production IPA
eas build --profile production --platform ios

# Submit to TestFlight
eas submit --profile production --platform ios --latest

# Publish OTA update
eas update --branch production --message "Bug fix"

# View build status
eas build:list --platform ios

# Download build
eas build:download --id BUILD_ID_HERE

# View credentials
eas credentials --platform ios

# View secrets
eas secret:list

# View update history
eas update:list --branch production
```

---

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Apple Developer Portal](https://developer.apple.com/account/)

---

**Status:** ✅ EAS Build configured - Update placeholders and add secrets before building
