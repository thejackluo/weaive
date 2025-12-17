#!/bin/bash
# Install Idea Sync Git Hooks

echo "Installing Idea Sync Git Hooks..."
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "Error: Not a git repository"
    echo "Run this script from the root of your git project"
    exit 1
fi

# Create hooks directory if needed
mkdir -p .git/hooks

# Install pre-commit hook
if [ -f "scripts/hooks/pre-commit.sh" ]; then
    cp scripts/hooks/pre-commit.sh .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
    echo "✓ Installed pre-commit hook"
else
    echo "✗ pre-commit.sh not found in scripts/hooks/"
    exit 1
fi

# Install post-commit hook
if [ -f "scripts/hooks/post-commit.sh" ]; then
    cp scripts/hooks/post-commit.sh .git/hooks/post-commit
    chmod +x .git/hooks/post-commit
    echo "✓ Installed post-commit hook"
else
    echo "✗ post-commit.sh not found in scripts/hooks/"
    exit 1
fi

# Create config file if it doesn't exist
CONFIG_FILE=".bmad/bmm/config/idea-sync-hooks.yaml"
if [ ! -f "$CONFIG_FILE" ]; then
    mkdir -p .bmad/bmm/config
    cat > "$CONFIG_FILE" << 'EOF'
# Idea Sync Hooks Configuration

enabled: true

hooks:
  pre-commit:
    enabled: true
    auto_trigger: false
    skip_on_wip: true

  post-commit:
    enabled: true
    notification_style: "summary"  # summary | detailed | silent

filters:
  ignore_files:
    - "docs/idea/scratch/*"
    - "docs/idea/archived/*"
  require_phasing: false  # Set to true to require phasing tags
  min_changes: 1

notifications:
  channels:
    - type: "terminal"
      enabled: true
EOF
    echo "✓ Created default config file: $CONFIG_FILE"
fi

# Create logs directory
mkdir -p .bmad/bmm/logs
echo "✓ Created logs directory"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Installation Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Git hooks are now active:"
echo "  • Pre-commit: Prompts for sync when docs/idea/ changes"
echo "  • Post-commit: Displays summary after commit"
echo ""
echo "To configure hooks, edit:"
echo "  $CONFIG_FILE"
echo ""
echo "To test hooks:"
echo "  1. Make a change to docs/idea/ux.md"
echo "  2. Run: git add docs/idea/ux.md"
echo "  3. Run: git commit -m 'test'"
echo ""
echo "To uninstall hooks:"
echo "  rm .git/hooks/pre-commit .git/hooks/post-commit"
echo ""
