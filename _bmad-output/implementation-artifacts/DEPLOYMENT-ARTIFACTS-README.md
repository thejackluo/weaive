# Story 9.4: Deployment Artifacts

This directory contains artifacts needed for production deployment.

---

## Files in This Directory

### 1. apple-app-site-association
**Purpose:** Apple App Site Association (AASA) file for Universal Links

**What it is:**
- JSON file that tells iOS which URLs your app should handle
- Required for deep linking (Universal Links)

**What it does:**
- Maps URL patterns to your app
- Enables opening app from web links
- Supports web credentials (AutoFill passwords)

**Supported Paths:**
- `/goals/*` → Goals screen
- `/binds/*` → Bind detail screen
- `/journal/*` → Journal screen
- `/ai-chat` → AI chat screen
- `/settings/*` → Settings screens
- `/subscription` → Subscription screen

**Where this file goes:**
1. **Production Hosting:** `https://weavelight.app/.well-known/apple-app-site-association`
   - Must be accessible at this exact URL (no file extension)
   - Must be served with `Content-Type: application/json`
   - Must have valid SSL certificate (HTTPS required)

2. **Before hosting:**
   - Replace `TEAM_ID` with your Apple Team ID (found in Apple Developer Portal → Membership)
   - Example: `TEAM_ID.com.weavelight.app` → `A1B2C3D4E5.com.weavelight.app`

**How to host:**
- If using static hosting (Vercel, Netlify, etc.), place in `public/.well-known/` directory
- If using custom server, configure route to serve this file at `/.well-known/apple-app-site-association`
- Test with: `curl https://weavelight.app/.well-known/apple-app-site-association`

**See also:** `docs/production/story-9.4-deep-linking.md` for detailed setup guide

---

### 2. story-9.4-subscription-migration.sql
**Purpose:** Database migration for subscription tracking

**What it does:**
```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_product_id TEXT;

CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_expires
ON user_profiles(subscription_expires_at)
WHERE subscription_tier = 'pro';
```

**Where this goes:**
- Apply in Supabase Dashboard → SQL Editor
- Run once before deploying IAP features to production

**Why these columns:**
- `subscription_expires_at` - Track when Pro subscription expires
- `subscription_product_id` - Track which product was purchased (monthly vs annual)
- Index on `expires_at` - Optimize queries checking for expired subscriptions

**Existing columns (NOT modified):**
- `subscription_tier` - Already exists from Story 6.1 (free/pro/admin)
- Used by TieredRateLimiter to enforce rate limits

---

### 3. story-9.4-COMPLETE-REFERENCE.md
**Purpose:** All-in-one implementation reference

**Contains:**
- What already existed vs. what's new
- Complete commit strategy (5 commits with messages)
- Detailed file-by-file breakdown
- Testing commands
- Manual steps checklist

**Use this:** As your primary reference while reviewing Story 9.4 changes

---

## Deployment Checklist

Before deploying to production:

1. **Database:**
   - [ ] Apply `story-9.4-subscription-migration.sql` in Supabase Dashboard
   - [ ] Verify columns exist: `subscription_expires_at`, `subscription_product_id`

2. **Deep Linking:**
   - [ ] Replace `TEAM_ID` in `apple-app-site-association` with actual Apple Team ID
   - [ ] Host file at `https://weavelight.app/.well-known/apple-app-site-association`
   - [ ] Verify accessible: `curl https://weavelight.app/.well-known/apple-app-site-association`
   - [ ] Verify SSL certificate valid

3. **App Store Connect:**
   - [ ] Create 3 IAP products (trial, monthly, annual)
   - [ ] Generate APNs production certificate
   - [ ] Upload certificate to Expo

4. **Environment Variables:**
   - [ ] Add to Railway: `APPLE_SHARED_SECRET`, `APPLE_TEAM_ID`, `IAP_SANDBOX=false`

5. **Build & Submit:**
   - [ ] Update `eas.json` with Apple IDs
   - [ ] Add EAS secrets: `SENTRY_AUTH_TOKEN`, `EXPO_APPLE_APP_SPECIFIC_PASSWORD`
   - [ ] Build production IPA: `eas build --profile production --platform ios`
   - [ ] Submit to TestFlight: `eas submit --profile production --platform ios --latest`

---

## Documentation

**Production guides:** `docs/production/`
- `story-9.4-apns-setup.md` - APNs certificate generation
- `story-9.4-deep-linking.md` - Universal Links setup (detailed AASA guide)
- `story-9.4-production-build.md` - EAS Build and TestFlight
- `story-9.4-railway-verification.md` - Deployment verification
- `story-9.4-sentry-verification.md` - Error tracking verification
- `story-9.4-implementation-summary.md` - Executive summary of all 13 ACs

---

**Created:** 2025-12-23
**Story:** 9.4 (App Store Readiness)
