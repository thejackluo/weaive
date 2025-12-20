# Story 0.7: Test Infrastructure

Status: complete

## Story

As a **development team**,
I want **comprehensive test infrastructure** for both mobile and backend,
so that **I can write and run automated tests with coverage reporting, mocking, and test data factories**.

## Acceptance Criteria

1. **Mobile Testing Framework**
   - [x] Jest + React Native Testing Library configured in `weave-mobile/`
   - [x] Sample component test passes (`Button.test.tsx` or similar)
   - [x] Test commands work: `npm test`, `npm run test:watch`, `npm run test:coverage`
   - [x] Coverage reporting configured with baseline report (33 tests passing)

2. **Backend Testing Framework**
   - [x] pytest + pytest-asyncio + httpx configured in `weave-api/`
   - [x] Sample API endpoint test passes (`test_health.py` or similar)
   - [x] Test commands work: `uv run pytest`, `uv run pytest -v`, `uv run pytest --cov`
   - [x] Coverage reporting configured with baseline report (38 tests passing, 76% coverage)

3. **Test Database Setup**
   - [x] Separate Supabase test project created OR local PostgreSQL configured (documented approach)
   - [x] Test environment variables in `.env.test` template created
   - [x] Migrations can run against test database (documented)
   - [x] Database cleanup utilities in `tests/conftest.py` (cleanup_test_data function)

4. **Test Data Factories**
   - [x] Backend: Factory functions for creating test users, goals, subtasks, journal entries in `tests/factories.py`
   - [x] Mobile: Mock data generators for API responses in `src/test-utils/mockData.ts`
   - [x] Documented in `docs/dev/testing-guide.md`

5. **AI Mocking Strategy**
   - [x] Deterministic AI mocks for testing without real API calls in `tests/mocks/ai_mock.py`
   - [x] Mock responses for OpenAI and Anthropic API calls (MockOpenAIProvider, MockAnthropicProvider)
   - [x] Documented approach for testing AI-dependent features in testing guide

6. **Coverage Reporting**
   - [x] Mobile: Jest coverage report generated (`coverage/` directory)
   - [x] Backend: pytest-cov coverage report generated (76% baseline)
   - [x] Baseline coverage metrics documented in testing guide

## Tasks / Subtasks

