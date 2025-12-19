# Notification Chimes Hook Guide

**Purpose:** Developer reference for understanding and using Claude Code notification chimes
**Last Updated:** 2025-12-17
**Hook Location:** `.claude/hooks/`

---

## Overview

Weave has custom notification chimes configured to alert you when Claude Code needs attention or finishes working. This helps you multitask without constantly watching the terminal.

### What Notification Chimes Do

1. **Permission Request Chime** - Plays when Claude Code needs your approval for an action
2. **Response Complete Chime** - Plays when Claude Code finishes responding

These chimes work across platforms (macOS, Linux, WSL2, Windows) with automatic fallbacks.

---

## Files & Configuration

### Hook Scripts

| File | Purpose | Trigger Event |
|------|---------|---------------|
| `.claude/hooks/permission-chime.sh` | Permission request notification | `PermissionRequest` hook event |
| `.claude/hooks/response-complete-chime.sh` | Response completion notification | `Stop` hook event |

### Configuration

**Location:** `.claude/settings.json`

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/permission-chime.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/response-complete-chime.sh"
          }
        ]
      }
    ]
  }
}
```

### Logs

**Location:** `.claude/notification-logs/`

- `permissions.log` - Timestamp log of all permission requests
- `completions.log` - Timestamp log of all response completions

---

## How It Works

### Cross-Platform Audio Support

The hooks automatically detect your platform and use the appropriate audio system:

| Platform | Audio Command | Sound Used |
|----------|---------------|------------|
| **macOS** | `afplay` | Glass.aiff (permission), Ping.aiff (complete) |
| **Linux/WSL2** | `paplay` (PulseAudio) | bell.oga (permission), complete.oga (complete) |
| **Linux** | `aplay` (ALSA) | bell.oga (permission), complete.oga (complete) |
| **Windows (WSL)** | `powershell.exe` | 800Hz beep (permission), 600Hz beep (complete) |
| **Fallback** | Terminal bell `\a` | System default beep |

### Hook Execution Flow

```
1. Claude Code triggers event (PermissionRequest or Stop)
      ↓
2. Claude Code executes configured hook script
      ↓
3. Hook script receives JSON via stdin
      ↓
4. Script parses JSON (optional, uses jq if available)
      ↓
5. Script plays platform-specific sound
      ↓
6. Script logs event to notification log file
      ↓
7. Hook exits with code 0 (success)
```

### JSON Input Format

**PermissionRequest Event:**
```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default",
  "hook_event_name": "PermissionRequest",
  "notification_type": "permission_prompt",
  "message": "Claude needs permission to..."
}
```

**Stop Event:**
```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default",
  "hook_event_name": "Stop",
  "stop_hook_active": true
}
```

---

## Testing & Debugging

### Test Hooks Manually

```bash
# Test permission chime
echo '{"notification_type":"permission_prompt","message":"Test"}' | .claude/hooks/permission-chime.sh

# Test response complete chime
echo '{"stop_hook_active":true}' | .claude/hooks/response-complete-chime.sh
```

### Check Logs

```bash
# View permission requests
tail -f .claude/notification-logs/permissions.log

# View completions
tail -f .claude/notification-logs/completions.log

