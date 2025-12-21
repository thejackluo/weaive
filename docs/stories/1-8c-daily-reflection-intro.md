# Story 1.8c: Daily Reflection Introduction

Status: ready

## Story

As a **new user who has just reviewed their AI-generated goal breakdown**,
I want to **understand how daily reflections strengthen my binds and support my progress**,
So that **I'm prepared to engage with the daily reflection feature as a core part of my Weave experience**.

## Context

After completing Story 1.7 (origin story / first bind) and Story 1.8b (AI goal breakdown), users have:
- Completed their first bind (origin story commitment)
- Created their first Needle (goal) with AI-generated milestones and binds

This transitionary screen introduces **daily reflections** as the other primary way to strengthen binds and receive personalized guidance from Weave.

---

## Acceptance Criteria

### AC #1: Screen Display & Content
- [ ] Display immediately after user accepts AI-generated goal breakdown in Story 1.8a
- [ ] Title: "One more thing: your daily check-ins"
- [ ] Body text (3 short paragraphs):
  - Paragraph 1: "Completing binds is one way to strengthen your commitment. Daily reflection is the other."
  - Paragraph 2: "Each evening, Weave will ask: How did today go? What's on your mind? What matters tomorrow?"
  - Paragraph 3: "Your honest answers help Weave understand you better — and shape tomorrow's path with you."
- [ ] Typography: Title semi-bold (24-28px), body text medium (16-18px) at 90% opacity
- [ ] Text alignment: Title center, body left-aligned
- [ ] Background: Clean white with subtle thread-line pattern (consistent with Story 1.7)

### AC #2: Visual Element
- [ ] Display icon or illustration representing reflection/journaling
  - Options: Journal icon, thought bubble, mirror icon, or pen/paper
  - Positioned above title or in center of screen
  - Subtle animation on appearance (fade + slight scale)
- [ ] Icon size: 80-120px
- [ ] Icon color: Matches primary brand color with subtle glow

### AC #3: CTA & Navigation
- [ ] Primary CTA: "Got it — let's begin" (full-width button, fixed at bottom)
- [ ] Button styling: Primary color, min 48px height, rounded corners
- [ ] On press:
  - Mark introduction as seen (store in AsyncStorage: `daily_reflection_intro_seen: true`)
  - Navigate to Story 1.9 (First Daily Reflection)
  - Smooth transition animation
- [ ] No skip or back button (this introduction is mandatory for first-time users)

### AC #4: Timing & Context
- [ ] This screen appears ONCE during onboarding
- [ ] Future daily reflections skip this intro and go directly to reflection questions
- [ ] Check AsyncStorage flag `daily_reflection_intro_seen` to prevent re-display

### AC #5: Event Tracking
- [ ] Track `daily_reflection_intro_viewed` event when screen loads
- [ ] Track `daily_reflection_intro_completed` event when user continues
- [ ] Include payload: `{ user_id, timestamp, first_needle_created: true }`
- [ ] DEFERRED: Analytics integration (Story 0-4 backend)

### AC #6: Accessibility
- [ ] VoiceOver reads all content correctly
- [ ] CTA button has minimum touch target 48px
- [ ] Respect reduced motion settings (disable animations if enabled)
- [ ] High contrast text meets WCAG AA standards
- [ ] Dynamic type support (text scales with system settings)

---

## Tasks / Subtasks

### Task 1: Create Intro Screen Component
- [ ] **Subtask 1.1**: Create file `app/(onboarding)/daily-reflection-intro.tsx`
- [ ] **Subtask 1.2**: Implement screen layout with title, body text, and CTA
- [ ] **Subtask 1.3**: Add icon/illustration element (journal or reflection icon)
- [ ] **Subtask 1.4**: Implement fade-in animation on screen appearance
- [ ] **Subtask 1.5**: Add subtle background pattern (thread-lines, consistent with Story 1.7)

### Task 2: Implement Navigation Logic
- [ ] **Subtask 2.1**: Update Story 1.8a to navigate to daily-reflection-intro after goal acceptance
- [ ] **Subtask 2.2**: Implement AsyncStorage check for `daily_reflection_intro_seen` flag
- [ ] **Subtask 2.3**: Navigate to Story 1.9 (first daily reflection) on CTA press
- [ ] **Subtask 2.4**: Set `daily_reflection_intro_seen: true` in AsyncStorage after completion

