# Bug Report: React Native Reanimated useAnimatedStyle Frozen Object Error

**Date:** 2025-12-18  
**Status:** ✅ RESOLVED  
**Severity:** High (P1)  
**Component:** weave-mobile/src/design-system/components/Card  
**Affected Version:** react-native-reanimated (latest), React Native 0.76+

---

## Executive Summary

The design system showcase screen was crashing with the error: "You attempted to set the key `current` with the value `undefined` on an object that is meant to be immutable and has been frozen." The root cause was **applying animated styles from `useAnimatedStyle` to a regular `View` component** instead of an `AnimatedView` when the Card component was not pressable.

**Time to Resolution:** ~1 hour  
**Impact:** Complete crash of design system showcase, blocking all design system development and testing

---

## Problem Description

### User Report

> "ERROR [Error: You attempted to set the key `current` with the value `undefined` on an object that is meant to be immutable and has been frozen.]"

### Symptoms

1. ❌ Design system showcase screen crashed immediately on load
2. ❌ Error occurred in `useAnimatedStyle` hook from react-native-reanimated
3. ❌ Error stack trace pointed to `Card.tsx` component
4. ❌ Multiple error instances (one per Card component rendered)
5. ⚠️ Warning messages: "Reading from `value` during component render" (from debug instrumentation)

### Error Details

**Error Message:**
```
ERROR  [Error: You attempted to set the key `current` with the value `undefined` on an object that is meant to be immutable and has been frozen.]

Call Stack
  throwOnImmutableMutation (node_modules\react-native\Libraries\Utilities\deepFreezeAndThrowOnMutationInDev.js)
  useEffect$argument_0 (node_modules\react-native-reanimated\src\hook\useAnimatedStyle.ts)
  ...
  ShowcaseContent (app\(tabs)\design-system-showcase.tsx)
```

**Location:** `weave-mobile/src/design-system/components/Card/Card.tsx`

---

## Root Causes

### Primary Cause: Animated Style Applied to Regular View Component

**Issue:** The Card component was using a regular `View` component when `pressable={false}`, but still applying an animated style (from `useAnimatedStyle`) to it. React Native Reanimated requires animated styles to be applied only to Animated components.

**Evidence:**
```typescript
// BEFORE (incorrect):
const Component = pressable ? AnimatedPressable : View;  // ❌ Regular View
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

return (
  <Component style={[..., animatedStyle, ...]}>  // ❌ Applying animated style to View
    {children}
  </Component>
);
```

**Why this caused the error:**
- `useAnimatedStyle` returns a worklet-based style object that must be applied to Animated components
- Regular `View` components cannot handle worklet styles
- React Native's dev mode freezes objects, and Reanimated tries to set internal `current` properties
- This mutation attempt on a frozen object triggers the error

### Secondary Issue: Missing Safety Checks

**Issue:** The code didn't check if `springs.press` or `springs.default` were defined before using them in `withSpring()` calls.

**Evidence:**
```typescript
// BEFORE (risky):
scale.value = withSpring(0.98, springs.press);  // ❌ No null check
scale.value = withSpring(1, springs.default);    // ❌ No null check
```

---

## Debugging Process

### Initial Hypotheses

1. **H1: `springs.press` or `springs.default` is undefined** ⚠️ PARTIAL (added safety checks)
2. **H2: `scale` shared value is undefined** ❌ REJECTED (always initialized)
3. **H3: Theme context provides undefined values** ❌ REJECTED (theme properly initialized)
4. **H4: `useAnimatedStyle` callback accesses undefined property** ❌ REJECTED (scale.value is valid)
5. **H5: Timing issue with theme initialization** ❌ REJECTED
6. **H6: Animated style applied to non-Animated component** ✅ CONFIRMED (root cause)

### Evidence Collection

#### Method 1: Code Inspection
- Reviewed Card component implementation
- Compared with other components using `useAnimatedStyle` (Button, Checkbox)
- Noted that Button always uses `AnimatedPressable`, never regular View

#### Method 2: Pattern Analysis
**Working Pattern (Button component):**
```typescript
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
// Always uses AnimatedPressable, never regular Pressable
return <AnimatedPressable style={[animatedStyle, ...]}>...</AnimatedPressable>;
```

**Broken Pattern (Card component - before fix):**
```typescript
const Component = pressable ? AnimatedPressable : View;  // ❌ Conditional
return <Component style={[animatedStyle, ...]}>...</Component>;
```

**Conclusion:** The conditional component selection was the issue - animated styles were being applied to a regular View.

---

## Solution

### Changes Made

#### 1. Created AnimatedView Component

```typescript
// weave-mobile/src/design-system/components/Card/Card.tsx
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);  // ✅ Added
```

#### 2. Always Use Animated Component When Applying Animated Styles

