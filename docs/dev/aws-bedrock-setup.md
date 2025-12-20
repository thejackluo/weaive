# AWS Bedrock Setup Guide

**Purpose:** Configure AWS Bedrock as the primary AI provider for Weave MVP, leveraging AWS credits for maximum runway.

**Story Reference:** 0.6 - AI Service Abstraction Layer
**Last Updated:** 2025-12-19

---

## Overview

AWS Bedrock provides access to Claude models (3.5 Haiku, 3.7 Sonnet, 4.5 Haiku) with the same pricing as Anthropic direct API, but billed through AWS for better runway and credit utilization.

**Why Bedrock:**
- ✅ Most AWS credits/runway for long-term sustainability
- ✅ Comprehensive model access (all Claude models)
- ✅ Higher rate limits than API key-based access
- ✅ AWS account-based quotas (more flexible)
- ✅ Strategic platform choice for scaling

---

## Prerequisites

Before starting:
- ✅ AWS account with billing enabled
- ✅ Access to AWS Console (IAM, Bedrock services)
- ✅ `weave-api/` backend project configured

---

## Step 1: Create IAM User for Bedrock API Access

### 1.1 Navigate to IAM

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Search for "IAM" in the top search bar
3. Click **IAM** (Identity and Access Management)

### 1.2 Create New User

1. Click **Users** in left sidebar
2. Click **Create User** button
3. **User name:** `weave-bedrock-api`
4. **AWS access type:**
   - ✅ Uncheck "Provide user access to the AWS Management Console"
   - We only need **programmatic access** (API keys)
5. Click **Next**

### 1.3 Attach Permissions

You have two options for permissions:

#### Option A: Use AWS Managed Policy (Recommended for MVP)

1. Select **Attach policies directly**
2. Search for `AmazonBedrockFullAccess`
3. ✅ Check the box next to **AmazonBedrockFullAccess**
4. Click **Next**

**Pros:** Simple, covers all Bedrock operations
**Cons:** Broader permissions than strictly necessary

#### Option B: Create Custom Policy (Production-Ready, Least Privilege)

1. Select **Attach policies directly**
2. Click **Create policy** (opens new tab)
3. Select **JSON** tab
4. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockModelInvoke",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-haiku-20241022-v1:0",
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-7-sonnet-20250219-v2:0",
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-4-5-haiku-20250514-v1:0"
      ]
    }
  ]
}
```

5. Click **Next**
6. **Policy name:** `WeaveBedrockInvokeOnly`
7. **Description:** "Allow Weave API to invoke Bedrock models for AI generation"
8. Click **Create policy**
9. Return to previous tab (Create User)
10. Refresh the policy list
11. Search for `WeaveBedrockInvokeOnly`
12. ✅ Check the box next to your custom policy
13. Click **Next**

**Pros:** Least privilege, only allows model invocation
**Cons:** Requires more setup, need to update if adding new models

### 1.4 Review and Create

1. Review user details:
   - User name: `weave-bedrock-api`
   - Permissions: `AmazonBedrockFullAccess` or `WeaveBedrockInvokeOnly`
2. Click **Create user**

---

## Step 2: Generate Access Keys

### 2.1 Create Access Key

1. After user is created, you'll be on the user's detail page
2. Click the **Security credentials** tab
3. Scroll down to **Access keys** section
4. Click **Create access key**

### 2.2 Select Use Case

1. Choose **Application running outside AWS**
2. ✅ Check "I understand the above recommendation..."
3. Click **Next**

### 2.3 Add Description (Optional)

1. **Description tag:** `Weave MVP Bedrock API Access`
2. Click **Create access key**

### 2.4 Save Credentials

⚠️ **CRITICAL: This is the ONLY time you'll see the secret key!**

You'll see:
- **Access key ID:** Starts with `AKIA...` (example: `AKIAIOSFODNN7EXAMPLE`)
- **Secret access key:** Long random string (example: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)

**Save these immediately:**
1. Click **Download .csv file** (recommended)
2. Or copy both keys to a secure password manager
3. **DO NOT** share these keys or commit them to version control

### 2.5 Store Securely

**Best Practices:**
- ✅ Store in password manager (1Password, LastPass, etc.)
- ✅ Save CSV file in secure location (encrypted folder)
- ❌ Never commit to Git
- ❌ Never share via email/Slack/Discord
- ❌ Never hardcode in source code

---

## Step 3: Enable Bedrock Model Access

### 3.1 Navigate to Bedrock

1. Go back to AWS Console home
2. Search for "Bedrock" in top search bar
3. Click **Amazon Bedrock**

### 3.2 Request Model Access

1. Click **Model access** in left sidebar (under "Foundation models")
2. Click **Manage model access** button (top right)
3. Scroll down to **Anthropic** section
4. ✅ Check these models:
   - **Claude 3.5 Haiku** - Primary for routine operations (~$0.25/$1.25 per MTok)
   - **Claude 3.7 Sonnet** - For complex reasoning ($3.00/$15.00 per MTok)
   - **Claude 4.5 Haiku** - Optional fast model ($1.00/$5.00 per MTok)
5. Click **Request model access** button (bottom right)

### 3.3 Wait for Approval

- **Status:** Usually **instant** ✅
- **Time:** Can take up to 24 hours in rare cases
- **Check status:** Model access page will show "Access granted" when ready

**How to verify:**
1. Go to **Model access** page
2. Look for green "Access granted" status next to each model
3. If status is "In progress", wait a few minutes and refresh

---

## Step 4: Choose AWS Region

Bedrock is available in multiple regions. Choose based on your needs:

### Recommended: US East (N. Virginia) - `us-east-1`

**Pros:**
- ✅ Most models available
- ✅ Lowest latency for US-based users
- ✅ Best Bedrock support and newest features
- ✅ Highest rate limits

**When to use:** Default choice for MVP, US-based users

### Alternative: US West (Oregon) - `us-west-2`

**Pros:**
- ✅ Good for West Coast users
- ✅ All major models available
- ✅ Lower latency for California

**When to use:** West Coast-focused app

### Other Regions

Check model availability: [AWS Bedrock Regions Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html)

**Note:** Not all models are available in all regions. Stick to `us-east-1` for MVP unless you have specific requirements.

---

## Step 5: Configure Environment Variables

### 5.1 Add to `.env` File

Open `weave-api/.env` and add these variables:

```bash
# ============================================================================
# AWS BEDROCK CONFIGURATION (PRIMARY AI PROVIDER)
# ============================================================================
AWS_ACCESS_KEY_ID=AKIA...              # Replace with your access key ID
AWS_SECRET_ACCESS_KEY=wJalr...         # Replace with your secret access key
AWS_REGION=us-east-1                   # Or your chosen region