### Task 3: Event Tracking (DEFERRED)
- [ ] **Subtask 3.1**: Add TODO comments for analytics events
  - `daily_reflection_intro_viewed`
  - `daily_reflection_intro_completed`
- [ ] **Subtask 3.2**: DEFERRED: Analytics integration (Story 0-4 backend)

### Task 4: Testing
- [ ] **Subtask 4.1**: Manual testing on iOS simulator
- [ ] **Subtask 4.2**: Test navigation flow: Story 1.8a → 1.8c → 1.9
- [ ] **Subtask 4.3**: Test AsyncStorage flag (intro shown once, then skipped)
- [ ] **Subtask 4.4**: Test accessibility (VoiceOver, dynamic type, reduced motion)
- [ ] **Subtask 4.5**: Test on physical iOS device

---

## Dev Notes

### Implementation Pattern

**Follow Story 1.7/1.8 Patterns:**
- ✅ Single screen file (no multi-step state machine needed - this is a simple intro)
- ✅ Inline styles for iOS compatibility (NOT NativeWind className)
- ✅ SafeAreaView with explicit backgroundColor
- ✅ Backend integration deferred with TODO comments

**File Structure:**
```
weave-mobile/app/(onboarding)/daily-reflection-intro.tsx
```

**Code Pattern:**
```typescript
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DailyReflectionIntro() {
  const router = useRouter();

  useEffect(() => {
    // Track intro viewed event
    // TODO (Story 0-4): Analytics integration
    console.log('[DAILY_REFLECTION_INTRO] Screen viewed');
  }, []);

  const handleContinue = async () => {
    // Mark intro as seen
    await AsyncStorage.setItem('daily_reflection_intro_seen', 'true');

    // Track intro completed event
    // TODO (Story 0-4): Analytics integration
    console.log('[DAILY_REFLECTION_INTRO] User continued to first reflection');

    // Navigate to Story 1.9 (First Daily Reflection)
    router.push('/(onboarding)/first-reflection');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'center' }}>
        {/* Icon */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ fontSize: 80 }}>📝</Text> {/* Placeholder - replace with custom icon */}
        </View>

        {/* Title */}
        <Text style={{
          fontSize: 26,
          fontWeight: '600',
          textAlign: 'center',
          marginBottom: 24
        }}>
          One more thing: your daily check-ins
        </Text>

        {/* Body Text */}
        <View style={{ marginBottom: 48 }}>
          <Text style={{ fontSize: 17, lineHeight: 26, marginBottom: 20, opacity: 0.9 }}>
            Completing binds is one way to strengthen your commitment. Daily reflection is the other.
          </Text>
          <Text style={{ fontSize: 17, lineHeight: 26, marginBottom: 20, opacity: 0.9 }}>
            Each evening, Weave will ask: How did today go? What's on your mind? What matters tomorrow?
          </Text>
          <Text style={{ fontSize: 17, lineHeight: 26, opacity: 0.9 }}>
            Your honest answers help Weave understand you better — and shape tomorrow's path with you.
          </Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={handleContinue}
          style={{
            backgroundColor: '#4CAF50',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            minHeight: 48,
          }}
          accessibilityRole="button"
          accessibilityLabel="Got it, let's begin"
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF' }}>
            Got it — let's begin
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
```

---

### Content Rationale

**Why This Copy?**

1. **Title: "One more thing: your daily check-ins"**
   - Friendly, conversational tone ("one more thing")
   - Clear what's being introduced ("daily check-ins")
   - Not intimidating or demanding

2. **Paragraph 1: "Completing binds is one way... Daily reflection is the other."**
   - Explicitly positions reflections as EQUAL to completing binds
   - Reinforces that both are core to Weave experience
   - Simple, parallel structure for clarity

3. **Paragraph 2: "Each evening, Weave will ask: How did today go?..."**
   - Sets expectations (when and what)
   - Uses questions users can already imagine answering
   - Conversational, non-clinical language

4. **Paragraph 3: "Your honest answers help Weave understand you better..."**
   - Explains the "why" (better guidance tomorrow)
   - Emphasizes honesty over perfection
   - Reinforces user-Weave partnership

**Why This Timing?**
- Positioned AFTER goal creation, so users have context for what they're reflecting on
- BEFORE first reflection, so they understand what's coming next
- During onboarding, so it feels like part of the setup flow (not a surprise later)

