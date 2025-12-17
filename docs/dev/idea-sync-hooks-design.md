# Idea-Sync Workflow Hooks System Design

**Purpose:** Automatic triggering of sync workflow when docs/idea/ changes detected
**Status:** Design Proposal
**Last Updated:** 2025-12-17

---

## Overview

A hooks system that automatically detects changes in `docs/idea/` and triggers the sync-ideas-to-docs workflow, eliminating manual invocation while maintaining user control.

### Design Goals

1. **Automatic Detection** - Detect file changes without manual checks
2. **Smart Triggering** - Only trigger when meaningful changes occur
3. **User Control** - User approves before execution, can defer/skip
4. **Non-Intrusive** - Doesn't block normal git workflow
5. **Resumable** - Handles interrupted syncs gracefully
6. **Configurable** - Easy to enable/disable, adjust thresholds

---

## Hook Types & Trigger Points

### 1. Git Pre-Commit Hook (Primary)

**Trigger:** Before `git commit` completes
**Purpose:** Detect uncommitted idea/ changes and remind user to sync

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check if docs/idea/ has changes
idea_changes=$(git diff --cached --name-only | grep "^docs/idea/")

if [ ! -z "$idea_changes" ]; then
    echo "⚠️  Changes detected in docs/idea/"
    echo ""
    echo "Files changed:"
    echo "$idea_changes" | sed 's/^/  - /'
    echo ""
    echo "Run idea-sync workflow? [y/n/skip-once/always-skip]"
    read -r response

    case $response in
        y|Y|yes)
            echo "Triggering sync workflow..."
            # Invoke workflow (implementation depends on integration)
            claude workflows sync-ideas-to-docs
            ;;
        skip-once)
            echo "Skipping this time. Will ask again next commit."
            ;;
        always-skip)
            echo "IDEA_SYNC_SKIP=true" >> .git/hooks/pre-commit.config
            echo "Sync workflow disabled. Re-enable with: claude hooks enable idea-sync"
            ;;
        *)
            echo "Commit proceeding without sync."
            ;;
    esac
fi

# Allow commit to proceed
exit 0
```

**Pros:**
- ✅ Catches changes before they're committed
- ✅ Natural integration point in git workflow
- ✅ User already in "commit mode" (mindset alignment)

**Cons:**
- ⚠️ May slow down commits
- ⚠️ Can be bypassed with `git commit --no-verify`

---

### 2. Post-Commit Hook (Secondary)

**Trigger:** After `git commit` completes
**Purpose:** Generate sync report for review, schedule sync

```bash
#!/bin/bash
# .git/hooks/post-commit

# Check if last commit touched docs/idea/
idea_changes=$(git diff-tree --no-commit-id --name-only -r HEAD | grep "^docs/idea/")

if [ ! -z "$idea_changes" ]; then
    echo ""
    echo "✓ Commit successful"
    echo ""
    echo "📋 docs/idea/ was modified in this commit"
    echo "Files changed:"
    echo "$idea_changes" | sed 's/^/  - /'
    echo ""
    echo "Recommendation: Run sync workflow before next sprint planning"
    echo "Command: claude workflows sync-ideas-to-docs"
    echo ""

    # Create notification file for later
    echo "$(date -Iseconds)|$idea_changes" >> .bmad/bmm/logs/pending-idea-syncs.txt
fi
```

**Pros:**
- ✅ Non-blocking (commit already completed)
- ✅ Gentle reminder without forcing action
- ✅ Creates audit trail of pending syncs

**Cons:**
- ⚠️ User might ignore reminders
- ⚠️ Syncs pile up if not acted upon

---

### 3. File Watcher Hook (Advanced)

**Trigger:** Real-time file system changes
**Purpose:** Continuous monitoring, instant detection

```javascript
// scripts/idea-watcher.js
const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');

const WATCH_PATH = path.join(__dirname, '../docs/idea');
const DEBOUNCE_MS = 5000; // 5 seconds

let pendingChanges = [];
let debounceTimer = null;

// Watch docs/idea/ for changes
const watcher = chokidar.watch(WATCH_PATH, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true
});

watcher
    .on('change', (filepath) => {
        console.log(`File changed: ${filepath}`);
        pendingChanges.push({
            file: filepath,
            timestamp: new Date().toISOString(),
            type: 'modified'
        });

        // Debounce: wait for edits to settle
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            notifyUser(pendingChanges);
            pendingChanges = [];
        }, DEBOUNCE_MS);
    })
    .on('add', (filepath) => {
        console.log(`File added: ${filepath}`);
        pendingChanges.push({
            file: filepath,
            timestamp: new Date().toISOString(),
            type: 'added'
        });
    });

