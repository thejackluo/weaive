# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Weave** - Turn vague goals into daily wins, proof, and a stronger identity in 10 days.

**Target Users:** Ambitious but chaotic students and builders (high intent, inconsistent execution)

**Current Stage:** Pre-MVP (Documentation and architecture planning phase)

## Tech Stack

- **Mobile:** React Native (Expo SDK 53, React 19, TypeScript)
- **Backend:** Python FastAPI (Python 3.11+, deployed on Railway)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **AI Models:** GPT-4o, GPT-4o-mini (OpenAI), Claude 3.7 Sonnet, Claude 3.5 Haiku (Anthropic)
- **Push Notifications:** Expo Push (iOS APNs)
- **State Management:** TanStack Query (server state), Zustand (UI state), useState (local)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Analytics:** PostHog (post-MVP)
- **Error Tracking:** Sentry (post-MVP)
- **Job Queue:** Redis + BullMQ (post-MVP)

## Common Development Commands

### Documentation Viewer

```bash
# Windows (PowerShell)
.\dev\docs-viewer\scripts\serve.ps1

# Mac/Linux
./dev/docs-viewer/scripts/serve.sh

# Or directly with Node.js/Python
node dev/docs-viewer/scripts/server.js
python dev/docs-viewer/scripts/server.py
```

Then open: **http://localhost:3030**

### Mobile Development (Future)

```bash
# Initialize mobile app
npx create-expo-app weave-mobile --template blank-typescript
cd weave-mobile
npx expo install expo-router expo-linking expo-constants
npm install @supabase/supabase-js nativewind @tanstack/react-query zustand

# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Generate TypeScript types from Supabase
npx supabase gen types typescript --project-id <project-ref> > lib/database.types.ts
```

### Backend Development (Future)

```bash
# Initialize backend
mkdir weave-api && cd weave-api
uv init
uv add fastapi "uvicorn[standard]" supabase python-dotenv openai anthropic pydantic-settings

# Run development server
uvicorn app.main:app --reload

# Run tests
pytest
pytest tests/test_goals.py -v
```

### MCP Tools Verification

```bash
# Verify MCP setup
bash scripts/verify-mcp-setup.sh     # Mac/Linux
.\scripts\verify-mcp-setup.ps1       # Windows
```

## Architecture

### Three-Layer Data Model

1. **Static Text Database** - Demographics, stable user profile fields, identity documents (archetype, dream self, motivations)
2. **Dynamic Text Database (Artifact Store)** - Goals, Q-goals, subtasks, journal entries, reflections, AI-generated outputs, computed statistics
3. **Image Storage** - User uploads, proof captures from completed tasks, identity visuals

### Request Flow Patterns

- **Pattern A (Fast Path):** Auth + Basic CRUD - synchronous responses
- **Pattern B (AI-Heavy):** Long-running operations via Queue + Workers - async with 202 Accepted
- **Pattern C (Media Uploads):** Direct to storage with signed URLs
- **Pattern D (Latency-Critical):** Edge Functions for instant response

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

### State Management Architecture

| Layer | Library | Purpose | Examples |
|-------|---------|---------|----------|
| **Server State** | TanStack Query | Remote data, caching, sync | Goals, completions, user profile |
| **Shared UI State** | Zustand | Cross-component state | Active filters, modal state |
| **Local State** | useState | Component-scoped | Form inputs, toggles |

**Key Configuration:**
- TanStack Query: `refetchOnWindowFocus: false` (mobile optimization)
- TanStack Query: `networkMode: 'offlineFirst'` (offline support)
- Zustand stores must be typed from day one - no `any` types

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

## Data Classification (Critical)

### Canonical Truth (Immutable Event Logs)
- Goals, Q-goals, subtasks
- Completions (immutable completion events)
- Captures (photos, notes, audio)
- Journals (daily reflections)
- Identity documents

**NEVER** UPDATE or DELETE from `subtask_completions` table - append-only!

### Derived Views (Recomputable)
- Streaks (calculated from completions)
- Consistency percentages (calculated from aggregates)
- Badges and ranks
- Daily summaries and AI insights

