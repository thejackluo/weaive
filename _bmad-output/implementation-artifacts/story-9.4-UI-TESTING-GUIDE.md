# Story 9.4: Manual UI Testing Guide

**Purpose:** Step-by-step guide to manually test all Story 9.4 features in the mobile app

**Branch:** `prod/9.4`
**Prerequisites:** Mobile app running on simulator or physical device

---

## Table of Contents

1. [Subscription Screen Testing](#1-subscription-screen-testing)
2. [Account Management Testing](#2-account-management-testing)
3. [Push Notifications Testing](#3-push-notifications-testing)
4. [Deep Linking Testing](#4-deep-linking-testing)
5. [Dev Tools Testing](#5-dev-tools-testing)
6. [Subscription API Testing](#6-subscription-api-testing)

---

## Setup: Start the App

```bash
cd weave-mobile
npm start
```

**Choose:**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code for physical device

**Login:** Use test account credentials to access the app

---

## 1. Subscription Screen Testing

### Access: Settings → Subscription

**Test 1.1: Current Plan Display**
- [ ] Navigate: Tap bottom navigation "Settings" → Tap "Subscription"
- [ ] Verify: Screen shows "Current Plan" card
- [ ] Verify: Plan name displays correctly (Free/Pro/Admin)
- [ ] Verify: Monthly limit shows (500 for Free, 5000 for Pro, Unlimited for Admin)
- [ ] For Pro users: Verify expiry date displays
- [ ] For Pro users: Verify product ID displays

**Expected Behavior:**
- Free tier: "Current Plan: Free" + "500 AI messages/month"
- Pro tier: "Current Plan: Pro" + "5000 AI messages/month" + expiry date
- Admin tier: "Current Plan: Admin" + "Unlimited"

---

**Test 1.2: Upgrade Cards (Free Users Only)**
- [ ] Verify: Two upgrade cards visible: "Pro Monthly" and "Pro Annual"
- [ ] Verify: Monthly shows "$9.99/month"
- [ ] Verify: Annual shows "$99.99/year" (or "$8.33/month")
- [ ] Verify: Both have "Upgrade to Pro" buttons
- [ ] Verify: Benefits listed (10x AI messages, priority support, etc.)

**Expected Behavior:**
- Cards styled with design system (Card component with primary variant)
- Buttons styled with primary variant
- Pricing clearly visible

---

**Test 1.3: Manage Subscription Button**
- [ ] Verify: "Manage Subscription" button visible at bottom
- [ ] Tap: "Manage Subscription" button
- [ ] Verify: Opens App Store subscriptions page (external link)

**Expected Behavior:**
- iOS: Opens App Store app → Subscriptions section
- Button uses secondary variant styling

---

**Test 1.4: Restore Purchases Button**
- [ ] Verify: "Restore Purchases" button visible
- [ ] Tap: "Restore Purchases" button
- [ ] Verify: Loading state appears ("Restoring...")
- [ ] Verify: Alert appears with success/failure message

**Expected Behavior:**
- If no previous purchase: Alert "No previous purchases found"
- If previous purchase exists: Alert "Subscription restored" + UI updates to show Pro tier

---

**Test 1.5: Purchase Flow (REQUIRES Physical Device + Sandbox Mode)**
- [ ] Tap: "Upgrade to Pro" (Monthly or Annual)
- [ ] Verify: Apple IAP modal appears
- [ ] Verify: Product name and price correct
- [ ] Sign in with Sandbox test account
- [ ] Complete purchase
- [ ] Verify: Loading state during verification
- [ ] Verify: Success alert appears
- [ ] Verify: UI updates to show Pro tier immediately
- [ ] Verify: Rate limit increases to 5000 messages/month

**Note:** Simulators don't support IAP - must test on physical device with Sandbox account

---

## 2. Account Management Testing

### Access: Settings → Account Management

**Test 2.1: Screen Navigation**
- [ ] Navigate: Tap "Settings" → Tap "Account Management"
- [ ] Verify: Screen loads with title "Account Management"
- [ ] Verify: Two main sections visible: "Export Data" and "Delete Account"
- [ ] Verify: GDPR compliance notice visible at bottom

---

**Test 2.2: Export Data**
- [ ] Locate: "Export Data" section
- [ ] Verify: Explanation text visible ("Download all your data...")
- [ ] Tap: "Export Data" button
- [ ] Verify: Loading state appears ("Exporting...")
- [ ] Verify: Alert appears with export URL

**Expected Behavior:**
- Alert title: "Export Ready"
- Alert message: "Your data export is ready at: [URL]"
- Button: "Open" (opens URL) and "Cancel"

**Current Limitation:** URL is placeholder (production: will upload to Supabase Storage)

---

**Test 2.3: Delete Account (First Confirmation)**
- [ ] Locate: "Delete Account" section
- [ ] Verify: Warning text visible (red/destructive styling)
- [ ] Tap: "Delete Account" button
- [ ] Verify: First confirmation alert appears
- [ ] Verify: Alert title: "Delete Account?"
- [ ] Verify: Alert message: "This action cannot be undone..."
- [ ] Verify: Two buttons: "Cancel" and "Continue"

**Expected Behavior:**
- Alert uses destructive styling (red)
- Tapping "Cancel" dismisses alert
- Tapping "Continue" proceeds to second confirmation

---

**Test 2.4: Delete Account (Second Confirmation)**
- [ ] Continue from Test 2.3 (tap "Continue")
- [ ] Verify: Prompt appears: "Type DELETE (all caps) to confirm:"
- [ ] Type: "delete" (lowercase)
- [ ] Verify: Error message or disabled button
- [ ] Type: "DELETE" (all caps)
- [ ] Tap: "Delete Account" button
- [ ] Verify: Loading state appears
- [ ] Verify: Success alert OR error alert
- [ ] If success: Verify redirect to login screen

**Expected Behavior:**
- Only "DELETE" (exact match) allows deletion
- Deletes all user data across 11 tables
- Logs out user
- Redirects to login/welcome screen

**Known Limitation:** Doesn't delete Supabase Auth user (requires admin privileges - Story 9.5)

---

**Test 2.5: GDPR Notice**
- [ ] Scroll to bottom of Account Management screen
- [ ] Verify: GDPR compliance notice visible
- [ ] Verify: Mentions "GDPR Article 17 (Right to Erasure)"
- [ ] Verify: Mentions "GDPR Article 20 (Data Portability)"

---

## 3. Push Notifications Testing

### Access: Settings → Dev Tools → Story 9.4 Testing

**Test 3.1: Test Notification Button**
- [ ] Navigate: Settings → Dev Tools
- [ ] Scroll to: "Story 9.4 Testing" card
- [ ] Tap: "🔔 Test Push Notification" button
- [ ] Verify: Button shows loading state ("Sending...")
- [ ] Verify: Alert appears: "Notification Sent!"
- [ ] Verify: Notification appears in notification center (pull down from top)
- [ ] Verify: Notification title: "🧪 Test Notification"
- [ ] Verify: Notification body: "This is a test notification from Weave Dev Tools"

**Expected Behavior:**
- Notification appears immediately (local notification)
- Has sound
- Can swipe to dismiss

---

**Test 3.2: Tap Notification to Open App**
- [ ] From Test 3.1, swipe down notification center
- [ ] Tap: The test notification
- [ ] Verify: App opens (if closed) or foregrounds (if backgrounded)
- [ ] Verify: Navigates to correct screen (if data.screen specified)

**Expected Behavior:**
- App handles notification tap correctly
- No crashes or errors

---

**Test 3.3: Notification Permissions**
- [ ] First run: Verify permission prompt appears
- [ ] Grant permissions
- [ ] Verify: Test notification works
- [ ] Deny permissions: Go to Settings → Notifications → Weave → Toggle off
- [ ] Try test notification again
- [ ] Verify: Alert appears: "Check notification permissions in Settings"

---

## 4. Deep Linking Testing

### Prerequisite: AASA file hosted at weavelight.app

**Test 4.1: Universal Links (from Safari)**
- [ ] Open Safari on iOS device
- [ ] Type URL: `https://weavelight.app/goals`
- [ ] Verify: Banner appears at top: "Open in Weave"
- [ ] Tap: Banner
- [ ] Verify: App opens and navigates to Goals screen

**Test other URLs:**
- [ ] `https://weavelight.app/binds/123` → Bind detail screen
- [ ] `https://weavelight.app/ai-chat` → AI chat screen
- [ ] `https://weavelight.app/settings/subscription` → Subscription screen

---

**Test 4.2: Custom URL Scheme (from Notes app)**
- [ ] Open Notes app
- [ ] Type: `weavelight://goals`
- [ ] Tap: The link
- [ ] Verify: App opens and navigates to Goals screen

**Test other schemes:**
- [ ] `weavelight://ai-chat` → AI chat screen
- [ ] `weavelight://settings` → Settings screen

---

**Test 4.3: Deep Link When App is Closed**
- [ ] Force quit Weave app
- [ ] Tap deep link (from Safari or Notes)
- [ ] Verify: App launches and navigates to correct screen
- [ ] Verify: No crashes or blank screens

---

**Test 4.4: Deep Link When App is Backgrounded**
- [ ] Open Weave app, then press Home to background
- [ ] Tap deep link
- [ ] Verify: App foregrounds and navigates to correct screen
- [ ] Verify: Smooth transition

---

## 5. Dev Tools Testing

### Access: Settings → Dev Tools

**Test 5.1: Story 9.4 Testing Card**
- [ ] Navigate: Settings → Dev Tools
- [ ] Scroll to: "Story 9.4 Testing" card
- [ ] Verify: Card visible with title "Story 9.4 Testing"
- [ ] Verify: Two buttons visible
- [ ] Verify: Description text below buttons

---

**Test 5.2: Test Push Notification Button**
- [ ] See Test 3.1 (Push Notifications Testing)

---

**Test 5.3: Test Subscription Status Button**
- [ ] Tap: "💳 Test Subscription Status" button
- [ ] Verify: Button shows loading state ("Loading...")
- [ ] Verify: Alert appears with subscription data
- [ ] Verify: Alert shows:
  - Tier: free/pro/admin
  - Monthly Limit: 500/5000/Unlimited
  - Expires: date or N/A
  - Product: product ID or N/A

**Expected Behavior:**
- Alert dismisses on "OK"
- No errors in console

---

**Test 5.4: Live Subscription Status Display**
- [ ] Below test buttons, verify: Live status card visible
- [ ] Verify: Shows "Current Tier: FREE" (or PRO/ADMIN)
- [ ] Verify: Shows "Monthly Limit: 500" (or 5000/Unlimited)
- [ ] Purchase Pro subscription (Test 1.5)
- [ ] Return to Dev Tools
- [ ] Verify: Status automatically updates to "Current Tier: PRO"
- [ ] Verify: Monthly Limit updates to "5000"

**Expected Behavior:**
- Uses TanStack Query (auto-refreshes every 30s)
- Updates immediately after purchase (cache invalidation)

---

## 6. Subscription API Testing

### Using Dev Tools + Network Inspection

**Test 6.1: GET /api/subscription/status**
- [ ] Open React Native Debugger or Chrome DevTools
- [ ] Navigate: Settings → Dev Tools
- [ ] Tap: "Test Subscription Status" button
- [ ] Inspect: Network tab for request to `/api/subscription/status`
- [ ] Verify: Response status: 200 OK
- [ ] Verify: Response body matches:
```json
{
  "subscription_tier": "free",
  "subscription_expires_at": null,
  "subscription_product_id": null,
  "monthly_limit": 500,
  "is_expired": false
}
```

---

**Test 6.2: POST /api/subscription/verify-receipt (Requires Purchase)**
- [ ] Complete purchase (Test 1.5)
- [ ] Inspect: Network tab for request to `/api/subscription/verify-receipt`
- [ ] Verify: Request body includes:
  - `receipt`: base64 string
  - `product_id`: e.g., "com.weavelight.app.pro.monthly"
- [ ] Verify: Response status: 200 OK
- [ ] Verify: Response body:
```json
{
  "success": true,
  "subscription_tier": "pro",
  "expires_at": "2026-01-23T10:00:00Z",
  "product_id": "com.weavelight.app.pro.monthly"
}
```

---

**Test 6.3: GET /api/account/export-data**
- [ ] Navigate: Settings → Account Management
- [ ] Tap: "Export Data"
- [ ] Inspect: Network tab for request to `/api/account/export-data`
- [ ] Verify: Response status: 200 OK
- [ ] Verify: Response body:
```json
{
  "export_url": "https://placeholder.url/export.json"
}
```

**Note:** Placeholder URL (production: uploads to Supabase Storage)

---

## 7. Integration Testing

**Test 7.1: End-to-End Subscription Flow**
1. [ ] Start as Free user (verify Settings → Subscription shows Free)
2. [ ] Check rate limit: Try making 501 AI chat messages → should be blocked
3. [ ] Purchase Pro subscription (Test 1.5)
4. [ ] Verify: Subscription screen updates to Pro
5. [ ] Verify: Dev Tools shows Pro tier
6. [ ] Check rate limit: Make 501 AI chat messages → should succeed (new limit: 5000)
7. [ ] Wait 1 month (or simulate expiry by manually updating DB)
8. [ ] Verify: Subscription expires, tier reverts to Free
9. [ ] Verify: Rate limit reverts to 500

---

**Test 7.2: Notification to Deep Link Flow**
1. [ ] Send push notification with deep link data
2. [ ] Tap notification
3. [ ] Verify: App opens and navigates to specified screen
4. [ ] Verify: No crashes

---

**Test 7.3: Account Deletion Flow**
1. [ ] Create test account, add some data (goals, journal entries)
2. [ ] Navigate: Settings → Account Management
3. [ ] Export data (Test 2.2)
4. [ ] Download export, verify data present
5. [ ] Delete account (Test 2.4)
6. [ ] Verify: Logged out
7. [ ] Try logging in with deleted account → should fail
8. [ ] Verify: Data no longer accessible via API

---

## 8. Error Handling Testing

**Test 8.1: Network Errors**
- [ ] Turn off WiFi/data
- [ ] Try: Fetch subscription status (Dev Tools button)
- [ ] Verify: Error alert appears: "Network error" or similar
- [ ] Turn on WiFi/data
- [ ] Try again: Should succeed

---

**Test 8.2: Invalid Receipt (Simulator)**
- [ ] Try purchase on simulator (doesn't support IAP)
- [ ] Verify: Error alert appears: "IAP not supported on simulator"

---

**Test 8.3: Expired Subscription**
- [ ] Manually update DB: Set `subscription_expires_at` to past date
- [ ] Refresh app
- [ ] Verify: Subscription screen shows "Expired" status
- [ ] Verify: Rate limit reverts to Free tier (500 messages)

---

## 9. Visual/UI Testing

**Test 9.1: Subscription Screen Styling**
- [ ] Verify: Uses design system components (Card, Button, Heading, Body)
- [ ] Verify: Proper spacing and layout
- [ ] Verify: Colors match theme (primary, secondary, background)
- [ ] Verify: Responsive to different screen sizes

**Test 9.2: Account Management Styling**
- [ ] Verify: Delete button uses destructive styling (red)
- [ ] Verify: Proper warning icons/colors
- [ ] Verify: Readable text (good contrast)

**Test 9.3: Dev Tools Styling**
- [ ] Verify: Test buttons clearly distinguished
- [ ] Verify: Loading states visible
- [ ] Verify: Live status card styled correctly

---

## 10. Edge Cases

**Test 10.1: Rapid Button Taps**
- [ ] Rapidly tap "Test Push Notification" button 5 times
- [ ] Verify: Only sends 1 notification (button disabled during sending)
- [ ] Verify: No crashes

**Test 10.2: App Backgrounding During Purchase**
- [ ] Start purchase flow
- [ ] Press Home to background app
- [ ] Wait 10 seconds
- [ ] Return to app
- [ ] Verify: Purchase completes or shows appropriate error

**Test 10.3: Deep Link to Non-Existent Screen**
- [ ] Try deep link: `weavelight://invalid-screen`
- [ ] Verify: App opens to home screen (graceful fallback)
- [ ] Verify: No crashes

---

## Test Results Tracking

Use this checklist to track test results:

### Subscription Screen
- [ ] Test 1.1: Current Plan Display - PASS / FAIL
- [ ] Test 1.2: Upgrade Cards - PASS / FAIL
- [ ] Test 1.3: Manage Subscription - PASS / FAIL
- [ ] Test 1.4: Restore Purchases - PASS / FAIL
- [ ] Test 1.5: Purchase Flow - PASS / FAIL / NOT TESTED

### Account Management
- [ ] Test 2.1: Screen Navigation - PASS / FAIL
- [ ] Test 2.2: Export Data - PASS / FAIL
- [ ] Test 2.3: Delete First Confirmation - PASS / FAIL
- [ ] Test 2.4: Delete Second Confirmation - PASS / FAIL
- [ ] Test 2.5: GDPR Notice - PASS / FAIL

### Push Notifications
- [ ] Test 3.1: Test Notification Button - PASS / FAIL
- [ ] Test 3.2: Tap Notification - PASS / FAIL
- [ ] Test 3.3: Notification Permissions - PASS / FAIL

### Deep Linking
- [ ] Test 4.1: Universal Links - PASS / FAIL / NOT TESTED
- [ ] Test 4.2: Custom URL Scheme - PASS / FAIL
- [ ] Test 4.3: Deep Link When Closed - PASS / FAIL
- [ ] Test 4.4: Deep Link When Backgrounded - PASS / FAIL

### Dev Tools
- [ ] Test 5.1: Story 9.4 Card - PASS / FAIL
- [ ] Test 5.2: Test Notification - PASS / FAIL (duplicate of 3.1)
- [ ] Test 5.3: Test Subscription Status - PASS / FAIL
- [ ] Test 5.4: Live Status Display - PASS / FAIL

### Integration
- [ ] Test 7.1: End-to-End Subscription - PASS / FAIL
- [ ] Test 7.2: Notification to Deep Link - PASS / FAIL
- [ ] Test 7.3: Account Deletion - PASS / FAIL

---

**Created:** 2025-12-23
**Story:** 9.4 (App Store Readiness)
**Testing Environment:** Development (prod/9.4 branch)
