# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Weave** - Turn vague goals into daily wins, proof, and a stronger identity in 10 days.

**Target Users:** Ambitious but chaotic students and builders (high intent, inconsistent execution)

**Current Stage:** 🚀 **Active Implementation** (Story-based development, MVP in progress)

## Tech Stack

- **Mobile:** React Native (Expo SDK 53, React 19, TypeScript) - **✅ Implemented**
- **Backend:** Python FastAPI (Python 3.11+, uv for dependencies) - **✅ Implemented**
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **AI Models:** GPT-4o, GPT-4o-mini (OpenAI), Claude 3.7 Sonnet, Claude 3.5 Haiku (Anthropic)
- **Push Notifications:** Expo Push (iOS APNs)
- **State Management:** TanStack Query (server state), Zustand (UI state), useState (local)
- **Styling:** NativeWind (Tailwind CSS for React Native)

---

## 🚨 Development Standards (MANDATORY FOR ALL AGENTS)

**Epic 1.5: Development Infrastructure** established standardized patterns for all development. **ALL agents MUST follow these standards when implementing ANY story.**

### When to Use Each Standard

| If You're Implementing... | Follow This Standard | Reference File |
|----------------------------|---------------------|----------------|
| **Navigation/Screens** (any UI screen) | **Story 1.5.1: Navigation Patterns** | `docs/stories/1-5-1-navigation-architecture.md` |
| **API Endpoints** (FastAPI routes) | **Story 1.5.2: Backend Patterns** | `docs/stories/1-5-2-backend-standardization.md` |
| **Database Models** (Supabase tables) | **Story 1.5.2: Backend Patterns** | `docs/stories/1-5-2-backend-standardization.md` |
| **AI Services** (text/image/audio AI) | **Story 1.5.3: AI Service Patterns** | `docs/stories/1-5-3-ai-services-standardization.md` |

### Story 1.5.1: Navigation/Frontend Patterns

**Use when:** Creating screens, navigation flows, or UI components

**Standards Include:**
- ✅ File-based routing with Expo Router (`app/` directory structure)
- ✅ Screen placeholder templates (3-tab navigation: Home, Goals, Journal, Progress)
- ✅ Navigation patterns (tabs, modals, stacks)
- ✅ Design system component usage (`@/design-system`)
- ✅ State management boundaries (TanStack Query, Zustand, useState)

**Quick Checklist:**
- [ ] Use `app/(tabs)/` for main navigation screens
- [ ] Import design system components from `@/design-system`
- [ ] Use TanStack Query for server data (NOT Zustand)
- [ ] Follow `PascalCase` for component files

**Full Spec:** `docs/stories/1-5-1-navigation-architecture.md`

---

### Story 1.5.2: Backend/API Patterns

**Use when:** Creating API endpoints, database models, or backend services

**Standards Include:**
- ✅ API endpoint naming (`GET /api/goals`, `POST /api/completions`)
- ✅ Pydantic request/response models (`{Resource}Create`, `{Resource}Response`)
- ✅ Database model conventions (`snake_case`, plural tables, soft delete)
- ✅ Error handling patterns (standard error codes, HTTP status codes)
- ✅ Testing patterns (pytest fixtures, integration tests)
- ✅ Service layer decision tree (when to create services vs inline logic)

**Quick Checklist:**
- [ ] Use `snake_case` for all API params and DB columns
- [ ] Follow REST naming: `GET /api/{resources}`, `POST /api/{resources}`
- [ ] Use `{data, meta}` response wrapper format
- [ ] Create Pydantic models: `{Resource}Create`, `{Resource}Response`
- [ ] Add error handling with standard codes (`VALIDATION_ERROR`, `NOT_FOUND`, etc.)
- [ ] Write pytest tests in `tests/test_{resource}_api.py`

**Templates Available:**
- API endpoint template (FastAPI router with auth, validation, error handling)
- Database model template (BaseModel with timestamps, soft delete)
- Pydantic schema template (request/response models)

**Full Spec:** `docs/stories/1-5-2-backend-standardization.md`
**Developer Guide:** `docs/dev/backend-patterns-guide.md` (created by Story 1.5.2)

---

### Story 1.5.3: AI Services Patterns

**Use when:** Integrating AI features (text generation, image analysis, voice transcription)

**Standards Include:**
- ✅ Unified `AIProviderBase` abstraction for all AI modalities
- ✅ Text AI patterns (OpenAI GPT-4o-mini, Claude 3.7 Sonnet fallback)
- ✅ Image AI patterns (Gemini 3.0 Flash, GPT-4o Vision fallback)
- ✅ Audio AI patterns (AssemblyAI, Whisper API fallback)
- ✅ Cost tracking (log to `ai_runs` table with tokens, cost, duration)
- ✅ Rate limiting (10 text calls/hr, 5 image analyses/day, 50 transcriptions/day)
- ✅ React Native hooks for AI services

**Quick Checklist:**
- [ ] Use `AIProviderBase` abstract class for new AI providers
- [ ] Implement fallback chain (Primary → Secondary → Graceful degradation)
- [ ] Log ALL AI calls to `ai_runs` table (cost tracking)
- [ ] Check rate limits before AI calls (use `daily_aggregates` table)
- [ ] Use standard React hooks:
  - `useAIChat()` for text AI
  - `useImageAnalysis()` for image AI
  - `useVoiceTranscription()` for audio AI
