# Test Design: Epic 1 - Onboarding (Optimized Hybrid Flow)

**Project:** Weave MVP
**Epic:** 1 - Onboarding (Optimized Hybrid Flow)
**Document Version:** 1.0
**Last Updated:** 2025-12-20
**Author:** TEA (Test Architect)

---

## Executive Summary

### Epic Scope
Epic 1 delivers the complete onboarding flow for new users, spanning 5 phases and 11 stories (50 story points). The flow begins with an emotional hook (pre-auth), progresses through light identity bootup, provides early value proof via AI-generated goal breakdown, introduces progress tracking, and concludes with trial activation and housekeeping. Currently in-progress with 3 stories done, 5 in review, and 3 backlogged.

**Key Features:**
- Pre-auth emotional engagement (Stories 1.1-1.4)
- Supabase authentication integration (Story 1.5)
- Identity capture: name, personality archetype, traits (Story 1.6)
- Origin story commitment ritual: photo + voice (Story 1.7)
- AI-powered first goal breakdown (Story 1.8)
- First daily reflection (Story 1.9)
- Progress dashboard orientation (Story 1.10)
- Privacy, notifications, paywall, completion (Story 1.11)

**Tech Stack:** React Native (Expo SDK 53), TypeScript, FastAPI backend, Supabase (PostgreSQL + Auth + Storage), TanStack Query, AWS Bedrock (Claude 3.7 Sonnet).

### Test Approach
**Multi-level testing strategy:**
1. **Unit Tests (40% coverage target):** Business logic, data transformations, validation rules
2. **Integration Tests (30% coverage target):** API endpoints, database operations, authentication flows
3. **E2E Tests (Critical paths only):** Complete onboarding journey (Story 1.1 → 1.11), goal breakdown flow, origin story capture
4. **Manual Exploratory Testing:** Animations, camera/microphone permissions, offline behavior, accessibility

**Current Coverage Gap:** CRITICAL - Epic 1 has <5% test coverage (only 2 test files exist: Button.test.tsx, weave-solution.test.tsx). Immediate test debt of ~25-30 test files needed.

### Key Risks & Mitigation
**Risk Score Legend:** P×I = Score (1-9), where Probability (1-3) × Impact (1-3)

| Risk ID | Category | Description | P | I | Score | Mitigation |
|---------|----------|-------------|---|---|-------|-----------|
| R1-001 | DATA | User drops off during multi-screen flows (Stories 1.7, 1.8, 1.11) | 3 | 3 | **9** | AsyncStorage persistence, state recovery on app resume |
| R1-002 | SEC | Camera/microphone permissions denied - user stuck (Story 1.7) | 2 | 3 | **6** | Graceful degradation, Settings deep-link, retry flow |
| R1-003 | PERF | AI goal breakdown timeout >15s (Story 1.8) | 2 | 3 | **6** | Timeout UI, retry mechanism, fallback templates |
| R1-004 | BUS | Identity traits mismatch breaks narrative generation (Story 1.7 Screen 1) | 2 | 2 | **4** | Input validation, unit tests for content mapping |
| R1-005 | TECH | Offline state breaks onboarding flow (no internet during Stories 1.5, 1.8) | 2 | 3 | **6** | NetInfo offline detection, queue mutations, offline banner |
| R1-006 | OPS | Animation jank on mid-tier devices (iPhone 12) <60fps | 2 | 2 | **4** | useNativeDriver, performance testing, reduced motion support |

**Critical Blockers (Score 9):** R1-001 requires resolution before Epic 1 release.

### Quality Gates
**Story-Level Gates (Each story must pass):**
- ✅ All acceptance criteria verified (manual + automated tests)
- ✅ Unit test coverage >40% for business logic files
- ✅ Integration tests pass for API endpoints
- ✅ E2E test passes for critical path
- ✅ Manual exploratory testing completed (animations, permissions, offline)
- ✅ Accessibility verified (VoiceOver, 48px touch targets, WCAG AA contrast)
- ✅ Performance benchmarks met (<2s screen load, 60fps animations)
- ✅ Security reviewed (RLS policies active, no PII leaks)

**Epic-Level Gates (Before Epic 1 release):**
- ✅ Complete onboarding E2E test passes (1.1 → 1.11 happy path)
- ✅ All Risk Score ≥6 mitigated or waived with expiry
- ✅ No P1 defects open
- ✅ Integration test suite passes (auth, database, storage)
- ✅ Manual regression testing completed on iOS 15, 16, 17
- ✅ Offline behavior validated (all 11 stories)
- ✅ AI cost monitoring active ($2.50/user budget verified)

---

## 1. Epic Overview

### 1.1 Epic Description
Epic 1 implements the complete onboarding experience for Weave MVP, transforming new users from first app launch to activated trial users ready to begin their 10-day transformation journey. The flow is optimized for emotional engagement, early value delivery, and lightweight identity capture.

**Business Objective:** Achieve 70%+ onboarding completion rate (Story 1.1 → 1.11) within 5-10 minutes.

**User Journey:**
1. **Phase 1 - Emotional Hook (Pre-Auth):** Welcome screen → emotional state selection → insight reflection → Weave solution presentation → authentication (Stories 1.1-1.5)
2. **Phase 2 - Light Identity Bootup:** Name entry, personality archetype, identity traits selection → Origin story commitment ritual (photo + voice) (Stories 1.6-1.7)
3. **Phase 3 - Early Value Proof:** Choose first Needle (goal) → AI breakdown into milestones & binds → First daily reflection (Stories 1.8-1.9)
4. **Phase 4 - Lightweight Orientation:** Progress dashboard introduction (3 tooltips) (Story 1.10)
5. **Phase 5 - Trial Activation:** Privacy policy → notification permissions → soft paywall → completion (Story 1.11)

**Key Technical Challenges:**
- Multi-screen flows with state persistence (AsyncStorage + React state)
- Camera/microphone permissions handling (iOS)
- AI integration for goal breakdown (AWS Bedrock Claude 3.7)
- Offline-first with TanStack Query
- Animation performance (liquid-glass aesthetic, 60fps target)

