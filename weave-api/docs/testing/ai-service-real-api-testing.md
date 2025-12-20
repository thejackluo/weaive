# AI Service Real API Testing Guide

**Last Updated:** 2025-12-19

Complete guide for testing the AI service with **REAL API calls** and verifying cost tracking works correctly.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start: CLI Testing](#quick-start-cli-testing)
3. [Integration Tests](#integration-tests)
4. [Cost Verification](#cost-verification)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. API Keys Configured

Ensure your `.env` file has valid API keys:

```bash
# OpenAI
OPENAI_API_KEY=sk-...your-actual-key...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...your-actual-key...

# AWS Bedrock (if testing Bedrock)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

### 2. Database Running

If testing cost tracking with database:

```bash
# Start local Supabase
npx supabase start

# Apply migrations (ensure ai_runs table exists)
npx supabase db push
```

### 3. Dependencies Installed

```bash
cd weave-api
uv sync  # Install all dependencies including boto3, openai, anthropic
```

---

## Quick Start: CLI Testing

**Fastest way to test with real APIs** - uses a simple Python script.

### Run All Providers

```bash
cd weave-api
uv run python scripts/test_ai_service.py
```

**Expected output:**

```
🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀
AI SERVICE MANUAL TESTING
🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀

======================================================================
  🤖 Testing OpenAI Provider
======================================================================

📝 Prompt: 'Say 'hello' in exactly one word'
🎯 Model: gpt-4o-mini
💰 Pricing: $0.15/MTok input, $0.60/MTok output

⏳ Calling OpenAI API...

✅ SUCCESS!
📄 Response: 'Hello'
📊 Tokens: 12 in + 1 out
💵 Cost: $0.000002
🏢 Provider: openai

======================================================================
  🧠 Testing Anthropic Provider
======================================================================

📝 Prompt: 'Say 'hi' in exactly one word'
🎯 Model: claude-4-5-haiku-20250514
💰 Pricing: $1.00/MTok input, $5.00/MTok output

⏳ Calling Anthropic API...

✅ SUCCESS!
📄 Response: 'Hi'
📊 Tokens: 15 in + 2 out
💵 Cost: $0.000025
🏢 Provider: anthropic

======================================================================
  🎲 Testing Deterministic Provider (FREE)
======================================================================

📦 Module: triad
💰 Cost: $0.00 (always free)

⏳ Generating response...

✅ SUCCESS!
📄 Response:
Based on your progress, here's what matters most tomorrow:

1. Complete report
2. Review code
3. Exercise 30min

Focus on these to maintain momentum toward your goals.
💵 Cost: $0.000000
🏢 Provider: deterministic

======================================================================
  📊 Test Summary
======================================================================

✅ OPENAI: Success ($0.000002)
✅ ANTHROPIC: Success ($0.000025)
⚠️  BEDROCK: Skipped or Failed
✅ DETERMINISTIC: Success ($0.000000)

----------------------------------------------------------------------
💵 Total cost: $0.000027
✅ Successful tests: 3/4
======================================================================
```

**Cost:** ~$0.0003 per full run (all 3 paid providers)

---

## Integration Tests

**Automated pytest tests** with real API calls.

### Run All Integration Tests

```bash
cd weave-api
uv run pytest tests/integration/test_ai_service_integration.py -v -s
```

**Expected output:**

```
tests/integration/test_ai_service_integration.py::test_openai_real_api PASSED
tests/integration/test_ai_service_integration.py::test_anthropic_real_api PASSED
tests/integration/test_ai_service_integration.py::test_bedrock_real_api SKIPPED (AWS credentials not configured)
tests/integration/test_ai_service_integration.py::test_fallback_chain_real_apis PASSED
tests/integration/test_ai_service_integration.py::test_cost_tracking_accuracy PASSED
tests/integration/test_ai_service_integration.py::test_deterministic_provider_free PASSED
```

### Run Specific Provider Tests

**OpenAI only:**

```bash
uv run pytest tests/integration/test_ai_service_integration.py::test_openai_real_api -v -s
```

**Anthropic only:**

```bash
uv run pytest tests/integration/test_ai_service_integration.py::test_anthropic_real_api -v -s
```

**Bedrock only:**

```bash
uv run pytest tests/integration/test_ai_service_integration.py::test_bedrock_real_api -v -s
```

**Deterministic (free, no API key needed):**

```bash
uv run pytest tests/integration/test_ai_service_integration.py::test_deterministic_provider_free -v -s
```

### Test Cost Tracking Accuracy

Verifies that cost calculations match expected values:

```bash
uv run pytest tests/integration/test_ai_service_integration.py::test_cost_tracking_accuracy -v -s
```

**Expected output:**

```
======================================================================
🧪 Testing Cost Tracking Accuracy (REAL API)
======================================================================

📝 Prompt: 'Count to 3'
🤖 Model: gpt-4o-mini
💰 Pricing: $0.15/MTok (input), $0.60/MTok (output)

⏳ Calling OpenAI API...

✅ Response received!
📄 Content: '1, 2, 3'
📊 Input tokens: 8
📊 Output tokens: 5
💵 Calculated cost: $0.000004

🧮 Manual verification:
   Input cost: 8 tokens × $0.15/MTok = $0.000001
   Output cost: 5 tokens × $0.60/MTok = $0.000003
   Expected total: $0.000004
   Actual total: $0.000004
   Difference: $0.00000000

✅ Cost tracking accurate to within $0.000001!
======================================================================
```

---

## Cost Verification

After running tests, verify costs were tracked correctly in the database.

### SQL Queries for Verification

**1. Check Recent AI Runs (Last 5 Minutes)**

```sql
SELECT
  provider,
  model,
  input_tokens,
  output_tokens,
  cost_estimate,
  created_at
FROM ai_runs
WHERE created_at >= NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;
```

**Expected result:**

| provider | model | input_tokens | output_tokens | cost_estimate | created_at |
|----------|-------|--------------|---------------|---------------|------------|
| openai | gpt-4o-mini | 12 | 1 | 0.000002 | 2025-12-19 10:30:15 |
| anthropic | claude-4-5-haiku... | 15 | 2 | 0.000025 | 2025-12-19 10:30:20 |
| deterministic | deterministic | 30 | 30 | 0.000000 | 2025-12-19 10:30:25 |

---

**2. Check Total Daily Cost (Today)**

```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_calls,
  SUM(cost_estimate) as total_cost,
  AVG(cost_estimate) as avg_cost,
  provider
FROM ai_runs
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY DATE(created_at), provider
ORDER BY provider;
```

**Expected result:**

| date | total_calls | total_cost | avg_cost | provider |
|------|-------------|------------|----------|----------|
| 2025-12-19 | 5 | 0.000025 | 0.000005 | anthropic |
| 2025-12-19 | 3 | 0.000000 | 0.000000 | deterministic |
| 2025-12-19 | 8 | 0.000016 | 0.000002 | openai |

---

**3. Check Per-User Daily Cost**

```sql
SELECT
  user_id,
  COUNT(*) as calls_today,
  SUM(cost_estimate) as user_daily_cost
FROM ai_runs
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY user_id
ORDER BY user_daily_cost DESC;
```

**Expected result:**

| user_id | calls_today | user_daily_cost |
|---------|-------------|-----------------|
| user-abc-123 | 16 | 0.000041 |

**Verify against budget:**
- Free users: Should be < $0.02/day
- Paid users: Should be < $0.10/day
- Application-wide: Should be < $83.33/day

---

**4. Check Budget Alert Threshold (80%)**

```sql
-- Application-wide budget check
SELECT
  SUM(cost_estimate) as total_daily_cost,
  83.33 as daily_budget,
  (SUM(cost_estimate) / 83.33) * 100 as budget_used_pct
FROM ai_runs
WHERE DATE(created_at) = CURRENT_DATE;
```

**Expected result:**

| total_daily_cost | daily_budget | budget_used_pct |
|------------------|--------------|-----------------|
| 0.000041 | 83.33 | 0.00005% |

**Budget alerts should trigger:**
- Warning at 80%: $66.66 daily cost
- Error at 100%: $83.33 daily cost

---

**5. Verify Token Counting Accuracy**

```sql
SELECT
  provider,
  model,
  input_tokens,
  output_tokens,
  cost_estimate,
  -- Manual calculation for verification
  CASE provider
    WHEN 'openai' THEN (input_tokens * 0.15 / 1000000) + (output_tokens * 0.60 / 1000000)
    WHEN 'anthropic' THEN (input_tokens * 1.00 / 1000000) + (output_tokens * 5.00 / 1000000)
    ELSE 0
  END as manual_calc_cost,
  -- Difference
  ABS(cost_estimate -
    CASE provider
      WHEN 'openai' THEN (input_tokens * 0.15 / 1000000) + (output_tokens * 0.60 / 1000000)
      WHEN 'anthropic' THEN (input_tokens * 1.00 / 1000000) + (output_tokens * 5.00 / 1000000)
      ELSE 0
    END
  ) as cost_difference
FROM ai_runs
WHERE created_at >= NOW() - INTERVAL '5 minutes'
  AND provider IN ('openai', 'anthropic')
ORDER BY created_at DESC;
```

**Expected:** `cost_difference` should be < 0.000001 (one millionth of a dollar)

---

## Troubleshooting

### Issue: "API key not configured"

**Symptom:**

```
⚠️  Skipping OpenAI (API key not configured)
```

**Solution:**

1. Check `.env` file exists in `weave-api/` directory
2. Verify API key is valid (not placeholder)
3. Reload environment: `source .env` (Linux/Mac) or restart terminal

**Verify:**

```bash
cd weave-api
echo $OPENAI_API_KEY  # Should show your key
```

---

### Issue: "AWS credentials not configured"

**Symptom:**

```
⚠️  Skipping Bedrock (AWS credentials not configured)
```

**Solution:**

1. Follow AWS setup guide: `docs/dev/aws-bedrock-setup.md`
2. Configure IAM user with Bedrock permissions
3. Request model access in AWS Console (Bedrock → Model Access)
4. Add credentials to `.env`:

```bash
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

**Test AWS credentials:**

```bash
aws sts get-caller-identity  # Should show your AWS account
```

---

### Issue: "Rate limit exceeded"

**Symptom:**

```
❌ ERROR: Rate limit exceeded (429)
```

**Solution:**

1. Wait 60 seconds and retry
2. Check OpenAI/Anthropic account tier (Tier 1: $100/month limit)
3. For OpenAI: Check rate limit status at https://platform.openai.com/account/limits

**Reduce test frequency:**

- Run one provider at a time
- Increase delay between tests
- Use deterministic provider (free, unlimited)

---

### Issue: "Cost calculation mismatch"

**Symptom:**

```
AssertionError: abs(response.cost_usd - expected_total) >= 0.000001
```

**Solution:**

1. Verify pricing in provider files matches current API pricing
2. Check token counting accuracy (OpenAI uses tiktoken, others approximate)
3. Update pricing if API rates changed:

**OpenAI pricing:** https://openai.com/api/pricing/
**Anthropic pricing:** https://claude.ai/pricing#api
**Bedrock pricing:** Same as Anthropic direct

**Update in provider files:**

```python
# weave-api/app/services/ai/openai_provider.py
self.pricing = {
    'gpt-4o-mini': {
        'input': 0.15 / 1_000_000,  # Update if changed
        'output': 0.60 / 1_000_000
    },
}
```

---

### Issue: Database connection failed

**Symptom:**

```
psycopg2.OperationalError: could not connect to server
```

**Solution (if testing with database):**

1. Start Supabase: `npx supabase start`
2. Check connection string in `.env`:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

3. Verify database running:

```bash
npx supabase status  # Should show "Running"
```

---

## Expected Costs

### Per Test Run

| Test Type | Providers Tested | Expected Cost |
|-----------|------------------|---------------|
| CLI Script (all) | OpenAI + Anthropic + Deterministic | ~$0.0003 |
| Integration Tests (all) | OpenAI + Anthropic + Bedrock + Deterministic | ~$0.0005 |
| Single Provider Test | 1 provider | ~$0.0001 |
| Deterministic Only | Deterministic | $0.00 (FREE) |

### Daily Budget Monitoring

With active testing:

- **10 test runs/day:** ~$0.003 daily ($0.09/month)
- **100 test runs/day:** ~$0.03 daily ($0.90/month)
- **1000 test runs/day:** ~$0.30 daily ($9.00/month)

**Well under budget:**
- Application-wide limit: $83.33/day
- Free user limit: $0.02/day per user
- Paid user limit: $0.10/day per user

---

## Summary

**Quick Test Workflow:**

1. **Configure API keys** in `.env`
2. **Run CLI script:** `uv run python scripts/test_ai_service.py`
3. **Verify costs:** Check SQL queries above
4. **Run integration tests:** `uv run pytest tests/integration/ -v -s`

**Cost:** ~$0.0003 per test run
**Time:** ~10 seconds per provider
**Confidence:** High (real API validation)

---

**Next:** See `docs/dev/ai-service-guide.md` for production usage patterns.
