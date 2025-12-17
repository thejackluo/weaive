# Story 0.1: Project Scaffolding

**Status:** in-progress
**Epic:** Epic 0 - Foundation
**Points:** 5
**Priority:** CRITICAL (Week 0 - Day 1)

---

## Story

**As a** development team,
**I want** to initialize both the mobile (Expo) and backend (FastAPI) applications with proper tooling and configuration,
**so that** we have a fully scaffolded codebase ready for feature development with consistent code quality standards.

---

## Acceptance Criteria

### AC 1: Mobile App Initialization
- [x] Expo app created using SDK 53 with blank-typescript template
- [x] React Native 0.79.x and React 19 configured
- [x] Expo Router v5 installed and configured
- [x] App runs successfully on iOS simulator without errors (Expo dev server running on port 8082)
- [x] TypeScript strict mode enabled in tsconfig.json

### AC 2: Backend API Initialization
- [x] FastAPI project initialized using `uv` package manager
- [x] Python 3.11+ as minimum version
- [x] Core dependencies installed: fastapi, uvicorn[standard], supabase, python-dotenv
- [x] AI provider libraries: openai, anthropic
- [x] Backend runs on http://localhost:8000 with health endpoint
- [x] API documentation accessible at http://localhost:8000/docs

### AC 3: Folder Structure
- [x] Mobile structure created:
  - `app/` - Expo Router pages
  - `src/components/` - Reusable UI components
  - `src/design-system/` - Design system (already exists)
  - `src/hooks/` - Custom React hooks
  - `src/services/` - API clients and services
  - `src/stores/` - Zustand state management
  - `src/types/` - TypeScript type definitions
- [x] Backend structure created:
  - `app/` - Application code
  - `app/api/` - API route handlers
  - `app/core/` - Core functionality (config, dependencies)
  - `app/services/` - Business logic services
  - `app/models/` - Pydantic models
  - `tests/` - Test files

### AC 4: Code Quality Tooling
- [x] ESLint configured for TypeScript + React Native
- [x] Prettier configured with consistent formatting
- [x] Ruff configured for Python linting
- [x] Pre-commit hooks option documented (optional for Week 0)
- [ ] All linters pass on fresh install (verification pending)

### AC 5: Environment Configuration
- [x] `.env.example` created for mobile with placeholders:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [x] `.env.example` created for backend with placeholders:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
  - `OPENAI_API_KEY`
  - `ANTHROPIC_API_KEY`
- [x] `.gitignore` files properly exclude `.env`, `node_modules/`, `__pycache__/`

### AC 6: README Documentation
- [x] Mobile README with:
  - Setup instructions (Node.js 20+, npm install, npx expo start)
  - iOS simulator launch command
  - Environment variables setup
- [x] Backend README with:
  - Setup instructions (Python 3.11+, uv installation, uv sync)
  - Local development server command
  - API documentation URL

### AC 7: Can Clone and Run in <15 Minutes
- [ ] Fresh clone → npm install → npx expo start works
- [ ] Fresh clone → uv sync → uvicorn app.main:app works
- [ ] No manual configuration required beyond copying .env.example

---

## Tasks / Subtasks

### Task 1: Initialize Mobile Application (AC: 1, 3, 4, 5, 6)
- [x] Run `npx create-expo-app weave-mobile --template blank-typescript`
- [x] Install Expo Router: `npx expo install expo-router expo-linking expo-constants`
- [x] Configure Expo Router in `app.json`:
  - [x] Add `"scheme": "weave"` for deep linking
  - [x] Enable new architecture if needed (optional for Week 0)
- [x] Install core dependencies:
  - [x] `@supabase/supabase-js` (Supabase client)
  - [x] `@tanstack/react-query` (server state)
  - [x] `zustand` (UI state)
  - [x] `nativewind` (Tailwind for RN)
  - [x] `react-native-keychain` (secure token storage)
  - [x] `@react-native-community/netinfo` (connectivity detection)
- [x] Configure TypeScript strict mode in `tsconfig.json`
- [x] Set up ESLint + Prettier with React Native presets
- [x] Create folder structure: `app/`, `src/components/`, `src/hooks/`, `src/services/`, `src/stores/`, `src/types/`
- [x] Create `.env.example` with Supabase placeholders
- [x] Update `.gitignore` to exclude `.env`, `node_modules/`
- [x] Write `mobile/README.md` with setup instructions
- [x] Verify app runs: `npx expo start --ios` (running on port 8082)

