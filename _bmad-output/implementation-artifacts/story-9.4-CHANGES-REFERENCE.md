# Story 9.4: What Actually Changed - Quick Reference

**Purpose:** Clear reference guide separating what already existed vs. what's new in Story 9.4

**Status:** 10/13 ACs complete (3 pending: icons, screenshots, PostHog)

---

## 🔵 What Already Existed (NOT Changed in Story 9.4)

### From Story 6.1 (AI Chat & Push Notifications)
**Files:** These files were created in Story 6.1 and are **NOT modified** in Story 9.4:

1. **`weave-mobile/src/services/notificationService.ts`** ✅ Already exists
   - Functions: `registerForPushNotificationsAsync()`, `savePushTokenToBackend()`, `setupNotificationListeners()`
   - **Story 9.4 does NOT modify this file**
   - New: Created `useNotifications.ts` hook as a **wrapper** around this service

2. **Backend endpoint:** `POST /api/user/push-token` ✅ Already exists
   - Location: `weave-api/app/api/user.py:207-299`
   - **Story 9.4 does NOT modify this endpoint**

3. **`expo-notifications` package** ✅ Already installed
   - **Story 9.4 does NOT reinstall this**

### From Story 0.3 (Authentication)
4. **Deep linking config in `app.json`** ✅ Already exists
   - `associatedDomains` already configured
   - **Story 9.4 does NOT modify deep linking config**
   - Only adds push notification config to same file

5. **JWT authentication middleware** ✅ Already exists
   - `get_current_user()` dependency
   - **Story 9.4 uses this (does NOT modify it)**

### From Story 9.1 (Code Review)
6. **Railway deployment fix** ✅ Already exists
   - `uv run` prefix in `railway.json`, `nixpacks.toml`, `Procfile`
   - **Story 9.4 verifies this (does NOT modify it)**

### From Previous Work
7. **Sentry SDK** ✅ Already installed
   - `@sentry/react-native@7.8.0`
   - **Story 9.4 verifies this (does NOT add or modify)**

8. **Sentry initialized** ✅ Already exists
   - Location: `app/_layout.tsx`
   - **Story 9.4 does NOT modify initialization**

---

## 🟢 What's Completely NEW in Story 9.4

### Backend - New Files (4 files)

#### 1. `weave-api/app/config/subscription_config.py` (NEW - 82 lines)
**What it is:** Centralized subscription configuration module

**What it does:**
- Defines 3 product IDs: `com.weavelight.app.pro.monthly`, `.annual`, `.trial.10day`
- Sets tier limits: free=500, pro=5000, admin=unlimited AI messages/month
- Provides Apple receipt verification URLs (sandbox vs production)
- Validates product IDs
- Environment-aware configuration

**Why it's needed:** Follows Story 6.1 config pattern, provides single source of truth for subscription settings

---

#### 2. `weave-api/app/api/subscription_router.py` (NEW - 178 lines)
**What it is:** Apple IAP receipt verification and subscription status endpoints

**Key Endpoints:**
- `POST /api/subscription/verify-receipt` - Verify Apple receipt, update user tier
- `GET /api/subscription/status` - Get user's subscription status

**What it does:**
1. Mobile app purchases subscription from Apple → gets receipt
2. Mobile calls `/verify-receipt` with receipt + product_id
3. Backend verifies receipt with Apple's API
4. Backend updates `user_profiles.subscription_tier` from 'free' to 'pro'
5. TieredRateLimiter automatically increases limit (500 → 5000 messages/month)

**Why it's needed:** Core IAP flow - bridges Apple purchases with backend subscription state

---

#### 3. `weave-api/app/api/account_router.py` (NEW - 200 lines)
**What it is:** GDPR-compliant account management APIs

**Key Endpoints:**
- `GET /api/account/export-data` - Export all user data (GDPR Article 20: Data Portability)
- `POST /api/account/delete-account` - Delete account (GDPR Article 17: Right to Erasure)

**What it does:**
- **Export:** Returns JSON with goals, completions, journal entries, identity docs, captures, aggregates
- **Delete:** Cascading deletion across 11 tables, requires "DELETE" confirmation (irreversible)

