# Story 1.8b: AI Goal Breakdown

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **new user who has entered their first Needle (goal)**,
I want **AI to generate a structured breakdown with milestones and daily binds**,
So that **I have a clear, actionable plan that feels achievable and personalized**.

## Acceptance Criteria

### AC #1: AI Input Requirements
- [ ] Receive goal text from Story 1.7 (user's first Needle input)
- [ ] Receive user context from onboarding:
  - Selected painpoints (from Story 1.2)
  - Identity traits (from Story 1.6)
  - Weave personality preference (from Story 1.6)
  - Optional: User name for personalization
- [ ] Validate input: goal text must be 10-200 characters
- [ ] If validation fails, return error to Story 1.7

### AC #2: AI Prompt Engineering
- [ ] Construct prompt with deterministic constraints:
  - **Goal**: User's input goal
  - **Context**: Painpoints, identity traits, personality
  - **Output Structure**:
    - 1 goal title (5-10 words, aspirational but grounded)
    - 1 goal summary (2-4 sentences, why this matters + expected outcome)
    - 2-3 milestones (intermediate checkpoints, ordered by sequence)
    - 2-4 binds (daily/weekly actions, ~70% success probability)
  - **Constraints**:
    - Binds must be specific, measurable, achievable (~5-15 min commitment)
    - Avoid vague language ("be more consistent" → "complete 1 workout daily")
    - Match user's personality tone (Supportive Direct vs Tough Warm)
    - Consider user's painpoints (e.g., if "Consistency", emphasize daily habits)
- [ ] Prompt must request structured JSON output for easy parsing

### AC #3: AI Model Selection & Fallback Chain
- [ ] **Primary Model**: GPT-4o-mini (OpenAI)
  - Cost: $0.15/$0.60 per MTok (input/output)
  - Use for 90% of goal breakdowns (routine operation)
  - Target latency: <3 seconds
- [ ] **Secondary Model**: Claude 3.7 Sonnet (Anthropic)
  - Cost: $3.00/$15.00 per MTok
  - Fallback if OpenAI times out (>5s) or returns error
  - Target latency: <5 seconds
- [ ] **Deterministic Template Fallback**:
  - If both AI providers fail, use predefined templates
  - Map goal category (fitness, learning, work, creative, etc.) to template
  - Templates stored in `constants/goalBreakdownTemplates.ts`
  - Example template for "fitness":
    ```typescript
    {
      goal_title: "Build a consistent fitness routine",
      goal_summary: "Establish sustainable exercise habits that fit your schedule...",
      milestones: [
        { title: "Complete first week", description: "7 consecutive days of movement" },
        { title: "Hit 21-day mark", description: "Habit formation threshold" },
        { title: "30-day milestone", description: "Full month of consistency" }
      ],
      binds: [
        { name: "Morning movement", description: "10-min stretch or walk", frequency: "Daily" },
        { name: "Track workout", description: "Log each session in app", frequency: "Daily" },
        { name: "Reflect on progress", description: "Weekly check-in", frequency: "Weekly" }
      ]
    }
    ```

### AC #4: AI Response Parsing & Validation
- [ ] Parse AI response as JSON
- [ ] Validate required fields exist:
  - `goal_title` (string, 5-50 chars)
  - `goal_summary` (string, 50-300 chars)
  - `milestones` (array, 2-3 items)
  - `binds` (array, 2-4 items)
- [ ] Validate milestone structure:
  - Each has `title` (string, required)
  - Each has optional `description` (string)
- [ ] Validate bind structure:
  - Each has `name` (string, required)
  - Each has `description` (string, required)
  - Each has optional `frequency` (string: "Daily", "3x/week", etc.)
- [ ] If validation fails, retry with secondary model or use template fallback

### AC #5: Success Response Format
- [ ] Return structured response to Story 1.8a (UI component):
  ```typescript
  {
    success: true,
    data: {
      goal_title: string,
      goal_summary: string,
      milestones: Array<{id: string, title: string, description?: string}>,
      binds: Array<{id: string, name: string, description: string, frequency?: string}>,
      ai_model_used: "gpt-4o-mini" | "claude-sonnet" | "template",
      generation_time_ms: number
    }
  }
  ```
- [ ] Generate unique IDs for milestones and binds (e.g., `uuid` or `timestamp-index`)
- [ ] Include metadata: which AI model was used, generation time

### AC #6: Error Response Format
- [ ] Return error response if all fallbacks fail:
  ```typescript
  {
    success: false,
    error: {
      code: "AI_GENERATION_FAILED" | "VALIDATION_FAILED" | "TIMEOUT",
      message: string, // User-friendly message
      retryable: boolean, // Can user retry?
      details?: string // Technical details for debugging
    }
  }
  ```
- [ ] Error codes:
  - `AI_GENERATION_FAILED`: Both OpenAI and Anthropic failed
  - `VALIDATION_FAILED`: Goal input doesn't meet requirements
  - `TIMEOUT`: AI took >10 seconds
  - `RATE_LIMIT_EXCEEDED`: User hit rate limit (10 calls/hour)

### AC #7: Cost Tracking & Logging
- [ ] Log AI API call with metadata:
  - User ID (anonymized)
  - Goal input (first 50 chars only for privacy)
  - Model used
  - Tokens consumed (input + output)
  - Cost calculated ($)
  - Latency (ms)
  - Success/failure status
- [ ] Store in `ai_runs` table (DEFERRED: Story 0-6 backend)
- [ ] For MVP: Console log with TODO comment for database integration
- [ ] Track daily AI budget: Alert if approaching $83.33/day limit ($2,500/month budget)

### AC #8: Rate Limiting
- [ ] Enforce rate limit: 10 AI calls per user per hour
- [ ] Check user's recent AI call count before processing
- [ ] If rate limit exceeded, return error with retry_after timestamp
- [ ] Rate limit tracking: In-memory for MVP, Redis for production (DEFERRED)
- [ ] For MVP: Simple counter in local storage or context, reset every hour

### AC #9: Personalization Logic
- [ ] **Painpoint-Based Adjustments**:
  - **Clarity**: Focus on one clear direction, avoid overwhelming options
  - **Action**: Emphasize starting small, bias toward immediate actions
  - **Consistency**: Daily binds, streak-friendly habits, emphasis on routine
  - **Alignment**: Frame goal as identity-building, use aspirational language
- [ ] **Identity Trait Integration**:
  - If user selected "Disciplined" → Suggest structured, scheduled binds
  - If user selected "Creative" → Allow flexible binds, emphasize exploration
  - If user selected "Focused" → Fewer binds, deeper commitment
  - If user selected "Balanced" → Variety of bind types (mental, physical, social)
- [ ] **Personality Tone Matching**:
  - Supportive Direct: Grounded, honest language ("You'll start by...")
  - Tough Warm: Casual, lowercase, emoji-light ("alright, here's your path...")

### AC #10: Performance Requirements
- [ ] AI call must complete in <5 seconds (90th percentile)
- [ ] Total latency (prompt construction → parsing → response) <7 seconds
- [ ] If AI takes >10 seconds, trigger timeout and use template fallback
- [ ] Monitor P50, P90, P99 latencies for optimization

---

## Tasks / Subtasks

### Task 1: Input Validation & Context Gathering (AC: #1)
- [ ] **Subtask 1.1**: Receive goal text from Story 1.7 via API or function call
- [ ] **Subtask 1.2**: Validate goal text (10-200 chars, not empty)
- [ ] **Subtask 1.3**: Retrieve user context from onboarding state:
  - Painpoints (Story 1.2)
  - Identity traits (Story 1.6)
  - Weave personality (Story 1.6)
- [ ] **Subtask 1.4**: Return validation error if input invalid

### Task 2: AI Prompt Construction (AC: #2, #9)
- [ ] **Subtask 2.1**: Create prompt template with placeholders
- [ ] **Subtask 2.2**: Inject user goal + context into prompt
- [ ] **Subtask 2.3**: Apply personalization logic based on painpoints
- [ ] **Subtask 2.4**: Apply personalization logic based on identity traits
- [ ] **Subtask 2.5**: Adjust tone based on personality preference
- [ ] **Subtask 2.6**: Request structured JSON output from AI
- [ ] **Subtask 2.7**: Add constraints (2-3 milestones, 2-4 binds, ~70% success probability)

### Task 3: AI Model Integration (AC: #3)
- [ ] **Subtask 3.1**: Set up OpenAI API client (GPT-4o-mini)
- [ ] **Subtask 3.2**: Set up Anthropic API client (Claude 3.7 Sonnet)
- [ ] **Subtask 3.3**: Implement fallback chain logic:
  1. Try OpenAI (timeout: 5s)
  2. If fails, try Anthropic (timeout: 5s)
  3. If both fail, use template fallback
- [ ] **Subtask 3.4**: Load deterministic templates from `constants/goalBreakdownTemplates.ts`
- [ ] **Subtask 3.5**: Map goal category (fitness, learning, etc.) to template

### Task 4: Response Parsing & Validation (AC: #4)
- [ ] **Subtask 4.1**: Parse AI response as JSON
- [ ] **Subtask 4.2**: Validate required fields (goal_title, goal_summary, milestones, binds)
- [ ] **Subtask 4.3**: Validate field lengths and types
- [ ] **Subtask 4.4**: Generate unique IDs for milestones and binds
- [ ] **Subtask 4.5**: If validation fails, retry with secondary model

### Task 5: Success Response (AC: #5)
- [ ] **Subtask 5.1**: Structure success response with `data` object
- [ ] **Subtask 5.2**: Include metadata: ai_model_used, generation_time_ms
- [ ] **Subtask 5.3**: Return response to Story 1.8a (UI component)

### Task 6: Error Handling (AC: #6)
- [ ] **Subtask 6.1**: Define error response format
- [ ] **Subtask 6.2**: Handle AI_GENERATION_FAILED (both providers failed)
- [ ] **Subtask 6.3**: Handle VALIDATION_FAILED (invalid input)
- [ ] **Subtask 6.4**: Handle TIMEOUT (>10 seconds)
- [ ] **Subtask 6.5**: Handle RATE_LIMIT_EXCEEDED
- [ ] **Subtask 6.6**: Return user-friendly error messages

### Task 7: Cost Tracking & Logging (AC: #7)
- [ ] **Subtask 7.1**: Calculate tokens consumed (input + output)
- [ ] **Subtask 7.2**: Calculate cost based on model pricing
- [ ] **Subtask 7.3**: Log AI call metadata (console for MVP)
- [ ] **Subtask 7.4**: Add TODO comment for `ai_runs` table integration (Story 0-6)
- [ ] **Subtask 7.5**: Track daily AI budget (alert at 80% of $83.33)

### Task 8: Rate Limiting (AC: #8)
- [ ] **Subtask 8.1**: Implement in-memory rate limit counter (MVP)
- [ ] **Subtask 8.2**: Check user's AI call count before processing
- [ ] **Subtask 8.3**: Return error if rate limit exceeded (10 calls/hour)
- [ ] **Subtask 8.4**: Add TODO comment for Redis-based rate limiting (production)

### Task 9: Deterministic Template Fallback (AC: #3)
- [ ] **Subtask 9.1**: Create `constants/goalBreakdownTemplates.ts` file
- [ ] **Subtask 9.2**: Define templates for common goal categories:
  - Fitness/Health
  - Learning/Skills
  - Work/Productivity
  - Creative Projects
  - Relationships/Social
  - Financial Goals
  - Generic/Other
- [ ] **Subtask 9.3**: Implement category detection logic (keyword matching)
- [ ] **Subtask 9.4**: Return template if both AI providers fail

### Task 10: Performance Monitoring (AC: #10)
- [ ] **Subtask 10.1**: Measure latency (start to finish)
- [ ] **Subtask 10.2**: Log P50, P90, P99 latencies
- [ ] **Subtask 10.3**: Trigger timeout at 10 seconds
- [ ] **Subtask 10.4**: Optimize prompt length if needed (reduce tokens)

### Task 11: Testing
- [ ] **Subtask 11.1**: Unit test prompt construction logic
- [ ] **Subtask 11.2**: Unit test response parsing and validation
- [ ] **Subtask 11.3**: Integration test with OpenAI API (use test key)
- [ ] **Subtask 11.4**: Integration test with Anthropic API (use test key)
- [ ] **Subtask 11.5**: Test fallback chain (mock API failures)
- [ ] **Subtask 11.6**: Test template fallback (all AI providers fail)
- [ ] **Subtask 11.7**: Test personalization logic (different painpoints, traits)
- [ ] **Subtask 11.8**: Test rate limiting (exceed 10 calls/hour)
- [ ] **Subtask 11.9**: Test error scenarios (invalid input, timeout, etc.)
- [ ] **Subtask 11.10**: Manual end-to-end test: Story 1.7 → 1.8b → 1.8a

---

## Dev Notes

### 🎯 IMPLEMENTATION SCOPE: AI BACKEND LOGIC

**Focus:** AI prompt engineering, model integration, fallback chain, cost tracking

**DEPENDENCIES:**
- **Story 1.7 (First Needle)**: Receives goal input from Story 1.7
- **Story 1.8a (Weave Path UI)**: Sends breakdown data to Story 1.8a for display

**DEFERRED to Later Stories:**
- ❌ Database writes to `ai_runs` table (Story 0-6 backend integration)
- ❌ Redis-based rate limiting (production optimization)
- ❌ Advanced cost analytics dashboard (post-MVP)

**Backend Implementation:**
- ✅ AI prompt construction with user context
- ✅ OpenAI API integration (GPT-4o-mini primary)
- ✅ Anthropic API integration (Claude 3.7 Sonnet fallback)
- ✅ Deterministic template fallback (category-based)
- ✅ Response parsing and validation
- ✅ Cost tracking and logging (console for MVP)
- ✅ In-memory rate limiting (10 calls/hour)
- ✅ Error handling with user-friendly messages

---

### Architecture Compliance

**Backend Stack:**
- FastAPI (Python 3.11+)
- OpenAI Python SDK (`openai` package)
- Anthropic Python SDK (`anthropic` package)
- Pydantic for request/response validation
- Environment variables for API keys

**File Structure:**
```
weave-api/
├── app/
│   ├── api/
│   │   └── onboarding.py                  # API endpoint for goal breakdown
│   ├── services/
│   │   ├── ai_service.py                  # AI model abstraction layer
│   │   └── goal_breakdown_service.py      # Business logic for goal breakdown
│   ├── core/
│   │   ├── config.py                      # API keys, rate limits, budgets
│   │   └── prompts.py                     # AI prompt templates
│   └── models/
│       └── goal_breakdown.py              # Pydantic models for request/response
└── constants/
    └── goalBreakdownTemplates.py         # Deterministic fallback templates
```

**Naming Conventions:**
- Files: snake_case (goal_breakdown_service.py, ai_service.py)
- Functions: snake_case (generate_goal_breakdown, parse_ai_response)
- Classes: PascalCase (GoalBreakdownRequest, GoalBreakdownResponse)
- Variables: snake_case (goal_text, milestones_data)

**API Endpoint:**
```python
POST /api/onboarding/goal-breakdown
Request Body:
{
  "goal_text": string,
  "user_context": {
    "painpoints": Array<string>,
    "identity_traits": Array<string>,
    "personality": "supportive_direct" | "tough_warm",
    "user_name": string (optional)
  }
}

Response (Success):
{
  "success": true,
  "data": {
    "goal_title": string,
    "goal_summary": string,
    "milestones": Array<{id: string, title: string, description?: string}>,
    "binds": Array<{id: string, name: string, description: string, frequency?: string}>,
    "ai_model_used": string,
    "generation_time_ms": number
  }
}

Response (Error):
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "retryable": boolean
  }
}
```

**AI Service Abstraction:**
```python
# app/services/ai_service.py
class AIService:
    async def generate_goal_breakdown(
        self,
        goal_text: str,
        user_context: UserContext,
        timeout: int = 5
    ) -> GoalBreakdownResponse:
        """
        Primary: OpenAI GPT-4o-mini
        Fallback: Anthropic Claude 3.7 Sonnet
        Last Resort: Deterministic template
        """
        try:
            # Try OpenAI first
            response = await self._call_openai(goal_text, user_context, timeout)
            return response
        except (TimeoutError, OpenAIError):
            # Fallback to Anthropic
            try:
                response = await self._call_anthropic(goal_text, user_context, timeout)
                return response
            except (TimeoutError, AnthropicError):
                # Use template fallback
                return self._get_template_fallback(goal_text, user_context)
```

---

### AI Prompt Engineering

**Prompt Template (OpenAI GPT-4o-mini):**
```python
GOAL_BREAKDOWN_PROMPT = """You are Weave, an AI coach helping users build transformational habits.

User's Goal: {goal_text}

User Context:
- Painpoints: {painpoints} (struggles they're experiencing)
- Identity Traits: {identity_traits} (who they want to become)
- Personality Preference: {personality} (tone they prefer)

Generate a structured goal breakdown with:
1. **Goal Title**: Aspirational but grounded, 5-10 words
2. **Goal Summary**: 2-4 sentences explaining why this matters and expected outcome
3. **Milestones**: 2-3 intermediate checkpoints (ordered by sequence)
4. **Binds**: 2-4 daily/weekly actions (~70% success probability, 5-15 min commitment)

Constraints:
- Binds must be specific, measurable, achievable (e.g., "Complete 1 workout daily" not "Be more consistent")
- Match user's personality tone: {personality_tone_guidance}
- Consider painpoints: {painpoint_guidance}
- Use identity traits for motivation: {identity_guidance}

Output Format (JSON):
{{
  "goal_title": "string",
  "goal_summary": "string",
  "milestones": [
    {{"title": "string", "description": "string (optional)"}}
  ],
  "binds": [
    {{"name": "string", "description": "string", "frequency": "Daily|3x/week|Weekly"}}
  ]
}}
"""

# Personality Tone Guidance
PERSONALITY_TONES = {
    "supportive_direct": "Use grounded, honest language. Be confidence-building without coddling. Example: 'You'll start by...'",
    "tough_warm": "Use casual, Gen Z-coded language with dry humor. Be gently confrontational. Use lowercase and minimal emojis. Example: 'alright, here's your path...'"
}

# Painpoint Guidance
PAINPOINT_ADJUSTMENTS = {
    "Clarity": "Focus on one clear direction. Avoid overwhelming with options. Emphasize starting point.",
    "Action": "Emphasize starting small. Bias toward immediate actions. Break down barriers to starting.",
    "Consistency": "Daily binds preferred. Streak-friendly habits. Emphasize routine and ritual.",
    "Alignment": "Frame goal as identity-building. Use aspirational language. Connect to values."
}

# Identity Trait Guidance
IDENTITY_TRAIT_ADJUSTMENTS = {
    "Disciplined": "Suggest structured, scheduled binds. Emphasize routine and commitment.",
    "Creative": "Allow flexible binds. Emphasize exploration and experimentation.",
    "Focused": "Fewer binds, deeper commitment. Minimize distractions.",
    "Balanced": "Variety of bind types (mental, physical, social). Holistic approach."
}
```

---

### Cost Tracking & Budget Management

**AI Model Pricing (Jan 2025):**
- **GPT-4o-mini**: $0.15 input / $0.60 output per 1M tokens
- **Claude 3.7 Sonnet**: $3.00 input / $15.00 output per 1M tokens

**Typical Goal Breakdown Token Usage:**
- Input tokens: ~500 (prompt + user context)
- Output tokens: ~300 (goal title, summary, milestones, binds)
- **GPT-4o-mini cost per call**: $0.00026 (~$0.0003)
- **Claude Sonnet cost per call**: $0.0060 (~$0.006)

**Daily Budget Calculation:**
- Budget: $2,500/month = $83.33/day
- If 100% GPT-4o-mini: ~277,000 calls/day (unrealistic, just for reference)
- **Realistic estimate**: 10,000 users × 2 calls/day = 20,000 calls/day × $0.0003 = $6/day
- **Buffer for retries and fallbacks**: ~$20/day

**Budget Alerts:**
```python
# app/core/config.py
DAILY_AI_BUDGET = 83.33  # $83.33/day
BUDGET_ALERT_THRESHOLD = 0.8  # Alert at 80%

# Track daily spend
def track_ai_cost(model: str, input_tokens: int, output_tokens: int):
    cost = calculate_cost(model, input_tokens, output_tokens)
    daily_spend = get_daily_spend()  # From cache or database
    daily_spend += cost

    if daily_spend >= DAILY_AI_BUDGET * BUDGET_ALERT_THRESHOLD:
        send_alert(f"AI budget at {(daily_spend/DAILY_AI_BUDGET)*100:.1f}%")

    if daily_spend >= DAILY_AI_BUDGET:
        # Auto-throttle: Use cache-only mode
        enable_cache_only_mode()
```

---

### Deterministic Template Fallback

**Template Structure:**
```python
# constants/goalBreakdownTemplates.py
GOAL_TEMPLATES = {
    "fitness": {
        "goal_title": "Build a consistent fitness routine",
        "goal_summary": "Establish sustainable exercise habits that fit your schedule and gradually increase in intensity over time.",
        "milestones": [
            {"title": "Complete first week", "description": "7 consecutive days of movement"},
            {"title": "Hit 21-day mark", "description": "Habit formation threshold"},
            {"title": "30-day milestone", "description": "Full month of consistency"}
        ],
        "binds": [
            {"name": "Morning movement", "description": "10-min stretch or walk", "frequency": "Daily"},
            {"name": "Track workout", "description": "Log each session in app", "frequency": "Daily"},
            {"name": "Reflect on progress", "description": "Weekly check-in", "frequency": "Weekly"}
        ]
    },
    "learning": {
        "goal_title": "Master a new skill consistently",
        "goal_summary": "Build deep expertise through deliberate daily practice, focusing on fundamentals first.",
        "milestones": [
            {"title": "Foundation phase", "description": "Understand core concepts"},
            {"title": "Application phase", "description": "Apply knowledge to projects"},
            {"title": "Mastery phase", "description": "Teach or create with skill"}
        ],
        "binds": [
            {"name": "Daily practice session", "description": "20-30 min focused learning", "frequency": "Daily"},
            {"name": "Document learnings", "description": "Write what you learned", "frequency": "Daily"},
            {"name": "Apply new knowledge", "description": "Build something with it", "frequency": "Weekly"}
        ]
    },
    # Add more templates: work, creative, relationships, financial, generic
}

def get_template_for_goal(goal_text: str) -> dict:
    """Match goal to template category via keyword detection"""
    goal_lower = goal_text.lower()

    fitness_keywords = ["fitness", "workout", "exercise", "gym", "health", "run", "weight"]
    learning_keywords = ["learn", "skill", "study", "course", "master", "practice"]

    if any(kw in goal_lower for kw in fitness_keywords):
        return GOAL_TEMPLATES["fitness"]
    elif any(kw in goal_lower for kw in learning_keywords):
        return GOAL_TEMPLATES["learning"]
    else:
        return GOAL_TEMPLATES["generic"]  # Fallback generic template
```

---

### Rate Limiting Implementation (MVP)

**In-Memory Rate Limiting (Simple):**
```python
# app/services/rate_limiter.py
from collections import defaultdict
from datetime import datetime, timedelta

class RateLimiter:
    def __init__(self, max_calls: int = 10, window_minutes: int = 60):
        self.max_calls = max_calls
        self.window_minutes = window_minutes
        self.user_calls = defaultdict(list)  # {user_id: [timestamp, timestamp, ...]}

    def is_allowed(self, user_id: str) -> bool:
        now = datetime.now()
        window_start = now - timedelta(minutes=self.window_minutes)

        # Remove old timestamps outside window
        self.user_calls[user_id] = [
            ts for ts in self.user_calls[user_id] if ts > window_start
        ]

        # Check if under limit
        if len(self.user_calls[user_id]) < self.max_calls:
            self.user_calls[user_id].append(now)
            return True
        else:
            return False

    def get_retry_after(self, user_id: str) -> int:
        """Returns seconds until user can make another call"""
        if not self.user_calls[user_id]:
            return 0

        oldest_call = min(self.user_calls[user_id])
        retry_after = (oldest_call + timedelta(minutes=self.window_minutes)) - datetime.now()
        return max(0, int(retry_after.total_seconds()))

# Usage
rate_limiter = RateLimiter(max_calls=10, window_minutes=60)

@app.post("/api/onboarding/goal-breakdown")
async def goal_breakdown(request: GoalBreakdownRequest, user_id: str = Depends(get_current_user)):
    if not rate_limiter.is_allowed(user_id):
        retry_after = rate_limiter.get_retry_after(user_id)
        raise HTTPException(
            status_code=429,
            detail={
                "code": "RATE_LIMIT_EXCEEDED",
                "message": f"You've reached the limit of 10 goal breakdowns per hour. Try again in {retry_after//60} minutes.",
                "retryable": True,
                "retry_after": retry_after
            }
        )

    # Process AI request
    ...
```

**Production Rate Limiting (Redis - DEFERRED):**
```python
# Future implementation using Redis for distributed rate limiting
# TODO: Implement in Story 0-6 or post-MVP optimization
```

---

### Testing Strategy

**Unit Tests (pytest):**
```python
# tests/test_goal_breakdown_service.py

def test_prompt_construction():
    """Test that prompt includes user context correctly"""
    goal_text = "Build fitness routine"
    user_context = UserContext(
        painpoints=["Consistency"],
        identity_traits=["Disciplined", "Focused"],
        personality="supportive_direct"
    )

    prompt = construct_prompt(goal_text, user_context)

    assert "Consistency" in prompt
    assert "Disciplined" in prompt
    assert "supportive_direct" in prompt

def test_response_parsing():
    """Test AI response parsing and validation"""
    ai_response = """
    {
      "goal_title": "Build consistent fitness routine",
      "goal_summary": "Establish sustainable exercise habits...",
      "milestones": [...],
      "binds": [...]
    }
    """

    parsed = parse_ai_response(ai_response)

    assert parsed.goal_title == "Build consistent fitness routine"
    assert len(parsed.milestones) >= 2
    assert len(parsed.binds) >= 2

def test_template_fallback():
    """Test template selection based on goal keywords"""
    goal = "I want to workout more"
    template = get_template_for_goal(goal)

    assert template["goal_title"] == "Build a consistent fitness routine"
```

**Integration Tests (with mocked AI):**
```python
# tests/test_ai_integration.py

@pytest.mark.asyncio
async def test_openai_integration():
    """Test OpenAI API integration (with mock or test key)"""
    service = AIService()
    response = await service.generate_goal_breakdown(
        goal_text="Learn Python programming",
        user_context=UserContext(...),
        timeout=5
    )

    assert response.success is True
    assert response.data.goal_title is not None
    assert len(response.data.milestones) in [2, 3]
    assert len(response.data.binds) in [2, 3, 4]

@pytest.mark.asyncio
async def test_fallback_chain():
    """Test fallback from OpenAI → Anthropic → Template"""
    service = AIService()

    # Mock OpenAI to fail
    with patch("openai.ChatCompletion.create", side_effect=TimeoutError):
        # Mock Anthropic to fail
        with patch("anthropic.Anthropic.messages.create", side_effect=TimeoutError):
            response = await service.generate_goal_breakdown(
                goal_text="Build fitness routine",
                user_context=UserContext(...),
                timeout=5
            )

            assert response.success is True
            assert response.data.ai_model_used == "template"
```

---

### References

- [Source: docs/epics.md#Epic 1 - Story 1.8b]
- [Source: docs/prd/epic-1-onboarding-optimized-hybrid-flow.md#US-1.8]
- [Source: docs/architecture/core-architectural-decisions.md#Data Access Patterns]
- [Source: docs/idea/ai.md#AI Cost Control Strategy]
- [Source: docs/idea/backend.md#AI Service Abstraction]

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
