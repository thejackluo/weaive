# Cross-Cutting UX Concerns

These concerns apply across ALL epics and must be addressed within each feature implementation.

## Empty States (UX-E)

Every screen that can be empty must have a thoughtful, encouraging empty state.

| ID | Screen | Empty State Message | CTA |
|----|--------|---------------------|-----|
| UX-E1 | Thread (Today's Binds) | "No binds yet for today. Let's set up your first Needle!" | Create Needle |
| UX-E2 | Needles List | "You haven't set any goals yet. What do you want to achieve?" | Create First Needle |
| UX-E3 | Captures Gallery | "No memories captured yet. Document your wins!" | Quick Capture |
| UX-E4 | Journal History | "Your reflection journey starts today" | Start Reflection |
| UX-E5 | Heat Map (new user) | "Complete your first bind to start building your weave" | View Today's Binds |
| UX-E6 | AI Chat | "I'm here to help. Ask me anything about your goals" | Suggested chips |

**Implementation Requirement:** Each story with a list view MUST include acceptance criteria for empty state handling.

## Error & Fallback UX (UX-F)

Graceful degradation for all failure scenarios.

| ID | Scenario | User Message | Fallback Behavior |
|----|----------|--------------|-------------------|
| UX-F1 | Network offline | "You're offline. Some features are limited." | Show cached data, disable mutations |
| UX-F2 | AI service down | "Weave is thinking... Taking longer than usual." | Retry 3x, then show deterministic fallback |
| UX-F3 | AI rate limited | "Let's take a breather. More AI help in X minutes." | Show countdown, suggest manual actions |
| UX-F4 | Upload failed | "Couldn't save your photo. Retry?" | Queue for retry, allow skip |
| UX-F5 | Auth token expired | Silent refresh; if fails: "Please sign in again" | Redirect to login |
| UX-F6 | Server 500 | "Something went wrong. We're on it!" | Log to Sentry, show retry button |

**AI Fallback Chain:**
1. Primary: GPT-4o-mini (or Claude for complex ops)
2. Secondary: Alternative provider
3. Tertiary: Deterministic/template-based response

**Implementation Requirement:** All API calls must have error boundaries with appropriate fallback UI.

## Delight Moments (UX-D)

Purposeful animations that create moments of joy and reinforce positive behavior.

| ID | Trigger | Animation | Purpose |
|----|---------|-----------|---------|
| UX-D1 | Bind completed | Confetti burst (classy, not overwhelming) | Celebrate completion |
| UX-D2 | Streak milestone (7, 30, 60, 90 days) | Special celebration animation | Reinforce consistency |
| UX-D3 | Badge unlocked | Badge reveal with shine effect | Acknowledge achievement |
| UX-D4 | Weave level up | Character evolution animation | Show growth |
| UX-D5 | First Needle set | Welcome animation with Dream Self | Celebrate commitment |
| UX-D6 | Reflection submitted | Gentle wave/weave animation | Close daily loop |
| UX-D7 | Timer completed | Satisfying completion sound + visual | Pomodoro finish |

**Guidelines:**
- Animations should feel **magical and delightful**, not generic
- Keep animations short (<1.5s) and skippable
- Use haptic feedback on iOS for tactile reinforcement
- Respect reduced motion accessibility settings

## Loading States (UX-L)

Every async operation needs a thoughtful loading state.

| ID | Operation | Loading UI | Max Duration |
|----|-----------|-----------|--------------|
| UX-L1 | App launch | Splash with Weave logo | <3s |
| UX-L2 | AI generating response | "Weave is thinking..." with animation | <30s |
| UX-L3 | Image uploading | Progress bar with percentage | <5s |
| UX-L4 | Data syncing | Subtle spinner in nav bar | <2s |
| UX-L5 | Screen transition | Skeleton loaders | <1s |

**Implementation Requirement:** Use skeleton loaders for data-heavy screens. Show progress for operations >2s.

## Return States (UX-R) - DIFFERENTIATOR

How we handle users returning after absence. **This is what sets Weave apart from shame-based habit apps.**

| ID | Time Away | Experience | AI Behavior |
|----|-----------|------------|-------------|
| UX-R1 | <24h | Normal home screen | No special messaging |
| UX-R2 | 24-48h | Warm welcome banner | "Hey, you're back! 💙 Ready to pick up where you left off?" |
| UX-R3 | 48h-7d | AI-initiated chat | Proactive: "I noticed you've been away. Everything okay? Just ONE bind is a win." |
| UX-R4 | >7d | Special welcome animation | "Welcome back, [Name]! Your Dream Self is still here. Let's restart together." |

**Return Chat Flow (UX-R3):**
1. App detects `hours_since_active > 48`
2. AI Chat opens automatically with contextual greeting
3. Quick response chips: "Life got busy", "Feeling overwhelmed", "Ready to restart"
4. AI responds with empathy and ONE small action
5. Always reference their Dream Self and past wins

**Core Principles:**
- ❌ NEVER show broken streak prominently
- ❌ NEVER guilt-trip with sad mascots
- ❌ NEVER require catching up on missed days
- ✅ ALWAYS lead with warmth and genuine care
- ✅ ALWAYS lower the bar: "Just ONE bind today"
- ✅ ALWAYS reference their WHY (Dream Self)
- ✅ ALWAYS celebrate their return as a WIN
- ✅ ALWAYS let AI Chat be the re-entry point

**Technical Implementation:**
- Store `last_active_at` in `user_profiles` table
- Calculate return state on app launch
- Trigger appropriate UX-R experience based on time away

**Competitive Advantage:**
| What Competitors Do | What Weave Does |
|---------------------|-----------------|
| Duolingo: Guilt-trips with sad owl | Warm AI welcome, no judgment |
| Streaks: Shows broken chain prominently | Celebrates return as a win |
| Habitica: Character dies/loses HP | Lower the bar, reference past wins |
| Most apps: 77% churn at Day 3 | Re-engagement through compassionate AI |

---