**Why it's needed:** App Store requires GDPR compliance for EU users

---

#### 4. `weave-api/tests/test_subscription_api.py` (NEW - 285 lines)
**What it is:** Unit tests for subscription system

**Test Coverage:**
- Config validation (product IDs, tier limits)
- Receipt verification logic (success, invalid receipt, timeout)
- Subscription status endpoint (free tier, pro tier)
- Integration flow documentation

**Why it's needed:** Ensures subscription system works before production deployment

---

### Frontend - New Files (5 files)

#### 1. `weave-mobile/src/services/iap.ts` (NEW - 192 lines)
**What it is:** Apple IAP integration service using `expo-in-app-purchases`

**Key Functions:**
- `initializeIAP()` - Connect to Apple IAP store
- `fetchProducts()` - Get product pricing from Apple
- `purchaseProduct(productId)` - Trigger Apple purchase flow
- `restorePurchases()` - Restore previous purchases

**Product IDs:** MONTHLY, ANNUAL, TRIAL

**Why it's needed:** Direct interface to Apple's In-App Purchase system

---

#### 2. `weave-mobile/src/hooks/usePurchase.ts` (NEW - 225 lines)
**What it is:** TanStack Query hooks for IAP with cache management

**Key Hooks:**
- `useSubscriptionProducts()` - Query available products from Apple
- `useSubscriptionStatus()` - Query user's current tier from backend
- `usePurchaseSubscription()` - Mutation for purchase flow
- `useRestorePurchases()` - Mutation for restore flow

**Smart Features:**
- Auto-invalidates subscription status after purchase
- Cache management
- Error handling

**Why it's needed:** React-friendly API for subscription operations with automatic state management

---

#### 3. `weave-mobile/src/hooks/useNotifications.ts` (NEW - 93 lines)
**What it is:** Simplified notification setup hook

**Important:** This is a **wrapper** around the existing `notificationService.ts` from Story 6.1

**What it does:**
1. Auto-requests permissions on mount
2. Registers device with Expo
3. Saves token to backend
4. Sets up notification listeners
5. Returns `{ isReady, error, pushToken }`

**Why it's needed:** One-line integration for app startup - easier than calling service functions manually

**Before Story 9.4:**
```typescript
// App had to manually call multiple functions
await registerForPushNotificationsAsync();
await savePushTokenToBackend(token);
setupNotificationListeners();
```

**After Story 9.4:**
```typescript
// One-line integration
useNotifications(); // Done! Handles everything
```

---

#### 4. `weave-mobile/app/(tabs)/settings/account.tsx` (NEW - 274 lines)
**What it is:** GDPR account management screen

**Features:**
- Export data button (downloads JSON)
- Delete account button (double confirmation required)
- GDPR compliance notice explaining rights

**Navigation:** Settings → Account Management

**Why it's needed:** App Store requires visible account management for GDPR compliance

---

#### 5. `weave-mobile/ios/PrivacyInfo.xcprivacy` (NEW - 252 lines)
**What it is:** Apple Privacy Manifest (iOS 17+ requirement)

**Declares:**
- Data types collected: Email, Photos, Audio, User Content (goals/journal), User ID, Device ID, Usage Data, Crash Data
- Purpose of collection: App Functionality
- Cross-app tracking: No
- Third-party SDKs: Sentry, Supabase, Expo, PostHog

**Important:** This file is in gitignored `ios/` directory - needs `git add -f` to force add

**Why it's needed:** Required for iOS 17+ App Store submission

---

### Database - New Migration (1 file)

#### `_bmad-output/implementation-artifacts/story-9.4-subscription-migration.sql` (NEW - 33 lines)
**What it does:**
```sql
ALTER TABLE user_profiles
ADD COLUMN subscription_expires_at TIMESTAMPTZ,
ADD COLUMN subscription_product_id TEXT;

CREATE INDEX ON user_profiles(subscription_expires_at)
WHERE subscription_tier = 'pro';
```

**Why it's needed:** Stores subscription expiry date and product ID for receipt verification

**Manual step required:** Apply this migration in Supabase Dashboard (not auto-applied)

