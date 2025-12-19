---
name: React 19 + Reanimated Compatibility Bug
about: Report issues related to React 19 and React Native Reanimated compatibility
title: '[REANIMATED] '
labels: ['bug', 'react-19', 'reanimated', 'compatibility']
assignees: ''
---

## Bug Summary

**Critical crash** when navigating to screens containing React Native Reanimated animations (e.g., design system `Card` component) with React 19.

**Error:**
```
ERROR  [Error: You attempted to set the key `current` with the value `undefined` on an object that is meant to be immutable and has been frozen.]
```

**Status:** 🔴 **TEMPORARILY DISABLED** - Reanimated plugin commented out in `babel.config.js`

---

## Environment

- **React:** 19.0.0
- **React Native:** 0.76.8
- **Expo SDK:** 53.0.0
- **React Native Reanimated:** 3.16.6
- **Platform:** iOS, Android
- **Device:** Development (Expo Go)

---

## Problem Description

When React Native Reanimated tries to set animation refs using `useAnimatedStyle`, React 19's stricter ref handling causes a frozen object mutation error. This happens because:

1. React 19 has **stricter ref immutability** than React 18
2. Reanimated's `useAnimatedStyle` hook attempts to set `.current` on refs
3. React 19 freezes ref objects in DEV mode using `deepFreezeAndThrowOnMutationInDev`
4. Any attempt to mutate frozen refs throws the error above

**Affected Components:**
- Design system `Card` component (uses glass morphism animations)
- Design system `Button` component (uses press animations)
- Any component using `useAnimatedStyle` from Reanimated
- Expo Router screen transitions with `animation` prop

---

## Steps to Reproduce

1. Create a screen with a `Card` component from the design system:
   ```typescript
   import { Card } from '@/design-system';

   export default function MyScreen() {
     return (
       <Card variant="glass" padding="default">
         <Text>Hello World</Text>
       </Card>
     );
   }
   ```

2. Navigate to the screen using Expo Router:
   ```typescript
   router.push('/my-screen');
   ```

3. **Crash occurs** immediately on screen mount with Reanimated ref error

**Error occurs in:**
- `app/(auth)/privacy-policy.tsx` (uses `Card` components)
- `app/(auth)/terms-of-service.tsx` (uses `Card` components)
- Any screen with animated design system components

---

## Error Stack Trace

```
ERROR  [Error: You attempted to set the key `current` with the value `undefined` on an object that is meant to be immutable and has been frozen.]

Call Stack
  throwOnImmutableMutation (node_modules\react-native\Libraries\Utilities\deepFreezeAndThrowOnMutationInDev.js)
  useEffect$argument_0 (node_modules\react-native-reanimated\src\hook\useAnimatedStyle.ts)
  callCreate.reactStackBottomFrame (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  runWithFiberInDEV (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  commitHookEffectListMount (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  ...
```

**Root cause:** `react-native-reanimated/src/hook/useAnimatedStyle.ts` attempts to mutate a frozen ref object

---

## Attempted Fixes

### ❌ Fix 1: Change Expo Router animation type (FAILED)
**Action:** Changed `animation: 'none'` to `animation: 'fade'` in `app/(auth)/_layout.tsx`
```typescript
<Stack.Screen
  name="privacy-policy"
  options={{
    animation: 'fade', // Changed from 'none'
  }}
/>
```
**Result:** Still crashes - issue is in component animations, not navigation animations

### ❌ Fix 2: Replace Card with View (PARTIAL)
**Action:** Replace `<Card>` with `<View>` in legal screens
```typescript
// Before
<Card variant="glass" padding="default">

// After
<View style={{ padding: 16, borderRadius: 12 }}>
```
**Result:** Fixes individual screens but doesn't solve system-wide issue

### ✅ Fix 3: Disable Reanimated plugin (WORKING WORKAROUND)
**Action:** Comment out Reanimated plugin in `babel.config.js`:
```javascript
plugins: [
  // 'react-native-reanimated/plugin', // TEMPORARILY DISABLED
]
```
**Result:** No crashes, but **all animations disabled** (acceptable for MVP development)

---

## Impact Assessment

### 🔴 Critical Impact
- **User Experience:** Legal screens (Privacy Policy, Terms of Service) crash on navigation
- **Development:** Cannot use design system components with animations
- **Testing:** Blocks OAuth testing and authentication flow validation

