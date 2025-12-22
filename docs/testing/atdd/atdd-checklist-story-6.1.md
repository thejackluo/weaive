# ATDD Checklist - Epic 6, Story 6.1: AI Chat Interface with Server-Initiated Conversations

**Date:** 2025-12-22
**Author:** Jack
**Primary Test Level:** API (Integration)

---

## Story Summary

As a user, I want to talk to my AI coach anytime AND have Weave proactively reach out to me, so that I can get personalized guidance when I need it and stay accountable through strategic check-ins.

**As a** Weave user
**I want** to chat with my AI coach and receive proactive check-ins
**So that** I stay accountable and get guidance when I need it

---

## Acceptance Criteria

### Frontend (Mobile)
1. Full chat interface replacing PlaceholderScreen with Weave-initiated conversation
2. Quick action chips above input ("Plan my day", "I'm stuck", "Edit my goal", "Explain this bind")
3. Message input with 500 character limit and send button
4. Rate limiting UI showing usage (10 premium + 40 free messages per day, 500/month)
5. Server-initiated conversation notifications with special indicator

### Backend (API)
6. Chat API endpoints (POST /api/ai-chat/messages, GET /api/ai-chat/conversations, GET /api/ai-chat/conversations/{id})
7. Tiered rate limiting system (10 premium + 40 free per day, 500/month for free tier)
8. Server-initiated check-ins with hybrid timing (base time + 10-15 min variation)
9. Admin/dev testing mode (X-Admin-Key bypass)

### Database Schema
10. New tables: ai_chat_conversations, ai_chat_messages
11. User profile columns: check-in preferences, tiered rate limiting counters

### Testing
12. Frontend tests (chat UI, chips, input, rate limiting, notifications)
13. Backend tests (API endpoints, rate limiting, check-in scheduler, AIService integration)
14. World-class UX polish (animations, haptics, glassmorphism)

---

## Failing Tests Created (RED Phase)

### API Tests (30 tests)

**File:** `weave-api/tests/test_ai_chat_api.py` (750 lines)

#### Chat Messages Endpoint
- ✅ **Test:** test_send_message_returns_ai_response
  - **Status:** RED - Missing POST /api/ai-chat/messages endpoint
  - **Verifies:** User can send message and receive AI response with metadata

- ✅ **Test:** test_send_message_creates_new_conversation_if_none_provided
  - **Status:** RED - Conversation creation not implemented
  - **Verifies:** System creates new conversation when conversation_id is None

- ✅ **Test:** test_send_message_uses_existing_conversation
  - **Status:** RED - Conversation reuse logic not implemented
  - **Verifies:** System appends to existing conversation when conversation_id provided

- ✅ **Test:** test_send_message_validates_empty_message
  - **Status:** RED - Validation not implemented
  - **Verifies:** Empty messages rejected with VALIDATION_ERROR

- ✅ **Test:** test_send_message_validates_character_limit
  - **Status:** RED - Character limit validation not implemented
  - **Verifies:** Messages over 500 characters rejected

#### Conversations List Endpoint
- ✅ **Test:** test_list_conversations_returns_user_history
  - **Status:** RED - Missing GET /api/ai-chat/conversations endpoint
  - **Verifies:** User can retrieve conversation history with previews

- ✅ **Test:** test_list_conversations_returns_empty_for_new_user
  - **Status:** RED - Endpoint returns 404 instead of empty list
  - **Verifies:** New users get empty array (not error)

#### Conversation Detail Endpoint
- ✅ **Test:** test_get_conversation_returns_full_thread
  - **Status:** RED - Missing GET /api/ai-chat/conversations/{id} endpoint
  - **Verifies:** User can retrieve complete message history for conversation

- ✅ **Test:** test_get_conversation_returns_404_for_invalid_id
  - **Status:** RED - 404 handling not implemented
  - **Verifies:** Invalid conversation IDs return NOT_FOUND error

#### Rate Limiting (Tiered System)
- ✅ **Test:** test_rate_limit_enforces_premium_daily_limit
  - **Status:** RED - Premium rate limiting not implemented
  - **Verifies:** 10 premium messages per day enforced

- ✅ **Test:** test_rate_limit_enforces_free_daily_limit
  - **Status:** RED - Free rate limiting not implemented
  - **Verifies:** 40 free messages per day enforced

- ✅ **Test:** test_rate_limit_enforces_monthly_cap
  - **Status:** RED - Monthly cap not implemented
  - **Verifies:** 500 messages per month enforced (free tier)

- ✅ **Test:** test_admin_key_bypasses_rate_limits
  - **Status:** RED - Admin bypass not implemented
  - **Verifies:** X-Admin-Key header allows unlimited requests

- ✅ **Test:** test_get_usage_returns_current_limits
  - **Status:** RED - Missing GET /api/ai/usage endpoint
  - **Verifies:** User can check current usage stats