---

### Documentation - New Guides (8 files)

1. **`story-9.4-IMPLEMENTATION-SUMMARY.md`** (NEW - 478 lines) - Executive summary with all AC details
2. **`story-9.4-apns-setup-guide.md`** (NEW - 300 lines) - APNs certificate generation and upload to Expo
3. **`story-9.4-deep-linking-guide.md`** (NEW - 350 lines) - Universal Links setup with AASA file hosting
4. **`story-9.4-production-build-guide.md`** (NEW - 377 lines) - EAS Build profiles and TestFlight submission
5. **`story-9.4-railway-verification.md`** (NEW - 296 lines) - Deployment configuration verification
6. **`story-9.4-sentry-verification.md`** (NEW - 200 lines) - Error tracking setup confirmation
7. **`story-9.4-subscription-migration.sql`** (NEW - 33 lines) - Database migration SQL
8. **`apple-app-site-association`** (NEW - 25 lines) - AASA file for Universal Links

**Why they're needed:** Step-by-step guides for manual steps (certificates, App Store Connect, hosting AASA file)

---

## 🟡 What Was MODIFIED in Story 9.4

### Backend - Modified Files (2 files)

#### 1. `weave-api/app/api/__init__.py`
**What changed:** Added `"account_router"` to exports list

**Before:**
```python
__all__ = [
    "goal_router",
    "journal_router",
    # ... other routers
]
```

**After:**
```python
__all__ = [
    "account_router",  # ← NEW
    "goal_router",
    "journal_router",
    # ... other routers
]
```

**Why:** Register new router for import

---

#### 2. `weave-api/app/main.py`
**What changed:**
- Import `account_router` and `subscription_router`
- Register both routers with FastAPI app

**Before:**
```python
from app.api import (
    goal_router,
    journal_router,
    # ...
)

app.include_router(goal_router.router, tags=["goals"])
app.include_router(journal_router.router, tags=["journal"])
```

**After:**
```python
from app.api import (
    account_router,        # ← NEW
    subscription_router,   # ← NEW
    goal_router,
    journal_router,
    # ...
)

app.include_router(subscription_router.router, tags=["subscription"])  # ← NEW
app.include_router(account_router.router, tags=["account"])            # ← NEW
app.include_router(goal_router.router, tags=["goals"])
app.include_router(journal_router.router, tags=["journal"])
```

**Why:** Expose new API endpoints

---

### Frontend - Modified Files (6 files)

#### 1. `weave-mobile/app.json`
**What changed:** Added push notification configuration and Apple Sign In flag

**Before:**
```json
{
  "ios": {
    "bundleIdentifier": "com.weavelight.app",
    "associatedDomains": ["applinks:weavelight.app"]
  }
}
```

**After:**
```json
{
  "ios": {
    "bundleIdentifier": "com.weavelight.app",
    "associatedDomains": ["applinks:weavelight.app"],
    "infoPlist": {
      "UIBackgroundModes": ["remote-notification"]  // ← NEW
    },
    "usesAppleSignIn": true  // ← NEW
  },
  "plugins": [
    ["expo-notifications", {  // ← NEW
      "icon": "./assets/notification-icon.png",
      "color": "#3B82F6",
      "mode": "production"
    }]
  ]
}
```

**Why:** Enable push notifications and configure expo-notifications plugin

**Note:** Deep linking config was NOT changed (already existed from Story 0.3)

---

#### 2. `weave-mobile/app/(tabs)/settings/index.tsx`
**What changed:** Added "Account Management" link (replaced "Edit Profile" placeholder)

**Before:**
```typescript
<View>
  <Text>Edit Profile</Text>
  <Text>Coming soon...</Text>
</View>
```

**After:**
```typescript
<Pressable onPress={() => router.push('/(tabs)/settings/account')}>
  <Heading variant="displayLg">🔐 Account Management</Heading>
  <Body>Export your data or delete your account (GDPR compliance)</Body>
</Pressable>
```

**Why:** Navigation to new account management screen

---

#### 3. `weave-mobile/app/(tabs)/settings/subscription.tsx`
**What changed:** **COMPLETE REWRITE** - Was 30-line placeholder, now 250-line full UI

