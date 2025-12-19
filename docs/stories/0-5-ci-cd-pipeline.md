# Story 0.5: CI/CD Pipeline

**Story Key:** `0-5-ci-cd-pipeline`
**Story ID:** 0.5
**Epic:** 0 (Foundation)
**Story Points:** 3
**Status:** ready-for-dev
**Dependencies:** 0-1 (Project Scaffolding - `docs/stories/0-1-project-scaffolding.md`), 0-4 (Row-Level Security - `docs/stories/0-4-row-level-security.md`)
**Created:** 2025-12-19

---

## Story Overview

**User Story:**
As a **development team**, I need **automated CI/CD pipelines for linting, type checking, testing, and deployment**, so that **code quality is enforced before merge, builds are automated, and deployments are reliable**.

**Business Value:**
- **Quality Assurance:** Automated checks prevent bugs from reaching production
- **Velocity:** Faster feedback loops reduce PR review time by 40-60%
- **Reliability:** Consistent build and deployment process eliminates "works on my machine" issues
- **Confidence:** Team can merge confidently knowing all tests pass

**Why This Story Matters:**
This is the **automation foundation** that enables the team to move fast without breaking things. Without CI/CD, every merge is risky and manual testing slows development to a crawl.

---

## Prerequisites

Before starting this story, ensure:
- ✅ Story 0.1 completed (Project Scaffolding with mobile + backend)
- ✅ ESLint 9 configured for mobile (flat config format in `eslint.config.mjs`)
- ✅ Ruff configured for backend (in `pyproject.toml`)
- ✅ GitHub repository exists with `main` branch
- ✅ Expo account created (for EAS Build)
- ✅ Railway account created (for backend deployment)

---

## Context & Background

### Epic Context
**Epic 0: Foundation** establishes project infrastructure before feature development. Story 0.5 completes the automation layer:
- ✅ 0.1: Project Scaffolding (`docs/stories/0-1-project-scaffolding.md`) - Established ESLint 9, Ruff, TypeScript, test structure
- ✅ 0.2a/b: Database Schema - Created migrations that need CI validation
- ✅ 0.3: Authentication Flow - Added auth logic requiring automated tests
- ✅ 0.4: Row-Level Security (`docs/stories/0-4-row-level-security.md`) - Noted "CI/CD workflow creation is follow-up task" (AC-0.4-10)

### Architecture Alignment

**Tech Stack Requirements (from `docs/architecture/core-architectural-decisions.md`):**
- **Mobile:** Expo SDK 54, React Native 0.81, React 19, TypeScript strict mode, ESLint 9 (flat config), NativeWind
- **Backend:** Python 3.11+, FastAPI, uv package manager, Ruff linter, pytest
- **Testing:** Jest + React Native Testing Library (mobile), pytest (backend)
- **Deployment:** Expo EAS Build (iOS), Railway (backend API)

