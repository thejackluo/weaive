# Epic 8: Settings & Profile

## Overview

Users manage their account settings, identity document, and app preferences.

## User Stories

### US-8.1: Profile Overview

**Priority:** M (Must Have)

**As a** user
**I want to** access my profile settings
**So that** I can manage my account

**Acceptance Criteria:**
- [ ] Access from Thread via profile icon
- [ ] Display: Name, email, profile photo (optional)
- [ ] Quick links to:
  - Identity Document
  - Notification Preferences
  - App Settings
  - Help/Support
  - Logout

**Data Requirements:**
- Read from `user_profiles`

---

### US-8.3: General Settings

**Priority:** M (Must Have)

**As a** user
**I want to** manage app settings
**So that** I customize my experience

**Acceptance Criteria:**
- [ ] Data export (JSON download)
- [ ] Delete account (with confirmation)

**Data Requirements:**
- Read/Write `user_profiles.preferences`

**Technical Notes:**
- Data export: Generate JSON with all user data
- Delete account: Soft delete first, hard delete after 30 days

---

### US-8.4: Subscription Management

**Priority:** M (Must Have)

**As a** user
**I want to** manage my subscription
**So that** I can upgrade or change my plan

**Acceptance Criteria:**
- [ ] Show current plan (Free, Pro, Max)
- [ ] Show features by plan
- [ ] Upgrade CTA with pricing
- [ ] Link to App Store subscription management
- [ ] Cancel subscription info

**Pricing Tiers:**
| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 1 goal, limited AI chat |
| Pro | $12/month | 3 goals, unlimited AI chat, advanced triad |
| Max | $24/month | 5 goals, priority support, advanced insights |

**Data Requirements:**
- Read from `subscriptions` table
- Integrate with App Store Connect API

**Technical Notes:**
- MVP: Link to App Store for management
- Track subscription status via webhooks

---

### US-8.5: Help and Support

**Priority:** S (Should Have)

**As a** user
**I want to** access help resources
**So that** I can resolve issues

**Acceptance Criteria:**
- [ ] FAQ section (in-app)
- [ ] Contact support (email link)
- [ ] Rate app prompt (after 7 active days)
- [ ] Version number display

---

### US-8.6: Logout and Account Security

**Priority:** M (Must Have)

**As a** user
**I want to** securely logout
**So that** my data is protected

**Acceptance Criteria:**
- [ ] Logout button with confirmation
- [ ] Clear local session data
- [ ] Redirect to login screen
- [ ] Re-authentication required for sensitive actions (delete account)

**Technical Notes:**
- Supabase Auth handles session management
- JWT tokens invalidated on logout

---

## Epic 8 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-8.1 | Profile Overview | M | 3 pts |
| US-8.3 | General Settings | M | 5 pts |
| US-8.4 | Subscription Management | M | 5 pts |
| US-8.5 | Help and Support | S | 3 pts |
| US-8.6 | Logout and Security | M | 2 pts |

**Epic Total:** 18 story points

**Changes from Original:**
- Removed US-8.2 (Edit Identity Document)

---
