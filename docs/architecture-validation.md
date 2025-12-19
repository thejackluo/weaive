# Architecture Validation Report

**Document Type:** Architecture Validation
**Project:** Weave
**Date:** 2025-12-16
**Validator:** AI Architecture Review
**Status:** COMPLETE

---

## Executive Summary

This document provides a comprehensive validation of the Weave architecture against the PRD requirements, identifying risks, gaps, and recommendations. The validation examines coherence, cost models, security posture, performance feasibility, scalability paths, and critical failure modes.

### Overall Assessment

| Dimension | Status | Risk Level | Confidence |
|-----------|--------|------------|------------|
| **Coherence** | ✅ PASS | Low | High |
| **Requirements Coverage** | ✅ PASS | Low | High |
| **Cost Model** | ⚠️ CONCERNS | Medium-High | Medium |
| **Security** | ⚠️ GAPS | High | Medium |
| **Performance** | ✅ PASS | Low | High |
| **Scalability** | ✅ PASS | Medium | Medium |
| **Failure Recovery** | ⚠️ GAPS | Medium | Medium |

**Bottom Line:** Architecture is fundamentally sound but has **3 critical gaps** that must be addressed before public launch:
1. RLS policies deferred too long (security risk)
2. AI cost model may exceed budget at scale (financial risk)
3. Offline mode undefined (user experience risk)

---

## 1. Architecture Coherence Validation

### 1.1 Technology Stack Compatibility Matrix

| Component A | Component B | Compatibility | Notes |
|-------------|-------------|---------------|-------|
| Expo SDK 53 | React Native 0.79 | ✅ Bundled | Official pairing |
| React Native 0.79 | React 19 | ✅ Compatible | New architecture ready |
| Expo Router v5 | NativeWind | ✅ Compatible | Both use Metro bundler |
| NativeWind | React 19 | ⚠️ Verify | Test `className` prop with new JSX transform |
| TanStack Query v5 | React 19 | ✅ Compatible | v5 supports React 19 |
| Zustand v5 | React 19 | ✅ Compatible | Latest stable |
| FastAPI 0.115+ | Python 3.11+ | ✅ Required | Type hints, asyncio |
| Supabase JS v2 | Expo | ✅ Compatible | Official support |
| OpenAI SDK | Python 3.11+ | ✅ Compatible | Async support |
| Anthropic SDK | Python 3.11+ | ✅ Compatible | Async support |

**Coherence Score: 9/10**

**Issue Identified:** NativeWind + React 19 combination should be tested early. React 19's new JSX transform may have edge cases with className prop forwarding.

**Recommendation:** Add to first sprint: "Verify NativeWind className prop works with React 19 JSX transform"

### 1.2 Decision Compatibility Analysis

#### State Management Decisions

| Decision | Compatibility Check | Result |
|----------|---------------------|--------|
| TanStack Query for server state | Does it conflict with Supabase realtime? | ✅ No - complementary |
| Zustand for UI state | Does it overlap with TanStack? | ✅ No - clear boundaries |
| useState for local state | Any anti-patterns? | ✅ Clean separation |

**Analysis:** The three-layer state strategy (TanStack → Zustand → useState) is well-designed. The boundaries are clear:
- Server data = TanStack Query
- Shared UI state = Zustand
- Component-local = useState

**Potential Issue:** What happens when user edits an AI artifact? The edit needs to:
1. Update local state (optimistic)
2. Send to server (mutation)
3. Invalidate TanStack cache

This flow is not explicitly documented. **Recommendation:** Document optimistic update pattern for AI artifact edits.

#### Data Access Pattern Decisions

| Pattern | When Used | Potential Conflict |
|---------|-----------|-------------------|
| Supabase Direct | Auth, storage, simple CRUD | None |
| FastAPI | AI, complex business logic | None |

**Analysis:** The hybrid approach is sound. The decision tree is clear:
1. Auth/storage → Supabase
2. Simple CRUD → Supabase
3. AI/complex logic → FastAPI

**Potential Issue:** Goal creation involves both simple CRUD AND AI. The architecture says AI operations go through FastAPI, but the goal itself is stored in Supabase. This requires a two-step flow:
1. FastAPI generates goal breakdown (AI)
2. Mobile writes to Supabase (storage)

This is correct but adds latency. **Recommendation:** Consider having FastAPI write directly to Supabase after AI generation to reduce round trips.

### 1.3 Pattern Consistency Validation

