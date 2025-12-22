#!/bin/bash
# Setup script to add Claude Bedrock environment variables to WSL shell configuration
# This ensures the variables persist across WSL sessions

# Detect shell configuration file
if [ -n "$ZSH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
    SHELL_NAME="zsh"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
    SHELL_NAME="bash"
else
    # Fallback to .profile if neither bash nor zsh
    SHELL_CONFIG="$HOME/.profile"
    SHELL_NAME="profile"
fi

echo "Detected shell: $SHELL_NAME"
echo "Config file: $SHELL_CONFIG"

# Check if config file exists, create if not
if [ ! -f "$SHELL_CONFIG" ]; then
    echo "Creating $SHELL_CONFIG..."
    touch "$SHELL_CONFIG"
fi

# Check if Claude Bedrock section already exists
if grep -q "# Claude Bedrock Environment Variables" "$SHELL_CONFIG"; then
    echo "⚠️  Claude Bedrock environment variables already exist in $SHELL_CONFIG"
    echo "   Remove the existing section and run this script again, or manually edit the file."
    exit 1
fi

# Append environment variables to shell config
echo "" >> "$SHELL_CONFIG"
echo "# Claude Bedrock Environment Variables" >> "$SHELL_CONFIG"
echo "# Added by setup-wsl-env.sh on $(date)" >> "$SHELL_CONFIG"
echo "export CLAUDE_CODE_MAX_OUTPUT_TOKENS=32000" >> "$SHELL_CONFIG"
echo "export MAX_THINKING_TOKENS=131072" >> "$SHELL_CONFIG"
echo "export CLAUDE_CODE_USE_BEDROCK=1" >> "$SHELL_CONFIG"
echo "export AWS_REGION=us-east-1" >> "$SHELL_CONFIG"
echo "export ANTHROPIC_MODEL='global.anthropic.claude-sonnet-4-5-20250929-v1:0'" >> "$SHELL_CONFIG"
echo "" >> "$SHELL_CONFIG"

echo "✅ Environment variables added to $SHELL_CONFIG"
echo ""
echo "To apply immediately, run:"
echo "  source $SHELL_CONFIG"
echo ""
echo "Or start a new WSL terminal session."

