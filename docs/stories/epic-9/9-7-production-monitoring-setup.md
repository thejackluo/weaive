# Story 9.7: Production Monitoring Setup

**Epic:** Epic 9 - Production Launch & App Store Publishing
**Priority:** M (Must Have)
**Estimate:** 3 story points
**Status:** Ready for Development

---

## User Story

**As a** DevOps engineer
**I want to** configure production monitoring and alerting
**So that** we can detect and respond to issues quickly

---

## Acceptance Criteria

### Sentry Configuration (Error Tracking)

**Create Production Projects:**
- [ ] Create Sentry project for mobile app: `weave-mobile`
- [ ] Create Sentry project for backend API: `weave-api`
- [ ] Set environment tag: `production` (to distinguish from dev/staging)

**Alert Rules:**
- [ ] Configure alert for mobile app:
  - **Rule 1:** Error rate > 1% of sessions → Slack #alerts
  - **Rule 2:** App crash rate > 1% → Slack #alerts (urgent)
  - **Rule 3:** API response time > 5s → Email engineering@
- [ ] Configure alert for backend API:
  - **Rule 1:** API error rate > 0.5% → Slack #alerts
  - **Rule 2:** Database query time > 2s → Email engineering@
  - **Rule 3:** AI API failures (OpenAI, Anthropic, Gemini) → Slack #alerts

**Release Tracking:**
- [ ] Configure Sentry to track app releases
- [ ] Link errors to specific app versions (use `Sentry.setRelease()`)
- [ ] Set up release notifications in Slack

**Integration Verification:**
- [ ] Test Sentry integration by triggering sample error
- [ ] Verify error appears in Sentry dashboard
- [ ] Verify Slack alert received

### LogRocket Configuration (Session Replay)

**Upgrade to Paid Plan:**
- [ ] Upgrade to LogRocket paid plan ($99/month, 10K sessions)
- [ ] Configure billing and payment method

**Session Recording:**
- [ ] Enable session recording in production
- [ ] Configure LogRocket SDK in mobile app (`app/_layout.tsx`)
- [ ] Set up user identification (log user ID after authentication):
  ```typescript
  LogRocket.identify(userId, {
    name: userName,
    email: userEmail,
    subscriptionTier: 'free' | 'pro' | 'max'
  });
  ```

**Privacy Controls:**
- [ ] Mask sensitive fields using LogRocket API:
  - Password inputs: `LogRocket.redactText('.password-input')`
  - Auth tokens: `LogRocket.redactText('.auth-token')`
  - Personal profile data: `LogRocket.redactText('.sensitive-profile-field')`
- [ ] Verify masked fields not visible in session replays

**Custom Event Tracking:**
- [ ] Add LogRocket custom events for key user actions:
  ```typescript
  LogRocket.track('goal_created', { goalId, goalTitle });
  LogRocket.track('bind_completed', { bindId, goalId, proofType });
  LogRocket.track('proof_captured', { captureType: 'image' | 'voice' });
  LogRocket.track('journal_submitted', { fulfillmentScore, wordCount });
  LogRocket.track('triad_generated', { triadDate, bindCount });
  ```

**Integration Verification:**
- [ ] Test LogRocket by performing sample user action
- [ ] Verify session replay recorded in LogRocket dashboard
- [ ] Verify custom events logged correctly

### Cost Monitoring Dashboard

**Create Cost Tracking Dashboard:**
- [ ] Build simple dashboard to track monthly costs:
  - Railway (backend compute)
  - Supabase (database + storage)
  - OpenAI (AI text generation)
  - Anthropic (Claude AI)
  - Google AI (Gemini image analysis)
  - AssemblyAI (voice transcription)
- [ ] Use data from `ai_runs` table (cost tracking already implemented)
- [ ] Display current month costs vs budget ($2,500/month AI budget)

**Budget Alerts:**
- [ ] Set up alert when daily cost exceeds $100 (=$3,000/month threshold)
- [ ] Send alert to Slack #alerts or email
- [ ] Manually review costs weekly (first 4 weeks of production)

**Dashboard Tech Stack:**
- **Option 1:** Supabase Dashboard + simple SQL query
- **Option 2:** Google Sheets with Supabase integration
- **Option 3:** Simple FastAPI endpoint returning cost summary

### Uptime Monitoring

**UptimeRobot Setup (Free):**
- [ ] Create UptimeRobot account (free plan: 50 monitors, 5-minute checks)
- [ ] Create HTTP monitor for production backend:
  - URL: `https://weave-api-production.railway.app/health`
  - Check interval: 5 minutes
  - Timeout: 30 seconds
- [ ] Configure alert contacts:
  - Email: engineering@weave.app
  - Slack: #alerts channel (via webhook)
- [ ] Set alert threshold: downtime > 2 minutes

**Integration Verification:**
- [ ] Test UptimeRobot by stopping Railway service temporarily
- [ ] Verify downtime alert received
- [ ] Restart service and verify uptime restored

---

## Technical Notes

### Sentry Configuration (Mobile)
```typescript
// weave-mobile/app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 0.2,  // 20% of transactions monitored
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000,
});

// Track app version
Sentry.setRelease(`weave-mobile@${version}`);
Sentry.setDist(buildNumber);
```

### Sentry Configuration (Backend)
```python
# weave-api/app/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    environment="production",
    traces_sample_rate=0.2,
    integrations=[FastApiIntegration()],
)
```

### LogRocket Integration
```typescript
// weave-mobile/app/_layout.tsx
import LogRocket from '@logrocket/react-native';

LogRocket.init('weave/production');

// After user authenticates
LogRocket.identify(userId, {
  name: userName,
  email: userEmail,
  subscriptionTier: subscriptionTier,
});
```

### Cost Monitoring SQL Query
```sql
-- Daily AI costs by provider
SELECT
  DATE(created_at) AS date,
  provider,
  SUM(cost_usd) AS daily_cost,
  COUNT(*) AS call_count
FROM ai_runs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), provider
ORDER BY date DESC, daily_cost DESC;
```

---

## Dependencies

**Requires:**
- Story 9.1 (Production backend deployed)
- Epic 0.5 (Observability - Sentry/LogRocket integration code exists)

**Unblocks:**
- Proactive incident detection
- Faster bug resolution
- Cost control and optimization

---

## Definition of Done

- [ ] Sentry projects created for mobile + backend
- [ ] Sentry alert rules configured
- [ ] Sentry release tracking enabled
- [ ] LogRocket upgraded to paid plan
- [ ] LogRocket session recording active
- [ ] LogRocket privacy controls configured
- [ ] LogRocket custom events tracked
- [ ] Cost monitoring dashboard created
- [ ] Budget alerts configured
- [ ] UptimeRobot monitoring configured
- [ ] Uptime alert notifications working
- [ ] Code reviewed and approved

---

## Testing Checklist

- [ ] Sentry captures errors in production
- [ ] Sentry alerts trigger correctly (test with sample error)
- [ ] LogRocket records session replays
- [ ] Sensitive fields masked in LogRocket
- [ ] Custom events appear in LogRocket dashboard
- [ ] Cost dashboard shows accurate data
- [ ] Budget alert triggers when threshold exceeded
- [ ] UptimeRobot detects downtime and sends alert

---

## Resources

- **Sentry Documentation:** https://docs.sentry.io/
- **LogRocket Documentation:** https://docs.logrocket.com/
- **UptimeRobot:** https://uptimerobot.com/
- **Epic 0.5 (Observability):** `docs/prd/epic-0.5-observability.md`

---