| Pattern Category | Defined? | Consistent? | Enforceable? |
|------------------|----------|-------------|--------------|
| Naming (DB) | ✅ snake_case | ✅ Yes | ✅ Linter |
| Naming (API) | ✅ snake_case | ✅ Yes | ✅ FastAPI |
| Naming (TS) | ✅ camelCase | ✅ Yes | ✅ ESLint |
| API Response | ✅ {data, error, meta} | ✅ Yes | ⚠️ Manual |
| Error Handling | ✅ HTTPException | ✅ Yes | ⚠️ Manual |
| Test Location | ✅ Defined | ✅ Yes | ⚠️ Manual |

**Analysis:** Patterns are well-defined but some lack automated enforcement.

**Recommendations:**
1. Add Zod schemas for API response validation on mobile
2. Add pytest fixtures to enforce response format on backend
3. Add pre-commit hooks to verify test file locations

---

## 2. Requirements Coverage Analysis

### 2.1 Epic-to-Architecture Mapping

| Epic | Story Points | Architecture Support | Coverage |
|------|--------------|---------------------|----------|
| EP-001: Onboarding | 30 pts | Auth group, AI service, identity_docs | ✅ 100% |
| EP-002: Goals | 27 pts | Goals router, Supabase tables, hooks | ✅ 100% |
| EP-003: Daily Actions | 36 pts | Triad, completions, captures | ✅ 100% |
| EP-004: Reflection | 26 pts | Journal router, AI recap | ✅ 100% |
| EP-005: Progress | 39 pts | Stats router, daily_aggregates | ✅ 100% |
| EP-006: AI Coaching | 29 pts | AI router, streaming | ✅ 100% |
| EP-007: Notifications | 28 pts | Expo Push, notification_service | ✅ 100% |
| EP-008: Settings | 23 pts | Profile, preferences | ✅ 100% |

**Total: 238 story points fully supported by architecture**

### 2.2 Non-Functional Requirements Coverage

| NFR ID | Requirement | Architecture Support | Gap? |
|--------|-------------|---------------------|------|
| NFR-P1 | App launch <3s | Expo, code splitting | ✅ No |
| NFR-P2 | Thread load <1s | TanStack cache, precomputed aggregates | ✅ No |
| NFR-P3 | Bind completion <500ms | Sync Supabase write | ✅ No |
| NFR-P4 | AI chat stream <3s | FastAPI streaming | ✅ No |
| NFR-P5 | AI batch <30s | BackgroundTasks | ✅ No |
| NFR-S1 | 10K concurrent users | Railway scaling, Supabase | ⚠️ Untested |
| NFR-A1 | 99.5% uptime | Railway + Supabase SLA | ⚠️ Depends on vendors |
| NFR-R1 | Zero data loss | Immutable completions | ✅ No |
| NFR-C4 | Offline mode | **NOT DEFINED** | ❌ **GAP** |

### 2.3 Critical Gap: Offline Mode

**Issue:** NFR-C4 requires "Basic read access" offline, but architecture does not address:
- How TanStack Query persists cache to disk
- What happens when user completes bind offline
- How to sync when connectivity returns

**Impact:** Users with poor connectivity (subway, travel) cannot use app

**Recommendation:** Add offline strategy section to architecture:
```typescript
// Proposed solution
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

// Persist to AsyncStorage
const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

persistQueryClient({ queryClient, persister });
```

**Priority:** HIGH - Must address before public launch

---

## 3. Cost Model Deep Dive

### 3.1 AI Cost Assumptions in Architecture

| Assumption | Value | Source |
|------------|-------|--------|
| AI budget (10K users) | $2,500/month | PRD |
| Cost per free user | <$0.10/month | PRD |
| Cost per Pro user | <$0.50/month | PRD |
| Cost per Max user | <$1.50/month | PRD |
| Cache hit rate | >80% | PRD |

### 3.2 Token Usage Estimation

#### Per-User Token Consumption (Monthly)

| Operation | Frequency | Input Tokens | Output Tokens | Model |
|-----------|-----------|--------------|---------------|-------|
| Onboarding | 1x/user | ~2,000 | ~1,500 | Sonnet |
| Daily Triad | 30x/month | ~1,500 | ~500 | GPT-4o-mini |
| Daily Recap | 30x/month | ~2,000 | ~800 | GPT-4o-mini |
| Chat Messages | 60x/month (2/day) | ~1,000 | ~500 | GPT-4o-mini |
| Weekly Insights | 4x/month | ~3,000 | ~1,000 | Sonnet |

#### Monthly Token Totals (Per Active User)

| Model | Input Tokens | Output Tokens | Monthly Cost |
|-------|--------------|---------------|--------------|
| GPT-4o-mini | 135,000 | 54,000 | $0.053 |
| Claude Sonnet | 14,000 | 5,500 | $0.125 |
| **Total** | 149,000 | 59,500 | **$0.178** |

### 3.3 Scaling Analysis

#### Scenario: 10K MAU