### ⚠️ Side Effects of Workaround (Disabling Reanimated)
- ✅ **No crashes** - App is stable
- ❌ **No glass morphism effects** - Card components lose blur/glass aesthetic
- ❌ **No button press animations** - Buttons feel less responsive
- ❌ **No smooth transitions** - Screen navigation is instant (no fade/slide)
- ✅ **Functionality intact** - All features work, just without animations

**Decision:** Acceptable trade-off for MVP development. Animations are nice-to-have, stability is critical.

---

## Upstream Issue Tracking

### Related Issues

1. **React Native Reanimated:**
   - Issue: https://github.com/software-mansion/react-native-reanimated/issues/6834
   - Status: Open (React 19 compatibility tracked)
   - Timeline: Fix expected in Reanimated v3.17+ or v4.0

2. **React Native:**
   - Issue: https://github.com/facebook/react-native/issues/47748
   - Status: React 19 support is experimental in RN 0.76
   - Timeline: Stable support expected in RN 0.77+

3. **Expo:**
   - Issue: https://github.com/expo/expo/discussions/32589
   - Status: Expo SDK 53 has experimental React 19 support
   - Timeline: Full support in SDK 54+

---

## Recommended Long-Term Solution

### Option 1: Wait for Reanimated v3.17+ or v4.0 (RECOMMENDED)
- **Action:** Monitor https://github.com/software-mansion/react-native-reanimated/issues/6834
- **Timeline:** Expected Q1 2025
- **Risk:** Low - upstream fix is actively being worked on
- **Effort:** Minimal - just upgrade dependency when available

### Option 2: Downgrade to React 18
- **Action:** Downgrade `react@18.2.0` and `react-native@0.75.x`
- **Timeline:** Immediate
- **Risk:** Medium - React 19 has better performance and new features
- **Effort:** Medium - requires testing all components

### Option 3: Remove Reanimated entirely
- **Action:** Replace all animated components with non-animated alternatives
- **Timeline:** 1-2 weeks
- **Risk:** High - lose all animations permanently
- **Effort:** High - redesign design system

**Chosen Strategy:** **Option 1** - Keep Reanimated disabled temporarily, upgrade when upstream fix is released

---

## Checklist for Re-enabling Reanimated

When Reanimated v3.17+ or v4.0 is released:

- [ ] Check release notes: https://github.com/software-mansion/react-native-reanimated/releases
- [ ] Verify React 19 compatibility is fixed
- [ ] Upgrade Reanimated: `npm install react-native-reanimated@latest`
- [ ] Re-enable plugin in `babel.config.js`:
  ```javascript
  plugins: [
    'react-native-reanimated/plugin', // Re-enabled after upgrade
  ]
  ```
- [ ] Clear Metro cache: `npx expo start --clear`
- [ ] Test all animated screens:
  - [ ] Privacy Policy screen
  - [ ] Terms of Service screen
  - [ ] Design System Showcase screen
  - [ ] All Card components
  - [ ] All Button press animations
- [ ] Test OAuth flow (requires animations for loading states)
- [ ] Verify no crashes on navigation
- [ ] Check animation performance

---

## References

- React 19 Release Notes: https://react.dev/blog/2024/12/05/react-19
- Reanimated React 19 Tracking: https://github.com/software-mansion/react-native-reanimated/issues/6834
- Expo React 19 Support: https://docs.expo.dev/guides/react-19/
- React Native 0.76 Release: https://reactnative.dev/blog/2024/11/26/0.76-new-architecture-as-default

---

## Current Workaround Status

**Current State:** Reanimated **DISABLED** in `babel.config.js` (line 19)

**To Test Fix:**
1. Uncomment `'react-native-reanimated/plugin'` in `babel.config.js`
2. Run `npx expo start --clear` to rebuild with plugin
3. Navigate to Privacy Policy or Terms of Service
4. If crash occurs → keep disabled
5. If no crash → fix is working, re-enable permanently

**Last Tested:** December 19, 2024
**Next Review:** January 15, 2025 (check for Reanimated updates)

---

**Report Created:** December 19, 2024
**Status:** 🟡 Monitoring upstream - stable workaround in place