### 1.2 Stories in Scope
| Story | Title | Points | Status | Test Priority |
|-------|-------|--------|--------|---------------|
| 1.1 | Welcome & Vision Hook | 2 | ✅ done | P1 - E2E entry point |
| 1.2 | Emotional State Selection | 3 | ✅ done | P1 - Data collection |
| 1.3 | Insight Reflection | 2 | 🔄 review | P2 - Content display |
| 1.4 | Weave Solution | 2 | 🔄 review | P2 - Content display |
| 1.5 | Authentication | 3 | 🔄 review | P0 - Security critical |
| 1.6 | Name & Identity Traits | 5 | 🔄 review | P1 - Data collection |
| 1.7 | Commitment Ritual & Origin Story | 5 | ⏸ ready-for-dev | P1 - Media capture |
| 1.8 | Choose Your First Needle | 8 | 🔄 review | P0 - AI integration |
| 1.9 | First Daily Reflection | 2 | ⏸ backlog | P2 - Data entry |
| 1.10 | Progress Dashboard Introduction | 2 | ⏸ backlog | P3 - Tooltips |
| 1.11 | Housekeeping & Trial Handoff | 6 | ⏸ backlog | P2 - Permissions |

**Total:** 40 story points across 11 stories (Note: Epic 1 PRD shows 50 pts including deferred Phase 6 stories)

### 1.3 Epic Acceptance Criteria
**Epic-level success criteria:**
1. **Completion Rate:** ≥70% of users complete full onboarding (1.1 → 1.11) in one session
2. **Time Budget:** Median completion time ≤8 minutes (95th percentile ≤15 minutes)
3. **Data Quality:** ≥95% of completed onboardings capture valid:
   - Emotional state selection (Story 1.2)
   - Identity traits (Story 1.6)
   - Origin story photo + voice (Story 1.7)
   - First goal input (Story 1.8)
4. **Technical Performance:**
   - Zero P1 defects (auth failures, data loss, crashes)
   - Screen load time <2s (95th percentile)
   - Animation performance ≥60fps on iPhone 12
   - Offline resilience: No data loss if app backgrounds during Stories 1.7, 1.8
5. **AI Quality:**
   - Goal breakdown success rate ≥95% (Story 1.8)
   - AI timeout <10s (90th percentile)
   - AI cost per user ≤$0.15 (Claude 3.7 Sonnet for Story 1.8)
6. **Security:**
   - All RLS policies active (Supabase)
   - No PII logged to analytics
   - Authentication JWT validation on all protected endpoints
7. **Accessibility:**
   - VoiceOver compatibility (all 11 stories)
   - 48px minimum touch targets
   - WCAG 2.1 AA contrast ratios

### 1.4 Dependencies
**Internal Dependencies:**
- ✅ Epic 0: Foundation (Authentication, Database Schema, RLS, AI Service) - **COMPLETE**
- ⏸ Story 0.4: Row Level Security implementation (required for data isolation) - **COMPLETE**
- ⏸ Story 0.6: AI Service Abstraction (AWS Bedrock integration) - **COMPLETE**
- ⏸ Story 0.7: Test Infrastructure (Jest, React Native Testing Library) - **COMPLETE**

**External Dependencies:**
- AWS Bedrock Claude 3.7 Sonnet API (Story 1.8 goal breakdown)
- Supabase Auth (Story 1.5 authentication)
- Supabase Storage (Story 1.7 photo + audio upload)
- Expo Camera API (Story 1.7 photo capture)
- Expo Audio (expo-av) (Story 1.7 voice recording)
- iOS Permissions: Camera, Microphone (Story 1.7)

**Test Environment Dependencies:**
- Supabase local development instance (npx supabase start)
- AWS Bedrock test account with Claude 3.7 access
- Expo Go or physical iOS device (camera/microphone testing)
- Test user accounts with pre-populated emotional states/traits

**Blocking Risks:**
- ⚠️ Story 1.7 cannot be fully tested in simulator (camera/microphone require physical device)
- ⚠️ Story 1.8 AI calls require AWS credentials (cannot mock deterministically)
- ⚠️ Offline testing requires NetInfo mocking or airplane mode

---

## 2. Test Scope & Coverage Strategy

### 2.1 Features Under Test
**Phase 1: Emotional Hook (Pre-Auth)**
- [x] Welcome screen rendering and navigation (Story 1.1)
- [x] Emotional state selection UI and data capture (Story 1.2)
- [x] Insight reflection content generation (Story 1.3)
- [x] Weave solution presentation (Story 1.4)
- [x] Supabase authentication flow (email/password, OAuth) (Story 1.5)

**Phase 2: Light Identity Bootup**
- [x] Name entry with validation (Story 1.6 Screen 1)
- [x] Personality archetype selection (Story 1.6 Screen 2)
- [x] Identity traits multi-select (Story 1.6 Screen 3)
- [x] Origin story photo capture (camera permissions, retake) (Story 1.7 Screen 2)
- [x] Origin story voice recording (microphone permissions, playback, re-record) (Story 1.7 Screen 2)
- [x] Dynamic narrative generation (Story 1.7 Screen 1)
- [x] Weave character animation + confetti (Story 1.7 Screen 3)

**Phase 3: Early Value Proof**
- [x] First Needle (goal) input form (Story 1.8 Screen 1-2)
- [x] AI goal breakdown (AWS Bedrock Claude 3.7 integration) (Story 1.8 Screen 3)
- [x] Goal breakdown display + inline editing (Story 1.8 Screen 4)
- [x] First daily reflection form (Story 1.9)

**Phase 4: Lightweight Orientation**
- [x] Progress dashboard tooltips (Story 1.10)

**Phase 5: Trial Activation**
- [x] Privacy policy display (Story 1.11 Screen 1)
- [x] Notification permissions request (Story 1.11 Screen 2)
- [x] Soft paywall presentation (Story 1.11 Screen 3)
- [x] Onboarding completion celebration (Story 1.11 Screen 4)

