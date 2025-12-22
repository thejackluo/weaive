# Story 9.8: App Store Submission

**Epic:** Epic 9 - Production Launch & App Store Publishing
**Priority:** M (Must Have)
**Estimate:** 8 story points
**Status:** Ready for Development

---

## User Story

**As a** product manager
**I want to** submit the final Weave app to App Store review
**So that** we can launch publicly on the iOS App Store

---

## Acceptance Criteria

### Pre-Submission Checklist

**Feature Completeness:**
- [ ] All Epic 0-8 features complete and tested
- [ ] All acceptance criteria met for each feature
- [ ] No placeholder UI or "Coming Soon" screens

**Quality Assurance:**
- [ ] Beta testing complete (Story 9.6)
- [ ] Zero P0 bugs (no crashes on core user journeys)
- [ ] Less than 5 P1 bugs (minor issues documented)
- [ ] Performance benchmarks met:
  - App launch time < 2 seconds
  - API response time < 1 second (95th percentile)
  - App size < 100MB

**Legal & Compliance:**
- [ ] Privacy policy published and linked in app (Story 9.3)
- [ ] Terms of service published and linked in app (Story 9.3)
- [ ] App Store metadata complete (screenshots, description, keywords)
- [ ] Age rating set correctly (12+)

**Subscription & Payments:**
- [ ] Apple IAP configured and tested (Story 9.4)
- [ ] All 3 subscription tiers working (Free Trial, Pro Monthly, Max Yearly)
- [ ] Receipt validation working (RevenueCat webhook)

**Production Infrastructure:**
- [ ] Backend deployed to Railway production (Story 9.1)
- [ ] Database running on Supabase Pro (Story 9.2)
- [ ] Production monitoring active (Story 9.7)
- [ ] Backend uptime > 99% during beta period

### Final Build

**Generate Production IPA:**
- [ ] Increment version number (e.g., 1.0.0)
- [ ] Generate production IPA: `eas build --platform ios --profile production`
- [ ] Download IPA from EAS Build dashboard

**Pre-Flight Testing:**
- [ ] Test final build on 3+ physical devices:
  - iPhone 12 (iOS 16)
  - iPhone 13 (iOS 17)
  - iPhone 14+ (iOS 18)
- [ ] Verify no dev-only features enabled:
  - No TestFlight beta badge visible
  - No debug logs in console
  - No "Dev Mode" indicators
- [ ] Test complete user journey end-to-end (onboarding through journal submission)

### App Store Connect Submission

**Upload Build:**
- [ ] Upload final IPA to App Store Connect via Transporter app
- [ ] Wait for processing (5-15 minutes)
- [ ] Select build for App Store release in App Store Connect

**App Store Review Information:**
- [ ] Fill out review notes for Apple reviewers:
  ```
  DEMO ACCOUNT:
  Email: demo@weave.app
  Password: DemoWeave2025!

  NOTES:
  - Weave is a goal-tracking and habit-building app with AI coaching
  - Key features: Goal creation, daily "Binds" (habits), journal reflection, AI coach
  - AI features use OpenAI (GPT-4o-mini) and Anthropic (Claude) for text generation
  - Image analysis uses Google Gemini for proof validation
  - Voice transcription uses AssemblyAI for audio capture
  - All AI-generated content is clearly labeled in the UI
  - Subscription: 10-day free trial, then $9.99/month (Pro) or $79.99/year (Max)
  ```
- [ ] Add demo account with pre-populated sample data:
  - 2 active goals
  - 5 completed binds
  - 3 journal entries
  - 1 AI chat conversation
- [ ] Provide contact information for urgent issues during review

**Final Submission:**
- [ ] Review all metadata one last time (screenshots, description, keywords)
- [ ] Click "Submit for Review" button
- [ ] Confirm submission (cannot be undone)

### Review Process Management

**Monitor Review Status:**
- [ ] Check App Store Connect daily for review status updates
- [ ] Expected review time: 24-48 hours (can be longer during holidays)
- [ ] Review statuses:
  - "Waiting for Review" (queued)
  - "In Review" (Apple reviewing now)
  - "Pending Developer Release" (approved, ready to release)
  - "Rejected" (see rejection reasons, fix, and resubmit)

**Respond to Reviewer Questions:**
- [ ] Monitor email for App Store review questions
- [ ] Respond within 24 hours (faster response = faster review)
- [ ] Provide additional clarification or screenshots if requested

