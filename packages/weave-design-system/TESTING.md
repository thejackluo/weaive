# Testing Guide for @weave/design-system

## Overview

The Weave Design System uses Jest and React Native Testing Library for comprehensive test coverage. All tests are required to maintain a minimum of 75% coverage across branches, functions, lines, and statements.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run type checking
npm run typecheck
```

## Test Structure

Tests are organized using the `__tests__` directory pattern, colocated with the source files they test:

```
src/
├── tokens/
│   ├── index.ts
│   └── __tests__/
│       └── tokens.test.ts
├── theme/
│   ├── index.ts
│   └── __tests__/
│       └── theme.test.tsx
└── animations/
    ├── index.ts
    └── __tests__/
        └── animations.test.ts
```

## Test Coverage Requirements

- **Minimum Coverage:** 75% for all metrics
  - Branches: 75%
  - Functions: 75%
  - Lines: 75%
  - Statements: 75%

## Story DS-1: Foundation Tests

### Token Tests (`src/tokens/__tests__/tokens.test.ts`)

Tests all 220+ design tokens:

- **Color Tokens (60+)**: Primary, accent colors (amber, violet), semantic colors, grayscale
- **Typography Tokens (45+)**: Font families, sizes, weights, line heights
- **Spacing Tokens (25+)**: Consistent 4px-based spacing scale
- **Border Tokens (20+)**: Border widths and radii
- **Shadow Tokens (35+)**: Progressive shadow effects with elevation
- **Animation Tokens (35+)**: Durations, easings, spring physics presets

### Theme Tests (`src/theme/__tests__/theme.test.tsx`)

Tests the theme system including:

- **ThemeProvider**: Dark/light theme initialization, custom themes
- **useTheme Hook**: Theme access, error handling, value provision
- **Theme Switching**: Runtime dark ↔ light switching with proper color updates
- **createTheme**: Custom theme creation with overrides and base value preservation
- **Theme Structure**: Validation of dark/light theme structure, semantic colors
- **Color Completeness**: All text, background, border, and accent colors

### Animation Tests (`src/animations/__tests__/animations.test.ts`)

Tests the animation system including:

- **Spring Presets**: gentle, snappy, bouncy, smooth configurations
- **Timing Presets**: fast, base, slow durations
- **Animation Functions**: `spring()` and `timing()` with correct preset application
- **Reduced Motion**: Accessibility support with `getAccessibleSpringConfig()` and `getAccessibleTimingConfig()`
- **Press Animations**: PRESS_SCALE constant and createPressAnimation helper
- **Physics Values**: Spring damping/stiffness validation, progressive timing durations

## Mocked Dependencies

### react-native-reanimated

The test setup mocks `react-native-reanimated` to avoid native module dependencies:

```javascript
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.withSpring = jest.fn((toValue, config) => toValue);
  Reanimated.withTiming = jest.fn((toValue, config) => toValue);
  return Reanimated;
});
```

### React Native Core

Native animated modules are mocked to prevent test failures:

```javascript
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
```

## Writing New Tests

### Component Tests

```tsx
import { render } from '@testing-library/react-native';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Hello')).toBeDefined();
  });
});
```

### Hook Tests

```tsx
import { renderHook, act } from '@testing-library/react-native';
import { useMyHook } from '../useMyHook';

describe('useMyHook', () => {
  it('should return correct value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(expected);
  });
});
```

### Theme-Dependent Components

```tsx
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@weave/design-system';
import { MyThemedComponent } from '../MyThemedComponent';

describe('MyThemedComponent', () => {
  it('should render with theme', () => {
    const { getByText } = render(
      <ThemeProvider>
        <MyThemedComponent />
      </ThemeProvider>
    );
    expect(getByText('Content')).toBeDefined();
  });
});
```

## Coverage Reports

After running `npm run test:coverage`, view the detailed HTML report:

```bash
open coverage/lcov-report/index.html
```

## CI/CD Integration

Tests run automatically on:
- Every commit (via git hooks)
- Pull requests (blocking merge if tests fail)
- Pre-publish (before npm package release)

## Troubleshooting

### Error: Cannot find module 'react-native-reanimated'

**Solution:** Ensure jest.setup.js properly mocks the module. Check that the mock is loaded before any test imports.

### Error: useTheme must be used within ThemeProvider

**Solution:** Wrap your test component in ThemeProvider:

```tsx
const wrapper = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

renderHook(() => useTheme(), { wrapper });
```

### Coverage Threshold Not Met

**Solution:** Add more test cases to cover untested branches/lines. Use coverage report to identify gaps:

```bash
npm run test:coverage
# Check coverage/lcov-report/index.html for uncovered lines
```

## Best Practices

1. **Test Behavior, Not Implementation**: Test what the component does, not how it does it
2. **Use Descriptive Test Names**: "should render button with correct text" vs "test 1"
3. **Follow AAA Pattern**: Arrange, Act, Assert
4. **Mock External Dependencies**: Mock API calls, native modules, timers
5. **Test Edge Cases**: Empty states, error states, loading states
6. **Keep Tests Fast**: Avoid unnecessary delays, use fake timers when needed
7. **Maintain Coverage**: Don't let coverage drop below 75%

## Related Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing React Hooks](https://react-hooks-testing-library.com/)
- [Design System Guide](/docs/dev/design-system-guide.md)

---

**Story DS-1 Testing Status:** ✅ Complete

- Theme tests: 19 test cases
- Animation tests: 22 test cases
- Token tests: 26 test cases
- **Total:** 67 test cases covering all foundation features