---

### Architecture Compliance

**Mobile App Stack:**
- React Native via Expo SDK 53
- Expo Router for file-based navigation
- TypeScript for type safety
- Inline styles for iOS compatibility
- AsyncStorage for persistence

**File Naming:**
- Screen: `daily-reflection-intro.tsx` (kebab-case)
- Component: DailyReflectionIntro (PascalCase)

**State Management:**
- Local component state (useState) if needed
- AsyncStorage for `daily_reflection_intro_seen` flag
- No TanStack Query (no API calls)
- No Zustand (single screen, simple state)

**Data Flow:**
```
Story 1.8a (Goal Accepted)
  → Story 1.8c (Daily Reflection Intro)
  → Story 1.9 (First Daily Reflection)
```

---

### Testing Requirements

**Manual Testing Checklist:**
- [ ] Screen displays after Story 1.8a goal acceptance
- [ ] Title and body text render correctly
- [ ] Icon displays and animates (if animated)
- [ ] CTA button navigates to Story 1.9
- [ ] AsyncStorage flag prevents re-display on subsequent app opens
- [ ] VoiceOver reads content correctly
- [ ] Text scales with system font size
- [ ] Reduced motion settings respected
- [ ] Smooth transition animations

**Edge Cases:**
- [ ] User backgrounds app during intro → Returns to intro on reopen
- [ ] Flag already set (returning user) → Intro skipped
- [ ] No previous goal created → Should not reach this screen (blocked by Story 1.8 flow)

---

## Git Intelligence Summary

**Branch Naming:** `story/1.8c` or `story/1.8-reflection-intro`

**Commit Pattern:**
```bash
git commit -m "feat(story-1.8c): add daily reflection intro screen between goal acceptance and first reflection"
```

**Files to Create:**
- `weave-mobile/app/(onboarding)/daily-reflection-intro.tsx` (main screen)

**Files to Modify:**
- `weave-mobile/app/(onboarding)/first-needle.tsx` (update navigation after goal acceptance)
- `docs/prd/epic-1-onboarding-optimized-hybrid-flow.md` (add Story 1.8c to flow)
- `docs/stories/1-8a-weave-path-generation-ui.md` (update AC #7 navigation target)

---

## User Flow Impact

### Before (Gap in Understanding)
```
Story 1.8a: Goal breakdown accepted
↓
Story 1.9: "Time to reflect on your day" [User thinks: "Wait, what? I just set my goal..."]
```

### After (Clear Transition)
```
Story 1.8a: Goal breakdown accepted
↓
Story 1.8c: "Daily reflections strengthen binds too" [User thinks: "Ah, this is another core feature"]
↓
Story 1.9: "How did today go?" [User thinks: "Got it, this is my first check-in"]
```

---

## Related Stories

**Prerequisites:**
- Story 1.7 (Origin Story) - Complete ✅
- Story 1.8a (Goal UI) - Complete ✅
- Story 1.8b (AI Breakdown) - Complete ✅

**Blocks:**
- Story 1.9 (First Daily Reflection) - Cannot start without this intro

**Terminology Introduced:**
- "Daily reflections" (core feature)
- "Check-ins" (synonym for reflections)
- Reinforces "binds" and "path" terminology

---

## Definition of Done

- [ ] Story 1.8c screen implemented and functional
- [ ] Navigation flow: Story 1.8a → 1.8c → 1.9 works smoothly
- [ ] AsyncStorage flag prevents re-display after first view
- [ ] All accessibility requirements met (VoiceOver, touch targets, contrast)
- [ ] Manual testing completed on iOS simulator and device
- [ ] Event tracking TODO comments added (deferred to Story 0-4)
- [ ] Documentation updated (PRD, sprint artifacts)
- [ ] Code follows Story 1.7/1.8 patterns (inline styles, SafeAreaView, etc.)

---

**Created by:** Dev Agent (Claude Sonnet 4.5)
**Date:** 2025-12-21
**Epic:** 1 - Onboarding (Optimized Hybrid Flow)
**Story Points:** 2 (Simple intro screen, minimal logic)
**Priority:** Must Have (M) - Critical for user understanding of core features
**Estimated User Time:** 10-15 seconds
**Implementation Time:** 2-3 hours