- [ ] Handle errors with standard loading states ("Generating...", "Analyzing...")

**Provider Decision Tree:**
| Use Case | Primary Provider | Fallback | Cost |
|----------|------------------|----------|------|
| **Text Generation** (Triad, Journal feedback) | GPT-4o-mini | Claude 3.7 Sonnet | $0.15/$0.60 per MTok |
| **Complex Reasoning** (Onboarding, Dream Self) | Claude 3.7 Sonnet | GPT-4o | $3.00/$15.00 per MTok |
| **Image Analysis** (Proof validation, OCR) | Gemini 3.0 Flash | GPT-4o Vision | $0.02/image |
| **Voice Transcription** (STT) | AssemblyAI | Whisper API | $0.15/hr |

**Full Spec:** `docs/stories/1-5-3-ai-services-standardization.md`
**Developer Guide:** `docs/dev/ai-services-guide.md` (created by Story 1.5.3)

---

### 🎯 Before Writing ANY Code

**STEP 1: Identify the type of work**
- Navigation/UI screen? → Story 1.5.1
- API endpoint/database? → Story 1.5.2
- AI integration? → Story 1.5.3

**STEP 2: Read the relevant standardization story**
- Open `docs/stories/[story-file].md`
- Review patterns, templates, examples
- Check acceptance criteria

**STEP 3: Follow the standard**
- Use templates and conventions
- Don't reinvent patterns
- Maintain consistency

**STEP 4: Reference in implementation**
- Mention which standard you're following
- Link to story file in code comments (optional but helpful)

---

### ❌ What NOT to Do

**DON'T:**
- ❌ Create custom navigation patterns (use Story 1.5.1 structure)
- ❌ Invent new API response formats (use `{data, meta}` wrapper)
- ❌ Skip error handling (use standard error codes)
- ❌ Create new AI provider patterns (use `AIProviderBase` abstraction)
- ❌ Ignore rate limiting (check `daily_aggregates` before AI calls)
- ❌ Use different naming conventions (follow `snake_case` DB, `camelCase` TS)

**DO:**
- ✅ Read standardization stories BEFORE implementing features
- ✅ Copy-paste templates from standardization stories
- ✅ Ask "Does a pattern already exist for this?" before creating custom solutions
- ✅ Reference standardization stories in PR descriptions

---

### 📚 Quick Links

- **Navigation Patterns:** `docs/stories/1-5-1-navigation-architecture.md`
- **Backend Patterns:** `docs/stories/1-5-2-backend-standardization.md` + `docs/dev/backend-patterns-guide.md`
- **AI Service Patterns:** `docs/stories/1-5-3-ai-services-standardization.md` + `docs/dev/ai-services-guide.md`
- **Architecture Rules:** `docs/architecture/implementation-patterns-consistency-rules.md`

---

## Common Development Commands

### Mobile Development (weave-mobile/)

```bash
cd weave-mobile

# Start Expo dev server (most common)
npm start

# Start with cache cleared (if experiencing issues)
npm run start:clean

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Lint code
npm run lint

# Format code
npm run format

# Full reset (when node_modules corrupted)
npm run reset
```

### Backend Development (weave-api/)

```bash
cd weave-api

# Run development server
uv run uvicorn app.main:app --reload

# Run with 5-second timeout (for testing startup)
timeout 5 uv run uvicorn app.main:app --reload

# Run tests
uv run pytest
uv run pytest tests/test_goals.py -v

# Add dependencies
uv add fastapi supabase anthropic

# Lint with ruff
uv run ruff check .
```

### Production Deployment (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to production project (one-time setup)
cd weave-api
railway link <project-id>

# Deploy to production
railway up

# View production logs
railway logs

# View deployment status
railway status

# Rollback to previous deployment
railway deployments
railway deployment rollback <deployment-id>

# Manage environment variables
railway variables
railway variables set SUPABASE_URL=https://xxx.supabase.co
```

**Production URL:** `https://weave-api-production.railway.app`

**Automatic Deployment:** Pushes to `main` branch automatically trigger Railway deployment via GitHub Actions (`.github/workflows/railway-deploy.yml`)

### Documentation Viewer

```bash
# View all documentation in browser
./dev/docs-viewer/scripts/serve.sh    # Mac/Linux
.\dev\docs-viewer\scripts\serve.ps1   # Windows

# Then open: http://localhost:3030
```

### MCP Tools Verification

```bash
bash scripts/verify-mcp-setup.sh      # Mac/Linux
.\scripts\verify-mcp-setup.ps1        # Windows
```

### CI/CD Commands

```bash
# View all workflows
gh workflow list

# View workflow runs
gh run list --workflow=mobile-lint
gh run list --status=failure    # Failed runs only

# Re-run failed workflow
gh run rerun <run-id>

# Trigger manual EAS Build
gh workflow run eas-build.yml --ref main --field platform=ios

# View GitHub Actions caches
gh cache list

# Clear specific cache
gh cache delete <cache-id>

# Clear all caches (if corruption suspected)
gh cache list | awk '{print $1}' | xargs -I {} gh cache delete {}
```

