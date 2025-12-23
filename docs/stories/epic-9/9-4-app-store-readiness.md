# Story 9.4: App Store Readiness - Critical Gaps

**Epic:** Epic 9 - Production Launch & App Store Publishing
**Priority:** M (Must Have) - **BLOCKS LAUNCH**
**Estimate:** 13 story points
**Status:** Ready for Development
**Created:** 2025-12-23 (Sprint Change Proposal)

---

## Background

Following comprehensive technical research on App Store deployment readiness (2025-12-23), **10 critical blockers** were identified that prevent Weave from being submitted to the App Store. The app is currently **60% ready** for submission. This story addresses all critical gaps to enable TestFlight beta testing and eventual App Store submission.

**Research Document:** `_bmad-output/analysis/research/technical-app-store-deployment-readiness-research-2025-12-23.md`
**Sprint Change Proposal:** `_bmad-output/sprint-change-proposal-2025-12-23.md`

---

## User Story

**As a** product manager
**I want to** fix all critical App Store deployment gaps identified in technical research
**So that** Weave can be submitted to the App Store without immediate rejection

---

## Acceptance Criteria

### 1. iOS Configuration (app.json)

**1.1 Add iOS Permission Descriptions**

- [ ] Add `NSCameraUsageDescription` to `weave-mobile/app.json`:
  ```json
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "Weave needs camera access to capture proof photos of your daily achievements and bind completions."
    }
  }
  ```
- [ ] Add `NSPhotoLibraryUsageDescription`:
  ```json
  "NSPhotoLibraryUsageDescription": "Weave needs photo library access to save proof captures and attach images to your journal entries."
  ```
- [ ] Add `NSPhotoLibraryAddUsageDescription`:
  ```json
  "NSPhotoLibraryAddUsageDescription": "Weave saves proof photos to your photo library so you can keep a permanent record of your progress."
  ```
- [ ] Add `NSMicrophoneUsageDescription`:
  ```json
  "NSMicrophoneUsageDescription": "Weave uses your microphone to record voice reflections for your daily journal entries."
  ```

**Why Critical:** App will be **immediately rejected** (99% probability) without these descriptions. Apple requires user-facing justifications for all sensitive permissions.

**1.2 Add Privacy Manifest (iOS 17+ Requirement)**

- [ ] Add privacy manifest to `weave-mobile/app.json`:
  ```json
  "ios": {
    "privacyManifests": {
      "NSPrivacyAccessedAPITypes": [
        {
          "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryFileTimestamp",
          "NSPrivacyAccessedAPITypeReasons": ["C617.1"]
        },
        {
          "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategorySystemBootTime",
          "NSPrivacyAccessedAPITypeReasons": ["35F9.1"]
        },
        {
          "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
          "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
        }
      ]
    }
  }
  ```

**Why Critical:** Required as of Spring 2024 for iOS 17+ submissions. Missing this can cause rejection or delayed review (70% risk).

**Testing:**
- [ ] Build app with updated `app.json`: `eas build --platform ios --profile production`
- [ ] Verify permission dialogs show correct descriptions on iOS device
- [ ] Verify no privacy manifest warnings in App Store Connect

---

### 2. Backend: GDPR Compliance Endpoints

**2.1 Implement Data Export Endpoint**

- [ ] Create route: `GET /api/user/export-data` in `weave-api/app/api/user_router.py`
- [ ] Endpoint returns JSON file with ALL user data:
  ```json
  {
    "user": {
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2025-01-01T00:00:00Z"
    },
    "goals": [...],
    "subtasks": [...],
    "completions": [...],
    "journal_entries": [...],
    "identity_document": {...},
    "ai_chat_history": [...],
    "proof_photos": [
      "https://supabase.co/storage/v1/object/public/captures/user123/photo1.jpg?signed=..."
    ]
  }
  ```
- [ ] Include signed Supabase Storage URLs for proof photos (1-hour expiry)
- [ ] Use Pydantic response model: `UserDataExportResponse`
- [ ] Add authentication middleware (JWT required)
- [ ] Response format: `{"data": {...}, "meta": {"timestamp": "2025-12-23T10:00:00Z"}}`

**2.2 Implement Account Deletion Endpoint**

- [ ] Create route: `DELETE /api/user/account` in `weave-api/app/api/user_router.py`
- [ ] Soft delete implementation:
  ```python
  # Set deleted_at timestamp
  UPDATE user_profiles SET deleted_at = NOW() WHERE id = current_user_id;
  ```
