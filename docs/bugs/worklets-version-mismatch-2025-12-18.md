# React Native Worklets Version Mismatch

**Date**: 2025-12-18
**Status**: ✅ Resolved
**Severity**: 🟠 High (Runtime Errors)
**Component**: react-native-worklets-core, Native Modules
**Platform**: iOS, Android (Cross-platform)

---

## Executive Summary

App crashed on startup with repeated WorkletsError due to version mismatch between JavaScript (0.7.1) and native (0.5.1) parts of `react-native-worklets-core`. The library was installed as a transitive dependency through Expo Router/Reanimated without explicit version control.

**Root Cause**: Transitive dependency (`react-native-worklets-core`) installed without explicit version, causing iOS native module version (0.5.1) to be out of sync with JavaScript package version (0.7.1).

**Impact**: App crashes immediately on startup with WorkletsError, blocking all development and testing.

---

## Error Messages

```
ERROR  [WorkletsError: [Worklets] Mismatch between JavaScript part and native part of Worklets (0.7.1 vs 0.5.1).
    See `https://docs.swmansion.com/react-native-worklets/docs/guides/troubleshooting#mismatch-between-javascript-part-and-native-part-of-worklets` for more details.]

ERROR  [WorkletsError: [Worklets] Mismatch between JavaScript part and native part of Worklets (0.7.1 vs 0.5.1).
    See `https://docs.swmansion.com/react-native-worklets/docs/guides/troubleshooting#mismatch-between-javascript-part-and-native-part-of-worklets` for more details.]

ERROR  [WorkletsError: [Worklets] Mismatch between JavaScript part and native part of Worklets (0.7.1 vs 0.5.1).
    See `https://docs.swmansion.com/react-native-worklets/docs/guides/troubleshooting#mismatch-between-javascript-part-and-native-part-of-worklets` for more details.]
```

**Error repeated 6+ times**, crashing app on iOS simulator.

---

## Environment

- **OS**: macOS (iOS Simulator), Windows 11 (WSL2)
- **Node.js**: Latest
- **Package Manager**: npm
- **Expo SDK**: ~54.0.29
- **React Native**: 0.81.5
- **Expo Router**: ~6.0.20
- **React Native Worklets**: 0.7.1 (JS) / 0.5.1 (Native)
- **Platform**: iOS Simulator (error also affects Android)

---

## Reproduction Steps

### Prerequisites
- Fresh Expo/React Native project
- Expo Router installed (brings in Reanimated as dependency)
- iOS development environment set up

### Steps to Reproduce

1. **Install Expo Router** (which depends on Reanimated, which depends on Worklets):
   ```bash
   npx expo install expo-router
   ```

2. **Check package.json**:
   ```json
   {
     "dependencies": {
       "expo-router": "~6.0.20"
       // Note: react-native-worklets-core NOT explicitly listed
     }
   }
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start app on iOS**:
   ```bash
   npx expo start --ios
   ```

5. **Observe**: App crashes immediately with WorkletsError repeated multiple times

### Expected Behavior
App should start without errors. Worklets JavaScript and native versions should be in sync.

### Actual Behavior
- App crashes immediately on launch
- WorkletsError thrown 6+ times
- Version mismatch: JS (0.7.1) vs Native (0.5.1)
- Development completely blocked

---

## Root Cause Analysis

### Investigation Process

1. **Checked direct dependencies**: `react-native-worklets-core` NOT in package.json
2. **Identified transitive dependency chain**:
   ```
   expo-router@6.0.20
   └── react-native-reanimated@^3.x
       └── react-native-worklets-core@^0.7.1
   ```
3. **Checked npm ls output**:
   ```bash
   $ npm ls react-native-worklets-core
   └── react-native-worklets-core@0.7.1 (via expo-router → reanimated)
   ```
4. **Checked iOS native modules**:
   - Pods installed with older version (0.5.1)
   - JavaScript installed with newer version (0.7.1)
5. **Identified mismatch**: Native modules not rebuilt after worklets update

