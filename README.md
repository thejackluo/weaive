# Weave

**Turn vague goals into daily wins, proof, and a stronger identity in 10 days.**

An AI-powered mobile app that transforms abstract goals into actionable habits (binds) through personalized coaching from your Dream Self. Built for ambitious people who struggle with consistent execution.

---

## 📱 What is Weave?

Weave is an iOS productivity app that helps users:

- **Break down vague goals** into measurable actions using AI-powered goal decomposition
- **Build consistent habits** through daily "binds" (actions that strengthen your progress)
- **Track progress with proof** via photos, timers, and reflections
- **Get personalized coaching** from an AI advisor based on your ideal future self
- **Visualize growth** through consistency heat maps, streaks, and identity evolution

**Core Philosophy:** Users don't just log tasks—they weave a stronger identity through consistent action and reflection.

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
| **Mobile** | React Native + Expo SDK 53 | iOS App Store (React 19, TypeScript) |
| **Backend** | Python FastAPI | Deployed on Railway |
| **Database** | Supabase PostgreSQL | Postgres + Auth + Storage |
| **AI Models** | GPT-4o, Claude 3.7 Sonnet | OpenAI + Anthropic APIs |
| **Push** | Expo Push (APNs) | iOS notifications |
| **Analytics** | PostHog (post-MVP) | User behavior tracking |

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
├── src/
│   └── design-system/           # React Native design system
│       ├── components/          # Button, Card, Input, Text, etc.
│       ├── tokens/              # Colors, typography, spacing
│       └── theme/               # ThemeContext and hooks
│
├── docs/                        # All project documentation
│   ├── architecture.md          # System architecture decisions
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

# Install dependencies (use npx expo install for Expo packages!)
npx expo install expo-router expo-linking expo-constants react-native-screens
npm install @supabase/supabase-js

# Start development server
npx expo start
```

> **📌 Best Practice:** Always use `npx expo install <package>` instead of `npm install` for React Native packages in Expo projects. This automatically resolves SDK-compatible versions and prevents dependency conflicts.

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

This project uses **6 MCP servers** to enhance AI-assisted development with contextual awareness.

### Configured Servers

| Server | Purpose | Setup Time | Status |
|--------|---------|------------|--------|
| **Filesystem** | Read project files | Instant | ✅ Works immediately |
| **Everything** | Code search, git ops, file operations | Instant | ✅ Works immediately |
| **Context7** | Up-to-date library documentation (React Native, Expo, Supabase) | 5 min | ⚙️ Requires API key |
| **GitHub** | Issues, PRs, branches | 3 min | ⚙️ Requires token |
| **Notion** | Product specs and documentation | 5 min | 🔄 Optional |
| **BrowserStack** | Real-device testing | 5 min | 🔄 Optional |

### Quick Setup

```bash
# 1. Copy MCP config template
cp .mcp.json.example .mcp.json

# 2. Add your API keys to .mcp.json
# (See docs/setup/mcp-setup-guide.md for details)

# 3. Restart Cursor

# 4. Test
# Ask: "Read docs/architecture.md and summarize"
```

📖 **Full setup guide:** [`docs/setup/mcp-setup-guide.md`](docs/setup/mcp-setup-guide.md)  
📚 **Daily reference:** [`docs/dev/mcp-quick-reference.md`](docs/dev/mcp-quick-reference.md)

---

## 📖 Core Documentation

### Product & Design

- **[MVP Specification](docs/idea/mvp.md)** - Complete product definition, user flows, and feature specs
- **[Architecture Decisions](docs/architecture.md)** - Technical architecture, tech stack, and MVP vs. scale strategy
- **[Design System Guide](docs/dev/design-system-guide.md)** - How to use the Weave design system

### Technical Architecture

- **[Backend Architecture](docs/idea/backend.md)** - API design, data models, event-driven workflows, security
- **[AI Architecture](docs/idea/ai.md)** - AI modules, orchestration, cost control, and personalization

### Developer Guides

- **[Documentation Viewer Guide](docs/dev/docs-viewer-guide.md)** - How to use and customize the docs viewer
- **[MCP Setup Guide](docs/setup/mcp-setup-guide.md)** - Configure AI development tools
- **[MCP Quick Reference](docs/dev/mcp-quick-reference.md)** - Daily MCP usage cheat sheet

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

## 🧪 Development Workflow

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
- `@bmad/bmm/workflows/quick-dev` - Fast iteration for features
- `@bmad/bmm/workflows/create-prd` - Product requirements
- `@bmad/bmm/workflows/create-architecture` - Architecture decisions
- `@bmad/bmm/workflows/code-review` - Code quality checks

📖 **BMAD documentation:** See `.cursor/rules/bmad/` for all available agents and workflows

---

## 🔒 Security

### Row-Level Security (RLS)

All user-owned tables protected with Supabase RLS policies:

```sql
-- Example: user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid()::text = auth_user_id);
```

### Rate Limiting

- AI generation: 10 requests/hour per user
- Uploads: 50 per day per user
- Completions: 100 per day per user

### Data Classification

**Canonical Truth (Immutable):**
- Goals, completions, captures, journals, identity docs
- Never edited in a way that changes history

**Derived Views (Recomputable):**
- Streaks, consistency %, ranks, badges, summaries
- Can always be regenerated from canonical truth

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

### MVP (Launching Soon)

- ✅ Goal breakdown engine with AI
- ✅ Identity document system
- ✅ Action + memory capture
- ✅ Daily reflection and journaling
- ✅ Progress visualization (heatmaps, streaks)
- ✅ Dream Self AI coach

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

## 🤝 Contributing

This is currently a private project in MVP development. Contribution guidelines will be added when the project opens to collaborators.

---

## 📝 License

Proprietary - All rights reserved

---

## 🙏 Acknowledgments

- **Design inspiration:** Opal app (for visual design)
- **Concept inspiration:** Hollow Knight: Silksong (thread/needle/weave metaphor)
- **AI frameworks:** OpenAI, Anthropic for model APIs

---

**Built with ❤️ by the Weave team**

*See who you're becoming.*