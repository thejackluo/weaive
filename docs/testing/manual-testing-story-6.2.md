# Manual Testing Guide - Story 6.2: Contextual AI Responses

**Purpose:** Comprehensive guide to manually test contextual AI responses that reference user's actual data (goals, completions, journal entries, identity).

**Story:** 6.2 - Contextual AI Responses + AI Tool Use (Tech Context Engine)

---

## Prerequisites

### 1. Environment Setup

**Backend (Required):**
```bash
# Terminal 1: Start backend API
cd weave-api
uv run uvicorn app.main:app --reload

# Verify backend is running
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

**Mobile App (Partial - Personality Switcher Available):**
```bash
# Terminal 2: Start Expo dev server
cd weave-mobile
npm start
```

**⚠️ Note:** The AI Chat UI (Story 6.1) is still a placeholder. However, the **PersonalitySwitcher** component is implemented and can be tested in Settings or added to any screen.

### 2. Test User Setup

**You need a test user with:**
- ✅ At least 1-2 active goals
- ✅ Some completions in the last 7 days (with proof types: image, voice, note)
- ✅ 1-3 journal entries (with fulfillment scores)
- ✅ Dream Self identity document (optional - tests fallback if missing)

**Quick Setup Script:**
```bash
# Run test data setup (if available)
cd scripts
python setup-test-user-profile.py
```

---

## Test Scenarios

### Test 1: Context Building & Assembly Performance

**Goal:** Verify context is assembled correctly and quickly (<500ms).

**Steps:**
1. **Use Admin Context Preview Endpoint:**
   ```bash
   curl -H "X-Admin-Key: dev_admin_key" \
        http://localhost:8000/api/admin/context-preview/{your_user_id}
   ```

2. **Check Response Structure:**
   - ✅ `data.context.user_id` matches your user ID
   - ✅ `data.context.goals` array exists (should have your goals)
   - ✅ `data.context.recent_activity` object exists
   - ✅ `data.context.journal` array exists (last 3 entries)
   - ✅ `data.context.identity` object exists (Dream Self or default)
   - ✅ `data.context.metrics` object exists (streak, completion_rate)
   - ✅ `data.context.recent_wins` array exists

3. **Check Performance:**
   - ✅ `data.assembly_time_ms` is < 500ms (target performance)
   - ✅ If >500ms, check database indexes (should be optimized)

**Expected Context Structure:**
```json
{
  "data": {
    "context": {
      "user_id": "uuid",
      "goals": [
        {
          "id": "uuid",
          "title": "Build consistent workout habit",
          "active_binds": 3,
          "completion_rate": 0.85,
          "current_streak": 7
        }
      ],
      "recent_activity": {
        "completions_last_7_days": 12,
        "proof_types": ["image", "voice", "note"],
        "most_recent_completion": {
          "bind_title": "Morning workout",
          "completed_at": "2025-12-22T08:00:00Z",
          "proof_type": "image"
        }
      },
      "journal": [
        {
          "date": "2025-12-22",
          "fulfillment_score": 8,
          "entry_preview": "Great day! Completed all morning binds...",
          "ai_feedback_received": true
        }
      ],
      "identity": {
        "dream_self_name": "Alex the Disciplined",
        "archetype": "Builder",
        "personality_traits": ["supportive", "analytical"],
        "speaking_style": "Direct but encouraging"
      },
      "metrics": {
        "current_streak": 10,
        "longest_streak": 15,
        "overall_completion_rate": 0.78
      },
      "recent_wins": [
        "10-day streak achieved",
        "First goal completed: 'Morning routine'"
      ]
    },
    "assembly_time_ms": 287
  }
}
```

---

### Test 2: Contextual AI Responses (Personalized)

**Goal:** Verify AI responses reference your actual data (goal names, bind titles, streaks).

**Steps:**

1. **Send AI Message WITH Context:**
   ```bash
   curl -X POST http://localhost:8000/api/ai/generate \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer {your_jwt_token}" \
        -d '{
          "prompt": "How am I doing with my goals?",
          "module": "ai_chat_contextual",
          "model": "claude-3-7-sonnet-20250219",
          "include_context": true
        }'
   ```

2. **Check Response:**
   - ✅ `context_used: true` in response
   - ✅ `context_assembly_time_ms` is present and <500ms
   - ✅ AI response mentions your **specific goal names** (e.g., "Morning workout", "Evening meditation")
   - ✅ AI response mentions your **streak** (e.g., "You're on a 10-day streak!")
   - ✅ AI response mentions **recent completions** (e.g., "I see you completed your workout bind yesterday")
   - ✅ AI response is **NOT generic** (avoid phrases like "stay motivated" without specifics)

**Good Response Example:**
> "You're doing great! I see you've completed your 'Morning workout' bind 7 days in a row - that's a solid streak! Your completion rate of 85% on this goal shows real consistency. Keep building on this momentum."

**Bad Response (Too Generic):**
> "Stay motivated! You can do it! Keep going!" ❌

---

### Test 3: Generic Response Detection & Retry

**Goal:** Verify system detects generic responses and retries with stronger prompt.

**Steps:**

1. **Send a message that might trigger generic response:**
   ```bash
   curl -X POST http://localhost:8000/api/ai/generate \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer {your_jwt_token}" \
        -d '{
          "prompt": "I feel stuck",
          "module": "ai_chat_contextual",
          "include_context": true
        }'
   ```

2. **Check Response Quality:**
   - ✅ Response should reference your **specific data** (goal names, recent patterns)
   - ✅ If response is generic, check backend logs for retry attempt
   - ✅ Check `ai_runs` table: `quality_flag` should be 'specific' or 'excellent' (not 'generic')

**Database Check:**
```sql
SELECT quality_flag, context_used, context_assembly_time_ms
FROM ai_runs
WHERE user_id = '{your_user_id}'
ORDER BY created_at DESC
LIMIT 5;
```

---

### Test 4: Dream Self Personality Voice

**Goal:** Verify AI speaks in your Dream Self personality voice.

**Prerequisites:**
- You must have a Dream Self identity document in `identity_docs` table (type = 'dream_self')

**Steps:**

1. **Check Your Dream Self Document:**
   ```sql
   SELECT * FROM identity_docs
   WHERE user_id = '{your_user_id}' AND type = 'dream_self';
   ```

2. **Send AI Message:**
   ```bash
   curl -X POST http://localhost:8000/api/ai/generate \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer {your_jwt_token}" \
        -d '{
          "prompt": "Tell me about my progress",
          "module": "ai_chat_contextual",
          "include_context": true
        }'
   ```

3. **Check Response:**
   - ✅ AI should introduce itself as your Dream Self name (e.g., "I'm Alex the Disciplined")
   - ✅ Response tone matches your personality traits (e.g., "direct but encouraging" if that's your style)
   - ✅ Response uses your speaking style characteristics

**Fallback Test (No Dream Self Doc):**
- If you don't have a Dream Self doc, AI should use default coach persona
- Response should still be contextual (references your data) but with generic coach tone

---

### Test 5: Context Disabled (Testing Fallback)

**Goal:** Verify system works without context (fallback mode).

**Steps:**

1. **Send AI Message WITHOUT Context:**
   ```bash
   curl -X POST http://localhost:8000/api/ai/generate \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer {your_jwt_token}" \
        -d '{
          "prompt": "How can I stay motivated?",
          "module": "ai_chat_contextual",
          "include_context": false
        }'
   ```

2. **Check Response:**
   - ✅ `context_used: false` in response
   - ✅ `context_assembly_time_ms` is null or 0
   - ✅ AI response is generic (expected - no context available)
   - ✅ No errors (graceful fallback)

---

### Test 6: Context Building Failure (Error Handling)

**Goal:** Verify system handles context building failures gracefully.

**Steps:**

1. **Simulate Failure (Temporarily break database connection or use invalid user_id):**
   ```bash
   # Use non-existent user_id
   curl -H "X-Admin-Key: dev_admin_key" \
        http://localhost:8000/api/admin/context-preview/invalid_user_id
   ```

2. **Check Response:**
   - ✅ Returns 404 or 500 (expected for invalid user)
   - ✅ Error message is clear
   - ✅ Backend logs show warning (not crash)

3. **Test AI Generation with Failed Context:**
   - If context building fails, AI should still respond (without context)
   - Check logs for warning message about context failure

---

### Test 7: Performance Under Load

**Goal:** Verify context assembly stays under 500ms even with multiple requests.

**Steps:**

1. **Send 10 Rapid Requests:**
   ```bash
   for i in {1..10}; do
     curl -X POST http://localhost:8000/api/ai/generate \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer {your_jwt_token}" \
          -d '{
            "prompt": "Test message '$i'",
            "module": "ai_chat_contextual",
            "include_context": true
          }' &
   done
   wait
   ```

2. **Check Performance:**
   - ✅ All `context_assembly_time_ms` values are <500ms
   - ✅ P95 (95th percentile) should be <500ms
   - ✅ Check backend logs for any slow context builds (>500ms)

**Database Check:**
```sql
SELECT 
  AVG(context_assembly_time_ms) as avg_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY context_assembly_time_ms) as p95_ms,
  MAX(context_assembly_time_ms) as max_ms
