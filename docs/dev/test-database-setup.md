# Test Database Setup Guide

**Story:** 4.1 (and all future stories requiring database integration tests)
**Date:** 2025-12-20

---

## Overview

This guide explains how to set up a **local Supabase instance using Docker** for running integration tests. This is the recommended approach for testing API endpoints that interact with the database.

---

## Why Local Supabase?

### ✅ Advantages

1. **Complete Safety** - Impossible to corrupt production data
2. **Lightning Fast** - No network latency, tests run 10x faster
3. **Free & Unlimited** - No cost concerns, run tests as much as you want
4. **Instant Reset** - Clean database state in seconds
5. **Production Parity** - Exact same PostgreSQL + RLS + Auth as production
6. **Offline Development** - Work without internet connection
7. **Parallel Testing** - Each developer has their own instance

### ❌ Avoid: Cleanup on Same Database

**Never** use the production or development database with cleanup after each test:
- 🚨 **Extremely dangerous** - One mistake could delete production data
- 🐌 **Slow** - Cleanup takes significant time
- 🔒 **Serial** - Can't run tests in parallel
- 🐛 **Unreliable** - Race conditions and conflicts

---

## Prerequisites

### Required Software

1. **Docker Desktop**
   - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - Windows: Install WSL 2 first (included in Docker Desktop installer)
   - Mac: Install Docker Desktop directly
   - Linux: Install Docker Engine

2. **Supabase CLI**
   - Installed via npm (already in project dependencies)
   - No separate installation needed

### Verify Installation

```bash
# Check Docker is running
docker --version
# Expected: Docker version 20.10+ or higher

# Check Supabase CLI is available
npx supabase --version
# Expected: 1.x.x or higher
```

---

## Setup Instructions

### Step 1: Initialize Supabase (One-time)

Run this command from the project root:

```bash
npx supabase init
```

**What this does:**
- Creates `supabase/` directory
- Creates `supabase/config.toml` (local Supabase configuration)
- Creates `supabase/migrations/` directory (database schema changes)

**Output:**
```
✔ Project initialized successfully.
```

---

### Step 2: Start Local Supabase

```bash
npx supabase start
```

**What this does:**
- Pulls Docker images (first time only, ~2GB download)
- Starts PostgreSQL, PostgREST, Auth, Storage containers
- Creates local database with default schema
- Prints connection details

**Output:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: <jwt-secret-key>
        anon key: <anon-public-key>
service_role key: <service-role-secret-key>
```

**Important:** Save these credentials - you'll need them for `.env.test`.

---

### Step 3: Apply Database Migrations

Copy existing migrations to `supabase/migrations/` directory:

```bash
# Copy RLS migration (Story 0.4)
cp supabase/migrations/20251219170656_row_level_security.sql supabase/migrations/

# Apply all migrations
npx supabase db push
```

**What this does:**
- Runs all migration files in `supabase/migrations/` in order
- Creates tables, indexes, RLS policies
- Sets up database schema identical to production

**Output:**
```
Applying migration 20251219170656_row_level_security.sql...
Migration applied successfully.
```

---

### Step 4: Configure Test Environment Variables

Create `.env.test` file in `weave-api/`:

```bash
# weave-api/.env.test

# Local Supabase Test Database
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<anon-key-from-supabase-start>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key-from-supabase-start>

# Database Connection (for direct PostgreSQL access)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Environment Flag
ENVIRONMENT=test
```

**Security Note:** `.env.test` should be in `.gitignore` (already configured).

---

### Step 5: Update Test Configuration

Update `weave-api/tests/conftest.py` to use real Supabase:

```python
"""Pytest configuration and shared fixtures for integration tests."""

import pytest
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi.testclient import TestClient

from app.main import app

# Load test environment variables
load_dotenv(".env.test")


@pytest.fixture(scope="session")
def supabase_client() -> Client:
    """Create a real Supabase client for integration tests.

    Uses local Supabase instance started with `npx supabase start`.
    """
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        pytest.skip("Supabase test environment not configured. Run: npx supabase start")

    return create_client(supabase_url, supabase_key)


@pytest.fixture(scope="function")
def client(supabase_client):
    """Create a test client for the FastAPI app with real database."""
    # FastAPI app will use SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.test
    return TestClient(app)


@pytest.fixture(scope="function", autouse=True)
def cleanup_test_data(supabase_client):
    """Clean up test data after each test.

    This fixture runs automatically after EVERY test function.
    It deletes all data from user-owned tables to ensure test isolation.
    """
    yield  # Test runs here

    # Cleanup after test
    # Order matters: delete child records before parent records
    tables_to_clean = [
        "triad_tasks",
        "ai_artifacts",
        "ai_runs",
        "daily_aggregates",
        "journal_entries",
        "captures",
        "subtask_completions",
        "subtask_instances",
        "subtask_templates",
        "goals",
        "identity_docs",
        "user_profiles",
    ]

    for table in tables_to_clean:
        try:
            supabase_client.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        except Exception as e:
            # Ignore errors (table might not exist or might be empty)
            pass
```

---

### Step 6: Verify Setup Works

Run the health check test:

```bash
cd weave-api
uv run pytest tests/test_health.py -v
```

**Expected Output:**
```
tests/test_health.py::test_health_endpoint PASSED

========================== 1 passed in 0.45s ==========================
```

If this passes, your local Supabase is working correctly!

---

## Daily Workflow

### Starting Work Session

```bash
# 1. Start local Supabase (if not already running)
npx supabase start

# 2. Check status
npx supabase status