**Key Rule:** Never edit derived data directly. Always regenerate from source events. Stats are computed at write-time or via scheduled batch jobs.

## Event-Driven Workflows

### On `journal_submitted`
- Recompute `DailyAggregate` for that date
- Generate triad for tomorrow
- Generate daily recap
- Schedule next day push notifications

### On `subtask_completed`
- Recompute `DailyAggregate`
- Recompute streak and rank
- Update user_stats

### On `capture_created`
- Recompute `DailyAggregate`
- Optionally enqueue transcription for audio
- Suggest proof attachments

## AI System Principles (Non-Negotiable)

1. **Editable by default** - Every AI-generated plan can be edited by users
2. **No hallucinated certainty** - AI must label assumptions and ask questions
3. **Deterministic personality** - Same user gets consistent coaching based on archetype and dream self
4. **Guardrails** - Clear scope and constraints for all AI outputs
5. **Failure recovery** - Fallback chain: OpenAI → Anthropic → Deterministic

## AI Cost Control Strategy

- Most screens should NOT call the AI model
- Batch AI calls around journal time and onboarding
- Cache outputs with input_hash; regenerate only when inputs change
- Use deterministic logic where possible
- Rate limiting: 10 AI calls/hour per user
- Budget: $2,500/month at 10K users
- Cost monitoring with alerts at 50%, 80%, 100% of daily budget

### AI Model Selection

| Operation | Model | Cost | Rationale |
|-----------|-------|------|-----------|
| Triad generation (90%) | GPT-4o-mini | $0.15/$0.60 per MTok | Routine, high volume |
| Daily recap (90%) | GPT-4o-mini | $0.15/$0.60 per MTok | Routine, high volume |
| Onboarding (10%) | Claude 3.7 Sonnet | $3.00/$15.00 per MTok | Complex reasoning |
| Dream Self chat (10%) | Claude 3.7 Sonnet | $3.00/$15.00 per MTok | Quality-critical |

## Design System

Weave uses a **custom Opal-inspired dark-first design system** built for React Native.

### Quick Usage

```tsx
import { Button, Card, Text, Input, useTheme } from '@/design-system';

function MyScreen() {
  const { colors, spacing } = useTheme();

  return (
    <Card variant="glass">
      <Text variant="displayLg">Welcome to Weave</Text>
      <Button onPress={handlePress}>Get Started</Button>
    </Card>
  );
}
```

### Available Components
- **Text**: `Text`, `Heading`, `Title`, `Body`, `Caption`, `Label`, `Mono`
- **Buttons**: `Button`, `PrimaryButton`, `SecondaryButton`, `GhostButton`, `AIButton`, `IconButton`
- **Cards**: `Card`, `GlassCard`, `ElevatedCard`, `AICard`, `NeedleCard`, `InsightCard`
- **Inputs**: `Input`, `TextArea`, `SearchInput`
- **Form**: `Checkbox`, `BindCheckbox`
- **Status**: `Badge`, `ConsistencyBadge`, `StreakBadge`, `AIBadge`, `StatusDot`

### Key Principles
1. **Always use theme hooks** - Never hardcode colors/spacing
2. **Use semantic color names** - `colors.text.primary` not `colors.dark[100]`
3. **Prefer pre-built components** - Don't recreate buttons/cards
4. **Use spacing tokens** - `spacing[4]` not `16`

📖 **Full guide:** `docs/dev/design-system-guide.md`

## Performance & Database

### Critical Indexes

```sql
user_profiles(auth_user_id)
subtask_instances(user_id, scheduled_for_date)
subtask_completions(user_id, local_date)
captures(user_id, local_date)
journal_entries(user_id, local_date)
goals(user_id, status)
daily_aggregates(user_id, local_date)
```

**Key Rule:** Dashboard should read mostly from pre-computed `daily_aggregates`, not scan raw completions.

## Security Model