### Task 2: Initialize Backend Application (AC: 2, 3, 4, 5, 6)
- [x] Create directory: `weave-api/`
- [x] Initialize uv project: `uv init`
- [x] Add dependencies via `uv add`:
  - [x] `fastapi`
  - [x] `uvicorn[standard]`
  - [x] `supabase`
  - [x] `python-dotenv`
  - [x] `openai`
  - [x] `anthropic`
  - [x] `pydantic-settings`
- [x] Create folder structure: `app/api/`, `app/core/`, `app/services/`, `app/models/`, `tests/`
- [x] Create `app/main.py` with FastAPI app initialization
- [x] Configure CORS middleware (allow all origins for local dev, restrict in production)
- [x] Add health check endpoint: `GET /health` returns `{"status": "ok"}`
- [x] Configure Ruff in `pyproject.toml`
- [x] Create `.env.example` with all API key placeholders
- [x] Update `.gitignore` to exclude `.env`, `__pycache__/`, `.venv/`
- [x] Write `api/README.md` with setup instructions
- [x] Verify server runs: `uvicorn app.main:app --reload` (running on port 8000)
- [x] Verify API docs: http://localhost:8000/docs shows Swagger UI

### Task 3: Verify End-to-End Setup (AC: 7)
- [ ] Clone repository to fresh directory (simulate new developer)
- [ ] Time mobile setup: `npm install` → `npx expo start` (should be <10 min)
- [ ] Time backend setup: `uv sync` → `uvicorn app.main:app` (should be <5 min)
- [ ] Verify iOS simulator launches mobile app
- [ ] Verify backend health endpoint responds
- [ ] Document actual setup time in README

---

## Dev Notes

### Architecture Alignment

**Tech Stack (from Architecture Doc):**
- **Mobile:** Expo SDK 53, React Native 0.79, React 19, TypeScript (strict mode)
- **Backend:** Python 3.11+, FastAPI 0.115+, deployed on Railway
- **Package Managers:** npm/npx (mobile), uv (backend - replaces pip/poetry)
- **State Management:** TanStack Query (server state), Zustand (UI state), useState (local)
- **Styling:** NativeWind (Tailwind CSS for React Native) - design system already exists in `src/design-system/`

**Critical Requirements:**
- TypeScript strict mode must be enabled from day 1
- ESLint + Prettier configured for consistent code quality
- Environment variables MUST NOT be committed (use .env.example as template)
- All secrets stored in .env files (Supabase keys, AI API keys)

### Project Structure Notes

**Mobile App Structure:**
```
weave-mobile/
├── app/                    # Expo Router (file-based routing)
│   ├── (auth)/            # Unauthenticated routes (future)
│   └── (tabs)/            # Main authenticated tabs (future)
├── src/
│   ├── components/        # Reusable UI components
│   ├── design-system/     # Existing design system (DO NOT RECREATE)
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API clients, Supabase client
│   ├── stores/            # Zustand stores (UI state only)
│   └── types/             # TypeScript type definitions
├── .env.example           # Environment template
├── package.json
├── tsconfig.json          # TypeScript strict mode
└── README.md
```

**Backend API Structure:**
```
weave-api/
├── app/
│   ├── main.py            # FastAPI app initialization
│   ├── api/               # API route handlers
│   │   ├── __init__.py
│   │   └── health.py      # Health check endpoint
│   ├── core/              # Core functionality
│   │   ├── config.py      # Settings from .env
│   │   └── deps.py        # Dependencies (DB, AI clients)
│   ├── services/          # Business logic services
│   └── models/            # Pydantic request/response models
├── tests/                 # pytest tests (Story 0.7)
├── .env.example           # Environment template
├── pyproject.toml         # uv dependencies + Ruff config
└── README.md
```

### Dependencies Reference

**Mobile Core Dependencies (install immediately):**
```json
{
  "expo": "~53.0.0",
  "expo-router": "~5.0.0",
  "react": "19.0.0",
  "react-native": "0.79.0",
  "@supabase/supabase-js": "^2.50.0",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^5.0.0",
  "nativewind": "^4.0.0",
  "react-native-keychain": "^8.0.0",
  "@react-native-community/netinfo": "^11.0.0"
}
```

**Backend Core Dependencies (uv add):**
```toml
[project]
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.32.0",
    "supabase>=2.10.0",
    "python-dotenv>=1.0.0",
    "openai>=1.55.0",
    "anthropic>=0.40.0",
    "pydantic-settings>=2.6.0",
]
```