**Troubleshooting:** See `docs/dev/ci-cd-setup.md` for detailed guide on secrets setup, common failures, and fixes.

## Development Workflow

### Story-Based Development

This project uses **story-based development** with BMAD methodology:

1. **Stories are in:** `docs/stories/` (e.g., `0-1-project-scaffolding.md`, `1-1-welcome-vision-hook.md`)
2. **Git branches:** `story/X.Y` format (e.g., `story/0.1`, `story/1.1`)
3. **Sprint artifacts:** Implementation summaries in `docs/sprint-artifacts/`
4. **Main branch:** `main` (use for PRs)

**Typical workflow:**
```bash
# 1. Check current story
git branch  # You're likely on story/X.Y

# 2. Read the story file
# Example: docs/stories/0-3-authentication-flow.md

# 3. Implement the story
cd weave-mobile  # or weave-api
# Make changes...

# 4. Test locally
npm start  # or uv run uvicorn...

# 5. Commit and push
git add .
git commit -m "feat: implement authentication flow"
git push origin story/0.3

# 6. Create PR to main when done
gh pr create --base main
```

### When Working on a Story

1. **Read the story file first** - Stories are detailed specs with acceptance criteria
2. **Check sprint artifacts** - See `docs/sprint-artifacts/` for implementation notes from previous sessions
3. **Follow the acceptance criteria** - Don't add scope beyond what's specified
4. **Update sprint artifacts** - Document significant decisions or blockers
5. **Test before committing** - Mobile: test on simulator; Backend: run pytest

### Page-Based Implementation (Current Primary Mode)

**Status:** 🚀 **ACTIVE** - Page-based approach for cohesive, vertical-slice development

**Key Insight:** Instead of implementing epics sequentially, organize implementation by **user-facing pages** that group related epics into complete, cohesive units.

**Navigation Model:** Bottom tab navigation (3 main tabs) + profile/settings

**Four Main Pages:**
1. **Thread Page** (Epic 3 + 4) - Daily action loop
2. **Dashboard Page** (Epic 2 + 5) - Goal management + progress visualization
3. **Weave AI Page** (Epic 6) - AI coaching chat
4. **Profile & Settings** (Epic 7 + 8) - Notifications + account management

**Workflow:**
1. **User provides:** Wireframe/screenshot for a page (e.g., Thread, Dashboard)
2. **User explains:** "This screen shows X, when user taps Y, navigate to Z"
3. **Claude references:** The page document (`docs/pages/[page-name].md`) for functional requirements
4. **Claude implements:** Using wireframe for UX/layout + page doc for acceptance criteria
5. **Build → Test → Iterate:** Complete vertical slices end-to-end

**Example session:**
```
User: [Shows wireframe] "This is the Dashboard page.
      Shows active needles as cards, has a FAB to add new goal, plus heat map and fulfillment chart below.
      This covers Epic 2 (Goal Management) and Epic 5 (Progress Visualization)."

Claude: "Got it. I see:
        - Wireframe: Card-based needle list, FAB bottom-right, heat map + chart below
        - Page doc: docs/pages/dashboard-page.md covers all Epic 2 + 5 stories
        Questions: Should the heat map be collapsed by default? Timeframe filter placement?"

User: [Answers]

Claude: [Implements using design system, following both wireframe AND page doc criteria]
```

**What matters from wireframes:**
- ✅ Visual layout and component hierarchy
- ✅ Navigation patterns (tabs, modals, screens)
- ✅ Primary user interactions (taps, swipes, forms)
- ✅ Screen organization and information architecture

**What matters from page documents:**
- ✅ Functional requirements and acceptance criteria (from epics/stories)
- ✅ Data model and API contracts
- ✅ Business logic and validation rules
- ✅ Edge cases and error handling
- ✅ Page completion criteria

**What Claude maintains:**
- ✅ Consistency with existing architecture (three-layer data model, RLS patterns, API format)
- ✅ Reuse of design system components and tokens
- ✅ Following established patterns (state management, naming conventions)
- ✅ Checking both wireframe AND page doc acceptance criteria

**Benefits:**
- ✅ Complete vertical slices (fully functional pages)
- ✅ Natural cohesion (features grouped by user intent)
- ✅ Parallel development possible (teams can work on different pages)
- ✅ Testable units (clear page completion criteria)

**Priority:** Ship complete pages that match wireframes AND meet all acceptance criteria

**Page Documentation:** See `docs/pages/` for detailed page specs and `docs/implementation-strategy.md` for comprehensive guide

## Project Structure (Current Reality)

