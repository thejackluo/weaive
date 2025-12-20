# Weave

**Turn vague goals into daily wins, proof, and a stronger identity in 10 days.**

An AI-powered mobile app that transforms abstract goals into actionable habits (binds) through personalized coaching from your Dream Self. Built for ambitious but chaotic students and builders who struggle with consistent execution.

**Current Stage:** 🚀 **Active Implementation** - Story-based development, MVP in progress

---

## 📱 What is Weave?

Weave is a React Native mobile app that helps users:

- **Break down vague goals** into measurable actions using AI-powered goal decomposition
- **Build consistent habits** through daily "binds" (actions that strengthen your progress)
- **Track progress with proof** via photos, timers, and reflections
- **Get personalized coaching** from an AI advisor based on your ideal future self
- **Visualize growth** through consistency heat maps, streaks, and identity evolution

**Core Philosophy:** Users don't just log tasks—they weave a stronger identity through consistent action and reflection.

**Target Users:** Ambitious but chaotic students and builders (high intent, inconsistent execution)

### Key Features (MVP)

1. **Goal Breakdown Engine** - AI converts "get jacked" → quantifiable goals → daily habits using the Goldilocks principle (~70% completion probability)
2. **Identity Document** - Your archetype, dream self, motivations, and constraints that inform all AI behavior
3. **Action + Memory Capture** - Complete binds with photo/timer proof, create daily memories
4. **Daily Reflection** - Evening journal with fulfillment scoring (1-10) and AI-generated insights
5. **Progress Visualization** - Consistency heatmaps, streaks, and Weave character progression
6. **Dream Self Advisor** - Conversational AI coach that speaks in your ideal future self's voice

---

## 🏗️ Architecture Overview

### Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Mobile** | React Native + Expo SDK 53 | React 19, TypeScript, File-based routing |
| **Backend** | Python FastAPI | Python 3.11+, uv for dependencies |
| **Database** | Supabase PostgreSQL | Postgres + Auth + Storage + RLS |
| **AI Models** | GPT-4o, GPT-4o-mini, Claude 3.7 Sonnet, Claude 3.5 Haiku | OpenAI + Anthropic APIs |
| **State Management** | TanStack Query, Zustand, useState | Server state, UI state, local state |
| **Styling** | NativeWind | Tailwind CSS for React Native |
| **Push** | Expo Push (APNs) | iOS notifications |
| **Analytics** | PostHog (post-MVP) | User behavior tracking |
| **CI/CD** | GitHub Actions | Automated linting, testing, builds |

### System Architecture

```
┌─────────────────────┐
│  Mobile App          │
│  (React Native)     │
│  iOS App Store      │
└──────────┬──────────┘
           │
           ├─────────────────┐
           │                 │
           ▼                 ▼
    ┌─────────────┐   ┌──────────────┐
    │   Auth      │   │  API Layer   │
    │ (Supabase)  │   │  (FastAPI)   │
    └─────────────┘   └──────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    Postgres     │
                    │    (Supabase)   │
                    └─────────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌─────────────┐  ┌──────────────┐  ┌─────────────┐
    │   Object    │  │    Queue     │  │   Worker    │
    │  Storage    │  │  (Redis)     │  │  (async)    │
    │ (Captures)  │  └──────┬───────┘  └──────┬──────┘
    └─────────────┘          │                 │
                             │                 ├─ AI Providers
                             │                 └─ Push Notifications
                             ▼
                    ┌─────────────────┐
                    │   Scheduler     │
                    │   (Cron Jobs)   │
                    └─────────────────┘
```

**Key Design Decisions:**
- **Event-driven architecture** - Immutable event logs for canonical truth (completions, captures, journals)
- **Pre-computed views** - Dashboard reads from `daily_aggregates`, not raw completions (performance)
- **Async AI operations** - Expensive model calls queued and processed by workers
- **Cost-conscious** - Batch AI calls around journal time, cache aggressively, minimize unnecessary model invocations

