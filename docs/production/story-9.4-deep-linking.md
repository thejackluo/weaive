# Story 9.4: Deep Linking Setup Guide

**Status:** Configuration required
**Platform:** iOS Universal Links + Android App Links
**Required For:** App Store submission, marketing campaigns, user engagement

---

## Overview

Deep links allow users to open specific screens in the Weave app directly from:
- Email links (journal reminders, account verification)
- Push notification taps
- Web browser links (marketing campaigns, shared content)
- SMS/iMessage links

---

## Implementation Summary

### ✅ Already Configured

1. **Expo Router** - File-based routing handles deep links automatically
2. **app.json** - Associated domains configured:
   ```json
   {
     "ios": {
       "bundleIdentifier": "com.weavelight.app",
       "associatedDomains": ["applinks:weavelight.app"]
     },
     "android": {
       "package": "com.weavelight.app",
       "intentFilters": [
         {
           "action": "VIEW",
           "autoVerify": true,
           "data": [{ "scheme": "weavelight" }]
         }
       ]
     }
   }
   ```

3. **URL Scheme** - `weavelight://` custom scheme registered

### 🔧 Manual Configuration Required

1. **Host AASA file** on `weavelight.app` server
2. **Replace TEAM_ID** in AASA file with Apple Team ID
3. **Verify SSL** - AASA file must be served over HTTPS
4. **Test deep links** on physical device

---

## Step 1: Get Apple Team ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Membership** tab
3. Copy **Team ID** (10-character alphanumeric, e.g., `A1B2C3D4E5`)

---

## Step 2: Update AASA File

Replace `TEAM_ID` in `apple-app-site-association` with your actual Team ID:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "A1B2C3D4E5.com.weavelight.app",
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
    "apps": ["A1B2C3D4E5.com.weavelight.app"]
  }
}
```

---

## Step 3: Host AASA File on weavelight.app

### Option A: Static Hosting (Vercel/Netlify)

1. Create `/public/.well-known/apple-app-site-association` (no file extension)
2. Upload file to server
3. Verify accessible at: `https://weavelight.app/.well-known/apple-app-site-association`

### Option B: Backend Hosting (FastAPI)

Add to `weave-api/app/main.py`:

```python
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/.well-known/apple-app-site-association")
async def apple_app_site_association():
    """Serve Apple App Site Association file for Universal Links"""
    return JSONResponse(
        content={
            "applinks": {
                "apps": [],
                "details": [
                    {
                        "appID": "TEAM_ID.com.weavelight.app",
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
                "apps": ["TEAM_ID.com.weavelight.app"]
            }
        },
        headers={"Content-Type": "application/json"}
    )
```

### Requirements

- ✅ Must be served at `/.well-known/apple-app-site-association`
- ✅ Must be accessible over HTTPS
- ✅ Content-Type: `application/json` or `application/pkcs7-mime`
- ✅ No redirects (direct 200 OK response)
- ✅ File size < 128 KB

---

## Step 4: Verify AASA File

### 4.1 Test URL Accessibility

```bash
# Verify AASA file is accessible
curl -I https://weavelight.app/.well-known/apple-app-site-association

# Expected response:
# HTTP/2 200
# content-type: application/json
```

### 4.2 Validate AASA Format

Use Apple's AASA validator:
- [Apple AASA Validator](https://search.developer.apple.com/appsearch-validation-tool/)
- Enter domain: `weavelight.app`
- Verify validation succeeds

---

## Step 5: Configure Android App Links (Optional)

### 5.1 Create assetlinks.json

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.weavelight.app",
    "sha256_cert_fingerprints": [
      "ANDROID_CERT_FINGERPRINT"
    ]
  }
}]
```

### 5.2 Get Android Certificate Fingerprint

```bash
cd weave-mobile

# Build Android app
eas build --platform android --profile production

# Get certificate fingerprint from EAS
eas credentials
# Select: Android → Keystore → View certificate fingerprint
```

### 5.3 Host assetlinks.json

Upload to: `https://weavelight.app/.well-known/assetlinks.json`

---

## Supported Deep Link Patterns

### Universal Links (iOS)

| Link | Opens |
|------|-------|
| `https://weavelight.app/goals` | Goals screen |
| `https://weavelight.app/goals/[id]` | Specific goal detail |
| `https://weavelight.app/binds/[id]` | Specific bind screen |
| `https://weavelight.app/journal` | Journal screen |
| `https://weavelight.app/ai-chat` | AI chat screen |
| `https://weavelight.app/settings/subscription` | Subscription screen |

### Custom URL Scheme (Fallback)

| Link | Opens |
|------|-------|
| `weavelight://goals` | Goals screen |
| `weavelight://binds/[id]` | Specific bind screen |
| `weavelight://ai-chat` | AI chat screen |

---

## Testing Deep Links

### Test on Physical Device (Simulator doesn't support Universal Links)

1. **Install app via TestFlight or development build**

2. **Send test link via Notes app:**
   - Open Notes app
   - Type: `https://weavelight.app/goals`
   - Tap link → App should open to goals screen

3. **Send test link via Messages:**
   - iMessage yourself: `https://weavelight.app/ai-chat`
   - Tap link → App should open to AI chat screen

4. **Test via Safari:**
   - Open Safari
   - Navigate to: `https://weavelight.app/goals`
   - Tap "Open in App" banner