```
weavelight/
├── weave-mobile/                # ✅ Expo React Native app (ACTIVE)
│   ├── app/                     # Expo Router (file-based routing)
│   │   ├── (auth)/              # Auth screens (login, signup)
│   │   ├── (onboarding)/        # Onboarding flow
│   │   ├── (tabs)/              # Main app tabs
│   │   ├── _layout.tsx          # Root layout
│   │   └── index.tsx            # Entry point
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── constants/           # App constants
│   │   ├── contexts/            # React contexts
│   │   ├── design-system/       # Design system components
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API/Supabase services
│   │   ├── stores/              # Zustand stores
│   │   └── types/               # TypeScript types
│   ├── package.json             # Dependencies and scripts
│   └── ...
│
├── weave-api/                   # ✅ FastAPI backend (ACTIVE)
│   ├── app/
│   │   ├── api/                 # API routes
│   │   ├── core/                # Core config
│   │   ├── models/              # Database models
│   │   ├── services/            # Business logic
│   │   └── main.py              # FastAPI app entry
│   ├── tests/                   # Pytest tests
│   ├── pyproject.toml           # Python dependencies (uv)
│   └── ...
│
├── src/
│   └── design-system/           # Root-level design system (reference)
│       ├── components/          # Button, Card, Input, Text, etc.
│       ├── tokens/              # Colors, typography, spacing
│       └── theme/               # ThemeContext and hooks
│
├── docs/
│   ├── production/              # 📁 Production deployment, compliance, legal (NEW)
│   │   ├── README.md            # Production docs overview
│   │   ├── PRODUCTION_DEPLOYMENT_MANUAL.md  # Step-by-step deployment guide
│   │   ├── CODE_REVIEW_FIXES_SUMMARY.md     # Code review fixes log (Story 9.1)
│   │   ├── production-readiness-checklist.md # Pre-launch checklist
│   │   ├── test-validation-guide.md          # How to verify all tests pass
│   │   ├── compliance-legal-checklist.md     # Compliance and legal requirements
│   │   ├── pre-deployment-verification.md    # Automated verification guide
│   │   └── scripts/             # Automated verification scripts
│   │       ├── pre-deployment-verification.sh
│   │       └── run-all-tests.sh
│   │
│   ├── pages/                   # 📁 Page-based implementation guides
│   │   ├── thread-page.md       # Epic 3 + 4 (Daily actions + reflection)
│   │   ├── dashboard-page.md    # Epic 2 + 5 (Goals + progress viz)
│   │   ├── weave-ai-page.md     # Epic 6 (AI coaching)
│   │   └── profile-settings.md  # Epic 7 + 8 (Notifications + settings)
│   │
│   ├── architecture/            # 📁 Sharded architecture docs
│   │   ├── index.md             # Table of contents
│   │   ├── core-architectural-decisions.md
│   │   ├── implementation-patterns-consistency-rules.md
│   │   └── ...                  # 8 more section files
│   │
│   ├── prd/                     # 📁 Sharded PRD docs
│   │   ├── index.md             # Table of contents
│   │   ├── implementation-pages.md  # Page → Epic mapping (NEW)
│   │   ├── product-vision.md
│   │   ├── epic-0-foundation.md
│   │   ├── epic-1-onboarding-optimized-hybrid-flow.md
│   │   └── ...                  # 26+ total section files
│   │
│   ├── stories/                 # 📁 Story specifications
│   │   ├── 0-1-project-scaffolding.md
│   │   ├── 0-2a-database-schema-core.md
│   │   ├── 0-3-authentication-flow.md
│   │   ├── 1-1-welcome-vision-hook.md
│   │   ├── ...                  # 15+ story files
│   │   └── validation-reports/  # Post-implementation validation
│   │       ├── validation-report-story-0.4-20251219.md
│   │       └── ...              # 4 validation reports
│   │
│   ├── testing/                 # 📁 Testing documentation
│   │   ├── README.md            # Testing structure guide
│   │   ├── test-design.md       # Overall testing strategy
│   │   ├── atdd/                # Story-level ATDD checklists
│   │   │   ├── atdd-checklist-story-1.6.md
│   │   │   └── ...              # 4 ATDD checklists
│   │   └── epic/                # Epic-level test design
│   │       ├── test-design-epic-0.md
│   │       └── ...              # 3 epic test designs
│   │
│   ├── sprint-artifacts/        # 📁 Implementation summaries & change proposals
│   │   ├── README.md            # Sprint workflow guide
│   │   ├── sprint-change-proposals/  # Scope changes during sprint
│   │   │   ├── sprint-change-proposal-story-1.7-2025-12-18.md
│   │   │   └── ...              # 5 change proposals
│   │   ├── epic-retrospectives/ # Post-epic learnings
│   │   │   └── epic-0-retrospective-2025-12-20.md
│   │   ├── design-system-old/   # Archived design system docs
│   │   │   └── ...              # 3 archived files
│   │   ├── story-0.3-implementation-summary.md  # Active story artifacts
│   │   └── ...                  # 14 story files at root
│   │
│   ├── meta/                    # 📁 Documentation about documentation
│   │   ├── README.md            # Meta-documentation guide
│   │   └── documentation-reorganization-2025-12-21.md
│   │
│   ├── idea/                    # Original deep specs (1000+ lines each)
│   │   ├── mvp.md               # Complete product MVP spec
│   │   ├── backend.md           # Backend architecture + DB schema
│   │   ├── ai.md                # AI system design
│   │   └── ux.md                # UX design system
│   │
│   ├── dev/                     # Developer guides
│   │   ├── ai-service-integration-guide.md  # Integrating AI services (Story 0.11)
│   │   ├── design-system-guide.md
│   │   ├── docs-viewer-guide.md
│   │   ├── git-workflow-guide.md
│   │   ├── bmad-implementation-guide.md
│   │   └── mcp-quick-reference.md
│   │
│   ├── bugs/                    # Bug reports and solutions
│   │   ├── metro-path-alias-cache-issue-2025-12-18.md
│   │   ├── nativewind-styling-issue-2025-12-17.md
│   │   └── ...
│   │
│   ├── archive/                 # Archived single-file docs
│   │   ├── architecture.md      # Original before sharding
│   │   └── prd.md               # Original before sharding
│   │
│   ├── bmm-workflow-status.yaml # BMAD workflow progress
│   ├── implementation-strategy.md # Page-based implementation guide (NEW)
│   ├── epics.md                 # Implementation epics
│   ├── test-design.md           # Testing strategy
│   └── ...
│
├── dev/
│   └── docs-viewer/             # Documentation viewer tool
│       ├── index.html           # Beautiful UI
│       └── scripts/             # Server scripts
│
├── .bmad/                       # BMAD methodology system
│   ├── core/                    # Core workflows and agents
│   ├── bmm/                     # BMM (methodology module)
│   └── _cfg/                    # Configuration
│
├── .claude/                     # Claude Code configuration
│   ├── hooks/                   # Event hooks
│   ├── personalities/           # Claude personalities
│   └── settings.json            # Settings
│
└── scripts/                     # Utility scripts
    └── verify-mcp-setup.sh
```

