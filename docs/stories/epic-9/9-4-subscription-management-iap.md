# Story 9.4: Subscription Management (Apple In-App Purchases)

**Epic:** Epic 9 - Production Launch & App Store Publishing
**Priority:** M (Must Have)
**Estimate:** 8 story points
**Status:** Ready for Development

---

## User Story

**As a** user
**I want to** purchase a Pro or Max subscription within the app
**So that** I can unlock premium features

---

## Acceptance Criteria

### App Store Connect IAP Setup

**Subscription Products:**
- [ ] Create subscription group in App Store Connect: "Weave Premium"
- [ ] Create 3 subscription tiers:
  1. **Free Trial:** 10 days, auto-renews to Pro Monthly ($9.99/month)
  2. **Pro Monthly:** $9.99/month, renews monthly
  3. **Max Yearly:** $79.99/year (33% discount vs monthly, $6.67/month equivalent)
- [ ] Configure subscription levels (upgrade/downgrade logic):
  - Free Trial → Pro Monthly (automatic after 10 days)
  - Pro Monthly → Max Yearly (immediate upgrade, prorated credit)
  - Max Yearly → Pro Monthly (downgrade at next renewal)

**Subscription Details:**
- [ ] Set subscription display names and descriptions
- [ ] Configure free trial (10 days for first-time subscribers)
- [ ] Set up subscription auto-renewal
- [ ] Configure grace period (3 days for payment issues)

### RevenueCat Integration (Recommended Approach)

**RevenueCat Setup:**
- [ ] Create RevenueCat account (free up to $10K MRR)
- [ ] Create new app project in RevenueCat dashboard
- [ ] Connect RevenueCat to App Store Connect (API key integration)
- [ ] Configure entitlements in RevenueCat:
  - `free`: Default (3 active goals, basic AI)
  - `pro`: Unlimited goals, advanced AI, priority support
  - `max`: Everything in Pro + early access features

**Mobile Integration:**
- [ ] Install RevenueCat SDK: `npm install react-native-purchases`
- [ ] Configure RevenueCat in app initialization:
  ```typescript
  import Purchases from 'react-native-purchases';

  await Purchases.configure({
    apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY,
    appUserID: userId,
  });
  ```
- [ ] Implement paywall UI (use RevenueCat's Paywall component or custom)
- [ ] Add purchase flow:
  - Show subscription options
  - Handle purchase initiation
  - Show loading state during purchase
  - Handle purchase success/failure
  - Restore purchases on new device

### Backend Receipt Validation

**RevenueCat Webhook:**
- [ ] Set up RevenueCat webhook endpoint in FastAPI: `POST /api/webhooks/revenuecat`
- [ ] Implement webhook handler for subscription events:
  - `INITIAL_PURCHASE`: New subscription purchased
  - `RENEWAL`: Subscription renewed
  - `CANCELLATION`: User cancelled subscription
  - `BILLING_ISSUE`: Payment failed
  - `PRODUCT_CHANGE`: Upgraded/downgraded tier
- [ ] Update `user_profiles.subscription_tier` on successful purchase
- [ ] Update `user_profiles.subscription_expires_at` on renewal
- [ ] Log all subscription events to `subscription_events` table (optional, for analytics)

**Subscription Validation:**
- [ ] Implement middleware to check subscription status on protected endpoints
- [ ] Return HTTP 402 (Payment Required) for premium features when subscription expired
- [ ] Handle grace period (allow access for 3 days after expiration)

### Testing

**Sandbox Testing:**
- [ ] Create App Store sandbox test accounts (Apple Developer portal)
- [ ] Test Free Trial:
  - Install app, start trial
  - Verify 10-day trial period
  - Fast-forward time in sandbox (trial ends immediately)
  - Verify auto-renewal to Pro Monthly
- [ ] Test Pro Monthly purchase:
  - Purchase Pro Monthly subscription
  - Verify subscription active in app
  - Verify backend updates `subscription_tier = 'pro'`
- [ ] Test Max Yearly purchase and upgrade flow
- [ ] Test subscription cancellation:
  - Cancel subscription in App Store
  - Verify app still works until expiration
  - Verify downgrade to Free after expiration
- [ ] Test subscription restore:
  - Install app on new device
  - Tap "Restore Purchases"
  - Verify subscription restored

---

## Technical Notes

### Why RevenueCat?

**Benefits:**
- Abstracts StoreKit complexity (handles Apple's receipt validation)
- Cross-platform support (iOS + Android future-proofing)
- Free up to $10K MRR (plenty for MVP)
- Reduces backend complexity (no custom receipt validation logic)
- Provides analytics dashboard (MRR, churn, conversions)

**Alternative:** Direct StoreKit 2 integration
- More complex (100+ lines of native code)
- iOS-only (no Android support)
- Requires custom backend receipt validation ($500+ dev cost)

### Subscription Tiers & Features

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 3 active goals, basic AI (10 calls/day), limited Triad generation |
| **Pro** | $9.99/month | Unlimited goals, advanced AI (unlimited), premium Triad, priority support |
| **Max** | $79.99/year | Everything in Pro + early access to new features, lifetime access guarantee |

### Paywall UI Placement
- **Trigger 1:** After creating 3rd goal (hit free limit)
- **Trigger 2:** Settings → Upgrade to Pro button
- **Trigger 3:** AI chat (after 10 free messages per day)

### Subscription Event Handling (Backend)
```python
# weave-api/app/api/webhooks/revenuecat.py
@router.post("/webhooks/revenuecat")
async def revenuecat_webhook(event: RevenueCatEvent):
    if event.type == "INITIAL_PURCHASE":
        await update_subscription(
            user_id=event.app_user_id,
            tier=event.product_id,  # "pro_monthly" or "max_yearly"
            expires_at=event.expiration_date
        )
    elif event.type == "CANCELLATION":
        # Keep subscription active until expiration
        await set_subscription_auto_renew(event.app_user_id, False)
    # ... handle other events
```

---

## Dependencies

**Requires:**
- Epic 8 complete (Subscription UI in settings)
- Story 9.3 (App Store Connect account setup)

**Unblocks:**
- Revenue generation
- Premium feature gating

---

## Definition of Done

- [ ] Subscription products created in App Store Connect
- [ ] RevenueCat account created and configured
- [ ] RevenueCat SDK integrated in mobile app
- [ ] Paywall UI implemented and tested
- [ ] Backend webhook endpoint receiving subscription events
- [ ] Subscription tier updated on purchase
- [ ] All subscription flows tested in sandbox
- [ ] Restore purchases functionality works
- [ ] Code reviewed and approved

---

## Testing Checklist

- [ ] Free trial starts correctly (10 days)
- [ ] Auto-renewal to Pro Monthly works after trial
- [ ] Pro Monthly purchase updates subscription_tier to "pro"
- [ ] Max Yearly purchase works and calculates correct expiration
- [ ] Subscription cancellation preserves access until expiration
- [ ] Downgrade to Free after subscription expires
- [ ] Restore purchases works on new device
- [ ] Webhook events logged correctly in backend

---

## Resources

- **RevenueCat Documentation:** https://docs.revenuecat.com/
- **RevenueCat React Native SDK:** https://docs.revenuecat.com/docs/react-native
- **StoreKit Testing:** https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_with_sandbox
- **Apple IAP Guidelines:** https://developer.apple.com/in-app-purchase/

---
