# Claude Bedrock Environment Variables for WSL

## Quick Setup

Run the setup script in WSL to persist these environment variables:

```bash
# From WSL terminal
cd /mnt/c/Users/Jack\ Luo/Desktop/\(local\)\ github\ software/weavelight
chmod +x docs/dev/setup-wsl-env.sh
./docs/dev/setup-wsl-env.sh
source ~/.bashrc  # or ~/.zshrc if using zsh
```

## Manual Setup

If you prefer to add them manually, add these lines to your shell configuration file:

**For bash (default in WSL):**
```bash
# Edit ~/.bashrc
nano ~/.bashrc
```

**For zsh:**
```bash
# Edit ~/.zshrc
nano ~/.zshrc
```

Add these lines at the end of the file:

```bash
# Claude Bedrock Environment Variables
export CLAUDE_CODE_MAX_OUTPUT_TOKENS=32000
export MAX_THINKING_TOKENS=131072
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1
export ANTHROPIC_MODEL='global.anthropic.claude-sonnet-4-5-20250929-v1:0'
```

Then reload your shell configuration:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

## Verify Setup

Check that variables are set:
```bash
echo $CLAUDE_CODE_USE_BEDROCK
echo $AWS_REGION
echo $ANTHROPIC_MODEL
```

## AWS Credentials

**Note:** These environment variables set the AWS region, but AWS credentials (access keys) are typically stored separately:

1. **AWS CLI credentials** (recommended): `~/.aws/credentials`
2. **Environment variables**: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

To set up AWS credentials:
```bash
# Option 1: Use AWS CLI configure
aws configure

# Option 2: Add to shell config (less secure)
export AWS_ACCESS_KEY_ID='your-access-key'
export AWS_SECRET_ACCESS_KEY='your-secret-key'
```

## Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | `32000` | Maximum output tokens for Claude Code |
| `MAX_THINKING_TOKENS` | `131072` | Maximum thinking tokens |
| `CLAUDE_CODE_USE_BEDROCK` | `1` | Enable AWS Bedrock integration |
| `AWS_REGION` | `us-east-1` | AWS region for Bedrock API |
| `ANTHROPIC_MODEL` | `global.anthropic.claude-sonnet-4-5-20250929-v1:0` | Bedrock model identifier |
