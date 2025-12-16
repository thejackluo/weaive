---
stepsCompleted: [1, 2]
inputDocuments:
  - docs/prd.md
  - docs/ux-design.md
  - docs/analysis/research/market-ai-habit-productivity-apps-research-2025-12-16.md
  - docs/idea/backend.md
  - docs/idea/ai.md
workflowType: 'architecture'
lastStep: 1
project_name: 'Weave'
user_name: 'Jack'
date: '2025-12-16'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

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

### Technical Constraints & Dependencies

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

### Cross-Cutting Concerns Identified

1. **User Context Assembly** - Every AI operation requires: identity doc (versioned), active goals, completion history, fulfillment trend, preferences
2. **Timezone-Aware Date Handling** - All user-facing dates are `local_date` in user's timezone
3. **Event Sourcing Patterns** - Canonical truth vs. derived views (post-MVP)
4. **AI Cost Control** - Input hash caching, batched calls, rate limiting (post-MVP)
5. **Editability & Auditability** - All AI outputs stored as editable artifacts (post-MVP)
6. **Security Model** - RLS on all user-owned Supabase tables (before public launch)

---

## MVP vs. Scale Architecture Strategy

### AI Model Landscape (December 2025)

| Provider | Model | Input $/MTok | Output $/MTok | Best For |
|----------|-------|--------------|---------------|----------|
| **OpenAI** | GPT-4o-mini | $0.15 | $0.60 | Routine tasks, high volume |
| **OpenAI** | GPT-4o | $2.50 | $10.00 | Complex reasoning |
| **Anthropic** | Claude 3.5 Haiku | $0.80 | $4.00 | Fast, cheap |
| **Anthropic** | Claude 3.7 Sonnet | $3.00 | $15.00 | Balanced quality/cost |
| **Open Source** | Llama 3.1 70B | ~$0.10* | ~$0.30* | Self-hosted at scale |

*Self-hosted costs depend on GPU infrastructure*

### MVP Architecture (Week 1, 2-3 People)

**Philosophy:** Ship fast. Validate core loop. Technical debt is acceptable if it proves the product works.

#### MVP Must-Have Components

| Component | MVP Implementation | Notes |
|-----------|-------------------|-------|
| **Auth** | Supabase Auth (built-in) | OAuth + email/password, zero config |
| **Database** | Supabase PostgreSQL | Direct queries, RLS can wait |
| **Storage** | Supabase Storage | Signed URLs for proof captures |
| **Backend API** | Python FastAPI (Railway) | Single monolith, no microservices |
| **AI - Routine** | GPT-4o-mini ($0.15/$0.60) | Triad, recap - 90% of calls |
| **AI - Complex** | Claude 3.7 Sonnet | Onboarding, Dream Self chat |
| **Push Notifications** | Expo Push → APNs | Simple, works immediately |
| **Job Queue** | None - sync calls | At <100 users, sync is fine |

#### MVP Database (8 Core Tables)

```sql
user_profiles       -- Basic user info + timezone
identity_docs       -- Single version per user (no versioning yet)
goals               -- Max 3 active
subtask_templates   -- Reusable binds
subtask_instances   -- Scheduled for specific dates
subtask_completions -- Immutable completion events
captures            -- Proof (photos, notes)
journal_entries     -- Daily reflections
```

#### MVP AI Call Strategy

| Trigger | Model | Approach |
|---------|-------|----------|
| Onboarding | Claude Sonnet | Sync call, 5-10s wait OK |
| Journal → Triad + Recap | GPT-4o-mini | Single sync call |
| Dream Self Chat | GPT-4o-mini | Sync streaming |

**MVP Cost Estimate (100 users, 30 days): ~$40/month**

#### Skip for MVP (Add Later)

| Component | Add When | Trigger |
|-----------|----------|---------|
| RLS Policies | Before public launch | Security requirement |
| Analytics (PostHog) | 500+ users | Need retention data |
| Error Tracking (Sentry) | 500+ users | Production bugs |
| Job Queue (Redis/BullMQ) | 1K+ users | AI calls >5s |
| Input Hash Caching | 1K+ users | AI costs >$500/mo |
| Derived Views (daily_aggregates) | 1K+ users | Dashboard >500ms |
| Open Source Models | 5K+ users | AI costs >$2K/mo |

### Scale Architecture (10K+ Users)

**Hybrid AI Strategy:**
- **Routine calls (90%)**: Self-hosted Llama 3.1 70B (~$0.10/MTok)
- **Complex calls (10%)**: API (Sonnet/GPT-4o) for quality-critical interactions

**Scale Cost Estimate (10K users): ~$2,100/month** (vs. $4K+ all-API)

