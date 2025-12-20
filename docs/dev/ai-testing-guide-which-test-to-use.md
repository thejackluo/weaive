# AI Testing Guide: Which Test to Use?

**Last Updated:** 2025-12-19

Clear explanation of the **3 different AI test files** and when to use each one.

---

## 📋 Quick Comparison

| Test File | Type | Uses Real APIs? | Costs Money? | When to Use |
|-----------|------|----------------|--------------|-------------|
| **`tests/test_ai_service.py`** | Unit Tests | ❌ No (Mocks) | ❌ No | Every code change, CI/CD |
| **`tests/integration/test_ai_service_integration.py`** | Integration Tests | ✅ Yes (Real APIs) | ✅ Yes (~$0.0005/run) | Before deployment, validate API keys work |
| **`scripts/test_ai_service.py`** | Manual CLI Script | ✅ Yes (Real APIs) | ✅ Yes (~$0.0003/run) | Quick manual testing, debugging |

---

## File 1: Unit Tests (Mocks - Fast, Free)

### 📁 File Location

```
weave-api/tests/test_ai_service.py
```

### What It Does

- Tests AI service **logic** without calling real APIs
- Uses **mocks** (fake responses) instead of real OpenAI/Anthropic/Bedrock
- Validates fallback chain, cost tracking, rate limiting, caching
- **22 tests** covering all functionality

### Key Characteristics

✅ **Pros:**
- **Fast:** Runs in 1-2 seconds
- **Free:** No API costs
- **Reliable:** Always passes (no network issues)
- **CI/CD ready:** Safe to run on every commit

❌ **Cons:**
- Doesn't validate real API keys work
- Doesn't catch provider API changes
- Mock responses might not match real behavior

### When to Use

**Use this for:**
- ✅ Every code change (before committing)
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Quick validation after refactoring
- ✅ Testing edge cases (budget exceeded, rate limits)

**Example scenarios:**
- You changed cost tracking logic → Run unit tests
- You refactored fallback chain → Run unit tests
- You added new template → Run unit tests
- CI/CD build → Always runs unit tests

### How to Run

```bash
cd weave-api

# Run all unit tests
uv run pytest tests/test_ai_service.py -v

# Run specific test
uv run pytest tests/test_ai_service.py::test_fallback_chain -v

# Run with coverage
uv run pytest tests/test_ai_service.py --cov=app/services/ai
```

### Example Output

```
tests/test_ai_service.py::test_deterministic_provider PASSED
tests/test_ai_service.py::test_template_system PASSED
tests/test_ai_service.py::test_cost_tracker_total_daily PASSED
tests/test_ai_service.py::test_cost_tracker_user_daily PASSED
tests/test_ai_service.py::test_rate_limiter_admin_unlimited PASSED
tests/test_ai_service.py::test_rate_limiter_paid_hourly PASSED
tests/test_ai_service.py::test_rate_limiter_free_daily PASSED
tests/test_ai_service.py::test_cache_hit PASSED
tests/test_ai_service.py::test_fallback_chain PASSED

========================== 22 passed in 1.5s ===========================
```

**Cost:** $0.00 (FREE)
**Time:** 1-2 seconds

---

## File 2: Integration Tests (Real APIs - Slow, Costs Money)

### 📁 File Location

```
weave-api/tests/integration/test_ai_service_integration.py
```

### What It Does

- Tests AI service with **REAL API calls** to OpenAI, Anthropic, Bedrock
- Validates API keys work correctly
- Verifies real responses, token counts, costs
- **6 automated tests** with real providers

### Key Characteristics

✅ **Pros:**
- **Real validation:** Proves API keys work
- **Accurate costs:** Verifies cost tracking with real API prices
- **Catch provider changes:** Detects if API changes break integration

❌ **Cons:**
- **Slow:** Takes 10-30 seconds per test
- **Costs money:** ~$0.0005 per full run
- **Requires API keys:** Skips tests if keys missing
- **Can fail due to network:** Rate limits, outages, etc.

### When to Use

**Use this for:**
- ✅ Before deploying to production
- ✅ After configuring new API keys
- ✅ Weekly/monthly validation
- ✅ Verifying cost tracking accuracy

**Example scenarios:**
- You just set up AWS Bedrock → Run integration tests
- Deploying to production → Run integration tests
- Anthropic changed pricing → Run integration tests
- Monthly API key rotation → Run integration tests