### 2.2 Out of Scope
**Explicitly excluded from Epic 1 testing:**
- ❌ Phase 6 stories (Dream Self, Archetype, Motivations, Constraints) - DEFERRED to Sprint 2
- ❌ Backend payment integration (paywall is UI-only in Story 1.11)
- ❌ Multi-language localization (English only in MVP)
- ❌ Android testing (iOS-first MVP)
- ❌ Tablet/iPad optimization (iPhone-only MVP)
- ❌ Web version (mobile-only MVP)
- ❌ Advanced analytics (PostHog, Sentry deferred to 500+ users)
- ❌ Performance profiling beyond 60fps validation (no Instruments deep-dive)
- ❌ Load testing (single-user flows only, no concurrent user simulation)

### 2.3 Test Levels

#### Unit Testing
**Scope:** Business logic, data transformations, validation rules, utility functions

**Files to test (25-30 files estimated):**
- `src/utils/onboardingValidation.ts` - Name validation, trait selection logic
- `src/utils/mediaHelpers.ts` - Photo/audio processing (Story 1.7)
- `src/constants/originStoryContent.ts` - Narrative generation mapping (Story 1.7)
- `src/constants/goalBreakdownTemplate.ts` - AI response parsing (Story 1.8)
- `src/services/analytics.ts` - Event tracking logic
- All screen component business logic (useState hooks, form validation)

**Test Framework:** Jest + React Native Testing Library

**Coverage Target:** 40% line coverage (focusing on business logic, not UI rendering)

**Example Test Cases:**
```typescript
// Test: Name validation (Story 1.6)
test('rejects names with special characters', () => {
  expect(validateName('John@123')).toBe(false);
});

// Test: Narrative generation (Story 1.7)
test('generates correct struggle text for "clarity" painpoint', () => {
  const narrative = generateNarrativeText(['clarity'], ['Disciplined']);
  expect(narrative.struggle).toContain('scattered');
});

// Test: AI response parsing (Story 1.8)
test('parses AI goal breakdown into milestones and binds', () => {
  const mockAIResponse = '...';
  const breakdown = parseGoalBreakdown(mockAIResponse);
  expect(breakdown.milestones).toHaveLength(3);
  expect(breakdown.binds).toHaveLength(4);
});
```

#### Integration Testing
**Scope:** API endpoints, database operations, authentication flows, file uploads

**Backend API Tests (weave-api/tests/):**
- `test_auth.py` - Supabase authentication (signup, login, JWT validation) (Story 1.5)
- `test_onboarding.py` - User profile creation, emotional state save (Stories 1.2, 1.6)
- `test_origin_story.py` - Photo/audio upload to Supabase Storage (Story 1.7)
- `test_goal_breakdown.py` - AI goal breakdown endpoint (mocked Bedrock) (Story 1.8)
- `test_analytics.py` - Analytics event tracking (all stories)

**Test Framework:** pytest + httpx (async client)

**Coverage Target:** 30% integration coverage (all critical API paths)

**Example Test Cases:**
```python
# Test: Authentication flow (Story 1.5)
async def test_signup_creates_user_profile():
    response = await client.post('/api/auth/signup', json={
        'email': 'test@example.com',
        'password': 'SecurePass123!'
    })
    assert response.status_code == 201
    assert 'user_id' in response.json()

# Test: Origin story upload (Story 1.7)
async def test_origin_story_upload():
    files = {
        'photo': open('test_photo.jpg', 'rb'),
        'audio': open('test_audio.aac', 'rb')
    }
    response = await client.post('/api/origin-stories', files=files)
    assert response.status_code == 201
    assert 'photo_url' in response.json()
    assert 'audio_url' in response.json()
```

#### E2E Testing
**Scope:** Critical user journeys, complete workflows, cross-screen interactions

**Priority E2E Tests:**
1. **P0: Complete Onboarding Happy Path** (Story 1.1 → 1.11)
   - Launch app → Welcome → Emotional state → Auth → Name/Traits → Origin story → Goal → Reflection → Dashboard intro → Permissions → Complete
   - **Validation:** User profile created, origin story uploaded, first goal saved
   - **Time Budget:** <15 minutes execution

2. **P1: Goal Breakdown Flow** (Story 1.8)
   - Enter goal → AI generates breakdown → Edit milestone → Edit bind → Accept
   - **Validation:** AI response received <10s, edits persisted

3. **P1: Origin Story Capture** (Story 1.7)
   - Narrative screen → Capture photo → Record voice → Preview → Complete
   - **Validation:** Photo saved, audio saved, Weave animation plays

**Test Framework:** Detox (React Native E2E) OR Manual (if Detox setup blocked)

**Coverage Target:** 3 critical paths automated OR manual test scripts documented

**Example E2E Test:**
```javascript
// Detox E2E test (Story 1.1-1.5 flow)
describe('Onboarding Phase 1', () => {
  it('completes emotional hook and authentication', async () => {
    await element(by.id('welcome-get-started')).tap();
    await element(by.id('emotional-state-clarity')).tap();
    await element(by.id('continue-button')).tap();
    // ... authentication flow
    await expect(element(by.id('name-entry-screen'))).toBeVisible();
  });
});
```

#### Manual Testing
**Scope:** Animations, permissions, offline behavior, accessibility, edge cases

**Manual Test Scenarios (Priority P1-P0):**
1. **Camera Permissions (Story 1.7):**
   - Deny permission → Alert shows → Tap "Open Settings" → Enable → Retry
   - Validation: Settings deep-link works, retry flow succeeds

2. **Microphone Permissions (Story 1.7):**
   - Deny permission → Alert shows → Tap "Open Settings" → Enable → Retry
   - Validation: Settings deep-link works, retry flow succeeds

3. **Offline Behavior (Story 1.8):**
   - Start goal input → Turn off WiFi → Submit goal → Offline banner shows
   - Turn on WiFi → Goal submits automatically
   - Validation: No data loss, TanStack Query queues mutation