```typescript
// AFTER (correct):
// Always use AnimatedView when applying animated styles, even if not pressable
const Component = pressable ? AnimatedPressable : AnimatedView;  // ✅ Always Animated
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

return (
  <Component style={[..., animatedStyle, ...]}>  // ✅ Safe - always Animated
    {children}
  </Component>
);
```

#### 3. Added Safety Checks for Spring Configs

```typescript
// AFTER (safer):
const handlePressIn = () => {
  if (pressable && springs?.press) {  // ✅ Null check
    scale.value = withSpring(0.98, springs.press);
  }
};

const handlePressOut = () => {
  if (pressable && springs?.default) {  // ✅ Null check
    scale.value = withSpring(1, springs.default);
  }
};
```

### Files Modified

1. `weave-mobile/src/design-system/components/Card/Card.tsx`
   - Added `AnimatedView` constant
   - Changed component selection to always use Animated components
   - Added null checks for spring configs

---

## Verification

### Pre-Fix Behavior
- ❌ Design system showcase crashed immediately on load
- ❌ Multiple error instances in console
- ❌ No UI rendered
- ⚠️ Warnings about reading `value` during render (from debug instrumentation)

### Post-Fix Behavior
- ✅ Design system showcase loads successfully
- ✅ All Card variants render correctly (default, glass, elevated, outlined, ai, success)
- ✅ No errors in console
- ✅ Animated styles work correctly for both pressable and non-pressable cards
- ✅ User confirmed: "whatever you did just worked, it is the first time i can see the design system"

---

## Why This Was Hard to Debug

### 1. Misleading Error Message
- Error message about "frozen object" and "current" key doesn't immediately point to component type mismatch
- Stack trace shows `useAnimatedStyle.ts` but doesn't indicate the root cause
- Error occurs during React's effect mounting phase, not during render

### 2. Conditional Logic Masked the Issue
- The conditional `pressable ? AnimatedPressable : View` made it seem like the code was handling both cases
- The fact that animated styles were always created but conditionally applied wasn't obvious
- Other components (Button) always use Animated components, so no precedent for this pattern

### 3. Worklet Context Complexity
- `useAnimatedStyle` runs in a worklet context with different rules
- Worklets can't use regular JavaScript APIs (discovered during instrumentation attempts)
- The error occurs when Reanimated tries to attach worklet styles to non-worklet components

### 4. Debug Instrumentation Issues
- Initial instrumentation tried to use `fetch()` inside worklets (not allowed)
- Reading `scale.value` during render caused warnings but wasn't the root cause
- Had to remove instrumentation to isolate the actual issue

---

## Prevention Guidelines

### For Developers

1. **Always Use Animated Components with Animated Styles**
   ```typescript
   // ✅ CORRECT: Always use Animated component
   const AnimatedView = Animated.createAnimatedComponent(View);
   const animatedStyle = useAnimatedStyle(() => ({ ... }));
   return <AnimatedView style={animatedStyle}>...</AnimatedView>;
   
   // ❌ WRONG: Don't apply animated styles to regular components
   const animatedStyle = useAnimatedStyle(() => ({ ... }));
   return <View style={animatedStyle}>...</View>;  // ❌ Will crash
   ```

2. **If You Need Conditional Animation, Make It Conditional**
   ```typescript
   // ✅ CORRECT: Conditionally create animated style
   const animatedStyle = pressable 
     ? useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
     : undefined;
   
   const Component = pressable ? AnimatedPressable : View;
   return <Component style={[..., animatedStyle].filter(Boolean)}>...</Component>;
   
   // OR: Always use Animated component (simpler)
   const Component = pressable ? AnimatedPressable : AnimatedView;
   const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
   return <Component style={[..., animatedStyle]}>...</Component>;  // ✅ Always safe
   ```

3. **Add Safety Checks for Theme Values**
   ```typescript
   // ✅ Always check if theme values exist
   if (springs?.press) {
     scale.value = withSpring(0.98, springs.press);
   }
   ```

4. **Follow Patterns from Working Components**
   - Check how Button, Checkbox, and other components handle animations
   - They always use Animated components when applying animated styles
   - Use consistent patterns across the codebase

### For Code Reviews

1. **Check Component Type When Using Animated Styles**
   - If `useAnimatedStyle` is used, verify the component is Animated
   - Look for conditional component selection that might use regular components

2. **Verify Theme Value Usage**
   - Check that theme values (like `springs.press`) are checked before use
   - Ensure proper null/undefined handling

---

## Cost Analysis

### Time Spent
- **Initial Investigation:** ~20 minutes
- **Hypothesis Generation:** ~15 minutes
- **Code Review & Pattern Analysis:** ~15 minutes
- **Fix Implementation:** ~10 minutes
- **Verification:** ~5 minutes
- **Total:** ~1 hour