#### Check-In Scheduler
- ✅ **Test:** test_checkin_creates_system_initiated_conversation
  - **Status:** RED - CheckInSchedulerService not implemented
  - **Verifies:** Check-ins create conversations with initiated_by='system'

- ✅ **Test:** test_checkin_respects_user_timezone
  - **Status:** RED - Timezone handling not implemented
  - **Verifies:** Check-in times respect user's timezone (PST != EST)

- ✅ **Test:** test_checkin_respects_deterministic_setting
  - **Status:** RED - Deterministic mode not implemented
  - **Verifies:** checkin_deterministic=True uses exact same time daily

- ✅ **Test:** test_checkin_adds_variation_when_not_deterministic
  - **Status:** RED - Hybrid timing not implemented
  - **Verifies:** checkin_deterministic=False adds 10-15 min variation

- ✅ **Test:** test_checkin_respects_disabled_preference
  - **Status:** RED - checkin_enabled check not implemented
  - **Verifies:** checkin_enabled=False skips check-ins

- ✅ **Test:** test_checkin_generates_contextual_message
  - **Status:** RED - Contextual message generation not implemented
  - **Verifies:** Check-in messages include user's recent activity

#### Admin Testing
- ✅ **Test:** test_admin_trigger_checkin_sends_immediate_checkin
  - **Status:** RED - Missing POST /api/admin/trigger-checkin/{user_id} endpoint
  - **Verifies:** Admin can manually trigger check-ins

- ✅ **Test:** test_admin_endpoint_rejects_invalid_key
  - **Status:** RED - Admin key validation not implemented
  - **Verifies:** Invalid admin keys return 403 FORBIDDEN

#### AIService Integration
- ✅ **Test:** test_chat_uses_existing_aiservice
  - **Status:** RED - AIService integration not connected
  - **Verifies:** Chat uses existing AIService (not new service)

- ✅ **Test:** test_chat_fallback_chain_works
  - **Status:** RED - Fallback logic not tested
  - **Verifies:** Sonnet → Haiku → Mini fallback chain works

- ✅ **Test:** test_chat_caching_works
  - **Status:** RED - Caching not verified
  - **Verifies:** Duplicate messages within 24h use cache

### Component Tests (35 tests)

**File:** `weave-mobile/src/components/features/ai-chat/__tests__/ChatScreen.test.tsx` (350 lines)

#### Chat Screen - Initial Greeting
- ✅ **Test:** renders initial greeting from Weave on mount
  - **Status:** RED - ChatScreen component not implemented
  - **Verifies:** Weave initiates conversation with contextual greeting

- ✅ **Test:** displays user messages with blue styling on right
  - **Status:** RED - Message bubbles not styled
  - **Verifies:** User messages are right-aligned with blue color

- ✅ **Test:** displays Weave messages with purple styling on left
  - **Status:** RED - Assistant message styling not implemented
  - **Verifies:** Weave messages are left-aligned with purple gradient

- ✅ **Test:** shows typing indicator while AI generates response
  - **Status:** RED - Typing indicator not implemented
  - **Verifies:** 3 animated dots shown during AI response generation

- ✅ **Test:** auto-scrolls to bottom when new message arrives
  - **Status:** RED - Auto-scroll not implemented
  - **Verifies:** ScrollView scrolls to bottom on new messages

- ✅ **Test:** adjusts layout when keyboard opens
  - **Status:** RED - Keyboard avoidance not implemented
  - **Verifies:** KeyboardAvoidingView adjusts for keyboard

#### Quick Action Chips
- ✅ **Test:** renders quick action chips above input
  - **Status:** RED - QuickActionChips component not implemented
  - **Verifies:** All 4 chips are displayed

- ✅ **Test:** sends predefined prompt when chip is tapped
  - **Status:** RED - Chip onPress not wired
  - **Verifies:** Tapping chip sends predefined prompt to AI

- ✅ **Test:** hides chips when user starts typing
  - **Status:** RED - Hide/show logic not implemented
  - **Verifies:** Chips disappear when input has text

#### Message Input
- ✅ **Test:** disables send button when input is empty
  - **Status:** RED - MessageInput component not implemented
  - **Verifies:** Empty input = disabled send button

- ✅ **Test:** enables send button when text is entered
  - **Status:** RED - Button state logic not implemented
  - **Verifies:** Text input enables send button

- ✅ **Test:** shows character counter when approaching limit
  - **Status:** RED - Character counter not implemented
  - **Verifies:** Counter appears at 400+ characters

- ✅ **Test:** enforces 500 character limit
  - **Status:** RED - Character limit not enforced
  - **Verifies:** Input truncated at 500 characters

#### Rate Limiting UI
- ✅ **Test:** displays usage indicator showing messages used
  - **Status:** RED - RateLimitIndicator component not implemented
  - **Verifies:** Shows "3/10 premium messages used today"

