---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - docs/prd.md
  - docs/ux-design.md
  - docs/analysis/research/market-ai-habit-productivity-apps-research-2025-12-16.md
  - docs/idea/backend.md
  - docs/idea/ai.md
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2025-12-16'
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

---

## Implementation Patterns & Consistency Rules

These patterns ensure AI agents and developers write compatible, consistent code.

### Naming Patterns

#### Database (Supabase PostgreSQL)
```sql
-- Tables: snake_case, plural
user_profiles, subtask_completions, journal_entries

-- Columns: snake_case
user_id, created_at, local_date, scheduled_for_date

-- Foreign keys: {table}_id
user_id, goal_id, subtask_instance_id

-- Indexes: idx_{table}_{columns}
idx_subtask_completions_user_date
```

#### API Endpoints (FastAPI)
```python
# REST: plural nouns, snake_case params
GET  /api/goals
POST /api/goals
GET  /api/goals/{goal_id}
POST /api/journal-entries
GET  /api/daily-aggregates/{local_date}

# Query params: snake_case
?user_id=xxx&local_date=2025-12-16
```

#### TypeScript (React Native)
```typescript
// Files: PascalCase for components
GoalCard.tsx, DailyTriad.tsx, JournalEntry.tsx

// Files: camelCase for utilities/hooks
useGoals.ts, apiClient.ts, dateUtils.ts

// Components: PascalCase
function GoalCard() {}

// Variables/functions: camelCase
const userId = "..."
function fetchGoals() {}
```

#### Python (FastAPI)
```python
# Files: snake_case
goal_router.py, journal_service.py, ai_models.py

# Functions/variables: snake_case
def get_user_goals():
    user_id = "..."

# Classes: PascalCase
class GoalCreate(BaseModel):
```

### Structure Patterns

#### Test Locations
- **Mobile**: Co-located `*.test.tsx` files (Jest + React Native Testing Library)
- **Backend**: `api/tests/` directory (pytest convention)

#### Component Organization
- `components/ui/` - Generic reusable UI (Button, Card, Input)
- `components/features/{domain}/` - Feature-specific components

### Format Patterns

#### API Response Format
```typescript
// Success response
{ "data": { ... }, "meta": { "timestamp": "2025-12-16T10:00:00Z" } }

// Error response
{ "error": { "code": "GOAL_LIMIT_REACHED", "message": "Maximum 3 active goals allowed" } }

// List response
{ "data": [...], "meta": { "total": 42, "page": 1, "per_page": 20 } }
```

#### Date Formats
```typescript
// API/Database: ISO 8601
"2025-12-16T10:30:00Z"  // timestamps with timezone
"2025-12-16"            // local_date (no time)
```

#### JSON Field Naming
- **API ↔ Database**: `snake_case` (matches PostgreSQL)
- **TypeScript internal**: `camelCase` (transform at API boundary)

### Communication Patterns

#### Event Naming
```typescript
// Pattern: domain.action (snake_case)
"journal.submitted"
"subtask.completed"
"capture.created"
"goal.activated"
```

#### State Management Boundaries
```typescript
// TanStack Query: All server data
const { data: goals } = useQuery({ queryKey: ['goals'], ... })

// Zustand: Only shared UI state
const useUIStore = create<UIState>((set) => ({
  activeFilter: 'all',
  isJournalModalOpen: false,
}))

// useState: Component-local only
const [inputValue, setInputValue] = useState('')
```

### Process Patterns

#### Error Handling
```typescript
// Error boundaries for crashes
<ErrorBoundary fallback={<CrashScreen />}><App /></ErrorBoundary>

// TanStack Query error states
const { error, isError } = useQuery(...)
if (isError) return <ErrorMessage error={error} />

// FastAPI: HTTPException with consistent format
raise HTTPException(status_code=400, detail={"code": "VALIDATION_ERROR", "message": "..."})
```

#### Loading States
```typescript
// TanStack Query provides loading states
const { isLoading, isFetching } = useQuery(...)
if (isLoading) return <GoalCardSkeleton />  // Initial load
// isFetching shows subtle indicator without blocking
```

### Enforcement Guidelines

**All AI Agents MUST:**
1. Use `snake_case` for all database columns and API parameters
2. Use `PascalCase` for React components and their files
3. Use the `{data, error, meta}` response wrapper format
4. Place tests co-located for mobile, in `tests/` for backend
5. Never UPDATE/DELETE from `subtask_completions`
6. Transform `snake_case` ↔ `camelCase` at API boundary only