## Documentation Navigation

**Documentation is now SHARDED** - no more single 1000+ line files!

### When to Read What

| Task | Read This | Why |
|------|-----------|-----|
| **Implementing a page** | `docs/pages/[page-name].md` | **Complete page spec with all stories, wireframe requirements, and completion criteria** |
| Understanding page-based strategy | `docs/implementation-strategy.md` | Comprehensive guide to page-based implementation |
| Implementing a story | `docs/stories/[story-name].md` | Detailed spec with acceptance criteria |
| Understanding product vision | `docs/prd/product-vision.md` | High-level goals and user personas |
| Understanding an epic | `docs/prd/epic-[N]-[name].md` | Epic breakdown and requirements |
| Page → Epic mapping | `docs/prd/implementation-pages.md` | How pages group epics together |
| Architecture decisions | `docs/architecture/core-architectural-decisions.md` | Tech stack, patterns, rationale |
| Database schema | `docs/idea/backend.md` (lines 200-800) | Complete schema with relationships |
| API patterns | `docs/architecture/implementation-patterns-consistency-rules.md` | Code conventions and guardrails |
| **Production deployment** | `docs/production/PRODUCTION_DEPLOYMENT_MANUAL.md` | Step-by-step Railway deployment guide (Story 9.1) |
| **Production readiness check** | `docs/production/production-readiness-checklist.md` | Complete pre-launch checklist (code, security, compliance, legal) |
| **Verifying all tests pass** | `docs/production/test-validation-guide.md` | How to run and verify backend + mobile + RLS tests |
| **Compliance & legal** | `docs/production/compliance-legal-checklist.md` | Privacy policy, ToS, GDPR, CCPA, App Store compliance |
| **Pre-deployment verification** | `docs/production/scripts/pre-deployment-verification.sh` | Automated script to verify production readiness |
| **Integrating AI services** | `docs/dev/ai-service-integration-guide.md` | Environment config, provider abstraction, fallback chains |
| Design system usage | `docs/dev/design-system-guide.md` | Components, tokens, examples |
| Git workflow | `docs/dev/git-workflow-guide.md` | Branching, commits, PRs |
| **ATDD checklist for a story** | `docs/testing/atdd/atdd-checklist-story-[X.X].md` | Acceptance criteria and test scenarios |
| **Epic-level test design** | `docs/testing/epic/test-design-epic-[X].md` | Strategic test plans spanning multiple stories |
| **Overall testing strategy** | `docs/testing/test-design.md` | Testing methodology and standards |
| **Story implementation notes** | `docs/sprint-artifacts/story-[X.X]-*.md` | Implementation decisions and outcomes |
| **Sprint scope changes** | `docs/sprint-artifacts/sprint-change-proposals/` | Mid-sprint scope adjustments |
| **Epic retrospective** | `docs/sprint-artifacts/epic-retrospectives/` | Post-epic learnings and insights |
| **Story validation results** | `docs/stories/validation-reports/` | Post-implementation validation |
| **Documentation organization** | `docs/meta/` | How docs are structured and why |
| Debugging common issues | `docs/bugs/[issue-name].md` | Known bugs and solutions |
| Deep product context | `docs/idea/mvp.md` | 1600-line comprehensive spec (only if needed) |

**Tip:** Use `docs/architecture/index.md`, `docs/prd/index.md`, or `docs/pages/` as navigation starting points.

## Naming Conventions