- [ ] 30-day retention period (allow accidental recovery by logging in again)
- [ ] Schedule hard delete after 30 days:
  - Option 1: Database trigger (runs daily, checks for deleted_at > 30 days ago)
  - Option 2: Cron job (Python script with Railway cron)
- [ ] Hard delete cascades across 12 user-owned tables:
  ```sql
  DELETE FROM ai_runs WHERE user_id = ?;
  DELETE FROM ai_artifacts WHERE user_id = ?;
  DELETE FROM triad_tasks WHERE user_id = ?;
  DELETE FROM daily_aggregates WHERE user_id = ?;
  DELETE FROM journal_entries WHERE user_id = ?;
  DELETE FROM captures WHERE user_id = ?;
  DELETE FROM subtask_completions WHERE user_id = ?;
  DELETE FROM subtask_instances WHERE user_id = ?;
  DELETE FROM subtask_templates WHERE user_id = ?;
  DELETE FROM goals WHERE user_id = ?;
  DELETE FROM identity_docs WHERE user_id = ?;
  DELETE FROM user_profiles WHERE id = ?;
  ```
- [ ] Delete files from Supabase Storage (bucket: `captures`, owner: user_id)
- [ ] Logout user immediately after soft delete (invalidate JWT)
- [ ] Return response: `{"data": {"message": "Account deletion scheduled. You have 30 days to recover by logging in."}, "meta": {...}}`

**2.3 Configure Sentry PII Scrubbing**

- [ ] Update `weave-mobile/app/_layout.tsx` with Sentry initialization:
  ```typescript
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    beforeSend(event) {
      // Remove PII from error reports
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      // Scrub sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
          if (breadcrumb.data) {
            delete breadcrumb.data.email;
            delete breadcrumb.data.password;
          }
          return breadcrumb;
        });
      }
      return event;
    }
  });
  ```
- [ ] Test Sentry integration: Trigger error, verify email NOT in Sentry dashboard

**Why Critical:** Privacy policy promises data export and deletion (GDPR). Without implementation, this creates **legal liability** and 60% rejection risk.

**Backend Testing:**
- [ ] Test data export with user containing: goals, completions, journal entries, proof photos
- [ ] Verify export JSON is complete and well-formatted
- [ ] Test account deletion soft-deletes user
- [ ] Test user cannot login after soft delete
- [ ] Test account recovery by logging in within 30 days
- [ ] Test hard delete after 30 days (manual trigger in dev)

---

### 3. Frontend: Settings Screen Updates

**3.1 Add "Export My Data" Button**