| User Tier | Count | Cost/User | Total |
|-----------|-------|-----------|-------|
| Free (limited) | 7,000 | $0.05 | $350 |
| Pro (full) | 2,500 | $0.20 | $500 |
| Max (premium) | 500 | $0.50 | $250 |
| **Subtotal** | 10,000 | - | **$1,100** |
| Cache overhead | - | - | +$100 |
| Batch processing | - | - | +$150 |
| Error retries | - | - | +$50 |
| **Total** | - | - | **$1,400** |

**Assessment: ✅ WITHIN BUDGET** at $2,500/month ceiling

### 3.4 Cost Risk Scenarios

#### Risk Scenario A: Low Cache Hit Rate (50% vs 80%)

| Metric | Expected | Risk Scenario | Delta |
|--------|----------|---------------|-------|
| Cache hit rate | 80% | 50% | -30% |
| Effective AI calls | 20% of requests | 50% of requests | +150% |
| Monthly cost | $1,400 | $3,500 | **+$2,100** |

**Mitigation:** Implement aggressive caching with input_hash. Test cache hit rate in staging before launch.

#### Risk Scenario B: High Chat Usage (5x expected)

| Metric | Expected | Risk Scenario | Delta |
|--------|----------|---------------|-------|
| Chat messages/user/day | 2 | 10 | +400% |
| Chat cost/user/month | $0.03 | $0.15 | +$0.12 |
| Total monthly delta | - | - | **+$1,200** |

**Mitigation:** Enforce rate limiting (10 msgs/hour). Consider cost-based throttling for free tier.

#### Risk Scenario C: Power Users (Heavy Journaling)

| Metric | Expected | Risk Scenario | Delta |
|--------|----------|---------------|-------|
| Journal with AI | 30/month | 60/month | +100% |
| Triad cost | $0.02 | $0.04 | +100% |

**Mitigation:** Journal submission is 1x/day max (enforced by schema). Low risk.

### 3.5 Cost Control Recommendations

1. **Implement input_hash caching from Day 1**
   - Cache TTL: 8 hours for triad/recap
   - Cache TTL: 24 hours for onboarding
   - Expected savings: 60-80%

2. **Use GPT-4o-mini for 90% of operations**
   - Sonnet only for: Onboarding, Dream Self chat (complex), Weekly insights
   - Everything else: GPT-4o-mini

3. **Add cost tracking dashboard**
   ```python
   # Track every AI call
   async def track_ai_cost(user_id: str, model: str, input_tokens: int, output_tokens: int):
       cost = calculate_cost(model, input_tokens, output_tokens)
       await supabase.from_('ai_cost_tracking').insert({
           'user_id': user_id,
           'model': model,
           'input_tokens': input_tokens,
           'output_tokens': output_tokens,
           'cost_usd': cost,
           'created_at': datetime.utcnow()
       })
   ```

4. **Set up cost alerts**
   - Alert at 50% of monthly budget
   - Alert at 80% of monthly budget
   - Auto-throttle at 100% (degrade to cached responses only)

---

## 4. Security Deep Dive

### 4.1 Threat Model

#### Assets to Protect

| Asset | Sensitivity | Impact if Compromised |
|-------|-------------|----------------------|
| User credentials | Critical | Account takeover |
| Identity documents | High | Privacy violation, identity theft |
| Journal entries | High | Emotional/personal exposure |
| Goals and progress | Medium | Privacy violation |
| Captures (photos) | High | Privacy violation |
| AI artifacts | Low | Minimal impact |

#### Threat Actors

| Actor | Motivation | Capability |
|-------|------------|------------|
| Script kiddies | Vandalism | Low |
| Competitors | Data theft | Medium |
| Malicious users | Abuse, fraud | Medium |
| Insiders | Data theft | High |

### 4.2 Security Control Analysis

#### Authentication (Supabase Auth)

| Control | Status | Gap? |
|---------|--------|------|
| Email/password auth | ✅ Implemented | No |
| OAuth providers | ✅ Implemented | No |
| JWT tokens | ✅ Implemented | No |
| Token expiration (7 days) | ✅ Configured | No |
| Refresh token rotation | ✅ Supabase default | No |
| MFA | ❌ Post-MVP | **GAP** |

**Risk:** Without MFA, accounts are vulnerable to credential stuffing.

**Recommendation:** Enable Supabase MFA for accounts with subscription (Pro/Max tiers) before scaling to 10K users.

#### Authorization (Row Level Security)

| Table | RLS Status | Risk |
|-------|------------|------|
| user_profiles | ⚠️ DEFERRED | **HIGH** |
| identity_docs | ⚠️ DEFERRED | **HIGH** |
| goals | ⚠️ DEFERRED | **HIGH** |
| subtask_completions | ⚠️ DEFERRED | **HIGH** |
| captures | ⚠️ DEFERRED | **HIGH** |
| journal_entries | ⚠️ DEFERRED | **HIGH** |
| daily_aggregates | ⚠️ DEFERRED | **MEDIUM** |

