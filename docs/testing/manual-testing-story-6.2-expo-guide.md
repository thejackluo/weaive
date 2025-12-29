# Manual Testing Guide: Story 6.2 on Expo App

**Status:** ✅ All UI screens implemented and ready for testing
**Branch:** `story/6.2`
**Last Updated:** 2025-12-23

---

## 🚀 Quick Start

### 1. Start Backend API

```bash
cd weave-api
uv run uvicorn app.main:app --reload
# API running at http://localhost:8000
```

### 2. Start Expo App

```bash
cd weave-mobile
npm start
# Press 'i' for iOS simulator, 'a' for Android emulator
```

### 3. Open Personality Settings

1. **Login** to the app
2. **Tap Settings tab** (bottom navigation)
3. **Tap "🤖 Personality & Coaching Style"**

You should now see the **Personality Settings screen** with:
- Toggle between Dream Self and Weave AI
- Three Weave AI presets (when Weave AI is active)

---

## 📱 Test Scenarios

### **Test 1: Switch to Dream Self**

**Objective:** Verify personality switching from Weave AI → Dream Self

**Steps:**
1. On Personality Settings screen, tap **"Dream Self"** card
2. Wait for loading spinner
3. Check for success alert: "Switched to Dream Self"
4. Verify **blue checkmark (✓)** appears next to Dream Self
5. Verify **active personality details** shown below Dream Self card:
   - Name (e.g., "Alex the Disciplined")
   - Speaking style (e.g., "Direct but encouraging")

**Expected Behavior:**
- ✅ Loading indicator appears
- ✅ Success alert shown
- ✅ Blue checkmark moves to Dream Self
- ✅ Personality details displayed
- ✅ Weave AI preset selector disappears

**Backend Verification:**
```bash
# Check database was updated
cd weave-api
uv run python -c "
from supabase import create_client, Client
import os
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
result = supabase.table('user_profiles').select('active_personality, weave_ai_preset').eq('id', 'YOUR_USER_ID').execute()
print(result.data)
# Expected: [{'active_personality': 'dream_self', 'weave_ai_preset': 'gen_z_default'}]
"
```

---

### **Test 2: Switch to Weave AI**

**Objective:** Verify personality switching from Dream Self → Weave AI

**Steps:**
1. On Personality Settings screen, tap **"Weave AI"** card
2. Wait for loading spinner
3. Check for success alert: "Switched to Weave AI"
4. Verify **blue checkmark (✓)** appears next to Weave AI
5. Verify **Weave AI Coaching Style section** appears below

**Expected Behavior:**
- ✅ Loading indicator appears
- ✅ Success alert shown
- ✅ Blue checkmark moves to Weave AI
- ✅ Dream Self details disappear
- ✅ Weave AI preset selector appears (3 options visible)

---

### **Test 3: Change Weave AI Preset (Gen Z Default)**

**Objective:** Test preset switching functionality

**Pre-requisite:** Weave AI must be active (see Test 2)

**Steps:**
1. In "Weave AI Coaching Style" section, tap **"Gen Z Default (Short & Warm)"**
2. Wait for loading spinner
3. Check for success alert: "Updated to Gen Z Default (Short & Warm)"
4. Verify **blue checkmark (✓)** appears next to Gen Z Default

**Expected Behavior:**
- ✅ Loading indicator appears
- ✅ Success alert shown
- ✅ Blue checkmark moves to selected preset
- ✅ Backend API called: `PATCH /api/user/personality/preset`

**Backend Verification:**
```bash
# Check database was updated
uv run python -c "
from supabase import create_client, Client
import os
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
result = supabase.table('user_profiles').select('active_personality, weave_ai_preset').eq('id', 'YOUR_USER_ID').execute()
print(result.data)
# Expected: [{'active_personality': 'weave_ai', 'weave_ai_preset': 'gen_z_default'}]
"
```

---

### **Test 4: Change Weave AI Preset (Supportive Coach)**

**Steps:**
1. Tap **"Supportive Coach (Encouraging)"**
2. Wait for loading spinner
3. Check for success alert: "Updated to Supportive Coach (Encouraging)"
4. Verify **blue checkmark (✓)** moves to Supportive Coach

**Backend Verification:**
```bash
# Expected weave_ai_preset: 'supportive_coach'
```

---

### **Test 5: Change Weave AI Preset (Concise Mentor)**

