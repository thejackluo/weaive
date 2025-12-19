# Project Structure & Boundaries

## Epic to Directory Mapping

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

## Complete Project Directory Structure

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

## Architectural Boundaries

### API Boundaries

| Boundary | Location | Access |
|----------|----------|--------|
| **Public Auth** | Supabase Auth | No JWT |
| **User Data** | Supabase Direct | JWT + RLS |
| **AI Operations** | FastAPI `/api/*` | JWT required |
| **File Storage** | Supabase Storage | Signed URLs |

### Data Flow

```
Mobile (Expo) ──┬──▶ Supabase (Auth/DB/Storage)
                │
                └──▶ FastAPI (Railway) ──▶ OpenAI/Anthropic
```

### State Boundaries (Mobile)

| State Type | Owner | Examples |
|------------|-------|----------|
| **Server Cache** | TanStack Query | Goals, journal, completions |
| **Shared UI** | Zustand | Active filter, modal state |
| **Local** | useState | Form inputs |
| **Auth** | Supabase SDK | Session |

## Party Mode Enhancements Applied

1. **Added `mobile/types/`** - Central TypeScript types (api, domain, navigation)
2. **Added `mobile/__tests__/`** - Mobile test structure with setup.ts
3. **Added `api/app/contracts/v1/`** - Versioned API contracts layer
4. **Added `api/tests/mocks/`** - AI provider mocking for tests
5. **Added `supabase/seed/`** - Test data fixtures
6. **Simplified services/** - Keep minimal, inline logic in routers for MVP
7. **Deferred Redis/BullMQ** - Use FastAPI BackgroundTasks until latency measured

---