- **Row Level Security (RLS):** Required Sprint 1 (before alpha) on all user-owned tables in Supabase
- **JWT verification:** Middleware for custom APIs
- **File upload limits:** 10MB max, allowed types: JPEG, PNG, MP3
- **Input validation:** Zod or similar
- **Rate limiting:** AI (10 req/hr), Uploads (50/day), Completions (100/day)

## Success Metrics

**North Star:** Active Days with Proof
- User completes ≥1 subtask + logs memory/capture OR journal check-in

**Onboarding Success:** User completes onboarding + sets 1 goal + completes 1 mission in 24 hours

## MVP Scope

### Must Ship
1. Goal Breakdown Engine (Goal → Q-goals → Consistent habits with ~70% completion probability)
2. Identity Document (Archetype, dream self, motivations, constraints - editable)
3. Action + Memory Capture (Completed subtasks + quick proof: note/photo/timer)
4. Daily Reflection/Journaling (Fulfillment score + insights + next day plan)
5. Progress Visualization (Consistency heatmap, Weave character leveling)
6. AI Coach (Structured, editable, consistent personality based on dream self)

### Do Not Block MVP
- Vector embeddings for "second brain"
- Multi-modal long-term memory
- Complex recurrence UI
- iMessage integration
- Query result caching
- Database connection pooling
- Read replicas for scaling
- PostHog analytics (add at 500+ users)
- Sentry error tracking (add at 500+ users)
- Redis/BullMQ job queue (add at 1K+ users)

## Project Structure

```
weavelight/
├── src/
│   └── design-system/           # React Native design system
│       ├── components/          # Button, Card, Input, Text, etc.
│       ├── tokens/              # Colors, typography, spacing
│       └── theme/               # ThemeContext and hooks
│
├── docs/                        # All project documentation
│   ├── architecture.md          # System architecture decisions
│   ├── prd.md                   # Product requirements
│   ├── epics.md                 # Implementation epics
│   ├── idea/
│   │   ├── mvp.md              # MVP product specification
│   │   ├── backend.md          # Backend architecture + data models
│   │   └── ai.md               # AI system architecture
│   ├── dev/
│   │   ├── design-system-guide.md
│   │   ├── docs-viewer-guide.md
│   │   └── mcp-quick-reference.md
│   └── setup/
│       ├── mcp-setup-guide.md   # MCP servers configuration
│       └── env-example.txt      # Environment variables template
│
├── dev/
│   └── docs-viewer/             # Internal documentation viewer
│       ├── index.html           # Beautiful UI for viewing docs
│       └── scripts/             # Server scripts (Node.js/Python)
│
├── scripts/                     # Utility scripts
│   ├── verify-mcp-setup.ps1
│   └── verify-mcp-setup.sh
│
└── .cursor/
    └── .cursor-changes          # Detailed project changelog
```

### Future Structure (When Implemented)

```
mobile/                          # Expo React Native app
├── app/                         # Expo Router (file-based routing)
│   ├── (auth)/                  # Unauthenticated routes
│   └── (tabs)/                  # Main authenticated tabs
├── components/
│   ├── ui/                      # Generic components
│   └── features/                # Feature-specific components
├── lib/                         # Supabase client, API calls
├── hooks/                       # Custom React hooks
├── stores/                      # Zustand stores (UI state only)
└── types/                       # TypeScript types

api/                             # Python FastAPI backend
├── app/
│   ├── routers/                 # API route handlers
│   ├── services/                # Business logic
│   └── contracts/v1/            # Pydantic request/response models
└── tests/                       # pytest tests
```

## Documentation

### Primary Documentation
- `docs/idea/mvp.md` - Complete product MVP specification (1600+ lines)
- `docs/idea/backend.md` - Backend architecture V2 (1586 lines, includes full database schema)
- `docs/idea/ai.md` - AI system design
- `docs/architecture.md` - Complete architecture decisions and patterns
- `docs/prd.md` - Product requirements and epics
- `docs/epics.md` - Implementation epics with story points

