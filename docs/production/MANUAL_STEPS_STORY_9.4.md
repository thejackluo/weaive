# Story 9.4: Manual Steps for TestFlight Submission

**Status:** 🔴 **Action Required** - 11 manual steps before TestFlight
**Estimated Time:** 5-9 hours total
**Last Updated:** 2025-12-23

---

## Overview

This guide provides a step-by-step checklist for all manual configuration required to submit Weave to TestFlight. The code is complete, but several external configurations require manual setup through Apple Developer Portal, App Store Connect, Expo, and deployment infrastructure.

**Prerequisites:**
- ✅ Code complete (PR #91 merged or ready to merge)
- ✅ All tests passing
- ✅ Linting clean
- 🟡 Apple Developer Account (required - $99/year)
- 🟡 App Store Connect access (same account)
- 🟡 Expo account (free)
- 🟡 Mac with Xcode installed (for certificate generation)

---

## Quick Status Check

Before starting, verify you have:

```bash
# 1. Check branch is up to date
cd /mnt/c/Users/Jack\ Luo/Desktop/\(local\)\ github\ software/weave-prod
git status

# 2. Verify tests pass
cd weave-api
uv run pytest

# 3. Verify linting clean
uv run ruff check .
cd ../weave-mobile
npm run lint

# 4. Verify migration exists
ls -la supabase/migrations/20251223000003_add_subscription_tracking.sql
```

**Expected:** All checks pass, migration file exists.

---

## Step-by-Step Manual Configuration

### Step 1: Apply Database Migration (5 minutes)

**What:** Add subscription tracking columns to user_profiles table.

**Why:** Receipt verification endpoint requires `subscription_expires_at` and `subscription_product_id` columns.

**How:**

```bash
cd /mnt/c/Users/Jack\ Luo/Desktop/\(local\)\ github\ software/weave-prod

# Option A: Using Supabase CLI (recommended)
npx supabase db push

# Option B: Manual via Supabase Dashboard
# 1. Go to https://supabase.com/dashboard
# 2. Select your project → SQL Editor
# 3. Copy contents of: supabase/migrations/20251223000003_add_subscription_tracking.sql
# 4. Paste and run
```

**Verify:**

```bash
# Check columns exist
npx supabase db dump --table user_profiles --schema public
# Should show: subscription_expires_at, subscription_product_id columns
```

**If something goes wrong:**
- Migration already applied: Safe to ignore "already exists" errors
- Connection error: Check SUPABASE_URL and credentials in .env

---

### Step 2: Get Apple Team ID (2 minutes)

**What:** Find your 10-character Apple Developer Team ID.

**Why:** Required for AASA file, eas.json, and App Store submission.

**How:**

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Log in with your Apple ID
3. Navigate to **Membership** tab (top navigation)
4. Copy **Team ID** (format: `A1B2C3D4E5` - 10 alphanumeric characters)

**Save this:** You'll need it in Steps 4 and 7.

**Example:**
```
Team ID: XYZ1234567
Team Name: Your Name
Membership Type: Individual
```

---

### Step 3: Create IAP Products in App Store Connect (15 minutes)

**What:** Configure 3 subscription products for in-app purchases.

**Why:** Users need to purchase subscriptions via Apple IAP system.

**How:**

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **My Apps** → Select **Weave** (or create new app if doesn't exist)
3. Navigate to **Features** tab → **In-App Purchases**
4. Click **+ (Create)** for each product below:

#### Product 1: 10-Day Trial

| Field | Value |
|-------|-------|
| Type | Auto-Renewable Subscription |
| Reference Name | Weave Pro Trial |
| Product ID | `com.weavelight.app.trial.10day` |
| Subscription Group | Weave Pro (create new if needed) |
| Subscription Duration | 10 days |
| Price | Free |
| Localizations (English) | |
| - Display Name | 10-Day Free Trial |
| - Description | Try Weave Pro free for 10 days. No credit card required. |

#### Product 2: Monthly Subscription

| Field | Value |
|-------|-------|
| Type | Auto-Renewable Subscription |
| Reference Name | Weave Pro Monthly |
| Product ID | `com.weavelight.app.pro.monthly` |
| Subscription Group | Weave Pro (same as trial) |
| Subscription Duration | 1 month |
| Price | $9.99 USD |
| Localizations (English) | |
| - Display Name | Weave Pro Monthly |
| - Description | Unlock unlimited AI coaching, advanced insights, and all premium features. |

#### Product 3: Annual Subscription

| Field | Value |
|-------|-------|
| Type | Auto-Renewable Subscription |
| Reference Name | Weave Pro Annual |
| Product ID | `com.weavelight.app.pro.annual` |
| Subscription Group | Weave Pro (same as above) |
| Subscription Duration | 1 year |
| Price | $99.99 USD (17% savings) |
| Localizations (English) | |
| - Display Name | Weave Pro Annual |
| - Description | Best value! Get 2 months free with annual billing. |

5. Click **Save** for each product
6. Products will show **Ready to Submit** status (this is normal)

**Verify:**

Products should appear in App Store Connect with status: **Ready to Submit**.

**If something goes wrong:**
- Product ID conflict: Ensure exact spelling matches above
- Subscription group missing: Create new group named "Weave Pro"
- Price not available: Select "Set Prices" and choose $9.99 / $99.99 in USD

**Get Shared Secret (Required for receipt verification):**

1. In App Store Connect → **My Apps** → **Weave**
2. Navigate to **App Information** (under General section)
3. Scroll to **App-Specific Shared Secret**
4. Click **Generate** if not exists
5. Copy the shared secret (32-character alphanumeric)
6. Save to `.env` files:

```bash
cd /mnt/c/Users/Jack\ Luo/Desktop/\(local\)\ github\ software/weave-prod/weave-api

# Add to .env (local testing)
echo "APPLE_SHARED_SECRET=your_shared_secret_here" >> .env

# Add to .env.production (Railway deployment)
echo "APPLE_SHARED_SECRET=your_shared_secret_here" >> .env.production
```

7. Add to Railway environment variables:

```bash
# Via Railway CLI (if installed)
railway variables set APPLE_SHARED_SECRET=your_shared_secret_here

# Or via Railway Dashboard:
# https://railway.app → Your Project → Variables → New Variable
```

---

### Step 4: Deploy AASA File for Deep Linking (10 minutes)

**What:** Host Apple App Site Association file for Universal Links.

**Why:** Required for deep linking (opening app from web links, emails, messages).

**How:**

#### 4.1 Update AASA File

```bash
cd /mnt/c/Users/Jack\ Luo/Desktop/\(local\)\ github\ software/weave-prod

# Edit the AASA file
# File: _bmad-output/implementation-artifacts/apple-app-site-association
```

Replace **ALL** instances of `TEAM_ID` with your actual Team ID from Step 2:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "XYZ1234567.com.weavelight.app",  // Replace XYZ1234567 with your Team ID
        "paths": [
          "/goals/*",
          "/binds/*",
          "/journal/*",
          "/ai-chat",
          "/settings/*",
          "/subscription"
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": ["XYZ1234567.com.weavelight.app"]  // Replace here too
  }
}
```

#### 4.2 Deploy to Production Server

**Option A: Static Hosting (Vercel/Netlify/Cloudflare Pages)**

1. Create directory structure:
   ```bash
   mkdir -p public/.well-known
   cp _bmad-output/implementation-artifacts/apple-app-site-association public/.well-known/
   ```

2. Deploy `public/` directory to your hosting service
3. File must be accessible at: `https://weavelight.app/.well-known/apple-app-site-association`

**Option B: Backend Hosting (FastAPI - if weavelight.app points to Railway)**

Add to `weave-api/app/main.py`:

```python
from fastapi.responses import JSONResponse

@app.get("/.well-known/apple-app-site-association")
async def apple_app_site_association():
    """Serve AASA file for Universal Links"""
    return JSONResponse(
        content={
            "applinks": {
                "apps": [],
                "details": [
                    {
                        "appID": "XYZ1234567.com.weavelight.app",  # Your Team ID
                        "paths": [
                            "/goals/*",
                            "/binds/*",
                            "/journal/*",
                            "/ai-chat",
                            "/settings/*",
                            "/subscription"
                        ]
                    }
                ]
            },
            "webcredentials": {
                "apps": ["XYZ1234567.com.weavelight.app"]
            }
        },
        headers={"Content-Type": "application/json"}
    )
```

Deploy to Railway:
```bash
git add weave-api/app/main.py
git commit -m "feat(backend): add AASA endpoint for Universal Links"
git push origin main
```

#### 4.3 Verify Deployment

```bash
# Test URL accessibility
curl -I https://weavelight.app/.well-known/apple-app-site-association

# Expected response:
# HTTP/2 200
# content-type: application/json
```

```bash
# Verify content
curl https://weavelight.app/.well-known/apple-app-site-association
# Should return JSON with your Team ID
```

#### 4.4 Validate with Apple's Tool

1. Go to [Apple AASA Validator](https://search.developer.apple.com/appsearch-validation-tool/)
2. Enter domain: `weavelight.app`
3. Click **Validate**
4. Expected: ✅ **Valid AASA file found**

**If validation fails:**
- Check URL returns 200 (not 301 redirect)
- Verify Content-Type is `application/json`
- Ensure no authentication required
- Check Team ID matches Step 2

---

### Step 5: Generate APNs Production Certificate (15 minutes)

**What:** Create and upload Apple Push Notification certificate.

**Why:** Required for sending push notifications to users.

**Prerequisites:** Mac with Xcode installed and Keychain Access.

**How:**

#### 5.1 Create Certificate Signing Request (CSR)

1. Open **Keychain Access** (Applications → Utilities)
2. Menu: **Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority**
3. Fill in form:
   - **User Email Address:** Your Apple ID email
   - **Common Name:** `Weave APNs Production`
   - **CA Email Address:** Leave blank
   - **Request is:** Select **"Saved to disk"**
4. Click **Continue**
5. Save as: `WeaveAPNs.certSigningRequest`

#### 5.2 Create APNs Certificate in Developer Portal

1. Go to [Apple Developer Portal → Certificates](https://developer.apple.com/account/resources/certificates/list)
2. Click **+ (Create a New Certificate)**
3. Select **Apple Push Notification service SSL (Sandbox & Production)**
4. Click **Continue**
5. Select App ID: `com.weavelight.app`
   - If not exists, create it first in Identifiers section
6. Click **Continue**
7. Upload `WeaveAPNs.certSigningRequest` from Step 5.1
8. Click **Continue**
9. Download certificate: `aps_production.cer`

#### 5.3 Convert Certificate to .p12 Format

1. Double-click `aps_production.cer` to install in Keychain
2. Open **Keychain Access** → **My Certificates**
3. Find certificate: `Apple Push Services: com.weavelight.app`
4. Right-click → **Export "Apple Push Services..."**
5. File format: **Personal Information Exchange (.p12)**
6. Save as: `weave-apns-production.p12`
7. Set password: (Choose strong password, save in 1Password/LastPass)
   - Example: `APNs-Prod-2025-Weave-$ecure123`
8. Click **Save**
9. Enter your Mac password to allow export

#### 5.4 Upload Certificate to Expo

```bash
cd /mnt/c/Users/Jack\ Luo/Desktop/\(local\)\ github\ software/weave-prod/weave-mobile

# Login to Expo
npx expo login

# Open credentials manager
npx expo credentials:manager

# Interactive menu:
# 1. Select "iOS: com.weavelight.app"
# 2. Select "Push Notifications"
# 3. Select "Upload new Push Notification Key"
# 4. Provide path to .p12 file: /path/to/weave-apns-production.p12
# 5. Enter password from Step 5.3
```

**Verify:**

```bash
npx expo credentials:manager
# Should show: "Push Notification Key: Uploaded"
```

**If something goes wrong:**
- Certificate not found in Keychain: Re-download from Developer Portal
- Export fails: Ensure you have private key matching certificate
- Password incorrect: Re-export .p12 with new password
- Expo upload fails: Verify .p12 file is not corrupted (< 10KB is suspicious)

---

### Step 6: Create EAS Build Secrets (5 minutes)

**What:** Add sensitive environment variables to Expo Application Services.

**Why:** Required for Sentry source maps, automatic TestFlight submission, and API communication.

**How:**

```bash
cd /mnt/c/Users/Jack\ Luo/Desktop/\(local\)\ github\ software/weave-prod/weave-mobile

# 1. Sentry Auth Token (for source map upload)
eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value YOUR_SENTRY_TOKEN --type string

# 2. Apple App-Specific Password (for auto-submission)
eas secret:create --scope project --name EXPO_APPLE_APP_SPECIFIC_PASSWORD --value YOUR_APP_PASSWORD --type string

# 3. Backend API URL (production)
eas secret:create --scope project --name API_BASE_URL --value https://weave-api-production.railway.app --type string
```

#### How to Get These Values:

**SENTRY_AUTH_TOKEN:**

1. Go to [Sentry → Settings → Auth Tokens](https://sentry.io/settings/account/api/auth-tokens/)
2. Click **Create New Token**
3. Name: `EAS Build - Weave Mobile`
4. Scopes: Select **`project:releases`** (required for source map upload)
5. Click **Create Token**
6. Copy token (starts with `sntrys_...`)
7. Save securely (won't be shown again)

**EXPO_APPLE_APP_SPECIFIC_PASSWORD:**

1. Go to [appleid.apple.com](https://appleid.apple.com/)
2. Sign in with Apple ID
3. Security section → **App-Specific Passwords**
4. Click **+ (Generate)**
5. Label: `Expo Build - Weave`
6. Copy password (format: `xxxx-xxxx-xxxx-xxxx`)
7. Save securely (won't be shown again)

**API_BASE_URL:**

Use production Railway URL:
```
https://weave-api-production.railway.app
```

#### Verify Secrets

```bash
# List all secrets
eas secret:list

# Expected output:
# SENTRY_AUTH_TOKEN: ********
# EXPO_APPLE_APP_SPECIFIC_PASSWORD: ********
# API_BASE_URL: https://weave-api-production.railway.app
```

**If something goes wrong:**
- Secret already exists: Delete first with `eas secret:delete --name SECRET_NAME`
- Permission denied: Ensure you're logged in with `eas login`
- Wrong project: Verify project ID in app.json matches Expo dashboard

---

### Step 7: Update eas.json with Apple IDs (2 minutes)

**What:** Configure Apple Developer credentials for automatic submission.

**Why:** Allows `eas submit` to upload builds to TestFlight automatically.

**How:**

```bash
cd /mnt/c/Users/Jack\ Luo/Desktop/\(local\)\ github\ software/weave-prod/weave-mobile
```

Edit `eas.json` → Find `submit.production.ios` section:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID_EMAIL@example.com",    // Step 7.1
        "ascAppId": "1234567890",                         // Step 7.2
        "appleTeamId": "XYZ1234567"                       // Step 2 (Team ID)
      }
    }
  }
}
```

#### 7.1 Get Apple ID

Your Apple ID email (same as Developer Portal login).

**Example:** `jack@weavelight.app`

#### 7.2 Get App Store Connect App ID (ASC App ID)

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **My Apps** → **Weave**
3. Click **App Information** (left sidebar under General)
4. Find **Apple ID** (numeric, under General Information section)
   - Format: 10-digit number like `1234567890`
   - NOT the same as Bundle ID

**Example:**
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "jack@weavelight.app",
        "ascAppId": "6738291045",
        "appleTeamId": "XYZ1234567"
      }
    }
  }
}
```

#### Commit Changes

```bash
git add eas.json
git commit -m "chore(mobile): configure EAS submission with Apple IDs"
git push origin prod/9.4
```

---

### Step 8: Design App Icon (2-4 hours)

**What:** Create production-ready app icon (1024x1024 px).

**Why:** Required for App Store submission (Apple will reject without icon).

**Requirements:**

- **Size:** 1024x1024 px PNG
- **Format:** PNG (no transparency, no alpha channel)
- **Content:** No text in icon (text goes in app name)
- **Design:** Logo representing "weaving" concept
  - Interlocking threads forming "W"
  - Abstract weave pattern
  - Minimalist, recognizable at small sizes
- **Colors:** Primary blue (#3B82F6) with gradients

**Design Options:**

#### Option A: Use Automated Tool (30 minutes)

1. Go to [icon.kitchen](https://icon.kitchen/)
2. Upload a simple logo/shape
3. Generate icon set
4. Download and extract

#### Option B: Hire Designer (2-4 hours + $50-200)

1. Create brief: "App icon for productivity app, interlocking threads, blue gradient"
2. Post on Fiverr or 99designs
3. Provide brand colors: #3B82F6 (primary blue)
4. Review mockups, select favorite

#### Option C: Design in Figma/Canva (2-4 hours)

1. Create 1024x1024 canvas
2. Design icon with weave pattern
3. Export as PNG (no transparency)

**After Icon is Ready:**

```bash
cd /mnt/c/Users/Jack\ Luo/Desktop/\(local\)\ github\ software/weave-prod/weave-mobile

# 1. Replace placeholder icon
cp /path/to/your/icon.png assets/icon.png

# 2. Regenerate native icons
npx expo prebuild --clean

# 3. Commit
git add assets/icon.png ios/ android/
git commit -m "feat(mobile): add production app icon"
git push origin prod/9.4
```

**Verify:**

Check `ios/weave-mobile/Images.xcassets/AppIcon.appiconset/` contains multiple icon sizes.

---

### Step 9: Generate App Store Screenshots (1-2 hours)

**What:** Create 6 screenshots showcasing key features.

**Why:** Required for App Store listing.

**Requirements:**

- **6.7" iPhone (Pro Max):** 1290 x 2796 px (6 screenshots)
- **5.5" iPhone:** 1242 x 2208 px (6 screenshots)
- **Total:** 12 screenshots

**Screenshot Ideas:**

1. **Welcome Screen** - Show onboarding hook
2. **Goal Creation** - Goal breakdown interface
3. **Daily Binds** - Today's task list (Thread page)
4. **Progress Dashboard** - Consistency heatmap, Weave character
5. **AI Chat** - Dream Self conversation
6. **Journal Reflection** - Daily check-in screen

**Tools:**

#### Option A: Automated Screenshot Generation (30 minutes)

1. [Shotbot](https://shotbot.io/) - $49/month
2. [AppLaunchpad](https://www.applaunchpad.com/) - $29 one-time
3. [Previewed](https://previewed.app/) - Free with watermark

Upload app screenshots → Choose device frames → Download

#### Option B: Manual Screenshots (1-2 hours)

1. Build preview on physical device:
   ```bash
   eas build --profile preview --platform ios
   eas build:run --id BUILD_ID --device
   ```

2. Take screenshots:
   - iPhone: Press **Volume Up + Power** button
   - Screenshots saved to Photos app

3. Transfer to Mac via AirDrop

4. Resize if needed:
   ```bash
   # Using ImageMagick
   magick convert screenshot.png -resize 1290x2796 screenshot_resized.png
   ```

**After Screenshots Ready:**

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Navigate to **My Apps** → **Weave** → **1.0 Prepare for Submission**
3. Scroll to **App Preview and Screenshots**
4. Upload screenshots for each device size
5. Click **Save**

---

### Step 10: Build Production IPA (30 minutes)

**What:** Compile production-ready iOS app binary.

**Why:** Required for TestFlight distribution.

**Prerequisites:** Steps 1-9 complete.

**How:**

```bash
cd /mnt/c/Users/Jack\ Luo/Desktop/\(local\)\ github\ software/weave-prod/weave-mobile

# Build for App Store
eas build --profile production --platform ios

# Expected output:
# ✔ Build completed!
# https://expo.dev/accounts/[username]/projects/weave-mobile/builds/[build-id]
```

**This will:**
- Compile React Native code to native iOS binary
- Sign with Apple Developer certificates (automatic)
- Upload source maps to Sentry (automatic)
- Auto-increment build number
- Return build URL

**Monitor Progress:**

1. Build will take ~20-30 minutes
2. Watch terminal for progress updates
3. Or view in Expo Dashboard: [expo.dev/builds](https://expo.dev/accounts/[username]/projects/weave-mobile/builds)

**Build will fail if:**
- ❌ Apple certificates missing (EAS will prompt to generate)
- ❌ Bundle ID mismatch (verify `com.weavelight.app` in app.json)
- ❌ EAS secrets missing (verify Step 6)
- ❌ Code signing issues (let EAS manage automatically)

**When build completes:**

```bash
# Save build ID from output (or Expo Dashboard)
export BUILD_ID="abc123-def456-ghi789"

# Optional: Download IPA locally
eas build:download --id $BUILD_ID
```

---

### Step 11: Submit to TestFlight (5 minutes)

**What:** Upload production build to TestFlight for testing.

**Why:** Final step before App Store review.

**Prerequisites:** Step 10 complete (production build finished).

**How:**

```bash
cd /mnt/c/Users/Jack\ Luo/Desktop/\(local\)\ github\ software/weave-prod/weave-mobile

# Submit latest build to TestFlight
eas submit --platform ios --latest

# Or submit specific build ID
eas submit --platform ios --id BUILD_ID_HERE
```

**This will:**
- Upload IPA to App Store Connect
- Submit to Apple for processing (~5-30 minutes)
- Make available in TestFlight when processing completes

**Expected output:**
```
✔ Submitting to Apple App Store
✔ Successfully submitted to App Store!
```

**Monitor Processing:**

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Navigate to **TestFlight** tab
3. Build will show **Processing** status
4. After ~5-30 minutes, status changes to **Testing**
5. Build is now available for TestFlight testers

**TestFlight Distribution:**

1. In App Store Connect → **TestFlight** → **Internal Testing**
2. Add testers (up to 100 for internal testing)
3. Testers receive email with TestFlight link
4. Install TestFlight app → Accept invite → Install Weave

**If submission fails:**
- ❌ Apple ID incorrect: Verify Step 7 (eas.json)
- ❌ App-Specific Password wrong: Regenerate in Step 6
- ❌ Missing required metadata: Fill in App Store Connect app listing
- ❌ Privacy policy missing: Add URL in App Store Connect

---

## Post-Submission Testing Checklist

Once build is available in TestFlight:

### Critical Path Testing (30 minutes)

```
[ ] Install app from TestFlight
[ ] Complete onboarding flow
[ ] Create first goal
[ ] Complete a bind with photo proof
[ ] Submit journal reflection
[ ] Test AI chat (Dream Self)
[ ] Test subscription screen (don't purchase yet)
[ ] Test deep link: https://weavelight.app/goals
[ ] Test push notification (send from backend)
[ ] Export account data (verify placeholder URL)
[ ] Delete test account (verify prompt works)
```

### IAP Testing (Sandbox Mode)

```
[ ] Log in with Sandbox Tester account (App Store Connect → Users and Access → Sandbox Testers)
[ ] Navigate to Subscription screen
[ ] Purchase trial (should succeed without charge)
[ ] Verify backend receives receipt verification
[ ] Verify user_profiles.subscription_tier updated to 'pro'
[ ] Test restore purchases
[ ] Test subscription status endpoint
```

### Deep Linking Testing

```
[ ] Create note with link: https://weavelight.app/goals
[ ] Tap link → Should open app (not Safari)
[ ] Send iMessage with link → Tap → Opens app
[ ] Test custom URL scheme: weavelight://ai-chat
[ ] Verify navigation to correct screen
```

### Push Notification Testing

```
[ ] Grant notification permission in app
[ ] Send test notification from backend
[ ] Verify notification appears on lock screen
[ ] Tap notification → Opens app
[ ] Verify navigation to correct screen (if deep link included)
```

---

## Troubleshooting

### Build Fails with Code Signing Error

**Error:** `Code signing failed`

**Solution:**
```bash
# Let EAS manage certificates automatically
eas credentials

# Select: "Set up a new Apple distribution certificate"
# EAS will generate and manage certificates
```

### TestFlight Submission Rejected

**Error:** `Missing Compliance` or `Missing Privacy Policy`

**Solution:**
1. Go to App Store Connect → **App Information**
2. Add **Privacy Policy URL**: `https://weavelight.app/privacy`
3. Add **Terms of Use URL**: `https://weavelight.app/terms` (optional)
4. Fill in **Export Compliance** section (select "No" if app doesn't use encryption)

### Deep Links Not Working

**Error:** Links open in Safari instead of app

**Solution:**
1. Verify AASA file accessible: `curl https://weavelight.app/.well-known/apple-app-site-association`
2. Validate with [Apple's tool](https://search.developer.apple.com/appsearch-validation-tool/)
3. Uninstall app → Delete app data → Reinstall (iOS caches AASA for 24 hours)
4. Test with physical device (simulators don't support Universal Links)

### Push Notifications Not Received

**Error:** Notifications not appearing on device

**Solution:**
1. Verify APNs certificate uploaded (Step 5.4)
2. Check device has notification permission granted
3. Verify push token saved in backend (`/api/user/push-token`)
4. Test with [Expo Push Notification Tool](https://expo.dev/notifications)

### IAP Products Not Loading

**Error:** `Product IDs not found` in subscription screen

**Solution:**
1. Verify products created in App Store Connect (Step 3)
2. Wait 2-4 hours after creating products (Apple propagation delay)
3. Check product IDs match exactly:
   - `com.weavelight.app.trial.10day`
   - `com.weavelight.app.pro.monthly`
   - `com.weavelight.app.pro.annual`
4. Products must be in **Ready to Submit** status

---

## Summary

**Total Time:** 5-9 hours

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Apply database migration | 5 min | ⬜ |
| 2 | Get Apple Team ID | 2 min | ⬜ |
| 3 | Create IAP products | 15 min | ⬜ |
| 4 | Deploy AASA file | 10 min | ⬜ |
| 5 | Generate APNs certificate | 15 min | ⬜ |
| 6 | Create EAS secrets | 5 min | ⬜ |
| 7 | Update eas.json | 2 min | ⬜ |
| 8 | Design app icon | 2-4 hrs | ⬜ |
| 9 | Generate screenshots | 1-2 hrs | ⬜ |
| 10 | Build production IPA | 30 min | ⬜ |
| 11 | Submit to TestFlight | 5 min | ⬜ |

**Print this checklist and check off as you complete each step.**

---

## Next Steps After TestFlight

Once TestFlight testing is complete:

1. **Internal Testing** (1-2 weeks)
   - Fix critical bugs
   - Iterate on UX issues
   - Verify IAP works end-to-end

2. **External Beta** (optional, 2-4 weeks)
   - Invite 10-100 external testers
   - Gather feedback
   - Monitor Sentry for crashes

3. **App Store Submission**
   - Fill in all App Store Connect metadata
   - Add app description, keywords, category
   - Submit for App Review
   - Expected review time: 24-48 hours

4. **Story 9.5: Production Security & Monitoring**
   - Implement real data export (Supabase Storage)
   - Implement auth user deletion (Admin API)
   - Add PostHog analytics
   - Setup monitoring dashboards

---

**Guide Created:** 2025-12-23
**Story Branch:** `prod/9.4`
**Reference:** CODE_REVIEW_FIXES_STORY_9.4.md, story-9.4-implementation-summary.md