**CRITICAL FINDING:** Architecture states RLS is deferred "before public launch" but does not define what "public launch" means or who enforces this.

**Risk Analysis:**
- During MVP testing without RLS, any authenticated user can read/modify ANY user's data
- A single malicious beta tester could exfiltrate entire database
- Recovery would require notifying all users of breach

**Recommendation:** **CHANGE PRIORITY TO SPRINT 1**

```sql
-- MUST implement before ANY external testing
-- user_profiles RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own profile"
  ON user_profiles FOR ALL
  USING (auth.uid() = auth_user_id);

-- Repeat for all user-owned tables
```

**Revised Timeline:**
| Phase | RLS Status |
|-------|------------|
| Development (internal) | Optional |
| Alpha (friends & family) | **REQUIRED** |
| Beta (external testers) | **REQUIRED** |
| Public launch | **REQUIRED** |

#### Input Validation

| Vector | Control | Status |
|--------|---------|--------|
| SQL Injection | Parameterized queries (Supabase SDK) | ✅ Protected |
| XSS | React Native (no DOM) | ✅ Protected |
| File upload (type) | Zod validation | ⚠️ Needs implementation |
| File upload (size) | 10MB limit | ⚠️ Needs implementation |
| API rate limiting | FastAPI middleware | ⚠️ Needs implementation |

**Recommendation:** Implement file upload validation in Sprint 1:

```python
# api/app/utils/validation.py
ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/png'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_upload(file: UploadFile) -> None:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(400, detail={"code": "INVALID_FILE_TYPE"})

    # Read first chunk to verify magic bytes
    header = await file.read(8)
    await file.seek(0)

    if not is_valid_image_header(header):
        raise HTTPException(400, detail={"code": "INVALID_FILE_CONTENT"})
```

#### API Security

| Control | Status | Notes |
|---------|--------|-------|
| HTTPS | ✅ Railway default | TLS 1.3 |
| JWT verification | ⚠️ Needs middleware | Must verify Supabase JWT |
| Rate limiting | ⚠️ Needs implementation | 100 req/min/user |
| CORS | ⚠️ Needs configuration | Restrict to app origins |

**Recommendation:** Add JWT verification middleware:

```python
# api/app/middleware/auth.py
from supabase import create_client
from jose import jwt, JWTError

async def verify_jwt(request: Request) -> dict:
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(401, detail={"code": "MISSING_TOKEN"})

    token = auth_header.split(' ')[1]

    try:
        # Verify with Supabase JWT secret
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=['HS256'],
            audience='authenticated'
        )
        return payload
    except JWTError:
        raise HTTPException(401, detail={"code": "INVALID_TOKEN"})
```

### 4.3 Security Recommendations Summary

| Priority | Recommendation | Sprint |
|----------|----------------|--------|
| **P0** | Enable RLS on all tables | Sprint 1 |
| **P0** | Implement JWT verification | Sprint 1 |
| **P1** | Add file upload validation | Sprint 2 |
| **P1** | Configure CORS | Sprint 1 |
| **P1** | Implement rate limiting | Sprint 2 |
| **P2** | Enable MFA for paid users | Sprint 4 |
| **P2** | Add security headers | Sprint 2 |

---

## 5. Performance Analysis

### 5.1 Critical Path Analysis

#### Path 1: App Launch → Thread (Home)

```
User opens app
  ↓ (cold start: 1-2s)
Expo loads JavaScript bundle
  ↓ (50-100ms)
Check Supabase session
  ↓ (100-200ms network)
Session valid → Navigate to Thread
  ↓ (50ms)
TanStack Query fetches today's binds
  ↓ (200-500ms network + DB)
Render Thread screen
  ↓ (50-100ms)
TOTAL: 1.5-3s
```

**Assessment:** ✅ Meets NFR-P1 (<3s) and NFR-P2 (<1s for Thread after auth)

**Optimization opportunities:**
1. Prefetch bind data during auth check
2. Use stale-while-revalidate for instant UI

#### Path 2: Bind Completion

```
User taps "Complete"
  ↓ (immediate)
Optimistic UI update
  ↓ (0ms perceived)
POST to Supabase subtask_completions
  ↓ (100-200ms network)
TanStack Query invalidates
  ↓ (background)
TOTAL: 0ms perceived, 200ms actual
```

**Assessment:** ✅ Meets NFR-P3 (<500ms) with optimistic updates

#### Path 3: Journal Submission → AI Feedback