### Database (Supabase PostgreSQL)
- Tables: `snake_case`, plural (e.g., `user_profiles`, `subtask_completions`)
- Columns: `snake_case` (e.g., `user_id`, `created_at`, `local_date`)
- Foreign keys: `{table}_id` (e.g., `user_id`, `goal_id`)
- Indexes: `idx_{table}_{columns}` (e.g., `idx_subtask_completions_user_date`)

### API Endpoints (FastAPI)
- REST: plural nouns, `snake_case` params
- Examples: `GET /api/goals`, `POST /api/journal-entries`, `GET /api/daily-aggregates/{local_date}`
- Query params: `snake_case` (e.g., `?user_id=xxx&local_date=2025-12-16`)

### TypeScript (React Native)
- Component files: `PascalCase` (e.g., `GoalCard.tsx`, `DailyTriad.tsx`)
- Utility/hook files: `camelCase` (e.g., `useGoals.ts`, `apiClient.ts`)
- Components: `PascalCase` (e.g., `function GoalCard() {}`)
- Variables/functions: `camelCase` (e.g., `const userId = "..."`, `function fetchGoals() {}`)

### Python (FastAPI)
- Files: `snake_case` (e.g., `goal_router.py`, `journal_service.py`)
- Functions/variables: `snake_case` (e.g., `def get_user_goals():`)
- Classes: `PascalCase` (e.g., `class GoalCreate(BaseModel):`)

## Critical Guardrails

### Data Integrity

**NEVER UPDATE or DELETE from these tables** - they are append-only event logs:
- `subtask_completions` (canonical completion events)
- `captures` (proof photos, notes, audio)
- `journal_entries` (daily reflections)

**Why:** These are canonical truth. Stats and views are recomputed from these events. Editing them corrupts historical data.

**Alternative:** If a completion was logged incorrectly, add a new row with `is_correction: true` that references the original. Never delete the original event.

### Common Pitfalls (From `docs/bugs/`)

1. **Metro cache issues** - If imports fail after moving files, run `npm run start:clean`
2. **NativeWind styles not applying** - Check that component is inside the ThemeProvider
3. **Path aliases not resolving** - Use `@/design-system` not `~/design-system`
4. **React Native module errors** - Don't use Node.js-only modules (fs, path) in React Native code
5. **Babel plugin validation errors** - Check `babel.config.js` plugin order (nativewind must be last)

**If you encounter a bug:** Check `docs/bugs/` first - it likely has a solution.

### NPM Dependency Management

**🚨 CRITICAL: NEVER use `--legacy-peer-deps` or `--force` flags with npm install**

**Why:** These flags are extremely dangerous and can cause:
- Silent dependency conflicts that break production
- Security vulnerabilities from mismatched package versions
- Difficult-to-debug issues that only appear in specific environments
- Package corruption that requires full `node_modules` cleanup

**Correct Approach for Peer Dependency Conflicts:**

```bash
# ❌ NEVER DO THIS
npm install --legacy-peer-deps
npm install --force

# ✅ INSTEAD, FIX THE ROOT CAUSE
1. Identify the conflicting packages (npm will tell you)
2. Pin exact versions to match peer dependencies
3. Update/downgrade packages to compatible versions
4. Run clean install: rm -rf node_modules package-lock.json && npm install
```

**Example: Fixing React Version Conflicts**
```json
// ❌ BAD - Allows version upgrades that break peer deps
"react-test-renderer": "^19.1.0"

// ✅ GOOD - Pins exact version to match React 19.1.0
"react-test-renderer": "19.1.0"
```

**If npm install fails with peer dependency errors:**
1. Read the error message carefully - it tells you exactly what's incompatible
2. Check which package versions are required
3. Pin exact versions in `package.json` to match
4. Never use `--legacy-peer-deps` as a shortcut

**Backend (Python/uv):** Similar principle applies - never use `--no-deps` or skip dependency resolution. Always fix conflicts at the root cause.

### Design System Usage

**Always use the design system components - never hardcode styles:**

```tsx
// ✅ GOOD
import { Button, Card, Text } from '@/design-system';
<Card variant="glass">
  <Text variant="displayLg">Welcome</Text>
  <Button onPress={handlePress}>Get Started</Button>
</Card>

// ❌ BAD - Don't hardcode colors or spacing
<View style={{ backgroundColor: '#1a1a1a', padding: 16 }}>
  <Text style={{ fontSize: 32, color: '#fff' }}>Welcome</Text>
  <TouchableOpacity style={{ backgroundColor: '#3b82f6' }}>
    <Text>Get Started</Text>
  </TouchableOpacity>
</View>
```

**📖 Full guide:** `docs/dev/design-system-guide.md`

### State Management

**Use the right tool for the right state:**

| State Type | Tool | Example |
|------------|------|---------|
| **Server data** | TanStack Query | Goals, completions, user profile |
| **Cross-component UI** | Zustand | Active filters, modal state, theme |
| **Local component** | useState | Form inputs, toggles, counters |

**Don't use Zustand for server data** - use TanStack Query with proper cache invalidation.

## Architecture Principles

### Three-Layer Data Model

1. **Static Text Database** - Demographics, stable profile fields, identity documents
2. **Dynamic Text Database (Artifact Store)** - Goals, subtasks, journal entries, AI outputs, computed stats
3. **Image Storage** - User uploads, proof captures, identity visuals

