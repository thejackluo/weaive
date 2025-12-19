# Bug Report: NativeWind Styling Not Working

**Date:** 2025-12-17  
**Status:** ✅ RESOLVED  
**Severity:** High  
**Component:** weave-mobile (React Native / Expo)

---

## Summary

NativeWind Tailwind CSS classes (e.g., `className="text-3xl font-bold"`) were not applying any styling to React Native components, even though the configuration appeared correct and there were no bundler errors.

## Environment

- **Expo SDK:** 54.0.29
- **React Native:** 0.81.5
- **NativeWind:** 4.2.1
- **Node:** Latest
- **Platform:** iOS (Expo Go)

## Symptoms

1. Components with `className` props rendered with no styling
2. Inline `style` props worked correctly (confirmed React Native styling was functional)
3. No errors in Metro bundler or runtime console
4. Metro bundled successfully (1421 modules)

## Root Causes

### 1. Missing `tailwindcss` Peer Dependency

**Issue:** NativeWind v4 requires `tailwindcss` as a peer dependency to compile Tailwind CSS directives at build time, but it was not explicitly installed in `package.json`.

**Evidence:**
- `package-lock.json` showed `tailwindcss` as a peer dependency requirement
- `npm list tailwindcss` initially showed no direct installation
- Only transitive dependencies from NativeWind were present

### 2. Missing Metro Configuration

**Issue:** NativeWind v4 requires the `withNativeWind()` wrapper in `metro.config.js` to process the `global.css` file, but the config only had comments stating "no additional metro configuration needed."

**Evidence:**
```javascript
// BEFORE (incorrect):
const config = getDefaultConfig(__dirname);
module.exports = config;

// AFTER (correct):
const { withNativeWind } = require('nativewind/metro');
const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './global.css' });
```

**Runtime logs confirmed:**
- `View style: undefined` - No styles were generated
- `View className: undefined` - Babel transformation wasn't happening

### 3. Missing `react-native-screens` Dependency

**Issue:** While troubleshooting, discovered `react-native-screens` was missing, causing additional bundler errors.

## Debugging Process

### Hypotheses Generated

1. **H1: Missing tailwindcss peer dependency** ✅ CONFIRMED
2. **H2: Babel transformation not applied** ✅ CONFIRMED (caused by H1 + metro config)
3. **H3: CSS import not processed** ✅ CONFIRMED (metro config issue)
4. **H4: Metro bundler cache issue** ⚠️ PARTIAL (required restart after metro config change)
5. **H5: Component render timing issue** ❌ REJECTED

### Evidence Collection

1. **Code inspection** - Reviewed all config files (babel.config.js, metro.config.js, tailwind.config.js, package.json)
2. **Runtime instrumentation** - Added console logs to check if className props were being transformed
3. **Inline style test** - Confirmed React Native styling worked (ruled out general styling issues)
4. **Metro logs analysis** - Identified that metro.config.js changes weren't applied until restart

## Solution

### Changes Made

1. **Added `tailwindcss` to devDependencies:**
   ```json
   "devDependencies": {
     "tailwindcss": "^3.4.19",
     // ... other deps
   }
   ```

2. **Updated `metro.config.js`:**
   ```javascript
   const { getDefaultConfig } = require('expo/metro-config');
   const { withNativeWind } = require('nativewind/metro');

   const config = getDefaultConfig(__dirname);
   module.exports = withNativeWind(config, { input: './global.css' });
   ```

3. **Installed missing dependencies using Expo CLI:**
   ```bash
   npx expo install react-native-screens tailwindcss
   ```

4. **Restarted Metro with cache clear:**
   ```bash
   npx expo start -c
   ```

### Files Modified

- `weave-mobile/package.json` - Added tailwindcss
- `weave-mobile/metro.config.js` - Added withNativeWind wrapper

## Prevention

### Best Practices Learned

1. **Always use `npx expo install` instead of `npm install`** for Expo projects
   - Automatically resolves SDK-compatible versions
   - Prevents peer dependency conflicts

2. **NativeWind v4 requires explicit Metro configuration**
   - Don't rely on default configs
   - Always wrap with `withNativeWind(config, { input: './global.css' })`

3. **Clear Metro cache after config changes**
   - Metro doesn't auto-reload on metro.config.js changes
   - Always restart with `npx expo start -c`

4. **Install peer dependencies explicitly**
   - Check package documentation for peer dependencies
   - Don't assume transitive installs are sufficient

### Configuration Checklist for NativeWind v4

- [ ] `tailwindcss` in devDependencies
- [ ] `nativewind/babel` preset in babel.config.js
- [ ] `withNativeWind()` wrapper in metro.config.js
- [ ] `global.css` imported in root layout
- [ ] `nativewind-env.d.ts` for TypeScript support
- [ ] `tailwind.config.js` with correct content paths

## Related Issues

- None (first occurrence)

## References

- [NativeWind v4 Setup Guide](https://www.nativewind.dev/v4/getting-started/react-native)
- [Expo Metro Config Documentation](https://docs.expo.dev/guides/customizing-metro/)

## Notes

This issue was subtle because:
- No error messages appeared
- Metro bundled successfully
- The setup "looked" correct at first glance
- Inline styles worked, masking the real issue

The combination of missing peer dependency + missing Metro config meant NativeWind's transformation pipeline never ran, resulting in silent failure.