function notifyUser(changes) {
    if (changes.length === 0) return;

    console.log('\n⚠️  Idea Sync Needed\n');
    console.log(`${changes.length} file(s) changed in docs/idea/:\n`);
    changes.forEach(c => {
        console.log(`  - ${c.file} (${c.type})`);
    });
    console.log('\nRun sync workflow: claude workflows sync-ideas-to-docs\n');

    // Optional: Desktop notification
    exec('notify-send "Idea Sync Needed" "docs/idea/ has changes"');
}

console.log(`Watching ${WATCH_PATH} for changes...`);
```

**Usage:**
```bash
# Start watcher in background
npm run watch:idea

# Or with package.json script:
"scripts": {
  "watch:idea": "node scripts/idea-watcher.js"
}
```

**Pros:**
- ✅ Real-time detection (no commit needed)
- ✅ Catches work-in-progress changes
- ✅ Desktop notifications possible

**Cons:**
- ⚠️ Requires background process
- ⚠️ May generate too many notifications
- ⚠️ Uses system resources continuously

---

### 4. Cron/Scheduled Hook (Weekly)

**Trigger:** Every Monday 9:00 AM
**Purpose:** Scheduled sync checks regardless of activity

```bash
# crontab entry (Unix/Linux/Mac)
0 9 * * 1 cd /path/to/weavelight && ./scripts/check-idea-sync.sh

# check-idea-sync.sh
#!/bin/bash

# Check for pending syncs
pending_file=".bmad/bmm/logs/pending-idea-syncs.txt"

if [ -f "$pending_file" ] && [ -s "$pending_file" ]; then
    echo "📅 Weekly Sync Check - $(date)"
    echo ""
    echo "Pending idea/ changes detected:"
    cat "$pending_file" | tail -10
    echo ""
    echo "Run sync workflow? [y/n]"
    read -r response

    if [[ $response =~ ^[Yy] ]]; then
        claude workflows sync-ideas-to-docs

        # Clear pending file after successful sync
        if [ $? -eq 0 ]; then
            > "$pending_file"
        fi
    else
        echo "Sync deferred. Will check again next Monday."
    fi
else
    echo "✓ No pending idea/ syncs. All up to date!"
fi
```

**Windows Task Scheduler Alternative:**
```xml
<!-- task-idea-sync-check.xml -->
<Task version="1.2">
  <Triggers>
    <CalendarTrigger>
      <DaysOfWeek>
        <Monday />
      </DaysOfWeek>
      <StartBoundary>2025-01-01T09:00:00</StartBoundary>
    </CalendarTrigger>
  </Triggers>
  <Actions>
    <Exec>
      <Command>powershell.exe</Command>
      <Arguments>-File "C:\path\to\weavelight\scripts\check-idea-sync.ps1"</Arguments>
    </Exec>
  </Actions>
</Task>
```

**Pros:**
- ✅ Consistent reminder cadence
- ✅ Works even if git hooks disabled
- ✅ Catches accumulated changes

**Cons:**
- ⚠️ Fixed schedule (not event-driven)
- ⚠️ May trigger when no changes exist

---

## Hook Configuration System

### Config File: `.bmad/bmm/config/idea-sync-hooks.yaml`

```yaml
# Idea Sync Hooks Configuration

enabled: true  # Master switch

# Hook-specific settings
hooks:
  pre-commit:
    enabled: true
    auto_trigger: false  # If true, runs sync without asking
    skip_on_wip: true    # Skip if commit message contains [WIP]

  post-commit:
    enabled: true
    notification_style: "summary"  # summary | detailed | silent

  file-watcher:
    enabled: false  # Disabled by default (resource-intensive)
    debounce_ms: 5000
    desktop_notifications: true

  scheduled:
    enabled: true
    cron: "0 9 * * 1"  # Every Monday 9 AM
    check_pending_only: true

# Filtering
filters:
  ignore_files:
    - "docs/idea/scratch/*"
    - "docs/idea/archived/*"

  require_phasing: true  # Only trigger if changes have phasing tags

  min_changes: 1  # Minimum file changes to trigger

# Notifications
notifications:
  channels:
    - type: "terminal"
      enabled: true
    - type: "desktop"
      enabled: false
    - type: "slack"
      enabled: false
      webhook_url: ""
    - type: "github-issue"
      enabled: false
      repo: "owner/repo"