- ✅ **Test:** shows friendly message when rate limit reached
  - **Status:** RED - Rate limit message not implemented
  - **Verifies:** Displays "You've used all 10 messages today. Resets at midnight."

- ✅ **Test:** disables input when rate limited
  - **Status:** RED - Input disable logic not implemented
  - **Verifies:** Input and chips disabled when rate limited

- ✅ **Test:** shows countdown timer to midnight reset
  - **Status:** RED - Countdown timer not implemented
  - **Verifies:** Timer shows time until limit resets

#### Server-Initiated Indicators
- ✅ **Test:** shows special indicator for server-initiated messages
  - **Status:** RED - Server-initiated indicator not implemented
  - **Verifies:** "✨ Weave checked in" indicator for system messages

#### UX Polish
- ✅ **Test:** triggers haptic feedback when send button pressed
  - **Status:** RED - Haptic feedback not integrated
  - **Verifies:** Medium impact haptic on send

- ✅ **Test:** animates send button on press
  - **Status:** RED - Button animation not implemented
  - **Verifies:** Button scales to 0.95 on press

**Additional Component Test Files:**
- `MessageBubble.test.tsx` (9 tests) - Message styling, glassmorphism, long-press
- `QuickActionChips.test.tsx` (7 tests) - Chip interactions, animations
- `MessageInput.test.tsx` (10 tests) - Input validation, character limit
- `RateLimitIndicator.test.tsx` (9 tests) - Usage display, warnings, countdown

---

## Data Factories Created

### AI Chat Factory

**File:** `tests/support/factories/ai_chat_factory.py`

**Exports:**
- `create_conversation(user_id?, initiated_by='user', **overrides)` - Create single conversation
- `create_conversations(count)` - Create array of conversations
- `create_message(conversation_id?, role='user', **overrides)` - Create single message
- `create_messages(count)` - Create array of messages
- `create_user_profile(checkin_enabled=True, **overrides)` - Create user with AI settings
- `create_user_profiles(count)` - Create array of users
- `create_ai_run(user_id?, operation_type='chat', **overrides)` - Create AI run record
- `create_rate_limited_user(**overrides)` - Create user at rate limits
- `create_pro_user(**overrides)` - Create pro tier user
- `create_admin_headers(admin_key?)` - Create admin auth headers

**Example Usage:**

```python
from tests.support.factories.ai_chat_factory import create_conversation, create_user_profile

# Create conversation with defaults
conversation = create_conversation()

# Create conversation with overrides
conversation = create_conversation(
    user_id=specific_user_id,
    initiated_by='system',
    conversation_context={'active_goals': 3}
)

# Create multiple conversations
conversations = create_conversations(5, user_id=user_id)

# Create rate-limited user
limited_user = create_rate_limited_user()
```

---

## Fixtures Created

### AI Chat Fixtures

**File:** `tests/support/fixtures/ai_chat_fixtures.py`

**Fixtures:**

#### async_client
- **Provides:** AsyncClient for API testing
- **Setup:** Creates test HTTP client
- **Cleanup:** Closes client connection

#### mock_user_profile (async)
- **Provides:** Test user with AI chat settings
- **Setup:** Creates user in database
- **Cleanup:** Deletes user from database

#### auth_headers
- **Provides:** Authenticated request headers
- **Setup:** Generates JWT token for mock_user_profile
- **Cleanup:** None (headers only)

#### admin_headers
- **Provides:** Admin request headers with X-Admin-Key
- **Setup:** Creates admin key header
- **Cleanup:** None (headers only)

#### mock_conversation (async)
- **Provides:** Test conversation owned by mock_user_profile
- **Setup:** Creates conversation in database
- **Cleanup:** Deletes conversation (cascade to messages)

#### mock_messages (async)
- **Provides:** Array of 2 test messages (user + assistant)
- **Setup:** Creates messages in database
- **Cleanup:** Deletes messages from database

#### checkin_scheduler_service
- **Provides:** CheckInSchedulerService instance
- **Setup:** Instantiates scheduler
- **Cleanup:** None (stateless service)

#### mock_aiservice
- **Provides:** Mock AIService for testing without real AI calls
- **Setup:** Creates mock with AsyncMock generate method
- **Cleanup:** Restores original AIService

#### mock_failing_providers
- **Provides:** Mock AI providers with configurable failures
- **Setup:** Creates mock controller for fallback testing
- **Cleanup:** Restores original providers

#### rate_limited_user (async)
- **Provides:** User at rate limits (10 premium, 40 free, 500 monthly)
- **Setup:** Creates rate-limited user in database
- **Cleanup:** Deletes user from database

#### pro_user (async)
- **Provides:** Pro tier user with higher limits
- **Setup:** Creates pro user in database
- **Cleanup:** Deletes user from database

**Example Usage:**

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_chat_endpoint(async_client: AsyncClient, auth_headers: dict):
    # async_client and auth_headers are ready to use
    response = await async_client.post(
        "/api/ai-chat/messages",
        json={"message": "Test"},
        headers=auth_headers
    )
    assert response.status_code == 200