**Handle Rejection (If Applicable):**
- [ ] Read rejection reasons carefully (Apple provides detailed feedback)
- [ ] Common rejection reasons:
  - App crashes during review (test thoroughly!)
  - IAP not functioning correctly (test in sandbox)
  - Privacy policy missing or incomplete
  - Misleading screenshots or metadata
- [ ] Fix issues identified in rejection
- [ ] Resubmit with resolution notes

### Launch

**Release to App Store:**
- [ ] Once approved, status changes to "Pending Developer Release"
- [ ] Click "Release this Version" button (or set auto-release)
- [ ] App goes live on App Store within 24 hours

**Post-Launch Monitoring (First 24 Hours):**
- [ ] Monitor Sentry for production errors (check every 2-4 hours)
- [ ] Monitor backend logs in Railway dashboard
- [ ] Monitor API response times (target < 1 second)
- [ ] Monitor crash rate (target < 1%)
- [ ] Respond to user reviews on App Store (reply within 48 hours)

**🎉 M4: Launch Milestone Achieved:**
- [ ] App live on iOS App Store
- [ ] Zero critical production issues
- [ ] Positive user reviews (target 4+ stars)
- [ ] Celebrate with team! 🎉

---

## Technical Notes

### Demo Account Setup
- Create dedicated demo user in production database
- Pre-populate with realistic sample data:
  - Goal 1: "Run 3x per week" (with 5 completed runs)
  - Goal 2: "Read 30 minutes daily" (with 3 completed sessions)
  - 3 journal entries with varied fulfillment scores
  - 1 AI chat conversation (sample questions + responses)
- Test demo account before submission (verify all features work)

### Common Rejection Reasons (And How to Avoid)

| Rejection Reason | Prevention Strategy |
|------------------|---------------------|
| **App crashes** | Thorough TestFlight beta testing, fix all P0 bugs |
| **IAP not working** | Test in App Store sandbox, verify receipt validation |
| **Privacy policy missing** | Link visible in Settings, accessible without login |
| **Misleading metadata** | Screenshots match actual app UI, no mockups |
| **Incomplete features** | No "Coming Soon" screens, all features functional |

### App Store Review Timeline
- **Submission:** Instant (upload IPA + submit for review)
- **Queued:** 0-24 hours (depends on review queue length)
- **In Review:** 1-24 hours (Apple reviewer testing app)
- **Approved:** Instant (status changes to "Pending Developer Release")
- **Live on App Store:** 0-24 hours after release

**Total Time:** Typically 24-48 hours, can be 3-5 days during peak times (holidays)

### Rejection Rate Statistics
- **First-time submissions:** ~40% rejection rate
- **Resubmissions:** ~20% rejection rate (after fixing initial issues)
- **Most common cause:** App crashes during review

### Post-Launch Support Plan
- **Week 1:** Daily monitoring (Sentry, user reviews, support emails)
- **Week 2-4:** Every 2 days monitoring
- **Month 2+:** Weekly monitoring + monthly review

---

## Dependencies

**Requires:**
- ALL previous Epic 9 stories complete (9.1 through 9.7)
- Epic 0-8 complete (all features implemented)
- Beta testing complete with zero P0 bugs

**Unblocks:**
- Public launch
- M4: Launch milestone
- Revenue generation (subscriptions)

---

## Definition of Done

- [ ] Pre-submission checklist complete
- [ ] Final production IPA built and tested
- [ ] Demo account created with sample data
- [ ] Final build uploaded to App Store Connect
- [ ] App Store review information provided
- [ ] App submitted for review
- [ ] Review approved (or rejection addressed and resubmitted)
- [ ] App released to App Store
- [ ] Post-launch monitoring active
- [ ] M4: Launch milestone achieved 🎉

---

## Testing Checklist

- [ ] Final IPA installs on 3+ devices
- [ ] Onboarding completes without errors
- [ ] Goal creation and bind completion work
- [ ] Journal submission works
- [ ] AI Coach responds correctly
- [ ] Subscription purchase works (sandbox)
- [ ] Demo account functional for reviewers
- [ ] No crashes on core user journeys
- [ ] Privacy policy link works
- [ ] App Store metadata accurate

---

## Resources

- **App Store Connect:** https://appstoreconnect.apple.com/
- **App Store Review Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **App Store Review Times:** https://appreviewtimes.com/ (community-reported)
- **Apple Transporter App:** https://apps.apple.com/us/app/transporter/id1450874784

---
