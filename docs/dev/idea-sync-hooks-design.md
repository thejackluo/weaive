# Idea-Sync Workflow Claude Hook

**Purpose:** Claude Code session-start hook that reminds about uncommitted docs/idea/ changes
**Type:** Claude Code Hook (session-start)
**Status:** Implemented and functional
**Last Updated:** 2025-12-17

---

## Overview

A Claude Code hook that automatically checks for uncommitted changes in `docs/idea/` at session start and injects reminder protocol into the conversation context. This makes Claude aware of pending sync needs without manual intervention.

### How Claude Hooks Work

Claude Code supports hooks that run at specific trigger points (like `session-start`). These hooks:
1. Run automatically when the trigger event occurs
2. Output protocol instructions to stdout
3. Claude Code injects this output into the conversation context
4. Claude then follows the protocol instructions throughout the session

This is **much simpler** than git hooks or file watchers - it's just contextual awareness.

---

## Implementation

### Hook File: `.claude/hooks/session-start-idea-sync.sh`

**Full path:** `.claude/hooks/session-start-idea-sync.sh`
**Trigger:** Runs automatically at the start of each Claude Code session
**Output:** Protocol instructions injected into conversation context

### What It Does

1. **Checks git status** for `docs/idea/` directory
2. **Counts uncommitted files** (modified, added, untracked)
3. **Outputs protocol instructions** if changes detected:
   - Status summary (file count)
   - Reminder to run sync workflow
   - List of affected files
   - Behavioral guidance for Claude

### Example Output

When there are 2 uncommitted files in `docs/idea/`, the hook outputs:

```markdown
# Idea Sync Reminder

**Status:** You have 2 uncommitted file(s) in `docs/idea/`

**Protocol:** When the user makes changes to official documentation or asks about syncing ideas:

1. **Remind them** about the sync workflow:
   ```
   You have 2 uncommitted changes in docs/idea/ that may need to be synced.

   Run: claude workflows sync-ideas-to-docs
   ```

2. **Offer to help**:
   - Check if changes have phasing tags ([MVP], [v1.1], [v1.2])
   - Suggest running the sync workflow if appropriate
   - Don't be pushy - just a gentle reminder

3. **Don't spam**:
   - Only mention this if contextually relevant
   - Don't repeat if user declines
   - They can disable with: touch .claude/idea-sync-reminder-disabled.flag

**Files affected:**
- M docs/idea/ai.md
- M docs/idea/ux.md
```

This gets injected into the conversation context, so Claude knows about it throughout the session.

---

## Usage

### Automatic Operation

**The hook runs automatically** - nothing to do! When you start a new Claude Code session:
1. Hook runs automatically
2. Checks for docs/idea/ changes
3. Injects protocol if changes found
4. Claude becomes aware and can remind you when appropriate

### Disabling the Hook

If you find the reminders annoying:

```bash
# Create disable flag
touch .claude/idea-sync-reminder-disabled.flag

# Hook will detect this and not inject protocol
```

### Re-enabling the Hook

```bash
# Remove disable flag
rm .claude/idea-sync-reminder-disabled.flag

# Start a new session - hook will run again
```

### Manual Testing

You can test what the hook outputs without starting a new session:

```bash
# Run the hook manually to see output
bash .claude/hooks/session-start-idea-sync.sh

# If no changes: No output (exit 0)
# If changes detected: Protocol instructions printed
```

---

## Behavior

### When Hook Triggers

The hook **only injects protocol** if:
- ✅ Running in a git repository
- ✅ `docs/idea/` directory exists
- ✅ Uncommitted changes detected in `docs/idea/`
- ✅ Not disabled via flag file

### When Hook Stays Silent

The hook **does not inject protocol** if:
- ❌ No uncommitted changes in `docs/idea/`
- ❌ Not in a git repository
- ❌ Disable flag exists
- ❌ `docs/idea/` directory doesn't exist

### Claude's Behavior

Once the protocol is injected, Claude will:
- Be aware of pending sync needs
- Mention it when contextually appropriate
- Not spam or repeat if user declines
- Offer to help with sync workflow

**Claude won't:**
- Interrupt unrelated work
- Force you to run the workflow
- Repeat after you decline once
- Mention it in every message

---

## Technical Details

### File Structure

```
.claude/
├── hooks/
│   └── session-start-idea-sync.sh        # The hook (executable)
└── idea-sync-reminder-disabled.flag      # Opt-out flag (optional, user-created)

docs/
└── idea/                                  # Watched directory
    ├── ai.md
    ├── ux.md
    └── ...
```

### Hook Lifecycle

```
┌─────────────────────────────┐
│ User starts Claude session  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Claude Code runs all        │
│ session-start-*.sh hooks    │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ session-start-idea-sync.sh  │
│ checks git status           │
└──────────┬──────────────────┘
           │
           ├─────NO CHANGES────► Exit silently (no injection)
           │
           └─────HAS CHANGES───► Output protocol to stdout
                                  │
                                  ▼
                            ┌──────────────────────┐
                            │ Claude Code captures │
                            │ output and injects   │
                            │ into conversation    │
                            └──────────────────────┘
```

### Dependencies

- **bash** - Shell interpreter
- **git** - For status checking
- **wc, head, sed** - Unix text utilities

All standard on Unix/Linux/WSL/macOS.

---

## Testing

### Test 1: Hook Detects Changes

```bash
# 1. Make a change in docs/idea/
echo "# Test change" >> docs/idea/ux.md

# 2. Run hook manually to see output
bash .claude/hooks/session-start-idea-sync.sh

# Expected: Protocol instructions printed showing 1+ files

# 3. Clean up
git checkout docs/idea/ux.md
```

