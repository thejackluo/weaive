# Idea-Sync Workflow Hooks System Design

**Purpose:** Simple, exploratory Claude hooks to remind when docs/idea/ needs syncing
**Approach:** Claude hooks (not git hooks) - minimal, non-intrusive
**Status:** Exploratory implementation
**Last Updated:** 2025-12-17

---

## Overview

A lightweight Claude hook that checks for uncommitted changes in `docs/idea/` and displays a friendly reminder to run the sync workflow. This is an exploratory approach focused on simplicity rather than full automation.

### Design Goals

1. **Simple & Lightweight** - Single bash script, minimal complexity
2. **Non-Intrusive** - Reminder shown once per session only
3. **Easy to Disable** - Simple opt-out mechanism
4. **No Dependencies** - Uses only git and bash
5. **Exploratory** - Proof-of-concept, not production-grade

---

## Implementation: Claude Hook

### Hook File: `.claude/hooks/idea-sync-check.sh`

**Location:** `.claude/hooks/idea-sync-check.sh`
**Type:** Claude session hook
**Trigger:** Can be called manually or integrated into Claude workflows

**What it does:**
1. Checks if `docs/idea/` has uncommitted changes (git status)
2. Shows a friendly reminder with file count
3. Provides the sync workflow command
4. Only shows once per session (using PID tracking)
5. Can be disabled by user preference

**Example output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Idea Sync Reminder

   You have 3 uncommitted change(s) in docs/idea/

   Consider running the sync workflow to propagate changes to
   official documentation:

   Command:
   $ claude workflows sync-ideas-to-docs

   💡 Tips:
   • Add phasing tags: [MVP], [v1.1], [v1.2]
   • Workflow is resumable if interrupted
   • Review mode available at each step

   To disable these reminders:
   echo "disabled" > .claude/idea-sync-reminder.txt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### State Files

**Reminder State:** `.claude/idea-sync-reminder.txt`
- Stores current session PID
- Used to prevent showing reminder multiple times per session
- Write "disabled" to this file to opt out

**Disable Flag:** `.claude/idea-sync-reminder-disabled.flag`
- Create this file to permanently disable reminders
- Empty file, just needs to exist

---

## Usage

### Manual Invocation

```bash
# Run the hook manually to check status
./.claude/hooks/idea-sync-check.sh
```

### Disable Reminders

```bash
# Temporary (current session only)
echo "disabled" > .claude/idea-sync-reminder.txt

# Permanent
touch .claude/idea-sync-reminder-disabled.flag

# Or
echo "disabled" > .claude/idea-sync-reminder.txt
```

### Re-enable Reminders

```bash
# Remove disable files
rm .claude/idea-sync-reminder-disabled.flag
rm .claude/idea-sync-reminder.txt
```

---

## How It Works

### Detection Logic

```bash
# 1. Check if disabled
if [[ -f .claude/idea-sync-reminder-disabled.flag ]]; then
    exit 0
fi

# 2. Check for uncommitted changes
git status --porcelain -- docs/idea/

# 3. Check if already shown this session
current_session="$$"  # Current process ID
last_session=$(cat .claude/idea-sync-reminder.txt 2>/dev/null)

if [[ "$last_session" == "$current_session" ]]; then
    exit 0  # Already shown this session
fi

# 4. Show reminder and record session
echo "$$" > .claude/idea-sync-reminder.txt
```

### Session-Based Rate Limiting

The hook uses the current process ID (`$$`) to track sessions:
- First time running in a session: Shows reminder
- Subsequent runs in same session: Silent
- New session (new PID): Shows reminder again

This prevents spam while still being helpful.

---

## Integration Possibilities (Future)

These are **optional future extensions** if the simple approach proves useful:

### Option 1: Claude Personality Hook
Integrate into Claude personality to auto-check on session start:
```bash
# In .claude/personalities/default.md
# Add to session initialization:
source .claude/hooks/idea-sync-check.sh
```

### Option 2: Workflow Integration
Call from sync workflow to remind about uncommitted changes:
```yaml
# In workflow.md or step file
## Pre-Workflow Check
Run: .claude/hooks/idea-sync-check.sh
```

