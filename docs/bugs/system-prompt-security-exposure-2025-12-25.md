# System Prompt Reverse Engineering Security Vulnerability

**Date Discovered:** 2025-12-25
**Severity:** 🔴 **CRITICAL**
**Status:** 🔍 **INVESTIGATING**
**Affected Components:** AI Chat API, Frontend AI Integration
**Story Context:** Story 6.1 (AI Chat), Story 6.2 (Server-Initiated Check-ins)

---

## Problem Description

System prompts and AI orchestration logic may be exposed through API responses, client-side code, or network inspection, allowing malicious actors to reverse-engineer the AI coaching system, extract proprietary prompt engineering, or manipulate the AI's behavior.

### Security Risk Categories

1. **Prompt Extraction**: AI system prompts visible in client code or API responses
2. **Context Leakage**: User context-building logic exposed, revealing data aggregation patterns
3. **Module Logic Exposure**: AIOrchestrator routing logic and module selection criteria discoverable
4. **Rate Limit Bypass**: Understanding of rate limiting implementation enables circumvention
5. **Personality Manipulation**: Dream Self personality prompts extractable, enabling impersonation

---

## Root Causes

### 1. System Prompts in API Responses
**Issue**: Backend may include full system prompts in streaming responses or error messages.

**Example Exposure Vector**:
```typescript
// ❌ BAD: System prompt visible in response metadata
{
  "message": "Hello! How can I help?",
  "metadata": {
    "system_prompt": "You are a Dream Self coach named Alex...",
    "context": { "user_goals": [...], "personality": {...} }
  }
}
```

### 2. Client-Side Prompt Construction
**Issue**: Frontend code constructs prompts that reveal system instructions.

**Vulnerable Pattern** (hypothetical):
```typescript
// ❌ BAD: System instructions in client code
const systemPrompt = `You are ${personalityName}, a ${personalityType} coach.
Your goal is to help the user achieve their dreams by...`;
```

### 3. Network Inspection Exposure
**Issue**: Unencrypted or poorly encrypted API requests reveal:
- Full conversation history with system messages
- Context-building queries (goals, journal entries, completions)
- AIOrchestrator operation types and routing logic

### 4. Error Messages Leaking Logic
**Issue**: Detailed error messages expose internal architecture.

**Example**:
```json
{
  "error": "AIOrchestrator: operation 'generate_triad' failed at TriadPlanner module. Context keys missing: ['weekly_completion_rate', 'goal_priority_scores']"
}
```

### 5. Git Repository Exposure
**Issue**: If system prompts are committed to public repositories (even in history), they're permanently exposed.

---

## Attack Vectors

### Vector 1: Network Interception
**Method**: Attacker uses browser DevTools or proxy (Burp Suite, mitmproxy) to inspect API requests/responses.

**What They Can Extract**:
- Full system prompts from `/api/ai-chat/send` or `/api/ai-chat/stream`
- User context payloads (goals, journal entries, personality data)
- Operation types and module routing (e.g., `operation_type: 'chat_response'`)

**Impact**: Clone the coaching system, create competing products, manipulate users.

### Vector 2: Client Code Analysis
**Method**: Attacker decompiles/analyzes JavaScript bundle from mobile app or web app.

**What They Can Extract**:
- Prompt construction logic
- API endpoint structures
- Context-building patterns
- Rate limiting thresholds

**Impact**: Bypass rate limits, extract prompt engineering IP, reverse-engineer AI features.

### Vector 3: API Fuzzing
**Method**: Attacker sends malformed requests to trigger verbose error messages.

**Example**:
```bash
curl -X POST https://weave-api.com/api/ai-chat/send \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "test", "operation_type": "INVALID_TYPE"}'
```

**Expected Exposure**:
```json
{
  "error": {
    "code": "INVALID_OPERATION",
    "message": "Operation 'INVALID_TYPE' not found. Valid operations: ['generate_goal_breakdown', 'generate_triad', 'chat_response', 'generate_recap', 'generate_weekly_insights']",
    "valid_modules": ["OnboardingCoach", "TriadPlanner", "DreamSelfAdvisor", "DailyRecap", "AIInsightsEngine"]
  }
}
```

**Impact**: Full knowledge of AI architecture.

---

## Security Best Practices (MANDATORY)

### 1. Backend-Only Prompt Management
**Rule**: NEVER send system prompts or context-building logic to the client.

**Implementation**:
```python
# ✅ GOOD: System prompts stay on backend
async def execute_chat(user_id: str, message: str):
    # Build context on backend
    context = await build_user_context(user_id)

    # Construct system prompt on backend (NEVER send to client)
    system_prompt = f"""You are {context['personality']['name']},
    a {context['personality']['type']} coach..."""

    # Call AI provider (system prompt never leaves backend)
    response = await openai_provider.chat_completion(
        system_prompt=system_prompt,
        user_message=message
    )

    # ✅ Return ONLY the assistant's response (no prompt, no context)
    return {"message": response.content}
```

### 2. Minimal Error Messages
**Rule**: Production error messages should be generic, detailed errors only in logs.