4. **Animation Performance (All stories):**
   - Test on iPhone 12 (mid-tier device)
   - Validation: 60fps animations, no jank

5. **VoiceOver Accessibility (All stories):**
   - Enable VoiceOver → Navigate all 11 stories
   - Validation: All interactive elements have accessibility labels, navigation logical

6. **Reduced Motion (All stories):**
   - Enable Reduce Motion → Navigate all 11 stories
   - Validation: Animations fade-only, no complex motion

**Manual Testing Device Matrix:**
- iPhone 12 (iOS 15, 16, 17) - Primary test device
- iPhone 15 Pro (iOS 17) - Latest hardware
- iPhone SE 3rd Gen (iOS 17) - Small screen

### 2.4 Coverage Targets
**Overall Coverage Goals:**

| Test Level | Target | Current | Gap | Priority |
|-----------|--------|---------|-----|----------|
| Unit Tests | 40% | ~5% | **-35%** | P0 - Critical |
| Integration Tests | 30% | ~10% | **-20%** | P1 - High |
| E2E Tests | 3 critical paths | 0 | **-3** | P1 - High |
| Manual Tests | 100% of P0/P1 scenarios | 50% | **-50%** | P2 - Medium |

**Test File Estimate:**
- Unit tests: ~25-30 files (1 per screen + utilities)
- Integration tests: ~5 files (auth, onboarding, origin story, goal, analytics)
- E2E tests: ~3 test suites (happy path, goal breakdown, origin story)
- Manual test scripts: ~6 documented scenarios (permissions, offline, accessibility)

**Total Estimated Test Effort:** 60-80 hours (2-3 weeks @ 50% capacity)

---

## 3. Risk Assessment

### 3.1 High-Risk Areas
**Risk Score ≥6 (Requires Documented Mitigation)**

| Risk ID | Story | Category | Description | Probability | Impact | Score | Mitigation Plan | Owner |
|---------|-------|----------|-------------|-------------|--------|-------|-----------------|-------|
| R1-001 | 1.7, 1.8, 1.11 | DATA | User data loss during multi-screen flows (app backgrounds, crashes) | 3 (High) | 3 (High) | **9** | Implement AsyncStorage persistence + state recovery on app resume. Test: Kill app during flow, relaunch, verify state restored. | Dev Team |
| R1-002 | 1.7 | SEC | Camera/microphone permissions denied - user stuck in onboarding | 2 (Medium) | 3 (High) | **6** | Settings deep-link + graceful degradation (skip origin story if permissions repeatedly denied after 3 attempts). Test: Deny permissions, verify Settings link works. | Dev Team |
| R1-003 | 1.8 | PERF | AI goal breakdown timeout >15s causes user frustration | 2 (Medium) | 3 (High) | **6** | Timeout UI at 10s ("Taking longer..."), retry button at 15s. Fallback: Deterministic template breakdown. Test: Mock slow AI response, verify timeout UI. | Dev + TEA |
| R1-005 | 1.5, 1.8 | TECH | Offline state breaks onboarding flow (auth, AI calls) | 2 (Medium) | 3 (High) | **6** | NetInfo offline detection + TanStack Query mutation queuing. Show offline banner, queue mutations. Test: Airplane mode during Stories 1.5, 1.8. | Dev Team |

**CRITICAL BLOCKER:** R1-001 (Score 9) must be resolved before Epic 1 release. No exceptions.

### 3.2 Medium-Risk Areas
**Risk Score 4-5 (Monitor and Test)**

| Risk ID | Story | Category | Description | Probability | Impact | Score | Mitigation Plan |
|---------|-------|----------|-------------|-------------|--------|-------|-----------------|
| R1-004 | 1.7 | BUS | Identity traits mismatch breaks narrative generation (undefined painpoint) | 2 | 2 | **4** | Input validation + unit tests for all painpoint mappings. Fallback: Generic narrative if mapping fails. |
| R1-006 | All | OPS | Animation jank on mid-tier devices (iPhone 12) <60fps | 2 | 2 | **4** | useNativeDriver for all animations, performance testing on iPhone 12. Respect reduced motion settings. |
| R1-007 | 1.8 | BUS | AI generates invalid goal breakdown (missing milestones, empty binds) | 2 | 2 | **4** | Schema validation + retry logic. Manual fallback: User can edit broken sections. |
| R1-008 | 1.5 | SEC | Weak password accepted during signup (no complexity validation) | 2 | 2 | **4** | Password complexity rules: ≥8 chars, 1 uppercase, 1 number. Zod schema validation. |

### 3.3 Risk Mitigation Strategies

**Data Integrity (R1-001):**
```typescript
// AsyncStorage persistence strategy (Story 1.7, 1.8)
const saveOnboardingDraft = async (step: string, data: any) => {
  await AsyncStorage.setItem('onboarding_draft', JSON.stringify({
    step,
    data,
    timestamp: Date.now()
  }));
};

// State recovery on app resume
useEffect(() => {
  const restoreDraft = async () => {
    const draft = await AsyncStorage.getItem('onboarding_draft');
    if (draft) {
      const { step, data } = JSON.parse(draft);
      // Restore state based on step
    }
  };
  restoreDraft();
}, []);
```

**Permissions Handling (R1-002):**
```typescript
// Settings deep-link (Story 1.7)
import { Linking, Alert } from 'react-native';

const handlePermissionDenied = (type: 'camera' | 'microphone') => {
  Alert.alert(
    `${type} Access Required`,
    `Weave needs ${type} access. Enable in Settings.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() }
    ]
  );
};
```

**AI Timeout Handling (R1-003):**
```typescript
// Timeout UI + retry (Story 1.8)
const [aiCallDuration, setAiCallDuration] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    setAiCallDuration(prev => prev + 1);
  }, 1000);
  return () => clearInterval(timer);
}, []);

