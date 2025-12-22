# Story 6.1: AI Chat Interface with Server-Initiated Conversations

Status: ready-for-dev

## Story

As a user,
I want to talk to my AI coach anytime AND have Weave proactively reach out to me,
so that I can get personalized guidance when I need it and stay accountable through strategic check-ins.

## Acceptance Criteria

### Frontend (Mobile)

1. **Chat Interface UI**
   - [ ] Implement full chat interface replacing PlaceholderScreen at `app/(tabs)/ai-chat.tsx`
   - [ ] Message bubbles: User messages (right-aligned, blue), Weave messages (left-aligned, purple gradient)
   - [ ] Weave ALWAYS initiates conversation (no blank chat state)
   - [ ] Initial greeting based on user context: time of day, recent activity, pending binds
   - [ ] Streaming response animation with typing indicator (3 animated dots)
   - [ ] Auto-scroll to bottom on new messages
   - [ ] Keyboard avoidance (messages scroll above keyboard)

2. **Quick Action Chips**
   - [ ] Fixed chip row above text input:
     - "Plan my day" → Triggers Triad generation workflow
     - "I'm stuck" → Opens problem-solving conversation
     - "Edit my goal" → Direct link to goals management
     - "Explain this bind" → Context-aware bind clarification
   - [ ] Chips are tappable, send predefined prompt to AI
   - [ ] Chips disappear when user starts typing custom message

3. **Message Input**
   - [ ] Text input with placeholder: "Talk to Weave..."
   - [ ] Send button (disabled when empty, enabled when text present)
   - [ ] Character limit: 500 characters (show counter at 400+)
   - [ ] Submit on Enter (mobile keyboard "Send" button)

4. **Rate Limiting UI**
   - [ ] Show usage indicator: "3/10 messages used today"
   - [ ] When limit reached: Show friendly message "You've used all 10 messages today. Resets at midnight."
   - [ ] Disable text input and chips when rate limited
   - [ ] Countdown timer to midnight reset

5. **Server-Initiated Conversation Notifications**
   - [ ] When Weave initiates conversation: Show push notification
   - [ ] Notification opens ai-chat screen with new conversation thread
   - [ ] Visual indicator on Thread tab: Unread message badge on AI button
   - [ ] In-chat UI: Server-initiated messages have special indicator (e.g., "✨ Weave checked in")

### Backend (API)

6. **Chat API Endpoints**
   - [ ] `POST /api/ai-chat/messages` - Send user message, get AI response
     - Request: `{ message: string, conversation_id?: uuid }`
     - Response: `{ data: { message_id: uuid, response: string, conversation_id: uuid, tokens_used: int } }`
     - Uses Dream Self Advisor AI module
     - Streams response chunks (SSE or WebSocket)
   - [ ] `GET /api/ai-chat/conversations` - List user's conversation history
     - Response: `{ data: [{ id: uuid, started_at: timestamp, last_message_preview: string }] }`
   - [ ] `GET /api/ai-chat/conversations/{conversation_id}` - Get full conversation thread
     - Response: `{ data: { messages: [{role: 'user'|'assistant', content: string, timestamp: string}] } }`

7. **Rate Limiting (Tiered System)**
   - [ ] Check AI message counts before processing (separate premium vs free model tracking)
   - [ ] Free tier daily limits:
     - 10 premium messages/day (Claude Sonnet 3.7)
     - 40 free messages/day (Claude Haiku, GPT-4o-mini)
     - Total: 50 messages/day
   - [ ] Free tier monthly cap: 500 messages/month (resets on 1st of month)
   - [ ] Pro tier: 2,500-5,000 messages/month (5-10x free tier)
   - [ ] Admin tier: Unlimited (bypass via X-Admin-Key header)
   - [ ] Track in user_profiles:
     - `ai_premium_messages_today` (INT) - Premium model uses today
     - `ai_free_messages_today` (INT) - Free model uses today
     - `ai_messages_this_month` (INT) - Total messages this month
     - `ai_messages_month_reset` (DATE) - Last monthly reset date
   - [ ] Reset daily counters at midnight user's timezone
   - [ ] Reset monthly counter on 1st of each month
   - [ ] Return HTTP 429 when limit exceeded with specific message:
     - Daily premium limit: "You've used 10 premium messages today. Resets at midnight."
     - Daily free limit: "You've used 40 free messages today. Resets at midnight."
     - Monthly limit: "You've used 500 messages this month. Resets on [date]."
   - [ ] Error code: `RATE_LIMIT_EXCEEDED`
   - [ ] Note: This applies to ALL AI services (chat, Triad, journal feedback, etc.)