### Developer Guides
- `docs/dev/design-system-guide.md` - How to use the Weave design system
- `docs/dev/docs-viewer-guide.md` - How to use and customize the docs viewer
- `docs/dev/mcp-quick-reference.md` - Daily MCP usage cheat sheet
- `docs/dev/notification-hooks-guide.md` - Claude Code notification chimes setup and customization
- `docs/dev/bmad-implementation-guide.md` - Non-technical guide to BMAD implementation workflow
- `docs/dev/git-workflow-guide.md` - Complete guide to Git, branching, PRs, and debugging

### Setup Guides
- `docs/setup/mcp-setup-guide.md` - MCP servers configuration (6 servers)
- `docs/setup/env-example.txt` - Environment variables template

## MCP Servers Configured

This project uses **5 MCP servers** for AI-assisted development:

| Server | Purpose | Setup Time | Status |
|--------|---------|------------|--------|
| **Filesystem** | Read project files | Instant | ✅ Works immediately |
| **Context7** | Up-to-date library documentation (React Native, Expo, Supabase) | 5 min | ⚙️ Requires API key |
| **GitHub** | Issues, PRs, branches | 3 min | ⚙️ Requires token |
| **Notion** | Product specs and documentation | 5 min | 🔄 Optional |
| **BrowserStack** | Real-device testing | 5 min | 🔄 Optional |

**Setup:** API keys required - see `docs/setup/mcp-setup-guide.md`

## Workflow Tips

1. **Always start with docs** - Read `docs/idea/mvp.md` for product context, `docs/idea/backend.md` for architecture
2. **Data classification matters** - Know what is canonical truth vs. derived views
3. **Cost awareness** - Count AI API calls carefully, use caching with input_hash, batch operations around journal time
4. **MVP focus** - Don't implement post-MVP features. Real devices + user data matters more than fancy UI
5. **Use MCP servers** - Context7 for current API syntax, Filesystem for reading architecture docs
6. **Use docs viewer** - Run `./dev/docs-viewer/scripts/serve.sh` to browse all documentation
7. **Follow naming conventions** - snake_case for DB/API, camelCase for TypeScript, PascalCase for components
8. **Protect immutable data** - Never UPDATE/DELETE from `subtask_completions`
9. **Use design system** - Import from `@/design-system`, never hardcode colors/spacing
10. **Test offline behavior** - TanStack Query is configured for offline-first

## API Response Format

All API responses must follow this format:

```typescript
// Success response
{ "data": { ... }, "meta": { "timestamp": "2025-12-16T10:00:00Z" } }

// Error response
{ "error": { "code": "GOAL_LIMIT_REACHED", "message": "Maximum 3 active goals allowed" } }

// List response
{ "data": [...], "meta": { "total": 42, "page": 1, "per_page": 20 } }
```

## BMAD Methodology

This project uses **BMAD (Better Methodology for AI Development)** - a structured workflow system optimized for AI-assisted software development.

### What is BMAD?

BMAD is a methodology that provides:
- **Specialized AI Agents** - Role-based agents (PM, Architect, Developer, UX Designer, etc.)
- **Structured Workflows** - Step-by-step processes for planning, design, and implementation
- **Collaborative Processes** - Multi-agent discussions and validations
- **Quality Assurance** - Built-in validation and review workflows

### BMAD Directory Structure

```
.bmad/
├── core/                    # Core BMAD system
│   ├── agents/             # Core agents (bmad-master)
│   └── workflows/          # Core workflows (brainstorming, party-mode)
│
├── bmb/                     # BMAD Builder module
│   ├── agents/             # Builder agents
│   ├── workflows/          # Creation workflows
│   ├── docs/               # BMAD documentation
│   └── reference/          # Example agents and workflows
│
└── _cfg/                    # Configuration
    ├── agents/             # Custom agent configurations
    ├── task-manifest.csv   # Available tasks
    └── workflow-manifest.csv # Available workflows

.claude/                     # Claude Code configuration
├── hooks/                   # Event hooks
├── personalities/           # Claude personalities
├── plugins/                 # Claude plugins
└── settings.json           # Claude settings
```