# ============================================================================
# FALLBACK AI PROVIDERS
# ============================================================================
OPENAI_API_KEY=sk-...                  # Already configured
ANTHROPIC_API_KEY=sk-ant-...           # Already configured
```

### 5.2 Verify `.env` Structure

Your complete `.env` should look like:

```bash
# Supabase
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# AWS Bedrock (PRIMARY AI)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalr...
AWS_REGION=us-east-1

# OpenAI (Fallback)
OPENAI_API_KEY=sk-...

# Anthropic (Fallback)
ANTHROPIC_API_KEY=sk-ant-...

# Optional
PORT=8000
ENVIRONMENT=development
```

### 5.3 Security Check

✅ **Verify `.env` is in `.gitignore`:**

```bash
# In project root
cat .gitignore | grep ".env"
```

**Expected output:** `.env` should appear in the list

If not:
```bash
echo ".env" >> .gitignore
```

---

## Step 6: Verify Bedrock Access (After Implementation)

After the AI service is implemented, test Bedrock connectivity:

### 6.1 Quick Python Test

```bash
cd weave-api

# Test boto3 client creation
uv run python -c "
import boto3
client = boto3.client('bedrock-runtime', region_name='us-east-1')
print('✅ Bedrock client created successfully')
print(f'✅ Using region: {client.meta.region_name}')
"
```

**Expected output:**
```
✅ Bedrock client created successfully
✅ Using region: us-east-1
```

### 6.2 Test Model Invocation (Simple)

```bash
cd weave-api

uv run python -c "
import boto3
import json

client = boto3.client('bedrock-runtime', region_name='us-east-1')

body = json.dumps({
    'anthropic_version': 'bedrock-2023-05-31',
    'max_tokens': 100,
    'messages': [{'role': 'user', 'content': 'Say hello in one word'}]
})

response = client.invoke_model(
    modelId='anthropic.claude-3-5-haiku-20241022-v1:0',
    body=body
)

response_body = json.loads(response['body'].read())
print('✅ Bedrock API call successful')
print(f'Response: {response_body[\"content\"][0][\"text\"]}')
"
```

**Expected output:**
```
✅ Bedrock API call successful
Response: Hello
```

### 6.3 Common Errors and Fixes

#### Error: `NoCredentialsError: Unable to locate credentials`

**Cause:** AWS credentials not configured or `.env` not loaded

**Fix:**
```bash
# Check .env file exists
ls -la weave-api/.env