### How to Run

```bash
cd weave-api

# Run all integration tests (costs ~$0.0005)
uv run pytest tests/integration/test_ai_service_integration.py -v -s

# Run only OpenAI test (costs ~$0.0001)
uv run pytest tests/integration/test_ai_service_integration.py::test_openai_real_api -v -s

# Run only Anthropic test
uv run pytest tests/integration/test_ai_service_integration.py::test_anthropic_real_api -v -s

# Run only Bedrock test
uv run pytest tests/integration/test_ai_service_integration.py::test_bedrock_real_api -v -s

# Run only free tests (no API calls)
uv run pytest tests/integration/test_ai_service_integration.py::test_deterministic_provider_free -v -s
```

### Example Output

```
tests/integration/test_ai_service_integration.py::test_openai_real_api
======================================================================
🧪 Testing OpenAI Provider (REAL API)
======================================================================

📝 Prompt: 'Say 'hi' in one word'
🤖 Model: gpt-4o-mini
💰 Expected cost: ~$0.0001

⏳ Calling OpenAI API...

✅ Response received!
📄 Content: 'Hi'
📊 Input tokens: 12
📊 Output tokens: 1
💵 Actual cost: $0.000002
🏢 Provider: openai

✅ All assertions passed!
======================================================================
PASSED

tests/integration/test_ai_service_integration.py::test_anthropic_real_api PASSED
tests/integration/test_ai_service_integration.py::test_bedrock_real_api SKIPPED (AWS not configured)
tests/integration/test_ai_service_integration.py::test_cost_tracking_accuracy PASSED

========================== 5 passed, 1 skipped in 15s ===========================
```

**Cost:** ~$0.0005 per full run
**Time:** 10-30 seconds

---

## File 3: Manual CLI Script (Real APIs - Interactive)

### 📁 File Location

```
weave-api/scripts/test_ai_service.py
```

### What It Does

- Simple **Python script** for quick manual testing
- Calls real APIs (OpenAI, Anthropic, Bedrock, Deterministic)
- Shows results in terminal with colors and formatting
- **Not a pytest test** - just a helper script

### Key Characteristics

✅ **Pros:**
- **Easiest to run:** Just `python scripts/test_ai_service.py`
- **Interactive output:** Pretty terminal formatting
- **Fastest manual test:** No pytest overhead
- **Good for debugging:** See exactly what each provider returns

❌ **Cons:**
- **Not automated:** Must run manually
- **No assertions:** Doesn't validate results automatically
- **Costs money:** Same as integration tests

### When to Use

**Use this for:**
- ✅ First time testing after setup
- ✅ Quick debugging of provider issues
- ✅ Showing someone how AI service works
- ✅ Manual spot-checking before deployment

**Example scenarios:**
- You just configured OpenAI key → Run CLI script to verify
- API seems broken → Run CLI script to debug
- Want to see real AI response quickly → Run CLI script
- Demoing AI service to team → Run CLI script

### How to Run

```bash
cd weave-api

# Run all providers
uv run python scripts/test_ai_service.py

# No options - always tests all providers
```

### Example Output

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
  📊 Test Summary
======================================================================

✅ OPENAI: Success ($0.000002)
✅ ANTHROPIC: Success ($0.000025)
⚠️  BEDROCK: Skipped (AWS not configured)
✅ DETERMINISTIC: Success ($0.000000)

----------------------------------------------------------------------
💵 Total cost: $0.000027
✅ Successful tests: 3/4
======================================================================
```

**Cost:** ~$0.0003 per run
**Time:** 5-10 seconds

---

## Decision Tree: Which Test Should I Run?

```
Are you writing/changing code?
  ├─ YES → Run unit tests (tests/test_ai_service.py)
  │         Fast, free, validates logic
  │
  └─ NO → Continue...

Did you just configure API keys?
  ├─ YES → Run CLI script (scripts/test_ai_service.py)
  │         Quick validation, see real responses
  │
  └─ NO → Continue...

Are you deploying to production?
  ├─ YES → Run integration tests (tests/integration/...)
  │         Full validation, verify all providers work
  │
  └─ NO → Continue...

Are you debugging an API issue?
  ├─ YES → Run CLI script (scripts/test_ai_service.py)
  │         Interactive, easy to see what's wrong
  │
  └─ NO → Run unit tests for quick validation
