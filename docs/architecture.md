---
stepsCompleted: [1, 2, 3, 4]
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

---

## Starter Template Evaluation

### Primary Technology Domains

This is a **two-stack project**:
1. **Mobile App**: React Native + Expo (iOS)
2. **Backend API**: Python FastAPI

### Current Versions (December 2025)

| Technology | Version | Notes |
|------------|---------|-------|
| Expo SDK | 53 | Includes React Native 0.79, React 19 |
| Expo Router | v5 | File-based routing, protected routes |
| Python | 3.11+ | Required for FastAPI |
| FastAPI | 0.115+ | Latest stable |
| UV | Latest | Modern Python package manager |

### Starter Options Evaluated

#### Mobile (React Native + Expo)

| Option | Decision | Rationale |
|--------|----------|-----------|
| `npx create-expo-app` (blank) | **Selected** | Official, always latest SDK, clean slate |
| expo-supabase-starter | Rejected | May have outdated SDK version |
| react-native-supabase-boilerplate-2025 | Rejected | Not official Expo template |

#### Backend (Python FastAPI)

| Option | Decision | Rationale |
|--------|----------|-----------|
| Manual minimal setup | **Selected** | Full control, FastAPI is already minimal |
| FastAPI-Supabase-Starter | Rejected | Inherits opinions we may not want |
| supabase-api-scaffolding-template | Rejected | Over-engineered for MVP |

### Selected Starters

**Mobile App:**
```bash
npx create-expo-app weave-mobile --template blank-typescript
cd weave-mobile
npx expo install expo-router expo-linking expo-constants
npm install @supabase/supabase-js
```

**Backend API:**
```bash
mkdir weave-api && cd weave-api
uv init
uv add fastapi "uvicorn[standard]" supabase python-dotenv openai anthropic pydantic-settings
```

### Project Structure (MVP)

```
weave/
├── mobile/                    # Expo React Native app
│   ├── app/                   # Expo Router (file-based routing)
│   ├── components/            # Shared components
│   ├── lib/                   # Supabase client, API calls
│   ├── hooks/                 # Custom React hooks
│   └── package.json
│
├── api/                       # FastAPI backend
│   ├── app/
│   │   ├── main.py           # FastAPI app entry
│   │   ├── routers/          # API route handlers
│   │   ├── services/         # Business logic
│   │   ├── models/           # Pydantic models
│   │   └── config.py         # Settings + env vars
│   ├── pyproject.toml
│   └── requirements.txt
│
├── supabase/                  # Supabase config (optional local dev)
│   └── migrations/
│
└── docs/                      # Architecture, PRD, etc.
```

### Architectural Decisions from Starter Selection

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Language (Mobile)** | TypeScript | Type safety, better DX |
| **Language (Backend)** | Python 3.11+ | FastAPI requirement, AI libs native |
| **Routing (Mobile)** | Expo Router v5 | File-based, protected routes built-in |
| **Package Manager** | npm (mobile), uv (backend) | Standard, fast |
| **Monorepo** | No (separate directories) | Simpler for 2-3 person team |

**Note:** Project initialization using these commands should be the first implementation task

---

## Core Architectural Decisions

### Styling Framework

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Primary Styling** | NativeWind (Tailwind CSS for RN) | Familiar Tailwind syntax, smaller bundle than Tamagui |
| **Alternative** | Tamagui (post-MVP) | Consider if web support or complex theming needed |

**NativeWind Setup:**
```bash
npm install nativewind
npx pod-install
```

### State Management Architecture

**Three-Layer Strategy:**

| Layer | Library | Purpose | Examples |
|-------|---------|---------|----------|
| **Server State** | TanStack Query | Remote data, caching, sync | Goals, completions, user profile |
| **Shared UI State** | Zustand | Cross-component state | Active filters, modal state |
| **Local State** | useState | Component-scoped | Form inputs, toggles |

**Why This Works:**
- TanStack Query handles 80% of state (server cache + mutations)
- Zustand for rare shared UI state (minimal stores)
- useState for everything component-local
- Clear boundaries = no state management debates

**TanStack Query Configuration:**
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false, // Important for mobile
    },
  },
});
```

### Data Access Patterns

**Hybrid Approach:**

| Access Pattern | When to Use | Examples |
|----------------|-------------|----------|
| **Supabase Direct** | Auth, storage, simple CRUD | Login, file uploads, read user profile |
| **FastAPI Backend** | AI operations, complex business logic | Triad generation, onboarding, Dream Self chat |

**Decision Tree:**
1. Auth or file storage? → Supabase direct
2. Simple read/write with no business logic? → Supabase direct
3. AI involvement? → FastAPI
4. Complex validation or multi-table transactions? → FastAPI

### Type Safety

| Tool | Purpose |
|------|---------|
| **supabase gen types typescript** | Generate DB types from schema |
| **Zod** | Runtime validation at API boundaries |
| **TypeScript strict mode** | Compile-time type checking |

**Type Generation Command:**
```bash
npx supabase gen types typescript --project-id <project-ref> > lib/database.types.ts
```

### Data Integrity Rules

**Immutable Tables (Append-Only):**
- `subtask_completions` - Never UPDATE or DELETE, only INSERT
- Completions are canonical truth; stats derived from these events

**Soft Delete Pattern:**
- Use `deleted_at` timestamp instead of hard DELETE
- Preserves audit trail, enables undo

### Party Mode Review Enhancements

The following action items were validated by multi-agent review (Winston, Amelia, Barry, Murat):

1. **TanStack Query Mobile Defaults**: `refetchOnWindowFocus: false` configured to prevent unnecessary refetches on app foreground
2. **Typed Zustand Stores**: All stores must be typed from day one - no `any` types
3. **Generated DB Types**: Use `supabase gen types typescript` after every schema change
4. **Supabase vs FastAPI Decision Tree**: Documented above for clear routing decisions
5. **Append-Only Protection**: `subtask_completions` table must never have UPDATE/DELETE operations