**Verification:**
- TypeScript strict mode catches naming inconsistencies
- ESLint rules enforce file naming
- Database constraints prevent invalid operations

---

## Project Structure & Boundaries

### Epic to Directory Mapping

| Epic | Mobile Location | Backend Location |
|------|-----------------|------------------|
| **EP-001: Onboarding** | `app/(auth)/`, `components/features/onboarding/` | `routers/onboarding.py` |
| **EP-002: Goals** | `app/(tabs)/goals.tsx`, `components/features/goals/` | `routers/goals.py` |
| **EP-003: Daily Planning** | `app/(tabs)/home.tsx`, `components/features/triad/` | `routers/daily.py` |
| **EP-004: Captures** | `components/features/captures/` | `routers/captures.py` |
| **EP-005: Journaling** | `app/(tabs)/journal.tsx`, `components/features/journal/` | `routers/journal.py` |
| **EP-006: Progress** | `app/(tabs)/progress.tsx`, `components/features/progress/` | `routers/stats.py` |
| **EP-007: AI Coach** | `app/coach.tsx`, `components/features/coach/` | `routers/ai.py` |
| **EP-008: Notifications** | `lib/notifications.ts` | `services/notification_service.py` |

### Complete Project Directory Structure

```
weave/
├── mobile/                           # Expo React Native iOS App
│   ├── app/                          # Expo Router (file-based routing)
│   │   ├── _layout.tsx               # Root layout + providers
│   │   ├── index.tsx                 # Entry redirect
│   │   ├── (auth)/                   # Auth group (unauthenticated)
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   ├── signup.tsx
│   │   │   └── onboarding/
│   │   │       ├── archetype.tsx
│   │   │       ├── dream-self.tsx
│   │   │       └── first-goal.tsx
│   │   ├── (tabs)/                   # Main tabs (authenticated)
│   │   │   ├── _layout.tsx
│   │   │   ├── home.tsx              # Daily triad
│   │   │   ├── goals.tsx
│   │   │   ├── journal.tsx
│   │   │   └── progress.tsx
│   │   ├── goal/[id].tsx
│   │   ├── coach.tsx
│   │   └── settings.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # Generic (Button, Card, Input, Modal)
│   │   └── features/
│   │       ├── onboarding/
│   │       ├── goals/
│   │       ├── triad/
│   │       ├── captures/
│   │       ├── journal/
│   │       ├── progress/
│   │       └── coach/
│   │
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── api.ts                    # FastAPI client wrapper
│   │   ├── database.types.ts         # Generated from Supabase
│   │   └── queryClient.ts            # TanStack Query config
│   │
│   ├── hooks/
│   │   ├── useSession.ts
│   │   ├── useGoals.ts
│   │   ├── useJournal.ts
│   │   ├── useTriad.ts
│   │   └── useCaptures.ts
│   │
│   ├── stores/                       # Zustand (UI state ONLY)
│   │   ├── uiStore.ts
│   │   └── README.md                 # State boundaries doc
│   │
│   ├── types/                        # TypeScript types (Party Mode add)
│   │   ├── api.ts                    # Generated from FastAPI OpenAPI
│   │   ├── domain.ts                 # Goal, Subtask, Journal entities
│   │   └── navigation.ts             # Expo Router param types
│   │
│   ├── utils/
│   │   ├── dates.ts
│   │   └── transforms.ts             # snake_case ↔ camelCase
│   │
│   ├── __tests__/                    # Mobile tests (Party Mode add)
│   │   ├── setup.ts                  # Mock Supabase, Expo modules
│   │   ├── components/
│   │   └── hooks/
│   │
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── babel.config.js
│   ├── jest.config.js                # Test config (Party Mode add)
│   └── .env.example                  # Environment template
│
├── api/                              # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   │
│   │   ├── routers/                  # Route handlers (business logic inline for MVP)
│   │   │   ├── __init__.py
│   │   │   ├── onboarding.py
│   │   │   ├── goals.py
│   │   │   ├── daily.py
│   │   │   ├── captures.py
│   │   │   ├── journal.py
│   │   │   ├── stats.py
│   │   │   └── ai.py
│   │   │
│   │   ├── contracts/                # API contracts (Party Mode add)
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── goal.py           # Pydantic request/response
│   │   │       ├── journal.py
│   │   │       └── ai.py
│   │   │
│   │   ├── services/                 # Extract when patterns emerge
│   │   │   ├── __init__.py
│   │   │   ├── ai_service.py         # AI orchestration only
│   │   │   └── notification_service.py
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── dates.py
│   │       └── response.py
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── mocks/                    # AI mocking (Party Mode add)
│   │   │   └── ai_providers.py
│   │   ├── test_goals.py
│   │   ├── test_journal.py
│   │   └── test_ai.py
│   │
│   ├── pyproject.toml
│   ├── .python-version
│   ├── Dockerfile
│   └── .env.example
│
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 001_user_profiles.sql
│   │   ├── 002_identity_docs.sql
│   │   ├── 003_goals.sql
│   │   ├── 004_subtasks.sql
│   │   ├── 005_completions.sql
│   │   ├── 006_captures.sql
│   │   ├── 007_journal_entries.sql
│   │   └── 008_daily_aggregates.sql
│   └── seed/                         # Test fixtures (Party Mode add)
│       └── test_data.sql
│
├── docs/
│   ├── architecture.md
│   ├── prd.md
│   └── ux-design.md
│
├── .env.example
├── .gitignore
└── README.md
```