FROM ai_runs
WHERE context_used = true
  AND created_at > NOW() - INTERVAL '1 hour';
```

---

### Test 8: Dual Personality Switching (If Implemented)

**Goal:** Verify switching between Dream Self and Weave AI personalities.

**Steps:**

1. **Check Current Personality:**
   ```sql
   SELECT active_personality FROM user_profiles WHERE id = '{your_user_id}';
   ```

2. **Switch to Dream Self:**
   ```bash
   curl -X PATCH http://localhost:8000/api/user/personality \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer {your_jwt_token}" \
        -d '{
          "active_personality": "dream_self"
        }'
   ```

3. **Send AI Message:**
   - ✅ AI should speak as your Dream Self (personalized, references your data)

4. **Switch to Weave AI:**
   ```bash
   curl -X PATCH http://localhost:8000/api/user/personality \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer {your_jwt_token}" \
        -d '{
          "active_personality": "weave_ai"
        }'
   ```

5. **Send AI Message:**
   - ✅ AI should speak as general coach (still contextual but different tone)

---

### Test 9: AI Tool Use (⚠️ NOT YET INTEGRATED)

**Status:** Tool infrastructure exists but **NOT integrated into AI service yet**

**What Exists:**
- ✅ `ToolRegistry` class (`weave-api/app/services/tools/tool_registry.py`)
- ✅ `ModifyPersonalityTool` (`weave-api/app/services/tools/modify_personality_tool.py`)
- ✅ Tool registration system
- ✅ Tool execution framework

**What's Missing:**
- ❌ Tool use NOT integrated into `AIService.generate()` method
- ❌ AI providers don't receive tool schemas
- ❌ Tool execution not triggered from AI responses
- ❌ No tool call detection/handling in AI service

**To Test Tool Use (When Implemented):**
1. AI service needs to pass tool schemas to providers (OpenAI/Anthropic)
2. AI service needs to detect `tool_calls` or `tool_use` in responses
3. AI service needs to execute tools via `ToolRegistry.execute_tool()`
4. AI service needs to send tool results back to AI for natural language wrapping

**Current Status:** Tool use is **planned** but **not yet functional**. The infrastructure is ready, but the integration into the AI service is pending.

---

### Test 10: Empty Context (New User)

**Goal:** Verify system handles users with no data gracefully.

**Steps:**

1. **Create New Test User** (or use user with no goals/completions/journal)

2. **Preview Context:**
   ```bash
   curl -H "X-Admin-Key: dev_admin_key" \
        http://localhost:8000/api/admin/context-preview/{new_user_id}
   ```

3. **Check Response:**
   - ✅ Context structure exists but arrays are empty:
     - `goals: []`
     - `recent_activity.completions_last_7_days: 0`
     - `journal: []`
   - ✅ `identity` should have default coach persona (no Dream Self doc)

4. **Send AI Message:**
   ```bash
   curl -X POST http://localhost:8000/api/ai/generate \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer {new_user_jwt_token}" \
        -d '{
          "prompt": "How can I get started?",
          "module": "ai_chat_contextual",
          "include_context": true
        }'
   ```

5. **Check Response:**
   - ✅ AI acknowledges user is new (no data yet)
   - ✅ AI provides onboarding guidance
   - ✅ No errors (graceful handling of empty context)

---

## Mobile App Testing (Partial Implementation)

### Test 11: Personality Switcher Component

**Status:** ✅ Component is implemented and ready to use

**Where to Test:**
- The `PersonalitySwitcher` component exists at `weave-mobile/src/components/PersonalitySwitcher.tsx`
- Can be added to Settings screen or any screen for testing
- See example usage in `PersonalitySwitcher.example.tsx`

**Steps:**

1. **Add PersonalitySwitcher to a Test Screen:**
   ```tsx
   // In any screen (e.g., Settings or a test screen)
   import { PersonalitySwitcher } from '@/components/PersonalitySwitcher';
   
   export default function TestScreen() {
     return (
       <View>
         <PersonalitySwitcher 
           onSwitch={(type) => console.log('Switched to:', type)} 
         />
       </View>
     );
   }
   ```

2. **Test Personality Switching:**
   - ✅ Tap "Dream Self" → Should switch to Dream Self personality
   - ✅ Tap "Weave AI" → Should switch to Weave AI personality
   - ✅ Loading indicator shows during switch
   - ✅ Toast notification confirms switch
   - ✅ API call to `PATCH /api/user/personality` succeeds

3. **Check Database:**
   ```sql
   SELECT active_personality FROM user_profiles WHERE id = '{your_user_id}';
   ```
   - ✅ Should update to 'dream_self' or 'weave_ai'

**Note:** The AI Chat UI (Story 6.1) is still a placeholder, so you can't test contextual responses in the mobile app yet. Use API testing (Test 2) for that.

### Test 12: AI Chat Interface (⚠️ NOT YET IMPLEMENTED)

**Status:** Story 6.1 (AI Chat Interface) is still a placeholder

**Current State:**
- `app/(tabs)/ai-chat.tsx` shows `PlaceholderScreen`
- Chat UI components not yet built
- Contextual responses can only be tested via API (Test 2)

**When Story 6.1 is Complete, You'll Be Able To:**
1. Open AI Chat tab in mobile app
2. Send messages and see contextual responses
3. See personality switcher in chat header
4. Test full user experience with personalized AI

---

## What to Look For

### ✅ Success Indicators

1. **Context Assembly:**
   - Context builds in <500ms
   - All required fields present (goals, activity, journal, identity, metrics)
   - Performance stays consistent under load

2. **Personalized Responses:**
   - AI mentions specific goal names (not generic "your goals")
   - AI references actual streak numbers
   - AI acknowledges recent completions
   - AI uses Dream Self personality voice (if available)

3. **Error Handling:**
   - Graceful fallback when context building fails
   - Clear error messages
   - System continues working without context

4. **Performance:**
   - P95 context assembly time <500ms
   - No N+1 query issues (check database logs)
   - Cache hit rate >50% for repeat users

### ❌ Failure Indicators

1. **Generic Responses:**
   - AI says "stay motivated" without specifics
   - AI doesn't mention goal names
   - AI doesn't reference streaks or completions

2. **Performance Issues:**
   - Context assembly >500ms consistently
   - Slow database queries (check indexes)
   - High latency on AI responses

3. **Errors:**
   - Context building crashes (should fallback gracefully)
   - Missing context fields
   - Database connection errors not handled

---

## Troubleshooting

### Context Building Slow (>500ms)

**Check:**
1. Database indexes:
   ```sql
   -- Verify indexes exist
   SELECT indexname, indexdef
   FROM pg_indexes
   WHERE tablename IN ('subtask_completions', 'journal_entries', 'goals')
   AND indexname LIKE '%user_recent%';
   ```

2. Query performance:
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM subtask_completions
   WHERE user_id = '{your_user_id}'
   AND completed_at > NOW() - INTERVAL '7 days'
   ORDER BY completed_at DESC;
   ```