```
User submits journal
  ↓ (immediate)
POST to FastAPI /api/journal
  ↓ (50ms)
FastAPI returns 202 Accepted
  ↓ (immediate)
Show "Weave is reflecting..."
  ↓ (background)
FastAPI BackgroundTask:
  - Assemble context (500ms)
  - Call GPT-4o-mini (2-5s)
  - Store artifacts (100ms)
  - Push notification (100ms)
  ↓ (5-10s total)
User sees feedback
```

**Assessment:** ⚠️ May exceed NFR-P5 (<30s) under load

**Risk:** Context assembly for power users (many goals, long history) could take >500ms

**Recommendation:** Add context size limits:
```python
MAX_COMPLETION_HISTORY = 90  # Last 90 days
MAX_JOURNAL_HISTORY = 30     # Last 30 journals
MAX_CONTEXT_TOKENS = 4000    # Truncate if larger
```

#### Path 4: AI Chat (Streaming)

```
User sends message
  ↓ (immediate)
POST to FastAPI /api/ai/chat
  ↓ (50ms)
FastAPI streams SSE
  ↓ (100-500ms first token)
Mobile renders tokens
  ↓ (streaming)
Response complete
```

**Assessment:** ✅ Meets NFR-P4 (<3s to start streaming)

### 5.2 Database Performance

#### Query Analysis

| Query | Frequency | Expected Time | Index Needed |
|-------|-----------|---------------|--------------|
| Get today's binds | High (every app open) | <50ms | ✅ (user_id, scheduled_for_date) |
| Get completions for date | High | <20ms | ✅ (user_id, local_date) |
| Get daily aggregates (range) | Medium | <100ms | ✅ (user_id, local_date) |
| Get goal with subtasks | Medium | <50ms | ✅ (user_id, status) |
| Get journal history | Low | <100ms | ✅ (user_id, local_date) |

**Assessment:** ✅ All critical queries have appropriate indexes defined

#### Potential N+1 Issues

| Operation | Risk | Mitigation |
|-----------|------|------------|
| Load goals with subtasks | Medium | Use Supabase select with join |
| Load Thread with completions | Medium | Batch query, not per-bind |
| Load heat map data | Low | Single aggregates query |

**Recommendation:** Document Supabase query patterns to prevent N+1:

```typescript
// GOOD: Single query with join
const { data: goals } = await supabase
  .from('goals')
  .select(`
    *,
    subtask_templates (*)
  `)
  .eq('user_id', userId)
  .eq('status', 'active');

// BAD: N+1 queries
const { data: goals } = await supabase.from('goals').select('*');
for (const goal of goals) {
  const { data: subtasks } = await supabase
    .from('subtask_templates')
    .select('*')
    .eq('goal_id', goal.id); // N+1!
}
```

### 5.3 Performance Recommendations

| Priority | Recommendation | Impact |
|----------|----------------|--------|
| P1 | Implement optimistic updates for completions | UX improvement |
| P1 | Add stale-while-revalidate to TanStack | Faster perceived load |
| P2 | Prefetch next day's triad | Smoother morning experience |
| P2 | Add context size limits for AI | Prevent timeouts |
| P3 | Image compression before upload | Faster uploads |

---

## 6. Scalability Analysis

### 6.1 Scaling Stages

| Stage | Users | Architecture Changes Needed |
|-------|-------|---------------------------|
| MVP | 100 | None - sync calls fine |
| Alpha | 1,000 | Add basic monitoring |
| Beta | 5,000 | Add connection pooling |
| Launch | 10,000 | Add job queue (Redis) |
| Growth | 50,000 | Add read replicas |
| Scale | 100,000+ | Microservices, CDN |

### 6.2 Bottleneck Analysis

#### Bottleneck 1: Database Connections

| Stage | Connections Needed | Supabase Limit (Pro) |
|-------|-------------------|---------------------|
| 100 users | ~10 concurrent | 60 direct |
| 1,000 users | ~100 concurrent | 60 direct |
| 10,000 users | ~1,000 concurrent | **EXCEEDED** |

**Analysis:** Supabase Pro tier allows 60 direct connections. At 10K users, this will be exceeded during peak usage.

**Solution:** Use Supabase connection pooling (Supavisor):
```
DATABASE_URL=postgres://...:6543/postgres  # Transaction mode
```

**Recommendation:** Enable pooler from Day 1 to avoid migration pain.

#### Bottleneck 2: AI API Rate Limits

| Provider | Tier | Rate Limit | Our Peak Estimate |
|----------|------|------------|-------------------|
| OpenAI | Tier 1 | 500 RPM | 200 RPM |
| OpenAI | Tier 2 | 5,000 RPM | 2,000 RPM |
| Anthropic | Starter | 50 RPM | 50 RPM |
| Anthropic | Build | 1,000 RPM | 200 RPM |