### Data Access Strategy

| Access Pattern | When to Use | Examples |
|----------------|-------------|----------|
| **Supabase Direct** | Auth, storage, simple CRUD | Login, file uploads, read user profile |
| **FastAPI Backend** | AI operations, complex business logic | Triad generation, onboarding, Dream Self chat |

**Decision Tree:**
1. Auth or file storage? → Supabase direct
2. Simple read/write with no business logic? → Supabase direct
3. AI involvement? → FastAPI
4. Complex validation or multi-table transactions? → FastAPI

### API Response Format

All API responses must follow this format:

```typescript
// Success response
{ "data": { ... }, "meta": { "timestamp": "2025-12-16T10:00:00Z" } }

// Error response
{ "error": { "code": "GOAL_LIMIT_REACHED", "message": "Maximum 3 active goals allowed" } }

// List response
{ "data": [...], "meta": { "total": 42, "page": 1, "per_page": 20 } }
```

## Terminology Mapping

Product terms used in UI/docs vs. technical database terms:

| MVP Term | Technical Term | Purpose |
|----------|---------------|---------|
| **Needle** | Goal | Top-level user goals (max 3 active) |
| **Bind** | Subtask | Consistent actions/habits toward goals |
| **Thread** | User/Identity | User's starting state and identity |
| **Weave** | Progress/Stats | User's evolved state, consistency metrics |
| **Q-Goal** | Quantifiable Goal | Measurable subgoals with metrics |
| **Proof** | Capture + Completion | Evidence of bind completion |
| **Triad** | Daily Plan | AI-generated 3 tasks for next day |
| **Reflection** | Journal Entry | Daily check-in with fulfillment score |

**Convention:** Use technical terms in code/database. Use MVP terms in API responses, UI, and user-facing documentation.

## AI System Principles

1. **Editable by default** - Every AI-generated plan can be edited by users
2. **No hallucinated certainty** - AI must label assumptions and ask questions
3. **Deterministic personality** - Same user gets consistent coaching based on archetype
4. **Guardrails** - Clear scope and constraints for all AI outputs
5. **Failure recovery** - Fallback chain: OpenAI → Anthropic → Deterministic

### AI Cost Control

- **Most screens should NOT call AI** - Batch AI calls around journal time and onboarding
- **Cache with input_hash** - Regenerate only when inputs change
- **Use deterministic logic where possible** - Don't call AI for simple logic
- **Rate limiting:** 10 AI calls/hour per user
- **Budget:** $2,500/month at 10K users

### AI Model Selection

| Operation | Model | Cost | Rationale |
|-----------|-------|------|-----------|
| Triad generation (90%) | GPT-4o-mini | $0.15/$0.60 per MTok | Routine, high volume |
| Daily recap (90%) | GPT-4o-mini | $0.15/$0.60 per MTok | Routine, high volume |
| Onboarding (10%) | Claude 3.7 Sonnet | $3.00/$15.00 per MTok | Complex reasoning |
| Dream Self chat (10%) | Claude 3.7 Sonnet | $3.00/$15.00 per MTok | Quality-critical |

## Security Model

- **Row Level Security (RLS):** ✅ Implemented on all 12 user-owned tables (Story 0.4)
- **JWT verification:** Middleware for custom APIs
- **File upload limits:** 10MB max, allowed types: JPEG, PNG, MP3
- **Input validation:** Zod schemas for all API inputs
- **Rate limiting:** AI (10 req/hr), Uploads (50/day), Completions (100/day)

### RLS Quick Reference

**Implementation:** Story 0.4 - Row Level Security
**Migration:** `supabase/migrations/20251219170656_row_level_security.sql`
**Tests:** `supabase/tests/rls_policies.test.sql` (48 tests)
**Penetration Testing:** `scripts/test_rls_security.py`

#### RLS Pattern: auth.uid() → user_profiles.id Lookup

All user-owned tables use `user_profiles.id` as foreign key (NOT `auth.uid()` directly). RLS policies must lookup through `user_profiles.auth_user_id`:

```sql
-- Standard pattern for user-owned tables
CREATE POLICY "users_manage_own_data" ON table_name
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));
```

**Critical:** Must cast `auth.uid()::text` (UUID → TEXT) to match `auth_user_id` column type.

#### RLS-Enabled Tables (12 total)

| Table | Policy Type | Notes |
|-------|-------------|-------|
| `user_profiles` | SELECT, INSERT, UPDATE (3 policies) | No DELETE (use soft delete) |
| `identity_docs` | FOR ALL | Full management |
| `goals` | FOR ALL | Full management |
| `subtask_templates` | FOR ALL | Full management |
| `subtask_instances` | FOR ALL | Full management |
| `subtask_completions` | SELECT + INSERT only | **Immutable** - no UPDATE/DELETE |
| `captures` | FOR ALL | Full management |
| `journal_entries` | FOR ALL | Full management |
| `daily_aggregates` | FOR ALL | Full management |
| `triad_tasks` | FOR ALL | Full management |
| `ai_runs` | FOR ALL | Full management |
| `ai_artifacts` | FOR ALL | Full management |