**Implementation**:
```python
# ✅ GOOD: Generic error for client, detailed log for backend
try:
    result = await orchestrator.execute_ai_operation(operation_type, user_id)
except Exception as e:
    logger.error(f"AI operation failed: {operation_type}, user: {user_id}, error: {str(e)}")
    raise HTTPException(
        status_code=500,
        detail={"error": {"code": "AI_ERROR", "message": "Unable to process request. Please try again."}}
    )
```

### 3. API Response Sanitization
**Rule**: Strip all internal metadata before returning responses.

**Implementation**:
```python
# ✅ GOOD: Sanitize response before returning
def sanitize_ai_response(response: dict) -> dict:
    """Remove internal metadata from AI responses."""
    allowed_keys = ["message", "conversation_id", "timestamp"]
    return {k: v for k, v in response.items() if k in allowed_keys}
```

### 4. Rate Limiting on Client, Not in Code
**Rule**: Rate limits should be server-enforced, not client-checked.

**Implementation**:
```python
# ✅ GOOD: Rate limiting on backend with opaque error
@router.post("/api/ai-chat/send")
async def send_message(user: dict = Depends(get_current_user)):
    auth_user_id = user["sub"]

    # Check rate limit on backend
    if await is_rate_limited(auth_user_id):
        raise HTTPException(
            status_code=429,
            detail={"error": {"code": "RATE_LIMIT_EXCEEDED", "message": "Too many requests. Please try again later."}}
            # ❌ DON'T include: "limit": 50, "window": "1 hour", "used": 51
        )
```

### 5. .gitignore for Sensitive Files
**Rule**: NEVER commit system prompts, even in development.

**Implementation**:
```bash
# .gitignore
.env
.env.*
app/ai/prompts/**  # If prompts are in separate files
system_prompts.py
```

### 6. Environment Variable for Prompts (Production)
**Rule**: For production, store system prompts in environment variables or secret management (AWS Secrets Manager, Railway secrets).

**Implementation**:
```python
# ✅ GOOD: Load from environment
import os

DREAM_SELF_PROMPT_TEMPLATE = os.getenv("DREAM_SELF_PROMPT_TEMPLATE")
if not DREAM_SELF_PROMPT_TEMPLATE:
    raise ValueError("Missing DREAM_SELF_PROMPT_TEMPLATE environment variable")
```

---

## Immediate Actions Required

### Action 1: Audit API Responses
**Task**: Review all AI-related endpoints and ensure NO system prompts, context details, or module logic is included in responses.

**Files to Check**:
- `weave-api/app/api/ai_chat_router.py`
- `weave-api/app/services/ai_orchestrator.py`
- `weave-api/app/services/ai_modules/*.py`

**Command**:
```bash
# Search for potential prompt leakage
cd weave-api
grep -r "system_prompt" app/api/
grep -r "context" app/api/ | grep "return"
```

### Action 2: Sanitize Error Messages
**Task**: Replace all detailed error messages with generic equivalents.

**Example Fix**:
```python
# Before:
raise HTTPException(status_code=400, detail=f"Invalid operation: {operation_type}. Valid: {VALID_OPS}")

# After:
raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_REQUEST", "message": "Invalid request parameters."}})
```

### Action 3: Remove Client-Side Context Logic
**Task**: Ensure frontend ONLY sends user messages, never constructs prompts or context.

**Files to Check**:
- `weave-mobile/src/hooks/useAIChat.ts`
- `weave-mobile/src/hooks/useAIChatStream.ts`
- `weave-mobile/src/components/features/ai-chat/ChatScreen.tsx`

**Correct Pattern**:
```typescript
// ✅ GOOD: Client only sends message
const sendMessage = async (message: string) => {
  const response = await apiClient.post('/api/ai-chat/send', {
    message: message.trim()
    // NO context, NO prompt, NO operation_type
  });
  return response.data.data.message;
};
```

### Action 4: Add Response Sanitization Middleware
**Task**: Create middleware to strip sensitive fields from all AI responses.

**Implementation** (`weave-api/app/middleware/sanitize_response.py`):
```python
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import json

class SanitizeResponseMiddleware(BaseHTTPMiddleware):
    """Remove sensitive fields from API responses."""

    SENSITIVE_KEYS = [
        "system_prompt",
        "context",
        "operation_type",
        "module_name",
        "input_hash",
        "ai_provider",
        "model_name",
        "prompt_tokens",
        "completion_tokens"
    ]

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Only process JSON responses
        if response.headers.get("content-type") == "application/json":
            body = await response.body()
            data = json.loads(body)
            sanitized = self._sanitize_dict(data)
            response = Response(
                content=json.dumps(sanitized),
                status_code=response.status_code,
                headers=dict(response.headers)
            )

        return response

    def _sanitize_dict(self, data: dict) -> dict:
        """Recursively remove sensitive keys."""
        if isinstance(data, dict):
            return {
                k: self._sanitize_dict(v)
                for k, v in data.items()
                if k not in self.SENSITIVE_KEYS
            }
        elif isinstance(data, list):
            return [self._sanitize_dict(item) for item in data]
        return data
```