**Steps:**
1. Tap **"Concise Mentor (Ultra-Brief)"**
2. Wait for loading spinner
3. Check for success alert: "Updated to Concise Mentor (Ultra-Brief)"
4. Verify **blue checkmark (✓)** moves to Concise Mentor

**Backend Verification:**
```bash
# Expected weave_ai_preset: 'concise_mentor'
```

---

### **Test 6: Error Handling (No Auth)**

**Objective:** Verify graceful error handling when not authenticated

**Steps:**
1. Log out of the app
2. Navigate to Settings → Personality
3. Try to switch personality or preset

**Expected Behavior:**
- ✅ Error alert shown: "Authentication required"
- ❌ No backend API call made
- ❌ UI state does not change

---

### **Test 7: Backend API Call Verification**

**Objective:** Verify correct API endpoints are being called

**Steps:**
1. Open backend API logs: `cd weave-api && uv run uvicorn app.main:app --reload`
2. In Expo app, switch from Weave AI → Dream Self
3. Check API logs for:
   ```
   INFO:     127.0.0.1:xxxxx - "PATCH /api/user/personality HTTP/1.1" 200 OK
   ✅ User user_123 switched to personality: dream_self
   ```

4. Switch preset to Supportive Coach
5. Check API logs for:
   ```
   INFO:     127.0.0.1:xxxxx - "PATCH /api/user/personality/preset HTTP/1.1" 200 OK
   ✅ User user_123 updated Weave AI preset to: supportive_coach
   ```

**Expected Log Patterns:**
- `PATCH /api/user/personality` → personality switching
- `PATCH /api/user/personality/preset` → preset updates
- `200 OK` status codes
- Success log messages with user ID

---

### **Test 8: Database State Verification**

**Objective:** Confirm database is correctly updated

**Setup:** Install Supabase CLI or use Supabase Dashboard

**Query 1: Check active personality**
```sql
SELECT id, active_personality, weave_ai_preset, updated_at
FROM user_profiles
WHERE id = 'YOUR_USER_ID';
```

**Expected After Dream Self Switch:**
```
| active_personality | weave_ai_preset | updated_at              |
|--------------------|-----------------|-------------------------|
| dream_self         | gen_z_default   | 2025-12-23 10:15:30+00 |
```

**Expected After Weave AI + Supportive Coach:**
```
| active_personality | weave_ai_preset   | updated_at              |
|--------------------|-------------------|-------------------------|
| weave_ai           | supportive_coach  | 2025-12-23 10:16:45+00 |
```

**Query 2: Check migration applied**
```sql
-- Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name IN ('active_personality', 'weave_ai_preset');
```

**Expected:**
```
| column_name        | data_type        |
|--------------------|------------------|
| active_personality | text             |
| weave_ai_preset    | text             |
```

---

### **Test 9: Personality Reflects in AI Chat (Context-Enriched)**

**Objective:** Verify personality changes affect AI responses

**⚠️ Note:** This requires an AI chat screen with context enrichment. If not yet implemented, skip to Test 10.

**Steps:**
1. Set personality to **Dream Self**
2. Navigate to AI Chat screen
3. Send message: "What should I focus on today?"
4. Observe response tone and style
5. Go back to Settings → Personality
6. Switch to **Weave AI** with **Gen Z Default** preset
7. Return to AI Chat
8. Send same message: "What should I focus on today?"
9. Compare response style

**Expected Behavior:**
- Dream Self: Personalized, uses user's identity traits, speaks as "ideal self"
- Weave AI (Gen Z): Short, warm, casual, text-message style (~60 words max)
- Weave AI (Supportive): Encouraging, accountability-focused (~80 words max)
- Weave AI (Concise): Ultra-brief, action-oriented (~40 words max)

---

### **Test 10: UI Responsiveness**

**Objective:** Test loading states and disabled interactions

**Steps:**
1. On Personality Settings screen, tap **Dream Self**
2. **While loading spinner is visible**, try to tap:
   - Weave AI card (should be disabled)
   - Gen Z Default preset (should be disabled)
   - Back button (should work)

**Expected Behavior:**
- ✅ All personality/preset buttons **disabled during loading**
- ✅ Loading spinner visible
- ✅ Back button still functional
- ✅ No crashes or race conditions

---

### **Test 11: Network Error Handling**