**Before:**
```typescript
export default function SubscriptionScreen() {
  return (
    <SafeAreaView>
      <Text>Subscription</Text>
      <Text>Coming soon...</Text>
    </SafeAreaView>
  );
}
```

**After:**
```typescript
export default function SubscriptionScreen() {
  const { data: subscriptionStatus } = useSubscriptionStatus();
  const { mutate: purchaseSubscription } = usePurchaseSubscription();
  const { mutate: restorePurchases } = useRestorePurchases();

  return (
    <SafeAreaView>
      {/* Current Plan Card (Free/Pro/Admin) */}
      <Card>
        <Heading>Current Plan: {subscriptionStatus?.subscription_tier}</Heading>
        <Body>Monthly Limit: {subscriptionStatus?.monthly_limit}</Body>
        <Body>Expires: {subscriptionStatus?.subscription_expires_at}</Body>
      </Card>

      {/* Upgrade Cards */}
      <Card>
        <Heading>Pro Monthly - $9.99/month</Heading>
        <Button onPress={() => purchaseSubscription(PRODUCT_IDS.MONTHLY)}>
          Upgrade to Pro
        </Button>
      </Card>

      <Card>
        <Heading>Pro Annual - $99.99/year</Heading>
        <Button onPress={() => purchaseSubscription(PRODUCT_IDS.ANNUAL)}>
          Upgrade to Pro
        </Button>
      </Card>

      {/* Management Buttons */}
      <Button onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')}>
        Manage Subscription
      </Button>
      <Button onPress={() => restorePurchases()}>
        Restore Purchases
      </Button>
    </SafeAreaView>
  );
}
```

**Why:** Full subscription management UI replacing placeholder

---

#### 4. `weave-mobile/app/(tabs)/settings/dev-tools.tsx`
**What changed:** Added "Story 9.4 Testing" section with test buttons

**Before:**
```typescript
export default function DevToolsScreen() {
  return (
    <SafeAreaView>
      {/* Cache Management Card */}
      <Card>
        <Button onPress={handleClearAllCaches}>Clear All Caches</Button>
        <Button onPress={handleLogQueries}>Log Active Queries</Button>
      </Card>
    </SafeAreaView>
  );
}
```

**After:**
```typescript
import * as Notifications from 'expo-notifications';  // ← NEW
import { useSubscriptionStatus } from '@/hooks/usePurchase';  // ← NEW
import apiClient from '@/services/apiClient';  // ← NEW

export default function DevToolsScreen() {
  const { data: subscriptionStatus } = useSubscriptionStatus();  // ← NEW
  const [isSendingNotification, setIsSendingNotification] = useState(false);  // ← NEW
  const [isTestingSubscription, setIsTestingSubscription] = useState(false);  // ← NEW

  // ← NEW: Test notification handler
  const handleTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Test Notification',
        body: 'This is a test notification from Weave Dev Tools',
        data: { type: 'test', screen: 'dev-tools' },
        sound: true,
      },
      trigger: null, // Send immediately
    });
    Alert.alert('Notification Sent!', 'Check your notification center.');
  };

  // ← NEW: Test subscription handler
  const handleTestSubscription = async () => {
    const response = await apiClient.get('/api/subscription/status');
    const status = response.data;
    Alert.alert(
      'Subscription Status',
      `Tier: ${status.subscription_tier}\n` +
      `Monthly Limit: ${status.monthly_limit}\n` +
      `Expires: ${status.subscription_expires_at || 'N/A'}\n` +
      `Product: ${status.subscription_product_id || 'N/A'}`
    );
  };

  return (
    <SafeAreaView>
      {/* Existing Cache Management Card */}
      <Card>
        <Button onPress={handleClearAllCaches}>Clear All Caches</Button>
        <Button onPress={handleLogQueries}>Log Active Queries</Button>
      </Card>

      {/* ← NEW: Story 9.4 Testing Card */}
      <Card>
        <Heading>Story 9.4 Testing</Heading>
        <Button
          onPress={handleTestNotification}
          disabled={isSendingNotification}
        >
          {isSendingNotification ? 'Sending...' : '🔔 Test Push Notification'}
        </Button>
        <Button
          onPress={handleTestSubscription}
          disabled={isTestingSubscription}
        >
          {isTestingSubscription ? 'Loading...' : '💳 Test Subscription Status'}
        </Button>
        <Body>
          Test notification: Sends local push notification immediately{'\n'}
          Test subscription: Fetches current tier and limits from API
        </Body>

        {/* ← NEW: Live subscription status display */}
        {subscriptionStatus && (
          <View>
            <Body>Current Tier: {subscriptionStatus.subscription_tier.toUpperCase()}</Body>
            <Body>Monthly Limit: {subscriptionStatus.subscription_tier === 'free' ? '500' :
                   subscriptionStatus.subscription_tier === 'pro' ? '5000' : 'Unlimited'}
            </Body>
          </View>
        )}
      </Card>
    </SafeAreaView>
  );
}
```