**Analysis:** At 10K users, journal submission time (6-8 PM) will spike to ~500 concurrent users. If each triggers AI call:
- 500 users × 2 AI calls = 1,000 calls in 2-minute window = 500 RPM

**Risk:** Anthropic Starter tier (50 RPM) will be immediately exceeded.

**Recommendation:**
1. Upgrade to Anthropic Build tier before beta
2. Implement request queuing with exponential backoff
3. Stagger AI calls using job queue (Redis + BullMQ)

#### Bottleneck 3: FastAPI Worker Concurrency

| Stage | Concurrent Requests | Workers Needed |
|-------|---------------------|----------------|
| 100 users | 10 | 1-2 |
| 1,000 users | 100 | 4 |
| 10,000 users | 1,000 | 10-20 |

**Analysis:** Railway auto-scales, but need to configure properly.

**Recommendation:** Configure Railway scaling:
```toml
# railway.toml
[deploy]
numReplicas = 2
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4"
```

### 6.3 Scaling Recommendations

| Priority | Recommendation | When |
|----------|----------------|------|
| P0 | Enable Supabase connection pooler | Sprint 1 |
| P1 | Upgrade to Anthropic Build tier | Before beta |
| P1 | Add Redis + BullMQ job queue | Before 1K users |
| P2 | Configure Railway auto-scaling | Before beta |
| P2 | Add request queuing for AI calls | Before beta |
| P3 | Database read replica | At 50K users |

---

## 7. Failure Mode Analysis

### 7.1 Critical Failure Scenarios

#### Scenario 1: OpenAI API Outage

**Probability:** Medium (2-3 incidents/year historically)
**Impact:** High - No triad, recap, or chat

**Current Handling:** None defined

**Recommended Handling:**
```python
# Fallback chain
async def generate_triad(user_id: str) -> Triad:
    try:
        return await call_openai(prompt)
    except OpenAIError:
        try:
            return await call_anthropic(prompt)  # Fallback
        except AnthropicError:
            return generate_simple_triad(user_id)  # Deterministic fallback
```

**Simple Triad Fallback:**
```python
def generate_simple_triad(user_id: str) -> Triad:
    """Generate triad from existing binds without AI"""
    binds = get_user_active_binds(user_id)

    # Rank by: incomplete + high frequency + recent success
    ranked = sorted(binds, key=lambda b: (
        not b.completed_today,
        b.frequency_score,
        b.recent_completion_rate
    ), reverse=True)

    return Triad(
        tasks=ranked[:3],
        source='fallback',
        message="Your AI coach is temporarily unavailable. Here are your top priorities based on your patterns."
    )
```

#### Scenario 2: Supabase Outage

**Probability:** Low (99.9% SLA)
**Impact:** Critical - App unusable

**Current Handling:** None defined

**Recommended Handling:**
1. TanStack Query offline persistence (see Section 2.3)
2. Queue mutations for retry
3. Show "Offline mode" banner

```typescript
// Offline mutation queue
const mutation = useMutation({
  mutationFn: completeBind,
  onMutate: async (variables) => {
    // Optimistic update
    await queryClient.cancelQueries(['binds', 'today']);
    const previous = queryClient.getQueryData(['binds', 'today']);
    queryClient.setQueryData(['binds', 'today'], (old) => ({
      ...old,
      data: old.data.map(b =>
        b.id === variables.bindId ? { ...b, completed: true } : b
      )
    }));
    return { previous };
  },
  onError: (err, variables, context) => {
    // Revert on error
    queryClient.setQueryData(['binds', 'today'], context.previous);
  },
  retry: 3,
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
});
```

#### Scenario 3: User Loses Connectivity Mid-Action

**Probability:** High (daily occurrence for some users)
**Impact:** Medium - Frustration, data loss

**Current Handling:** Not defined

**Recommended Handling:**
1. Detect connectivity state
2. Queue actions locally
3. Sync when reconnected

```typescript
// lib/connectivity.ts
import NetInfo from '@react-native-community/netinfo';

export const useConnectivity = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    return NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });
  }, []);

  return isConnected;
};
```

#### Scenario 4: AI Generates Inappropriate Content

**Probability:** Low (with proper prompts)
**Impact:** High - User trust, legal risk

**Current Handling:** "AI Safety Requirements" mentioned but not implemented

**Recommended Handling:**
1. Output filtering
2. User reporting
3. Audit logging