### Architectural Boundaries

#### API Boundaries

| Boundary | Location | Access |
|----------|----------|--------|
| **Public Auth** | Supabase Auth | No JWT |
| **User Data** | Supabase Direct | JWT + RLS |
| **AI Operations** | FastAPI `/api/*` | JWT required |
| **File Storage** | Supabase Storage | Signed URLs |

#### Data Flow

```
Mobile (Expo) ──┬──▶ Supabase (Auth/DB/Storage)
                │
                └──▶ FastAPI (Railway) ──▶ OpenAI/Anthropic
```

#### State Boundaries (Mobile)

| State Type | Owner | Examples |
|------------|-------|----------|
| **Server Cache** | TanStack Query | Goals, journal, completions |
| **Shared UI** | Zustand | Active filter, modal state |
| **Local** | useState | Form inputs |
| **Auth** | Supabase SDK | Session |

### Party Mode Enhancements Applied

1. **Added `mobile/types/`** - Central TypeScript types (api, domain, navigation)
2. **Added `mobile/__tests__/`** - Mobile test structure with setup.ts
3. **Added `api/app/contracts/v1/`** - Versioned API contracts layer
4. **Added `api/tests/mocks/`** - AI provider mocking for tests
5. **Added `supabase/seed/`** - Test data fixtures
6. **Simplified services/** - Keep minimal, inline logic in routers for MVP
7. **Deferred Redis/BullMQ** - Use FastAPI BackgroundTasks until latency measured

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- Expo SDK 53 + React 19 + NativeWind: Compatible, latest stable
- TanStack Query + Zustand: Complementary state management, no overlap
- FastAPI + Supabase: Both PostgreSQL-based, seamless integration
- TypeScript + Python: snake_case ↔ camelCase transform defined at API boundary

**Pattern Consistency:**
- Naming conventions align across mobile/backend
- API response format `{data, error, meta}` consistent throughout
- State boundaries (TanStack/Zustand/useState) clearly delineated

**Structure Alignment:**
- Project structure supports all architectural decisions
- Epic-to-directory mapping complete
- Integration points properly structured

### Requirements Coverage Validation ✅

**Epic Coverage:**

| Epic | Support | Notes |
|------|---------|-------|
| EP-001: Onboarding | ✅ Full | Auth group, AI service, identity docs |
| EP-002: Goals | ✅ Full | Goals router, Supabase tables, hooks |
| EP-003: Daily Planning | ✅ Full | Triad generation, home screen |
| EP-004: Captures | ✅ Full | Supabase Storage, captures router |
| EP-005: Journaling | ✅ Full | Journal router, AI recap |
| EP-006: Progress | ✅ Full | Stats router, daily_aggregates |
| EP-007: AI Coach | ✅ Full | AI router, streaming |
| EP-008: Notifications | ✅ Full | Expo Push, notification service |

**Non-Functional Requirements:**

| NFR | How Addressed |
|-----|---------------|
| Performance | TanStack Query caching, precomputed aggregates |
| Cost Control | GPT-4o-mini (90%), Sonnet (10%) |
| Security | Supabase RLS (post-MVP), JWT, signed URLs |
| Scalability | Sync MVP → BackgroundTasks → Redis at scale |

### Implementation Readiness Validation ✅

| Area | Status |
|------|--------|
| Versions documented | ✅ Expo 53, FastAPI 0.115+, Python 3.11+ |
| Patterns comprehensive | ✅ Naming, structure, format, process |
| Examples provided | ✅ Code snippets for each pattern |
| Project structure complete | ✅ Full tree with all files |
| Epic mapping | ✅ Each epic mapped to directories |

### Gap Analysis

| Gap | Priority | Resolution |
|-----|----------|------------|
| No scaffolding files | High | First implementation task |
| RLS policies | Known deferral | Before public launch |
| Redis/BullMQ | Known deferral | At 1K+ users |
| PostHog/Sentry | Known deferral | At 500+ users |

**No critical gaps blocking implementation.**

### Party Mode Validation Enhancements

**Issue Identified: Missing Failure Recovery Playbook**

The architecture silently fails when async jobs break. Added:

1. **Job Status Endpoint (MVP)**
   ```
   GET /api/ai/runs/{run_id}/status
   → { status: 'running'|'success'|'failed', error?: "..." }
   ```
   Mobile polls every 5s; shows retry option on failure.

2. **Sync Fallback for Triad**
   - If BackgroundTasks fails at journal time → generate simple triad from existing binds
   - User sees "simplified plan" vs. empty state

3. **Idempotency Spec**
   - `POST /api/subtask-completions` with duplicate `idempotency_key`
   - Returns 200 + existing record (not 409 Conflict)

4. **Notification Provider Locked**
   - **Expo Push** selected: Simple, works immediately, sufficient for MVP

**Risk Assessment After Party Mode:**

| Dimension | Status | Risk |
|-----------|--------|------|
| Coherence | ✅ | Low |
| Requirements | ✅ | Low |
| Implementability | ⚠️ | Medium (async complexity) |
| Testability | ⚠️ | Medium (queue mocking needed) |
| Failure Recovery | ✅ | Low (playbook added) |

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context analyzed (8 epics, 238 story points)
- [x] Scale assessed (MVP: 100 users → Scale: 10K)
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Tech stack specified with versions
- [x] AI model selection documented
- [x] State management architecture defined
- [x] Data access patterns clear

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] API response format defined
- [x] Test locations specified
- [x] Error handling patterns documented

**✅ Project Structure**
- [x] Complete directory tree
- [x] Epic to directory mapping
- [x] Party mode enhancements applied
- [x] Boundaries clearly defined

**✅ Validation**
- [x] Coherence validated
- [x] Requirements coverage verified
- [x] Implementation readiness confirmed
- [x] Failure recovery playbook added

### Architecture Readiness Assessment

**Overall Status:** 🟢 READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Clear MVP vs Scale separation
- Comprehensive patterns prevent AI agent conflicts
- Event-driven design for auditability
- Cost-conscious AI model selection
- Failure recovery story now complete

**Areas for Future Enhancement:**
- Context builder optimization at scale
- Queue interface abstraction for testing
- Personality version tracking in AI artifacts

---

## Architecture Completion Summary

### Workflow Completion

| Metric | Value |
|--------|-------|
| **Status** | ✅ COMPLETED |
| **Steps Completed** | 8/8 |
| **Date** | 2025-12-16 |
| **Document** | `docs/architecture.md` |

### Final Deliverables

**📋 Complete Architecture Document**
- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**
- 15+ architectural decisions made
- 6 pattern categories defined (naming, structure, format, communication, process, enforcement)
- 8 epics mapped to directories
- 8/8 requirements fully supported

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing Weave. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**
```bash
# Step 1: Initialize mobile app
npx create-expo-app weave-mobile --template blank-typescript
cd weave-mobile
npx expo install expo-router expo-linking expo-constants
npm install @supabase/supabase-js nativewind @tanstack/react-query zustand

# Step 2: Initialize backend
mkdir ../weave-api && cd ../weave-api
uv init
uv add fastapi "uvicorn[standard]" supabase python-dotenv openai anthropic pydantic-settings
```

**Development Sequence:**
1. Initialize projects using commands above
2. Set up Supabase project + run migrations
3. Implement auth flow (EP-001)
4. Build goal management (EP-002)
5. Continue through epics following architectural decisions

### Quality Assurance Checklist

**✅ Architecture Coherence**
- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions

**✅ Requirements Coverage**
- [x] All 8 epics architecturally supported
- [x] Non-functional requirements addressed
- [x] Cross-cutting concerns handled

**✅ Implementation Readiness**
- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous

---

**Architecture Status:** ✅ READY FOR IMPLEMENTATION

**Next Phase:** Create epics and stories, then begin implementation.

