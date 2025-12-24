# Story 9.4: APNs Certificate Setup Guide

**Status:** Manual configuration required
**Platform:** iOS (Apple Push Notification service)
**Required For:** App Store submission, TestFlight distribution

---

## Overview

Push notifications require **APNs (Apple Push Notification service)** certificates. This guide walks through generating certificates and configuring Expo for production push notifications.

---

## Prerequisites

- ✅ Apple Developer Account (Team ID: Required)
- ✅ App registered in App Store Connect (`com.weavelight.app`)
- ✅ Xcode installed (for certificate generation)
- ✅ Expo account with project ID: `958e77af-47be-49ec-a7e6-bbfa14552734`

---

## Step 1: Generate APNs Certificate (Apple Developer Portal)

### 1.1 Create Certificate Signing Request (CSR)

1. Open **Keychain Access** (Mac)
2. Menu: **Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority**
3. Fill in:
   - **User Email Address:** Your Apple ID email
   - **Common Name:** `Weave APNs Production`
   - **CA Email Address:** Leave blank
   - **Request:** Select "Saved to disk"
4. Click **Continue** and save `CertificateSigningRequest.certSigningRequest`

### 1.2 Create APNs Certificate

1. Go to [Apple Developer Portal → Certificates](https://developer.apple.com/account/resources/certificates/list)
2. Click **+ (Create a New Certificate)**
3. Select **Apple Push Notification service SSL (Production)**
4. Click **Continue**
5. Select App ID: `com.weavelight.app`
6. Click **Continue**
7. Upload the CSR file from Step 1.1
8. Click **Continue**
9. Download certificate: `aps_production.cer`

### 1.3 Convert Certificate to .p12 Format

1. Double-click `aps_production.cer` to install in Keychain
2. Open **Keychain Access** → **My Certificates**
3. Find certificate: `Apple Push Services: com.weavelight.app`
4. Right-click → **Export "Apple Push Services..."**
5. Save as: `weave-apns-production.p12`
6. Set password: **(Store securely in 1Password/LastPass)**
7. Click **Save**

---

## Step 2: Upload Certificate to Expo

### Option A: Using Expo CLI (Recommended)

```bash
cd weave-mobile

# Login to Expo
npx expo login

# Upload APNs certificate
npx expo credentials:manager

# Select:
# 1. "iOS: com.weavelight.app" → "Push Notifications"
# 2. "Upload new Push Notification Key"
# 3. Provide path to .p12 file and password
```

### Option B: Using Expo Dashboard (Alternative)

1. Go to [Expo Dashboard](https://expo.dev/accounts/[your-username]/projects/weave-mobile)
2. Navigate to **Credentials** tab
3. Select **iOS** → **Push Notifications**
4. Click **Upload new Push Notification Key**
5. Upload `weave-apns-production.p12` and enter password

---

## Step 3: Enable Push Notifications in Xcode (After First Build)

After running `npx expo prebuild` or `eas build`:

1. Open `weave-mobile/ios/weave-mobile.xcworkspace` in Xcode
2. Select project **weave-mobile** (blue icon)
3. Select target **weave-mobile** (white icon)
4. Go to **Signing & Capabilities** tab
5. Click **+ Capability**
6. Add **Push Notifications**
7. Verify **Background Modes** includes **Remote notifications**

---

## Step 4: Verify Configuration

### 4.1 Check app.json Configuration

Verify `weave-mobile/app.json` contains:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.weavelight.app",
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      },
      "usesAppleSignIn": true
    },
    "plugins": [
      ["expo-notifications", {
        "icon": "./assets/notification-icon.png",
        "color": "#3B82F6",
        "mode": "production"
      }]
    ]
  }
}
```

### 4.2 Test Push Notifications

**Sandbox Mode (Development):**
```bash
# Set environment variable for development
export EXPO_PUSH_MODE=development

# Run on physical device (push notifications don't work on simulators)
npx expo run:ios --device
```

**Production Mode (TestFlight/App Store):**
- Push notifications will work automatically after uploading to TestFlight
- Use Expo Push Notification Tool: https://expo.dev/notifications

---

## Step 5: Backend Configuration (Optional - Scheduled Notifications)

If implementing scheduled daily reflection notifications (Story 6.1):

### 5.1 Install Expo Server SDK (Backend)

```bash
cd weave-api

# Install Expo push notification library
uv add exponent-server-sdk
```

### 5.2 Send Push Notifications from Backend

```python
from exponent_server_sdk import (
    DeviceNotRegisteredError,
    PushClient,
    PushMessage,
    PushServerError,
)

def send_push_notification(expo_push_token: str, title: str, body: str):
    """Send push notification via Expo"""
    try:
        response = PushClient().publish(
            PushMessage(
                to=expo_push_token,
                title=title,
                body=body,
                data={"type": "checkin", "screen": "ai-chat"},
                sound="default",
                priority="high",
            )
        )
        print(f"✅ Push notification sent: {response}")
    except PushServerError as e:
        print(f"❌ Push server error: {e}")
    except DeviceNotRegisteredError:
        print("❌ Device token no longer registered")
```

---

## Troubleshooting

### Issue: "Push notifications not available on this device"
- **Cause:** Running on iOS Simulator
- **Fix:** Test on physical device

### Issue: "Invalid push token format"
- **Cause:** Token doesn't start with `ExponentPushToken[`
- **Fix:** Verify `registerForPushNotificationsAsync()` returns correct format

### Issue: "APNs certificate expired"
- **Cause:** Production certificates expire after 1 year
- **Fix:** Regenerate certificate following Step 1 and re-upload to Expo

### Issue: "Notifications not appearing in production"
- **Cause:** Wrong certificate mode (development vs production)
- **Fix:** Verify `app.json` has `"mode": "production"` in expo-notifications plugin

---

## Testing Checklist

Before App Store submission:

- [ ] APNs production certificate uploaded to Expo
- [ ] `app.json` configured with push notification settings
- [ ] Push notification permission requested on app launch
- [ ] Device token saved to backend (`/api/user/push-token`)
- [ ] Test notification received on physical device
- [ ] Notification tap navigation works (opens ai-chat screen)
- [ ] Background notifications work when app is closed
- [ ] Notification icon appears in notification center

---

## Resources

- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [Apple Developer Portal - Certificates](https://developer.apple.com/account/resources/certificates/list)
- [Expo Push Notification Tool](https://expo.dev/notifications)
- [APNs Provider API Reference](https://developer.apple.com/documentation/usernotifications)

---

## Integration in App

To integrate push notifications in your app:

```tsx
// app/_layout.tsx or app/(tabs)/_layout.tsx
import { useNotifications } from '@/hooks/useNotifications';

export default function RootLayout() {
  const { isReady, error, pushToken } = useNotifications();

  if (error) {
    console.log('⚠️ Push notifications disabled:', error);
  }

  return <YourLayout />;
}
```

**Note:** The `useNotifications()` hook automatically handles:
1. Permission request
2. Token registration
3. Backend saving
4. Notification listeners

---

**Status:** ✅ Code implementation complete, manual APNs certificate upload required