5. **Test URL scheme:**
   ```bash
   # Use xcrun simctl for simulator (URL scheme only)
   xcrun simctl openurl booted "weavelight://goals"

   # Or use adb for Android
   adb shell am start -W -a android.intent.action.VIEW -d "weavelight://goals"
   ```

---

## Expo Router Deep Link Handling

Expo Router **automatically** handles deep links with file-based routing:

| Route File | Deep Link | Example |
|------------|-----------|---------|
| `app/(tabs)/index.tsx` | `/` | `weavelight.app/` |
| `app/(tabs)/goals/index.tsx` | `/goals` | `weavelight.app/goals` |
| `app/(tabs)/goals/[id].tsx` | `/goals/[id]` | `weavelight.app/goals/123` |
| `app/(tabs)/ai-chat.tsx` | `/ai-chat` | `weavelight.app/ai-chat` |
| `app/(tabs)/settings/subscription.tsx` | `/settings/subscription` | `weavelight.app/settings/subscription` |

**No additional code needed!** Expo Router maps URLs to file paths automatically.

---

## Advanced: Handling Deep Link Parameters

If you need to handle query parameters or custom logic:

```tsx
// app/(tabs)/goals/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function GoalDetailScreen() {
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();

  // URL: weavelight.app/goals/123?source=email
  // id = "123"
  // source = "email"

  return <GoalDetail goalId={id} />;
}
```

---

## Troubleshooting

### Issue: Universal Links not working (opens in browser instead)

**Causes:**
1. AASA file not accessible at `/.well-known/apple-app-site-association`
2. AASA file has wrong Team ID
3. App not installed via TestFlight/App Store (development builds need manual association)
4. SSL certificate invalid

**Fixes:**
1. Verify AASA file accessibility: `curl https://weavelight.app/.well-known/apple-app-site-association`
2. Check Team ID matches Apple Developer Portal
3. Test with TestFlight build
4. Verify SSL certificate valid (not self-signed)

### Issue: Deep links work on first install, then stop working

**Cause:** iOS caches AASA file for 24 hours

**Fix:**
1. Uninstall app
2. Delete app data: Settings → General → iPhone Storage → Weave → Delete App
3. Reinstall app
4. iOS will re-fetch AASA file

### Issue: Android App Links not working

**Cause:** `assetlinks.json` not configured or wrong certificate fingerprint

**Fix:**
1. Verify `assetlinks.json` at `https://weavelight.app/.well-known/assetlinks.json`
2. Check certificate fingerprint matches EAS build

---

## Testing Checklist

Before App Store submission:

- [ ] Apple Team ID replaced in AASA file
- [ ] AASA file hosted at `https://weavelight.app/.well-known/apple-app-site-association`
- [ ] AASA file returns 200 OK (no redirects)
- [ ] AASA file validates in Apple's validator tool
- [ ] Universal Link opens app (test via Notes/Messages)
- [ ] Custom URL scheme works (fallback)
- [ ] Deep link parameters extracted correctly
- [ ] Navigation to correct screen verified
- [ ] Android App Links configured (if supporting Android)

---

## ⚠️ CRITICAL: AASA File Deployment Warning

**Status:** 🔴 **CRITICAL - Deep Linking Will NOT Work Until Fixed**

### Problem

The Apple App Site Association (AASA) file is currently in:
```
_bmad-output/implementation-artifacts/apple-app-site-association
```

This is **WRONG**. Deep linking will fail because Apple can't find the file.

### Required Actions

#### 1. Replace TEAM_ID Placeholder
- Open `apple-app-site-association` file
- Replace `"TEAM_ID"` with your actual Apple Team ID
- Find it at: https://developer.apple.com/account/#!/membership

#### 2. Host at Correct URL

AASA file MUST be accessible at:
```
https://weavelight.app/.well-known/apple-app-site-association
```

**Requirements:**
- ✅ HTTPS only (no HTTP)
- ✅ Valid SSL certificate
- ✅ Content-Type: `application/json` (no .json extension in filename)
- ✅ Publicly accessible (no auth)
- ✅ Returns 200 status code

#### 3. Validate Deployment

Use Apple's AASA Validator:
- URL: https://search.developer.apple.com/appsearch-validation-tool/
- Enter: `weavelight.app`
- Expected: ✅ Valid AASA file found

#### 4. Test Deep Links

From Notes/Messages, test these links:
```
https://weavelight.app/goals
https://weavelight.app/binds/[id]
https://weavelight.app/ai-chat
```

**Expected:** Opens in Weave app, not Safari

**Fallback (if HTTPS fails):**
```
weavelight://goals
```

### Current Impact

❌ **All Universal Links broken**
❌ **AC 6 (Deep Linking) incomplete**
❌ **Production deployment will fail App Review** if deep linking advertised

**Reference:** MEDIUM ISSUE #8 from Story 9.4 code review (2025-12-23)
**Fix in:** Story 9.5 (Production Security & Deployment)

---

## Resources

- [Expo Universal Links Guide](https://docs.expo.dev/guides/linking/)
- [Apple Universal Links Documentation](https://developer.apple.com/ios/universal-links/)
- [Apple AASA Validator](https://search.developer.apple.com/appsearch-validation-tool/)
- [Android App Links Documentation](https://developer.android.com/training/app-links)

---

**Status:** ✅ Code configured, AASA file generated, manual hosting required