---

## 🎨 Design System

Weave uses a custom **Opal-inspired dark-first design system** built for React Native.

### Design Philosophy

- **Dark-first** - Optimized for dark mode with elegant glass effects
- **Opal-inspired** - Glassmorphism, subtle gradients, premium feel
- **Personal** - Warm violet tones for AI, amber for celebrations
- **Minimal friction** - Components designed for fast interactions

### Key Components

```tsx
import { Button, Card, Text, Input, Checkbox, Badge, useTheme } from '@/design-system';

// Pre-built components with consistent styling
<Card variant="glass">
  <Text variant="displayLg">Your Progress</Text>
  <Button onPress={handleAction}>Continue</Button>
  <ConsistencyBadge percentage={65} />
</Card>
```

**Location:** `src/design-system/`

**Includes:**
- Design tokens (colors, typography, spacing, shadows, animations)
- React Native components (Button, Card, Input, Text, Checkbox, Badge)
- Theme system with dark/light mode support
- Specialized components (BindCheckbox, NeedleCard, InsightCard)

📖 **Full documentation:** [`src/design-system/README.md`](src/design-system/README.md)

---

## 🤖 AI System

Weave's AI architecture is modular and cost-efficient, built around a **Dream Self** personality that evolves with user identity.

### AI Modules

| Module | Purpose | Model | When Called |
|--------|---------|-------|-------------|
| **Onboarding Coach** | Goal breakdown + identity doc creation | GPT-4 / Claude Sonnet | Signup flow |
| **Triad Planner** | Generate 3 daily tasks (easy/medium/hard) | GPT-4o-mini | After journal submission |
| **Daily Recap** | Synthesize journal + completions + insights | GPT-4o-mini | After journal submission |
| **Dream Self Advisor** | Conversational coaching interface | Claude 3.7 Sonnet | User-initiated chat |
| **Insights Engine** | Weekly pattern detection and recommendations | GPT-4 / Claude Sonnet | Weekly cron job |

### AI Principles (Non-Negotiable)

1. **Editable by default** - All AI outputs can be user-modified and are stored as editable artifacts
2. **No hallucinated certainty** - AI labels assumptions and asks questions when data is insufficient
3. **Deterministic personality** - Same user context produces consistent coaching style (versioned)
4. **Cost control** - Most screens do NOT call models; batch operations at journal time
5. **Evidence grounding** - AI can only reference data that exists in the database

### Cost Strategy

**MVP (~100 users):** ~$40/month using API providers  
**Scale (10K users):** ~$2,100/month with hybrid approach (self-hosted Llama 3.1 70B for 90% of calls)

📖 **Full AI architecture:** [`docs/idea/ai.md`](docs/idea/ai.md)

---

## 📁 Project Structure

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
│   ├── architecture/            # 📁 Sharded architecture docs
│   │   ├── index.md             # Table of contents
│   │   ├── core-architectural-decisions.md
│   │   ├── implementation-patterns-consistency-rules.md
│   │   └── ...                  # 8+ section files
│   │
│   ├── prd/                     # 📁 Sharded PRD docs
│   │   ├── index.md             # Table of contents
│   │   ├── product-vision.md
│   │   ├── epic-0-foundation.md
│   │   ├── epic-1-onboarding-optimized-hybrid-flow.md
│   │   └── ...                  # 26+ section files
│   │
│   ├── stories/                 # 📁 Story specifications
│   │   ├── 0-1-project-scaffolding.md
│   │   ├── 0-2a-database-schema-core.md
│   │   ├── 0-3-authentication-flow.md
│   │   ├── 1-1-welcome-vision-hook.md
│   │   └── ...                  # 15+ story files
│   │
│   ├── sprint-artifacts/        # Implementation summaries
│   │   ├── story-0.3-implementation-summary.md
│   │   └── ...
│   │
│   ├── idea/                    # Original deep specs (1000+ lines each)
│   │   ├── mvp.md               # Complete product MVP spec
│   │   ├── backend.md           # Backend architecture + DB schema
│   │   ├── ai.md                # AI system design
│   │   └── ux.md                # UX design system
│   │
│   ├── dev/                     # Developer guides
│   │   ├── design-system-guide.md
│   │   ├── docs-viewer-guide.md
│   │   ├── git-workflow-guide.md
│   │   ├── bmad-implementation-guide.md
│   │   ├── ci-cd-setup.md
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
├── scripts/                     # Utility scripts
│   ├── verify-mcp-setup.sh      # MCP verification (Mac/Linux)
│   ├── verify-mcp-setup.ps1     # MCP verification (Windows)
│   └── test_rls_security.py     # RLS penetration testing
│
├── supabase/
│   ├── migrations/              # Database migrations
│   └── tests/                   # Supabase tests (RLS, etc.)
│
└── .cursor/
    └── .cursor-changes          # Detailed project changelog