#### Immutable Table Pattern (subtask_completions)

Completions are append-only event logs. RLS enforces immutability:

```sql
-- SELECT policy
CREATE POLICY "users_select_own_completions" ON subtask_completions
    FOR SELECT
    USING (user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text));

-- INSERT policy
CREATE POLICY "users_insert_own_completions" ON subtask_completions
    FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text));

-- NO UPDATE OR DELETE POLICIES = Immutable
```

#### Testing RLS Locally

```bash
# Start local Supabase
npx supabase start

# Apply migrations
npx supabase db push

# Run automated tests (requires Docker)
npx supabase test db

# Run penetration tests
python scripts/test_rls_security.py
```

**Expected:** All 48 tests pass, 0 successful cross-user attacks.

#### Adding RLS to New Tables

When creating new user-owned tables:

1. **Enable RLS:** `ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;`
2. **Add policy:** Use standard pattern above (FOR ALL or specific operations)
3. **Write tests:** Add test cases in `supabase/tests/rls_policies.test.sql`
4. **Update docs:** Add table to list above + `docs/security-architecture.md`

**Reference:** Full RLS specification in `docs/security-architecture.md` (lines 189-312)

## MVP Scope

### Must Ship
1. Goal Breakdown Engine (Goal → Q-goals → Consistent habits)
2. Identity Document (Archetype, dream self, motivations - editable)
3. Action + Memory Capture (Completed subtasks + quick proof)
4. Daily Reflection/Journaling (Fulfillment score + insights)
5. Progress Visualization (Consistency heatmap, Weave character)
6. AI Coach (Structured, editable, consistent personality)

### Do Not Block MVP
- Vector embeddings, multi-modal memory, complex recurrence UI
- iMessage integration, query caching, database pooling, read replicas
- PostHog analytics (add at 500+ users)
- Sentry error tracking (add at 500+ users)
- Redis/BullMQ job queue (add at 1K+ users)

## MCP Servers Configured

This project uses **5 MCP servers** for AI-assisted development:

| Server | Purpose | Status |
|--------|---------|--------|
| **Filesystem** | Read project files | ✅ Works immediately |
| **Context7** | Up-to-date library docs (React Native, Expo, Supabase) | ⚙️ Requires API key |
| **GitHub** | Issues, PRs, branches | ⚙️ Requires token |
| **Notion** | Product specs and documentation | 🔄 Optional |
| **BrowserStack** | Real-device testing | 🔄 Optional |

**Setup:** See `docs/setup/mcp-setup-guide.md` for API keys.

## BMAD Methodology

This project uses **BMAD (Better Methodology for AI Development)** - structured workflows for AI-assisted development.

**Key workflows completed:**
- ✅ Product Brief, PRD, UX Design
- ✅ Architecture, Epics & Stories, Test Design
- ✅ Implementation Readiness Validation
- 🚀 Currently in: **Sprint Planning & Story Implementation**

**Check workflow status:** `docs/bmm-workflow-status.yaml`

**BMAD directory:** `.bmad/` (core workflows and agents)

## Changelog

**Location:** `.cursor/.cursor-changes` (NOT a .md file)

**When to update:**
- Complete a major feature or story
- Fix significant bugs
- Make architectural decisions
- Update documentation structure
- Change tooling or configuration

**Don't create duplicate changelogs** - `.cursor/.cursor-changes` is the single source of truth.

## Quick Reference

### Most Common Tasks

| Task | Command |
|------|---------|
| **Wireframe-guided implementation** | Share wireframe + reference epic/story |
| Start mobile dev | `cd weave-mobile && npm start` |
| Start backend dev | `cd weave-api && uv run uvicorn app.main:app --reload` |
| View docs | `./dev/docs-viewer/scripts/serve.sh` |
| Clear mobile cache | `cd weave-mobile && npm run start:clean` |
| Run mobile linting | `cd weave-mobile && npm run lint` |
| Run backend tests | `cd weave-api && uv run pytest` |
| Check current story | `git branch` (look for story/X.Y) |
| Read a story spec | Open `docs/stories/[story-name].md` |

### Key Files to Know

- `weave-mobile/package.json` - Mobile dependencies and scripts
- `weave-api/pyproject.toml` - Backend dependencies (uv)
- `docs/stories/` - Current story specifications
- `docs/sprint-artifacts/` - Implementation session notes
- `docs/architecture/index.md` - Architecture table of contents
- `docs/prd/index.md` - PRD table of contents
- `docs/bmm-workflow-status.yaml` - BMAD workflow progress

### Workflow Reminders

1. **Wireframe + Epic = Complete spec** - Provide wireframe for UX, reference epic for functional requirements
2. **Check `docs/bugs/` if you hit an error** - likely already solved
3. **Use the design system** - import from `@/design-system`
4. **Test locally before committing** - run the app, check for errors
5. **Never edit canonical truth tables** - append-only event logs
6. **Use TanStack Query for server state** - not Zustand
7. **Follow naming conventions** - snake_case DB, camelCase TS
8. **Document significant decisions** in `.cursor/.cursor-changes`