### Test 2: Hook Silent When No Changes

```bash
# 1. Ensure docs/idea/ is clean
git status docs/idea/

# 2. Run hook
bash .claude/hooks/session-start-idea-sync.sh

# Expected: No output (silent exit)
```

### Test 3: Disable Mechanism

```bash
# 1. Create disable flag
touch .claude/idea-sync-reminder-disabled.flag

# 2. Make a change
echo "test" >> docs/idea/ai.md

# 3. Run hook
bash .claude/hooks/session-start-idea-sync.sh

# Expected: No output (disabled)

# 4. Re-enable and test
rm .claude/idea-sync-reminder-disabled.flag
bash .claude/hooks/session-start-idea-sync.sh

# Expected: Protocol instructions shown

# 5. Clean up
git checkout docs/idea/ai.md
```

---

## Comparison: This vs Other Approaches

| Approach | Complexity | Automatic | Intrusive | Best For |
|----------|-----------|-----------|-----------|----------|
| **Claude session-start hook** | Very Low | ✅ Yes | ❌ No | Gentle awareness |
| Git pre-commit hook | Medium | ✅ Yes | ⚠️ Can block commits | Enforcement |
| Git post-commit hook | Low | ✅ Yes | ❌ No | After-commit reminders |
| File watcher (chokidar) | High | ✅ Yes | ⚠️ Desktop notifications | Real-time detection |
| Cron/scheduled | Medium | ✅ Yes | ❌ No | Weekly check-ins |
| Manual check | Very Low | ❌ No | ❌ No | Full user control |

**Current implementation:** Claude session-start hook (best balance of simplicity + automation)

---

## When to Upgrade

The current Claude hook is sufficient for most solo development. Consider alternatives if:

- **You want enforcement:** Use git pre-commit hook (blocks commits until sync)
- **You want real-time:** Use file watcher (immediate notifications)
- **You want team alerts:** Use git hooks + Slack integration
- **You want scheduled:** Use cron job for weekly reminders

But for exploratory use and gentle reminders, the Claude hook is perfect.

---

## Troubleshooting

### Hook Not Running

**Problem:** Hook doesn't seem to inject protocol at session start

**Solutions:**
1. Check if hook is executable: `ls -l .claude/hooks/session-start-idea-sync.sh`
2. Make executable if needed: `chmod +x .claude/hooks/session-start-idea-sync.sh`
3. Check for Windows line endings: `dos2unix .claude/hooks/session-start-idea-sync.sh`
4. Test manually: `bash .claude/hooks/session-start-idea-sync.sh`

### Hook Outputs Errors

**Problem:** Hook runs but shows errors

**Solutions:**
1. Check you're in a git repository: `git status`
2. Check `docs/idea/` exists: `ls -la docs/idea/`
3. Check git is in PATH: `which git`

### Claude Mentions It Too Much

**Problem:** Claude brings up the sync reminder too often

**Solutions:**
1. Disable temporarily: `touch .claude/idea-sync-reminder-disabled.flag`
2. Commit or stash changes: `git add docs/idea/ && git commit -m "docs: update ideas"`
3. Edit hook to be more restrictive (e.g., only show if 5+ files changed)

### Want to See Injected Context

**Problem:** Want to verify what Claude sees

**Solution:**
```bash
# Run all session-start hooks to see their output
for hook in .claude/hooks/session-start-*.sh; do
    echo "=== $(basename $hook) ==="
    bash "$hook"
    echo ""
done
```

---

## Customization

### Change File Count Threshold

Only show reminder if 3+ files changed:

```bash
# Edit .claude/hooks/session-start-idea-sync.sh
# Add after FILE_COUNT calculation:
if [[ $FILE_COUNT -lt 3 ]]; then
  exit 0
fi
```

### Add Ignore Patterns

Skip certain files (e.g., scratch notes):

```bash
# Edit the hook file
# Modify the git status line:
IDEA_CHANGES=$(git -C "$PROJECT_ROOT" status --porcelain -- docs/idea/ 2>/dev/null | grep -v "scratch")
```

### Change Reminder Tone

Edit the protocol output in the hook file to be more/less assertive, add emojis, etc.

---

## Design Rationale

### Why Claude Hooks?

1. **Native integration** - Works with Claude Code's existing hook system
2. **Zero installation** - Just create the file, no setup needed
3. **Non-blocking** - Doesn't interrupt commits or file saves
4. **Context-aware** - Claude has full context to decide when to mention it
5. **User control** - Easy to disable, doesn't force actions

### Why Not Git Hooks?

Git hooks are more invasive:
- Can slow down commits
- May annoy users who want quick WIP commits
- Require installation step
- Can be bypassed with `--no-verify`

Claude hooks are gentler and work better for exploratory workflows.

### Why Session-Start?

Other trigger points considered:
- **user-prompt-submit** - Too frequent (every message)
- **tool-execution** - Not relevant to this use case
- **file-change** - Would need file watcher (complex)

**Session-start** is perfect because:
- Runs once per session (not spammy)
- Gives Claude awareness throughout session
- User can ignore if not relevant

---

## Future Enhancements (Optional)

Possible improvements if the basic hook proves useful:

1. **Phasing tag detection** - Only remind if changes have [MVP] tags
2. **Last sync date** - Show "synced 7 days ago" context
3. **Impact estimation** - "3 docs will need updates"
4. **Integration with workflow** - Pre-check before workflow starts
5. **Team version** - Post to Slack if changes accumulate

But these are **not needed now** - keep it simple for exploratory use.

---

*This is a simple, functional Claude Code hook. It does one thing well: make Claude aware of pending sync needs. No over-engineering, just awareness.*