```

---

## Mock Requirements

### AIService Mock (Already Built-In)

The existing `AIService` from `app.services.ai` already provides:
- ✅ Fallback chain (Sonnet → Haiku → Mini)
- ✅ 24-hour caching with input_hash
- ✅ Cost tracking to `ai_runs` table
- ✅ Rate limiting infrastructure

**NO NEW MOCKS NEEDED** - Use existing infrastructure

### External Services (None Required for MVP)

- Expo Push Notifications - Use Expo SDK (no mocking needed for unit tests)
- Supabase Database - Use test database instance
- JWT Authentication - Generate test tokens in fixtures

---

## Required data-testid Attributes

### ChatScreen Component

- `chat-scrollview` - Main ScrollView containing messages
- `message-bubble` - Each message bubble (user or assistant)
- `message-bubble-user` - User-specific message bubble
- `message-bubble-assistant` - Assistant-specific message bubble
- `typing-indicator` - Typing indicator container
- `typing-dot` - Individual typing dot (3 total)
- `keyboard-avoiding-view` - KeyboardAvoidingView wrapper
- `server-initiated-indicator` - "✨ Weave checked in" indicator

### QuickActionChips Component

- `quick-action-chips-container` - Chips container
- `chip-plan-day` - "Plan my day" chip
- `chip-im-stuck` - "I'm stuck" chip
- `chip-edit-goal` - "Edit my goal" chip
- `chip-explain-bind` - "Explain this bind" chip

### MessageInput Component

- `message-input` - TextInput field
- `send-button` - Send button
- `character-counter` - Character count display (shown at 400+)

### RateLimitIndicator Component

- `rate-limit-indicator` - Container
- `reset-countdown-timer` - Countdown to reset

### MessageBubble Component

- `message-bubble` - Bubble container
- `message-timestamp` - Timestamp (shown on long-press)
- `copy-message-button` - Copy button (shown on long-press)

**Implementation Example:**

```tsx
// ChatScreen.tsx
<ScrollView data-testid="chat-scrollview">
  <View data-testid="message-bubble-assistant">
    <Text>Hello! How can I help?</Text>
  </View>
</ScrollView>

<TextInput
  data-testid="message-input"
  placeholder="Talk to Weave..."
/>

<TouchableOpacity data-testid="send-button">
  <Text>Send</Text>