```

---

## Real-World Scenarios

### Scenario 1: "I just cloned the repo"

**What to run:**
1. First: Unit tests to verify code works
2. Then: CLI script to test with your API keys

```bash
# Step 1: Verify code logic (free, fast)
uv run pytest tests/test_ai_service.py -v

# Step 2: Test real APIs (small cost)
uv run python scripts/test_ai_service.py
```

---

### Scenario 2: "I changed cost tracking logic"

**What to run:**
1. Unit tests to validate new logic
2. Integration test for cost accuracy (optional)

```bash
# Step 1: Fast validation (free)
uv run pytest tests/test_ai_service.py::test_cost_tracker -v

# Step 2: Verify real costs match (optional, costs $0.0001)
uv run pytest tests/integration/test_ai_service_integration.py::test_cost_tracking_accuracy -v -s
```

---

### Scenario 3: "OpenAI API key expired, I got a new one"

**What to run:**
1. CLI script to quickly verify new key works

```bash
# Quick test (costs ~$0.0001)
uv run python scripts/test_ai_service.py
```

---

### Scenario 4: "Deploying to production tomorrow"

**What to run:**
1. Unit tests (ensure no regressions)
2. Integration tests (validate all providers)

```bash
# Step 1: Unit tests (free, 2 seconds)
uv run pytest tests/test_ai_service.py -v

# Step 2: Integration tests (costs ~$0.0005, 30 seconds)
uv run pytest tests/integration/test_ai_service_integration.py -v -s
```

---

### Scenario 5: "CI/CD pipeline on GitHub Actions"

**What to run:**
- Only unit tests (integration tests too expensive for every commit)

```yaml
# .github/workflows/test.yml
- name: Run unit tests
  run: uv run pytest tests/test_ai_service.py -v
  # Don't run integration tests (costs money on every commit)
```

---

## Cost Summary

| Test File | Cost per Run | When to Run | Frequency |
|-----------|--------------|-------------|-----------|
| Unit tests | **$0.00** | Every code change | Multiple times/day |
| Integration tests | **~$0.0005** | Before deployment | Weekly/monthly |
| CLI script | **~$0.0003** | Manual debugging | As needed |

**Monthly costs:**
- Unit tests: $0 (run 100x/day = free)
- Integration tests: $0.02 (run 1x/week = 4x/month)
- CLI script: $0.009 (run 2x/week = 8x/month)

**Total:** ~$0.03/month for comprehensive testing

---

## Quick Reference Table

| I Want To... | Run This |
|--------------|----------|
| **Validate code changes** | `uv run pytest tests/test_ai_service.py -v` |
| **Test my OpenAI key** | `uv run python scripts/test_ai_service.py` |
| **Prepare for production** | `uv run pytest tests/integration/ -v -s` |
| **Debug provider issue** | `uv run python scripts/test_ai_service.py` |
| **CI/CD pipeline** | `uv run pytest tests/test_ai_service.py -v` |
| **Quick cost check** | `uv run python scripts/test_ai_service.py` |
| **Test fallback chain** | `uv run pytest tests/test_ai_service.py::test_fallback_chain -v` |
| **Verify AWS Bedrock works** | `uv run pytest tests/integration/...::test_bedrock_real_api -v -s` |

---

## Summary

**Three test files, three purposes:**

1. **Unit Tests** (`tests/test_ai_service.py`)
   - Purpose: Fast logic validation
   - Cost: Free
   - Run: Every code change

2. **Integration Tests** (`tests/integration/test_ai_service_integration.py`)
   - Purpose: Real API validation
   - Cost: ~$0.0005/run
   - Run: Before deployment

3. **CLI Script** (`scripts/test_ai_service.py`)
   - Purpose: Quick manual testing
   - Cost: ~$0.0003/run
   - Run: Debugging, first setup

**Most common workflow:**
```bash
# 1. After code change (free, 2s)
uv run pytest tests/test_ai_service.py -v

# 2. Before committing (free, 2s)
uv run pytest tests/test_ai_service.py -v

# 3. After configuring new API key (costs $0.0003, 10s)
uv run python scripts/test_ai_service.py

# 4. Before deploying to production (costs $0.0005, 30s)
uv run pytest tests/integration/ -v -s
```

---

**Next:** See `docs/testing/ai-service-real-api-testing.md` for detailed integration testing guide.
