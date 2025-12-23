# Design System Consolidation Plan

## Problem Statement

Two design systems currently exist in the codebase:

1. **Active Design System:** `weave-mobile/src/design-system/`
   - Detailed component structure with theme hooks
   - Production-ready components (Button, Card, Input, Text, etc.)
   - Theme provider with context and custom hooks
   - Token system (colors, typography, spacing, animations)

2. **Archive Design System:** `src/design-system/` (root level)
   - Earlier version with simpler structure
   - Reference implementation
   - Should not be used in new code

This duplication causes:
- ❌ Confusion for developers (which to import?)
- ❌ Inconsistent component usage
- ❌ Unclear test strategy
- ❌ Import path ambiguity

## Current Import Aliases

**jest.config.js:**
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
  '^@/design-system$': '<rootDir>/src/design-system/index.ts',
  '^@/design-system/(.*)$': '<rootDir>/src/design-system/$1',
}
```

**All imports resolve to:** `weave-mobile/src/design-system/` ✅

## Proposed Solution

### Option 1: Archive Root Design System (RECOMMENDED)

**Action:**
1. Move `src/design-system/` to `docs/sprint-artifacts/design-system-old/` ✅ (already exists)
2. Update documentation to clarify the active design system location
3. Verify no active imports from root `src/design-system/`
4. Remove root `src/design-system/` directory

**Pros:**
- Clean separation (one active system)
- Clear path forward for new code
- Archive preserved for reference

**Cons:**
- Requires verification that no code imports from root

### Option 2: Sync and Merge

**Action:**
1. Compare both design systems
2. Port any missing features from root to mobile
3. Delete root design system
4. Update all imports

**Pros:**
- No features lost

**Cons:**
- Time-consuming
- Risk of breaking changes
- Unlikely root has unique features

### Option 3: Keep as Reference (NOT RECOMMENDED)

**Action:**
1. Add README to root design system marking it as archive
2. Keep both systems

**Pros:**
- No immediate work required

**Cons:**
- Confusion persists
- Risk of incorrect imports

## Decision: Option 1 (Archive Root Design System)

## Implementation Steps

### 1. Verify Active Design System Location

**Confirm:** All active code imports from `weave-mobile/src/design-system/`

**Check:**
```bash
# Search for imports from root design system
grep -r "from '@/design-system'" weave-mobile/src/ weave-mobile/app/
grep -r "from '../../../src/design-system'" weave-mobile/src/ weave-mobile/app/
```

**Expected:** All imports use `@/design-system` alias, which resolves to `weave-mobile/src/design-system/`

### 2. Archive Root Design System

**Action:**
```bash
# Verify archive location exists
ls docs/sprint-artifacts/design-system-old/

# If not, move root design system there
# mv src/design-system docs/sprint-artifacts/design-system-old/
```

**Status:** ✅ Already archived at `docs/sprint-artifacts/design-system-old/`

### 3. Add Archive Notice

Create `docs/sprint-artifacts/design-system-old/README.md`:

```markdown
# Design System Archive (Reference Only)

⚠️ **ARCHIVED:** This design system is for reference only.

**Active Design System:** `weave-mobile/src/design-system/`

This archive represents an earlier iteration. All new development should use the active design system in `weave-mobile/src/design-system/`.

**Import Pattern:**
```typescript
// ✅ CORRECT
import { Button, Card, Text } from '@/design-system';

// ❌ INCORRECT (old path)
import { Button } from '../../../src/design-system';
```

**Last Active:** December 2025
**Superseded By:** `weave-mobile/src/design-system/`
```

### 4. Update CLAUDE.md

Add section to CLAUDE.md clarifying design system location:

```markdown
### Design System Location

**Active Design System:** `weave-mobile/src/design-system/`
**Archive:** `docs/sprint-artifacts/design-system-old/` (reference only)

**Import Pattern:**
```typescript
// ✅ Always import from @/design-system
import { Button, Card, Text } from '@/design-system';
import { useColors, useTypography } from '@/design-system/theme';
```

**DO NOT:**
- Import from root `src/design-system/` (archived)
- Import from relative paths (use alias)
```

### 5. Remove Root Design System (Final Step)

**Only after confirming:**
1. No active imports from root `src/design-system/`
2. Archive created with README
3. CLAUDE.md updated
4. All tests passing

**Action:**
```bash
rm -rf src/design-system/
```

## Testing After Consolidation

After consolidation, verify:

1. **Import Resolution:**
   ```bash
   npm run lint  # Should pass with no import errors
   ```

2. **Test Suite:**
   ```bash
   npm test  # All design system tests should pass
   ```

3. **App Startup:**
   ```bash
   npm start  # App should start without import errors
   ```

4. **Build:**
   ```bash
   eas build --platform ios --profile preview  # Should build successfully
   ```

## Current Status

- ✅ Archive exists at `docs/sprint-artifacts/design-system-old/`
- ✅ Import aliases configured in jest.config.js
- ⬜ Archive README not created yet
- ⬜ CLAUDE.md not updated with design system location
- ⬜ Root `src/design-system/` still exists
- ⬜ Import verification not completed

## Next Steps

1. ⬜ Create archive README explaining old design system
2. ⬜ Update CLAUDE.md with design system location section
3. ⬜ Run import verification (grep search)
4. ⬜ If no active imports found, remove root `src/design-system/`
5. ⬜ Run full test suite to verify
6. ⬜ Update test coverage audit document

## Timeline

- **Step 1-2:** Immediate (10 minutes)
- **Step 3:** Before next merge (30 minutes)
- **Step 4-5:** Next sprint (1 hour)

## References

- **Test Coverage Audit:** `docs/testing/test-coverage-audit-2025-12-23.md`
- **Design System Guide:** `docs/dev/design-system-guide.md`
- **CLAUDE.md:** Project-level conventions