// Show warning at 10s, error at 15s
{aiCallDuration > 10 && aiCallDuration < 15 && (
  <Text>Taking longer than usual...</Text>
)}
{aiCallDuration >= 15 && (
  <View>
    <Text>Timeout. Please try again.</Text>
    <Button onPress={retryAICall}>Retry</Button>
  </View>
)}
```

**Offline Detection (R1-005):**
```typescript
// NetInfo offline detection (All stories)
import NetInfo from '@react-native-community/netinfo';

const [isOffline, setIsOffline] = useState(false);

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsOffline(!state.isConnected || !state.isInternetReachable);
  });
  return () => unsubscribe();
}, []);

// Offline banner
{isOffline && (
  <View style={{ backgroundColor: '#FFA500', padding: 8 }}>
    <Text>You're offline. Changes will sync when connected.</Text>
  </View>
)}
```

---

## 4. Test Strategy by Story

### Story 1.1: Welcome & Vision Hook (2 pts, done)
**Test Priority:** P1 - E2E entry point

**Unit Tests:**
- [x] Component renders without crashing
- [x] Button onPress triggers navigation
- [x] Haptic feedback fires (mock expo-haptics)

**Integration Tests:**
- [x] Analytics event `onboarding_started` tracked (backend API)

**E2E Tests:**
- [x] Welcome screen → Emotional state selection navigation

**Manual Tests:**
- [ ] Performance: Screen loads <2s
- [ ] Accessibility: VoiceOver reads logo, tagline, button
- [ ] Device testing: iPhone 12, iPhone 15 Pro

**Risk Areas:** Low risk (static screen, no complex logic)

---

### Story 1.2: Emotional State Selection (3 pts, done)
**Test Priority:** P1 - Data collection critical

**Unit Tests:**
- [ ] Emotional state data structure validation
- [ ] State selection updates local state correctly
- [ ] Continue button disabled until selection made

**Integration Tests:**
- [ ] POST /api/onboarding/emotional-state saves data

**E2E Tests:**
- [x] Select emotional state → Continue → Insight reflection screen

**Manual Tests:**
- [ ] Multi-select UI behaves correctly
- [ ] Animations smooth (card selection)

**Risk Areas:** Medium risk (data validation, multi-select logic)

---

### Story 1.5: Authentication (3 pts, review)
**Test Priority:** P0 - Security critical

**Unit Tests:**
- [ ] Email validation (valid/invalid formats)
- [ ] Password validation (length, complexity)
- [ ] Form submission disabled until valid inputs

**Integration Tests:**
- [x] POST /api/auth/signup creates user + profile (48 RLS tests passing)
- [x] POST /api/auth/login returns JWT token
- [ ] JWT validation on protected endpoints

**E2E Tests:**
- [ ] Signup flow: Email → Password → Creates account → Navigates to Story 1.6
- [ ] Login flow: Email → Password → Navigates to dashboard (post-onboarding)

**Manual Tests:**
- [ ] Supabase Auth UI integration (if using)
- [ ] OAuth providers (Google, Apple) if enabled

**Risk Areas:** HIGH risk (R1-008: weak password, auth token handling)

---

### Story 1.6: Name & Identity Traits (5 pts, review)
**Test Priority:** P1 - Data collection critical

**Unit Tests:**
- [ ] Name validation (no special chars, 1-50 length)
- [ ] Personality archetype selection (single-select)
- [ ] Identity traits selection (3-5 traits required)
- [ ] Step state machine (currentStep 1 → 2 → 3)

**Integration Tests:**
- [ ] POST /api/onboarding/identity saves name, archetype, traits

**E2E Tests:**
- [ ] 3-screen flow: Name entry → Personality → Traits → Navigate to Story 1.7

**Manual Tests:**
- [ ] Animations (screen transitions, trait card selection)
- [ ] Back navigation preserves state

**Risk Areas:** Medium risk (R1-004: trait data mismatch in Story 1.7)

---

### Story 1.7: Commitment Ritual & Origin Story (5 pts, ready-for-dev)
**Test Priority:** P1 - Media capture + Critical blocker (R1-001)

**Unit Tests:**
- [ ] Narrative generation (painpoint → struggle text mapping)
- [ ] Content mapping for all painpoint combinations
- [ ] Photo URI validation
- [ ] Audio duration validation (max 60s)

**Integration Tests:**
- [ ] POST /api/origin-stories uploads photo + audio to Supabase Storage
- [ ] Creates origin_stories record with URLs
- [ ] Updates user_profiles.first_bind_completed_at

**E2E Tests:**
- [ ] 3-screen flow: Narrative → Photo + Voice capture → Weave animation → Navigate to Story 1.8
- [ ] State recovery test (CRITICAL R1-001): Kill app during Screen 2, relaunch, verify photo/audio restored from AsyncStorage

**Manual Tests:**
- [x] Camera permissions: Deny → Alert → Open Settings → Enable → Retry (R1-002)
- [x] Microphone permissions: Deny → Alert → Open Settings → Enable → Retry (R1-002)
- [ ] Photo retake flow
- [ ] Audio re-record flow
- [ ] Audio playback controls
- [ ] Weave character animation + confetti (60fps validation)
- [ ] **DEVICE REQUIRED:** Cannot test in simulator (camera, microphone)

**Risk Areas:** CRITICAL risk (R1-001: data loss, R1-002: permissions blocked)

---

### Story 1.8: Choose Your First Needle (8 pts, review)
**Test Priority:** P0 - AI integration critical

**Unit Tests:**
- [ ] Goal input validation (1-200 chars)
- [ ] AI response parsing (milestones, binds)
- [ ] Inline edit logic (save, cancel, mark edited)
- [ ] Timeout logic (10s warning, 15s error)

**Integration Tests:**
- [ ] POST /api/goals/breakdown calls AWS Bedrock Claude 3.7
- [ ] Mocked AI response returns valid schema
- [ ] Timeout handling (>15s returns error)

**E2E Tests:**
- [ ] 4-screen flow: Goal input → AI loading → Breakdown display → Edit milestone → Accept → Navigate to Story 1.9
- [ ] State recovery test (CRITICAL R1-001): Kill app during AI call, relaunch, verify state restored

**Manual Tests:**
- [ ] Loading animation (thread-weaving, smooth 60fps)
- [ ] Timeout UI (10s warning, 15s error) (R1-003)
- [ ] Offline banner (airplane mode) (R1-005)
- [ ] Retry flow after AI failure
- [ ] Edit all sections (goal, milestones, binds)
- [ ] Back navigation confirmation dialog

**Risk Areas:** CRITICAL risk (R1-001: data loss, R1-003: AI timeout, R1-005: offline, R1-007: invalid AI output)

---

### Stories 1.9, 1.10, 1.11 (10 pts total, backlog)
**Test Priority:** P2-P3 - Lower priority, straightforward flows

**Summary Test Strategy:**
- **Story 1.9 (First Daily Reflection):** Simple form with fulfillment slider, POST to backend
- **Story 1.10 (Progress Dashboard Intro):** 3 tooltips, no complex logic
- **Story 1.11 (Housekeeping & Trial):** Privacy policy, notification permissions, soft paywall, completion screen

**Key Tests:**
- [ ] E2E: Complete full onboarding 1.1 → 1.11
- [ ] Notification permission handling (iOS)
- [ ] Completion celebration animation

**Risk Areas:** Low-medium risk (permissions handling in 1.11)

---

## 5. Test Data & Environment Requirements

### 5.1 Test Data Strategy
**Test User Personas:**
1. **Happy Path User:** Complete onboarding 1.1 → 1.11 with valid data
   - Email: `testuser+happy@weave.app`
   - Emotional state: Clarity
   - Identity traits: Disciplined, Focused, Intentional
   - Goal: "Launch my side project in 30 days"

2. **Edge Case User:** Test validation boundaries
   - Email: `testuser+edge@weave.app`
   - Name: "X" (min 1 char), "A"×50 (max 50 chars)
   - Identity traits: Select only 3 (min), select 10 (validation should limit to 5)
   - Goal: 200-char goal (max length test)

3. **Permissions Denied User:** Test graceful degradation
   - Email: `testuser+deny@weave.app`
   - Deny camera permissions (Story 1.7)
   - Deny microphone permissions (Story 1.7)
   - Verify Settings deep-link + retry flow

4. **Offline User:** Test offline resilience
   - Email: `testuser+offline@weave.app`
   - Airplane mode during Story 1.5 (auth)
   - Airplane mode during Story 1.8 (AI call)
   - Verify TanStack Query mutation queuing

**Test Media Files:**
- `test-photo.jpg` (512x512, 50KB) - Valid origin story photo
- `test-photo-large.jpg` (4000x4000, 5MB) - Test image compression
- `test-audio.aac` (30 seconds, 500KB) - Valid voice recording
- `test-audio-long.aac` (90 seconds, 1.5MB) - Test 60s max duration enforcement

### 5.2 Environment Requirements
**Development Environment:**
- Supabase local instance: `npx supabase start`
- Backend API: `uv run uvicorn app.main:app --reload` (port 8000)
- Mobile app: `npm start` (Expo Go or physical device)
- AWS Bedrock access (test account with Claude 3.7 enabled)

**Test Environment:**
- Supabase staging instance (separate from prod)
- Backend staging API (staging.api.weave.app)
- Mobile app with staging environment variables
- AWS Bedrock test credentials (separate from prod, cost monitoring enabled)

**Required Environment Variables:**
```bash
# Mobile (.env.test)
EXPO_PUBLIC_API_URL=https://staging.api.weave.app
EXPO_PUBLIC_SUPABASE_URL=https://staging.supabase.weave.app
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx

# Backend (.env.test)
SUPABASE_URL=https://staging.supabase.weave.app
SUPABASE_SERVICE_KEY=xxx
AWS_BEDROCK_REGION=us-east-1
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-7-sonnet-v2
```

### 5.3 Test Account Requirements
**Supabase Test Accounts:**
- 10 pre-seeded test users with varying data states
- Admin account for RLS policy verification
- Expired JWT token for auth testing

**AWS Bedrock Test Account:**
- Read-only access (no model training)
- Cost monitoring alerts at $10/day
- Rate limiting: 10 req/min (prevent runaway costs)

**iOS Test Devices:**
- iPhone 12 (iOS 15, 16, 17) - Primary
- iPhone 15 Pro (iOS 17) - Latest
- iPhone SE 3rd Gen (iOS 17) - Small screen

---

## 6. Test Execution Plan

### 6.1 Test Phases
**Phase 1: Story-Level Testing (Parallel - As stories complete)**
- Unit tests written and passing before story marked "done"
- Integration tests for API endpoints completed
- Manual exploratory testing per story

**Phase 2: Epic Integration Testing (After all stories in review)**
- E2E test: Complete onboarding 1.1 → 1.11
- Cross-story data flow validation
- AsyncStorage persistence verification (R1-001)

**Phase 3: Device & Accessibility Testing (Before Epic release)**
- iOS device matrix testing (iPhone 12, 15 Pro, SE)
- VoiceOver compatibility (all 11 stories)
- Reduced motion validation
- Performance benchmarks (60fps, <2s load)

**Phase 4: Regression & Sign-Off (Release gate)**
- Full regression suite (unit + integration + E2E)
- Risk Score ≥6 mitigation verification
- Epic quality gates validation
- Product Owner sign-off

### 6.2 Entry & Exit Criteria
**Entry Criteria (Epic-Level Testing):**
- ✅ All 11 stories in "review" or "done" status
- ✅ Story-level quality gates passed for all stories
- ✅ Unit test coverage ≥40% achieved
- ✅ Integration test suite passing
- ✅ Test environment provisioned (Supabase staging + AWS Bedrock)

**Exit Criteria (Epic Release):**
- ✅ All Risk Score ≥6 mitigated or waived
- ✅ E2E test "Complete Onboarding 1.1 → 1.11" passing
- ✅ No P1 defects open
- ✅ Epic quality gates validated
- ✅ Manual device testing completed (3 devices, 3 iOS versions)
- ✅ Accessibility validated (VoiceOver, reduced motion)
- ✅ Product Owner + QA Lead sign-off

### 6.3 Test Schedule
| Week | Phase | Activities | Status |
|------|-------|-----------|--------|
| Week 1 | Story 1.1-1.2 | Unit + Integration tests | ✅ Done |
| Week 1-2 | Stories 1.3-1.6 | Unit + Integration tests | 🔄 In Progress |
| Week 2 | Story 1.7 | Unit + Integration + Manual (device required) | ⏸ Pending |
| Week 2-3 | Story 1.8 | Unit + Integration + AI mocking | 🔄 In Progress |
| Week 3 | Stories 1.9-1.11 | Unit + Integration tests | ⏸ Pending |
| Week 3 | E2E Testing | Complete onboarding E2E + regression | ⏸ Pending |
| Week 3 | Device Testing | iPhone 12, 15 Pro, SE (iOS 15-17) | ⏸ Pending |
| Week 4 | Sign-Off | Risk validation + PO approval | ⏸ Pending |

**Total Test Execution:** 3-4 weeks (parallel with development)

---

## 7. Quality Gates & Release Criteria

### 7.1 Story-Level Quality Gates
**Mandatory for story "done" status:**
1. ✅ All acceptance criteria verified (manual + automated)
2. ✅ Unit test coverage ≥40% for business logic files
3. ✅ Integration tests pass for API endpoints
4. ✅ Manual exploratory testing completed
5. ✅ Accessibility verified (VoiceOver labels, 48px touch targets)
6. ✅ Performance benchmarks met (<2s load, 60fps animations)
7. ✅ Security reviewed (RLS policies, no PII leaks)
8. ✅ Code review approved by senior engineer

### 7.2 Epic-Level Quality Gates
**Mandatory for Epic 1 release:**
1. ✅ Complete onboarding E2E test passes (1.1 → 1.11)
2. ✅ All Risk Score ≥6 mitigated or waived with owner + expiry
3. ✅ No P1 defects open (P2+ acceptable with Product Owner approval)
4. ✅ Integration test suite passes (auth, database, storage, AI)
5. ✅ Manual regression on iOS 15, 16, 17 (3 devices)
6. ✅ Offline behavior validated (Stories 1.5, 1.7, 1.8)
7. ✅ AI cost monitoring active (≤$0.15/user verified)

### 7.3 Release Criteria
**Epic 1 cannot ship until:**
- 🚫 **R1-001 (Score 9) resolved:** AsyncStorage persistence + state recovery tested and passing
- ✅ All story-level quality gates passed (11/11 stories)
- ✅ Epic-level quality gates validated
- ✅ Product Owner sign-off
- ✅ QA Lead sign-off
- ✅ Security review completed (RLS policies audited)

**Release Waivers (if needed):**
- P2/P3 defects can be waived with Product Owner approval
- Risk Score 4-5 can be accepted with documented rationale
- Non-critical accessibility issues can be deferred to Sprint 2

---

## 8. Test Automation Strategy

### 8.1 Automation Scope
**Automated Tests:**
- Unit tests: Business logic, validations, utilities (40% coverage target)
- Integration tests: API endpoints, database operations (30% coverage target)
- E2E tests: 3 critical paths (happy path, goal breakdown, origin story)

**Manual Tests (Not Automated):**
- Camera/microphone permissions flow (requires physical device)
- Animation performance validation (60fps requirement)
- VoiceOver accessibility (screen reader testing)
- Reduced motion support (accessibility setting)
- App backgrounding/foregrounding behavior

### 8.2 Automation Framework
**Mobile (React Native):**
- Framework: Jest + React Native Testing Library
- E2E: Detox (if setup feasible) OR manual test scripts
- Coverage: Jest coverage reports (40% target)

**Backend (FastAPI):**
- Framework: pytest + httpx (async client)
- Coverage: pytest-cov (30% target)

**CI/CD Integration:**
- GitHub Actions: Run tests on every PR
- Fail PR if tests don't pass or coverage drops below target

### 8.3 Automation Priorities
**P0 (Automate First):**
1. Authentication tests (signup, login, JWT validation)
2. Data validation tests (name, traits, goal input)
3. API endpoint tests (all POST/GET endpoints)

**P1 (Automate Second):**
1. E2E happy path (1.1 → 1.11)
2. AI response parsing tests
3. AsyncStorage persistence tests

**P2 (Manual if time constrained):**
1. Animation performance
2. Permissions flows
3. Offline behavior

---

## 9. Defect Management

### 9.1 Defect Severity Definitions
| Severity | Definition | Examples | SLA |
|----------|------------|----------|-----|
| P0 (Critical) | Blocks release, no workaround | Auth broken, data loss, app crashes on launch | Fix immediately (same day) |
| P1 (High) | Major functionality broken, workaround exists | AI timeout no retry, permissions no Settings link | Fix within 2 days |
| P2 (Medium) | Minor functionality issue, acceptable workaround | Animation jank, validation error message unclear | Fix within 1 week |
| P3 (Low) | Cosmetic issue, no functional impact | Text alignment off, color slightly incorrect | Backlog (can defer to Sprint 2) |

### 9.2 Defect Triage Process
1. **Report:** Developer or QA logs defect with reproduction steps
2. **Triage:** QA Lead assigns severity (P0-P3) based on impact
3. **Assign:** Product Owner assigns to developer with SLA
4. **Fix:** Developer implements fix + adds regression test
5. **Verify:** QA verifies fix on device
6. **Close:** Defect closed after verification

### 9.3 Defect Tracking
**Tool:** GitHub Issues with labels
- Label: `bug` (all defects)
- Label: `P0`, `P1`, `P2`, `P3` (severity)
- Label: `epic-1` (epic tracking)
- Label: `story-1.7` (story tracking)

**Defect Report Template:**
```markdown
## Bug Report
**Story:** 1.7 (Commitment Ritual)
**Severity:** P1
**Environment:** iOS 17, iPhone 12