8. **Server-Initiated Check-Ins (Hybrid Timing System)**
   - [ ] Create `CheckInSchedulerService` in `weave-api/app/services/checkin_scheduler.py`
   - [ ] Cron job runs every 5 minutes (using APScheduler)
   - [ ] For each user with `checkin_enabled = true`:
     - Generate base check-in time (9 AM - 9 PM in user's timezone)
     - Seed random with `{user_id}_{date}` for base time consistency
     - If `checkin_deterministic = false` (default):
       - Add 10-15 minute random variation to base time
       - Example: Base 2:47 PM → Actual 2:52 PM, 2:59 PM, 3:01 PM
     - If `checkin_deterministic = true` (user setting):
       - Use exact same time every day (no variation)
       - Example: Always 2:47 PM exactly
     - Send check-in when current time matches calculated time
   - [ ] Create system-initiated conversation in `ai_chat_conversations` table
   - [ ] Send push notification via Expo Push API
   - [ ] Contextual message based on time of day and recent activity
   - [ ] Log check-in in `ai_runs` table (operation_type: 'checkin_initiated')
   - [ ] Store last check-in time in user_profiles for debugging
   - [ ] Note: Simplified to 1x/day (can expand to multiple check-ins in future)

9. **Admin/Dev Testing Mode**
   - [ ] Add middleware: If request includes `X-Admin-Key: {secret_key}`, bypass ALL rate limits
   - [ ] Environment variable: `ADMIN_API_KEY` (generate secure key, store in .env)
   - [ ] Log all admin-bypassed requests for audit trail
   - [ ] Add endpoint: `POST /api/admin/trigger-checkin/{user_id}` - Manually trigger check-in for testing

### Database Schema

10. **New Tables**

```sql
-- Conversation threads
CREATE TABLE ai_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  initiated_by TEXT CHECK (initiated_by IN ('user', 'system')), -- Track if user or server started
  conversation_context JSONB, -- Store context like active goals, recent completions
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- Individual messages
CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_chat_conversations(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INT, -- For cost tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- User check-in preferences (HYBRID TIMING SYSTEM)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS checkin_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS checkin_timezone TEXT DEFAULT 'America/Los_Angeles'; -- IANA timezone
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS checkin_deterministic BOOLEAN DEFAULT false; -- If true, exact same time daily; if false, 10-15 min variation
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_checkin_at TIMESTAMP WITH TIME ZONE; -- For debugging

-- Track AI message usage (TIERED SYSTEM - applies to ALL AI services)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ai_premium_messages_today INT DEFAULT 0; -- Claude Sonnet uses today
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ai_free_messages_today INT DEFAULT 0; -- Haiku/Mini uses today
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ai_messages_this_month INT DEFAULT 0; -- Total messages this month
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ai_messages_month_reset DATE DEFAULT CURRENT_DATE; -- Last monthly reset date
```

11. **Indexes**
```sql
CREATE INDEX idx_ai_chat_conversations_user ON ai_chat_conversations(user_id, last_message_at DESC);
CREATE INDEX idx_ai_chat_messages_conversation ON ai_chat_messages(conversation_id, created_at ASC);
```

### Testing

12. **Frontend Tests**
   - [ ] Test: Chat UI renders with initial greeting
   - [ ] Test: Quick chips trigger correct prompts
   - [ ] Test: Message input submits and displays user message
   - [ ] Test: Streaming response displays with typing indicator
   - [ ] Test: Rate limit UI shows correctly when 10/10 messages used
   - [ ] Test: Server-initiated notification opens chat with correct context

13. **Backend Tests**
   - [ ] Test: `POST /api/ai-chat/messages` returns valid AI response using existing AIService
   - [ ] Test: Rate limiting enforces 50 messages total for free users
   - [ ] Test: Paid users have unlimited messages
   - [ ] Test: Admin key bypasses rate limits
   - [ ] Test: Check-in scheduler creates conversations at correct random times
   - [ ] Test: Check-in respects user timezone (9 AM PST != 9 AM EST)
   - [ ] Test: Check-in respects user preference (checkin_enabled = false → no notifications)
   - [ ] Test: Conversation context includes recent goals and completions
   - [ ] Test: AIService fallback chain works (Sonnet → Haiku → Mini)
   - [ ] Test: Caching works (same prompt within 24h = instant response)

14. **World-Class UX Polish**
   - [ ] Message animations: Spring physics for send/receive (react-native-reanimated)
   - [ ] Typing indicator: Bouncing dots with stagger delay
   - [ ] Haptic feedback: Medium impact on send button press
   - [ ] Glassmorphism: Message bubbles match ai-chat overlay blur effect
   - [ ] Micro-interactions:
     - Send button scale animation (0.95) on press
     - Quick chips hover/press states with opacity change
     - Smooth scroll to bottom on new message
   - [ ] Keyboard handling: Smooth KeyboardAvoidingView transitions
   - [ ] Message timestamps: Show on long-press
   - [ ] Copy message: Long-press gesture
   - [ ] Polish: Loading skeleton for message history
   - [ ] Reference: iOS Messages, Telegram, Intercom for UX inspiration

## Tasks / Subtasks

- [ ] Task 1: Frontend Chat UI (AC: #1, #2, #3, #4)
  - [ ] 1.1: Replace PlaceholderScreen with ChatScreen component
  - [ ] 1.2: Implement message list with ScrollView and auto-scroll
  - [ ] 1.3: Create MessageBubble component (user vs assistant styling)
  - [ ] 1.4: Add streaming typing indicator animation
  - [ ] 1.5: Implement initial greeting logic (context-aware)
  - [ ] 1.6: Style with glassmorphism pattern (match ai-chat overlay from architecture)

- [ ] Task 2: Quick Action Chips (AC: #2)
  - [ ] 2.1: Create QuickActionChips component
  - [ ] 2.2: Wire up chip actions to send prompts
  - [ ] 2.3: Hide chips when user starts typing

- [ ] Task 3: Message Input & Submission (AC: #3)
  - [ ] 3.1: Create MessageInput component with TextInput
  - [ ] 3.2: Add send button with enabled/disabled state
  - [ ] 3.3: Implement character limit (500 chars, show counter at 400+)
  - [ ] 3.4: Handle keyboard avoidance (KeyboardAvoidingView)

- [ ] Task 4: Rate Limiting UI (AC: #4)
  - [ ] 4.1: Create RateLimitIndicator component
  - [ ] 4.2: Fetch usage from API (GET /api/ai-chat/usage)
  - [ ] 4.3: Show countdown timer when rate limited
  - [ ] 4.4: Disable input when limit reached

- [ ] Task 5: Server-Initiated Notifications (AC: #5)
  - [ ] 5.1: Add push notification handler for check-in events
  - [ ] 5.2: Add unread badge to AI button in tab bar
  - [ ] 5.3: Add "✨ Weave checked in" indicator for system-initiated messages

- [ ] Task 6: Backend Chat API (AC: #6)
  - [ ] 6.1: Create `/api/ai-chat/messages` endpoint with FastAPI
  - [ ] 6.2: **Use existing AIService** from `app.services.ai` (DO NOT create new service)
    - Import: `from app.services.ai import AIService`
    - Use existing fallback chain: Sonnet → Haiku → GPT-4o-mini → Deterministic
    - Leverage existing 24-hour caching with input_hash
    - Existing rate limiter already supports role-based limits
  - [ ] 6.3: Implement streaming response (SSE or chunked HTTP)
  - [ ] 6.4: Create conversation history endpoints (GET /conversations, GET /conversations/{id})
  - [ ] 6.5: Add Pydantic models: `ChatMessageCreate`, `ChatMessageResponse`, `ConversationResponse`

- [ ] Task 7: Rate Limiting Backend - Tiered System (AC: #7)
  - [ ] 7.1: Before processing AI request, check model type and corresponding limit:
    - If premium model (Claude Sonnet): Check `ai_premium_messages_today` < 10
    - If free model (Haiku/Mini): Check `ai_free_messages_today` < 40
    - Check monthly total: `ai_messages_this_month` < monthly_limit
  - [ ] 7.2: Implement tier-based monthly limits:
    - Free tier: 500 messages/month
    - Pro tier: 2,500-5,000 messages/month (5-10x free)
    - Admin tier: Unlimited (bypass via X-Admin-Key)
  - [ ] 7.3: After successful AI response, increment appropriate counters:
    - Premium model: `ai_premium_messages_today += 1`
    - Free model: `ai_free_messages_today += 1`
    - Both: `ai_messages_this_month += 1`
  - [ ] 7.4: Reset daily counters at midnight user's timezone
  - [ ] 7.5: Reset monthly counter on 1st of month (check `ai_messages_month_reset`)
  - [ ] 7.6: Return HTTP 429 with specific error messages (see AC #7)
  - [ ] 7.7: Add usage endpoint: `GET /api/ai/usage` returns:
    ```json
    {
      "premium_today": { "used": 5, "limit": 10 },
      "free_today": { "used": 20, "limit": 40 },
      "monthly": { "used": 150, "limit": 500 },
      "tier": "free" | "pro" | "admin"
    }
    ```
  - [ ] 7.8: Note: This rate limiting applies to ALL AI services (chat, Triad, journal, etc.)

- [ ] Task 8: Admin/Dev Testing Mode (AC: #9)
  - [ ] 8.1: Add middleware to check `X-Admin-Key` header
  - [ ] 8.2: Generate and store `ADMIN_API_KEY` in .env
  - [ ] 8.3: Add manual trigger endpoint: `POST /api/admin/trigger-checkin/{user_id}`
  - [ ] 8.4: Log all admin-bypassed requests

- [ ] Task 9: Check-In Scheduler Service - Hybrid Timing (AC: #8)
  - [ ] 9.1: Create `CheckInSchedulerService` class
  - [ ] 9.2: Install and configure APScheduler (cron job every 5 minutes)
  - [ ] 9.3: Implement timing logic for each user:
    - Generate base check-in time (9 AM - 9 PM, seeded by user_id + date)
    - If `checkin_deterministic = false`:
      - Add random 10-15 minute variation to base time
      - Seed variation with `{user_id}_{date}_{hour}` for consistency within day
    - If `checkin_deterministic = true`:
      - Use exact base time with no variation
  - [ ] 9.4: Check if current time matches calculated check-in time (±2 min window)
  - [ ] 9.5: For each user with `checkin_enabled = true` and matching time:
    - Generate contextual check-in message based on time + recent activity
    - Create system-initiated conversation in `ai_chat_conversations`
    - Send push notification via Expo Push API
    - Update `last_checkin_at` in user_profiles
    - Log check-in to `ai_runs` table (operation_type: 'checkin_initiated')
  - [ ] 9.6: Handle timezone conversions using pytz
  - [ ] 9.7: Add debugging logs for check-in calculations

- [ ] Task 10: Database Schema (AC: #10, #11)
  - [ ] 10.1: Create migration: `ai_chat_conversations` table
  - [ ] 10.2: Create migration: `ai_chat_messages` table
  - [ ] 10.3: Add columns to `user_profiles`: `checkin_preference`, `checkin_timezone`
  - [ ] 10.4: Create indexes for performance
  - [ ] 10.5: Apply migrations via `npx supabase db push`

- [ ] Task 11: Frontend Tests (AC: #12)
  - [ ] 11.1: Test chat UI rendering
  - [ ] 11.2: Test quick chips
  - [ ] 11.3: Test message submission
  - [ ] 11.4: Test rate limit UI

- [ ] Task 12: Backend Tests (AC: #13)
  - [ ] 12.1: Test chat API endpoints use existing AIService
  - [ ] 12.2: Test rate limiting (50 messages for free, unlimited for paid)
  - [ ] 12.3: Test admin bypass with X-Admin-Key
  - [ ] 12.4: Test check-in scheduler logic (random times, timezone-aware)
  - [ ] 12.5: Test AIService fallback chain (Sonnet → Haiku → Mini)
  - [ ] 12.6: Test caching (duplicate prompts = instant response)

- [ ] Task 13: UX Polish & Animations (AC: #14)
  - [ ] 13.1: Implement message send/receive animations (spring physics)
  - [ ] 13.2: Create typing indicator with bouncing dots
  - [ ] 13.3: Add haptic feedback (Expo Haptics)
  - [ ] 13.4: Apply glassmorphism to message bubbles
  - [ ] 13.5: Implement send button scale animation
  - [ ] 13.6: Add quick chips hover/press states
  - [ ] 13.7: Smooth keyboard transitions
  - [ ] 13.8: Add message timestamps (long-press)
  - [ ] 13.9: Implement copy message (long-press)
  - [ ] 13.10: Create loading skeleton for message history

## Dev Notes

### Architecture Patterns

**Story 1.5.3 Compliance (AI Services Standardization):**
- ⚠️ **CRITICAL:** Use existing `AIService` from `app.services.ai` - DO NOT create new service
- Existing infrastructure includes: Bedrock, OpenAI, Anthropic, Deterministic providers
- Model flexibility: Strong (Sonnet) vs Weak (Haiku/Mini) models supported
- Fallback chain: Claude 3.7 Sonnet → Claude 3.5 Haiku → GPT-4o-mini → Deterministic
- 24-hour caching with input_hash (already built-in, automatic)
- Rate limiting: Chat-specific limits (50 messages for free) separate from general AI usage
- Log ALL AI calls to `ai_runs` table (existing feature)
- Use `useAIChat()` React hook pattern for frontend

**Story 1.5.2 Compliance (Backend Standardization):**
- API endpoints: RESTful naming (`POST /api/ai-chat/messages`)
- Pydantic models: `ChatMessageCreate`, `ChatMessageResponse`
- Error handling: Standard error codes (`RATE_LIMIT_EXCEEDED`, `VALIDATION_ERROR`)
- Database: `snake_case` columns, soft delete with `deleted_at`
- Testing: Pytest fixtures in `tests/test_ai_chat_api.py`

**Story 1.5.1 Compliance (Navigation Standardization):**
- Screen: `app/(tabs)/ai-chat.tsx` (already exists as placeholder)
- Use design system components from `@/design-system`
- State management: TanStack Query for chat history (NOT Zustand)
- Navigation: Accessed via center AI button (glassmorphism overlay)

### Project Structure Notes

**New Files to Create:**

Frontend:
- `weave-mobile/app/(tabs)/ai-chat.tsx` (replace placeholder)
- `weave-mobile/src/components/features/ai-chat/ChatScreen.tsx`
- `weave-mobile/src/components/features/ai-chat/MessageBubble.tsx`
- `weave-mobile/src/components/features/ai-chat/QuickActionChips.tsx`
- `weave-mobile/src/components/features/ai-chat/MessageInput.tsx`
- `weave-mobile/src/components/features/ai-chat/RateLimitIndicator.tsx`
- `weave-mobile/src/hooks/useAIChat.ts` (React hook for chat API)
- `weave-mobile/src/services/aiChatService.ts` (API client)

Backend:
- `weave-api/app/api/ai_chat_router.py` (FastAPI routes)
- `weave-api/app/services/checkin_scheduler.py` (Scheduler service)
- ~~`weave-api/app/services/dream_self_advisor.py`~~ ❌ **DO NOT CREATE - Use existing AIService**
- `weave-api/app/models/ai_chat_models.py` (Pydantic schemas)
- `weave-api/app/tests/test_ai_chat_api.py` (Pytest tests)

**Existing Files to Reference:**
- `weave-api/app/services/ai/ai_service.py` - Main AI orchestrator (USE THIS)
- `weave-api/app/services/ai/anthropic_provider.py` - Claude Sonnet/Haiku support
- `weave-api/app/services/ai/openai_provider.py` - GPT-4o/GPT-4o-mini support
- `weave-api/app/services/ai/rate_limiter.py` - Rate limiting infrastructure
- `weave-api/app/services/ai/cost_tracker.py` - Cost tracking

**Existing Files to Replace:**
- `weave-mobile/app/(tabs)/ai-chat.tsx` - Currently just PlaceholderScreen (20 lines)
  - **Status:** Placeholder only - NO existing chat UI to preserve
  - **Action:** Complete rewrite with full chat interface
  - **Design goal:** World-class experience (iOS Messages quality)

Database:
- `supabase/migrations/YYYYMMDDHHMMSS_ai_chat_schema.sql`

### Alignment with Unified Project Structure

**Follows:**
- Design system usage (`@/design-system` imports)
- API response format (`{data, meta}` wrapper)
- State management boundaries (TanStack Query for server state)
- Database naming (`snake_case`, plural tables)
- Testing patterns (pytest + Jest)

**No Conflicts Detected**

### AI Service Integration (Detailed)

**⚠️ CRITICAL: Use existing AI service infrastructure - DO NOT duplicate!**

**Location:** `weave-api/app/services/ai/`

**Existing Components:**
1. **AIService** (`ai_service.py`) - Main orchestrator
   - Fallback chain: Bedrock → OpenAI → Anthropic → Deterministic
   - 24-hour caching with input_hash
   - Dual cost tracking (app-wide + per-user)
   - Role-based rate limiting
   - Comprehensive logging to `ai_runs` table

2. **Providers:**
   - `anthropic_provider.py` - Claude Sonnet/Haiku ✅ **USE THIS**
   - `openai_provider.py` - GPT-4o/GPT-4o-mini
   - `bedrock_provider.py` - AWS Bedrock (primary)
   - `deterministic_provider.py` - Template fallback

3. **Support Services:**
   - `cost_tracker.py` - Dual cost tracking
   - `rate_limiter.py` - Role-based limits
   - `base.py` - AIProvider abstract class

**Model Flexibility (Strong vs Weak):**

```python
from app.services.ai import AIService

# Strong model for quality (default)
response = ai_service.generate(
    user_id=user_id,
    user_role=user.role,
    user_tier=user.subscription_tier,
    module='ai_chat_quality',
    prompt=chat_message,
    model='claude-3-7-sonnet-20250219',  # Strong: $3/$15 per MTok
    max_tokens=500
)
# Auto-fallback: Sonnet → Haiku → GPT-4o-mini

# Weak/fast model for speed (optional)
response = ai_service.generate(
    user_id=user_id,
    user_role=user.role,
    user_tier=user.subscription_tier,
    module='ai_chat_fast',
    prompt=chat_message,
    model='claude-3-5-haiku-20250219',  # Weak: $1/$5 per MTok (5x cheaper)
    max_tokens=300
)
```

**Caching (Already Built-In):**
- **Feature:** 24-hour automatic caching with input_hash
- **How it works:** AIService caches based on:
  - Prompt hash (MD5 of normalized prompt)
  - Model identifier
  - User context hash
- **Cache hit:** Instant response + $0 cost
- **Cache miss:** Full AI call + cached for 24h
- **Example:** User asks "How do I complete a bind?" twice in 24h → 2nd response instant + free

**Rate Limiting (Tiered System - All AI Services):**
- **Existing Limiter:** `weave-api/app/services/ai/rate_limiter.py`
- **Tiered Limits (NEW):**
  ```python
  # Free tier daily limits (applies to ALL AI services: chat, Triad, journal, etc.)
  # - Premium models (Claude Sonnet): 10 messages/day
  # - Free models (Haiku, GPT-4o-mini): 40 messages/day
  # - Monthly cap: 500 messages/month

  # Pro tier: 2,500-5,000 messages/month (5-10x free)
  # Admin tier: Unlimited (bypass via X-Admin-Key)

  # Implementation
  def check_rate_limit(user: UserProfile, model: str):
      # Check monthly cap first
      if user.subscription_tier == 'free' and user.ai_messages_this_month >= 500:
          raise HTTPException(status_code=429, detail={
              "code": "RATE_LIMIT_EXCEEDED",
              "message": "You've used 500 messages this month. Resets on [date]."
          })

      # Check daily limits by model type
      if is_premium_model(model):  # Claude Sonnet
          if user.ai_premium_messages_today >= 10:
              raise HTTPException(status_code=429, detail={
                  "code": "RATE_LIMIT_EXCEEDED",
                  "message": "You've used 10 premium messages today. Resets at midnight."
              })
      else:  # Haiku, GPT-4o-mini
          if user.ai_free_messages_today >= 40:
              raise HTTPException(status_code=429, detail={
                  "code": "RATE_LIMIT_EXCEEDED",
                  "message": "You've used 40 free messages today. Resets at midnight."
              })
  ```
- **Tracking:** Separate counters for premium/free models + monthly total
- **Reset Logic:**
  - Daily counters: Reset at midnight user's timezone
  - Monthly counter: Reset on 1st of month (check `ai_messages_month_reset` field)
- **Note:** This rate limiting applies to ALL AI services (not just chat)

**Cost Projections with Fallback Chain:**
```
Assumption: 1000 messages, avg 500 tokens in + 200 tokens out

All Sonnet:
1000 * ((500*$3 + 200*$15)/1M) = $4,500/month

Sonnet → Haiku (50% fallback):
$4,500*0.5 + $1,500*0.5 = $3,000/month (33% savings)

Sonnet → Haiku → Mini (50%/30%/20%):
$4,500*0.5 + $1,500*0.3 + $210*0.2 = $2,742/month (39% savings)
```

### References

- [Source: docs/prd/epic-6-ai-coaching.md] - Epic 6.1 requirements
- [Source: weave-api/app/services/ai/] - Existing AI service infrastructure (USE THIS)
- [Source: docs/architecture/core-architectural-decisions.md:719-853] - AI Service Architecture
- [Source: docs/architecture/implementation-patterns-consistency-rules.md:165-217] - Development Infrastructure Standards (Epic 1.5)
- [Source: docs/architecture/core-architectural-decisions.md:15-43] - State Management Architecture (TanStack Query patterns)
- [Source: docs/architecture/core-architectural-decisions.md:82-318] - Navigation Architecture (glassmorphism overlay, center AI button)

### World-Class UX Requirements

**Design Philosophy:** iOS Messages meets Intercom meets Telegram - smooth, polished, delightful.

**Animation Standards:**
1. **Message Send Animation:**
   - Spring physics with react-native-reanimated
   - Slide up from input + fade in (300ms duration)
   - Settle with bounce (spring config: damping 15, stiffness 100)

2. **Message Receive Animation:**
   - Fade in + slide down from top (400ms delay for realism)
   - Typing indicator appears first (1-2s), then message slides in
   - Smooth scroll to bottom with spring physics

3. **Typing Indicator:**
   - 3 bouncing dots with stagger delay (0ms, 100ms, 200ms)
   - Loop animation (500ms per cycle)
   - Subtle scale + opacity changes

4. **Micro-Interactions:**
   - Send button: Scale to 0.95 on press, spring back (haptic feedback)
   - Quick chips: Scale to 0.97 on press, opacity 0.8 on hold
   - Message bubbles: Subtle hover effect (web only)
   - Long-press message: Show timestamp + copy option

**Glassmorphism Design:**
- Message bubbles: Translucent background with backdrop blur
- User messages: Blue gradient with white/10% border
- Weave messages: Purple gradient with white/15% border
- Input field: Glass effect matching ai-chat overlay
- BlurView settings: intensity 20, tint dark

**Polished Details:**
- Haptic feedback on send (Expo Haptics - medium impact)
- Smooth keyboard transitions (KeyboardAvoidingView with behavior: padding)
- Loading skeleton for message history (shimmer effect)
- Message timestamps (show on long-press)
- Copy message text (long-press gesture)
- Read receipts (small checkmark on sent messages)

**Reference Inspiration:**
- iOS Messages (animation smoothness, bubble design)
- Telegram (quick chips, haptics)
- Intercom (glassmorphism, typing indicator)

### Technical Requirements (Detailed)

**Check-In Scheduler Implementation (Hybrid Timing):**
```python
import random
from datetime import datetime, timedelta
import pytz

def calculate_checkin_time(user: UserProfile) -> datetime:
    """Calculate check-in time for user with optional variation."""
    user_tz = pytz.timezone(user.checkin_timezone)
    user_now = datetime.now(user_tz)

    # Generate base check-in time (9 AM - 9 PM) seeded by user_id + date
    seed = f"{user.id}_{user_now.date()}"
    random.seed(seed)
    base_hour = random.randint(9, 21)
    base_minute = random.randint(0, 59)

    base_time = user_now.replace(hour=base_hour, minute=base_minute, second=0, microsecond=0)

    # If deterministic mode, return exact base time
    if user.checkin_deterministic:
        return base_time

    # Add 10-15 minute variation for hybrid mode
    variation_seed = f"{user.id}_{user_now.date()}_{base_hour}"
    random.seed(variation_seed)
    variation_minutes = random.randint(10, 15) * random.choice([-1, 1])  # ±10-15 min

    return base_time + timedelta(minutes=variation_minutes)

def should_send_checkin(user: UserProfile, current_time: datetime) -> bool:
    """Determine if user should receive check-in now (±2 minute window)."""
    if not user.checkin_enabled:
        return False

    checkin_time = calculate_checkin_time(user)
    time_diff = abs((current_time - checkin_time).total_seconds())

    # Send if within 2-minute window (120 seconds)
    return time_diff <= 120

# Contextual messages based on time
def generate_checkin_message(user: UserProfile, hour: int) -> str:
    morning = hour < 12
    afternoon = 12 <= hour < 17
    evening = hour >= 17

    # Personalize with recent activity
    recent_completions = get_today_completions(user.id)
    pending_binds = get_pending_binds(user.id)

    if morning and not recent_completions:
        return f"Good morning! Ready to tackle your {len(pending_binds)} binds today?"
    elif afternoon and recent_completions:
        return f"Nice work! You've completed {len(recent_completions)} binds. Keep the momentum going?"
    elif evening and recent_completions:
        return f"Solid day! You completed {len(recent_completions)} binds. How are you feeling?"
    else:
        return "Hey! Just checking in - how's your day going?"
```

**Admin Testing:**
- **Bypass Mechanism:** `X-Admin-Key` header with secure token
- **Security:** Generate 32-char random key, store in .env, NEVER commit to repo
- **Audit Trail:** Log all admin-bypassed requests to `ai_runs` with special flag

### Library/Framework Requirements

**Frontend:**
```bash
# Already installed
npm install @tanstack/react-query expo-router react-native
npm install @react-native-async-storage/async-storage  # For TanStack Query persistence

# New dependencies
npm install react-native-keyboard-aware-scroll-view  # Keyboard avoidance
npm install react-native-animatable  # Typing indicator animation
```

**Backend:**
```bash
# Already installed
uv add fastapi supabase anthropic openai

# New dependencies
uv add apscheduler  # Cron job scheduler
uv add pytz  # Timezone handling
uv add sse-starlette  # Server-Sent Events for streaming
```

### File Structure Requirements

**Database Conventions:**
- Tables: `ai_chat_conversations`, `ai_chat_messages` (snake_case, plural)
- Columns: `user_id`, `created_at`, `deleted_at` (snake_case)
- Soft delete: Use `deleted_at TIMESTAMP WITH TIME ZONE` (nullable)

**API Conventions:**
- Routes: `/api/ai-chat/messages`, `/api/ai-chat/conversations` (kebab-case)
- Pydantic models: `ChatMessageCreate`, `ChatMessageResponse` (PascalCase)
- Error codes: `RATE_LIMIT_EXCEEDED`, `VALIDATION_ERROR` (SCREAMING_SNAKE_CASE)

**Frontend Conventions:**
- Components: `ChatScreen.tsx`, `MessageBubble.tsx` (PascalCase files)
- Hooks: `useAIChat.ts` (camelCase files, hook prefix)
- Services: `aiChatService.ts` (camelCase files)

### Testing Requirements

**Frontend Tests (Jest + React Native Testing Library):**
```typescript
// weave-mobile/src/components/features/ai-chat/__tests__/ChatScreen.test.tsx
describe('ChatScreen', () => {
  it('renders initial greeting', async () => {
    render(<ChatScreen />);
    expect(screen.getByText(/good morning/i)).toBeInTheDocument();
  });

  it('submits message and shows response', async () => {
    render(<ChatScreen />);
    const input = screen.getByPlaceholderText('Talk to Weave...');
    fireEvent.changeText(input, 'How do I complete a bind?');
    fireEvent.press(screen.getByText('Send'));
    await waitFor(() => expect(screen.getByText(/to complete a bind/i)).toBeInTheDocument());
  });

  it('shows rate limit when 10 messages used', async () => {
    // Mock API to return 10/10 usage
    render(<ChatScreen />);
    expect(screen.getByText(/10\/10 messages used/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Talk to Weave...')).toBeDisabled();
  });
});
```

**Backend Tests (Pytest):**
```python
# weave-api/tests/test_ai_chat_api.py
def test_send_message_returns_response(client, auth_headers):
    response = client.post("/api/ai-chat/messages", json={"message": "Hello"}, headers=auth_headers)
    assert response.status_code == 200
    assert "response" in response.json()["data"]

def test_rate_limit_enforces_10_messages_per_hour(client, auth_headers):
    # Send 10 messages
    for _ in range(10):
        client.post("/api/ai-chat/messages", json={"message": "Test"}, headers=auth_headers)

    # 11th message should fail
    response = client.post("/api/ai-chat/messages", json={"message": "Test"}, headers=auth_headers)
    assert response.status_code == 429
    assert response.json()["error"]["code"] == "RATE_LIMIT_EXCEEDED"

def test_admin_key_bypasses_rate_limit(client):
    admin_headers = {"X-Admin-Key": os.getenv("ADMIN_API_KEY")}
    # Send 20 messages (2x limit)
    for _ in range(20):
        response = client.post("/api/ai-chat/messages", json={"message": "Test"}, headers=admin_headers)
        assert response.status_code == 200  # No rate limit error

def test_checkin_scheduler_respects_timezone(db_session):
    user = create_test_user(checkin_timezone="America/New_York", checkin_preference="balanced")
    scheduler = CheckInSchedulerService()

    # Mock current time: 8:00 AM EST
    with freeze_time("2025-12-22 13:00:00 UTC"):  # 8 AM EST
        should_checkin = scheduler.should_send_checkin(user)
        assert should_checkin is True
```

### Previous Story Intelligence

**Story 1.5.3 (AI Services Standardization):**
- Established `AIProviderBase` pattern for all AI integrations
- Created `docs/dev/ai-services-guide.md` with comprehensive patterns
- Set up cost tracking in `ai_runs` table
- Implemented provider fallback chains

**Key Learnings:**
- ALWAYS log AI calls to `ai_runs` table (cost tracking is critical)
- Use `daily_aggregates` for rate limiting (already exists)
- Frontend hooks should follow `use{Feature}()` pattern
- Provider selection based on use case (quality vs cost)

**Story 1.5.2 (Backend Standardization):**
- Established API endpoint naming conventions
- Created Pydantic model patterns
- Set up pytest testing patterns
- Created `docs/dev/backend-patterns-guide.md`

**Key Learnings:**
- Use `{data, meta}` response wrapper consistently
- Error codes should be `SCREAMING_SNAKE_CASE`
- Soft delete pattern: `deleted_at TIMESTAMP WITH TIME ZONE`
- Pytest fixtures for database setup

**Story 1.5.1 (Navigation Standardization):**
- Established file-based routing structure
- Created 3-tab navigation pattern
- Implemented glassmorphism overlay for AI chat
- Set up design system component usage

**Key Learnings:**
- Use `@/design-system` imports (NOT relative paths)
- TanStack Query for ALL server state (NOT Zustand)
- Expo Router Link component for navigation
- Center AI button with haptic feedback

### Git Intelligence Summary

**Recent Work (Last 5 Commits):**
- `4713851`: Merge PR #68 (story/0.9)
- `dbeddea`: "0.9: finally" - Likely completed Story 0.9
- `eb0b79f`: "0.9 linting" - Linting fixes for Story 0.9
- `c78408c`: "0.9: final linting" - More linting
- `67aab4f`: "0.9: fix more fblur" - UI/blur-related fixes

**Patterns Observed:**
- Story-based branches (`story/0.9`)
- Multiple linting passes (use `npm run lint` frequently)
- Focus on visual polish (`fblur` suggests BlurView components)

**Actionable Insights:**
- Run linting after each task completion
- Test glassmorphism/blur effects on iOS simulator
- Follow story branch naming: `story/6.1`

### Latest Technical Information

**Expo Router (Latest):**
- Using file-based routing (already established in project)
- Supports SSR/SSG for web (not needed for MVP)
- Stack navigation for drilldowns, Tabs for primary nav

**TanStack Query v5:**
- `useQuery` hook for data fetching
- `useMutation` hook for POST/PUT/DELETE
- `queryClient.invalidateQueries()` for cache refresh
- `staleTime` controls when data refetches (set to 5 minutes)

**Expo Push Notifications:**
- Requires Expo account and push credentials
- Use `expo-notifications` library (assumed already integrated)
- APNs (iOS) and FCM (Android) handled automatically

**APScheduler (Python):**
- Cron-style scheduling: `@scheduler.scheduled_job('cron', hour='*', minute=0)`
- Timezone-aware: Use `pytz` to handle user timezones
- Async support: Use `AsyncIOScheduler` for FastAPI

### Project Context Reference

**Critical Rules from CLAUDE.md:**
1. **Development Infrastructure Standards (Epic 1.5):** MUST follow Story 1.5.1 (navigation), 1.5.2 (backend), 1.5.3 (AI services)
2. **State Management:** TanStack Query for server data, Zustand for shared UI, useState for local
3. **API Response Format:** `{data, meta}` wrapper for success, `{error: {code, message}}` for errors
4. **Naming Conventions:** snake_case DB, PascalCase components, camelCase hooks
5. **Testing Standards:** Co-located `*.test.tsx` for mobile, `tests/` directory for backend

## Story Completion Status

**Status:** ready-for-dev ✅ **VALIDATED (2025-12-22)**

**Context Analysis:** ✅ Complete
- Loaded Epic 6.1 requirements from PRD
- Analyzed architecture patterns (AI services, backend, navigation)
- Discovered existing AI service infrastructure (preventing duplication)
- Reviewed existing codebase (placeholder chat screen - 20 lines)
- Incorporated user's requirements (server-initiated 1x/day, admin mode, world-class UX)
- Extracted patterns from Stories 1.5.1, 1.5.2, 1.5.3

**Developer Guardrails:** ✅ Complete
- Clear acceptance criteria (14 items - added UX polish)
- Detailed task breakdown (13 tasks, 60+ subtasks)
- Architecture compliance requirements
- Testing requirements with examples
- File structure specifications
- AI service integration guide (use existing, don't duplicate)

**Implementation-Ready:** ✅ Yes (Validated)
- All dependencies identified
- Database schema provided and simplified
- API contracts defined
- Component structure outlined
- Testing patterns established
- 5 critical issues corrected from validation

**Validation Corrections Applied:**
1. ✅ AI service integration: Use existing `app.services.ai` (DO NOT duplicate)
2. ✅ Rate limits: Tiered system - 10 premium + 40 free per day, 500/month
3. ✅ Check-ins: Hybrid timing - base time with 10-15 min variation (or deterministic)
4. ✅ Model fallback: Sonnet → Haiku → Mini (not GPT-4o)
5. ✅ UX requirements: World-class polish added (animations, haptics, glassmorphism)

**Final User Clarifications Applied (2025-12-22):**
1. ✅ **Tiered Message System:**
   - Daily: 10 premium messages (Claude Sonnet) + 40 free messages (Haiku/Mini)
   - Monthly: 500 messages for free tier, 2,500-5,000 for pro tier (5-10x)
   - Applies to ALL AI services (chat, Triad, journal feedback, etc.)

2. ✅ **Hybrid Check-In Timing:**
   - Same timeframe each day but with 10-15 minute variation
   - Example: Base time 2:47 PM → Actual: 2:52 PM, 2:59 PM, 3:01 PM
   - User can enable deterministic mode in settings (exact same time daily)

**Next Steps:**
1. Run `/bmad:bmm:workflows:dev-story` to implement Story 6.1
2. Run `/bmad:bmm:workflows:code-review` when complete

**Validation Report:** `docs/stories/validation-reports/validation-report-story-6.1-20251222.md`

## Dev Agent Record

### Context Reference

Story created using BMAD Create Story workflow (YOLO mode) - comprehensive context engine analysis completed.

### Agent Model Used

Claude Sonnet 4.5 (global.anthropic.claude-sonnet-4-5-20250929-v1:0)

### Debug Log References

N/A (Story creation, not implementation)

### Completion Notes List

1. Story 6.1 draft created with server-initiated conversation enhancement
2. **VALIDATED 2025-12-22:** Story updated with critical corrections
3. AI service integration: Using existing `AIService` from `app.services.ai` (DO NOT duplicate)
4. **UPDATED 2025-12-22:** Rate limits changed to tiered system:
   - Daily: 10 premium messages (Sonnet) + 40 free messages (Haiku/Mini)
   - Monthly: 500 for free tier, 2,500-5,000 for pro tier
   - Applies to ALL AI services (not just chat)
5. **UPDATED 2025-12-22:** Check-in timing changed to hybrid system:
   - Base time with 10-15 minute variation (default)
   - Deterministic option available in user settings
6. Model flexibility: Strong (Sonnet) vs Weak (Haiku/Mini) with automatic fallback
7. Caching: 24-hour input_hash caching already built-in (instant + free for duplicates)
8. **UPDATED 2025-12-22:** Rate limiting now applies to ALL AI services (not just chat)
9. Admin/dev testing mode: X-Admin-Key header bypass for unlimited testing
10. World-class UX requirements: Spring animations, haptics, glassmorphism, micro-interactions
11. **UPDATED 2025-12-22:** Database schema includes tiered tracking:
    - `ai_premium_messages_today`, `ai_free_messages_today` (daily counters)
    - `ai_messages_this_month`, `ai_messages_month_reset` (monthly tracking)
    - `checkin_deterministic` (hybrid timing option), `last_checkin_at` (debugging)
12. Validation report: `docs/stories/validation-reports/validation-report-story-6.1-20251222.md`

### File List

**Files to Create (Frontend):**
- `weave-mobile/app/(tabs)/ai-chat.tsx` (replace)
- `weave-mobile/src/components/features/ai-chat/ChatScreen.tsx`
- `weave-mobile/src/components/features/ai-chat/MessageBubble.tsx`
- `weave-mobile/src/components/features/ai-chat/QuickActionChips.tsx`
- `weave-mobile/src/components/features/ai-chat/MessageInput.tsx`
- `weave-mobile/src/components/features/ai-chat/RateLimitIndicator.tsx`
- `weave-mobile/src/hooks/useAIChat.ts`
- `weave-mobile/src/services/aiChatService.ts`

**Files to Create (Backend):**
- `weave-api/app/api/ai_chat_router.py`
- `weave-api/app/services/checkin_scheduler.py`
- ~~`weave-api/app/services/dream_self_advisor.py`~~ ❌ **DO NOT CREATE**
- `weave-api/app/models/ai_chat_models.py`
- `weave-api/app/tests/test_ai_chat_api.py`

**Files to Create (Database):**
- `supabase/migrations/YYYYMMDDHHMMSS_ai_chat_schema.sql`

**Files to Reference:**
- `docs/prd/epic-6-ai-coaching.md` (requirements)
- `docs/architecture/core-architectural-decisions.md` (AI patterns)
- `docs/architecture/implementation-patterns-consistency-rules.md` (standards)
- `docs/dev/ai-services-guide.md` (AI integration guide)
- `docs/dev/backend-patterns-guide.md` (backend patterns)
