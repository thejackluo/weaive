# Personality System Conflict: Story 6.1 vs Story 6.2 (2025-12-23)

## Problem Summary

**Story 6.1** and **Story 6.2** implemented TWO DIFFERENT personality systems that are currently conflicting with each other. The app now has:

1. **Story 6.1**: Preset-based personality system (gen_z_default, supportive_coach, concise_mentor)
2. **Story 6.2**: Dynamic personality system (dream_self from identity_docs vs weave_ai default)

**Impact:** The backend is trying to use both systems simultaneously, causing conflicts in prompt generation. Frontend has two separate personality TypeScript types that don't align.

---

## Conflict Details

### Backend Conflicts

#### 1. ai_chat_router.py - Dual Prompt Building (Lines 298-311 vs 532-536)

**Story 6.2 Personality Injection** (lines 298-311):
```python
# Story 6.2: Get active personality
personality_type = "weave_ai"  # Default
personality_details = None
try:
    personality_service = PersonalityService(db)
    personality_details = await personality_service.get_active_personality(str(user_id))
    personality_type = personality_details.get('personality_type', 'weave_ai')
    logger.info(f"✅ [PERSONALITY] User {user_id} using personality: {personality_type}")
except Exception as e:
    logger.warning(f"⚠️  [PERSONALITY] Error getting personality for user {user_id}: {e}")

# Build context-aware prompt
system_prompt = (
    "You are Weave, a supportive AI coach helping users achieve their goals. "
    "Be encouraging, concise, and actionable. Focus on progress and accountability."
)

# Inject personality details if using Dream Self
if personality_type == "dream_self" and personality_details:
    system_prompt = (
        f"You are {personality_details.get('name', 'Weave')}, "
        f"a personalized AI coach with these traits: {', '.join(personality_details.get('traits', []))}. "
        f"Speaking style: {personality_details.get('speaking_style', 'Supportive and encouraging')}. "
        f"Help the user achieve their goals with personalized, actionable guidance."
    )

full_prompt = f"{system_prompt}\n\nUser: {request.message}"
```

**Story 6.1 Personality Config** (streaming endpoint, lines 532-536):
```python
# ✅ Build context-aware prompt using personality config
full_prompt = AIPersonalityConfig.build_context_prompt(
    user_message=request.message,
    personality=AIPersonalityConfig.PERSONALITY,
    user_context=None  # TODO: Load from Context Builder (Story 1.5.3)
)
```

**Problem:**
- Non-streaming endpoint uses Story 6.2 PersonalityService
- Streaming endpoint uses Story 6.1 AIPersonalityConfig
- **Different prompt generation = inconsistent AI responses!**

#### 2. Personality Types Don't Align

**Story 6.1 Types** (`ai_personality_config.py`):
```python
PersonalityPreset = Literal['gen_z_default', 'supportive_coach', 'concise_mentor', 'custom']
```

**Story 6.2 Types** (`personality_service.py`):
```python
# Returns: 'dream_self' or 'weave_ai'
```

**Problem:** No mapping between these type systems. They're incompatible.

---

### Frontend Conflicts

#### 1. Two Separate Personality TypeScript Types

**Story 6.1 Frontend** (`personalityContent.ts`):
```typescript
export type PersonalityType = 'supportive_direct' | 'tough_warm';

export const PERSONAS: PersonaContent[] = [
  {
    id: 'supportive_direct',
    title: 'Supportive but Direct',
    subtitle: 'grounded, honest, steady, confidence-building without coddling',
    exampleLines: [
      "You don't need motivation — just one clear step. Let's choose it.",
      "You're capable. More than you think. Let's act on it.",
      'If you slipped, just reset. One small restart changes everything.',
    ],
    caseSensitive: true,
  },
  {
    id: 'tough_warm',
    title: 'Tough but Warm',
    subtitle: 'Gen Z-coded, playful, dry humor, gently confrontational',
    exampleLines: [
      'alright, lock in. you said you wanted this.',
      'nice. that was actually clean. keep the pace.',
      "bro… where'd you go 💀 let's get back to it.",
    ],
    caseSensitive: false,
  },
];
```

