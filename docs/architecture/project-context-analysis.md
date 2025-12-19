# Project Context Analysis

## Requirements Overview

**Functional Requirements:**
The PRD defines 8 epics (238 total story points) covering:
- EP-001: User Onboarding & Identity (55 pts) - Auth, archetype assessment, identity doc creation
- EP-002: Goal Management System (34 pts) - Goals/Q-Goals/Subtasks CRUD, max 3 active goals
- EP-003: Daily Planning & Execution (55 pts) - Triad generation, bind scheduling, completions
- EP-004: Capture & Proof System (21 pts) - Photo/audio/text captures, proof linking
- EP-005: Reflection & Journaling (34 pts) - Daily journal, fulfillment scoring, AI insights
- EP-006: Progress & Visualization (34 pts) - Consistency heatmap, streaks, Weave character
- EP-007: AI Coach & Dream Self (34 pts) - Chat interface, deterministic personality
- EP-008: Notifications & Engagement (21 pts) - Push notifications, streak recovery

**Non-Functional Requirements:**
- Performance: Dashboard reads from pre-computed `daily_aggregates`, not raw completions
- Cost: AI budget $2,500/month at 10K users; most screens do not call AI
- Security: RLS on all user tables, JWT verification, file upload limits (10MB)
- Reliability: Event-driven architecture with immutable event logs
- Scalability: Async queue for AI operations, sync for fast reads

**Scale & Complexity:**
- Primary domain: Full-Stack Mobile (React Native iOS + Python FastAPI + AI)
- Complexity level: High
- Estimated architectural components: 15+

## Technical Constraints & Dependencies

**Platform Constraints:**
- iOS 15+ minimum (App Store deployment)
- React Native for mobile client
- Python FastAPI on Railway for backend
- Supabase for database, auth, and storage

**External Dependencies:**
- LLM Providers: OpenAI (GPT-4o, GPT-4o-mini), Anthropic (Claude 3.7 Sonnet, Claude 3.5 Haiku)
- Push Notifications: iOS APNs via Expo Push
- Analytics: PostHog (post-MVP)
- Error Tracking: Sentry (post-MVP)
- Job Queue: Redis + BullMQ (post-MVP)

**Budget Constraints:**
- AI: $2,500/month at 10K users
- Infrastructure: Railway + Supabase (pricing TBD based on tier)

## Cross-Cutting Concerns Identified

1. **User Context Assembly** - Every AI operation requires: identity doc (versioned), active goals, completion history, fulfillment trend, preferences
2. **Timezone-Aware Date Handling** - All user-facing dates are `local_date` in user's timezone
3. **Event Sourcing Patterns** - Canonical truth vs. derived views (post-MVP)
4. **AI Cost Control** - Input hash caching, batched calls, rate limiting (post-MVP)
5. **Editability & Auditability** - All AI outputs stored as editable artifacts (post-MVP)
6. **Security Model** - RLS on all user-owned Supabase tables (before public launch)

---