**Register Middleware** (`weave-api/app/main.py`):
```python
from app.middleware.sanitize_response import SanitizeResponseMiddleware

app.add_middleware(SanitizeResponseMiddleware)
```

---

## Testing for Vulnerabilities

### Test 1: Network Inspection
```bash
# Start mobile app with network logging
cd weave-mobile
npm start

# In another terminal, use mitmproxy
mitmproxy --mode transparent --showhost

# Interact with AI chat and inspect:
# 1. Are system prompts visible in requests/responses?
# 2. Is full user context (goals, journal) sent to client?
# 3. Are operation_type or module names exposed?
```

### Test 2: API Response Audit
```bash
# Check all AI endpoints for sensitive data
curl -X POST http://localhost:8000/api/ai-chat/send \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"message": "Hello"}' | jq .

# Verify response contains ONLY:
# - message (assistant's response)
# - conversation_id
# - timestamp
# NO: system_prompt, context, operation_type, module_name
```

### Test 3: Error Message Fuzzing
```bash
# Send invalid requests to check error verbosity
curl -X POST http://localhost:8000/api/ai-chat/send \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"operation_type": "INVALID"}' | jq .

# Error should be generic:
# ✅ GOOD: {"error": {"code": "INVALID_REQUEST", "message": "Invalid request."}}
# ❌ BAD: {"error": "Operation 'INVALID' not in [list of all operations]"}
```

---

## Long-Term Security Enhancements

### 1. AI Response Watermarking
**Purpose**: Detect if system prompts are being extracted and used elsewhere.

**Implementation**: Inject subtle, unique markers in AI responses that can be tracked.

### 2. Honeypot Endpoints
**Purpose**: Detect reverse-engineering attempts.

**Example**:
```python
@router.post("/api/internal/ai-debug")  # Undocumented endpoint
async def debug_endpoint():
    # Log access attempt
    logger.warning("Honeypot endpoint accessed - potential security probe")
    raise HTTPException(status_code=404, detail="Not found")
```

### 3. API Request Anomaly Detection
**Purpose**: Identify unusual access patterns (rapid endpoint enumeration, fuzzing).

**Implementation**: Monitor for:
- High error rates from single IP
- Sequential 404s (endpoint discovery)
- Rapid operation_type variations (fuzzing)

### 4. Code Obfuscation (Mobile)
**Purpose**: Make client code harder to reverse-engineer.

**Implementation**: Use React Native code obfuscation for production builds.

---

## Prevention Checklist

Before deploying ANY AI feature:

- [ ] **API Response Audit**: No system prompts, context, or module logic in responses
- [ ] **Error Message Review**: All errors are generic, detailed logs backend-only
- [ ] **Client Code Audit**: No prompt construction or context building on frontend
- [ ] **Middleware Active**: Response sanitization middleware deployed
- [ ] **Environment Variables**: System prompts stored in secure env vars (production)
- [ ] **.gitignore Updated**: No sensitive prompt files committed
- [ ] **Network Test**: Intercepted requests contain no sensitive data
- [ ] **Fuzzing Test**: Error messages don't reveal architecture

---

## Related Issues

- Story 1.5.3: AI Module Orchestration (architecture exposed if not careful)
- Story 6.1: AI Chat Implementation (streaming responses may leak prompts)
- Story 6.2: Server-Initiated Check-ins (system-initiated prompts must be protected)
- `docs/dev/ai-services-guide.md`: Security section needs updating

---

## Acceptance Criteria for Resolution

1. ✅ **API Response Sanitization**: All AI endpoints return ONLY user-facing data (message, conversation_id, timestamp)
2. ✅ **Generic Error Messages**: All production errors use standard codes (INVALID_REQUEST, AI_ERROR, RATE_LIMIT_EXCEEDED) with no architectural details
3. ✅ **Client Code Clean**: Frontend NEVER constructs prompts, contexts, or operation types
4. ✅ **Middleware Deployed**: Response sanitization middleware active in production
5. ✅ **Environment Variables**: System prompts loaded from Railway secrets (not hardcoded)
6. ✅ **Network Test Passed**: mitmproxy inspection shows no sensitive data in transit
7. ✅ **Fuzzing Test Passed**: API fuzzing reveals no architectural information
8. ✅ **Documentation Updated**: `docs/dev/ai-services-guide.md` includes security best practices section

---

## References

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Prompt Injection Attacks (OWASP)](https://owasp.org/www-project-top-ten/2017/A1_2017-Injection)
- Story 1.5.3: AI Module Orchestration (`docs/stories/1-5-3-ai-module-orchestration.md`)
- Backend Patterns Guide (`docs/dev/backend-patterns-guide.md`)
- AI Services Guide (`docs/dev/ai-services-guide.md`)

---

**Status**: 🔍 **INVESTIGATING** - Requires immediate audit of all AI endpoints and responses.

**Priority**: 🔴 **CRITICAL** - Impacts entire AI system security and intellectual property protection.

**Next Steps**:
1. Run API response audit (Action 1)
2. Implement response sanitization middleware (Action 4)
3. Review and sanitize all error messages (Action 2)
4. Test with network interception (Test 1)
5. Update documentation with security section