**Story 6.2 Frontend** (`personalityApi.ts`):
```typescript
export type PersonalityType = 'dream_self' | 'weave_ai';

export interface PersonalityDetails {
  personality_type: PersonalityType;
  name: string;
  traits: string[];
  speaking_style: string;
}
```

**Problem:**
- Frontend has TWO different `PersonalityType` definitions (naming collision!)
- Story 6.1 uses fixed personas for onboarding (supportive_direct, tough_warm)
- Story 6.2 uses dynamic switching (dream_self, weave_ai)
- **No integration between these systems!**

---

## Root Cause Analysis

### Why This Happened

1. **Different Story Scopes:**
   - Story 6.1 focused on **AI chat UI** with preset coaching styles
   - Story 6.2 focused on **contextual AI** with Dream Self personalization

2. **Overlapping Responsibilities:**
   - Both stories touched personality configuration
   - Story 6.1 created `AIPersonalityConfig` for chat responses
   - Story 6.2 created `PersonalityService` for Dream Self switching
   - Neither story refactored the other's code

3. **Merge Conflicts Missed This:**
   - Git merge only had 3 conflicts (import statements, package-lock.json)
   - The personality files didn't conflict because they're in different locations
   - But they have **semantic conflicts** (incompatible designs)

---

## Solution: Unified Personality System

### Design Decision

**Approach:** Use Story 6.2 as the foundation (Dream Self + Weave AI), but integrate Story 6.1's preset styles as Weave AI variations.

**Rationale:**
- Story 6.2's Dream Self is the core product differentiator (personalized identity-driven AI)
- Story 6.1's presets are valuable for the default Weave AI experience
- Story 6.1's onboarding personas can map to initial Weave AI style preferences

### Proposed Architecture

```
User Profile
├── active_personality: 'dream_self' | 'weave_ai'  (Story 6.2)
└── weave_ai_preset: 'gen_z_default' | 'supportive_coach' | 'concise_mentor'  (Story 6.1)
    └── (Only used when active_personality = 'weave_ai')

Identity Docs (Dream Self)
└── json: { dream_self_name, personality_traits, speaking_style }
    └── (Only used when active_personality = 'dream_self')
```

**Prompt Building Logic:**
```python
if active_personality == 'dream_self':
    # Load from identity_docs (Story 6.2)
    personality = PersonalityService.get_dream_self(user_id)
    system_prompt = build_dream_self_prompt(personality)
else:
    # Use preset from AIPersonalityConfig (Story 6.1)
    preset = user.weave_ai_preset or 'gen_z_default'
    system_prompt = AIPersonalityConfig.get_system_prompt(preset)
```

### Frontend Integration

**Onboarding (Story 6.1):**
- User selects 'supportive_direct' or 'tough_warm'
- Maps to backend presets:
  - `supportive_direct` → `supportive_coach`
  - `tough_warm` → `gen_z_default`
- Stored in `user_profiles.weave_ai_preset`

**Settings (Story 6.2):**
- Toggle switch: Dream Self ↔ Weave AI
- If Weave AI selected, show dropdown for preset selection
- If Dream Self selected, show identity doc editor

---

## Implementation Plan

### Phase 1: Backend Unification (HIGH PRIORITY)

**Files to Modify:**
1. `weave-api/app/services/personality_service.py`
   - Add method to get Weave AI preset from AIPersonalityConfig
   - Update `get_active_personality()` to return both personality type AND preset

2. `weave-api/app/api/ai_chat_router.py`
   - Unify prompt building in both streaming and non-streaming endpoints
   - Use single source of truth: PersonalityService → AIPersonalityConfig

3. `supabase/migrations/new_migration.sql`
   - Add `weave_ai_preset` column to `user_profiles` table
   - Default: 'gen_z_default'