# Verify credentials are set
cat weave-api/.env | grep AWS_ACCESS_KEY_ID
```

#### Error: `AccessDeniedException: User is not authorized to perform bedrock:InvokeModel`

**Cause:** IAM policy not attached or incorrect

**Fix:**
1. Go to IAM → Users → `weave-bedrock-api`
2. Check **Permissions** tab
3. Verify `AmazonBedrockFullAccess` or `WeaveBedrockInvokeOnly` is attached
4. If missing, click **Add permissions** → **Attach policies directly**

#### Error: `ValidationException: The provided model identifier is invalid`

**Cause:** Model access not granted or wrong model ID

**Fix:**
1. Go to Bedrock → Model access
2. Verify "Access granted" status for Claude models
3. Check model ID matches exactly: `anthropic.claude-3-5-haiku-20241022-v1:0`

#### Error: `ThrottlingException: Rate exceeded`

**Cause:** Too many requests in short time (unlikely in dev)

**Fix:**
- Wait 1 minute and retry
- Check AWS Bedrock quotas: Bedrock → Service Quotas
- Implement exponential backoff (already in AI service code)

---

## Step 7: Cost Management

### 7.1 Set Up Billing Alerts

**Recommended:** Set up AWS Budget alerts to prevent cost overruns

1. Go to **AWS Billing** (top right, click account name → Billing)
2. Click **Budgets** in left sidebar
3. Click **Create budget**
4. Choose **Cost budget**
5. **Budget amount:** $100/month (adjust based on your budget)
6. **Alert threshold:** 80% ($80)
7. **Email recipients:** Your email
8. Click **Create budget**

### 7.2 Monitor Bedrock Usage

**Cost Explorer:**
1. Go to **Cost Explorer** (Billing → Cost Explorer)
2. Filter by **Service:** Amazon Bedrock
3. View daily/monthly costs

**CloudWatch Metrics:**
1. Go to **CloudWatch** → **Metrics**
2. Select **Bedrock** namespace
3. View `InvocationCount`, `InputTokens`, `OutputTokens`

### 7.3 Expected Costs (MVP)

**Daily Budget:** $83.33/day ($2,500/month ÷ 30 days)

**Model Mix (estimated):**
- 90% calls: Claude 3.5 Haiku (~$0.25/$1.25 per MTok)
- 10% calls: Claude 3.7 Sonnet ($3.00/$15.00 per MTok)

**Example calculation (1000 routine calls/day):**
- 900 calls × 500 input tokens × $0.25/MTok = $0.1125
- 900 calls × 200 output tokens × $1.25/MTok = $0.225
- 100 calls × 500 input tokens × $3.00/MTok = $0.15
- 100 calls × 200 output tokens × $15.00/MTok = $0.30
- **Total: ~$0.79/day** (well under $83.33 budget)

**Cache hit rate impact:**
- 80% cache hit rate → 20% of above cost = **~$0.16/day**

---

## Step 8: Security Best Practices

### 8.1 Rotate Access Keys Regularly

**Recommended schedule:** Every 90 days

1. Create new access key (IAM → Users → `weave-bedrock-api` → Create access key)
2. Update `.env` with new keys
3. Test application
4. Deactivate old key (don't delete yet)
5. Wait 7 days
6. Delete old key

### 8.2 Use AWS Secrets Manager (Production)

For production, consider AWS Secrets Manager instead of `.env`:

```bash
# Store secret in AWS Secrets Manager
aws secretsmanager create-secret \
  --name weave/bedrock/credentials \
  --secret-string '{"access_key":"AKIA...","secret_key":"wJalr..."}'

# Retrieve in application
import boto3
secrets = boto3.client('secretsmanager')
response = secrets.get_secret_value(SecretId='weave/bedrock/credentials')
```

### 8.3 Limit Access by IP (Optional)

For extra security, restrict IAM user to specific IP ranges:

1. IAM → Users → `weave-bedrock-api` → Permissions → Add inline policy
2. Add condition:

```json
{
  "Condition": {
    "IpAddress": {
      "aws:SourceIp": ["YOUR_SERVER_IP/32"]
    }
  }
}
```

---

## Troubleshooting

### Issue: Model access request stuck "In progress"

**Solution:**
- Wait 15 minutes, refresh page
- If still pending after 24 hours, contact AWS Support
- Check AWS Service Health Dashboard for Bedrock incidents

### Issue: Credentials work in boto3 test but not in FastAPI app

**Solution:**
- Ensure `.env` file is loaded by FastAPI (check `app/core/config.py`)
- Verify environment variables with: `uv run python -c "import os; print(os.getenv('AWS_ACCESS_KEY_ID'))"`
- Check for typos in variable names

### Issue: Different model behavior than Anthropic API

**Solution:**
- Bedrock uses `anthropic_version: bedrock-2023-05-31` (different from direct API)
- Some parameters may have different defaults
- Refer to [Bedrock API Reference](https://docs.aws.amazon.com/bedrock/latest/APIReference/welcome.html)

---

## Next Steps

After completing this setup:

1. ✅ Verify credentials are saved in `.env`
2. ✅ Verify model access is granted (Bedrock → Model access)
3. ✅ Run verification tests (Step 6)
4. ✅ Proceed with AI service implementation (Story 0.6)
5. ✅ Test fallback chain (Bedrock → OpenAI → Anthropic → Deterministic)

---

## References

- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [AWS Bedrock Pricing](https://aws.amazon.com/bedrock/pricing/)
- [Claude Models on Bedrock](https://docs.anthropic.com/en/api/claude-on-amazon-bedrock)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Story 0.6 Specification](../../stories/0-6-ai-service-abstraction.md)

---

**Setup Status:** ⏳ Pending completion

**Last Verified:** 2025-12-19
**Next Review:** After Story 0.6 implementation
