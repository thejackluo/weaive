# AI System Requirements

## AI Modules

| Module | Trigger | Output | Model | Cost Tier |
|--------|---------|--------|-------|-----------|
| Onboarding Coach | Goal setup | Goal tree + identity doc | GPT-4/Sonnet | High |
| Triad Planner | Journal submission | 3 tasks for tomorrow | GPT-3.5/Haiku | Low |
| Daily Recap Generator | Journal submission | Insights + suggestions | GPT-3.5/Haiku | Low |
| Dream Self Advisor | User chat | Coaching response | GPT-4/Sonnet | High |
| AI Insights Engine | Weekly cron | Pattern analysis | GPT-4/Sonnet | Medium |

## Cost Control Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| AI-C1 | AI cost per free user/month | <$0.10 | M |
| AI-C2 | AI cost per Pro user/month | <$0.50 | M |
| AI-C3 | AI cost per Max user/month | <$1.50 | M |
| AI-C4 | Cache hit rate | >80% | M |
| AI-C5 | Chat rate limit | 10 msgs/hour | M |

## Cost Optimization Strategies

1. **Prompt Caching:** Cache static context (identity, goals) - 60-90% reduction
2. **Semantic Caching:** Reuse responses for similar queries - 30-50% reduction
3. **Model Routing:** Use Haiku for routine, Sonnet for complex - 40% reduction
4. **Batch Operations:** Group AI calls at journal time

## AI Principles (Non-Negotiable)

1. **Editable by Default:** All AI outputs can be modified by user
2. **No Hallucinated Certainty:** AI labels assumptions, asks questions
3. **Deterministic Personality:** Same inputs yield consistent coaching style
4. **Guardrails:** Enforced constraints (max goals, valid dates, evidence grounding)

## AI Safety Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| AI-S1 | Prompt injection detection | M |
| AI-S2 | No harmful content generation | M |
| AI-S3 | Evidence grounding (no invented facts) | M |
| AI-S4 | User data privacy in prompts | M |

## Memory System Architecture **[NEW - Implementation Readiness]**

**Decision:** Simple approach for MVP, no fancy vector DB. Scale to semantic search later if needed.

### MVP Memory Storage (PostgreSQL)

| Component | Implementation | Rationale |
|-----------|----------------|-----------|
| **Storage** | PostgreSQL `TEXT[]` arrays in `user_memories` table | Avoid external vector DB complexity |
| **Search** | Keyword-based (PostgreSQL `LIKE` or GIN index) | Fast, simple, good enough for <100 memories |
| **Embedding** | None for MVP | Defer until usage patterns justify cost |

### Memory Schema

```sql
CREATE TABLE user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  memory_type TEXT NOT NULL CHECK (memory_type IN ('win', 'insight', 'pattern', 'blocker')),
  content TEXT NOT NULL,
  source TEXT NOT NULL, -- 'journal', 'capture', 'ai_chat', 'goal_completion'
  keywords TEXT[] NOT NULL, -- For keyword search
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  relevance_score INTEGER DEFAULT 5, -- 1-10, decays over time
  archived_at TIMESTAMPTZ -- Soft delete after 100 memories
);

CREATE INDEX idx_user_memories_user_keywords ON user_memories USING GIN (keywords);
CREATE INDEX idx_user_memories_user_date ON user_memories (user_id, created_at DESC);
```

### Memory Lifecycle

| Event | Action | Logic |
|-------|--------|-------|
| **Journal Submit** | Extract 1-3 memories | AI identifies wins/insights/patterns from fulfillment + reflection text |
| **Goal Complete** | Create memory | "Completed goal: [title]" → stored as 'win' |
| **AI Chat** | Store important exchanges | User-flagged messages or AI-detected breakthroughs |
| **Pruning** | Archive oldest memories at 100 limit | Keep most recent 50 + top 50 by relevance_score |

### Memory Retrieval (for AI Context)

**When:** Before AI chat, weekly insights, triad generation

**Strategy:**
1. Fetch recent memories (7 days): `WHERE user_id = X AND created_at > NOW() - INTERVAL '7 days'`
2. Fetch top wins: `WHERE memory_type = 'win' ORDER BY relevance_score DESC LIMIT 3`
3. Fetch relevant keywords: `WHERE keywords && ARRAY['fitness', 'gym']` (if goal is fitness-related)
4. Combine up to 10 memories max (limit AI context bloat)

### Memory Extraction (AI)

**Prompt:**
```
From this journal entry, extract 1-3 key memories:
- Wins: Achievements, completions, breakthroughs
- Insights: Learnings, realizations, patterns discovered
- Blockers: Obstacles, struggles, repeated failures

Journal: {user_reflection_text}
Fulfillment: {score}/10

Return JSON: [{"type": "win", "content": "...", "keywords": ["..."]}]
```

**Cost Control:** Memory extraction piggybacks on journal AI call (no extra API cost)

### Future Enhancements (Post-MVP)

| Enhancement | Trigger | Estimated Cost |
|-------------|---------|----------------|
| **Semantic Search** | >500 memories per user OR user requests better memory | $0.0001/query (OpenAI embeddings) |
| **Vector DB** | >1M total memories OR <50% keyword match rate | Pinecone $70/mo (10K users) |
| **Multi-modal** | Image/audio capture analysis | Vision API $0.01/image |

**MVP Decision Rationale:**
- Most users will have <50 memories in first 30 days
- Keyword search is 90% effective for short-term memory
- PostgreSQL avoids external dependency, simplifies deployment
- Can migrate to vector DB seamlessly later (same schema, add `embedding VECTOR(1536)` column)

---