**Pseudocode:**
```python
# personality_service.py
async def get_active_personality(self, user_id: str) -> Dict:
    # Get user preference
    active_personality = user.active_personality  # 'dream_self' or 'weave_ai'

    if active_personality == 'dream_self':
        # Load from identity_docs
        dream_self = await self._load_dream_self(user_id)
        return {
            'personality_type': 'dream_self',
            'system_prompt': self._build_dream_self_prompt(dream_self),
            'name': dream_self['name'],
            'traits': dream_self['traits']
        }
    else:
        # Load Weave AI preset from AIPersonalityConfig
        preset = user.weave_ai_preset or 'gen_z_default'
        config = AIPersonalityConfig.PRESETS[preset]
        return {
            'personality_type': 'weave_ai',
            'system_prompt': config['system_prompt'],
            'preset': preset,
            'max_words': config['max_words']
        }
```

### Phase 2: Frontend Integration (MEDIUM PRIORITY)

**Files to Modify:**
1. `weave-mobile/src/constants/personalityContent.ts`
   - Rename TypeScript type to avoid collision: `OnboardingPersonaType`
   - Add mapping function to backend presets

2. `weave-mobile/src/services/personalityApi.ts`
   - Keep Story 6.2 types: `'dream_self' | 'weave_ai'`
   - Add endpoint for updating `weave_ai_preset`

3. New file: `weave-mobile/src/screens/PersonalitySettingsScreen.tsx`
   - Toggle: Dream Self ↔ Weave AI
   - Dropdown: Select Weave AI preset (if Weave AI active)

**Mapping:**
```typescript
// personalityContent.ts
export type OnboardingPersonaType = 'supportive_direct' | 'tough_warm';  // Renamed to avoid collision

export function mapOnboardingPersonaToPreset(persona: OnboardingPersonaType): string {
  const mapping = {
    'supportive_direct': 'supportive_coach',
    'tough_warm': 'gen_z_default',
  };
  return mapping[persona];
}
```

### Phase 3: Migration & Testing (HIGH PRIORITY)

1. **Database Migration:**
   - Add `weave_ai_preset` column with default 'gen_z_default'
   - Backfill existing users based on onboarding data (if available)

2. **End-to-End Tests:**
   - Test Dream Self personality loading
   - Test Weave AI preset switching
   - Test prompt consistency between streaming/non-streaming
   - Test frontend personality switcher

---

## Acceptance Criteria

### Backend Integration Complete When:
- [ ] Both streaming and non-streaming endpoints use PersonalityService
- [ ] PersonalityService integrates with AIPersonalityConfig for Weave AI presets
- [ ] Single source of truth for prompt building
- [ ] No hardcoded system prompts in chat router

### Frontend Integration Complete When:
- [ ] No TypeScript type collisions between personality systems
- [ ] Onboarding persona selection maps to backend presets
- [ ] Settings screen allows switching between Dream Self and Weave AI
- [ ] Settings screen allows selecting Weave AI preset

### Testing Complete When:
- [ ] All existing AI chat tests pass
- [ ] New tests for personality switching pass
- [ ] Manual testing confirms consistent AI responses
- [ ] No errors in logs related to personality loading

---

## Status

**Current State:** ⚠️  CONFLICTS IDENTIFIED - Implementation pending

**Bugs Fixed:**
- ✅ `personality_service.py` SQL bugs (type column, json column)

**Next Steps:**
1. Get user approval for unified architecture approach
2. Implement Phase 1 (Backend Unification)
3. Test migration and personality loading
4. Implement Phase 2 (Frontend Integration)

---

## Related Files

**Backend:**
- `weave-api/app/config/ai_personality_config.py` (Story 6.1 presets)
- `weave-api/app/services/personality_service.py` (Story 6.2 Dream Self)
- `weave-api/app/api/ai_chat_router.py` (Conflicting prompt building)

**Frontend:**
- `weave-mobile/src/constants/personalityContent.ts` (Story 6.1 onboarding)
- `weave-mobile/src/services/personalityApi.ts` (Story 6.2 API)

**Database:**
- `supabase/migrations/20251223000001_story_6_2_context_tracking.sql` (Story 6.2)
- Need new migration for `weave_ai_preset` column

---

## Prevention

**For Future Stories:**
1. **Search for overlapping concerns** before implementation
   - Run: `git grep "personality" "*.py" "*.ts"` to find existing code
2. **Refactor existing code** instead of creating parallel systems
3. **Update CLAUDE.md** with architectural decisions to prevent duplication