**Steps to Reproduce:**
1. Navigate to Story 1.7 Screen 2
2. Deny camera permission
3. Tap "Open Settings" button

**Expected:** Settings app opens to Weave permissions
**Actual:** Nothing happens, button does not work

**Screenshots:** [attached]
**Logs:** [attached]
```

---

## 10. Test Deliverables

### 10.1 Test Artifacts
**Produced During Testing:**
- Test Design Document (this document)
- Unit test files (~25-30 files)
- Integration test files (~5 files)
- E2E test scripts (~3 test suites)
- Manual test scripts (~6 scenarios)
- Test data files (test photos, audio files)
- Test coverage reports (Jest, pytest-cov)
- Defect reports (GitHub Issues)

### 10.2 Test Reports
**Weekly Test Status Report:**
- Test execution progress (% complete)
- Test pass/fail rate
- Defect summary (P0/P1/P2/P3 counts)
- Risk status (mitigated/open)
- Blockers and dependencies

**Epic Sign-Off Report (Before Release):**
- All quality gates validated ✅
- Risk assessment summary
- Defect closure status
- Coverage metrics (unit 40%, integration 30%)
- Manual test completion status
- Product Owner + QA Lead signatures

### 10.3 Sign-Off Criteria
**Epic 1 Sign-Off Requires:**
- ✅ Test Design Document reviewed and approved
- ✅ All quality gates passed
- ✅ All P0/P1 defects closed
- ✅ Test execution report showing 100% completion
- ✅ Product Owner approval
- ✅ QA Lead approval
- ✅ Security review completed

---

## 11. Risks & Assumptions

### 11.1 Testing Risks
| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|-----------|
| TR-001 | Physical iOS device unavailable for Story 1.7 testing | Low | High | Borrow device from team, delay Story 1.7 testing 1 week |
| TR-002 | AWS Bedrock API rate limits hit during testing | Medium | Medium | Use mocked AI responses for unit/integration tests, real API only for E2E |
| TR-003 | Test environment instability (Supabase staging) | Low | Medium | Fallback to local Supabase instance, coordinate staging access |
| TR-004 | Insufficient time to write all 25-30 unit tests | Medium | Medium | Prioritize P0/P1 stories, defer P2/P3 tests to Sprint 2 |

### 11.2 Assumptions
1. **Physical Device Access:** Assumes at least 1 physical iPhone available for Story 1.7 testing (camera, microphone)
2. **AWS Bedrock Access:** Assumes test account with Claude 3.7 Sonnet enabled
3. **Test Data Availability:** Assumes test users pre-seeded in staging Supabase
4. **CI/CD Setup:** Assumes GitHub Actions configured for automated test runs
5. **Developer Availability:** Assumes developers write unit tests concurrently with implementation

### 11.3 Constraints
1. **Platform:** iOS-only testing (Android deferred to post-MVP)
2. **Device Coverage:** Limited to 3 device models (iPhone 12, 15 Pro, SE)
3. **iOS Version Coverage:** iOS 15, 16, 17 only (older versions not supported)
4. **Time Budget:** 3-4 weeks for complete test execution (parallel with development)
5. **Cost Budget:** AWS Bedrock test calls capped at $50/week
6. **Automation Tooling:** Detox E2E setup may be skipped if setup > 2 days

---

## 12. Appendices

### 12.1 Glossary
| Term | Definition |
|------|------------|
| **Needle** | User's top-level goal (max 3 active) |
| **Bind** | Consistent action/habit toward a goal |
| **Thread** | User's starting state and identity |
| **Weave** | User's evolved state and progress visualization |
| **Origin Story** | Immutable record of user's commitment (photo + voice) |
| **Triad** | AI-generated 3 tasks for next day |
| **Emotional Hook** | Pre-auth engagement strategy (Stories 1.1-1.4) |
| **RLS** | Row Level Security (Supabase database access control) |

### 12.2 References
**Source Documents:**
- PRD: `docs/prd/epic-1-onboarding-optimized-hybrid-flow.md`
- Architecture: `docs/architecture/core-architectural-decisions.md`
- Epics: `docs/epics.md`
- Story Files: `docs/stories/1-*.md`
- Sprint Status: `docs/sprint-status.yaml`
- CLAUDE.md: Project instructions and conventions

**External References:**
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [pytest Documentation](https://docs.pytest.org/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [AWS Bedrock Claude Guide](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-claude.html)

### 12.3 Traceability Matrix
**Requirements → Test Coverage:**

| Story | Requirement | Test Type | Test File | Status |
|-------|-------------|-----------|-----------|--------|
| 1.1 | Welcome screen renders | Unit | welcome.test.tsx | ✅ Exists |
| 1.1 | Navigation to 1.2 works | E2E | onboarding-flow.e2e.js | ⏸ Pending |
| 1.5 | Authentication signup | Integration | test_auth.py | ✅ Exists (48 RLS tests) |
| 1.6 | Name validation | Unit | onboardingValidation.test.ts | ⏸ Pending |
| 1.7 | Photo capture | Manual | manual-test-1.7.md | ⏸ Pending |
| 1.7 | Voice recording | Manual | manual-test-1.7.md | ⏸ Pending |
| 1.8 | AI goal breakdown | Integration | test_goal_breakdown.py | ⏸ Pending |
| 1.8 | Timeout handling | Unit | aiTimeout.test.ts | ⏸ Pending |
| All | Complete 1.1 → 1.11 | E2E | onboarding-flow.e2e.js | ⏸ Pending |

**Total:** 50 requirements, 25-30 test files estimated, ~30% coverage current

---

**Document Status:** DRAFT v1.0
**Review Status:** Pending Product Owner + QA Lead review
**Approvals:**
- [ ] Product Owner: ___________________ Date: ___________
- [ ] QA Lead: ___________________ Date: ___________
- [ ] Engineering Lead: ___________________ Date: ___________

**Change Log:**
- 2025-12-20: Initial draft created by TEA (Test Architect)
- Next review: 2025-12-22 (Product Owner + QA Lead)
