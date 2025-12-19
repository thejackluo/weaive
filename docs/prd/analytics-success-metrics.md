# Analytics & Success Metrics

## Event Tracking Requirements

**Onboarding Events:**
- `onboarding_started`
- `onboarding_step_completed` (with step number)
- `onboarding_completed`
- `onboarding_abandoned` (with step)

**Core Loop Events:**
- `bind_started`
- `bind_completed`
- `proof_attached`
- `capture_created`
- `journal_submitted`
- `ai_feedback_viewed`

**Engagement Events:**
- `chat_message_sent`
- `dashboard_viewed`
- `goal_created`
- `goal_archived`
- `notification_opened`

**Monetization Events:**
- `subscription_started`
- `subscription_canceled`
- `upgrade_clicked`

## KPI Dashboard Requirements

**North Star:**
- Active Days with Proof (daily, weekly, cohort)

**Engagement:**
- DAU/MAU ratio (target: >20%)
- Binds completed per active user
- Journal completion rate
- AI chat usage

**Retention:**
- Day 1, Day 7, Day 30 retention
- Streak distribution
- Churn rate by cohort

**Monetization:**
- Free-to-paid conversion rate
- ARPU (Average Revenue Per User)
- MRR (Monthly Recurring Revenue)

## Analytics Tools

- **PostHog:** Event tracking and analytics
- **Sentry:** Error tracking and monitoring
- **Custom Dashboard:** North Star metric tracking

---
