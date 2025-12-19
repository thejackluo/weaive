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
│   ├── architecture/            # 📁 Sharded architecture docs
│   │   ├── index.md             # Table of contents
│   │   ├── core-architectural-decisions.md
│   │   ├── implementation-patterns-consistency-rules.md
│   │   └── ...                  # 8 more section files
│   │
│   ├── prd/                     # 📁 Sharded PRD docs
│   │   ├── index.md             # Table of contents
│   │   ├── product-vision.md
│   │   ├── epic-0-foundation.md
│   │   ├── epic-1-onboarding-optimized-hybrid-flow.md
│   │   └── ...                  # 26 total section files
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
└── scripts/                     # Utility scripts
    └── verify-mcp-setup.sh
```

## Documentation Navigation

**Documentation is now SHARDED** - no more single 1000+ line files!

### When to Read What

| Task | Read This | Why |
|------|-----------|-----|
| Implementing a story | `docs/stories/[story-name].md` | Detailed spec with acceptance criteria |
| Understanding product vision | `docs/prd/product-vision.md` | High-level goals and user personas |
| Understanding an epic | `docs/prd/epic-[N]-[name].md` | Epic breakdown and requirements |
| Architecture decisions | `docs/architecture/core-architectural-decisions.md` | Tech stack, patterns, rationale |
| Database schema | `docs/idea/backend.md` (lines 200-800) | Complete schema with relationships |
| API patterns | `docs/architecture/implementation-patterns-consistency-rules.md` | Code conventions and guardrails |
| Design system usage | `docs/dev/design-system-guide.md` | Components, tokens, examples |
| Git workflow | `docs/dev/git-workflow-guide.md` | Branching, commits, PRs |
| Debugging common issues | `docs/bugs/[issue-name].md` | Known bugs and solutions |
| Deep product context | `docs/idea/mvp.md` | 1600-line comprehensive spec (only if needed) |

**Tip:** Use `docs/architecture/index.md` or `docs/prd/index.md` as a table of contents to find specific sections.

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

- **Row Level Security (RLS):** Required on all user-owned tables in Supabase
- **JWT verification:** Middleware for custom APIs
- **File upload limits:** 10MB max, allowed types: JPEG, PNG, MP3
- **Input validation:** Zod schemas for all API inputs
- **Rate limiting:** AI (10 req/hr), Uploads (50/day), Completions (100/day)

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

1. **Always read the story file first** before implementing
2. **Check `docs/bugs/` if you hit an error** - likely already solved
3. **Use the design system** - import from `@/design-system`
4. **Test locally before committing** - run the app, check for errors
5. **Never edit canonical truth tables** - append-only event logs
6. **Use TanStack Query for server state** - not Zustand
7. **Follow naming conventions** - snake_case DB, camelCase TS
8. **Document significant decisions** in `.cursor/.cursor-changes`