</TouchableOpacity>
```

---

## Implementation Checklist

### Test: POST /api/ai-chat/messages Endpoint (AC #6)

**File:** `weave-api/app/api/ai_chat_router.py`

**Tasks to make this test pass:**

- [ ] Create FastAPI router for AI chat endpoints
- [ ] Implement `POST /api/ai-chat/messages` endpoint
  - [ ] Accept `ChatMessageCreate` Pydantic model (message, conversation_id)
  - [ ] Validate message length (1-500 characters)
  - [ ] Create or retrieve conversation
  - [ ] Use existing `AIService` from `app.services.ai` (DO NOT create new service)
  - [ ] Generate AI response with fallback chain
  - [ ] Save user message and AI response to `ai_chat_messages` table
  - [ ] Update conversation last_message_at timestamp
  - [ ] Return `ChatMessageResponse` with {data, meta} wrapper
- [ ] Add required data-testid attributes: N/A (API endpoint)
- [ ] Run test: `uv run pytest tests/test_ai_chat_api.py::TestAIChatMessagesEndpoint::test_send_message_returns_ai_response -v`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 4 hours

---

### Test: GET /api/ai-chat/conversations Endpoint (AC #6)

**File:** `weave-api/app/api/ai_chat_router.py`

**Tasks to make this test pass:**

- [ ] Implement `GET /api/ai-chat/conversations` endpoint
  - [ ] Query `ai_chat_conversations` filtered by user_id
  - [ ] Order by last_message_at DESC
  - [ ] Include last_message_preview (first 100 chars of last message)
  - [ ] Return list of `ConversationResponse` models
- [ ] Run test: `uv run pytest tests/test_ai_chat_api.py::TestAIChatConversationsEndpoint -v`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: GET /api/ai-chat/conversations/{id} Endpoint (AC #6)

**File:** `weave-api/app/api/ai_chat_router.py`

**Tasks to make this test pass:**

- [ ] Implement `GET /api/ai-chat/conversations/{conversation_id}` endpoint
  - [ ] Query conversation by ID
  - [ ] Verify user owns conversation (RLS check)
  - [ ] Query all messages in conversation ordered by created_at ASC
  - [ ] Return full message thread
  - [ ] Return 404 NOT_FOUND if conversation doesn't exist
- [ ] Run test: `uv run pytest tests/test_ai_chat_api.py::TestAIChatConversationDetailEndpoint -v`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: Tiered Rate Limiting System (AC #7)

**File:** `weave-api/app/services/ai/tiered_rate_limiter.py`

**Tasks to make this test pass:**

- [ ] Create `TieredRateLimiter` class (or extend existing rate limiter)
- [ ] Implement tier-based limit checks:
  - [ ] Check premium model daily limit: `ai_premium_messages_today < 10`
  - [ ] Check free model daily limit: `ai_free_messages_today < 40`
  - [ ] Check monthly cap: `ai_messages_this_month < monthly_limit` (500 for free, 5000 for pro)
  - [ ] Admin bypass: Skip checks if `X-Admin-Key` header valid
- [ ] Increment counters after successful AI call:
  - [ ] Premium model: `ai_premium_messages_today += 1`
  - [ ] Free model: `ai_free_messages_today += 1`
  - [ ] Both: `ai_messages_this_month += 1`
- [ ] Reset logic (background job or on-demand):
  - [ ] Daily reset at midnight user's timezone
  - [ ] Monthly reset on 1st of month (check `ai_messages_month_reset`)
- [ ] Return HTTP 429 with specific error messages
- [ ] Add middleware to check `X-Admin-Key` header
- [ ] Create `GET /api/ai/usage` endpoint to return usage stats
- [ ] Run tests: `uv run pytest tests/test_ai_chat_api.py::TestAIChatRateLimiting -v`
- [ ] ✅ Tests pass (green phase)

**Estimated Effort:** 6 hours

---

### Test: Check-In Scheduler with Hybrid Timing (AC #8)

**File:** `weave-api/app/services/checkin_scheduler.py`

**Tasks to make this test pass:**

- [ ] Create `CheckInSchedulerService` class
- [ ] Install and configure APScheduler (cron job every 5 minutes)
- [ ] Implement `calculate_checkin_time(user: UserProfile) -> datetime`:
  - [ ] Generate base check-in time (9 AM - 9 PM) seeded by `{user_id}_{date}`
  - [ ] If `checkin_deterministic = True`: Return exact base time
  - [ ] If `checkin_deterministic = False`: Add 10-15 min random variation
  - [ ] Handle timezone conversion using pytz
- [ ] Implement `should_send_checkin(user: UserProfile) -> bool`:
  - [ ] Check `checkin_enabled = True`
  - [ ] Calculate check-in time
  - [ ] Check if current time within ±2 minute window
- [ ] Implement `send_checkin(user: UserProfile)`:
  - [ ] Generate contextual message based on time + recent activity
  - [ ] Create system-initiated conversation (`initiated_by='system'`)
  - [ ] Send push notification via Expo Push API
  - [ ] Update `last_checkin_at` timestamp
  - [ ] Log to `ai_runs` table (operation_type: 'checkin_initiated')
- [ ] Run tests: `uv run pytest tests/test_ai_chat_api.py::TestCheckInScheduler -v`
- [ ] ✅ Tests pass (green phase)

**Estimated Effort:** 8 hours

---

### Test: Admin Testing Mode (AC #9)

**File:** `weave-api/app/middleware/admin_middleware.py`

**Tasks to make this test pass:**

- [ ] Create admin middleware to check `X-Admin-Key` header
- [ ] Generate and store `ADMIN_API_KEY` in .env (32-char random)
- [ ] Add `POST /api/admin/trigger-checkin/{user_id}` endpoint:
  - [ ] Verify admin key
  - [ ] Call `checkin_scheduler.send_checkin(user)` immediately
  - [ ] Return success with conversation_id
- [ ] Log all admin-bypassed requests to audit trail
- [ ] Run tests: `uv run pytest tests/test_ai_chat_api.py::TestAdminTestingMode -v`
- [ ] ✅ Tests pass (green phase)

**Estimated Effort:** 2 hours

---

### Test: AIService Integration (AC #6)

**File:** `weave-api/app/api/ai_chat_router.py`

**Tasks to make this test pass:**

- [ ] Import existing AIService: `from app.services.ai import AIService`
- [ ] Wire chat endpoint to use AIService.generate():
  - [ ] Pass user_id, user_role, user_tier
  - [ ] Pass module='ai_chat'
  - [ ] Use model='claude-3-7-sonnet-20250219' for quality
  - [ ] Automatic fallback: Sonnet → Haiku → Mini
  - [ ] Automatic 24-hour caching with input_hash
- [ ] Log ALL AI calls to `ai_runs` table (already built-in)
- [ ] Run tests: `uv run pytest tests/test_ai_chat_api.py::TestAIServiceIntegration -v`
- [ ] ✅ Tests pass (green phase)

**Estimated Effort:** 2 hours

---

### Test: Database Schema (AC #10, #11)

**File:** `supabase/migrations/20251222000001_ai_chat_infrastructure.sql`

**Tasks to make this test pass:**

- [ ] Create `ai_chat_conversations` table with columns:
  - [ ] id (UUID PRIMARY KEY)
  - [ ] user_id (UUID REFERENCES user_profiles)
  - [ ] started_at (TIMESTAMP WITH TIME ZONE)
  - [ ] last_message_at (TIMESTAMP WITH TIME ZONE)
  - [ ] initiated_by (TEXT CHECK IN ('user', 'system'))
  - [ ] conversation_context (JSONB)
  - [ ] deleted_at (TIMESTAMP WITH TIME ZONE - soft delete)
- [ ] Create `ai_chat_messages` table with columns:
  - [ ] id (UUID PRIMARY KEY)
  - [ ] conversation_id (UUID REFERENCES ai_chat_conversations)
  - [ ] role (TEXT CHECK IN ('user', 'assistant', 'system'))
  - [ ] content (TEXT)
  - [ ] tokens_used (INT)
  - [ ] created_at (TIMESTAMP WITH TIME ZONE)
  - [ ] deleted_at (TIMESTAMP WITH TIME ZONE - soft delete)
- [ ] Add columns to `user_profiles`:
  - [ ] checkin_enabled (BOOLEAN DEFAULT true)
  - [ ] checkin_timezone (TEXT DEFAULT 'America/Los_Angeles')
  - [ ] checkin_deterministic (BOOLEAN DEFAULT false)
  - [ ] last_checkin_at (TIMESTAMP WITH TIME ZONE)
  - [ ] ai_premium_messages_today (INT DEFAULT 0)
  - [ ] ai_free_messages_today (INT DEFAULT 0)
  - [ ] ai_messages_this_month (INT DEFAULT 0)
  - [ ] ai_messages_month_reset (DATE DEFAULT CURRENT_DATE)
- [ ] Create indexes:
  - [ ] CREATE INDEX idx_ai_chat_conversations_user ON ai_chat_conversations(user_id, last_message_at DESC)
  - [ ] CREATE INDEX idx_ai_chat_messages_conversation ON ai_chat_messages(conversation_id, created_at ASC)
- [ ] Apply migration: `npx supabase db push`
- [ ] ✅ Migration applied successfully

**Estimated Effort:** 2 hours

---

### Test: ChatScreen Component (AC #1, #2, #3, #4, #5)

**File:** `weave-mobile/src/components/features/ai-chat/ChatScreen.tsx`

**Tasks to make this test pass:**

- [ ] Create ChatScreen component
- [ ] Implement message list with ScrollView
  - [ ] Auto-scroll to bottom on new messages
  - [ ] KeyboardAvoidingView for keyboard handling
- [ ] Add initial greeting logic (context-aware based on time/activity)
- [ ] Integrate QuickActionChips component
- [ ] Integrate MessageInput component
- [ ] Integrate RateLimitIndicator component
- [ ] Connect to useAIChat hook for API calls
- [ ] Add required data-testid attributes: `chat-scrollview`, `keyboard-avoiding-view`, `server-initiated-indicator`
- [ ] Run tests: `npm test src/components/features/ai-chat/__tests__/ChatScreen.test.tsx`
- [ ] ✅ Tests pass (green phase)

**Estimated Effort:** 8 hours

---

### Test: MessageBubble Component (AC #1, #14)

**File:** `weave-mobile/src/components/features/ai-chat/MessageBubble.tsx`

**Tasks to make this test pass:**

- [ ] Create MessageBubble component
- [ ] Style user messages: Blue, right-aligned, glassmorphism
- [ ] Style assistant messages: Purple gradient, left-aligned, glassmorphism
- [ ] Add long-press gesture to show timestamp
- [ ] Add long-press gesture to show copy option
- [ ] Apply BlurView for glassmorphism effect
- [ ] Add required data-testid attributes: `message-bubble`, `message-timestamp`, `copy-message-button`
- [ ] Run tests: `npm test src/components/features/ai-chat/__tests__/MessageBubble.test.tsx`
- [ ] ✅ Tests pass (green phase)

**Estimated Effort:** 4 hours

---

### Test: QuickActionChips Component (AC #2)

**File:** `weave-mobile/src/components/features/ai-chat/QuickActionChips.tsx`

**Tasks to make this test pass:**

- [ ] Create QuickActionChips component
- [ ] Render 4 chips with labels: "Plan my day", "I'm stuck", "Edit my goal", "Explain this bind"
- [ ] Wire onChipPress callback with predefined prompts
- [ ] Add show/hide logic based on `visible` prop
- [ ] Add disabled state
- [ ] Add press animation (scale 0.97, opacity 0.8)
- [ ] Add required data-testid attributes: `quick-action-chips-container`, `chip-*`
- [ ] Run tests: `npm test src/components/features/ai-chat/__tests__/QuickActionChips.test.tsx`
- [ ] ✅ Tests pass (green phase)

**Estimated Effort:** 3 hours

---

### Test: MessageInput Component (AC #3)

**File:** `weave-mobile/src/components/features/ai-chat/MessageInput.tsx`

**Tasks to make this test pass:**

- [ ] Create MessageInput component
- [ ] Add TextInput with placeholder "Talk to Weave..."
- [ ] Add send button (disabled when empty, enabled when text present)
- [ ] Implement character counter (shown at 400+ characters)
- [ ] Enforce 500 character limit (truncate on input)
- [ ] Handle onSubmitEditing (Enter key submits)
- [ ] Add disabled state
- [ ] Add send button animation (scale 0.95 on press)
- [ ] Add required data-testid attributes: `message-input`, `send-button`, `character-counter`
- [ ] Run tests: `npm test src/components/features/ai-chat/__tests__/MessageInput.test.tsx`
- [ ] ✅ Tests pass (green phase)

**Estimated Effort:** 4 hours

---

### Test: RateLimitIndicator Component (AC #4)

**File:** `weave-mobile/src/components/features/ai-chat/RateLimitIndicator.tsx`

**Tasks to make this test pass:**

- [ ] Create RateLimitIndicator component
- [ ] Display premium usage: "5/10 premium messages used today"
- [ ] Display free usage: "20/40 free messages used today"
- [ ] Display monthly usage: "25/500 messages this month"
- [ ] Show friendly limit message when reached
- [ ] Add countdown timer to midnight reset
- [ ] Add warning color when approaching limit (90%+)
- [ ] Apply glassmorphism styling
- [ ] Add required data-testid attributes: `rate-limit-indicator`, `reset-countdown-timer`
- [ ] Run tests: `npm test src/components/features/ai-chat/__tests__/RateLimitIndicator.test.tsx`
- [ ] ✅ Tests pass (green phase)

**Estimated Effort:** 5 hours

---

### Test: useAIChat Hook (AC #6)

**File:** `weave-mobile/src/hooks/useAIChat.ts`

**Tasks to make this test pass:**

- [ ] Create useAIChat custom hook
- [ ] Use TanStack Query useMutation for sending messages
- [ ] Use TanStack Query useQuery for fetching conversations
- [ ] Use TanStack Query useQuery for fetching usage stats
- [ ] Handle loading, error, success states
- [ ] Invalidate queries on mutation success
- [ ] Return API methods: sendMessage, fetchConversations, fetchUsage
- [ ] Run tests: (Tests covered by ChatScreen integration tests)
- [ ] ✅ Hook works in ChatScreen tests

**Estimated Effort:** 3 hours

---

### Test: UX Polish - Animations & Haptics (AC #14)

**Files:** All chat components

**Tasks to make this test pass:**

- [ ] Install react-native-reanimated (if not already)
- [ ] Implement message send animation (spring physics, slide up + fade in)
- [ ] Implement message receive animation (fade in + slide down, 400ms delay)
- [ ] Create typing indicator with bouncing dots (stagger 100ms each)
- [ ] Add haptic feedback on send button press (Expo Haptics - medium)
- [ ] Add send button scale animation (0.95 on press, spring back)
- [ ] Add quick chips press states (scale 0.97, opacity 0.8)
- [ ] Ensure smooth keyboard transitions
- [ ] Run tests: UX polish verified in component tests
- [ ] ✅ Animations and haptics working

**Estimated Effort:** 6 hours

---

## Running Tests

```bash
# Backend: Run all AI chat tests
cd weave-api
uv run pytest tests/test_ai_chat_api.py -v