### Testing Standards (Story 0.7 will set up infrastructure)

- Mobile: Jest + React Native Testing Library (Story 0.7)
- Backend: pytest + httpx (Story 0.7)
- No tests required for Story 0.1 (just scaffolding)
- Linting must pass: `npm run lint` (mobile), `ruff check .` (backend)

### Security Considerations

**CRITICAL - DO NOT COMMIT SECRETS:**
- Add `.env` to `.gitignore` immediately
- Use `.env.example` with placeholder values only
- Never hardcode API keys in source code
- Token storage (Story 0.3) will use react-native-keychain

### Performance Considerations

- No performance requirements for Story 0.1 (scaffolding only)
- TanStack Query configuration (staleTime, cacheTime) will be done in Story 1.1+

### Integration Points

**Upcoming Stories:**
- **Story 0.2:** Will add Supabase project and database migrations
- **Story 0.3:** Will implement authentication using Supabase Auth
- **Story 0.5:** Will add GitHub Actions CI/CD using these configurations
- **Story 0.7:** Will add test infrastructure (Jest, pytest)

### Known Limitations

- No authentication yet (Story 0.3)
- No database yet (Story 0.2)
- No tests yet (Story 0.7)
- Health endpoint is a placeholder (no business logic)

### Quick Verification Code Snippets

**Mobile - Placeholder Home Screen (`app/(tabs)/index.tsx`):**
```typescript
import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold">Weave MVP</Text>
      <Text className="mt-2 text-gray-600">Foundation Setup Complete ✅</Text>
    </View>
  );
}
```

**Backend - Health Check (`app/api/health.py`):**
```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "ok",
        "service": "weave-api",
        "version": "0.1.0"
    }
```

**Backend - Main App (`app/main.py`):**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import health

app = FastAPI(
    title="Weave API",
    description="Backend API for Weave MVP",
    version="0.1.0"
)

# CORS - Allow all for local dev (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])

@app.get("/")
async def root():
    return {"message": "Weave API - Foundation Ready"}
```

### References

- [Source: docs/architecture.md#mvp-must-have-components]
- [Source: docs/architecture.md#tech-stack]
- [Source: docs/epics.md#story-01-project-scaffolding]
- [Source: CLAUDE.md#tech-stack]
- [Source: CLAUDE.md#project-structure]

---

## Dev Agent Record

### Context Reference

<!-- This story was created by the enhanced create-story workflow -->
<!-- All context from epics, architecture, and PRD has been analyzed and included above -->

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Implementation Notes

**Day 1 Focus:** Complete mobile and backend initialization so developers can start building features tomorrow.

**Time Estimate:**
- Mobile setup: 30-45 minutes
- Backend setup: 30-45 minutes
- Documentation: 15-30 minutes
- Verification: 15 minutes
- **Total:** 1.5-2 hours

**Success Metrics:**
- Fresh clone → Both apps running in <15 minutes
- All linters pass
- README instructions are clear and complete
- No secrets in repository

### Completion Checklist

Before marking this story as done:
- [ ] All 7 acceptance criteria verified
- [ ] Both apps run without errors
- [ ] Linters pass (ESLint, Ruff)
- [ ] README documentation complete and accurate
- [ ] .gitignore prevents committing secrets
- [ ] Code reviewed (Story 0.1 → code-review workflow)

### File List

**Files to Create:**
```
mobile/
├── app/
│   └── (tabs)/
│       └── index.tsx              # Placeholder home screen
├── src/
│   ├── components/.gitkeep
│   ├── hooks/.gitkeep
│   ├── services/
│   │   └── supabase.ts           # Supabase client (future)
│   ├── stores/.gitkeep
│   └── types/.gitkeep
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
└── README.md

api/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── health.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── deps.py
│   ├── services/
│   │   └── __init__.py
│   └── models/
│       └── __init__.py
├── tests/
│   └── __init__.py
├── .env.example
├── .gitignore
├── pyproject.toml
├── README.md
└── uv.lock                        # Auto-generated
```

**Total Files:** ~25 files (including config files and placeholders)

---

**Story Status:** ready-for-dev ✅

**Ultimate Context Engine Analysis:** ✅ Complete
All architecture, epics, and PRD context has been thoroughly analyzed and included. The developer has everything needed for flawless implementation.

**Next Action:** Run `/bmad:bmm:workflows:dev-story` to implement this story.
