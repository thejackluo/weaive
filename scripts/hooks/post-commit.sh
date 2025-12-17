#!/bin/bash
# Idea Sync Post-Commit Hook
# Generates summary report after commit with docs/idea/ changes

# Colors
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Config file
CONFIG_FILE=".bmad/bmm/config/idea-sync-hooks.yaml"

# Check if hook is enabled
if [ -f "$CONFIG_FILE" ]; then
    HOOK_ENABLED=$(grep -A 2 "post-commit:" "$CONFIG_FILE" | grep "enabled:" | awk '{print $2}')
    if [ "$HOOK_ENABLED" = "false" ]; then
        exit 0
    fi
fi

# Check if last commit touched docs/idea/
idea_changes=$(git diff-tree --no-commit-id --name-only -r HEAD | grep "^docs/idea/")

if [ -z "$idea_changes" ]; then
    # No idea/ changes in this commit
    exit 0
fi

# Idea changes detected in commit
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Commit Successful${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 docs/idea/ Modified in This Commit${NC}"
echo ""
echo "Files changed:"
echo "$idea_changes" | sed "s/^/  ${BLUE}•${NC} /"
echo ""

# Check for phasing tags in changed files
has_phasing=false
for file in $idea_changes; do
    if [ -f "$file" ]; then
        if grep -qE '\[MVP\]|\[v1\.1\]|\[v1\.2\]' "$file"; then
            has_phasing=true
            break
        fi
    fi
done

if [ "$has_phasing" = false ]; then
    echo -e "${YELLOW}⚠️  Reminder: Add phasing tags ([MVP], [v1.1], [v1.2]) before syncing${NC}"
    echo ""
fi

# Check when last sync occurred
last_sync_file=".bmad/bmm/logs/last-idea-sync.txt"
if [ -f "$last_sync_file" ]; then
    last_sync=$(cat "$last_sync_file")
    days_since=$(( ($(date +%s) - $(date -d "$last_sync" +%s)) / 86400 ))

    if [ $days_since -gt 7 ]; then
        echo -e "${YELLOW}⚠️  Last sync was $days_since days ago${NC}"
        echo "   Recommendation: Sync before next sprint planning"
        echo ""
    fi
fi

# Display recommendation
echo -e "${BLUE}💡 Next Steps:${NC}"
echo "   1. Review changes in docs/idea/"
echo "   2. Add/verify phasing tags ([MVP], [v1.1], [v1.2])"
echo "   3. Run sync workflow before next sprint planning"
echo ""
echo -e "${BLUE}Command:${NC}"
echo "   $ claude workflows sync-ideas-to-docs"
echo ""

# Log pending sync
mkdir -p .bmad/bmm/logs
commit_hash=$(git rev-parse --short HEAD)
echo "$(date -Iseconds)|$commit_hash|$(echo "$idea_changes" | tr '\n' ',')" >> .bmad/bmm/logs/pending-idea-syncs.txt

# Check notification preference
NOTIFICATION_STYLE="summary"
if [ -f "$CONFIG_FILE" ]; then
    NOTIFICATION_STYLE=$(grep -A 2 "post-commit:" "$CONFIG_FILE" | grep "notification_style:" | awk '{print $2}' | tr -d '"')
fi

if [ "$NOTIFICATION_STYLE" = "detailed" ]; then
    # Show diff summary
    echo -e "${BLUE}Change Summary:${NC}"
    for file in $idea_changes; do
        lines_changed=$(git diff HEAD~1 HEAD -- "$file" | grep -c "^[+-]" || echo 0)
        echo "  $file: $lines_changed lines changed"
    done
    echo ""
fi

exit 0