# View all notifications
tail -f .claude/notification-logs/*.log
```

### Verify Hook Configuration

In Claude Code CLI, run:
```
/hooks
```

This shows all configured hooks and their status.

### Troubleshooting

**No sound plays:**
1. Check if audio system is working:
   ```bash
   # WSL2/Linux
   paplay /usr/share/sounds/freedesktop/stereo/complete.oga

   # macOS
   afplay /System/Library/Sounds/Ping.aiff

   # Windows PowerShell (from WSL)
   powershell.exe -c "[console]::beep(600, 200)"
   ```

2. Check hook execution permissions:
   ```bash
   ls -la .claude/hooks/*.sh
   # Should show: -rwxr-xr-x (executable)
   ```

3. Check for line ending issues (WSL):
   ```bash
   file .claude/hooks/permission-chime.sh
   # Should show: "Bourne-Again shell script, ASCII text executable"
   # NOT: "Bourne-Again shell script, ASCII text executable, with CRLF line terminators"

   # Fix if needed:
   sed -i 's/\r$//' .claude/hooks/permission-chime.sh
   sed -i 's/\r$//' .claude/hooks/response-complete-chime.sh
   ```

**Logs not created:**
- Ensure `.claude/notification-logs/` directory exists
- Check write permissions on `.claude/` directory

**Hook not triggering:**
- Verify `.claude/settings.json` is valid JSON
- Check that hook paths in settings.json are correct
- Try absolute paths if relative paths don't work:
  ```json
  "command": "/full/path/to/weavelight/.claude/hooks/permission-chime.sh"
  ```

---

## Customization

### Change Sound Files

Edit the hook scripts to use different sounds:

```bash
# Example: Use different macOS sound
# Edit .claude/hooks/permission-chime.sh line 46
afplay /System/Library/Sounds/Funk.aiff &> /dev/null &

# Example: Use custom sound file
afplay ~/my-custom-sounds/notification.mp3 &> /dev/null &
```

### Available macOS System Sounds

```bash
# List all available system sounds
ls /System/Library/Sounds/

# Common sounds:
# - Basso.aiff
# - Blow.aiff
# - Bottle.aiff
# - Frog.aiff
# - Funk.aiff
# - Glass.aiff (default for permissions)
# - Hero.aiff
# - Morse.aiff
# - Ping.aiff (default for completions)
# - Pop.aiff
# - Purr.aiff
# - Sosumi.aiff
# - Submarine.aiff
# - Tink.aiff
```

### Disable Chimes Temporarily

**Option 1: Comment out in settings.json**
```json
{
  "hooks": {
    // "PermissionRequest": [...],
    // "Stop": [...]
  }
}
```

**Option 2: Rename hooks**
```bash
mv .claude/hooks/permission-chime.sh .claude/hooks/permission-chime.sh.disabled
mv .claude/hooks/response-complete-chime.sh .claude/hooks/response-complete-chime.sh.disabled
```

**Option 3: Add a disable flag**

Add this to the top of each hook script:
```bash
# Disable this hook
# exit 0
```

### Add Visual Notifications

You can extend the hooks to show OS notifications in addition to sounds:

**macOS:**
```bash
osascript -e 'display notification "Claude needs permission" with title "Claude Code" sound name "Glass"'
```

**Linux:**
```bash
notify-send "Claude Code" "Permission requested"
```

**Windows (from WSL):**
```bash
powershell.exe -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('Claude needs permission', 'Claude Code')"
```

Add these commands to the hook scripts after the `play_chime()` function call.

---

## Hook Architecture

### Design Principles

1. **Cross-platform compatibility** - Works on macOS, Linux, WSL2, Windows
2. **Graceful degradation** - Falls back to simpler methods if preferred audio system is unavailable
3. **Non-blocking** - Audio plays in background (`&` suffix)
4. **Logging** - All events logged for debugging and analytics
5. **Exit code 0** - Always succeeds to avoid blocking Claude Code

### Security Considerations

- Hooks run with your user permissions (not elevated)
- Hooks can only access files in your project and home directory
- Hooks cannot block Claude Code execution (except PreToolUse with exit code 2)
- Hook stdin is JSON from Claude Code, not user-controlled input

### Performance Impact

- **Minimal** - Hooks execute asynchronously in background
- Audio playback runs as separate background process
- Log writes are append-only, no locks
- Typical execution time: <50ms per hook

---

## Claude Code Hook System Reference

### Available Hook Events

| Event | When Triggered | Use Case |
|-------|----------------|----------|
| `PermissionRequest` | Claude needs permission | Notification chimes, auto-approve |
| `Stop` | Claude finishes responding | Notification chimes, analytics |
| `PreToolUse` | Before tool execution | Validation, blocking |
| `PostToolUse` | After tool completes | Logging, auditing |
| `UserPromptSubmit` | User submits prompt | Prompt preprocessing |
| `SubagentStop` | Subagent completes | Task tracking |
| `SessionStart` | Session begins | Setup, welcome messages |
| `SessionEnd` | Session ends | Cleanup, summaries |
| `PreCompact` | Before compacting context | Context preservation |
| `Notification` | Any notification event | Generic notifications |

### Hook Exit Codes

| Exit Code | Meaning | Effect |
|-----------|---------|--------|
| `0` | Success | Continue normally, stdout shown in verbose mode |
| `2` | Blocking error | Stop execution, show stderr to Claude |
| Other | Non-blocking error | Continue execution, show stderr to user |

### Hook Environment Variables

All hooks have access to:

- `CLAUDE_PROJECT_DIR` - Absolute path to project root
- `CLAUDE_CODE_REMOTE` - "true" if running remotely, else unset
- Standard shell variables (`HOME`, `USER`, `PATH`, etc.)

---

## Related Documentation

- [Claude Code Official Docs](https://docs.anthropic.com/claude/docs/claude-code)
- [Claude Code Hooks Reference](https://docs.anthropic.com/claude/docs/claude-code-hooks)
- [MCP Quick Reference](./mcp-quick-reference.md)
- [Design System Guide](./design-system-guide.md)

---

## Frequently Asked Questions

**Q: Will chimes play if Claude Code is running in background?**
A: Yes, chimes will play as long as your audio system is active.

**Q: Can I use custom MP3/WAV files?**
A: Yes, just replace the sound file path in the hook scripts. Make sure the audio player supports your file format.

**Q: Do chimes work with headphones?**
A: Yes, chimes use your system's default audio output.

**Q: Can I disable chimes for specific projects?**
A: Yes, create a project-specific `.claude/settings.json` without hook configuration, or use `.claude/settings.local.json` (not committed to git).

**Q: What if I want different sounds for different permission types?**
A: Edit `permission-chime.sh` to check `notification_type` and play different sounds based on the value.

**Q: Can hooks slow down Claude Code?**
A: No, hooks run asynchronously and don't block Claude Code execution.

---

## Contributing

If you improve these hooks or create new notification methods, please:

1. Update this documentation
2. Add your changes to `.cursor/.cursor-changes`
3. Test on multiple platforms if possible
4. Submit a pull request with clear description

**Maintainer:** @thejackluo
**Last Review:** 2025-12-17