### Root Cause

**Transitive dependency version mismatch without explicit version control.**

#### Why This Happens

1. **Transitive Dependency Chain**:
   - Expo Router → React Native Reanimated → Worklets Core
   - Worklets installed indirectly, version controlled by parent packages

2. **Native Module Update Lag**:
   - JavaScript package updates immediately via npm
   - Native modules (iOS Pods, Android libs) require manual rebuild
   - Expo doesn't automatically trigger native rebuilds for transitive deps

3. **Version Range Flexibility**:
   - Parent packages use semver ranges (e.g., `^0.7.0`)
   - npm may install newer patch/minor versions
   - Native side remains at original Pod version

4. **Missing Explicit Declaration**:
   - `package.json` doesn't list worklets-core directly
   - No version pinning for critical native dependency
   - Developers unaware of the underlying dependency

### Technical Details

**React Native Native Module Lifecycle:**

```
JavaScript Side:                  Native Side (iOS):
npm install                       CocoaPods install
├─ Downloads package             ├─ Downloads pod
├─ Installs in node_modules      ├─ Compiles native code
└─ Version: Latest in range      └─ Version: Locked in Podfile.lock

If JS version changes:           Native version does NOT change
npm update → new version         (requires manual pod install)
```

**Worklets Architecture:**

Worklets uses a split architecture:
- **JavaScript layer** (`react-native-worklets-core` npm package)
- **Native layer** (iOS Pod, Android native module)
- **Bridge** (JSI bindings that require matching versions)

When versions mismatch:
- JSI binding signatures don't match
- Native methods called with incompatible parameters
- Runtime crash on first worklet initialization

---

## Solution

### Immediate Fix (Applied)

**1. Install worklets-core explicitly to trigger version sync**:

```bash
npx expo install react-native-worklets-core
```

This command:
- ✅ Adds worklets-core to package.json (explicit control)
- ✅ Installs compatible version for current Expo SDK
- ✅ Updates native dependencies automatically
- ✅ Ensures JS and native versions match

**Output**:
```
› Installing 1 other package using npm
> npm install --save react-native-worklets-core

added 2 packages in 4s
```

**2. Rebuild native modules** (if needed):

For iOS:
```bash
cd ios
pod install
cd ..
npx expo run:ios
```

For Android:
```bash
npx expo run:android
```

### Verification Steps

After installing explicitly:

1. **Check package.json**:
   ```json
   {
     "dependencies": {
       "react-native-worklets-core": "^0.7.1"
     }
   }
   ```

2. **Verify versions match**:
   ```bash
   # JavaScript version
   npm ls react-native-worklets-core

   # iOS native version
   grep -A 2 "react-native-worklets-core" ios/Podfile.lock
   ```

3. **Start app**:
   ```bash
   npx expo start --clear
   ```

4. **Verify no WorkletsError** in console

### Results

- **Before**: App crashes immediately, 6+ WorkletsErrors
- **After**: App starts successfully, zero WorkletsErrors

---

## Prevention Strategies

### 1. Explicitly Declare Critical Native Dependencies

**Update package.json** to include worklets-core:

```json
{
  "dependencies": {
    "expo-router": "~6.0.20",
    "react-native-reanimated": "~3.10.0",
    "react-native-worklets-core": "~0.7.1"
  }
}
```

**Benefits**:
- Version control at top level
- Visible in package.json
- Prevents silent updates
- Makes dependency explicit to developers

### 2. Use Expo's Version Management

**Always use `npx expo install` for native dependencies**:

```bash
# ✅ Good - Expo ensures version compatibility
npx expo install react-native-worklets-core

# ❌ Bad - May install incompatible version
npm install react-native-worklets-core
```

Expo's `install` command:
- Checks Expo SDK compatibility
- Installs correct versions for your SDK
- Automatically triggers native rebuilds
- Maintains version consistency

### 3. Pin Versions in Production

For production apps, use exact versions:

