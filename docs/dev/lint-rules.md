# Weave Mobile - ESLint Configuration Rules

## Configuration Consistency Rules (Story 0.9)

### Rule: Enforce Centralized API Configuration

**Why This Matters**: Prevents configuration drift where different services use inconsistent API base URLs, leading to network errors that are difficult to debug.

### ❌ What NOT to Do

```typescript
// ❌ WRONG - Hardcoded with process.env fallback
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ❌ WRONG - Direct process.env access
const url = process.env.EXPO_PUBLIC_API_URL;
```

### ✅ What TO Do

```typescript
// ✅ CORRECT - Use centralized configuration
import { getApiBaseUrl } from '@/utils/api';
const API_BASE_URL = getApiBaseUrl();
```

### Lint Rule Configuration

**File**: `eslint.config.mjs`

```javascript
'no-restricted-syntax': [
  'error',
  {
    selector:
      'MemberExpression[object.object.name="process"][object.property.name="env"][property.name=/^EXPO_PUBLIC_API/]',
    message:
      '❌ Do not use process.env.EXPO_PUBLIC_API_* for API URLs. Use getApiBaseUrl() from @/utils/api instead. This ensures consistent configuration across all services.',
  },
  {
    selector:
      'VariableDeclarator[id.name="API_BASE_URL"][init.type="LogicalExpression"][init.left.object.object.name="process"]',
    message:
      '❌ Do not hardcode API_BASE_URL with process.env fallback. Use: const API_BASE_URL = getApiBaseUrl();',
  },
],
```

### Testing the Rule

```bash
# Run linter
npm run lint

# Expected output for violations:
# ❌ Do not use process.env.EXPO_PUBLIC_API_* for API URLs
# ❌ Do not hardcode API_BASE_URL with process.env fallback
```

### Historical Context

**Bug Discovered**: 2025-12-21 (Story 0.9 implementation)

**Symptoms**:
- Captures endpoints returned "Network request failed"
- Analytics/goals endpoints worked fine
- No server logs for captures requests

**Root Cause**:
- `imageCapture.ts` used: `process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000'`
- Other services used: `getApiBaseUrl()` → `http://192.168.1.194:8003`
- Result: Captures tried to reach localhost (unreachable from mobile device)

**Files Fixed**:
- ✅ `services/imageCapture.ts`
- ✅ `services/debug-auth.ts`
- ✅ `services/onboarding.ts`

### Benefits

✅ **Consistency**: All services use the same configuration source
✅ **Maintainability**: Change port/URL in ONE place
✅ **CI/CD Safety**: Lint catches violations before merge
✅ **New Developer Safety**: Clear error messages guide correct usage

### Adding More Configuration Rules

If you need to enforce other centralized configs, follow this pattern:

```javascript
{
  selector: 'MemberExpression[object.object.name="process"][object.property.name="env"][property.name="YOUR_ENV_VAR"]',
  message: '❌ Use getCentralizedConfig() instead of process.env.YOUR_ENV_VAR'
}
```

---

**Last Updated**: 2025-12-21
**Related Issue**: Story 0.9 - Image capture network failures
**Lint Rule Added**: ESLint 9 flat config with AST selectors