```python
# api/app/services/ai_safety.py
BLOCKED_PATTERNS = [
    r'(?i)(kill|hurt|harm)\s+(yourself|myself)',
    r'(?i)suicide',
    r'(?i)(medical|legal|financial)\s+advice',
]

def filter_ai_output(text: str) -> tuple[str, bool]:
    """Filter AI output for safety. Returns (filtered_text, was_filtered)"""
    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, text):
            # Log for review
            log_safety_flag(text, pattern)
            # Return safe fallback
            return (
                "I want to help, but I'm not the right resource for this. "
                "Please reach out to a professional or trusted person.",
                True
            )
    return (text, False)
```

### 7.2 Failure Recovery Matrix

| Failure | Detection | Recovery | User Communication |
|---------|-----------|----------|-------------------|
| OpenAI down | API error | Anthropic fallback → Deterministic | Toast: "Using simplified recommendations" |
| Anthropic down | API error | OpenAI fallback → Deterministic | Toast: "Using simplified recommendations" |
| Supabase down | Connection error | Offline mode + retry queue | Banner: "Offline - changes will sync" |
| FastAPI down | Health check | Railway auto-restart | Spinner + retry |
| Push service down | APNs error | Silent failure | None (non-critical) |
| Rate limit exceeded | 429 response | Exponential backoff | Toast: "Please wait a moment" |

### 7.3 Monitoring Requirements

| Metric | Alert Threshold | Action |
|--------|-----------------|--------|
| API error rate | >1% | Page on-call |
| AI latency p95 | >10s | Investigate |
| DB connection usage | >80% | Scale pooler |
| AI cost per day | >$100 | Review usage |
| Crash rate | >0.5% | Hotfix |

**Recommendation:** Implement monitoring in Sprint 2:
- Sentry for errors
- Railway metrics for infrastructure
- Custom dashboard for AI costs

---

## 8. Implementation Feasibility Assessment

### 8.1 Team Capacity Analysis

| Resource | Availability | Skills |
|----------|--------------|--------|
| Developer 1 | Full-time | React Native, TypeScript |
| Developer 2 | Full-time | Python, FastAPI, DevOps |
| AI Agent 1 | Unlimited | Code generation, testing |
| AI Agent 2 | Unlimited | Documentation, analysis |
| AI Agent 3 | Unlimited | Review, debugging |

### 8.2 Velocity Estimation

| Phase | Story Points | Sprints (2-week) | Notes |
|-------|--------------|------------------|-------|
| Foundation | 30 | 2 | Setup, auth, data models |
| Onboarding | 30 | 2 | AI-assisted, complex |
| Core Loop | 63 | 4 | Most critical |
| Reflection | 26 | 2 | AI integration |
| Progress | 39 | 3 | Visualization heavy |
| AI Coaching | 29 | 2 | Chat, insights |
| Notifications | 28 | 2 | Push integration |
| Settings | 23 | 1.5 | Standard CRUD |
| **Total** | **268** | **18.5** | ~37 weeks |

### 8.3 Realistic Timeline Assessment

**PRD Estimate:** 8-10 sprints (16-20 weeks) with 15-20 pts/sprint

**My Assessment:**
- With 2 developers + AI agents: 20-25 pts/sprint achievable
- 238 story points ÷ 22.5 pts/sprint = **10.6 sprints (21 weeks)**