# Workflow invocation
workflow:
  command: "claude workflows sync-ideas-to-docs"
  auto_approve_steps: []  # Steps to auto-approve (empty = none)
  max_retries: 3
```

---

## Hook Manager CLI

### Commands

```bash
# Enable/disable hooks
claude hooks enable idea-sync
claude hooks disable idea-sync

# Check hook status
claude hooks status

# Test hooks
claude hooks test pre-commit
claude hooks test scheduled

# View pending syncs
claude hooks pending

# Configure specific hook
claude hooks config pre-commit --auto-trigger=false
claude hooks config file-watcher --enable

# Install hooks
claude hooks install
claude hooks uninstall
```

### Implementation: `scripts/hook-manager.sh`

```bash
#!/bin/bash
# Hook Manager for Idea Sync

CONFIG_FILE=".bmad/bmm/config/idea-sync-hooks.yaml"

function status() {
    echo "Idea Sync Hooks Status:"
    echo ""
    echo "Master Switch: $(yq '.enabled' $CONFIG_FILE)"
    echo ""
    echo "Pre-Commit Hook: $(yq '.hooks.pre-commit.enabled' $CONFIG_FILE)"
    echo "Post-Commit Hook: $(yq '.hooks.post-commit.enabled' $CONFIG_FILE)"
    echo "File Watcher: $(yq '.hooks.file-watcher.enabled' $CONFIG_FILE)"
    echo "Scheduled Check: $(yq '.hooks.scheduled.enabled' $CONFIG_FILE)"
}

function enable_hook() {
    hook_type=$1
    yq -i ".hooks.$hook_type.enabled = true" $CONFIG_FILE
    echo "✓ $hook_type hook enabled"
}

function disable_hook() {
    hook_type=$1
    yq -i ".hooks.$hook_type.enabled = false" $CONFIG_FILE
    echo "✓ $hook_type hook disabled"
}

function install() {
    echo "Installing git hooks..."

    # Copy pre-commit hook
    if [ "$(yq '.hooks.pre-commit.enabled' $CONFIG_FILE)" = "true" ]; then
        cp scripts/hooks/pre-commit.sh .git/hooks/pre-commit
        chmod +x .git/hooks/pre-commit
        echo "✓ Installed pre-commit hook"
    fi

    # Copy post-commit hook
    if [ "$(yq '.hooks.post-commit.enabled' $CONFIG_FILE)" = "true" ]; then
        cp scripts/hooks/post-commit.sh .git/hooks/post-commit
        chmod +x .git/hooks/post-commit
        echo "✓ Installed post-commit hook"
    fi

    # Start file watcher if enabled
    if [ "$(yq '.hooks.file-watcher.enabled' $CONFIG_FILE)" = "true" ]; then
        npm run watch:idea &
        echo "✓ Started file watcher (PID: $!)"
    fi

    # Setup cron job if enabled
    if [ "$(yq '.hooks.scheduled.enabled' $CONFIG_FILE)" = "true" ]; then
        cron_schedule=$(yq '.hooks.scheduled.cron' $CONFIG_FILE)
        (crontab -l 2>/dev/null; echo "$cron_schedule cd $(pwd) && ./scripts/check-idea-sync.sh") | crontab -
        echo "✓ Scheduled weekly sync check"
    fi
}

# Route commands
case "$1" in
    status) status ;;
    enable) enable_hook "$2" ;;
    disable) disable_hook "$2" ;;
    install) install ;;
    *) echo "Usage: hook-manager.sh {status|enable|disable|install} [hook-type]" ;;
esac
```

---

## Recommended Setup

### For Solo Developers

**Configuration:**
```yaml
hooks:
  pre-commit:
    enabled: true
    auto_trigger: false  # Always ask
  post-commit:
    enabled: true
  file-watcher:
    enabled: false  # Too noisy
  scheduled:
    enabled: true  # Weekly reminder
```

**Rationale:** Balance between automation and control

---

### For Teams

**Configuration:**
```yaml
hooks:
  pre-commit:
    enabled: true
    auto_trigger: false
    skip_on_wip: true  # Don't block WIP commits
  post-commit:
    enabled: true
  file-watcher:
    enabled: false
  scheduled:
    enabled: true

notifications:
  channels:
    - type: "slack"
      enabled: true
      webhook_url: "https://hooks.slack.com/..."