- [x] Task 1: Configure Mobile Testing (AC: #1)
  - [x] Install Jest + React Native Testing Library dependencies
  - [x] Create `jest.config.js` with React Native preset
  - [x] Configure test scripts in `package.json`
  - [x] Write sample component test (`src/design-system/components/Button/__tests__/Button.test.tsx`)
  - [x] Verify `npm test` passes

- [x] Task 2: Configure Backend Testing (AC: #2)
  - [x] Install pytest + pytest-asyncio + httpx dependencies via `uv add --dev`
  - [x] Create `pytest.ini` or `pyproject.toml` test configuration
  - [x] Write sample API test (`tests/test_health.py` - already exists)
  - [x] Verify `uv run pytest` passes

- [x] Task 3: Set Up Test Database (AC: #3)
  - [x] Create separate Supabase test project OR configure local PostgreSQL (documented approach)
  - [x] Create `.env.test` with test database credentials template
  - [x] Document test database setup in `docs/dev/testing-guide.md`
  - [x] Write database cleanup utility function in `tests/conftest.py`

- [x] Task 4: Create Test Data Factories (AC: #4)
  - [x] Backend: Create `tests/factories.py` with fixture functions
  - [x] Mobile: Create `src/test-utils/mockData.ts` with mock generators
  - [x] Document factory usage patterns in testing guide

- [x] Task 5: Configure AI Mocking (AC: #5)
  - [x] Create mock AI response generators in `tests/mocks/ai_mock.py`
  - [x] Document AI mocking strategy for OpenAI and Anthropic
  - [x] Sample tests using mocked AI already exist in `test_ai_service.py`

- [x] Task 6: Enable Coverage Reporting (AC: #6)
  - [x] Mobile: Configure Jest coverage in `jest.config.js`
  - [x] Backend: Configure pytest-cov in `pyproject.toml`
  - [x] Generate baseline coverage reports (Mobile: 33 tests pass, Backend: 76% coverage)
  - [x] Document coverage commands in testing guide

## Dev Notes

### Project Structure Notes

**Mobile Testing (`weave-mobile/`):**
- Tests co-located with components: `src/components/__tests__/Button.test.tsx`
- Test utilities: `src/test-utils/mockData.ts`, `src/test-utils/testHelpers.ts`
- Jest configuration: `jest.config.js` (React Native preset)
- Coverage reports: `coverage/` directory (gitignored)

**Backend Testing (`weave-api/`):**
- Tests in dedicated directory: `tests/test_health.py`, `tests/test_goals.py`
- Test factories: `tests/factories.py`
- Configuration: `pytest.ini` or `pyproject.toml`
- Coverage reports: `htmlcov/` and `.coverage` (gitignored)

### Architecture Patterns and Constraints

**From Architecture Decision Document:**

1. **Testing Frameworks:**
   - Mobile: Jest + React Native Testing Library (standard React Native testing)
   - Backend: pytest + pytest-asyncio (async FastAPI support) + httpx (TestClient)

2. **Test Locations:**
   - Mobile: Co-located `*.test.tsx` files ([Source: docs/architecture/implementation-patterns-consistency-rules.md#test-locations](../architecture/implementation-patterns-consistency-rules.md#test-locations))
   - Backend: `api/tests/` directory (pytest convention)

3. **State Management Testing:**
   - TanStack Query: Use `@testing-library/react-hooks` for query/mutation tests
   - Zustand: Mock stores for UI state testing
   - Components: Test with `@testing-library/react-native`

4. **Naming Conventions:**
   - Test files: `ComponentName.test.tsx` (mobile), `test_module_name.py` (backend)
   - Test functions: `describe()` blocks for mobile, `def test_feature_name():` for backend
   - Mock files: `__mocks__/moduleName.ts` (mobile), `tests/mocks/` (backend)

5. **Data Integrity Testing:**
   - CRITICAL: Test that `subtask_completions` table is immutable (no UPDATE/DELETE)
   - Test database constraints (max 3 active goals, timezone NOT NULL)
   - Test RLS policies prevent cross-user access ([Source: docs/test-design-epic-0.md#p0-critical](../test-design-epic-0.md#p0-critical))

**From Test Design Document (docs/test-design-epic-0.md):**

**Risk Assessment Summary:**
- Total risks: 18 (8 high-priority with score ≥6)
- Critical categories: Security (SEC), Data Integrity (DATA), Technical (TECH)
- High-priority risks require P0/P1 test coverage

**Test Coverage Plan:**
- **P0 (Critical)**: 12 tests (~8 hours) - Run on every commit
- **P1 (High)**: 15 tests (~12 hours) - Run on PR to main
- **P2 (Medium)**: 18 tests (~10 hours) - Run nightly/weekly
- **P3 (Low)**: 4 tests (~2 hours) - Run on-demand
- **Total**: 49 tests, ~32 hours

**Test Infrastructure Requirements:**
1. Test Database with separate Supabase project or local PostgreSQL
2. Test Factories for user, goal, subtask, journal creation
3. RLS Testing utilities for multi-user scenarios
4. Performance Testing with Artillery or k6 for load tests

**Definition of Done for Epic 0 Testing:**
- All P0 tests passing (12/12)
- All P1 tests passing (15/15)
- >80% P2 tests passing (15/18)
- No high-priority risks (score ≥6) unmitigated
- RLS policies validated with multi-user penetration tests
- Database performance baseline documented (P50/P95/P99)

### Source Tree Components to Touch

**New Files to Create:**

**Mobile (`weave-mobile/`):**
- `jest.config.js` - Jest configuration with React Native preset
- `src/test-utils/mockData.ts` - Mock data generators for API responses
- `src/test-utils/testHelpers.ts` - Common test utilities (renderWithProviders, etc.)
- `src/components/__tests__/Button.test.tsx` - Sample component test
- `.coveragerc` or coverage config in `jest.config.js`

**Backend (`weave-api/`):**
- `pytest.ini` OR `pyproject.toml` - pytest configuration
- `tests/__init__.py` - Make tests a package
- `tests/conftest.py` - Shared fixtures and configuration
- `tests/factories.py` - Test data factory functions
- `tests/test_health.py` - Sample API endpoint test
- `tests/mocks/ai_mock.py` - AI service mocking utilities
- `.env.test` - Test environment variables (Supabase test project)

**Documentation:**
- `docs/dev/testing-guide.md` - Comprehensive testing documentation

**Modified Files:**
- `weave-mobile/package.json` - Add test scripts and dependencies
- `weave-api/pyproject.toml` - Add test dependencies
- `.gitignore` - Add coverage directories

### Testing Standards Summary

**Mobile Component Testing Patterns:**
```typescript
// Example: src/components/__tests__/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with text', () => {
    const { getByText } = render(<Button>Click Me</Button>);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('should call onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Click Me</Button>);
    fireEvent.press(getByText('Click Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

**Backend API Testing Patterns:**
```python
# Example: tests/test_health.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
```

**Test Data Factory Patterns:**
```python
# Example: tests/factories.py
from datetime import datetime
from app.models import Goal

def create_test_user(email="test@example.com", **kwargs):
    return {
        "id": "test-user-id",
        "email": email,
        "timezone": "America/New_York",
        **kwargs
    }

def create_test_goal(user_id="test-user-id", **kwargs):
    return Goal(
        id="test-goal-id",
        user_id=user_id,
        title="Test Goal",
        status="active",
        created_at=datetime.utcnow(),
        **kwargs
    )
```

**AI Mocking Strategy:**
```python
# Example: tests/mocks/ai_mock.py
class MockAIService:
    """Mock AI service for deterministic testing"""

    def generate_goal_breakdown(self, goal_text: str):
        return {
            "title": f"Breakdown for: {goal_text}",
            "milestones": ["Milestone 1", "Milestone 2"],
            "binds": ["Bind 1", "Bind 2", "Bind 3"]
        }

    def generate_triad(self, user_context: dict):
        return {
            "tasks": ["Task 1", "Task 2", "Task 3"],
            "rationale": "Test rationale"
        }
```

### References

**Architecture Documents:**
- [Implementation Patterns & Consistency Rules](../architecture/implementation-patterns-consistency-rules.md)
- [Core Architectural Decisions](../architecture/core-architectural-decisions.md)
- [Test Design: Epic 0 - Foundation](../test-design-epic-0.md)

**Epic & Story Context:**
- [Epics.md - Epic 0: Foundation](../epics.md#epic-0-foundation-40-pts)
- [Epics.md - Story 0.7: Test Infrastructure](../epics.md#story-07-test-infrastructure-3-pts)

**Related Stories:**
- Story 0.1: Project Scaffolding (DONE ✅) - Base project structure
- Story 0.2a: Database Schema Core (DONE ✅) - Database to test against
- Story 0.6: AI Service Abstraction (READY-FOR-DEV) - AI mocking target

**Sprint Context:**
- Sprint 1 depends on test infrastructure for TDD workflow
- RLS testing (Story 0.4) requires multi-user test setup from this story
- Performance testing (Story 0.2b) requires test database and fixtures

## Dev Agent Record

### Context Reference

**COMPREHENSIVE DEVELOPER CONTEXT:**

This story establishes the **foundation for all future testing** across the Weave MVP. Test infrastructure must support:
- 9 epics, 58 stories, 287 story points
- P0-P3 test scenarios totaling 49 tests and ~32 hours of coverage
- Security-critical RLS testing (Story 0.4)
- Performance baseline validation (Story 0.2b)
- AI-dependent feature testing across Epics 1-6

**Key Implementation Priorities:**
1. **Mobile Testing** - Jest + React Native Testing Library with TanStack Query patterns
2. **Backend Testing** - pytest with async FastAPI support and Supabase integration
3. **Test Database** - Separate environment to avoid corrupting development data
4. **AI Mocking** - Deterministic responses for OpenAI/Anthropic API calls
5. **Coverage Baseline** - 0% acceptable now, but infrastructure must support future coverage goals

**Critical Constraints:**
- Tests must be isolated (no shared state between tests)
- Database cleanup between tests (truncate, not drop/recreate)
- AI mocks must be deterministic (same input → same output)
- Coverage reports must be human-readable and track over time

**Sprint 1 Dependencies:**
- RLS testing requires multi-user fixtures from this story
- Performance tests require seed data from factories
- TDD workflow requires fast test execution (<2 min for P0 suite)

### Agent Model Used

Claude Sonnet 4.5 (global.anthropic.claude-sonnet-4-5-20250929-v1:0)

### Debug Log References

**Implementation Session: 2025-12-19**

**Issues Encountered & Resolved:**
1. **React 19 peer dependency conflict** - Resolved with --legacy-peer-deps flag
2. **jest-native deprecation** - Matchers now built into react-native-testing-library
3. **Reanimated mock errors** - Created custom mock instead of using packaged mock
4. **expo-haptics import errors** - Added mock in jest.setup.js
5. **WSL .venv corruption** - Used PowerShell to delete and recreate venv

### Completion Notes List

**Implementation Complete: 2025-12-19**

✅ **All 6 tasks completed:**
- Mobile testing: Jest configured, 4 test suites passing (33 tests)
- Backend testing: pytest configured, 38 tests passing with 76% coverage
- Test database: .env.test template created, cleanup utilities in conftest.py
- Test factories: Backend (factories.py) and Mobile (mockData.ts) created
- AI mocking: Mock providers created for OpenAI/Anthropic in tests/mocks/ai_mock.py
- Coverage: Both mobile and backend generating coverage reports

**Test Results:**
- Mobile: 4 test suites pass, 33 tests pass
- Backend: 38 tests pass, 76% code coverage
- Coverage reports generated successfully

**Key Achievements:**
- Established foundation for TDD workflow
- Both mobile and backend have working test infrastructure
- AI mocking strategy prevents API costs during testing
- Documentation complete in docs/dev/testing-guide.md

### File List

**Files Created:**
- `weave-mobile/jest.config.js` - Jest configuration with React Native preset
- `weave-mobile/jest.setup.js` - Jest setup with mocks for expo modules
- `weave-mobile/src/test-utils/mockData.ts` - Mock data generators
- `weave-mobile/src/design-system/components/Button/__tests__/Button.test.tsx` - Sample component test
- `weave-api/.env.test` - Test environment variables template
- `weave-api/tests/conftest.py` - Pytest fixtures and cleanup utilities
- `weave-api/tests/factories.py` - Test data factory functions
- `weave-api/tests/mocks/__init__.py` - Mocks module init
- `weave-api/tests/mocks/ai_mock.py` - AI provider mocks
- `docs/dev/testing-guide.md` - Comprehensive testing documentation

**Files Modified:**
- `weave-mobile/package.json` - Added test scripts (test, test:watch, test:coverage) and dependencies
- `weave-api/pyproject.toml` - Added pytest-asyncio to dev dependencies
- `.gitignore` - Added coverage directories (coverage/, htmlcov/, .coverage, *.lcov)

### Change Log

- 2025-12-19: Story created via BMAD create-story workflow
- 2025-12-19: Implementation complete - all 6 tasks and acceptance criteria satisfied
  - Mobile: Jest + RNTL configured, 4 test suites passing (33 tests)
  - Backend: pytest + pytest-asyncio configured, 38 tests passing (76% coverage)
  - Test database: .env.test template and cleanup utilities created
  - Factories: Mock data generators for both mobile and backend
  - AI mocking: Deterministic mocks for OpenAI/Anthropic
  - Documentation: Comprehensive testing guide created

---

**Story Status:** Complete ✅
**Epic:** Epic 0 - Foundation
**Story Points:** 3
**Created:** 2025-12-19 (YOLO mode via SM agent)
**Completed:** 2025-12-20
**Dependencies:** Story 0.1 (DONE ✅), Story 0.2a (DONE ✅)
**Blocks:** Story 0.4 (RLS testing), Story 0.2b (performance testing), Sprint 1 TDD workflow
