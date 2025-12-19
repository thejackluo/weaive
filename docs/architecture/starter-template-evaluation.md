# Starter Template Evaluation

## Primary Technology Domains

This is a **two-stack project**:
1. **Mobile App**: React Native + Expo (iOS)
2. **Backend API**: Python FastAPI

## Current Versions (December 2025)

| Technology | Version | Notes |
|------------|---------|-------|
| Expo SDK | 53 | Includes React Native 0.79, React 19 |
| Expo Router | v5 | File-based routing, protected routes |
| Python | 3.11+ | Required for FastAPI |
| FastAPI | 0.115+ | Latest stable |
| UV | Latest | Modern Python package manager |

## Starter Options Evaluated

### Mobile (React Native + Expo)

| Option | Decision | Rationale |
|--------|----------|-----------|
| `npx create-expo-app` (blank) | **Selected** | Official, always latest SDK, clean slate |
| expo-supabase-starter | Rejected | May have outdated SDK version |
| react-native-supabase-boilerplate-2025 | Rejected | Not official Expo template |

### Backend (Python FastAPI)

| Option | Decision | Rationale |
|--------|----------|-----------|
| Manual minimal setup | **Selected** | Full control, FastAPI is already minimal |
| FastAPI-Supabase-Starter | Rejected | Inherits opinions we may not want |
| supabase-api-scaffolding-template | Rejected | Over-engineered for MVP |

## Selected Starters

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

## Project Structure (MVP)

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

## Architectural Decisions from Starter Selection

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Language (Mobile)** | TypeScript | Type safety, better DX |
| **Language (Backend)** | Python 3.11+ | FastAPI requirement, AI libs native |
| **Routing (Mobile)** | Expo Router v5 | File-based, protected routes built-in |
| **Package Manager** | npm (mobile), uv (backend) | Standard, fast |
| **Monorepo** | No (separate directories) | Simpler for 2-3 person team |

**Note:** Project initialization using these commands should be the first implementation task

---