**Objective:** Verify graceful error handling when backend is down

**Steps:**
1. **Stop backend API** (kill uvicorn process)
2. In Expo app, try to switch personality
3. Check for error alert

**Expected Behavior:**
- ✅ Error alert shown with descriptive message
- ✅ UI state does NOT change
- ✅ Previous personality selection remains active
- ❌ No app crash

**Start backend again and retry:**
```bash
cd weave-api
uv run uvicorn app.main:app --reload
```

---

## 🔍 Debugging Tips

### **Issue: "Authentication required" error**

**Solution:**
1. Verify user is logged in: Check `useAuth()` hook returns valid `session.access_token`
2. Check JWT token validity: Token may have expired
3. Re-login to the app

### **Issue: "Failed to switch personality" error**

**Debug Steps:**
1. Check backend API logs for error details
2. Verify backend is running: `curl http://localhost:8000/health`
3. Check Supabase connection: Ensure `SUPABASE_URL` and `SUPABASE_KEY` env vars set
4. Check user_profiles table exists and has required columns

### **Issue: Loading spinner never disappears**

**Debug Steps:**
1. Check browser/Expo console for JavaScript errors
2. Check if API request completed (Network tab)
3. Verify error handling in `personalityApi.ts` and `personality.tsx`
4. Add console.logs to trace request flow

### **Issue: Database not updating**

**Debug Steps:**
1. Check backend API logs for database errors
2. Verify migration applied: `npx supabase db push` (if using local)
3. Check RLS policies allow UPDATE on user_profiles
4. Verify user_id mapping (auth_user_id → user_profiles.id)

---

## 📊 Success Criteria Checklist

**Personality Switching:**
- [ ] Switch from Weave AI → Dream Self works
- [ ] Switch from Dream Self → Weave AI works
- [ ] UI updates immediately (checkmark moves)
- [ ] Success alerts shown
- [ ] Database updated correctly
- [ ] Backend logs show correct endpoints

**Preset Switching:**
- [ ] Gen Z Default preset selectable
- [ ] Supportive Coach preset selectable
- [ ] Concise Mentor preset selectable
- [ ] Preset changes persist in database
- [ ] Preset selector only visible when Weave AI active

**Error Handling:**
- [ ] Graceful error when not authenticated
- [ ] Graceful error when backend down
- [ ] No app crashes
- [ ] Loading states work correctly
- [ ] Buttons disabled during loading

**Data Persistence:**
- [ ] Personality choice persists across app restarts
- [ ] Preset choice persists across app restarts
- [ ] Database queries return correct values

---

## 🎯 Advanced Testing (Optional)

### **Test with Real AI Chat Integration**

If you have AI chat implemented:

1. **Test Gen Z Preset:**
   - Switch to Weave AI + Gen Z Default
   - Send chat message
   - Verify response is ~60 words, casual tone

2. **Test Supportive Coach:**
   - Switch to Supportive Coach preset
   - Send chat message
   - Verify response is ~80 words, encouraging tone

3. **Test Concise Mentor:**
   - Switch to Concise Mentor preset
   - Send chat message
   - Verify response is ~40 words, direct tone

4. **Test Dream Self:**
   - Switch to Dream Self
   - Send chat message
   - Verify response uses identity document traits

### **Test Context Enrichment**

Check backend logs for context assembly:
```
✅ User user_123 switched to personality: dream_self
📊 Found 12 days of data for user stats
✅ Context built in 350ms for user user_123
```

---

## 📸 Screenshots (Optional)

Take screenshots of:
1. Settings main screen (with Personality link)
2. Personality Settings screen (Weave AI active)
3. Personality Settings screen (Dream Self active)
4. Personality Settings screen (Gen Z preset selected)
5. Personality Settings screen (Supportive Coach preset selected)
6. Success alert after switch
7. Error alert (simulated error)

---

## ✅ Final Verification

Run through **all 11 test scenarios** above and verify:
- ✅ All API endpoints work (`PATCH /api/user/personality`, `PATCH /api/user/personality/preset`)
- ✅ Database updates correctly
- ✅ UI reflects changes immediately
- ✅ Error handling works gracefully
- ✅ Loading states prevent race conditions
- ✅ No console errors or warnings
- ✅ Backend logs show success messages

**When all tests pass:** Story 6.2 is ready for production! 🎉