### Option 3: Git Hook (If Needed)
If git integration becomes necessary, add simple pre-commit:
```bash
# .git/hooks/pre-commit
#!/bin/bash
idea_changes=$(git diff --cached --name-only | grep "^docs/idea/")
if [ ! -z "$idea_changes" ]; then
    echo "📋 docs/idea/ changes detected"
    echo "Consider running: claude workflows sync-ideas-to-docs"
fi
exit 0  # Always allow commit
```

---

## Comparison: Claude Hooks vs Git Hooks

| Feature | Claude Hook | Git Hook |
|---------|------------|----------|
| **Complexity** | Very simple | More complex |
| **Trigger** | Manual/session | Automatic (git commit) |
| **Intrusiveness** | Minimal | Can slow commits |
| **Setup** | Already done | Needs installation |
| **Bypassable** | Always | With --no-verify |
| **Best For** | Exploratory, reminders | Enforcement, automation |

**Current choice:** Claude hooks (simple, exploratory)

---

## Configuration

No configuration file needed for the basic hook. It has sensible defaults:
- Session-based rate limiting (once per session)
- Checks `docs/idea/` directory
- Simple opt-out mechanism

If you need more control, you can modify the hook script directly:
```bash
# Edit the hook
nano .claude/hooks/idea-sync-check.sh

# Example changes:
# - Change watched directory
# - Add ignore patterns
# - Customize reminder message
# - Change rate limiting logic
```

---

## Testing

### Test the Hook

```bash
# 1. Make a change in docs/idea/
echo "test change" >> docs/idea/ux.md

# 2. Run the hook
./.claude/hooks/idea-sync-check.sh

# Expected: Shows reminder

# 3. Run again immediately
./.claude/hooks/idea-sync-check.sh

# Expected: Silent (already shown this session)

# 4. Clean up
git checkout docs/idea/ux.md
```

### Test Disable Mechanism

```bash
# 1. Disable reminders
echo "disabled" > .claude/idea-sync-reminder.txt

# 2. Make a change
echo "test" >> docs/idea/ux.md

# 3. Run hook
./.claude/hooks/idea-sync-check.sh

# Expected: Silent (disabled)

# 4. Re-enable
rm .claude/idea-sync-reminder.txt

# 5. Run hook again
./.claude/hooks/idea-sync-check.sh

# Expected: Shows reminder
```

---

## File Structure

```
.claude/
├── hooks/
│   └── idea-sync-check.sh              # The hook script
├── idea-sync-reminder.txt              # Session tracking (auto-created)
└── idea-sync-reminder-disabled.flag    # Opt-out flag (user-created)

docs/
└── dev/
    ├── idea-sync-hooks-design.md       # This document
    └── idea-sync-workflow-guide.md     # Workflow usage guide
```

---

## Limitations & Trade-offs

### What This Approach Does Well
✅ Simple and easy to understand
✅ Non-intrusive (user control)
✅ No installation or setup needed
✅ Easy to disable/remove
✅ Good for solo developers

### What This Approach Doesn't Do
❌ Automatic triggering (must run manually)
❌ Real-time file watching
❌ Team notifications
❌ CI/CD integration
❌ Scheduled checks

**Philosophy:** Start simple, add complexity only if needed.

---

## When to Upgrade

Consider more complex automation if:
- You frequently forget to sync
- Multiple team members need coordination
- You want CI/CD validation
- Manual checks become annoying

Potential upgrades:
1. **Git hooks** - Automatic on commit
2. **File watcher** - Real-time detection (Node.js chokidar)
3. **Scheduled checks** - Cron job for weekly reminders
4. **CI/CD** - GitHub Actions for team visibility

But for now, the simple Claude hook is sufficient for exploratory use.

---

## Feedback & Iteration

This is an **exploratory implementation**. Feedback welcome:

**Questions to consider:**
- Is the reminder helpful or annoying?
- Should it trigger more/less frequently?
- Is the opt-out mechanism clear enough?
- Do we need git hook integration?

**Next steps if positive:**
- Monitor usage and adjust rate limiting
- Consider git pre-commit integration if needed
- Add more context to reminder (which files changed)
- Maybe integrate into Claude personality hooks

**Next steps if not useful:**
- Document lessons learned
- Remove hook
- Keep workflow manual-only

---

*This is an exploratory design focused on simplicity. Implementation complete but subject to change based on usage feedback.*