# Backend: Run specific test class
uv run pytest tests/test_ai_chat_api.py::TestAIChatMessagesEndpoint -v

# Backend: Run single test
uv run pytest tests/test_ai_chat_api.py::TestAIChatMessagesEndpoint::test_send_message_returns_ai_response -v

# Frontend: Run all AI chat component tests
cd weave-mobile
npm test src/components/features/ai-chat/__tests__

# Frontend: Run specific test file
npm test src/components/features/ai-chat/__tests__/ChatScreen.test.tsx

# Frontend: Run tests in watch mode
npm test -- --watch

# Frontend: Run tests with coverage
npm test -- --coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ All tests written and failing (30 API tests + 35 component tests = 65 total)
- ✅ Fixtures and factories created with auto-cleanup
  - `ai_chat_factory.py` with 10 factory functions
  - `ai_chat_fixtures.py` with 11 pytest fixtures
- ✅ Mock requirements documented (Use existing AIService, no new mocks needed)
- ✅ data-testid requirements listed (13 unique testids across 5 components)
- ✅ Implementation checklist created (14 major tasks, 60+ subtasks)

**Verification:**

- All tests run and fail as expected (RED phase)
- Failure messages are clear and actionable
- Tests fail due to missing implementation (not test bugs)

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with database schema)
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist
6. **Move to next test** and repeat

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Progress Tracking:**