# 3. Run tests
cd weave-api && uv run pytest tests/ -v
```

### Stopping Work Session

```bash
# Stop local Supabase containers (preserves data)
npx supabase stop

# Stop and delete ALL data (complete reset)
npx supabase stop --no-backup
```

---

## Common Operations

### Reset Database to Clean State

```bash
# Option 1: Reset to migrations only (recommended)
npx supabase db reset

# Option 2: Stop and restart (slower)
npx supabase stop --no-backup
npx supabase start
```

**When to use:**
- Before running full test suite
- After tests leave database in inconsistent state
- When switching between branches with different schemas

### View Database in Supabase Studio

```bash
# Open Studio UI in browser
open http://localhost:54323

# Or run this command
npx supabase studio
```

**Studio features:**
- Browse tables and data
- Run SQL queries
- View table schemas
- Test RLS policies
- View API logs

### Run SQL Directly

```bash
# Interactive PostgreSQL shell
npx supabase db shell

# Run SQL file
npx supabase db execute -f path/to/script.sql

# Run inline SQL
echo "SELECT * FROM user_profiles LIMIT 5;" | npx supabase db shell
```

### View Logs

```bash
# View all logs
npx supabase logs

# View specific service logs
npx supabase logs postgres
npx supabase logs auth
npx supabase logs api
```

---

## Running Tests

### Backend Tests (API + Database)

```bash
# Run all tests
cd weave-api && uv run pytest tests/ -v

# Run specific test file
uv run pytest tests/test_journal_router.py -v

# Run single test
uv run pytest tests/test_journal_router.py::TestJournalEntryCreation::test_create_journal_entry_with_default_questions_only -v

# Run with coverage
uv run pytest tests/ --cov=app --cov-report=html
```

### Mobile Tests (Unit + Component)

```bash
# Run all tests (uses mocks, no database needed)
cd weave-mobile && npm test

# Run specific test file
npm test -- ReflectionFlow.integration.test.tsx

# Run with coverage
npm test -- --coverage
```

---

## Troubleshooting

### Issue: "Docker is not running"

**Error:**
```
Error: Docker is not running
```

**Solution:**
1. Start Docker Desktop
2. Wait for Docker to fully start (check system tray icon)
3. Run `docker ps` to verify
4. Try `npx supabase start` again

---

### Issue: "Port already in use"

**Error:**
```
Error: port 54321 is already in use
```

**Solution:**

```bash
# Option 1: Stop existing Supabase instance
npx supabase stop

# Option 2: Kill process on port 54321
# Mac/Linux:
lsof -ti:54321 | xargs kill -9

# Windows:
netstat -ano | findstr :54321
taskkill /PID <process-id> /F
```

---

### Issue: "Migrations not applied"

**Error:**
```
ERROR: relation "user_profiles" does not exist
```

**Solution:**

```bash
# Apply all migrations
npx supabase db push

# Or reset and re-apply
npx supabase db reset
```

---

### Issue: "Connection refused"

**Error:**
```
psycopg2.OperationalError: could not connect to server
```

**Solution:**

```bash
# 1. Check if Supabase is running
npx supabase status

# 2. If not running, start it
npx supabase start

# 3. Check .env.test has correct DATABASE_URL
cat .env.test | grep DATABASE_URL
```

---

### Issue: "Tests interfering with each other"

**Symptom:** Tests pass individually but fail when run together

**Solution:**
- Ensure `cleanup_test_data` fixture runs after each test (should be automatic)
- Reset database before test suite: `npx supabase db reset`
- Check for tests that create data with hardcoded IDs

---

## Fallback: Separate Cloud Test Project

If Docker is unavailable, you can use a separate Supabase cloud project:

### Setup

1. Create new Supabase project at https://supabase.com
2. Name it: `weave-test` (or similar)
3. Copy connection details to `.env.test`
4. Run migrations: `npx supabase db push --db-url <test-project-url>`

### Pros
- ✅ Safe (isolated from production)
- ✅ Works without Docker

### Cons
- ❌ Slower (network latency)
- ❌ Costs money after free tier limits
- ❌ Requires internet connection
- ❌ Shared between team members (conflicts possible)

---

## Best Practices

### DO ✅

- **Use local Supabase for development** - Fast and safe
- **Reset database before test suite** - Clean starting state
- **Use factories for test data** - Consistent, predictable data
- **Clean up after each test** - `cleanup_test_data` fixture
- **Use meaningful test data** - Easy to debug failures
- **Test RLS policies** - Critical for security

### DON'T ❌

- **Never test against production database** - Too dangerous
- **Don't use hardcoded IDs** - Use factories with random IDs
- **Don't skip cleanup** - Tests must be isolated
- **Don't assume order** - Tests should run in any order
- **Don't commit .env.test** - Already in .gitignore
- **Don't share test database** - Each developer uses local instance

---

## Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [pytest Best Practices](https://docs.pytest.org/en/stable/goodpractices.html)
- [FastAPI Testing Guide](https://fastapi.tiangolo.com/tutorial/testing/)

---

## Summary

**Recommended Setup:** Local Supabase with Docker

```bash
# One-time setup
npx supabase init
npx supabase start
npx supabase db push

# Create .env.test with local credentials

# Daily workflow
npx supabase start  # Start work session
uv run pytest tests/ -v  # Run tests
npx supabase stop  # End work session

# Reset when needed
npx supabase db reset
```

**This gives you:**
- ✅ Safe, isolated test environment
- ✅ Fast test execution
- ✅ Free, unlimited testing
- ✅ Production parity
- ✅ Easy database reset

---

**Questions?** Refer to Story 0.7 (`docs/stories/0-7-test-infrastructure.md`) or ask in team standup.