**CI/CD Philosophy:**
- **Fail Fast:** Lint and type check before running expensive tests
- **Parallelization:** Run mobile and backend CI independently (monorepo with path filters)
- **Caching:** Aggressive caching for node_modules, .expo, uv dependencies (~75% faster subsequent runs)
- **Non-Blocking Builds:** EAS Build uses `--no-wait` flag (doesn't block CI runner time)

### Previous Story Learnings

**From Story 0.1 (Project Scaffolding):**
- ESLint 9 uses **NEW flat config format** (eslint.config.mjs, not .eslintrc.js)
- Mobile dev server runs on port 8082 (not default 8081)
- Backend uses `uv` package manager (not pip/poetry)
- Both apps have linting configured and passing locally

**From Story 0.4 (RLS):**
- RLS tests use `supabase test db` locally
- Penetration test script exists: `scripts/test_rls_security.py`
- Tests currently run locally only - CI/CD needed to enforce before merge

**Critical Implementation Insight:**
Story 0.1 implementation notes mention "Pre-commit hooks documentation: Will add in Story 0.5 (CI/CD Pipeline)" - this story fulfills that requirement.

---

## Implementation Approach

### Subtasks

**1. Set up GitHub repository secrets (0.25 SP)**
   - Add `EXPO_TOKEN` to GitHub repository secrets (Settings → Secrets and variables → Actions)
   - Generate token at https://expo.dev/settings/access-tokens
   - Optional: Add `RAILWAY_TOKEN` for automated backend deployment
   - Document token generation process in `docs/dev/ci-cd-setup.md`

**2. Create mobile linting workflow (0.5 SP)**
   - File: `.github/workflows/mobile-lint.yml`
   - Trigger on: `push` to `main`, `pull_request` targeting `main` with path filter `weave-mobile/**`
   - Actions: Checkout, setup Node.js 22, cache npm, install dependencies, run ESLint
   - Uses ESLint 9 flat config format (no migration needed)
   - Exit code 1 on lint errors to fail CI

**3. Create backend linting workflow (0.5 SP)**
   - File: `.github/workflows/backend-lint.yml`
   - Trigger on: `push` to `main`, `pull_request` targeting `main` with path filter `weave-api/**`
   - Actions: Checkout, setup uv with caching, sync dependencies, run Ruff
   - Uses `astral-sh/setup-uv@v7` with `enable-cache: true`
   - Run: `uv run ruff check .` with exit code enforcement

**4. Create TypeScript type checking workflow (0.25 SP)**
   - File: `.github/workflows/type-check.yml`
   - Trigger on: Same as mobile-lint with path filter `weave-mobile/**`
   - Actions: Checkout, setup Node.js, cache, install, run `tsc --noEmit`
   - TypeScript strict mode already enabled in tsconfig.json

**5. Create mobile tests workflow (0.5 SP)**
   - File: `.github/workflows/mobile-tests.yml`
   - Trigger on: Same as mobile-lint
   - Actions: Checkout, setup Node.js, cache, install, run Jest
   - Run: `npm run test -- --ci --coverage --maxWorkers=2`
   - Upload coverage report to GitHub Actions artifacts (optional)

**6. Create backend tests workflow (0.5 SP)**
   - File: `.github/workflows/backend-tests.yml`
   - Trigger on: Same as backend-lint
   - Actions: Checkout, setup uv with caching, sync with dev dependencies, run pytest
   - Run: `uv run pytest tests --cov=app --cov-report=term-missing`
   - Includes RLS penetration test: `uv run python scripts/test_rls_security.py`

**7. Configure Expo EAS Build (0.25 SP)**
   - Verify `eas.json` exists (created by Story 0.1 prerequisite)
   - Create `.github/workflows/eas-build.yml` (manual trigger only for MVP)
   - Trigger: `workflow_dispatch` (manual button in GitHub Actions tab)
   - Actions: Checkout, setup Node.js, setup Expo/EAS, install, build with `--non-interactive --no-wait`
   - Uses `expo/expo-github-action@v8` with `eas-version: latest`, `token: ${{ secrets.EXPO_TOKEN }}`
   - Document: EAS Build runs on Expo servers (not billed as GitHub Actions time)

**8. Configure branch protection rules (0.25 SP)**
   - In GitHub repo: Settings → Branches → Add branch protection rule for `main`
   - Require status checks: `mobile-lint`, `backend-lint`, `type-check`, `mobile-tests`, `backend-tests`
   - Require branches to be up to date before merging
   - Enable "Require approval before merging" (1 approver)
   - Document process in `docs/dev/git-workflow-guide.md`

**9. Document CI/CD setup and troubleshooting (0.25 SP)**
   - Create `docs/dev/ci-cd-setup.md` with:
     - How to add GitHub secrets
     - How to trigger EAS Build manually
     - Common CI failures and fixes
     - Cache invalidation process
     - Railway deployment strategy (deferred to post-MVP)
   - Update `CLAUDE.md` with CI/CD command reference

### Technical Decisions

**TD-0.5-1: Separate workflows vs monolithic**
- **Decision:** 5 separate workflow files (mobile-lint, backend-lint, type-check, mobile-tests, backend-tests)
- **Rationale:** Path filters allow mobile changes to skip backend CI (faster feedback). Independent failure isolation. Easier to debug.
- **Alternative considered:** Single workflow with matrix strategy - rejected (no path filter support per job, all jobs run always)

**TD-0.5-2: When to trigger EAS Build**
- **Decision:** Manual trigger only (`workflow_dispatch`) for MVP. Automatic on tag push post-MVP.
- **Rationale:** EAS Build takes 10-30 minutes; don't want it blocking every PR. Manual control during alpha phase. Tag-based automation for production releases.
- **Future:** On `v*` tag push, trigger EAS Build for production release

**TD-0.5-3: Railway deployment strategy**
- **Decision:** Defer automated Railway deployment to post-MVP. Manual Railway CLI deployment for now.
- **Rationale:** Railway auto-deploys from GitHub integration (set up in Railway dashboard, not CI). No GitHub Actions workflow needed for MVP.
- **Future:** Add `railway up` to GitHub Actions for preview environments per PR

**TD-0.5-4: Cache strategy**
- **Decision:** Use action-provided caching (npm cache, uv enable-cache) instead of custom cache actions
- **Rationale:** Simpler configuration, maintained by action authors, automatic cache key generation
- **Alternative considered:** Manual `actions/cache` with custom keys - rejected (more complex, error-prone)

**TD-0.5-5: Test parallelization**
- **Decision:** Single-threaded mobile tests (`--maxWorkers=2`), single backend test run (no matrix)
- **Rationale:** MVP test suite is small (<10 tests per platform). Matrix adds complexity without speed benefit. Add parallelization when test suite >100 tests.
- **Future:** Matrix strategy for testing Node 20/22, Python 3.11/3.12/3.13

---

## Testing Strategy

### Manual Verification

**Step-by-Step Test Procedure:**

**1. Verify Workflows Created:**
   - Check `.github/workflows/` contains 6 workflow files
   - Open GitHub repo → Actions tab → Verify workflows appear in sidebar

**2. Test Lint Workflows:**
   - Create branch: `test/ci-lint-check`
   - Intentionally add lint error to mobile: `const x = 123` (unused variable)
   - Commit and push to trigger CI
   - Verify `mobile-lint` workflow runs and **fails**
   - Fix lint error, push again, verify **passes**
   - Repeat for backend: add unused import, verify `backend-lint` fails then passes

**3. Test Path Filters:**
   - Make change to `weave-mobile/README.md` only
   - Push and verify: `mobile-lint`, `type-check`, `mobile-tests` run; `backend-lint`, `backend-tests` **do not run**
   - Make change to `weave-api/README.md` only
   - Verify: `backend-lint`, `backend-tests` run; mobile workflows **do not run**

**4. Test Type Check Workflow:**
   - Add TypeScript error: `const x: number = "string"`
   - Push and verify `type-check` workflow **fails**
   - Fix and verify **passes**

**5. Test Branch Protection:**
   - Create PR with failing lint
   - Verify: "Merge" button is disabled with message "Required status checks must pass"
   - Fix lint, push, wait for CI to pass
   - Verify: "Merge" button becomes enabled

**6. Test EAS Build (Manual Trigger):**
   - Go to Actions tab → "EAS Build" workflow → "Run workflow" button
   - Select `main` branch, click "Run workflow"
   - Verify: Workflow triggers, prints EAS Build URL, exits quickly (~30s, not 10+ min)
   - Open EAS Build URL, verify build is queued/running on Expo servers

**Expected Results:**
- All 6 workflows trigger correctly based on path filters
- Failing checks block PR merge
- Passing checks allow PR merge
- EAS Build triggers manually and offloads to Expo servers

### Integration Testing

**Automated Verification Script:** `scripts/verify-ci-setup.sh`

```bash
#!/bin/bash
# Verify CI/CD setup is correct

echo "🔍 Verifying CI/CD Configuration..."

# Check workflow files exist
WORKFLOWS=(
  ".github/workflows/mobile-lint.yml"
  ".github/workflows/backend-lint.yml"
  ".github/workflows/type-check.yml"
  ".github/workflows/mobile-tests.yml"
  ".github/workflows/backend-tests.yml"
  ".github/workflows/eas-build.yml"
)

for workflow in "${WORKFLOWS[@]}"; do
  if [ -f "$workflow" ]; then
    echo "✅ $workflow exists"
  else
    echo "❌ $workflow MISSING"
    exit 1
  fi
done

# Check GitHub secrets (requires gh CLI)
if command -v gh &> /dev/null; then
  echo "Checking GitHub secrets..."
  if gh secret list | grep -q "EXPO_TOKEN"; then
    echo "✅ EXPO_TOKEN secret exists"
  else
    echo "⚠️  EXPO_TOKEN secret NOT FOUND (required for EAS Build)"
  fi
fi

echo ""
echo "✅ CI/CD setup verification complete!"
```

**Run:** `bash scripts/verify-ci-setup.sh`

---

## Acceptance Criteria

### Functional Requirements

- [ ] **AC-0.5-1:** GitHub Actions workflows trigger automatically on push to `main` and PR to `main`
- [ ] **AC-0.5-2:** Mobile lint workflow runs ESLint 9 (flat config) and fails on lint errors
- [ ] **AC-0.5-3:** Backend lint workflow runs Ruff and fails on lint errors
- [ ] **AC-0.5-4:** Type check workflow runs `tsc --noEmit` and fails on TypeScript errors
- [ ] **AC-0.5-5:** Mobile tests workflow runs Jest with coverage
- [ ] **AC-0.5-6:** Backend tests workflow runs pytest with coverage + RLS penetration test
- [ ] **AC-0.5-7:** Path filters work: mobile changes don't trigger backend CI and vice versa
- [ ] **AC-0.5-8:** Branch protection rules prevent merging PRs with failing CI
- [ ] **AC-0.5-9:** EAS Build workflow can be triggered manually and offloads to Expo servers
- [ ] **AC-0.5-10:** Workflows complete in <5 minutes (with cache) on typical PR

### Technical Requirements

- [ ] **AC-0.5-11:** `EXPO_TOKEN` secret configured in GitHub repository
- [ ] **AC-0.5-12:** npm dependencies cached with `actions/setup-node` cache feature
- [ ] **AC-0.5-13:** uv dependencies cached with `astral-sh/setup-uv` enable-cache feature
- [ ] **AC-0.5-14:** CI/CD documentation created in `docs/dev/ci-cd-setup.md`
- [ ] **AC-0.5-15:** Git workflow guide updated with branch protection info

### Definition of Done

- [ ] All 6 workflows created and tested
- [ ] Branch protection rules enabled on `main` branch
- [ ] Documentation complete and reviewed
- [ ] Verification script passes
- [ ] At least 1 PR merged using the new CI/CD process
- [ ] Code reviewed by team lead

---

## Success Metrics

**Immediate Validation:**
- Workflow completion time: <5 minutes with cache (first run ~8-10 minutes)
- Cache hit rate: >80% on subsequent runs
- False positive rate: <5% (CI fails but code is correct)
- Path filter accuracy: 100% (mobile changes never trigger backend CI)

**Operational Metrics (Post-Deployment):**
- CI reliability: >99% uptime
- Merge velocity: 2x faster (no manual testing before merge)
- Bug escape rate: <10% (bugs caught in CI vs production)
- Developer satisfaction: >8/10 on CI usefulness survey

---

## Risk Assessment

**Key Risks & Mitigations:**

1. **GitHub Actions quota exhaustion (2,000 min/month free tier)**
   - **Mitigation:** Aggressive caching (~75% time reduction), path filters (skip unnecessary workflows), optimize test parallelization
   - **Monitoring:** GitHub provides usage dashboard; set up alerts at 80% quota

2. **ESLint 9 flat config compatibility issues**
   - **Mitigation:** Story 0.1 already configured ESLint 9 locally and verified passing
   - **Fallback:** If issues arise, pin to specific ESLint version in package.json

3. **uv not available in GitHub Actions runners**
   - **Mitigation:** Official `astral-sh/setup-uv@v7` action maintained by Astral (uv creators)
   - **Status:** Verified stable since Nov 2024

4. **EAS Build credentials expiration**
   - **Mitigation:** Use `EXPO_TOKEN` with long expiration (90+ days), set calendar reminder to rotate
   - **Monitoring:** EAS Build will fail with clear error message if token expires

5. **Flaky tests causing false negatives**
   - **Mitigation:** Write deterministic tests (no setTimeout, mock time, isolate state), rerun failed tests once before blocking merge
   - **Process:** Document flaky tests in GitHub Issues, prioritize fixes

6. **Branch protection preventing hotfixes**
   - **Mitigation:** GitHub allows admins to bypass branch protection in emergencies
   - **Process:** Document emergency hotfix process in `docs/dev/git-workflow-guide.md`

---

## Implementation Notes

### Workflow Templates

**Mobile Lint Workflow (`.github/workflows/mobile-lint.yml`):**
```yaml
name: Mobile Lint

on:
  push:
    branches: [main]
    paths:
      - 'weave-mobile/**'
      - '.github/workflows/mobile-lint.yml'
  pull_request:
    branches: [main]
    paths:
      - 'weave-mobile/**'

jobs:
  lint:
    name: ESLint (Mobile)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: weave-mobile

    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: weave-mobile/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint
```

**Backend Lint Workflow (`.github/workflows/backend-lint.yml`):**
```yaml
name: Backend Lint

on:
  push:
    branches: [main]
    paths:
      - 'weave-api/**'
      - '.github/workflows/backend-lint.yml'
  pull_request:
    branches: [main]
    paths:
      - 'weave-api/**'

jobs:
  lint:
    name: Ruff (Backend)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: weave-api

    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Install uv
        uses: astral-sh/setup-uv@v7
        with:
          enable-cache: true
          cache-dependency-glob: "weave-api/uv.lock"

      - name: Set up Python
        run: uv python install 3.11

      - name: Install dependencies
        run: uv sync --locked

      - name: Run Ruff
        run: uv run ruff check .
```

**Type Check Workflow (`.github/workflows/type-check.yml`):**
```yaml
name: TypeScript Type Check

on:
  push:
    branches: [main]
    paths:
      - 'weave-mobile/**/*.ts'
      - 'weave-mobile/**/*.tsx'
      - 'weave-mobile/tsconfig.json'
      - '.github/workflows/type-check.yml'
  pull_request:
    branches: [main]
    paths:
      - 'weave-mobile/**/*.ts'
      - 'weave-mobile/**/*.tsx'
      - 'weave-mobile/tsconfig.json'

jobs:
  type-check:
    name: TypeScript Compiler
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: weave-mobile

    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: weave-mobile/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit
```

**Mobile Tests Workflow (`.github/workflows/mobile-tests.yml`):**
```yaml
name: Mobile Tests

on:
  push:
    branches: [main]
    paths:
      - 'weave-mobile/**'
      - '.github/workflows/mobile-tests.yml'
  pull_request:
    branches: [main]
    paths:
      - 'weave-mobile/**'

jobs:
  test:
    name: Jest (Mobile)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: weave-mobile

    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: weave-mobile/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test -- --ci --coverage --maxWorkers=2

      - name: Upload coverage
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: mobile-coverage
          path: weave-mobile/coverage/
```

**Backend Tests Workflow (`.github/workflows/backend-tests.yml`):**
```yaml
name: Backend Tests

on:
  push:
    branches: [main]
    paths:
      - 'weave-api/**'
      - 'scripts/test_rls_security.py'
      - '.github/workflows/backend-tests.yml'
  pull_request:
    branches: [main]
    paths:
      - 'weave-api/**'
      - 'scripts/test_rls_security.py'

jobs:
  test:
    name: pytest (Backend)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: weave-api

    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Install uv
        uses: astral-sh/setup-uv@v7
        with:
          enable-cache: true
          cache-dependency-glob: "weave-api/uv.lock"

      - name: Set up Python
        run: uv python install 3.11

      - name: Install dependencies
        run: uv sync --locked --all-extras --dev

      - name: Run pytest
        run: uv run pytest tests --cov=app --cov-report=term-missing --cov-report=xml

      - name: Upload coverage
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: backend-coverage
          path: weave-api/coverage.xml
```

**EAS Build Workflow (`.github/workflows/eas-build.yml`):**
```yaml
name: EAS Build (Manual)

on:
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform to build'
        required: true
        default: 'all'
        type: choice
        options:
          - all
          - ios
          - android

jobs:
  build:
    name: EAS Build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: weave-mobile

    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: weave-mobile/package-lock.json

      - name: Setup Expo and EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Trigger EAS Build
        run: eas build --platform ${{ inputs.platform }} --non-interactive --no-wait
```

### Common Pitfalls

**1. Don't forget path filters**
- **Pitfall:** All workflows run on every PR (slow, wastes quota)
- **Solution:** Add `paths:` filter to every workflow targeting specific directories
- **Example:** Mobile workflows should have `paths: ['weave-mobile/**']`

**2. Don't hardcode working directory in run commands**
- **Pitfall:** Commands fail because they assume root directory
- **Solution:** Use `defaults.run.working-directory` at job level
- **Example:** Set `defaults: run: working-directory: weave-mobile` for mobile jobs

**3. Don't use outdated action versions**
- **Pitfall:** Security vulnerabilities, deprecated features
- **Solution:** Use latest major versions: `@v5`, `@v6`, `@v7`, `@v8`
- **Check:** GitHub Dependabot will auto-PR action version updates

**4. Don't skip cache-dependency-path for monorepo**
- **Pitfall:** npm cache uses wrong package-lock.json location
- **Solution:** Always specify `cache-dependency-path: weave-mobile/package-lock.json`

**5. Don't commit EXPO_TOKEN to workflow file**
- **Pitfall:** Token exposed in public repo (security breach)
- **Solution:** Use `${{ secrets.EXPO_TOKEN }}` and set secret in GitHub Settings

### Troubleshooting Guide

**Issue: "uv: command not found"**
- **Cause:** `astral-sh/setup-uv` action not run before uv commands
- **Fix:** Ensure `uses: astral-sh/setup-uv@v7` step comes before any `run: uv` commands

**Issue: "EXPO_TOKEN is not set"**
- **Cause:** GitHub secret not configured or typo in workflow
- **Fix:** Go to Settings → Secrets and variables → Actions → New repository secret → Name: `EXPO_TOKEN`, Value: [your token]

**Issue: "Path filter not working"**
- **Cause:** Glob pattern syntax error or missing root-level files
- **Fix:** Use `paths: ['weave-mobile/**', '.github/workflows/mobile-*.yml']` to include workflow file itself

**Issue: "CI passes locally but fails in GitHub Actions"**
- **Cause:** Different Node/Python versions, missing environment variables, or race conditions
- **Fix:** Match CI versions exactly (Node 22, Python 3.11), check for `process.env` dependencies, add `--maxWorkers=2` to Jest

**Issue: "Branch protection blocks admin merge"**
- **Cause:** Branch protection applies to admins by default
- **Fix:** In branch protection settings, uncheck "Include administrators" (not recommended) OR have admin approval from another team member

**Issue: "Workflows take >10 minutes"**
- **Cause:** Cache not working or first-time run
- **Fix:** Check cache hit logs, ensure `enable-cache: true` for uv, verify `cache: 'npm'` for Node

### Emergency Rollback Plan

If CI/CD breaks production:
1. **Immediate:** Disable branch protection temporarily (Settings → Branches → Edit rule → Disable)
2. **Hotfix:** Make fix directly on `main` branch (emergency override)
3. **Investigate:** Check workflow logs, reproduce locally
4. **Fix:** Correct workflow file, test on branch, re-enable protection
5. **Post-Mortem:** Document issue in `docs/dev/ci-cd-troubleshooting.md`

### Railway Deployment (Future - Post-MVP)

**Automated deployment strategy (deferred):**
1. Railway GitHub integration auto-deploys `main` branch commits (no GitHub Actions needed)
2. For preview environments: Add `railway up` to PR workflow
3. For production releases: Tag-based deployment with `railway up --environment production`

**Manual deployment (MVP):**
```bash
# In weave-api/
railway up  # Deploys to Railway from local machine
```

---

**Next Story:** 0.6 - AI Service Abstraction (if not already complete) or 0.7 - Test Infrastructure