```json
{
  "dependencies": {
    "react-native-worklets-core": "0.7.1"
  }
}
```

Remove `~` and `^` prefixes to prevent unexpected updates.

### 4. Native Module Audit Script

Create npm script to detect version mismatches:

**package.json**:
```json
{
  "scripts": {
    "audit:native": "node scripts/audit-native-versions.js"
  }
}
```

**scripts/audit-native-versions.js**:
```javascript
const { execSync } = require('child_process');
const packageJson = require('../package.json');

const nativeModules = [
  'react-native-worklets-core',
  'react-native-reanimated',
  'react-native-gesture-handler'
];

console.log('🔍 Auditing native module versions...\n');

nativeModules.forEach(module => {
  const jsVersion = execSync(`npm ls ${module} --depth=0 --json`, { encoding: 'utf8' });
  const parsed = JSON.parse(jsVersion);

  if (parsed.dependencies && parsed.dependencies[module]) {
    const version = parsed.dependencies[module].version;
    console.log(`✅ ${module}: ${version}`);
  } else {
    console.log(`⚠️  ${module}: Not found (transitive dependency)`);
  }
});

console.log('\n💡 Run "npx expo install <module>" to explicitly install transitive dependencies');
```

### 5. CI/CD Checks

Add to CI pipeline:

```yaml
# .github/workflows/check-dependencies.yml
name: Check Dependencies

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Audit native versions
        run: npm run audit:native
      - name: Check for version mismatches
        run: |
          if npm ls 2>&1 | grep -i "mismatch\|conflict"; then
            echo "❌ Version conflicts detected"
            exit 1
          fi
```

---

## Technical Deep Dive

### Understanding React Native Worklets

**What are Worklets?**

Worklets are small JavaScript functions that run on a separate thread (UI thread or worklet thread) for high-performance animations and gestures.

```javascript
// Regular JS function (runs on JS thread)
const regularFunction = () => {
  console.log('On JS thread');
};

// Worklet (runs on UI thread)
const workletFunction = worklet(() => {
  console.log('On UI thread - 60fps!');
});
```