### Impact
- **Blocked Work:** Design system showcase completely unusable (100% blocker)
- **Risk:** High (could have led to removing animation features or component rewrite)
- **Learning Value:** High (documented pattern for future components)

---

## Related Issues

### Similar Problems to Watch For

1. **Other Components Using Conditional Animated Components**
   - Check all components that use `useAnimatedStyle`
   - Verify they always use Animated components
   - Look for similar conditional patterns

2. **Worklet Context Violations**
   - Don't use regular JavaScript APIs inside `useAnimatedStyle` callbacks
   - Don't use `fetch`, `console.log`, or other non-worklet APIs in worklets
   - Use `runOnJS()` if you need to call regular JavaScript functions

3. **Theme Value Safety**
   - Always check if theme values exist before using them
   - Add optional chaining (`?.`) when accessing nested theme properties
   - Consider default values for critical theme properties

---

## References

- [React Native Reanimated Documentation](https://docs.swmansion.com/react-native-reanimated/)
- [useAnimatedStyle Hook](https://docs.swmansion.com/react-native-reanimated/docs/core/useAnimatedStyle)
- [Worklets Documentation](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary#worklet)
- [Animated Components](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary#animated-component)

---

## Lessons Learned

### Technical Lessons

1. **Animated styles require Animated components** - This is a hard requirement, not optional
2. **Conditional component selection can hide bugs** - Always verify both branches are correct
3. **Error messages can be misleading** - "Frozen object" doesn't immediately suggest component type mismatch
4. **Worklets have strict limitations** - Can't use regular JavaScript APIs inside worklet callbacks

### Process Lessons

1. **Compare with working examples** - Button component pattern showed the correct approach
2. **Remove instrumentation to isolate issues** - Debug code can sometimes cause its own problems
3. **Test incrementally** - Fix one thing at a time to identify the root cause
4. **Document patterns** - This bug report helps prevent similar issues

### Component Design Lessons

1. **Consistency matters** - All animated components should follow the same pattern
2. **Simplify when possible** - Always using AnimatedView is simpler than conditional logic
3. **Safety checks are important** - Even if values "should" exist, check them anyway

---

## Appendix A: Before and After Code Comparison

### Before (Broken)

```typescript
export function Card({
  variant = 'default',
  padding = 'default',
  pressable = false,
  onPress,
  children,
  style,
}: CardProps) {
  const { colors, spacing, radius, springs } = useTheme();
  const scale = useSharedValue(1);
  
  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(0.98, springs.press);  // ❌ No null check
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, springs.default);  // ❌ No null check
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const Component = pressable ? AnimatedPressable : View;  // ❌ Regular View when not pressable
  const componentProps = pressable
    ? { onPressIn: handlePressIn, onPressOut: handlePressOut, onPress }
    : {};

  return (
    <Component style={[styles.card, variantStyles, { padding: paddingValue, borderRadius: radius.xl }, animatedStyle, style]}>  // ❌ Applying animated style to View
      {children}
    </Component>
  );
}
```

### After (Fixed)

```typescript
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);  // ✅ Added

export function Card({
  variant = 'default',
  padding = 'default',
  pressable = false,
  onPress,
  children,
  style,
}: CardProps) {
  const { colors, spacing, radius, springs } = useTheme();
  const scale = useSharedValue(1);
  
  const handlePressIn = () => {
    if (pressable && springs?.press) {  // ✅ Null check
      scale.value = withSpring(0.98, springs.press);
    }
  };

  const handlePressOut = () => {
    if (pressable && springs?.default) {  // ✅ Null check
      scale.value = withSpring(1, springs.default);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Always use AnimatedView when applying animated styles, even if not pressable
  const Component = pressable ? AnimatedPressable : AnimatedView;  // ✅ Always Animated
  const componentProps = pressable
    ? { onPressIn: handlePressIn, onPressOut: handlePressOut, onPress }
    : {};

  return (
    <Component style={[styles.card, variantStyles, { padding: paddingValue, borderRadius: radius.xl }, animatedStyle, style]}>  // ✅ Safe - always Animated
      {children}
    </Component>
  );
}
```

---

## Appendix B: Related Components Check

### Components Using useAnimatedStyle (All Verified Correct)

1. **Button Component** ✅
   - Always uses `AnimatedPressable`
   - Never conditionally switches to regular Pressable

2. **Checkbox Component** ✅
   - Always uses `AnimatedPressable` for interactive elements
   - Uses `Animated.View` for animated children

3. **WeaveCharacter Component** ✅
   - Uses `Animated.View` for animated container
   - No conditional component selection

**Conclusion:** Card component was the only one with this pattern, now fixed.

---

**Report Author:** Debug Session with Claude  
**Last Updated:** 2025-12-18  
**Status:** Resolved and Documented

