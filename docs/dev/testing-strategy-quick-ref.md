# Testing Strategy Quick Reference

**Updated:** 2025-12-20 (Story 4.1)

---

## Test Database Strategy

### ✅ Recommended: Local Supabase with Docker

**Decision:** Use local Supabase instance for all integration tests

**Why:**
- ✅ **Safe** - Impossible to corrupt production data
- ✅ **Fast** - 10x faster than cloud (no network calls)
- ✅ **Free** - Unlimited test runs, no cost
- ✅ **Production Parity** - Exact same PostgreSQL + RLS + Auth
- ✅ **Instant Reset** - Clean slate in seconds: `npx supabase db reset`
- ✅ **Offline** - Works without internet

**Quick Start:**
```bash
# Automated setup
bash scripts/setup-test-db.sh

# Or manual:
npx supabase start  # Start local database
cp weave-api/.env.test.example weave-api/.env.test  # Create config
# Edit .env.test with credentials from supabase start output
npx supabase db push  # Apply migrations
```

**Daily Workflow:**
```bash
npx supabase start      # Start database
uv run pytest tests/    # Run tests
npx supabase db reset   # Reset database (clean slate)
npx supabase stop       # Stop database
```

### ❌ Avoid: Cleanup on Production/Dev Database

**Never** delete data from the same database after tests:
- 🚨 Too risky - one mistake could delete production data
- 🐌 Slow - cleanup takes significant time
- 🔒 Can't run tests in parallel

### ⚠️ Fallback: Separate Cloud Test Project

Use ONLY if Docker is unavailable:
- Create separate Supabase project: `weave-test`
- Slower (network latency)
- Costs money after free tier

---

## Test Levels

| Level | Purpose | Speed | Database | Example |
|-------|---------|-------|----------|---------|
| **Unit** | Pure logic | ⚡ Fastest | ❌ No | Validate fulfillment_score range |
| **Component** | UI behavior | ⚡ Fast | ❌ No | Character counter updates |
| **API** | Business logic | 🚀 Fast | ✅ Yes | POST /api/journal-entries |
| **E2E** | Full journey | 🐌 Slow | ✅ Yes | Navigation → submit → success |

**Strategy:**
- API tests: Most coverage (fast feedback, business logic validation)
- Component tests: UI edge cases (isolated, no database)
- E2E tests: Critical happy paths only (slow, brittle)

---

## Running Tests

### Backend (API + Database)

```bash
# All tests
cd weave-api && uv run pytest tests/ -v

# Specific file
uv run pytest tests/test_journal_router.py -v

# Single test
uv run pytest tests/test_journal_router.py::TestJournalEntryCreation::test_create_journal_entry_with_default_questions_only -v

# With coverage
uv run pytest tests/ --cov=app --cov-report=html
```

### Mobile (Component + E2E)

```bash
# All tests
cd weave-mobile && npm test

# Specific file
npm test -- ReflectionFlow.integration.test.tsx

# With coverage
npm test -- --coverage
```

---

## Test Data

### Backend Factories (Python)

```python
from tests.factories import create_test_journal_entry

# Basic journal entry
entry = create_test_journal_entry(fulfillment_score=8)

# With custom questions
entry = create_test_journal_entry_with_custom_questions()

# Override specific fields
entry = create_test_journal_entry(
    local_date="2025-12-20",
    default_responses={
        "today_reflection": "Great day!",
        "tomorrow_focus": "Keep going"
    }
)
```

### Mobile Mocks (TypeScript)

```typescript
import { generateMockJournalEntry } from '@/test-utils/mockData';

// Basic journal entry
const entry = generateMockJournalEntry({ fulfillment_score: 9 });

// With custom questions
const entryWithCustom = generateMockJournalEntryWithCustomQuestions();

// Array of custom questions
const questions = generateMockCustomQuestions(3);
```

---

## Database Cleanup

### Automatic Cleanup (Recommended)

**Backend:** `cleanup_test_data` fixture runs automatically after EVERY test
- Configured in `tests/conftest.py`
- Deletes all user-owned data
- Preserves schema and migrations

**How it works:**
```python
@pytest.fixture(scope="function", autouse=True)
def cleanup_test_data(supabase_client):
    yield  # Test runs here
    # After test: delete all data from 12 user-owned tables
```

### Manual Cleanup (When Needed)

```bash
# Full database reset (migrations only)
npx supabase db reset

# Stop and restart (complete reset)
npx supabase stop --no-backup
npx supabase start
```

**When to use:**
- Before running full test suite
- After tests leave database in inconsistent state
- When switching branches with different migrations

---

## Test Environment Variables

### Backend (.env.test)

```bash
# Local Supabase
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<from-npx-supabase-start>
SUPABASE_SERVICE_ROLE_KEY=<from-npx-supabase-start>
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
ENVIRONMENT=test
```

**Security:** `.env.test` is gitignored - NEVER commit this file

---

## Common Commands

```bash
# Check Supabase status
npx supabase status

# View database in browser
open http://localhost:54323  # Supabase Studio

# Run SQL query
npx supabase db shell

# View logs
npx supabase logs

# Apply new migrations
npx supabase db push

# Reset to clean state
npx supabase db reset
```

---

## Resources

- **Setup Guide:** `docs/dev/test-database-setup.md` (comprehensive)
- **Testing Guide:** `docs/dev/testing-guide.md` (Story 0.7)
- **ATDD Workflow:** `.bmad/bmm/workflows/testarch/atdd/instructions.md`
- **Supabase Local Dev:** https://supabase.com/docs/guides/cli/local-development

---

## Summary

**Best Practice:** Local Supabase with Docker

```bash
# One-time setup
bash scripts/setup-test-db.sh

# Daily workflow
npx supabase start  # Start
uv run pytest       # Test
npx supabase stop   # Stop
```

**This gives you:**
- ✅ Safe testing (no production risk)
- ✅ Fast execution (10x faster than cloud)
- ✅ Free & unlimited
- ✅ Easy database reset
