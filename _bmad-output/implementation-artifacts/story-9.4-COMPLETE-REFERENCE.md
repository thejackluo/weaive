# Story 9.4: Complete Implementation Reference

**Purpose:** All-in-one reference combining what changed, commit strategy, and detailed breakdown

**Status:** 10/13 ACs complete (3 pending: icons, screenshots, PostHog)

**Branch:** `prod/9.4` → `main`

---

## Table of Contents

1. [Quick Summary](#quick-summary)
2. [What Already Existed vs. What's New](#what-already-existed-vs-whats-new)
3. [Commit Strategy (5 Commits)](#commit-strategy-5-commits)
4. [Detailed File-by-File Breakdown](#detailed-file-by-file-breakdown)
5. [Testing Strategy](#testing-strategy)
6. [Manual Steps Before TestFlight](#manual-steps-before-testflight)

---

## Quick Summary

### 10/13 ACs Complete

**✅ Complete:**
- AC 1: In-App Purchases (Phase 1 - Manual IAP)
- AC 2: Privacy Manifest
- AC 5: Push Notifications Setup
- AC 6: Deep Linking
- AC 7: Settings Screen (Account, Subscription, Privacy)
- AC 8: Subscription Config Module
- AC 9: TieredRateLimiter Integration
- AC 10: Sentry Error Tracking (Verify)
- AC 12: Production Build Configuration
- AC 13: Railway Deployment Fix

**⏳ Pending (non-blocking or optional):**
- AC 3: App Icons (requires design work)
- AC 4: App Store Screenshots (requires design work)
- AC 11: PostHog Analytics (optional - post-launch)

### Files Changed

- **10 new files** (4 backend, 5 frontend, 1 migration)
- **8 modified files** (2 backend, 6 frontend)
- **6 documentation guides** (production setup)

---

## What Already Existed vs. What's New

### 🔵 What Already Existed (NOT Changed in Story 9.4)

**From Story 6.1 (AI Chat & Push Notifications):**
1. ✅ `weave-mobile/src/services/notificationService.ts` - **NOT modified**
2. ✅ Backend endpoint `POST /api/user/push-token` - **NOT modified**
3. ✅ `expo-notifications` package - **NOT reinstalled**

**From Story 0.3 (Authentication):**
4. ✅ Deep linking config in `app.json` (associatedDomains) - **NOT modified**
5. ✅ JWT authentication middleware (`get_current_user`) - **NOT modified**

**From Story 9.1 (Code Review):**
6. ✅ Railway deployment fix (uv run prefix) - **NOT modified**

**From Previous Work:**
7. ✅ Sentry SDK `@sentry/react-native@7.8.0` - **NOT modified**
8. ✅ Sentry initialized in `app/_layout.tsx` - **NOT modified**

### 🟢 What's Completely NEW in Story 9.4

**Backend (4 new files):**
1. `weave-api/app/config/subscription_config.py` (82 lines)
2. `weave-api/app/api/subscription_router.py` (178 lines)
3. `weave-api/app/api/account_router.py` (200 lines)
4. `weave-api/tests/test_subscription_api.py` (285 lines)

**Frontend (5 new files):**
5. `weave-mobile/src/services/iap.ts` (192 lines)
6. `weave-mobile/src/hooks/usePurchase.ts` (225 lines)
7. `weave-mobile/src/hooks/useNotifications.ts` (93 lines) - Wrapper for existing service
8. `weave-mobile/app/(tabs)/settings/account.tsx` (274 lines)
9. `weave-mobile/ios/PrivacyInfo.xcprivacy` (252 lines)

**Database:**
10. `_bmad-output/implementation-artifacts/story-9.4-subscription-migration.sql` (33 lines)

**Documentation (6 guides - moved to docs/production/):**
11. APNs setup guide
12. Deep linking guide
13. Production build guide
14. Railway verification
15. Sentry verification
16. Implementation summary

### 🟡 What Was MODIFIED in Story 9.4 (8 files)

**Backend (2 files):**
1. `weave-api/app/api/__init__.py` - Added router exports (+2 lines)
2. `weave-api/app/main.py` - Router registration (+4 lines)

**Frontend (6 files):**
3. `weave-mobile/app.json` - Push notification config (~15 lines)
4. `weave-mobile/app/(tabs)/settings/index.tsx` - Account link (~30 lines)
5. `weave-mobile/app/(tabs)/settings/subscription.tsx` - **Complete rewrite** (30 → 250 lines)
6. `weave-mobile/app/(tabs)/settings/dev-tools.tsx` - Test buttons (~100 lines)
7. `weave-mobile/eas.json` - **Complete rewrite** (basic → production)
8. `weave-mobile/package.json` - Added dependency (+1 line)

---

## Commit Strategy (5 Commits)

### Commit Order & Rationale

**Recommended order:** Backend → Frontend → Documentation
- Backend commits (1-2) can be deployed independently
- Frontend commits (3-4) depend on backend APIs
- Documentation (5) documents everything

### Alternative: Squash Strategy
Can combine into 3 commits:
- Backend (Commits 1+2)
- Mobile (Commits 3+4)
- Docs (Commit 5)

---

## Commit 1: Backend - Apple IAP Receipt Verification System

### Scope
`feat(backend): add Apple IAP receipt verification system`

### Files (5 files)
```
weave-api/app/config/subscription_config.py          (NEW - 82 lines)
weave-api/app/api/subscription_router.py             (NEW - 178 lines)
weave-api/tests/test_subscription_api.py             (NEW - 285 lines)
weave-api/app/api/__init__.py                        (MODIFIED - +1 line)
weave-api/app/main.py                                (MODIFIED - +2 lines)
```

### What It Does

**subscription_config.py:**
- Defines 3 product IDs: `com.weavelight.app.{trial.10day, pro.monthly, pro.annual}`
- Sets tier limits: free=500, pro=5000, admin=unlimited AI messages/month
- Provides Apple receipt verification URLs (sandbox vs production)
- Validates product IDs

**subscription_router.py:**
- `POST /api/subscription/verify-receipt` - Verify Apple receipt, update user tier
- `GET /api/subscription/status` - Get subscription status

**Flow:**
1. Mobile app purchases from Apple → gets receipt
2. Mobile calls `/verify-receipt` with receipt + product_id
3. Backend verifies with Apple's API
4. Backend updates `user_profiles.subscription_tier` to 'pro'
5. TieredRateLimiter reads tier (500 → 5000 messages/month)

**test_subscription_api.py:**
- 9 test cases covering config, verification, status endpoints

### Commit Message
```
feat(backend): add Apple IAP receipt verification system

Implements Phase 1 of IAP for Story 9.4 (App Store Readiness):
- Subscription config module with product IDs and tier limits
- Receipt verification endpoint with Apple API integration
- Subscription status endpoint for tier queries
- Comprehensive unit tests (9 test cases)

Endpoints:
- POST /api/subscription/verify-receipt - Verify Apple receipt
- GET /api/subscription/status - Get subscription tier and limits

Tiers:
- free: 500 AI messages/month
- pro: 5000 AI messages/month (via IAP)
- admin: unlimited

Product IDs:
- com.weavelight.app.trial.10day (10-day free trial)
- com.weavelight.app.pro.monthly ($9.99/month)
- com.weavelight.app.pro.annual ($99.99/year)

Integration:
- TieredRateLimiter (Story 6.1) reads subscription_tier column
- When user purchases Pro, tier updates and rate limit increases 10x

Manual steps required:
- Create 3 products in App Store Connect
- Apply database migration (story-9.4-subscription-migration.sql)
- Add APPLE_SHARED_SECRET and APPLE_TEAM_ID to .env

Story: 9.4 AC 1, AC 8, AC 9
Tests: pytest tests/test_subscription_api.py -v

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Test Command
```bash
cd weave-api
uv run pytest tests/test_subscription_api.py -v
uv run ruff check .
```
**Expected:** All 9 tests pass, no linting errors

---

## Commit 2: Backend - GDPR Account Management APIs

### Scope
`feat(backend): add GDPR-compliant account management APIs`

### Files (3 files)
```
weave-api/app/api/account_router.py                  (NEW - 200 lines)
weave-api/app/api/__init__.py                        (MODIFIED - +1 line)
weave-api/app/main.py                                (MODIFIED - +2 lines)
```

### What It Does

**account_router.py:**
- `GET /api/account/export-data` - Export all user data (GDPR Article 20)
- `POST /api/account/delete-account` - Delete account (GDPR Article 17)

**Export includes:**
- Goals, completions, journal entries, identity docs, captures, daily aggregates

**Delete flow:**
- Requires "DELETE" confirmation
- Cascading deletion across 11 tables
- Irreversible

**Known limitation:**
- Doesn't delete Supabase Auth user (requires admin privileges - Story 9.5)

### Commit Message
```
feat(backend): add GDPR-compliant account management APIs

Implements data privacy features for Story 9.4 (App Store Readiness):
- Export user data endpoint (GDPR Article 20 - Data Portability)
- Delete account endpoint (GDPR Article 17 - Right to Erasure)
- Cascading deletion of all user data (11 tables)

Endpoints:
- GET /api/account/export-data - Export complete user data as JSON
- POST /api/account/delete-account - Delete account (requires "DELETE" confirmation)

Exported data includes:
- Goals and subtask templates
- Completions and captures (proof photos/audio/notes)
- Journal entries and reflections
- Identity documents
- Daily aggregates and statistics

Security:
- JWT authentication required (Depends(get_current_user))
- RLS policies enforce user isolation
- Irreversible deletion with explicit confirmation
- Export returns placeholder URL (production: upload to Supabase Storage)

Known limitation:
- Account deletion doesn't delete Supabase Auth user (requires admin privileges)
- Will be addressed in Story 9.5 (Production Security & Monitoring)

Story: 9.4 AC 7
Integration: Reads from existing tables, no schema changes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Test Command
```bash
cd weave-api
uv run pytest  # Run all tests
uv run ruff check .
```
**Expected:** All tests pass, no linting errors

---

## Commit 3: Mobile - Apple In-App Purchases Implementation

### Scope
`feat(mobile): implement Apple In-App Purchases (Phase 1)`

### Files (5 files)
```
weave-mobile/src/services/iap.ts                     (NEW - 192 lines)
weave-mobile/src/hooks/usePurchase.ts                (NEW - 225 lines)
weave-mobile/app/(tabs)/settings/subscription.tsx    (MODIFIED - complete rewrite: 30 → 250 lines)
weave-mobile/package.json                            (MODIFIED - +1 dependency)
weave-mobile/package-lock.json                       (MODIFIED - auto-generated)
```

### What It Does

**iap.ts - IAP Service:**
```typescript
export const PRODUCT_IDS = {
  MONTHLY: 'com.weavelight.app.pro.monthly',
  ANNUAL: 'com.weavelight.app.pro.annual',
  TRIAL: 'com.weavelight.app.trial.10day',
};

// Key functions:
initializeIAP()           // Connect to Apple IAP
fetchProducts()           // Get pricing from Apple
purchaseProduct(id)       // Trigger purchase flow
restorePurchases()        // Restore previous purchases
```

**usePurchase.ts - TanStack Query Hooks:**
```typescript
useSubscriptionProducts()   // Query available products
useSubscriptionStatus()     // Query user's current tier
usePurchaseSubscription()   // Mutation for purchase
useRestorePurchases()       // Mutation for restore
```

**subscription.tsx - Full UI:**
- Current plan display (Free/Pro/Admin)
- Monthly ($9.99) and Annual ($99.99) upgrade cards
- Manage Subscription button (opens App Store)
- Restore Purchases button
- Expiry date and monthly limit display

**Purchase Flow:**
1. User taps "Upgrade to Pro"
2. App calls `purchaseProduct()` → Apple IAP
3. Apple returns receipt
4. App calls `POST /api/subscription/verify-receipt`
5. Backend updates `subscription_tier = 'pro'`
6. TanStack Query auto-invalidates subscription status
7. User sees updated plan immediately
8. Rate limit increases 10x (500 → 5000 messages/month)

### Commit Message
```
feat(mobile): implement Apple In-App Purchases (Phase 1)

Implements subscription system for Story 9.4 (App Store Readiness):

Services:
- iap.ts: Direct Apple IAP integration (purchase, restore, products)
- usePurchase.ts: TanStack Query hooks with auto-invalidation

UI:
- Subscription screen: Full redesign from placeholder
- Shows current plan (Free/Pro/Admin)
- Monthly ($9.99) and Annual ($99.99) upgrade cards
- Manage Subscription button (opens App Store)
- Restore Purchases button
- Displays expiry date and monthly limit

Products:
- com.weavelight.app.trial.10day (10-day free trial)
- com.weavelight.app.pro.monthly ($9.99/month)
- com.weavelight.app.pro.annual ($99.99/year)

Purchase Flow:
1. User taps "Upgrade to Pro"
2. App calls purchaseProduct() → Apple IAP
3. Apple returns receipt
4. App calls POST /api/subscription/verify-receipt
5. Backend updates subscription_tier = 'pro'
6. TanStack Query auto-invalidates subscription status
7. User sees updated plan immediately
8. Rate limit increases 10x (500 → 5000 messages/month)

State Management:
- TanStack Query for server state (products, status)
- Auto-cache invalidation after purchase
- Optimistic UI updates

Dependencies:
- expo-in-app-purchases@15.2.3

Manual steps required:
- Create products in App Store Connect
- Test in Sandbox mode on physical device (simulators don't support IAP)

Story: 9.4 AC 1
Integration: Connects to backend subscription_router (Commit 1)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Test Command
```bash
cd weave-mobile
npm run lint
npm test
npm start
# Navigate: Settings → Subscription
# Visual test: See current plan, upgrade cards
```

---

## Commit 4: Mobile - App Store Production Readiness Configuration

### Scope
`feat(mobile): configure App Store production readiness`

### Files (7 files)
```
weave-mobile/ios/PrivacyInfo.xcprivacy               (NEW - 252 lines) [NEEDS git add -f]
weave-mobile/src/hooks/useNotifications.ts           (NEW - 93 lines)
weave-mobile/app/(tabs)/settings/account.tsx         (NEW - 274 lines)
weave-mobile/app.json                                (MODIFIED - +push notification config, ~15 lines)
weave-mobile/app/(tabs)/settings/index.tsx           (MODIFIED - +account link, ~30 lines)
weave-mobile/app/(tabs)/settings/dev-tools.tsx       (MODIFIED - +test buttons, ~100 lines)
weave-mobile/eas.json                                (MODIFIED - complete rewrite: basic → production)
```

### What It Does

**PrivacyInfo.xcprivacy - Privacy Manifest (iOS 17+ requirement):**
- Declares all data collection: Email, Photos, Audio, Goals/Journal, IDs, Usage, Diagnostics
- Lists third-party SDKs: Sentry, Supabase, Expo, PostHog
- No cross-app tracking
- **Location:** Gitignored `ios/` directory - needs `git add -f`

**useNotifications.ts - Notification Setup Hook:**
- **Important:** Wrapper around existing `notificationService.ts` from Story 6.1
- Auto-requests permissions, registers device, saves token, sets up listeners
- One-line integration: `useNotifications()` instead of manual function calls

**account.tsx - GDPR Account Management UI:**
- Export data button (downloads JSON)
- Delete account button (double confirmation required)
- GDPR compliance notice

**app.json - Push Notification Config:**
```json
"ios": {
  "infoPlist": {
    "UIBackgroundModes": ["remote-notification"]  // NEW
  },
  "usesAppleSignIn": true  // NEW
},
"plugins": [
  ["expo-notifications", { /* config */ }]  // NEW
]
```

**dev-tools.tsx - Testing Section:**
- "Test Push Notification" button → sends local notification
- "Test Subscription Status" button → queries API, shows alert
- Live subscription status display

**eas.json - Production Build Config:**
- 3 profiles: development, preview, production
- Auto-incrementing build numbers
- Sentry source map upload
- Environment variables per profile
- Submit configuration for TestFlight

### Commit Message
```
feat(mobile): configure App Store production readiness

Story 9.4 (App Store Readiness) - Multiple ACs:

Privacy Manifest (AC 2):
- ios/PrivacyInfo.xcprivacy: Declares all data collection
- Required for iOS 17+ App Store submission
- Documents: Email, Photos, Audio, Goals, IDs, Usage, Diagnostics
- Third-party SDKs: Sentry, Supabase, Expo, PostHog
- No cross-app tracking

Push Notifications (AC 5):
- useNotifications hook: Wraps existing notificationService (Story 6.1)
- app.json: Added UIBackgroundModes and expo-notifications plugin
- One-line integration for app startup
- Note: notificationService.ts from Story 6.1 NOT modified

Account Management (AC 7):
- account.tsx: GDPR-compliant export/delete UI
- Export data button (downloads JSON)
- Delete account with double confirmation
- Settings screen: Added account management link

Production Build (AC 12):
- eas.json: Rewritten with 3 profiles (dev/preview/prod)
- Auto-incrementing build numbers
- Sentry source map upload in production
- Environment variables per profile (APP_ENV, SENTRY_ORG, etc.)

Deep Linking (AC 6):
- app.json: Already configured (associatedDomains from Story 0.3)
- No code changes needed (Expo Router handles automatically)
- AASA file created in documentation

Dev Tools Testing:
- Test notification button (sends local push notification)
- Test subscription button (queries /api/subscription/status)
- Live subscription status display
- Navigate: Settings → Dev Tools → Story 9.4 Testing

Manual steps required:
- Generate APNs certificate and upload to Expo
- Host AASA file at weavelight.app/.well-known/
- Update eas.json with Apple IDs (appleId, ascAppId, appleTeamId)
- Force add ios/PrivacyInfo.xcprivacy: git add -f weave-mobile/ios/PrivacyInfo.xcprivacy
- Add EAS secrets: SENTRY_AUTH_TOKEN, EXPO_APPLE_APP_SPECIFIC_PASSWORD

Story: 9.4 AC 2, AC 5, AC 6, AC 7, AC 12
Integration: Builds on notificationService (Story 6.1), Sentry (previous work)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Test Command
```bash
cd weave-mobile
npm run lint
npm test
npm start
# Navigate: Settings → Dev Tools → Story 9.4 Testing
# Tap "Test Push Notification" → notification appears
# Tap "Test Subscription Status" → alert shows tier data
```

### Special Note: Force Add Privacy Manifest
```bash
git add -f weave-mobile/ios/PrivacyInfo.xcprivacy
```

---

## Commit 5: Documentation - Production Deployment Guides

### Scope
`docs: add Story 9.4 production deployment guides`

### Files (7 files)
```
docs/production/story-9.4-apns-setup.md              (NEW - 300 lines)
docs/production/story-9.4-deep-linking.md            (NEW - 350 lines)
docs/production/story-9.4-production-build.md        (NEW - 377 lines)
docs/production/story-9.4-railway-verification.md    (NEW - 296 lines)
docs/production/story-9.4-sentry-verification.md     (NEW - 200 lines)
docs/production/story-9.4-implementation-summary.md  (NEW - 478 lines)
_bmad-output/implementation-artifacts/story-9.4-subscription-migration.sql  (NEW - 33 lines)
_bmad-output/implementation-artifacts/apple-app-site-association            (NEW - 25 lines)
```

### What It Does

**Production Guides (docs/production/):**
1. **apns-setup.md** - APNs certificate generation and upload to Expo
2. **deep-linking.md** - Universal Links setup with AASA file hosting
3. **production-build.md** - EAS Build profiles and TestFlight submission
4. **railway-verification.md** - Deployment configuration verification
5. **sentry-verification.md** - Error tracking setup confirmation
6. **implementation-summary.md** - Executive summary of all 13 ACs

**Implementation Artifacts (_bmad-output/):**
7. **subscription-migration.sql** - Database schema changes
8. **apple-app-site-association** - AASA file for Universal Links

### Commit Message
```
docs: add Story 9.4 production deployment guides

Complete documentation for App Store readiness:

Production Guides (docs/production/):
- story-9.4-apns-setup.md: APNs certificate generation and upload
- story-9.4-deep-linking.md: Universal Links and AASA file hosting
- story-9.4-production-build.md: EAS Build profiles and TestFlight submission
- story-9.4-railway-verification.md: Deployment configuration verification
- story-9.4-sentry-verification.md: Error tracking setup confirmation
- story-9.4-implementation-summary.md: Executive summary (10/13 ACs complete)

Implementation Artifacts (_bmad-output/):
- story-9.4-subscription-migration.sql: Database schema changes
- apple-app-site-association: AASA file for Universal Links

Manual Steps Documented:
- App Store Connect setup (products, certificates)
- Expo credential management
- Database migration application
- AASA file hosting at weavelight.app/.well-known/
- EAS Build configuration with secrets

Status:
- 10/13 ACs complete
- 3 pending (icons, screenshots - require design; PostHog - optional)
- Ready for TestFlight once icons and screenshots added

Story: 9.4 (Documentation)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Detailed File-by-File Breakdown

### Backend Files

#### subscription_config.py (NEW - 82 lines)
**Purpose:** Centralized subscription configuration

**Key Config:**
```python
PRODUCT_ID_MONTHLY = "com.weavelight.app.pro.monthly"
PRODUCT_ID_ANNUAL = "com.weavelight.app.pro.annual"
PRODUCT_ID_TRIAL = "com.weavelight.app.trial.10day"

FREE_TIER_MONTHLY_LIMIT = 500
PRO_TIER_MONTHLY_LIMIT = 5000

APPLE_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt"
APPLE_PRODUCTION_URL = "https://buy.itunes.apple.com/verifyReceipt"
```

**Why:** Follows Story 6.1 config pattern, single source of truth

---

#### subscription_router.py (NEW - 178 lines)
**Purpose:** Apple IAP receipt verification and subscription status

**Endpoints:**
1. `POST /api/subscription/verify-receipt`
   - Validates product ID
   - Verifies receipt with Apple's API
   - Updates `user_profiles.subscription_tier`
   - Returns success/failure

2. `GET /api/subscription/status`
   - Returns current tier, monthly limit, expiry date, product ID
   - Calculates is_expired boolean

**Flow:**
```
Mobile → POST /verify-receipt → Backend → Apple API → Update DB → Response
```

---

#### account_router.py (NEW - 200 lines)
**Purpose:** GDPR-compliant account management

**Endpoints:**
1. `GET /api/account/export-data`
   - Exports: goals, completions, journal entries, identity docs, captures, aggregates
   - Returns: `{ "export_url": "placeholder" }` (production: upload to Supabase Storage)

2. `POST /api/account/delete-account`
   - Requires: `{ "confirmation": "DELETE" }`
   - Deletes: 11 tables (cascading deletion)
   - Irreversible

**Why:** App Store requires GDPR compliance

---

#### test_subscription_api.py (NEW - 285 lines)
**Purpose:** Unit tests for subscription system

**Test Coverage:**
- Config validation (9 tests total)
- Receipt verification (success, invalid, timeout)
- Subscription status (free tier, pro tier)
- Integration flow documentation

---

### Frontend Files

#### iap.ts (NEW - 192 lines)
**Purpose:** Apple IAP integration service

**Key Functions:**
```typescript
initializeIAP()              // Connect to Apple IAP store
fetchProducts([ids])         // Get product pricing from Apple
purchaseProduct(productId)   // Trigger Apple purchase flow
restorePurchases()           // Restore previous purchases
```

**Product IDs:** MONTHLY, ANNUAL, TRIAL

---

#### usePurchase.ts (NEW - 225 lines)
**Purpose:** TanStack Query hooks for IAP

**Key Hooks:**
```typescript
useSubscriptionProducts()     // Query available products
useSubscriptionStatus()       // Query user's current tier
usePurchaseSubscription()     // Mutation for purchase
useRestorePurchases()         // Mutation for restore
```

**Auto-invalidation:** After purchase, automatically refreshes subscription status

---

#### useNotifications.ts (NEW - 93 lines)
**Purpose:** Simplified notification setup hook

**Important:** Wrapper around existing `notificationService.ts` (Story 6.1)

**Before Story 9.4:**
```typescript
// Manual integration
await registerForPushNotificationsAsync();
await savePushTokenToBackend(token);
setupNotificationListeners();
```

**After Story 9.4:**
```typescript
// One-line integration
useNotifications(); // Done!
```

---

#### account.tsx (NEW - 274 lines)
**Purpose:** GDPR account management UI

**Features:**
- Export data button
- Delete account button (double confirmation)
- GDPR compliance notice

**Navigation:** Settings → Account Management

---

#### PrivacyInfo.xcprivacy (NEW - 252 lines)
**Purpose:** Apple Privacy Manifest (iOS 17+ requirement)

**Declares:**
- Data types: Email, Photos, Audio, User Content, IDs, Usage, Diagnostics
- Third-party SDKs: Sentry, Supabase, Expo, PostHog
- No cross-app tracking

**Location:** Gitignored `ios/` directory - needs `git add -f`

---

### Modified Files

#### app.json
**Changes:** Added push notification configuration

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
      "UIBackgroundModes": ["remote-notification"]
    },
    "usesAppleSignIn": true
  },
  "plugins": [
    ["expo-notifications", { /* config */ }]
  ]
}
```

---

#### subscription.tsx
**Changes:** Complete rewrite (30 → 250 lines)

**Before:** Placeholder screen
**After:** Full subscription UI with current plan, upgrade cards, manage/restore buttons

---

#### dev-tools.tsx
**Changes:** Added Story 9.4 Testing section (~100 lines)

**New Features:**
```typescript
// Test notification handler
const handleTestNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: { title: '🧪 Test Notification', body: '...' },
    trigger: null,
  });
};

// Test subscription handler
const handleTestSubscription = async () => {
  const response = await apiClient.get('/api/subscription/status');
  Alert.alert('Subscription Status', `Tier: ${status.subscription_tier}...`);
};
```

**UI:**
- "🔔 Test Push Notification" button
- "💳 Test Subscription Status" button
- Live subscription status display

---

#### eas.json
**Changes:** Complete rewrite (basic → production-ready)

**New Structure:**
- 3 profiles: development, preview, production
- Auto-incrementing build numbers
- Sentry source map upload
- Environment variables per profile
- Submit configuration

---

## Testing Strategy

### Backend Tests (After Commits 1-2)

```bash
cd weave-api

# Test subscription API
uv run pytest tests/test_subscription_api.py -v

# Test all APIs
uv run pytest

# Linting
uv run ruff check .
```

**Expected:** All tests pass, no linting errors

---

### Frontend Tests (After Commits 3-4)

```bash
cd weave-mobile

# Linting
npm run lint

# Tests
npm test

# Visual testing
npm start
```

**Navigate to:**
1. Settings → Subscription → See current plan, upgrade cards
2. Settings → Account Management → See export/delete buttons
3. Settings → Dev Tools → Story 9.4 Testing → Test buttons

---

### Manual API Tests

```bash
# Get auth token (login via app first)
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

# Test data export
curl -X GET https://weave-api-production.railway.app/api/account/export-data \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

---

## Manual Steps Before TestFlight

### 1. Database Migration
```bash
# Apply migration in Supabase Dashboard
# SQL: _bmad-output/implementation-artifacts/story-9.4-subscription-migration.sql
```

```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_product_id TEXT;

CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_expires
ON user_profiles(subscription_expires_at)
WHERE subscription_tier = 'pro';
```

---

### 2. App Store Connect Setup

**Create 3 IAP Products:**
1. `com.weavelight.app.trial.10day` - 10-day free trial
2. `com.weavelight.app.pro.monthly` - $9.99/month
3. `com.weavelight.app.pro.annual` - $99.99/year

**Generate APNs Certificate:**
- See: `docs/production/story-9.4-apns-setup.md`
- Upload to Expo

---

### 3. Environment Variables

**Add to `.env` (backend):**
```bash
APPLE_SHARED_SECRET=...
APPLE_TEAM_ID=...
IAP_SANDBOX=true  # For testing
```

**Add to Railway:**
- Same variables, but `IAP_SANDBOX=false` in production

---

### 4. EAS Build Configuration

**Update `eas.json` placeholders:**
```json
{
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

**Add EAS Secrets:**
```bash
eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value YOUR_TOKEN
eas secret:create --scope project --name EXPO_APPLE_APP_SPECIFIC_PASSWORD --value YOUR_PASSWORD
eas secret:create --scope project --name API_BASE_URL --value https://weave-api-production.railway.app
```

---

### 5. Deep Linking Setup

**Host AASA file:**
- Upload `apple-app-site-association` to `https://weavelight.app/.well-known/`
- Verify SSL certificate valid
- Replace `TEAM_ID` with actual Apple Team ID

---

### 6. Build & Submit

```bash
# Build production IPA
eas build --profile production --platform ios

# Submit to TestFlight
eas submit --profile production --platform ios --latest
```

---

## Post-Commit Checklist

- [ ] All backend tests pass
- [ ] All mobile tests pass
- [ ] Backend linting clean (ruff)
- [ ] Mobile linting clean (eslint + prettier)
- [ ] Privacy manifest force-added: `git add -f weave-mobile/ios/PrivacyInfo.xcprivacy`
- [ ] Database migration applied in Supabase Dashboard
- [ ] Create PR to `main`
- [ ] Update sprint-status.yaml to mark story as "completed"

---

## Integration Summary

### How New Pieces Connect to Existing Infrastructure

**1. IAP → TieredRateLimiter:**
- `subscription_router.py` updates `user_profiles.subscription_tier`
- Existing `TieredRateLimiter` (Story 6.1) reads this column
- Rate limit automatically increases: 500 → 5000 messages/month

**2. useNotifications Hook → notificationService:**
- New `useNotifications.ts` wraps existing `notificationService.ts` (Story 6.1)
- Makes one-line integration instead of manual function calls
- Does NOT replace or modify the service

**3. GDPR Endpoints → Existing Tables:**
- `account_router.py` reads from existing tables
- No new tables created - uses existing data model

**4. Privacy Manifest → Existing SDKs:**
- Documents existing SDK usage (Sentry, Supabase, Expo, PostHog)
- Does NOT add new SDKs

**5. EAS Build → Sentry:**
- Production build uploads source maps to existing Sentry project
- Uses existing configuration

---

**Created:** 2025-12-23
**Branch:** `prod/9.4` → `main`
**Status:** Ready for commit execution