### Available BMAD Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **bmad-master** | Master orchestrator, task execution | Start workflows, list tasks |
| **bmm-pm** | Product Manager | PRD creation, requirement gathering |
| **bmm-architect** | Software Architect | Architecture decisions, tech stack |
| **bmm-dev** | Developer | Code implementation, refactoring |
| **bmm-ux-designer** | UX Designer | User flows, wireframes, design system |
| **bmm-tech-writer** | Technical Writer | Documentation, guides, API docs |
| **bmm-analyst** | Business Analyst | Market research, competitive analysis |
| **bmm-tea** | Technical Engineering Advisor | Technical validation, code review |
| **bmm-sm** | Scrum Master | Sprint planning, agile processes |
| **bmb-bmad-builder** | BMAD Builder | Create custom agents and workflows |

### BMAD Workflow Types

**Planning Phase:**
- `brainstorm-project` - Initial ideation and concept development
- `research` - Market research and competitive analysis
- `product-brief` - Executive summary and vision
- `prd` - Product requirements document
- `create-ux-design` - User experience design
- `design-system` - Design system creation

**Solutioning Phase:**
- `create-architecture` - System architecture and tech stack
- `create-epics-and-stories` - Break down features into epics and stories
- `test-design` - Testing strategy and test plans
- `validate-architecture` - Architecture review and validation
- `create-security-architecture` - Security design and threat model
- `create-devops-strategy` - CI/CD, deployment, monitoring

**Implementation Phase:**
- `sprint-planning` - Plan sprints and allocate work
- `code-review` - Review code quality and standards

**Collaboration:**
- `party-mode` - Multi-agent discussion and brainstorming

### How to Use BMAD Agents

BMAD agents are typically invoked through cursor rules or slash commands. For standard Claude Code usage:

1. **Follow the workflow status** - Check `docs/bmm-workflow-status.yaml` to see where you are
2. **Complete workflows in order** - Each phase builds on the previous
3. **Document decisions** - Update architecture docs and changelog as you go
4. **Use party-mode for validation** - When you need multiple perspectives

### Current Workflow Status

Check `docs/bmm-workflow-status.yaml` to see:
- Which workflows are complete (✅)
- Which workflows are required next
- Which workflows are optional or can be skipped

## Changelog Conventions

**IMPORTANT:** When making significant changes to the project, always document them in the changelog.

### File Location
- **Single source of truth:** `.cursor/.cursor-changes`
- **Do NOT create:** duplicate changelog files in root, docs/, or other locations
- **Format:** Markdown with structured sections
- **Note:** This is `.cursor/.cursor-changes` (no `.md` extension)

### When to Add Changelog Entries

Add an entry when you:
- Complete a major feature or refactoring
- Fix significant bugs
- Make architectural decisions
- Update documentation structure
- Change tooling or configuration
- Release a new version

### Entry Format

```markdown
## [YYYY-MM-DD] Brief Title

### Summary
One-paragraph overview of what changed and why.

### What Changed

**Prior State:**
- Bullet points describing the before state

**New State:**
- Bullet points describing the after state

**Files Modified:**
- List of modified files

**Files Created:**
- List of new files

### Impact
Explain the practical impact of this change on developers, users, or the codebase.

**Version**: X.Y.Z → X.Y.Z+1
**Status**: ✅ Complete / ⏳ In Progress / ❌ Blocked
```

### Versioning Guidelines

- **Major (X.0.0):** Breaking changes to architecture or APIs
- **Minor (0.X.0):** New features, components, or significant functionality added
- **Patch (0.0.X):** Bug fixes, documentation improvements, minor tweaks

### Best Practices

1. **Write in reverse chronological order** - Newest entries first
2. **Include context** - Explain WHY, not just WHAT
3. **Be specific** - Reference file paths, line numbers, specific issues
4. **Show before/after** - Use comparison tables or code blocks
5. **Document decisions** - Explain trade-offs and alternatives considered
6. **Link to related docs** - Reference PRD, architecture docs, or issues
7. **Add technical details** - Include code snippets, config examples
8. **Update immediately** - Don't batch changelog entries
