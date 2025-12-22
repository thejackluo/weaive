# Story 9.6: TestFlight Beta Testing

**Epic:** Epic 9 - Production Launch & App Store Publishing
**Priority:** M (Must Have)
**Estimate:** 3 story points
**Status:** Ready for Development

---

## User Story

**As a** product manager
**I want to** run a beta test with real users on TestFlight
**So that** we can identify critical bugs before public launch

---

## Acceptance Criteria

### TestFlight Setup

**Production IPA Build:**
- [ ] Configure EAS Build production profile in `eas.json`:
  ```json
  {
    "build": {
      "production": {
        "ios": {
          "distribution": "store",
          "autoIncrement": true
        }
      }
    }
  }
  ```
- [ ] Generate production IPA: `eas build --platform ios --profile production`
- [ ] Wait for build to complete (~20-30 minutes)
- [ ] Download IPA from EAS Build dashboard

**Upload to App Store Connect:**
- [ ] Install Apple Transporter app (macOS only) or use `altool`
- [ ] Upload IPA to App Store Connect via Transporter
- [ ] Wait for processing (5-15 minutes)
- [ ] Verify build appears in App Store Connect → TestFlight

**TestFlight Configuration:**
- [ ] Enable TestFlight for app record in App Store Connect
- [ ] Create beta testing group "Internal Beta" (10-20 users: team + friends)
- [ ] Create beta testing group "External Beta" (30-50 users: public testers)
- [ ] Add beta testers by email address
- [ ] Write beta testing instructions (what to test, how to report bugs)

### Beta Testing Process

**Internal Beta (Week 1):**
- [ ] Send TestFlight invites to internal beta group
- [ ] Create feedback form (Google Form or Typeform):
  - Overall experience (1-5 stars)
  - Bugs encountered (description, steps to reproduce)
  - Feature requests
  - Performance issues
- [ ] Monitor Sentry for crash reports during beta period
- [ ] Collect feedback daily (review Google Form responses)

**Bug Triage & Fixing:**
- [ ] Triage all bugs by severity:
  - **P0 (Critical):** App crashes, data loss, auth failures
  - **P1 (High):** Broken features, poor UX, performance issues
  - **P2 (Medium):** Minor bugs, cosmetic issues
- [ ] Fix all P0 bugs (MUST fix before public launch)
- [ ] Fix P1 bugs if time permits (target <5 P1 bugs at launch)
- [ ] Log P2 bugs for post-launch (not launch-blocking)

**Beta Build Iteration:**
- [ ] Release updated builds to TestFlight (2-3 iterations expected)
- [ ] Increment build number for each release
- [ ] Notify testers of new builds via TestFlight notifications
- [ ] Repeat testing cycle until P0 bugs eliminated

### Beta Completion Criteria

**Quality Gates:**
- [ ] Zero P0 bugs (no crashes on core user journeys)
- [ ] Less than 5 P1 bugs (minor issues acceptable)
- [ ] Positive feedback from 80%+ of beta testers (4+ stars average)
- [ ] Core user journey tested end-to-end:
  - Onboarding → Goal creation → Bind completion → Journal entry → Progress view

**Performance Benchmarks:**
- [ ] App launch time < 2 seconds
- [ ] API response time < 1 second (95th percentile)
- [ ] Zero memory leaks (test with Xcode Instruments)
- [ ] App size < 100MB (to allow cellular downloads)

---

## Technical Notes

### TestFlight Limitations
- **Build Expiration:** TestFlight builds expire after 90 days (must re-upload)
- **External Beta Review:** Requires App Store review (1-2 day delay)
- **Internal Beta:** No review required (instant access)
- **Tester Limit:** 10,000 external testers max (far more than needed)

### EAS Build Production Profile
```json
// eas.json
{
  "build": {
    "production": {
      "ios": {
        "distribution": "store",
        "autoIncrement": true,
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "123456789"
      }
    }
  }
}
```

### Beta Testing Timeline
| Week | Activity | Goal |
|------|----------|------|
| **Week 1** | Internal beta (10-20 testers) | Find critical bugs (P0) |
| **Week 2** | Fix P0 bugs, release build 2 | Verify fixes, find P1 bugs |
| **Week 3** | Fix P1 bugs, release build 3 (final) | Polish, final approval |

### Crash Reporting (Sentry Integration)
- Sentry auto-captures crashes in TestFlight builds
- View crashes in Sentry dashboard grouped by:
  - Error type (e.g., TypeError, NetworkError)
  - Affected users
  - App version
- Use breadcrumbs to understand user actions leading to crash

### Beta Feedback Form Questions
1. **Overall Experience:** How would you rate Weave? (1-5 stars)
2. **Bugs:** Did you encounter any bugs? (Yes/No, describe)
3. **Performance:** Did the app feel slow or laggy? (Yes/No, where?)
4. **Clarity:** Was the app easy to use? (Yes/No, what was confusing?)
5. **Value:** Would you pay $9.99/month for Weave? (Yes/No, why?)
6. **Open Feedback:** Anything else you'd like to share?

---

## Dependencies

**Requires:**
- Story 9.1, 9.2 (Production infrastructure ready)
- Story 9.5 (Security audit passed)
- Epic 0-8 complete (all features implemented)

**Unblocks:**
- Story 9.8 (App Store Submission - after bugs fixed)

---

## Definition of Done

- [ ] Production IPA built and uploaded to TestFlight
- [ ] Internal beta group created and invited
- [ ] Beta feedback form created and shared
- [ ] Sentry monitoring active during beta
- [ ] All P0 bugs fixed and verified
- [ ] Less than 5 P1 bugs remaining
- [ ] Positive feedback from 80%+ of testers
- [ ] Core user journey tested successfully
- [ ] Performance benchmarks met
- [ ] Final build ready for App Store submission

---

## Testing Checklist

- [ ] TestFlight build installs successfully
- [ ] Onboarding flow completes without errors
- [ ] Goal creation works
- [ ] Bind completion with proof capture works
- [ ] Journal entry submission works
- [ ] AI Coach responds correctly
- [ ] Subscription purchase flow works (sandbox mode)
- [ ] No crashes on core user journeys
- [ ] App launches in < 2 seconds

---

## Resources

- **EAS Build:** https://docs.expo.dev/build/introduction/
- **TestFlight Guide:** https://developer.apple.com/testflight/
- **Apple Transporter:** https://apps.apple.com/us/app/transporter/id1450874784
- **Sentry Crash Reporting:** https://docs.sentry.io/platforms/react-native/

---
