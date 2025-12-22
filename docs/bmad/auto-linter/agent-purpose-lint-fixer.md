# Agent Purpose and Type: lint-fixer

## Core Purpose

Automated linting and fixing agent for the Weavelight project that eliminates manual linting overhead and ensures code quality before PRs and during story implementation.

**Value Proposition:**
- Saves dev team time by automating repetitive linting tasks
- Reduces PR review friction by catching style/type issues early
- Ensures consistent code quality across backend (Python) and frontend (TypeScript/React Native)

## Target Users

**Primary Users:** Entire Weavelight development team

**Use Cases:**
- Run before creating pull requests to ensure clean code
- Run during story implementation to catch issues early
- Optional pre-commit hook to prevent committing lint errors

## Problem Solved

**Pain Point:** Manual linting is tedious and error-prone. PR reviews waste 20% of time on "run the linter" comments.

**Solution:** Automated convergence loop that runs backend and frontend linters with auto-fix, iterating up to 3 times until all errors are resolved or reporting what remains.

## Chosen Agent Type

**Type:** Simple Agent

**Rationale:**
- **Stateless utility** - Each linting run is independent, no memory needed across sessions
- **Self-contained logic** - All linting logic fits cleanly in YAML configuration
- **Team-wide tool** - Consistent behavior for all developers, no personalization required
- **No persistent state** - Doesn't need to learn or remember previous runs

## Architecture Scope

**Included Features:**
✅ Context-aware detection (weave-mobile/, weave-api/, or project root)
✅ Backend linting: `uv run ruff check .` + `uv run ruff format .`
✅ Frontend linting: `npx tsc --noEmit` + `npm run lint --fix`
✅ Max 3 iterations with convergence loop
✅ Partial success reporting (what was fixed, what remains with file/line details)
✅ Exit codes for CI compatibility (0=success, 1=remaining issues)
✅ Optional pre-commit hook setup command
✅ No git commits (just fix files in place)

**Explicitly Out of Scope:**
❌ Watch mode
❌ Result caching
❌ Markdown linting
❌ Automatic git commits

## Output Path

**Agent Location:** `.bmad/custom/src/agents/lint-fixer/lint-fixer.agent.yaml`

**Type:** Standalone Simple Agent (not tied to any specific module)

## Context from Brainstorming

Team consensus from party mode discussion:
- Pre-commit hooks are valuable first quality gate
- Context-awareness improves developer experience
- Partial success reporting with clear file/line details is essential
- Balance simplicity with useful features (not over-engineered, not under-featured)
- Keep core loop simple: detect context → run linters → iterate max 3x → report
