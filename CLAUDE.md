# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Weave** - Turn vague goals into daily wins, proof, and a stronger identity in 10 days.

**Target Users:** Ambitious but chaotic students and builders (high intent, inconsistent execution)

**Current Stage:** Pre-MVP (Documentation and architecture planning phase)

## Tech Stack

- **Mobile:** React Native (iOS App Store)
- **Backend:** Python FastAPI (deployed on Railway)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Push Notifications:** iOS APNs
- **Analytics:** PostHog
- **Error Tracking:** Sentry
- **Job Queue:** Redis + BullMQ

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

## Data Classification (Critical)

### Canonical Truth (Immutable Event Logs)
- Goals, Q-goals, subtasks
- Completions (immutable completion events)
- Captures (photos, notes, audio)
- Journals (daily reflections)
- Identity documents

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

## AI Cost Control Strategy

- Most screens should NOT call the AI model
- Batch AI calls around journal time and onboarding
- Cache outputs with input_hash; regenerate only when inputs change
- Use deterministic logic where possible
- Rate limiting: 10 AI calls/hour per user

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

- Row Level Security (RLS) on all user-owned tables in Supabase
- JWT verification middleware for custom APIs
- File upload limits: 10MB max, allowed types: JPEG, PNG, MP3
- Input validation with Zod or similar

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

## Documentation

- `docs/idea/mvp.md` - Complete product MVP specification (1600+ lines)
- `docs/idea/backend.md` - Backend architecture V2 (1586 lines, includes full database schema)
- `docs/idea/ai.md` - AI system design
- `docs/setup/mcp-setup-guide.md` - MCP servers configuration (6 servers)
- `docs/dev/mcp-quick-reference.md` - Daily MCP usage guide

## MCP Servers Configured

This project uses 6 MCP servers for AI-assisted development:

1. **Context7** - Up-to-date library documentation (React Native, Expo, Supabase)
2. **Ripgrep** - Lightning-fast local codebase search
3. **Filesystem** - Scoped read access to repo and docs
4. **GitHub** - Repository operations (issues, PRs, diffs)
5. **BrowserStack** - Real-device testing and screenshots
6. **Notion** - Product specs and documentation access

**Setup:** API keys required - see `docs/setup/mcp-setup-guide.md`

## Workflow Tips

1. **Always start with docs** - Read `docs/idea/mvp.md` for product context, `docs/idea/backend.md` for architecture
2. **Data classification matters** - Know what is canonical truth vs. derived views
3. **Cost awareness** - Count AI API calls carefully, use caching with input_hash, batch operations around journal time
4. **MVP focus** - Don't implement post-MVP features. Real devices + user data matters more than fancy UI
5. **Use MCP servers** - Ripgrep for finding code, Context7 for current API syntax, Filesystem for reading architecture docs

## Changelog Conventions

**IMPORTANT:** When making significant changes to the project, always document them in the changelog.

### File Location
- **Single source of truth:** `.cursor/.cursor-changes`
- **Do NOT create:** duplicate changelog files in root or other locations
- **Format:** Markdown with structured sections

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