**Why:** Testing tools for notification and subscription features

**What you can test:**
1. Tap "Test Push Notification" → Local notification appears immediately
2. Tap "Test Subscription Status" → Alert shows current tier, monthly limit, expiry, product ID
3. See live subscription status below buttons

---

#### 5. `weave-mobile/eas.json`
**What changed:** **COMPLETE REWRITE** - Was basic 3-profile config, now production-ready

**Before:**
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

**After:**
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true,
        "buildConfiguration": "Debug"
      },
      "env": {
        "APP_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release"
      },
      "env": {
        "APP_ENV": "staging"
      }
    },
    "production": {
      "autoIncrement": true,
      "distribution": "store",
      "channel": "production",
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release"
      },
      "env": {
        "APP_ENV": "production",
        "SENTRY_ORG": "jackluo",
        "SENTRY_PROJECT": "weavelight"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID_HERE",
        "ascAppId": "YOUR_ASC_APP_ID_HERE",
        "appleTeamId": "YOUR_TEAM_ID_HERE"
      }
    }
  }
}
```

**Why:** Production-ready build configuration with:
- Auto-incrementing build numbers
- Sentry source map upload
- Environment separation (dev/staging/prod)
- Submit configuration for TestFlight

**Manual step required:** Replace placeholders with actual Apple IDs

---

#### 6. `weave-mobile/package.json` & `package-lock.json`
**What changed:** Added `expo-in-app-purchases` dependency

**Before:**
```json
{
  "dependencies": {
    "expo-notifications": "~0.28.19",
    // ... other dependencies
  }
}
```

**After:**
```json
{
  "dependencies": {
    "expo-in-app-purchases": "15.2.3",  // ← NEW
    "expo-notifications": "~0.28.19",
    // ... other dependencies
  }
}
```

**Why:** Required for Apple IAP integration

---

## 📊 Summary: What Changed vs What Existed

### Already Existed (NOT Touched)
- ✅ `notificationService.ts` (Story 6.1)
- ✅ Backend push token endpoint (Story 6.1)
- ✅ Sentry SDK & initialization (Previous work)
- ✅ Deep linking config (Story 0.3)
- ✅ Railway deployment (Story 9.1)

### Completely NEW (10 files)
**Backend:**
1. `subscription_config.py` - Config module
2. `subscription_router.py` - IAP endpoints
3. `account_router.py` - GDPR endpoints
4. `test_subscription_api.py` - Unit tests

**Frontend:**
5. `iap.ts` - IAP service
6. `usePurchase.ts` - Purchase hooks
7. `useNotifications.ts` - Notification hook wrapper
8. `account.tsx` - Account management UI
9. `PrivacyInfo.xcprivacy` - Privacy manifest

**Database:**
10. Subscription migration SQL

**Documentation:**
11-18. 8 implementation guides

### MODIFIED (8 files)
**Backend:**
1. `app/api/__init__.py` - Added router export (+1 line)
2. `app/main.py` - Router registration (+2 lines)

**Frontend:**
3. `app.json` - Push notification config (~15 lines)
4. `settings/index.tsx` - Account link (~30 lines)
5. `subscription.tsx` - Complete rewrite (30 → 250 lines)
6. `dev-tools.tsx` - Test buttons (~100 lines)
7. `eas.json` - Complete rewrite (basic → production-ready)
8. `package.json` - Added dependency (+1 line)

---

## 🎯 Key Integrations

### How New Pieces Connect to Existing Infrastructure

1. **IAP → TieredRateLimiter:**
   - `subscription_router.py` updates `user_profiles.subscription_tier`
   - Existing `TieredRateLimiter` (Story 6.1) reads this column
   - Rate limit automatically increases: 500 → 5000 messages/month

2. **useNotifications Hook → notificationService:**
   - New `useNotifications.ts` wraps existing `notificationService.ts` (Story 6.1)
   - Makes one-line integration: `useNotifications()` instead of manual function calls
   - Does NOT replace or modify the service

3. **GDPR Endpoints → Existing Tables:**
   - `account_router.py` reads from existing tables (goals, journal_entries, completions, etc.)
   - No new tables created for GDPR - uses existing data model

4. **Privacy Manifest → Existing SDKs:**
   - Documents existing SDK usage (Sentry, Supabase, Expo, PostHog)
   - Does NOT add new SDKs

5. **EAS Build → Sentry:**
   - Production build profile uploads source maps to existing Sentry project
   - Uses existing `SENTRY_ORG` and `SENTRY_PROJECT` configuration

---

## 🧪 How to Test

### Backend Tests
```bash
cd weave-api
uv run pytest tests/test_subscription_api.py -v
```
**Expected:** All 9 tests pass

### Frontend Tests (Dev Tools)
```bash
cd weave-mobile
npm start
# Navigate: Settings → Dev Tools
# Tap: "🔔 Test Push Notification" → Notification appears
# Tap: "💳 Test Subscription Status" → Alert shows tier data
```

### Manual API Tests
```bash
# Get auth token from app (login first)
AUTH_TOKEN="your_jwt_token_here"