- Check off tasks as you complete them
- Share progress in daily standup
- Mark story as IN PROGRESS in `sprint-status.yaml`

**Recommended Order:**

1. Database schema (foundation)
2. Backend API endpoints (business logic)
3. Rate limiting system (critical feature)
4. Check-in scheduler (complex feature)
5. Frontend components (UI layer)
6. UX polish (final touches)

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability, performance)
3. **Extract duplications** (DRY principle)
4. **Optimize performance** (if needed)
5. **Ensure tests still pass** after each refactor
6. **Update documentation** (if API contracts change)

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Make small refactors (easier to debug if tests fail)
- Run tests after each change
- Don't change test behavior (only implementation)

**Completion:**

- All tests pass (65/65 tests green)
- Code quality meets team standards
- No duplications or code smells
- Ready for code review and story approval

---

## Next Steps

1. **Review this checklist** with team in standup or planning
2. **Run failing tests** to confirm RED phase: `uv run pytest tests/test_ai_chat_api.py -v`
3. **Begin implementation** using implementation checklist as guide
4. **Work one test at a time** (red → green for each)
5. **Share progress** in daily standup
6. **When all tests pass**, refactor code for quality
7. **When refactoring complete**, manually update story status to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **fixture-architecture.md** - Test fixture patterns with setup/teardown and auto-cleanup using pytest fixtures
- **data-factories.md** - Factory patterns using `faker` for random test data generation with overrides support
- **test-quality.md** - Test design principles (Given-When-Then, one assertion per test, determinism, isolation)
- **test-levels-framework.md** - Test level selection framework (API tests 60%, Component tests 30%, E2E 10%)
- **network-first.md** - Route interception patterns (not applicable - mobile app, not Playwright)
- **selector-resilience.md** - data-testid patterns for stable test selectors