**Critical Path:**
1. Foundation (must be solid before anything)
2. Onboarding (users can't use app without it)
3. Core loop (bind completion - the product)
4. Reflection + AI (the differentiator)

**Parallelization Opportunities:**
- Developer 1: Mobile UI (Onboarding, Thread, Weave)
- Developer 2: Backend + AI (FastAPI, AI services)
- AI Agents: Tests, documentation, code review

### 8.4 MVP Scope Recommendation

**If 1-week sprint (aggressive):**

| Include | Exclude | Rationale |
|---------|---------|-----------|
| Auth (Supabase) | Archetype assessment | Use simplified onboarding |
| Basic onboarding | AI goal breakdown | Manual goal entry |
| Goal CRUD | Q-goals | Simplify data model |
| Bind completion | Proof capture | Core loop only |
| Basic journal | AI feedback | Manual reflection |
| Simple dashboard | Heat map, badges | Basic progress only |

**Result:** ~40 story points, functional demo

**If 4-week sprint (realistic MVP):**

| Include | Partial | Exclude |
|---------|---------|---------|
| Full onboarding | AI goal breakdown (cached) | Archetype retake |
| Goals + binds | Q-goals (basic) | Goal change strictness |
| Completion + proof | Timer (basic) | Dual path viz |
| Journal + AI recap | Weekly insights | Past journal search |
| Dashboard | Heat map (7-day) | Badges, 90-day |
| Basic notifications | Morning + evening | Streak recovery AI |

**Result:** ~100 story points, viable MVP

---

## 9. Critical Recommendations

### 9.1 Must-Fix Before Alpha (External Testing)

| # | Issue | Risk | Effort | Owner |
|---|-------|------|--------|-------|
| 1 | Enable RLS on all tables | Security - data breach | 4h | Backend |
| 2 | Implement JWT verification | Security - unauthorized access | 2h | Backend |
| 3 | Add file upload validation | Security - malicious uploads | 2h | Backend |
| 4 | Configure CORS | Security - CSRF | 1h | Backend |
| 5 | Define offline mode strategy | UX - data loss | 4h | Mobile |

### 9.2 Must-Fix Before Beta (Public Testing)

| # | Issue | Risk | Effort | Owner |
|---|-------|------|--------|-------|
| 6 | Upgrade Anthropic tier | Scalability - rate limits | 1h | DevOps |
| 7 | Add Redis job queue | Scalability - AI bottleneck | 8h | Backend |
| 8 | Enable Supabase connection pooler | Scalability - DB connections | 1h | DevOps |
| 9 | Implement AI fallback chain | Reliability - API outages | 4h | Backend |
| 10 | Add monitoring (Sentry) | Operations - visibility | 4h | Full stack |

### 9.3 Must-Fix Before Public Launch

| # | Issue | Risk | Effort | Owner |
|---|-------|------|--------|-------|
| 11 | AI output safety filtering | Legal/trust - harmful content | 4h | Backend |
| 12 | Cost tracking dashboard | Financial - budget overrun | 8h | Full stack |
| 13 | Rate limiting implementation | Security/cost - abuse | 4h | Backend |
| 14 | Data export functionality | Compliance - GDPR | 4h | Backend |
| 15 | Account deletion flow | Compliance - GDPR | 4h | Full stack |

### 9.4 Architecture Enhancement Recommendations

| Priority | Enhancement | Benefit |
|----------|-------------|---------|
| High | Document optimistic update patterns | Consistent UX |
| High | Add API versioning strategy | Future-proofing |
| Medium | Define feature flag system | Safe rollouts |
| Medium | Add A/B testing infrastructure | Data-driven decisions |
| Low | Define microservices extraction path | Future scaling |

---

## 10. Validation Checklist

### 10.1 Architecture Completeness

- [x] Technology stack defined with versions
- [x] State management strategy documented
- [x] Data access patterns clear
- [x] Project structure complete
- [x] Naming conventions established
- [x] API response format defined
- [x] Error handling patterns documented
- [x] Epic-to-directory mapping complete

### 10.2 Security Readiness

- [ ] RLS policies implemented
- [ ] JWT verification middleware added
- [ ] File upload validation implemented
- [ ] Rate limiting configured
- [ ] CORS configured
- [ ] Input sanitization verified

### 10.3 Performance Readiness

- [x] Critical queries indexed
- [x] Caching strategy defined
- [ ] Optimistic updates implemented
- [ ] Connection pooler enabled
- [ ] Context size limits defined

### 10.4 Scalability Readiness

- [ ] Connection pooling enabled
- [ ] AI provider tier upgraded
- [ ] Job queue implemented
- [ ] Auto-scaling configured
- [ ] Rate limiting implemented

### 10.5 Reliability Readiness

- [ ] AI fallback chain implemented
- [ ] Offline mode strategy defined
- [ ] Retry logic implemented
- [ ] Monitoring configured
- [ ] Alerting configured

---

## 11. Conclusion

### Validation Summary

The Weave architecture is **fundamentally sound** and demonstrates good decision-making around:
- Technology selection (modern, compatible stack)
- State management (clear three-layer strategy)
- Cost optimization (model routing, caching)
- Data integrity (immutable event logs)

However, the architecture has **critical gaps** that must be addressed:

1. **Security:** RLS policies are deferred too long. Must implement before any external testing.
2. **Offline:** No offline strategy defined. Users with poor connectivity will be frustrated.
3. **Failure Recovery:** AI fallback chain not implemented. Single point of failure.

### Final Assessment

| Category | Score | Notes |
|----------|-------|-------|
| Design Quality | 8/10 | Well-thought-out decisions |
| Security Posture | 5/10 | Critical gaps in RLS |
| Performance Design | 9/10 | Good optimization strategies |
| Scalability Path | 7/10 | Clear but needs implementation |
| Reliability | 6/10 | Failure modes not handled |
| **Overall** | **7/10** | **Good foundation, needs hardening** |

### Recommended Next Steps

1. **Immediate (Sprint 1):** Implement RLS, JWT verification, CORS
2. **Short-term (Sprint 2):** Add monitoring, offline strategy, file validation
3. **Medium-term (Pre-beta):** Redis queue, AI fallbacks, cost tracking
4. **Pre-launch:** Safety filtering, GDPR compliance, rate limiting

---

**Document Status:** COMPLETE
**Next Review:** Before Alpha Release
**Owner:** Architecture Team