# Test subscription status
curl -X GET https://weave-api-production.railway.app/api/subscription/status \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Expected response:
# {
#   "subscription_tier": "free",
#   "monthly_limit": 500,
#   "subscription_expires_at": null,
#   "subscription_product_id": null,
#   "is_expired": false
# }
```

---

## 📋 Manual Steps Before TestFlight

1. **App Store Connect:**
   - Create 3 IAP products (trial, monthly, annual)
   - Generate APNs production certificate
   - Upload certificate to Expo

2. **Database:**
   - Apply migration: `story-9.4-subscription-migration.sql`

3. **Environment Variables:**
   - Add to `.env`: `APPLE_SHARED_SECRET`, `APPLE_TEAM_ID`, `IAP_SANDBOX=true`

4. **EAS Build:**
   - Update `eas.json` with Apple IDs (appleId, ascAppId, appleTeamId)
   - Add EAS secrets: `SENTRY_AUTH_TOKEN`, `EXPO_APPLE_APP_SPECIFIC_PASSWORD`

5. **Deep Linking:**
   - Host AASA file at `https://weavelight.app/.well-known/apple-app-site-association`

6. **Build & Submit:**
   ```bash
   eas build --profile production --platform ios
   eas submit --profile production --platform ios --latest
   ```

---

## ✅ Status: 10/13 ACs Complete

**Complete:**
- ✅ AC 1: In-App Purchases (Phase 1)
- ✅ AC 2: Privacy Manifest
- ✅ AC 5: Push Notifications Setup
- ✅ AC 6: Deep Linking
- ✅ AC 7: Settings Screen
- ✅ AC 8: Subscription Config Module
- ✅ AC 9: TieredRateLimiter Integration
- ✅ AC 10: Sentry Error Tracking (Verify)
- ✅ AC 12: Production Build Configuration
- ✅ AC 13: Railway Deployment Fix

**Pending (non-blocking or optional):**
- ⏳ AC 3: App Icons (requires design work)
- ⏳ AC 4: App Store Screenshots (requires design work)
- ⏳ AC 11: PostHog Analytics (optional - can add post-launch)

---

**Created:** 2025-12-23
**Branch:** `prod/9.4`
**Ready for:** User review → Commits → TestFlight preparation