```

---

## 📚 Documentation Viewer

View all project documentation in a **modern, beautiful interface** with smart search and auto-categorization.

### Quick Start

**Option 1: Using the npm package (Recommended)**

Navigate to your project directory that contains a `docs/` folder, then run:

```bash
npx @thejackluo/docs-viewer
```

The server will start at `http://localhost:3030` and automatically discover all markdown files in your `docs/` directory.

**Option 2: Using local scripts**

```bash
# Windows (PowerShell)
.\dev\docs-viewer\scripts\serve.ps1

# Mac/Linux (Bash)
./dev/docs-viewer/scripts/serve.sh

# Or directly with Node.js/Python
node dev/docs-viewer/scripts/server.js
python dev/docs-viewer/scripts/server.py
```

Then open: **http://localhost:3030**

**Important:** Make sure you're in a directory that contains a `docs/` folder. The viewer will automatically scan for all `.md` files in that folder and its subdirectories.

### Features

- ✨ Glassmorphism UI with Mintlify-inspired design
- 🔍 Real-time smart search (press `/` to search)
- 📁 Auto-categorization based on folder structure
- 🎯 Dynamic document discovery (no configuration needed)
- 📱 Fully responsive (desktop and mobile)
- ⚡ Instant startup (no build process)

📦 **npm Package:** [`@thejackluo/docs-viewer`](https://www.npmjs.com/package/@thejackluo/docs-viewer)  
📖 **Full documentation:** [`dev/docs-viewer/README.md`](dev/docs-viewer/README.md)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (for mobile app)
- **Python** 3.11+ (for backend)
- **Expo CLI** (for React Native development)
- **uv** (modern Python package manager)
- **Supabase account** (database + auth + storage)
- **OpenAI / Anthropic API keys** (for AI features)

### Setup (MVP)

#### 1. Mobile App

```bash
# Create Expo app
npx create-expo-app weave-mobile --template blank-typescript
cd weave-mobile

# Install dependencies
npx expo install expo-router expo-linking expo-constants
npm install @supabase/supabase-js

# Start development server
npx expo start
```

#### 2. Backend API

```bash
# Create FastAPI backend
mkdir weave-api && cd weave-api
uv init

# Add dependencies
uv add fastapi "uvicorn[standard]" supabase python-dotenv openai anthropic pydantic-settings

# Run server
uvicorn app.main:app --reload
```

#### 3. Environment Variables

Copy `docs/setup/env-example.txt` and configure:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# AI Providers
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Railway (deployment)
RAILWAY_TOKEN=your_railway_token
```

---

## 🤖 MCP Servers (AI Development Tools)

This project uses **MCP servers** to enhance AI-assisted development with contextual awareness.

### Configured Servers

| Server | Purpose | Status |
|--------|---------|--------|
| **Filesystem** | Read project files | ✅ Works immediately |
| **Context7** | Up-to-date library documentation (React Native, Expo, Supabase) | ⚙️ Requires API key |
| **GitHub** | Issues, PRs, branches | ⚙️ Requires token |
| **Notion** | Product specs and documentation | 🔄 Optional |
| **BrowserStack** | Real-device testing | 🔄 Optional |

### Quick Verification

```bash
# Mac/Linux
bash scripts/verify-mcp-setup.sh

# Windows
.\scripts\verify-mcp-setup.ps1
```

📖 **Full setup guide:** [`docs/setup/mcp-setup-guide.md`](docs/setup/mcp-setup-guide.md)
📚 **Daily reference:** [`docs/dev/mcp-quick-reference.md`](docs/dev/mcp-quick-reference.md)

---

## 📖 Core Documentation

**Documentation is now SHARDED** - no more single 1000+ line files!

### Product & Design

- **[MVP Specification](docs/idea/mvp.md)** - Complete product definition (1600+ lines comprehensive spec)
- **[PRD (Sharded)](docs/prd/index.md)** - Product requirements organized into 26+ section files
- **[Architecture (Sharded)](docs/architecture/index.md)** - Technical architecture organized into 8+ section files
- **[Design System Guide](docs/dev/design-system-guide.md)** - How to use the Weave design system
- **[UX Design](docs/idea/ux.md)** - UX design system and patterns

### Technical Architecture

- **[Backend Architecture](docs/idea/backend.md)** - API design, data models, event-driven workflows, security
- **[AI Architecture](docs/idea/ai.md)** - AI modules, orchestration, cost control, and personalization
- **[Implementation Patterns](docs/architecture/implementation-patterns-consistency-rules.md)** - Code conventions and guardrails

### Story-Based Development

- **[Stories Directory](docs/stories/)** - Detailed story specifications with acceptance criteria
- **[Sprint Artifacts](docs/sprint-artifacts/)** - Implementation session notes and summaries
- **[Epics](docs/epics.md)** - Epic breakdown and planning
- **[Git Workflow Guide](docs/dev/git-workflow-guide.md)** - Branching, commits, PRs

### Developer Guides

- **[Documentation Viewer Guide](docs/dev/docs-viewer-guide.md)** - How to use and customize the docs viewer
- **[MCP Setup Guide](docs/setup/mcp-setup-guide.md)** - Configure AI development tools
- **[MCP Quick Reference](docs/dev/mcp-quick-reference.md)** - Daily MCP usage cheat sheet
- **[BMAD Implementation Guide](docs/dev/bmad-implementation-guide.md)** - Using the BMAD methodology
- **[CI/CD Setup](docs/dev/ci-cd-setup.md)** - Continuous integration and deployment

### Known Issues & Solutions

- **[Bugs Directory](docs/bugs/)** - Known bugs and their solutions

---

## 🗂️ Database Schema (Core Tables)

### Users & Identity

- `user_profiles` - Basic user info + timezone
- `identity_docs` - Versioned identity documents (archetype, dream self, motivations)

### Goals & Planning

- `goals` - Top-level goals (max 3 active "needles")
- `qgoals` - Quantifiable subgoals with metrics
- `subtask_templates` - Reusable habit templates ("binds")
- `subtask_instances` - Scheduled tasks for specific dates
- `subtask_completions` - Immutable completion events (canonical truth)

### Captures & Proof

- `captures` - Photos, notes, audio, timers (proof + memories)
- `subtask_proofs` - Links captures to completed tasks

### Reflection & Planning

- `journal_entries` - Daily reflections with fulfillment scores
- `triad_tasks` - AI-generated 3 daily tasks (easy/medium/hard)

### Progress & Stats

- `daily_aggregates` - Pre-computed daily stats (fast dashboard queries)
- `user_stats` - Current streak, consistency %, rank level
- `badges` - Achievement definitions
- `user_badges` - Earned badges per user

### AI System

- `ai_runs` - Tracks each AI generation run (debugging, caching, cost tracking)
- `ai_artifacts` - Editable AI outputs (goal trees, triads, recaps, insights)
- `user_edits` - Audit trail for user edits to AI artifacts

📖 **Full data model:** [`docs/idea/backend.md`](docs/idea/backend.md)

---

## 🎯 Terminology

Weave uses unique product terminology that maps to technical concepts:

| Product Term | Technical Term | Description |
|--------------|----------------|-------------|
| **Needle** | Goal | Top-level user goal (max 3 active) |
| **Bind** | Subtask | Consistent action/habit toward goals |
| **Thread** | User/Identity | User's starting state and identity |
| **Weave** | Progress/Stats | User's evolved state, consistency metrics |
| **Q-Goal** | Quantifiable Goal | Measurable subgoal with metrics |
| **Proof** | Capture + Completion | Evidence of bind completion |
| **Triad** | Daily Plan | AI-generated 3 tasks for next day |
| **Dream Self** | AI Personality | Ideal future version, informs coaching |

---

## 📝 Naming Conventions

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

---

## ⚠️ Critical Guardrails

### Data Integrity

**NEVER UPDATE or DELETE from these tables** - they are append-only event logs:
- `subtask_completions` (canonical completion events)
- `captures` (proof photos, notes, audio)
- `journal_entries` (daily reflections)

**Why:** These are canonical truth. Stats and views are recomputed from these events. Editing them corrupts historical data.

**Alternative:** If a completion was logged incorrectly, add a new row with `is_correction: true` that references the original. Never delete the original event.

### State Management

**Use the right tool for the right state:**

| State Type | Tool | Example |
|------------|------|---------|
| **Server data** | TanStack Query | Goals, completions, user profile |
| **Cross-component UI** | Zustand | Active filters, modal state, theme |
| **Local component** | useState | Form inputs, toggles, counters |

**Don't use Zustand for server data** - use TanStack Query with proper cache invalidation.

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
</View>
```

---

## 🧪 Development Workflow

### Story-Based Development

This project uses **story-based development** with the BMAD methodology:

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

### Common Development Commands

#### Mobile Development (weave-mobile/)

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

#### Backend Development (weave-api/)

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

### Using BMAD Method

This project uses the **BMAD (Better Methodology for AI Development)** workflow system.

**Configured agents:**
- Product Manager (PM)
- Architect
- Developer (Dev)
- UX Designer
- Tech Writer
- Analyst

**Key workflows:**
- Story-based implementation with detailed acceptance criteria
- Adversarial code review for quality assurance
- Automated test generation and coverage analysis
- Sprint planning and status tracking

**Workflow status:** Check `docs/bmm-workflow-status.yaml` for current progress

📖 **BMAD documentation:** See `.bmad/` directory for all available agents and workflows

---

## 🔒 Security

### Row-Level Security (RLS)

**Implementation:** Story 0.4 - Row Level Security (✅ Completed)

All 12 user-owned tables are protected with Supabase RLS policies:

```sql
-- Example: Standard pattern for user-owned tables
CREATE POLICY "users_manage_own_data" ON table_name
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));
```

**Key Design:**
- Uses `auth.uid()` → `user_profiles.id` lookup pattern
- Immutable tables (`subtask_completions`) have SELECT + INSERT only (no UPDATE/DELETE)
- All policies tested with 48 automated tests + penetration testing

**Testing:**
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

**Protected Tables:**
- `user_profiles`, `identity_docs`, `goals`, `subtask_templates`, `subtask_instances`
- `subtask_completions` (immutable), `captures`, `journal_entries`, `daily_aggregates`
- `triad_tasks`, `ai_runs`, `ai_artifacts`

### Rate Limiting

- AI generation: 10 requests/hour per user
- Uploads: 50 per day per user
- Completions: 100 per day per user

### Data Classification

**Canonical Truth (Immutable):**
- `subtask_completions`, `captures`, `journal_entries`
- Append-only event logs - never UPDATE or DELETE
- Stats and views are recomputed from these events

**Derived Views (Recomputable):**
- `daily_aggregates`, `user_stats`, badges, summaries
- Can always be regenerated from canonical truth

**Static Reference Data:**
- User profiles, identity docs, goal definitions
- Editable but tracked with versioning

---

## 📊 Success Metrics

### North Star Metric

**Active Days with Proof** - User completes ≥1 subtask + logs either:
- (a) A memory/capture, or
- (b) A journal check-in

### Key Metrics

- **Onboarding success:** User completes onboarding + sets 1 goal + completes 1 bind in first 24 hours
- **7-day retention:** User has ≥4 active days in first week
- **30-day milestone:** User reaches 30-day active streak
- **Consistency score:** 7-day and 30-day completion percentages

---

## 🗺️ Roadmap

### MVP (In Progress)

- ✅ Project scaffolding (Story 0.1)
- ✅ Database schema - Core (Story 0.2a)
- ✅ Authentication flow (Story 0.3)
- ✅ Row Level Security (Story 0.4)
- 🚧 Welcome & Vision Hook screen (Story 1.1)
- 🔜 Onboarding flow (Stories 1.2-1.5)
- 🔜 Goal breakdown with AI
- 🔜 Daily binds and completions
- 🔜 Progress visualization
- 🔜 Dream Self AI coach

### V1.5 (Post-MVP)

- Analytics integration (PostHog)
- Error tracking (Sentry)
- Job queue (Redis + BullMQ)
- Input hash caching for AI
- Derived views optimization
- Badge system expansion

### V2.0 (Future)

- Open source models for cost reduction (Llama 3.1 70B)
- Vector embeddings for "second brain"
- Multi-modal long-term memory
- iMessage integration
- Shared accountability features
- Screen time integration

---

## 🚀 Quick Reference

### Most Common Tasks

| Task | Command |
|------|---------|
| Start mobile dev | `cd weave-mobile && npm start` |
| Start backend dev | `cd weave-api && uv run uvicorn app.main:app --reload` |
| View docs | `npx @thejackluo/docs-viewer` or `./dev/docs-viewer/scripts/serve.sh` |
| Clear mobile cache | `cd weave-mobile && npm run start:clean` |
| Run mobile linting | `cd weave-mobile && npm run lint` |
| Run backend tests | `cd weave-api && uv run pytest` |
| Check current story | `git branch` (look for story/X.Y) |
| Read a story spec | Open `docs/stories/[story-name].md` |
| Apply DB migrations | `npx supabase db push` |
| Test RLS policies | `npx supabase test db` |

### Key Files to Know

- `weave-mobile/package.json` - Mobile dependencies and scripts
- `weave-api/pyproject.toml` - Backend dependencies (uv)
- `docs/stories/` - Current story specifications
- `docs/sprint-artifacts/` - Implementation session notes
- `docs/architecture/index.md` - Architecture table of contents
- `docs/prd/index.md` - PRD table of contents
- `docs/bmm-workflow-status.yaml` - BMAD workflow progress
- `CLAUDE.md` - Project instructions for Claude Code

### Workflow Reminders

1. **Always read the story file first** before implementing
2. **Check `docs/bugs/` if you hit an error** - likely already solved
3. **Use the design system** - import from `@/design-system`
4. **Test locally before committing** - run the app, check for errors
5. **Never edit canonical truth tables** - append-only event logs
6. **Use TanStack Query for server state** - not Zustand
7. **Follow naming conventions** - snake_case DB, camelCase TS
8. **Document significant decisions** in `.cursor/.cursor-changes`

---

## 🤝 Contributing

This is currently a private project in MVP development. Contribution guidelines will be added when the project opens to collaborators.

---

## 📝 License

Proprietary - All rights reserved

---

## 🙏 Acknowledgments

- **Design inspiration:** Opal app (for visual design)
- **Concept inspiration:** Hollow Knight: Silksong (thread/needle/weave metaphor)
- **AI frameworks:** OpenAI, Anthropic for model APIs, Bedrock for self-hosted models

---

**Built with ❤️ by the Weave team**

*See who you're becoming.*