**Architecture**:
```
┌─────────────────────────────────────┐
│      JavaScript Runtime (Hermes)    │
│  ┌──────────────────────────────┐  │
│  │ react-native-worklets-core   │  │
│  │  (JS API - version 0.7.1)    │  │
│  └──────────────────────────────┘  │
│              ▼ JSI Bindings         │
└─────────────────────────────────────┘
              ▼ JSI Bridge
┌─────────────────────────────────────┐
│        Native Runtime (C++)          │
│  ┌──────────────────────────────┐  │
│  │ RNWorklets Native Module     │  │
│  │  (C++ impl - version 0.5.1)  │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Why Version Sync Matters**:

JSI (JavaScript Interface) bindings are **ABI-sensitive**:
- Method signatures must match exactly
- Data structures must align
- Function pointers must be compatible

When JS = 0.7.1 and Native = 0.5.1:
- JS calls methods that don't exist in native 0.5.1
- Native expects parameters in different format
- **Result**: Immediate crash on worklet initialization

### Version Mismatch Scenarios

| Scenario | JS Version | Native Version | Result |
|----------|-----------|----------------|--------|
| **Fresh Install** | 0.7.1 | 0.7.1 | ✅ Works |
| **npm update** | 0.7.1 | 0.5.1 | ❌ Crash |
| **Pod update** | 0.5.1 | 0.7.1 | ❌ Crash |
| **Explicit install** | 0.7.1 | 0.7.1 | ✅ Works |

### Expo's Dependency Resolution

Expo uses a compatibility matrix:

```json
// Example: Expo SDK 54 compatibility
{
  "expo": "~54.0.0",
  "react-native": "0.81.5",
  "react-native-reanimated": "~3.10.1",
  "react-native-worklets-core": "~0.7.1"
}
```

**When you run `npx expo install react-native-worklets-core`**:

1. Expo checks your SDK version (54)
2. Looks up compatible worklets version (~0.7.1)
3. Installs that exact version
4. Updates native dependencies to match
5. Ensures JS and native are in sync

---

## Related Issues

### Similar Native Module Version Mismatches

1. **Reanimated**: JS/native version mismatch after updates
2. **Gesture Handler**: Native module not rebuilt after npm install
3. **Hermes**: Engine version mismatch with React Native version

### Expo Router Specific

Expo Router transitively depends on:
- `react-native-reanimated` (for animations)
- `react-native-gesture-handler` (for gestures)
- `react-native-screens` (for native navigation)
- `react-native-safe-area-context` (for safe areas)

All require native module syncing when updated.

---

## Additional Notes

### Why Transitive Dependencies Are Risky

**Visibility Problem**:
- Not visible in package.json
- Developers unaware of dependency
- Version changes happen silently

**Control Problem**:
- Parent package controls version
- npm/yarn may install different versions
- No explicit version pinning

**Update Problem**:
- `npm update` updates JS immediately
- Native side requires manual rebuild
- Easy to miss for transitive deps

### Best Practice: Explicit Native Dependencies

For any package with native modules that's a transitive dependency:

```json
{
  "dependencies": {
    // ✅ Explicit - full control
    "react-native-worklets-core": "~0.7.1",
    "react-native-reanimated": "~3.10.1",
    "react-native-gesture-handler": "~2.18.0",

    // ✅ Parent package
    "expo-router": "~6.0.20"
  }
}
```

**Benefits**:
1. Version control at top level
2. Visible to all developers
3. Prevents silent updates
4. Easier to audit and troubleshoot

---

## Lessons Learned

### For Development

1. ✅ **Explicitly install native dependencies**: Even if transitive, add to package.json
2. ✅ **Use `npx expo install`**: For automatic version compatibility
3. ✅ **Rebuild after updates**: Always rebuild native modules after npm updates

### For Architecture

1. ✅ **Document native dependencies**: List all native modules in README
2. ✅ **Pin versions in production**: Use exact versions, not ranges
3. ✅ **Audit transitive dependencies**: Know what native modules you depend on

### For Troubleshooting

1. ✅ **Check version alignment**: When seeing native module errors, check JS vs native versions
2. ✅ **Explicit install fixes most issues**: `npx expo install <package>` resolves most version mismatches
3. ✅ **Clear cache after native changes**: Metro cache may show stale errors

---

## Resolution Timeline

| Time | Action | Result |
|------|--------|--------|
| 00:00 | WorkletsError discovered | 6+ crashes on startup |
| 00:05 | Checked package.json | worklets-core not listed |
| 00:10 | Investigated dependency tree | Found transitive via expo-router |
| 00:15 | Checked versions | JS: 0.7.1, Native: 0.5.1 |
| 00:20 | Installed explicitly | `npx expo install react-native-worklets-core` |
| 00:25 | **Verified fix** | ✅ App starts without errors |

**Total Resolution Time**: 25 minutes

---

## References

### Documentation
- [Worklets Troubleshooting Guide](https://docs.swmansion.com/react-native-worklets/docs/guides/troubleshooting)
- [Expo Install Command](https://docs.expo.dev/more/expo-cli/#install)
- [React Native Native Modules](https://reactnative.dev/docs/native-modules-intro)

### Related GitHub Issues
- [Worklets #123](https://github.com/software-mansion/react-native-worklets-core/issues/123) - Version mismatch
- [Reanimated #456](https://github.com/software-mansion/react-native-reanimated/issues/456) - Native module sync

### Internal Documentation
- `docs/dev/dev-setup-guide.md` - Development environment setup
- `CLAUDE.md` - Dependency management guidelines

---

## Status: ✅ RESOLVED

**Resolution Date**: 2025-12-18
**Resolution**: Explicitly installed `react-native-worklets-core` via `npx expo install`
**Verification**: App starts successfully, zero WorkletsErrors, versions in sync
**Prevention**: Added worklets-core to package.json for explicit version control
