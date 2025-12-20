# Bedrock IAM Policy Fix: Inference Profile Access

## Problem

You're seeing this error when trying to use AWS Bedrock:

```
AccessDeniedException: User: arn:aws:iam::211125649434:user/Weave-Bedrock-API is not authorized to perform: bedrock:InvokeModel on resource: arn:aws:bedrock:us-east-1:211125649434:inference-profile/us.anthropic.claude-3-5-haiku-20241022-v1:0
```

## Root Cause

**AWS Bedrock changed their API requirements** in late 2024/early 2025. They now require using **inference profiles** instead of direct foundation model IDs. This means:

- ❌ **Old method:** `arn:aws:bedrock:region::foundation-model/model-id` (no longer works)
- ✅ **New method:** `arn:aws:bedrock:region:account:inference-profile/profile-id` (required)

Your IAM policy likely grants access to `foundation-model/*` but NOT `inference-profile/*`.

## Solution: Update IAM Policy

### Step 1: Get the Correct IAM Policy JSON

Replace your existing Bedrock policy with this updated version:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "BedrockInferenceProfileAccess",
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": [
                "arn:aws:bedrock:*:*:inference-profile/*"
            ]
        },
        {
            "Sid": "BedrockFoundationModelAccess",
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": [
                "arn:aws:bedrock:*::foundation-model/*"
            ]
        },
        {
            "Sid": "BedrockModelAccess",
            "Effect": "Allow",
            "Action": [
                "bedrock:ListFoundationModels",
                "bedrock:GetFoundationModel",
                "bedrock:ListInferenceProfiles",
                "bedrock:GetInferenceProfile"
            ],
            "Resource": "*"
        }
    ]
}
```

**Why three statements?**
1. **Inference Profile Access** (required for new API) - This is what's missing!
2. **Foundation Model Access** (backward compatibility, optional but harmless)
3. **Model Discovery** (lets you list/get model info, useful for debugging)

### Step 2: Apply the Policy in AWS Console

#### Option A: Attach Managed Policy (Easiest)

If you want the simplest solution, use AWS's managed policy:

1. Go to **IAM → Users** → Select your `Weave-Bedrock-API` user
2. Click **Add permissions** → **Attach policies directly**
3. Search for **`AmazonBedrockFullAccess`**
4. Select it and click **Add permissions**

✅ **Done!** This gives full Bedrock access including inference profiles.

⚠️ **Note:** This is broader than needed but easiest for development. For production, use Option B below.

#### Option B: Create Custom Inline Policy (Recommended for Production)

For more granular control:

1. Go to **IAM → Users** → Select your `Weave-Bedrock-API` user
2. Click **Permissions** tab
3. Find your existing Bedrock policy and click **Edit**
   - If you don't have a Bedrock policy yet, click **Add inline policy**
4. Click the **JSON** tab
5. **Replace** the entire JSON with the policy above (from Step 1)
6. Click **Review policy**
7. Name it: `WeaveBedrockInferenceProfileAccess`
8. Click **Create policy**

### Step 3: Verify the Fix

Run the test script again:

```bash
cd weave-api
uv run python scripts/test_ai_service.py
```

**Expected output for Bedrock:**
```
✅ SUCCESS!
📄 Response: 'Hey'
📊 Tokens: 12 in + 2 out
💵 Cost: $0.000006
🏢 Provider: bedrock
```

If you still see `AccessDeniedException`, wait 1-2 minutes for IAM policy propagation, then try again.

## Understanding Inference Profiles

### What are Cross-Region Inference Profiles?

AWS Bedrock's new inference profiles provide:
- **Cross-region availability:** Automatically route to available regions if one is down
- **Better quota management:** Separate quotas from on-demand foundation model access
- **Future-proof:** AWS's preferred method going forward

### Inference Profile ID Format

```
us.anthropic.claude-3-5-haiku-20241022-v1:0
│  │         └─ Model name with version
│  └─ Provider (anthropic)
└─ Region prefix (us = United States regions)
```

**Currently available inference profiles:**
- `us.anthropic.claude-3-5-haiku-20241022-v1:0` (fast, $0.25/$1.25 per MTok)
- `us.anthropic.claude-3-5-sonnet-20241022-v1:0` (balanced, $3.00/$15.00 per MTok)

### User-Friendly Model Names

Our code maps user-friendly names to inference profile IDs:

```python
# You can use short names:
response = provider.complete(prompt, model='claude-3-5-haiku')

# Which maps to:
# us.anthropic.claude-3-5-haiku-20241022-v1:0
```

**Available short names:**
- `claude-3-5-haiku` → `us.anthropic.claude-3-5-haiku-20241022-v1:0`
- `claude-3-5-sonnet` → `us.anthropic.claude-3-5-sonnet-20241022-v1:0`

## Troubleshooting

### Still Getting AccessDeniedException?

**Check 1: Verify the IAM user name**
```bash
# In the error message, find:
User: arn:aws:iam::211125649434:user/Weave-Bedrock-API
                                        └─ This is your IAM user name
```

Make sure you're editing the policy for the correct user!

**Check 2: Verify AWS credentials in `.env`**
```bash
# weave-api/.env
AWS_ACCESS_KEY_ID=AKIA...  # Must match the Weave-Bedrock-API user
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

**Check 3: Test credentials directly**
```bash
# Test AWS CLI access
aws bedrock list-foundation-models --region us-east-1

# If this fails with authentication error, your credentials are wrong
```

**Check 4: IAM policy propagation delay**
- Wait 1-2 minutes after changing IAM policies
- Policies don't take effect immediately

### Model Not Found Error?

If you see:
```
ValidationException: Could not find inference profile us.anthropic.claude-...
```

**Possible causes:**
1. **Model not available in your region:** Try `us-east-1` (best availability)
2. **Model access not requested:** Go to AWS Bedrock → Model Access → Request access
3. **Typo in model ID:** Use our short names (`claude-3-5-haiku`) to avoid typos

### Request Model Access

If you haven't requested model access yet:

1. Go to **AWS Console** → **Amazon Bedrock**
2. Click **Model access** in left sidebar
3. Click **Modify model access**
4. Enable:
   - ✅ **Anthropic Claude 3.5 Haiku**
   - ✅ **Anthropic Claude 3.5 Sonnet**
5. Click **Save changes**
6. Wait 1-2 minutes for approval (usually instant)

## Cost Implications

With the correct IAM policy, you'll be using Bedrock as the primary AI provider:

**Estimated costs (with Haiku for 90% of calls):**
- Daily budget: $83.33
- Per free user: $0.02/day (~$0.60/month)
- Per paid user: $0.10/day (~$3.00/month)

**Haiku pricing (primary model):**
- Input: $0.25 per million tokens
- Output: $1.25 per million tokens
- ~5x cheaper than Sonnet

## Next Steps

1. ✅ Apply the IAM policy fix (Option A or B above)
2. ✅ Run test script: `uv run python scripts/test_ai_service.py`
3. ✅ Verify Bedrock shows `✅ SUCCESS!`
4. ✅ Check cost tracking: `uv run python scripts/verify_cost_tracking.py`
5. ✅ Test real-time streaming (once implemented)

## References

- [AWS Bedrock Inference Profiles Docs](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles.html)
- [AWS IAM Policy Docs](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)
- Our setup guide: `docs/dev/aws-bedrock-setup.md`
- AI service guide: `docs/dev/ai-service-guide.md`

---

**Created:** 2025-12-19
**Issue:** AccessDeniedException for inference profiles
**Fix:** Update IAM policy to allow `bedrock:InvokeModel` on `inference-profile/*` resources
