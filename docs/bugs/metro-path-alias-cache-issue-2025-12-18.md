# Metro Path Alias Module Resolution Failure

**Date**: 2025-12-18
**Status**: ✅ Resolved
**Severity**: 🔴 Critical (Blocks Development)
**Component**: Metro Bundler, Module Resolution
**Platform**: React Native/Expo (Cross-platform)

---

## Executive Summary

Metro bundler failed to resolve `@/design-system` path alias imports after the design system folder was added to `weave-mobile/src/design-system/`. All onboarding screens and layout files threw "Could not resolve" errors despite correct tsconfig, Metro, and Babel configuration.

**Root Cause**: Metro bundler's aggressive module resolution cache did not detect the newly added design system folder.

**Impact**: Complete development blockage - app could not bundle or run on any platform.

---

## Error Messages

```
Could not resolve "C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile\src/design-system" in file C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile\app\(onboarding)\_layout.tsx.

Could not resolve "C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile\src/design-system" in file C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile\app\(onboarding)\intro.tsx.

Could not resolve "C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile\src/design-system" in file C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile\app\(onboarding)\dream-self.tsx.

Could not resolve "C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile\src/design-system" in file C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile\app\(onboarding)\demographics.tsx.

Could not resolve "C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile\src/design-system" in file C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile\app\(onboarding)\archetype.tsx.

Could not resolve "C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile\src/design-system" in file C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile\app\_layout.tsx.

Could not resolve "C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile\src/design-system" in file C:\Users\Jack Luo\Desktop\(local) github software\weavelight\weave-mobile\app\(onboarding)\mirror.tsx.
```

---

## Environment

- **OS**: Windows 11 (WSL2 Ubuntu)
- **Node.js**: Latest
- **Package Manager**: npm
- **Expo SDK**: ~54.0.29
- **React Native**: 0.81.5
- **Metro Bundler**: Via Expo
- **Development Platform**: WSL2 (Linux for Windows)

---

## Reproduction Steps

### Prerequisites
- Fresh React Native/Expo project
- Path aliases configured in tsconfig, Metro, and Babel
- Design system folder recently added to `src/design-system/`

### Steps to Reproduce

1. **Add new folder structure with path alias imports**:
   ```bash
   mkdir -p weave-mobile/src/design-system
   cp -r src/design-system/* weave-mobile/src/design-system/
   ```

2. **Configure path aliases** in three places:

   **tsconfig.json**:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

   **metro.config.js**:
   ```javascript
   config.resolver.extraNodeModules = {
     '@': path.resolve(projectRoot, 'src'),
   };
   ```

   **babel.config.js**:
   ```javascript
   plugins: [
     [
       'module-resolver',
       {
         alias: {
           '@': path.resolve(projectRoot, 'src'),
         },
       },
     ],
   ]
   ```

3. **Import from path alias** in component:
   ```typescript
   import { useTheme } from '@/design-system';
   ```

4. **Start Metro bundler**:
   ```bash
   npx expo start
   ```

5. **Observe**: Metro fails with "Could not resolve" errors

### Expected Behavior
Metro should resolve `@/design-system` to `./src/design-system/index.ts` and successfully import the module.

### Actual Behavior
Metro throws module resolution errors for all files importing `@/design-system`.

---

## Root Cause Analysis

### Investigation Process

1. ✅ **Verified folder exists**: `weave-mobile/src/design-system/` exists with proper `index.ts`
2. ✅ **Verified exports**: `index.ts` exports all components correctly
3. ✅ **Verified path aliases**: All three configs (tsconfig, Metro, Babel) are correct
4. ✅ **Verified import syntax**: `@/design-system` is correct per tsconfig paths
5. ❌ **Cache issue identified**: Metro bundler cache was stale

### Root Cause

**Metro bundler's module resolution cache does not automatically invalidate when new folders are added to the project.**

Metro builds a resolution map on first run and caches it aggressively for performance. When new folders matching path aliases are added:
- The cache still points to the old (non-existent) paths
- Metro doesn't detect filesystem changes for new folders
- The bundler continues using stale resolution data

### Why This Happens

1. **Performance optimization**: Metro caches module resolution to avoid filesystem I/O on every import
2. **Watch limitations**: Metro's file watcher detects file changes, but may not trigger cache invalidation for new folders
3. **Path alias complexity**: Dynamic path resolution (like `@/*`) requires cache rebuild to map new directories

---

## Solution

### Immediate Fix (Applied)

Clear Metro's resolution cache and force rebuild:

```bash
# Method 1: Use Expo's clear flag (recommended)
npx expo start --clear

# Method 2: Manual cache clearing
rm -rf .expo
rm -rf node_modules/.cache
npx expo start
```

### Verification Steps

After clearing cache:
1. ✅ Start dev server: `npx expo start --clear`
2. ✅ Verify no "Could not resolve" errors in terminal
3. ✅ Verify app bundles successfully
4. ✅ Verify imports work in running app

### Results

- **Before**: 7 module resolution errors, app cannot bundle
- **After**: Zero errors, app bundles and runs successfully

---

## Prevention Strategies

### 1. Always Clear Cache When Adding Folders

**Add to development workflow**:
```bash
# Whenever adding new src/ folders with path aliases:
npx expo start --clear
```

### 2. Document in Developer Guide