```

**Rationale:** Team-wide visibility, async notifications

---

### For CI/CD Integration

**Configuration:**
```yaml
hooks:
  pre-commit:
    enabled: false  # CI handles it
  post-commit:
    enabled: false
  file-watcher:
    enabled: false
  scheduled:
    enabled: true

notifications:
  channels:
    - type: "github-issue"
      enabled: true
      repo: "owner/repo"
      labels: ["docs-sync", "automated"]
```

**GitHub Actions Workflow:**
```yaml
# .github/workflows/idea-sync-check.yml
name: Idea Sync Check

on:
  push:
    paths:
      - 'docs/idea/**'
  schedule:
    - cron: '0 9 * * 1'  # Every Monday 9 AM

jobs:
  check-sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check for idea/ changes
        run: |
          git fetch origin main
          idea_changes=$(git diff origin/main...HEAD --name-only | grep "^docs/idea/")
          if [ ! -z "$idea_changes" ]; then
            echo "changes_detected=true" >> $GITHUB_OUTPUT
            echo "$idea_changes" > idea-changes.txt
          fi
        id: check

      - name: Create sync reminder issue
        if: steps.check.outputs.changes_detected == 'true'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Idea Sync Needed',
              body: 'Changes detected in docs/idea/. Run sync workflow before next sprint.',
              labels: ['docs-sync', 'automated']
            })
```

---

## Advanced: Smart Triggering Logic

### Intelligent Change Detection

```javascript
// scripts/smart-trigger.js
const fs = require('fs');
const yaml = require('js-yaml');

function shouldTriggerSync(changedFiles) {
    // Load phasing rules
    const phasingRules = yaml.load(fs.readFileSync('.bmad/bmm/config/idea-sync-hooks.yaml'));

    // Check if changes have phasing tags
    if (phasingRules.filters.require_phasing) {
        const hasPhasing = changedFiles.some(file => {
            const content = fs.readFileSync(file, 'utf8');
            return /\[MVP\]|\[v1\.1\]|\[v1\.2\]/.test(content);
        });

        if (!hasPhasing) {
            console.log("⚠️  No phasing tags detected. Add tags before syncing.");
            return false;
        }
    }

    // Check minimum changes threshold
    if (changedFiles.length < phasingRules.filters.min_changes) {
        console.log(`Only ${changedFiles.length} file(s) changed. Threshold: ${phasingRules.filters.min_changes}`);
        return false;
    }

    // Check ignore patterns
    const ignorePatterns = phasingRules.filters.ignore_files;
    const filteredFiles = changedFiles.filter(file => {
        return !ignorePatterns.some(pattern => {
            const regex = new RegExp(pattern.replace('*', '.*'));
            return regex.test(file);
        });
    });

    if (filteredFiles.length === 0) {
        console.log("All changes match ignore patterns. Skipping sync.");
        return false;
    }

    return true;
}

module.exports = { shouldTriggerSync };
```

---

## Testing Hooks

### Test Suite

```bash
# test/hooks-test.sh

function test_pre_commit_detection() {
    echo "Test: Pre-commit hook detects idea/ changes"

    # Make test change
    echo "test change" >> docs/idea/ux.md
    git add docs/idea/ux.md

    # Trigger pre-commit (should ask for sync)
    git commit -m "test commit" --dry-run

    # Restore
    git checkout docs/idea/ux.md
}

function test_smart_trigger_phasing() {
    echo "Test: Smart trigger requires phasing tags"

    # Change without phasing tag
    echo "No phasing here" >> docs/idea/ux.md
    result=$(node scripts/smart-trigger.js docs/idea/ux.md)

    if [[ $result == *"No phasing tags"* ]]; then
        echo "✓ Correctly rejected untagged change"
    else
        echo "✗ Failed to reject untagged change"
    fi

    # Restore
    git checkout docs/idea/ux.md
}

# Run all tests
test_pre_commit_detection
test_smart_trigger_phasing
```

---

## Migration Path

### Phase 1: Manual (Current)
- User manually runs workflow when they remember
- No automation

### Phase 2: Git Hooks (Recommended Next)
- Install pre-commit and post-commit hooks
- Gentle reminders, user control

### Phase 3: File Watcher (Optional)
- Real-time detection for heavy design iteration
- Desktop notifications

### Phase 4: CI/CD Integration (Team Scale)
- Automated issue creation
- Team-wide visibility
- Scheduled checks

---

*This is a design proposal. Implementation pending based on team preferences and workflow integration needs.*