**Fix:**
- Add missing indexes (see Story 6.2 migration)
- Optimize queries (use JOINs, avoid N+1)

### Generic Responses

**Check:**
1. Context preview endpoint - verify context has data
2. Backend logs - check if context is being injected
3. `ai_runs` table - check `quality_flag` column

**Fix:**
- Verify context building succeeds
- Check AI prompt template includes context
- Verify generic detection is working

### Dream Self Not Loading

**Check:**
```sql
SELECT * FROM identity_docs
WHERE user_id = '{your_user_id}' AND type = 'dream_self';
```

**Fix:**
- Create Dream Self document if missing
- Verify fallback to default coach persona works

---

## Quick Test Checklist

### Backend Tests (All Available)
- [ ] Context preview endpoint returns valid structure
- [ ] Context assembly time <500ms
- [ ] AI responses mention specific goal names
- [ ] AI responses reference actual streaks
- [ ] AI responses acknowledge recent completions
- [ ] Generic response detection works (retry triggered)
- [ ] Dream Self personality voice works (if doc exists)
- [ ] Fallback works when context disabled
- [ ] Error handling graceful (context building fails)
- [ ] Performance consistent under load
- [ ] Personality switching API works (`PATCH /api/user/personality`)
- [ ] Empty context handled gracefully

### Frontend Tests (Partial)
- [ ] PersonalitySwitcher component renders
- [ ] Personality switching works in UI
- [ ] Toast notifications show on switch
- [ ] Loading states work correctly
- [ ] Error handling displays properly

### Not Yet Available
- [ ] AI Chat UI (Story 6.1 placeholder)
- [ ] AI Tool Use (infrastructure exists, not integrated)

---

## Expected Test Duration

- **Quick Test (Core Features):** 15-20 minutes
- **Comprehensive Test (All Scenarios):** 45-60 minutes
- **Performance Testing:** 30 minutes

---

## Next Steps After Testing

1. **If All Tests Pass:** Story 6.2 is ready for code review
2. **If Issues Found:** Document bugs and create follow-up tasks
3. **Performance Issues:** Optimize queries, add indexes, check caching

