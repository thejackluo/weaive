#!/bin/bash
# Idea Sync Pre-Commit Hook
# Detects changes in docs/idea/ and prompts for sync workflow

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config file
CONFIG_FILE=".bmad/bmm/config/idea-sync-hooks.yaml"

# Check if hook is enabled
if [ -f "$CONFIG_FILE" ]; then
    HOOK_ENABLED=$(grep -A 2 "pre-commit:" "$CONFIG_FILE" | grep "enabled:" | awk '{print $2}')
    if [ "$HOOK_ENABLED" = "false" ]; then
        exit 0
    fi
fi

# Check for changes in docs/idea/
idea_changes=$(git diff --cached --name-only | grep "^docs/idea/")

if [ -z "$idea_changes" ]; then
    # No idea/ changes, proceed normally
    exit 0
fi

# Idea changes detected
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⚠️  Changes Detected in docs/idea/${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Files being committed:"
echo "$idea_changes" | sed "s/^/  ${BLUE}•${NC} /"
echo ""

# Check if commit message contains [WIP] or [SKIP-SYNC]
if [ -f ".git/COMMIT_EDITMSG" ]; then
    commit_msg=$(cat ".git/COMMIT_EDITMSG")
    if [[ "$commit_msg" =~ \[WIP\]|\[SKIP-SYNC\] ]]; then
        echo -e "${GREEN}✓${NC} Commit message contains [WIP] or [SKIP-SYNC] - skipping sync prompt"
        exit 0
    fi
fi

# Prompt user
echo "These changes may need to be synced to official documentation."
echo ""
echo -e "${BLUE}Options:${NC}"
echo "  y  - Run sync workflow now (recommended)"
echo "  n  - Skip sync this time (will be reminded later)"
echo "  w  - Add [WIP] tag and skip (work in progress)"
echo "  s  - Skip sync prompts permanently (not recommended)"
echo ""
echo -n "Your choice [y/n/w/s]: "

# Read user input (with timeout for CI/CD environments)
if read -t 30 -r response; then
    case "$response" in
        y|Y|yes)
            echo ""
            echo -e "${GREEN}Triggering sync workflow...${NC}"
            echo ""

            # Attempt to invoke workflow
            # Method 1: If Claude CLI is available
            if command -v claude &> /dev/null; then
                claude workflows sync-ideas-to-docs
                sync_exit=$?
            # Method 2: Direct invocation via BMAD
            elif [ -f ".bmad/bmm/workflows/sync-ideas-to-docs-restructured/workflow.md" ]; then
                echo "Claude CLI not found. Workflow must be run manually:"
                echo ""
                echo "  cd $(pwd)"
                echo "  claude workflows sync-ideas-to-docs"
                echo ""
                echo "Commit will proceed. Remember to run sync afterward."
                sync_exit=1
            else
                echo -e "${RED}✗ Sync workflow not found${NC}"
                sync_exit=1
            fi

            if [ $sync_exit -ne 0 ]; then
                echo ""
                echo -e "${YELLOW}⚠️  Sync workflow did not complete successfully${NC}"
                echo "Commit will proceed. Run sync manually later."
            fi

            exit 0
            ;;

        n|N|no)
            echo -e "${YELLOW}⚠️  Sync skipped${NC}"
            echo ""
            echo "Reminder: Run sync before next sprint planning:"
            echo "  $ claude workflows sync-ideas-to-docs"
            echo ""

            # Log pending sync
            mkdir -p .bmad/bmm/logs
            echo "$(date -Iseconds)|$(git rev-parse --short HEAD)|$idea_changes" >> .bmad/bmm/logs/pending-idea-syncs.txt

            exit 0
            ;;

        w|W|wip)
            echo -e "${BLUE}Adding [WIP] tag to commit message${NC}"

            # Prepend [WIP] to commit message if not already present
            if [ -f ".git/COMMIT_EDITMSG" ]; then
                if ! grep -q "\[WIP\]" ".git/COMMIT_EDITMSG"; then
                    sed -i '1s/^/[WIP] /' ".git/COMMIT_EDITMSG"
                fi
            fi

            exit 0
            ;;

        s|S|skip-always)
            echo -e "${RED}⚠️  Disabling sync prompts permanently${NC}"
            echo ""
            echo "To re-enable later, run:"
            echo "  $ claude hooks enable idea-sync"
            echo ""

            # Disable hook in config
            if [ -f "$CONFIG_FILE" ]; then
                sed -i 's/enabled: true/enabled: false/' "$CONFIG_FILE"
            else
                echo "IDEA_SYNC_SKIP=true" > .git/hooks/pre-commit.config
            fi

            exit 0
            ;;

        *)
            echo -e "${YELLOW}Invalid choice. Proceeding with commit (sync skipped).${NC}"
            exit 0
            ;;
    esac
else
    # Timeout or non-interactive environment (CI/CD)
    echo ""
    echo -e "${YELLOW}⚠️  Non-interactive environment detected. Commit proceeding.${NC}"
    echo "Remember to run sync workflow manually."
    exit 0
fi
