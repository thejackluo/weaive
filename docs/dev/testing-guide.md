# Testing Guide - Weave MVP

Comprehensive guide for writing and running tests in the Weave project.

## Quick Start

### Mobile Testing (weave-mobile/)

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Backend Testing (weave-api/)

```bash
# Run all tests
uv run pytest

# Verbose output with test names
uv run pytest -v

# Generate coverage report
uv run pytest --cov

# Run specific test file
uv run pytest tests/test_health.py -v

# Run tests matching pattern
uv run pytest -k "test_health" -v
```

## Mobile Testing Framework

**Stack:** Jest + React Native Testing Library

### Test Structure

Tests are co-located with components:
```
src/
  design-system/
    components/
      Button/
        Button.tsx
        __tests__/
          Button.test.tsx
```

### Writing Component Tests

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(<MyComponent title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('should handle user interaction', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<MyComponent onPress={onPress} />);

    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Mock Data Generators

Use `src/test-utils/mockData.ts` for generating mock API responses:

```typescript
import { generateMockGoal, generateMockGoals } from '@/test-utils/mockData';

const mockGoal = generateMockGoal({ title: 'Custom title' });
const mockGoals = generateMockGoals(5); // Generate 5 mock goals
```

## Backend Testing Framework

**Stack:** pytest + pytest-asyncio + httpx

### Test Structure

Tests in dedicated `tests/` directory:
```
tests/
  __init__.py
  conftest.py        # Shared fixtures
  factories.py       # Test data factories
  test_health.py     # Health endpoint tests
  test_goals.py      # Goals API tests
  mocks/
    __init__.py
    ai_mock.py       # AI mocking utilities
```

### Writing API Tests

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    """Test health endpoint returns 200 OK."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

### Test Data Factories

Use `tests/factories.py` for creating test fixtures:

```python
from tests.factories import create_test_user, create_test_goal

user = create_test_user(email="custom@example.com")
goal = create_test_goal(user_id=user["id"], title="Custom Goal")
```

## Test Database Setup

### Option 1: Separate Supabase Test Project (Recommended)

1. **Create test project:**
   - Go to https://supabase.com/dashboard
   - Create new project: "weave-test"
   - Save credentials to `.env.test`

2. **Configure test environment:**
   ```bash
   cp .env.test.example .env.test
   # Edit .env.test with test project credentials
   ```

3. **Run migrations:**
   ```bash
   # Set TEST_MODE=true in .env.test
   npx supabase db push --db-url "postgresql://..."
   ```

### Option 2: Local PostgreSQL (Development)

```bash
# Install PostgreSQL locally
brew install postgresql  # macOS
sudo apt install postgresql  # Linux

# Create test database
createdb weave_test

# Update .env.test with local connection string
DATABASE_URL=postgresql://localhost:5432/weave_test
```

### Database Cleanup Between Tests

Use `tests/conftest.py::cleanup_test_data()` to truncate tables between tests:

```python
from tests.conftest import cleanup_test_data

def test_example():
    # Your test code
    cleanup_test_data()  # Clean up after test
```

## AI Mocking Strategy

### Mock AI Providers

Use `tests/mocks/ai_mock.py` for deterministic AI responses:

```python
from tests.mocks.ai_mock import MockOpenAIProvider, MockAIService

# Mock specific provider
mock_provider = MockOpenAIProvider(response_override="Custom response")
response = mock_provider.complete("Test prompt")

# Mock entire AI service
mock_service = MockAIService()
triad = mock_service.generate_triad({"goals": ["Test goal"]})
```

### Patching Real AI Calls

```python
from unittest.mock import patch, Mock

@patch('app.services.ai.OpenAIProvider.complete')
def test_with_mocked_ai(mock_complete):
    mock_complete.return_value = {
        "content": "Mock response",
        "cost_usd": 0.0,
    }

    # Your test code here
    # AI calls will use the mock
```

## Coverage Reporting

### Mobile Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
start coverage/lcov-report/index.html  # Windows
```

### Backend Coverage

```bash
# Generate coverage report
uv run pytest --cov

# HTML coverage report
uv run pytest --cov --cov-report=html
open htmlcov/index.html  # View in browser
```

### Coverage Thresholds

**Story 0.7 Baseline:** 0% coverage acceptable (infrastructure setup)

**Future Targets:**
- P0 tests: 100% coverage required
- P1 tests: 90% coverage target
- P2 tests: 80% coverage target
- Overall: Incremental improvement with each story

## Testing Best Practices

### 1. Test Isolation

- Each test should be independent
- Don't rely on test execution order
- Clean up test data after each test
- Mock external dependencies (API calls, database)

### 2. Test Organization

```typescript
// Mobile: Group related tests
describe('Component Name', () => {
  describe('rendering', () => {
    it('should render with default props', () => {});
    it('should render with custom props', () => {});
  });

  describe('interactions', () => {
    it('should handle press events', () => {});
  });
});
```

```python
# Backend: Use descriptive test names
def test_health_endpoint_returns_200():
    """Test health endpoint returns 200 OK."""
    pass

def test_health_endpoint_with_invalid_token_returns_401():
    """Test health endpoint rejects invalid tokens."""
    pass
```

### 3. Testing Async Code

```python
import pytest

@pytest.mark.asyncio
async def test_async_endpoint():
    """Test async FastAPI endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/goals")
        assert response.status_code == 200
```

### 4. Data Integrity Testing

**Critical:** Test immutable tables (append-only event logs):

```python
def test_subtask_completions_immutable():
    """Test that completions cannot be updated or deleted."""
    # Try to update completion - should fail
    # Try to delete completion - should fail
    pass
```

## Known Issues & Workarounds

### Mobile Testing Issues

1. **Metro cache conflicts:**
   ```bash
   npm run start:clean  # Clear Metro cache
   ```

2. **Module resolution errors:**
   - Check `jest.config.js` moduleNameMapper
   - Verify path aliases match `babel.config.js`

3. **Reanimated errors:**
   - Already mocked in `jest.setup.js`
   - If issues persist, check react-native-reanimated version

### Backend Testing Issues

1. **Virtual environment corruption (WSL):**
   ```bash
   # Use PowerShell to delete .venv
   powershell.exe -Command "Remove-Item '.venv' -Recurse -Force"

   # Recreate with uv
   uv venv && uv sync
   ```

2. **Pytest not finding tests:**
   - Verify test files match `test_*.py` pattern
   - Check `pyproject.toml` testpaths configuration

3. **Import errors:**
   - Ensure you're running tests via `uv run pytest`
   - Check that all dependencies are in `pyproject.toml`

## References

- **Mobile Testing:** [React Native Testing Library Docs](https://callstack.github.io/react-native-testing-library/)
- **Backend Testing:** [pytest Documentation](https://docs.pytest.org/)
- **Test Design:** [docs/test-design-epic-0.md](../test-design-epic-0.md)
- **Architecture Patterns:** [docs/architecture/implementation-patterns-consistency-rules.md](../architecture/implementation-patterns-consistency-rules.md)

## Next Steps

After Story 0.7 infrastructure is complete:

1. **Story 0.4:** Write RLS policy tests (multi-user scenarios)
2. **Story 0.2b:** Add performance tests (database query benchmarks)
3. **Sprint 1:** Use TDD workflow (write tests first, then implementation)
4. **Ongoing:** Increase coverage incrementally with each story
