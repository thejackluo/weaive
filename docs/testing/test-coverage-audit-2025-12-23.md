# Test Coverage Audit - December 23, 2025

## Current Test Status

**Summary:** 14 tests failed, 46 skipped

**Issues Identified:**
1. Archive tests not excluded from test runs
2. Missing tests for core components
3. Design system test strategy undefined
4. VoiceRecorder tests failing (pre-existing)

## Jest Configuration Updates

### ✅ Completed
- Updated `jest.config.js` to skip archive/node_modules tests
- Restricted test discovery to `src/` and `app/` directories only
- Added `testPathIgnorePatterns` for archive, docs, dev folders

## Component Test Coverage Analysis

### ✅ Have Tests (8 files)

**AI Chat Components:**
- `src/components/features/ai-chat/ChatScreen.tsx` → `ChatScreen.test.tsx`
- `src/components/features/ai-chat/MessageBubble.tsx` → `MessageBubble.test.tsx`
- `src/components/features/ai-chat/MessageInput.tsx` → `MessageInput.test.tsx`
- `src/components/features/ai-chat/QuickActionChips.tsx` → `QuickActionChips.test.tsx`
- `src/components/features/ai-chat/RateLimitIndicator.tsx` → `RateLimitIndicator.test.tsx`

**Journal Components:**
- `src/components/features/journal/ReflectionScreen.tsx` → `ReflectionScreen.test.tsx`
- `src/components/features/journal/ReflectionFlow.tsx` → `ReflectionFlow.integration.test.tsx`

**Other:**
- `src/components/VoiceRecorder.tsx` → `VoiceRecorder.test.tsx` (⚠️ 13 failing tests)

**Screens:**
- `src/screens/NeedlesListScreen.tsx` → `NeedlesListScreen.test.tsx`

**Design System:**
- `src/design-system/components/Button/Button.tsx` → `Button.test.tsx`

### ❌ Missing Tests (Priority Components)

#### Thread Page Components (Epic 3 + 4) - HIGH PRIORITY
- `src/components/thread/BindItem.tsx` - Individual bind card
- `src/components/thread/CompletionCelebration.tsx` - Success animation
- `src/components/thread/NeedleCard.tsx` - Goal header card
- `src/components/thread/PomodoroTimer.tsx` - Timer component
- `src/screens/ThreadHomeScreen.tsx` - Main thread screen
- `src/screens/BindScreen.tsx` - Bind completion screen

#### Dashboard Components (Epic 2 + 5) - HIGH PRIORITY
- `src/screens/DashboardScreen.tsx` - Main dashboard
- `src/components/ConsistencyHeatmap.tsx` - Progress heatmap
- `src/components/FulfillmentChart.tsx` - Fulfillment visualization
- `src/screens/NeedleDetailScreen.tsx` - Goal detail view

#### Goal Management Components - MEDIUM PRIORITY
- `src/screens/CreateNeedleScreen.tsx` - Create goal flow
- `src/components/GoalCard.tsx` - Goal card
- `src/components/GoalCardSkeleton.tsx` - Loading state
- `src/components/onboarding/GoalCard.tsx` - Onboarding goal card
- `src/components/onboarding/BindCard.tsx` - Onboarding bind card
- `src/components/onboarding/MilestoneCard.tsx` - Milestone card

#### Proof Capture Components - MEDIUM PRIORITY
- `src/components/ProofCaptureSheet.tsx` - Photo/audio capture
- `src/components/ImageGallery.tsx` - Image viewer
- `src/components/ImageDetailView.tsx` - Image detail
- `src/components/AudioPlayer.tsx` - Audio playback
- `src/components/AudioWaveform.tsx` - Audio visualization

#### Journal Components - LOW PRIORITY (some tests exist)
- `src/components/features/journal/CountdownTimer.tsx` - Timer
- `src/components/features/journal/CustomQuestionInput.tsx` - Custom questions
- `src/components/features/journal/ManageQuestionsModal.tsx` - Question management

#### Other Components - LOW PRIORITY
- `src/components/WeaveCharacter.tsx` - Character visualization
- `src/components/WeavePathLoadingScreen.tsx` - Loading screen
- `src/components/UserAvatarMenu.tsx` - User menu
- `src/components/HistoryList.tsx` - History view
- `src/components/RecordingHistory.tsx` - Recording history
- `src/components/TranscriptPreview.tsx` - Transcript view
- `src/components/VoiceRecordModal.tsx` - Voice modal
- `src/components/VoiceRecordSheet.tsx` - Voice sheet
- `src/components/RateLimitIndicator.tsx` - Rate limit UI
- `src/components/DevEnvironmentBanner.tsx` - Dev banner
- `src/components/PlaceholderScreen.tsx` - Placeholder