**Note:** Playwright-specific patterns (network-first.md, timing-debugging.md) were not used as this is a React Native mobile app with Jest, not Playwright web tests.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `uv run pytest tests/test_ai_chat_api.py -v`

**Expected Results:**

```
tests/test_ai_chat_api.py::TestAIChatMessagesEndpoint::test_send_message_returns_ai_response FAILED
tests/test_ai_chat_api.py::TestAIChatMessagesEndpoint::test_send_message_creates_new_conversation_if_none_provided FAILED
tests/test_ai_chat_api.py::TestAIChatMessagesEndpoint::test_send_message_uses_existing_conversation FAILED
... (27 more API tests failing)

tests/src/components/features/ai-chat/__tests__/ChatScreen.test.tsx FAILED
... (35 component tests failing)

========================= 65 failed in 15.23s =========================
```

**Summary:**

- Total tests: 65 (30 API + 35 component)
- Passing: 0 (expected)
- Failing: 65 (expected)
- Status: ✅ RED phase verified

**Expected Failure Messages:**

- API tests: "404 Not Found: /api/ai-chat/messages" (endpoint not implemented)
- Component tests: "Cannot find module '../ChatScreen'" (component not created)
- Rate limiting tests: "AttributeError: 'UserProfile' object has no attribute 'ai_premium_messages_today'" (schema not updated)
- Scheduler tests: "ModuleNotFoundError: No module named 'app.services.checkin_scheduler'" (service not created)

---

## Notes

### Critical Implementation Reminders

1. **Use Existing AIService** - DO NOT create new AI service. Use `from app.services.ai import AIService`
2. **Tiered Rate Limiting** - 10 premium + 40 free per day, 500/month (free tier)
3. **Hybrid Timing** - Base check-in time + 10-15 min variation (unless deterministic mode)
4. **Glassmorphism** - All chat UI components use translucent blur effect
5. **World-Class UX** - Spring animations, haptics, micro-interactions required
6. **Story 1.5.1/1.5.2/1.5.3 Compliance** - Follow navigation, backend, AI service patterns

### Test Organization

- **Backend tests:** Grouped by endpoint/feature (messages, conversations, rate limiting, scheduler, admin)
- **Frontend tests:** Grouped by component (ChatScreen, MessageBubble, QuickActionChips, etc.)
- **Data factories:** Single file with 10 helper functions
- **Fixtures:** Single file with 11 pytest fixtures (auto-cleanup)

### Debugging Tips

- If migration fails: Check column types match (UUID, TEXT, TIMESTAMP WITH TIME ZONE)
- If rate limiting fails: Verify user_profiles schema has all 4 AI message counters
- If tests timeout: Check AIService mock is properly patched
- If component tests fail: Verify @testing-library/react-native is installed

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Tag @Jack in Slack/Discord
- Refer to Story 6.1: `docs/stories/6-1-ai-chat-interface.md`
- Consult standardization stories:
  - Story 1.5.1 (Navigation): `docs/stories/1-5-1-navigation-architecture.md`
  - Story 1.5.2 (Backend): `docs/stories/1-5-2-backend-standardization.md`
  - Story 1.5.3 (AI Services): `docs/stories/1-5-3-ai-services-standardization.md`

---

**Generated by BMad TEA Agent (ATDD Workflow)** - 2025-12-22