- [ ] Add button to Settings → Data & Privacy section (create section if doesn't exist)
- [ ] Button label: "Export My Data"
- [ ] Button description: "Download a copy of all your Weave data (goals, journal entries, photos)"
- [ ] On press:
  - Show loading state: "Preparing your data export..."
  - Call `GET /api/user/export-data`
  - Download JSON file to device (use Expo FileSystem)
  - Success message: "Data exported successfully! Check your Downloads folder."
  - Error handling: "Export failed. Please try again or contact support@weavelight.com"

**3.2 Add "Delete Account" Button**

- [ ] Add button to Settings → Account section
- [ ] Button label: "Delete Account"
- [ ] Button style: Red/destructive (use design system `Button` variant="destructive")
- [ ] On press:
  - Show confirmation dialog:
    ```
    Title: "Delete Your Account?"
    Message: "This will permanently delete all your goals, journal entries, and progress. You have 30 days to recover by logging in again."
    Actions: [Cancel] [Delete Account]
    ```
  - If confirmed, show password re-entry screen (security best practice)
  - Call `DELETE /api/user/account` after password verified
  - Logout user immediately (clear JWT, navigate to login)
  - Show toast: "Account deletion scheduled. You have 30 days to recover by logging in."

**3.3 Add LogRocket Consent Toggle**

- [ ] Add toggle to Settings → Privacy section
- [ ] Toggle label: "Allow Session Recording"
- [ ] Toggle description: "Helps us debug issues by recording your screen. You can disable this anytime."
- [ ] Default state: OFF (opt-in required)
- [ ] On toggle enable:
  - Initialize LogRocket: `LogRocket.init('weave/production')`
  - Identify user: `LogRocket.identify(userId, {name, email})`
  - Save preference: Update `user_profiles.logrocket_consent = true`
- [ ] On toggle disable:
  - Stop LogRocket session (if possible, or flag for next session)
  - Save preference: Update `user_profiles.logrocket_consent = false`

**Database Migration for LogRocket Consent:**
```sql
ALTER TABLE user_profiles ADD COLUMN logrocket_consent BOOLEAN DEFAULT false;
```

**Frontend Testing:**
- [ ] Export Data downloads correct JSON file
- [ ] Delete Account shows confirmation dialog
- [ ] Delete Account requires password re-entry
- [ ] Delete Account soft-deletes user and logs out
- [ ] LogRocket toggle enables/disables session recording
- [ ] All UI elements follow design system (Button, Text, Dialog components)

---

### 4. Legal & Compliance

**4.1 Publish Privacy Policy to Public URL**

- [ ] Convert `weave-mobile/app/(auth)/privacy-policy.tsx` React Native component to static HTML
- [ ] Create `docs/legal/privacy.html` (or use Markdown: `privacy.md`)
- [ ] Host on public URL (choose one option):
  - **Option 1 (Recommended):** GitHub Pages (`weavelight.github.io/weave/privacy`)
  - **Option 2:** Vercel/Netlify static site (`weavelight.app/privacy`)
  - **Option 3:** Railway static file endpoint (`weave-api.railway.app/privacy`)
- [ ] Verify URL is publicly accessible (test in incognito mode)
- [ ] Update `weave-mobile/app.json` with privacy policy URL:
  ```json
  "ios": {
    "config": {
      "usesNonExemptEncryption": false
    },
    "privacyPolicyUrl": "https://weavelight.app/privacy"
  }
  ```

**4.2 Publish Terms of Service to Public URL**

- [ ] Draft Terms of Service (use Story 9.3 for content guidance)
- [ ] Legal review: Use LegalZoom template ($300) or attorney review ($500-800)
- [ ] Must include:
  - User eligibility (age 13+)
  - Acceptable use policy
  - AI liability disclaimers ("AI-generated content accuracy not guaranteed")
  - Intellectual property rights (user owns their data, Weave owns app)
  - Dispute resolution and arbitration
  - Subscription terms (free trial, billing, cancellation)
  - Termination conditions
  - Last updated date
- [ ] Publish to public URL: `weavelight.app/terms` (same hosting as privacy policy)
- [ ] Verify URL is publicly accessible

**4.3 Add Legal Links to App**

- [ ] Settings → Legal section:
  - Privacy Policy link (opens in-app browser: `expo-web-browser`)
  - Terms of Service link (opens in-app browser)
- [ ] Signup flow (`weave-mobile/app/(auth)/signup.tsx`):
  - Add checkbox (required): "I agree to the [Terms of Service] and [Privacy Policy]"
  - Links open in modal or in-app browser
  - Cannot signup unless checkbox checked

**Testing:**
- [ ] Privacy policy URL loads correctly in browser
- [ ] Terms of Service URL loads correctly in browser
- [ ] Settings → Legal links open correct URLs
- [ ] Signup flow enforces ToS/privacy policy acceptance

---

### 5. App Store Assets

**5.1 Create App Store Screenshots**

- [ ] Create 6 screenshots for 6.7" iPhone (1290x2796px):
  1. **Welcome Screen** - "Turn vague goals into daily wins in 10 days"
  2. **Goal Creation** - Show AI goal breakdown interface
  3. **Daily Thread** - Main home screen with today's binds
  4. **Journal Entry** - Reflection flow with fulfillment score slider
  5. **Progress Dashboard** - Consistency heatmap + fulfillment chart
  6. **AI Coach** - Dream Self chat conversation
- [ ] Create 6 screenshots for 5.5" iPhone (1242x2208px) - Same content, different resolution
- [ ] Use real app UI (capture from iOS simulator, NOT mockups)
- [ ] Add captions/annotations if needed (use Figma or Photoshop)
- [ ] Export as PNG files (App Store Connect requirement)
- [ ] Save to `weave-mobile/assets/app-store-screenshots/` directory

**Screenshot Guidelines:**
- Show actual app functionality (no fake data or lorem ipsum)
- Use consistent branding (colors, fonts match app theme)
- Status bar: Show 9:41 AM, full battery, full signal (Apple standard)
- No transparent or rounded corners (full-bleed images)
- Order matters: Most compelling screenshot first (users see first 3 in search)

**5.2 Verify App Icon**

- [ ] Check dimensions of `weave-mobile/assets/icon.png`:
  - Required: 1024x1024px PNG
  - No transparency (App Store requirement)
  - No rounded corners (iOS adds automatically)
- [ ] If dimensions incorrect or icon quality poor:
  - Redesign icon using Figma
  - OR hire Fiverr designer ($50-100 for 24-hour turnaround)
- [ ] Test icon on multiple device sizes (iPhone simulator: 180x180, 120x120, 60x60)
- [ ] Verify icon is recognizable at small sizes (60x60px)

**5.3 Write App Metadata**

- [ ] **App Description** (4000 chars max):
  ```
  Turn Vague Goals Into Daily Wins, Proof, and a Stronger Identity in 10 Days

  Weave helps ambitious but chaotic builders transform vague aspirations into consistent daily actions. Using AI-powered goal breakdown and personalized coaching, Weave turns "I want to be healthier" into concrete daily habits you'll actually complete.

  KEY FEATURES:

  🎯 AI Goal Breakdown
  Tell Weave your goal, and our AI breaks it down into consistent daily "binds" (small, achievable actions). No more overwhelming to-do lists.

  📸 Proof & Progress Tracking
  Complete your daily binds and capture quick proof (photo, note, or voice). Weave tracks your consistency with a beautiful heatmap and fulfillment score.

  ✍️ Daily Journaling & Reflection
  End each day with a guided journal prompt. Reflect on what worked, what didn't, and how you felt. Weave AI provides personalized insights based on your progress.

  🤖 AI Coach (Dream Self)
  Chat with your personalized AI coach that knows your goals, identity, and motivations. Get unstuck, stay accountable, and receive tailored advice based on your unique journey.

  📊 Progress Visualization
  Watch your consistency grow with heat maps, fulfillment charts, and the Weave character (your evolved identity). See patterns in your behavior and celebrate wins.

  WHY WEAVE WORKS:

  Most productivity apps give you a blank canvas and say "good luck." Weave is different. We combine AI-powered planning with daily accountability and proof-based tracking. You're not just writing down goals—you're building evidence of your transformation.

  In 10 days, you'll have:
  - Clear, actionable daily habits (AI-generated)
  - Proof of 10 days of consistent action (photos, notes)
  - A stronger sense of identity (your "Thread" → "Weave")
  - Data-driven insights from AI coaching

  WHO IS WEAVE FOR?

  Ambitious students, founders, and creators who have high intent but struggle with consistent execution. If you've ever said "I want to build this" but never followed through, Weave is for you.

  START YOUR 10-DAY TRANSFORMATION TODAY:
  Download Weave, set one goal, and complete your first bind. Join thousands of builders turning vague goals into daily wins.

  ---
  Free 10-day trial. No credit card required.
  Questions? support@weavelight.com
  ```

- [ ] **Subtitle** (30 chars max):
  - Recommended: "10-day goal transformation"
  - Alternative: "Goals → Daily wins"

- [ ] **Keywords** (100 chars max):
  - Recommended: "goals,habits,productivity,ai,coaching,journal,tracker,motivation,self-improvement"
  - Research competitors before finalizing: Streaks, Habitica, Way of Life, Fabulous

- [ ] **Promotional Text** (170 chars max):
  - Recommended: "Launch today with 10-day free trial. Turn vague goals into daily wins with AI-powered coaching. Join thousands of builders transforming their lives."

**Testing:**
- [ ] Description is under 4000 characters
- [ ] Subtitle is under 30 characters
- [ ] Keywords are under 100 characters (including commas)
- [ ] Promotional text is under 170 characters
- [ ] All text is clear, compelling, and accurately represents app features

---

### 6. Apple Developer & App Store Connect

**6.1 Create Apple Developer Account**

- [ ] Sign up at https://developer.apple.com/programs/enroll/
- [ ] Pay $99/year enrollment fee (credit card required)
- [ ] Complete identity verification (upload government ID if requested)
- [ ] Accept Apple Developer Program License Agreement
- [ ] Wait 1-2 days for account approval
- [ ] Document Apple ID email (needed for `eas.json`)

**6.2 Create App Store Connect App Record**

- [ ] Login to https://appstoreconnect.apple.com/
- [ ] Click "My Apps" → "+" → "New App"
- [ ] Fill out app information:
  - **Platforms:** iOS
  - **Name:** Weave
  - **Primary Language:** English (U.S.)
  - **Bundle ID:** com.weavelight.app (must match `app.json`)
  - **SKU:** weave-ios-001 (internal identifier, any unique string)
  - **User Access:** Full Access
- [ ] Create app record (cannot be deleted once created)
- [ ] Note the **App ID** (10-digit number) for `eas.json`

**6.3 Upload Screenshots and Metadata to App Store Connect**

- [ ] Navigate to app record → App Store → iOS App → App Store Localizations → English
- [ ] Upload 6 screenshots for 6.7" iPhone
- [ ] Upload 6 screenshots for 5.5" iPhone
- [ ] Upload app icon (1024x1024px PNG)
- [ ] Fill out metadata fields:
  - Name: Weave
  - Subtitle: 10-day goal transformation
  - Privacy Policy URL: https://weavelight.app/privacy
  - Description: (paste 4000-char description from 5.3)
  - Promotional Text: (paste 170-char promo from 5.3)
  - Keywords: (paste 100-char keywords from 5.3)
- [ ] Select primary category: Productivity
- [ ] Select secondary category (optional): Health & Fitness
- [ ] Set age rating: 12+ (user-generated content)
- [ ] Fill out Privacy Nutrition Label questionnaire:
  - Data Types Collected: Email, Name, Photos, Audio, User Content
  - Data Usage: App Functionality, Analytics, Product Personalization
  - Third-Party Sharing: OpenAI, Anthropic, Supabase, Sentry, LogRocket

**6.4 Configure eas.json Submit Profile**

- [ ] Update `weave-mobile/eas.json`:
  ```json
  "submit": {
    "production": {
      "ios": {
        "appleId": "jack@weavelight.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345"
      }
    }
  }
  ```
- [ ] Get `appleId` from Apple Developer account (email used to create account)
- [ ] Get `ascAppId` from App Store Connect (10-digit App ID)
- [ ] Get `appleTeamId` from Apple Developer Membership page (10-character alphanumeric)

**Testing:**
- [ ] Verify App Store Connect app record is created and active
- [ ] Verify all metadata fields are filled out
- [ ] Verify screenshots render correctly in preview
- [ ] Verify privacy nutrition label is complete
- [ ] Test `eas submit --platform ios` (dry run mode if available)

---

## Technical Notes

### GDPR Compliance Implementation

**Data Export Format:**
The JSON export must include ALL user data for GDPR compliance:
- User profile (email, name, created_at)
- All goals and subtasks
- All completions (bind history)
- All journal entries
- Identity document (Thread)
- AI chat history (Dream Self conversations)
- Proof photos (Supabase Storage signed URLs)

**Account Deletion Cascade:**
Foreign key constraints handle cascade delete automatically if configured:
```sql
ALTER TABLE goals ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
```

If foreign keys not configured with ON DELETE CASCADE, delete manually in correct order (children first, parent last).

**Soft Delete Recovery:**
If user logs in within 30 days after soft delete:
```python
# Check if user is soft-deleted
if user.deleted_at:
    if (now - user.deleted_at) < 30 days:
        # Allow recovery
        user.deleted_at = None
        return "Welcome back! Your account has been recovered."
    else:
        # Too late, account already hard-deleted
        return "Account not found."
```

### iOS Privacy Manifest Reason Codes

**C617.1 - File Timestamp Access:**
- Reason: "Accessing file modification timestamps to display 'last updated' information to user"
- Used by: React Native file system, Expo image picker

**35F9.1 - System Boot Time:**
- Reason: "Measuring time intervals for analytics and performance monitoring"
- Used by: Sentry, analytics libraries

**CA92.1 - User Defaults:**
- Reason: "Storing app settings and user preferences"
- Used by: AsyncStorage, Expo SecureStore, app state persistence

**Source:** https://developer.apple.com/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api

### Screenshot Design Best Practices

**Status Bar:**
- Time: 9:41 AM (Apple's iconic time)
- Battery: 100% (full)
- Signal: Full bars
- Wi-Fi: Connected

**Device Frames:**
- Do NOT include device frames (show full-bleed UI)
- App Store Connect adds device frames automatically

**Text Overlays (Optional):**
- Add captions to explain features: "AI breaks down your goals into daily actions"
- Use app's brand colors and fonts
- Keep text minimal (let UI speak for itself)

**Ordering Strategy:**
1. **First screenshot (most important):** Welcome screen showing value prop
2. **Screenshots 2-4:** Core features (goal creation, daily binds, journal)
3. **Screenshots 5-6:** Differentiators (progress viz, AI coach)

### Cost Optimization Strategies

**Reduce Monthly Costs:**
1. **Defer LogRocket** until post-launch (saves $99/month)
   - Use Sentry free tier for error tracking initially
   - Add LogRocket only if critical UX bugs emerge that need session replay
2. **Start with Sentry free tier** (saves $26/month)
   - 5K errors/month sufficient for 0-200 users
   - Upgrade to Team plan ($26/month) only when free tier exceeded
3. **Monitor AI spend daily** (potential $500+ spike risk)
   - Set budget alerts at $100/day ($3,000/month cap)
   - Review AI call patterns weekly
   - Tighten rate limiting if costs exceed $250/month @ 100 users

**Reduce One-Time Costs:**
1. **Use LegalZoom templates** instead of attorney (saves $200-700)
   - Privacy policy: Already drafted (789 lines), just needs formatting
   - ToS: Use LegalZoom template ($300) instead of custom attorney ($500-800)
2. **Create screenshots in-house** (saves $300-500)
   - Use iPhone simulator + Figma for captions
   - Total time: 4 hours (designer or PM)
3. **Verify icon in-house** (saves $100-200)
   - Use ImageMagick or online tool to check dimensions
   - Only hire designer if redesign needed

**Minimum Cost Scenario:** $400 total one-time + $278/month recurring
- Apple Developer: $99
- LegalZoom ToS template: $300
- DIY screenshots: $0
- DIY icon verification: $0
- Sentry free tier: $0
- LogRocket deferred: $0
- **Total: $399 one-time + $278/month**

---

## Dependencies

**Requires (Must be complete before starting Story 9.4):**
- ✅ Story 9.1 (Backend Deployment) - Complete
- ✅ Story 9.2 (Database Setup) - Complete
- ⚠️ Story 9.3 (App Store Compliance) - In progress (legal drafting in parallel)

**Unblocks (Cannot start until Story 9.4 complete):**
- 🚫 Story 9.6 (TestFlight Beta Testing) - Requires all critical gaps fixed
- 🚫 Story 9.8 (App Store Submission) - Requires complete metadata and technical compliance

**External Dependencies:**
- Legal review (1-3 days turnaround)
- Apple Developer account verification (1-2 days)
- Designer availability (if outsourcing screenshots)

---

## Effort Estimate Breakdown

| Task Category | Effort | Owner |
|---------------|--------|-------|
| **Backend Development** | 6-8 hours | Backend Dev |
| - Data export endpoint | 3 hours | |
| - Account deletion endpoint | 3 hours | |
| - Sentry PII scrubbing | 30 min | |
| - Testing | 1-2 hours | |
| **Frontend Development** | 4-5 hours | Frontend Dev |
| - Settings screen updates (3 buttons + toggle) | 2 hours | |
| - Confirmation dialogs, loading states | 1 hour | |
| - Testing | 1-2 hours | |
| **DevOps/Configuration** | 2-3 hours | DevOps / Dev |
| - app.json updates | 30 min | |
| - eas.json submit profile | 30 min | |
| - Publish legal docs (GitHub Pages/Vercel) | 1-2 hours | |
| **Design/Content** | 6-8 hours | Designer / PM |
| - Create 12 screenshots | 4 hours | |
| - Verify/redesign app icon | 30 min - 2 hours | |
| - Write app description, subtitle, keywords | 2 hours | |
| **Apple Developer Setup** | 2-3 hours | PM |
| - Create Apple Developer account | 1 hour (+ wait) | |
| - Create App Store Connect app record | 1 hour | |
| - Upload metadata and screenshots | 1 hour | |
| **Legal Review** | External | Legal Counsel |
| - Review privacy policy | 1-2 hours | |
| - Draft Terms of Service | 2-4 hours | |

**Total: 20-27 hours** (13 story points @ 1.5-2 hours/point)

**Parallelization Potential:**
- Backend work (6-8 hrs) can run parallel with Frontend work (4-5 hrs)
- DevOps (2-3 hrs) can run parallel with Design (6-8 hrs)
- Legal review (external) can run parallel with all technical work
- **Actual calendar time: 2-3 days** with parallel execution by multiple team members

---

## Definition of Done

**Code Complete:**
- [ ] All acceptance criteria checked off (18 total)
- [ ] Code reviewed by senior dev
- [ ] Code merged to `main` branch
- [ ] No merge conflicts or build errors

**Technical Validation:**
- [ ] iOS permissions show correct descriptions on device
- [ ] Privacy manifest no warnings in App Store Connect
- [ ] Data export returns complete JSON for test users
- [ ] Account deletion soft-deletes and schedules hard delete
- [ ] Sentry PII scrubbing verified (no email in error logs)
- [ ] Settings screen UI matches design system

**Legal & Compliance:**
- [ ] Privacy policy publicly accessible at weavelight.app/privacy
- [ ] Terms of Service publicly accessible at weavelight.app/terms
- [ ] Legal review complete (attorney or LegalZoom)
- [ ] Links work from app settings and signup flow

**App Store Assets:**
- [ ] 12 screenshots created and saved
- [ ] App icon verified as 1024x1024px PNG (or redesigned)
- [ ] App metadata written (description, subtitle, keywords, promo)
- [ ] All assets uploaded to App Store Connect

**Apple Developer:**
- [ ] Apple Developer account created and active
- [ ] App Store Connect app record created
- [ ] eas.json configured with Apple IDs

**Testing:**
- [ ] Manual testing checklist 100% passed
- [ ] No critical bugs found during testing
- [ ] All user flows work end-to-end (export data, delete account)

**Documentation:**
- [ ] Story 9.4 marked as Complete in project tracker
- [ ] Implementation notes documented in sprint artifacts
- [ ] Handoff to Story 9.6 (TestFlight) confirmed

---

## Testing Checklist

### GDPR Endpoints Testing

**Data Export:**
- [ ] Create test user with full data (3 goals, 10 completions, 5 journal entries, 3 proof photos)
- [ ] Call `GET /api/user/export-data`
- [ ] Verify JSON contains all goals
- [ ] Verify JSON contains all completions
- [ ] Verify JSON contains all journal entries
- [ ] Verify JSON contains identity document
- [ ] Verify proof photo URLs are present and valid
- [ ] Download a proof photo URL → Verify image loads
- [ ] Verify export JSON is well-formatted (no errors in JSON validator)

**Account Deletion:**
- [ ] Delete test user account via `DELETE /api/user/account`
- [ ] Verify `user_profiles.deleted_at` is set to current timestamp
- [ ] Verify user is logged out immediately
- [ ] Try to login with deleted user → Should fail
- [ ] Recover account by logging in within 30 days → Should restore (set `deleted_at = NULL`)
- [ ] Trigger hard delete (manual or scheduled job) → Verify all user data removed from database
- [ ] Verify cascade delete worked (no orphaned records in child tables)
- [ ] Verify Supabase Storage files deleted (check `storage.objects` table)

### iOS Permissions Testing

**Camera Permission:**
- [ ] Open camera for proof photo capture
- [ ] Verify permission dialog appears with correct description: "Weave needs camera access to capture proof photos of your daily achievements and bind completions."
- [ ] Accept permission → Camera opens
- [ ] Deny permission → App shows graceful error: "Camera access required to capture proof photos. Enable in Settings → Weave → Camera."

**Photo Library Permission:**
- [ ] Save photo to library
- [ ] Verify permission dialog appears with correct descriptions (NSPhotoLibraryUsageDescription and NSPhotoLibraryAddUsageDescription)
- [ ] Accept permission → Photo saves successfully
- [ ] Deny permission → App shows error

**Microphone Permission:**
- [ ] Record voice journal entry
- [ ] Verify permission dialog appears with correct description: "Weave uses your microphone to record voice reflections for your daily journal entries."
- [ ] Accept permission → Recording starts
- [ ] Deny permission → App shows error

### Privacy Manifest Testing

- [ ] Build app with privacy manifest: `eas build --platform ios --profile production`
- [ ] Upload to TestFlight
- [ ] Check App Store Connect for any privacy manifest warnings
- [ ] Verify no "Missing Privacy Manifest" errors

### Settings Screen UI Testing

**Export My Data:**
- [ ] Navigate to Settings → Data & Privacy
- [ ] Tap "Export My Data" button
- [ ] Verify loading state appears: "Preparing your data export..."
- [ ] Verify JSON file downloads to device
- [ ] Verify success message displays
- [ ] Test error handling: Disconnect internet → Tap button → Verify error message

**Delete Account:**
- [ ] Navigate to Settings → Account
- [ ] Tap "Delete Account" button
- [ ] Verify confirmation dialog appears
- [ ] Tap "Cancel" → Dialog closes, account not deleted
- [ ] Tap "Delete Account" → Password re-entry screen appears
- [ ] Enter incorrect password → Error message
- [ ] Enter correct password → Account deleted, user logged out
- [ ] Verify deletion toast appears: "Account deletion scheduled..."

**LogRocket Consent:**
- [ ] Navigate to Settings → Privacy
- [ ] Verify "Allow Session Recording" toggle is OFF by default
- [ ] Enable toggle → Verify LogRocket initializes (check LogRocket dashboard for new session)
- [ ] Disable toggle → Verify session stops recording
- [ ] Close app, reopen → Verify toggle state persists

### App Store Connect Testing

- [ ] Login to App Store Connect
- [ ] Navigate to app record
- [ ] Verify all metadata fields filled out
- [ ] Preview app page → Verify screenshots display correctly
- [ ] Verify app icon displays correctly
- [ ] Verify privacy policy URL link works
- [ ] Check for any warnings or incomplete sections

---

## Resources

**Documentation:**
- **Research Report:** `_bmad-output/analysis/research/technical-app-store-deployment-readiness-research-2025-12-23.md`
- **Sprint Change Proposal:** `_bmad-output/sprint-change-proposal-2025-12-23.md`
- **Story 9.3 (App Store Compliance):** `docs/stories/epic-9/9-3-app-store-compliance.md`
- **Epic 9 (Production Launch):** `docs/prd/epic-9-production-launch.md`
- **Compliance Checklist:** `docs/production/compliance-legal-checklist-DRAFT.md`
- **Backend Patterns Guide:** `docs/dev/backend-patterns-guide.md` (for API endpoint implementation)

**Apple Developer:**
- **App Store Review Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Privacy Manifest Files:** https://developer.apple.com/documentation/bundleresources/privacy_manifest_files
- **Screenshot Specifications:** https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications
- **App Icon HIG:** https://developer.apple.com/design/human-interface-guidelines/app-icons

**Expo/EAS:**
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **EAS Submit:** https://docs.expo.dev/submit/ios/
- **Expo Permissions:** https://docs.expo.dev/guides/permissions/

**Compliance:**
- **GDPR Right to Erasure:** https://gdpr.eu/right-to-be-forgotten/
- **CCPA Compliance:** https://oag.ca.gov/privacy/ccpa
- **Sentry PII Scrubbing:** https://docs.sentry.io/platforms/javascript/guides/react/data-management/sensitive-data/

**Legal Services:**
- **LegalZoom:** https://www.legalzoom.com/ (Privacy Policy + ToS templates, $300-500)
- **Termly:** https://termly.io/ (Privacy Policy generator, $0-150)
- **TermsFeed:** https://www.termsfeed.com/ (Free generator or $150 premium)

---

## Story 9.4 vs Story 9.3: Division of Responsibilities

To avoid confusion between Story 9.3 (App Store Compliance) and Story 9.4 (App Store Readiness - Critical Gaps), here's the clear division:

| Task | Story 9.3 | Story 9.4 | Rationale |
|------|-----------|-----------|-----------|
| **Draft privacy policy** | ✅ Story 9.3 | ❌ Not in 9.4 | Legal content creation (9.3), already done in-app |
| **Publish privacy policy to public URL** | ❌ Not in 9.3 | ✅ Story 9.4 | Technical implementation (9.4) |
| **Draft Terms of Service** | ✅ Story 9.3 | ❌ Not in 9.4 | Legal content creation (9.3) |
| **Publish ToS to public URL** | ❌ Not in 9.3 | ✅ Story 9.4 | Technical implementation (9.4) |
| **Create Apple Developer account** | ✅ Story 9.3 | ❌ Not in 9.4 | Account setup (9.3) |
| **iOS permissions in app.json** | ❌ Not in 9.3 | ✅ Story 9.4 | Critical gap found in research |
| **Privacy manifest in app.json** | ❌ Not in 9.3 | ✅ Story 9.4 | Critical gap found in research |
| **GDPR endpoints (export, delete)** | ❌ Not in 9.3 | ✅ Story 9.4 | Critical gap found in research |
| **LogRocket user consent** | ❌ Not in 9.3 | ✅ Story 9.4 | Critical gap found in research |
| **Create App Store screenshots** | ⚠️ In 9.3 (plan) | ✅ Story 9.4 (create) | 9.3 plans content, 9.4 creates assets |
| **Write app description** | ⚠️ In 9.3 (outline) | ✅ Story 9.4 (write) | 9.3 outlines, 9.4 writes final copy |
| **App Store Connect metadata** | ✅ Story 9.3 | ⚠️ Story 9.4 fills out | 9.3 creates app record, 9.4 fills metadata |

**Summary:**
- **Story 9.3:** Legal drafting, account creation, planning (8 pts)
- **Story 9.4:** Technical implementation, production assets, execution (13 pts)
- **Dependency:** 9.3 drafts → 9.4 publishes and implements
- **Both required for:** Story 9.8 (App Store Submission)

---

**Created:** 2025-12-23
**Author:** Jack Luo
**Sprint Change Proposal:** Approved
**Status:** Ready for Development