#### Onboarding Components - LOW PRIORITY
- `src/components/onboarding/GoalBreakdownCard.tsx`
- `src/components/onboarding/PainpointCard.tsx`

#### AI Chat Components - LOW PRIORITY (most have tests)
- `src/components/features/ai-chat/TypingIndicator.tsx`
- `src/components/features/ai-chat/ConversationList.tsx`

## Design System Test Strategy

### Current State
**Problem:** Two design systems exist:
1. `weave-mobile/src/design-system/` - **ACTIVE** (detailed structure)
2. `src/design-system/` - **ARCHIVE** (root-level reference)

**Current Tests:**
- Only `Button.test.tsx` exists

### Proposed Test Strategy

#### 1. Component Tests (Unit)
Test each component in isolation:
- **Button** - variants, sizes, states, accessibility
- **Card** - variants (glass, elevated), layout
- **Input** - states, validation, error handling
- **Text** - variants (heading, body, caption), responsive
- **Checkbox** - states, accessibility
- **Toast/SimpleToast** - display, auto-dismiss
- **WeaveCharacter** - rendering, animation states
- **Glass/GlassView** - blur effect, platform compatibility

#### 2. Token Tests (Unit)
Validate design tokens:
- **Colors** - hex values, semantic naming
- **Typography** - font families, sizes, line heights
- **Spacing** - scale consistency
- **Animations** - duration, easing
- **Effects** - shadows, blur
- **Radius** - border radius scale

#### 3. Theme Tests (Integration)
Test theme context and hooks:
- **ThemeProvider** - provider wrapping, context availability
- **useColors** - color token access
- **useTypography** - typography token access
- **useSpacing** - spacing token access
- **useShadows** - shadow token access
- **useAnimations** - animation token access

#### 4. Design System Showcase Test
- Snapshot test for `DesignSystemShowcase.tsx`
- Ensures all components render without errors

### Test File Structure
```
src/design-system/
├── components/
│   ├── Button/__tests__/Button.test.tsx ✅
│   ├── Card/__tests__/Card.test.tsx ❌
│   ├── Input/__tests__/Input.test.tsx ❌
│   ├── Text/__tests__/Text.test.tsx ❌
│   ├── Checkbox/__tests__/Checkbox.test.tsx ❌
│   ├── __tests__/Toast.test.tsx ❌
│   ├── WeaveCharacter/__tests__/WeaveCharacter.test.tsx ❌
│   └── Glass/__tests__/GlassView.test.tsx ❌
├── tokens/__tests__/
│   ├── colors.test.ts ❌
│   ├── typography.test.ts ❌
│   └── spacing.test.ts ❌
├── theme/__tests__/
│   ├── ThemeProvider.test.tsx ❌
│   └── hooks.test.ts ❌
└── __tests__/DesignSystemShowcase.test.tsx ❌
```

## Known Issues

### VoiceRecorder Tests (13 Failing)
**Status:** Pre-existing, not related to recent changes
**Component:** `src/components/VoiceRecorder.tsx`
**Test File:** `src/components/__tests__/VoiceRecorder.test.tsx`
**Priority:** Low (not blocking MVP features)

**Recommendation:** Fix after Thread + Dashboard pages are tested

## Action Items

### Immediate (Before Next Merge)
1. ✅ Update jest config to skip archive tests
2. ⬜ Add tests for Thread page components (BindItem, NeedleCard, PomodoroTimer, CompletionCelebration)
3. ⬜ Add tests for ThreadHomeScreen and BindScreen
4. ⬜ Add tests for Dashboard components (DashboardScreen, ConsistencyHeatmap, FulfillmentChart)

### Short-term (Next Sprint)
5. ⬜ Implement design system token tests
6. ⬜ Implement design system component tests
7. ⬜ Add tests for proof capture components
8. ⬜ Document design system consolidation plan

### Long-term
9. ⬜ Fix VoiceRecorder test failures
10. ⬜ Achieve 70%+ test coverage for critical paths
11. ⬜ Add E2E tests for complete user flows

## Test Coverage Goals

| Category | Current | Target (MVP) | Target (Post-MVP) |
|----------|---------|--------------|-------------------|
| Thread Components | 0% | 80% | 90% |
| Dashboard Components | 0% | 80% | 90% |
| AI Chat Components | 60% | 80% | 90% |
| Design System | 10% | 70% | 90% |
| Goal Management | 10% | 60% | 80% |
| Overall | ~15% | 70% | 85% |

## Notes

- **Design System Duplication:** Root-level `src/design-system/` should be marked as archive. Active work is in `weave-mobile/src/design-system/`.
- **Test Timeout:** Tests currently timeout at 2 minutes. Consider adding `--maxWorkers=50%` for CI runs.
- **Snapshot Tests:** Be cautious with snapshot tests for UI components. Prefer testing behavior over exact rendering.