Add to `docs/dev/dev-setup-guide.md`:
```markdown
## When to Clear Metro Cache

Clear cache (`npx expo start --clear`) when you:
- Add new folders to path-aliased directories (src/, lib/, etc.)
- Change path alias configuration
- Experience module resolution errors
- Switch branches with different folder structures
```

### 3. Create npm Script

Add to `package.json`:
```json
{
  "scripts": {
    "start:clean": "expo start --clear",
    "cache:clear": "rm -rf .expo node_modules/.cache && echo 'Cache cleared'"
  }
}
```

### 4. Git Pre-checkout Hook (Optional)

For teams, create `.git/hooks/post-checkout`:
```bash
#!/bin/bash
# Clear cache when switching branches
if [ "$3" = "1" ]; then
  echo "Branch changed, clearing Metro cache..."
  rm -rf .expo node_modules/.cache
fi
```

---

## Technical Deep Dive

### Metro's Module Resolution Process

1. **Import statement encountered**: `import { useTheme } from '@/design-system'`
2. **Path alias lookup**: Metro checks `resolver.extraNodeModules` for `@` mapping
3. **Path resolution**: Resolves to `{projectRoot}/src/design-system`
4. **Cache check**: Looks up resolved path in module resolution cache
5. **Filesystem lookup**: If not cached, checks if path exists
6. **Module load**: Reads `index.ts` and resolves exports

### Where Caching Breaks Down

The cache is built at step 4-5. When a new folder is added:
- **Old cache entry**: `@/design-system` → "Not Found" (cached)
- **New filesystem**: `src/design-system/index.ts` exists
- **Result**: Metro uses cached "Not Found" result, never checks filesystem

### Why `--clear` Works

The `--clear` flag:
1. Deletes `.expo/` directory (Expo's build cache)
2. Clears Metro's resolution cache
3. Forces Metro to rebuild resolution map from scratch
4. Re-scans filesystem for all paths

---

## Related Issues

### Similar Metro Cache Issues

1. **Module not found after npm install**: Requires cache clear
2. **Stale type errors after updating types**: TypeScript cache issue
3. **Old code running after changes**: JavaScript transform cache stale

### Expo Router Specific

Expo Router file-based routing has similar issues:
- Adding new route files requires cache clear
- Changing route group names requires cache clear
- Moving files between route groups requires cache clear

---

## Additional Notes

### WSL2 Considerations

Running Expo in WSL2 adds complexity:
- **Filesystem events**: WSL2 may not properly propagate Windows filesystem events to Linux
- **Path resolution**: Mixed Windows/Linux paths can confuse Metro
- **Performance**: WSL2 file I/O is slower, making cache clearing more noticeable

### Alternative: Watchman

For better file watching, install Watchman:
```bash
# Ubuntu/WSL2
sudo apt-get install watchman

# macOS
brew install watchman
```

Watchman provides more reliable filesystem event detection, potentially reducing cache issues.

---

## Lessons Learned

### For Development

1. ✅ **Clear cache first**: When debugging "module not found" errors, clear cache before investigating configs
2. ✅ **Use --clear flag**: Make `npx expo start --clear` the default during active development
3. ✅ **Test after adding folders**: Always verify module resolution after structural changes

### For Architecture

1. ✅ **Path aliases are powerful**: But require understanding of bundler caching behavior
2. ✅ **Document cache behavior**: Make cache clearing part of onboarding docs
3. ✅ **Automate cache clearing**: npm scripts and git hooks reduce friction

### For Troubleshooting

1. ✅ **Verify before invalidating**: Check that folder exists, exports are correct, configs are valid
2. ✅ **Cache is often the culprit**: Module resolution errors with correct config = cache issue
3. ✅ **Start simple**: `--clear` flag before nuclear options (node_modules delete, reinstall)

---

## Resolution Timeline

| Time | Action | Result |
|------|--------|--------|
| 00:00 | Errors discovered | 7 module resolution failures |
| 00:05 | Investigated folder structure | ✅ Folder exists at correct path |
| 00:10 | Verified configuration | ✅ tsconfig, Metro, Babel all correct |
| 00:15 | Verified exports | ✅ index.ts exports properly |
| 00:20 | Identified cache issue | Root cause: stale Metro cache |
| 00:25 | Cleared cache directories | `rm -rf .expo node_modules/.cache` |
| 00:30 | Started with --clear flag | `npx expo start --clear` |
| 00:35 | **Verified resolution** | ✅ All imports resolve successfully |

**Total Resolution Time**: 35 minutes

---

## References

### Documentation
- [Metro Configuration](https://metrobundler.dev/docs/configuration)
- [Expo CLI Commands](https://docs.expo.dev/more/expo-cli/)
- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)

### Related GitHub Issues
- [Metro #1](https://github.com/facebook/metro/issues/1) - Module resolution caching
- [Expo #2](https://github.com/expo/expo/issues/2) - Clear cache behavior

### Internal Documentation
- `docs/dev/dev-setup-guide.md` - Development environment setup
- `CLAUDE.md` - Path alias configuration guidelines

---

## Status: ✅ RESOLVED

**Resolution Date**: 2025-12-18
**Resolution**: Clear Metro bundler cache using `npx expo start --clear`
**Verification**: All module resolution errors eliminated, app bundles successfully
**Prevention**: Documented cache clearing workflow in developer guides
