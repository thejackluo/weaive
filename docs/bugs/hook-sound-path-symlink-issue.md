# Bug Report: Hook Sound Files Not Playing Due to Symlink Path Resolution

**Date:** 2025-12-17
**Severity:** Medium
**Status:** ✅ Fixed
**Affected Components:** `.claude/hooks/permission-chime.sh`, `.claude/hooks/response-complete-chime.sh`

---

## Summary

Claude Code notification hooks were executing successfully but producing no sound. The issue was caused by improper path resolution when hooks were called via symlinks in `/tmp/`, causing the scripts to look for sound files in the wrong directory.

---

## Symptoms

- ✅ Hooks were executing (confirmed by logs in `/tmp/claude-notification-logs/`)
- ✅ Hook scripts had correct permissions and were reachable
- ✅ Symlinks in `/tmp/` correctly pointed to actual scripts in `.claude/hooks/`
- ❌ **No sound played** when hooks triggered
- ❌ Sound files in `.claude/sounds/` were never accessed

**User Impact:** Silent notifications meant users didn't receive audible feedback for permission requests or response completions, degrading the UX of the notification system.

---

## Root Cause Analysis

### The Symlink Architecture

Settings in `.claude/settings.json` configured hooks to run via symlinks:

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/tmp/permission-chime.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/tmp/response-complete-chime.sh"
          }
        ]
      }
    ]
  }
}
```

The symlinks pointed to real scripts:
```bash
/tmp/permission-chime.sh -> /mnt/c/.../weavelight/.claude/hooks/permission-chime.sh
/tmp/response-complete-chime.sh -> /mnt/c/.../weavelight/.claude/hooks/response-complete-chime.sh
```

### The Bug

Both hook scripts used this logic to find sound files:

```bash
# BROKEN CODE
play_chime() {
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  SOUNDS_DIR="$SCRIPT_DIR/../sounds"

  # Try to play sound from $SOUNDS_DIR
  CUSTOM_SOUND="$SOUNDS_DIR/permission.wav"
  paplay "$CUSTOM_SOUND"  # This never works!
}
```

**Problem:** When the script is invoked as `/tmp/permission-chime.sh`, the variable `$0` contains `/tmp/permission-chime.sh`, NOT the resolved path. Therefore:

1. `dirname "$0"` returns `/tmp`
2. `SCRIPT_DIR` becomes `/tmp`
3. `SOUNDS_DIR="$SCRIPT_DIR/../sounds"` becomes `/tmp/../sounds` = `/sounds`
4. Script looks for `/sounds/permission.wav` ❌ (doesn't exist)
5. Real sound file at `.claude/sounds/permission.wav` is never accessed ❌

### Why This Wasn't Obvious

- The scripts had **fallback sound mechanisms** (PulseAudio system sounds, PowerShell beeps)
- **System sound files didn't exist** in WSL (`/usr/share/sounds/freedesktop/stereo/bell.oga` missing)
- Fallbacks failed silently, producing no audible output
- Scripts exited with code 0 (success), so logs showed no errors
- The bug only manifested when:
  - Custom sound files existed in `.claude/sounds/`
  - Script was called via symlink
  - Fallback sounds were unavailable or unwanted

---

## The Fix

Updated both hook scripts to resolve symlinks before calculating the sounds directory:

```bash
# FIXED CODE
play_chime() {
  # Get the REAL directory where this script is located (resolve symlinks)
  SCRIPT_PATH="$0"
  if command -v readlink > /dev/null 2>&1; then
    SCRIPT_PATH="$(readlink -f "$0")"
  fi
  SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
  SOUNDS_DIR="$SCRIPT_DIR/../sounds"

  # Now correctly finds .claude/sounds/permission.wav ✓
  CUSTOM_SOUND="$SOUNDS_DIR/permission.wav"
  paplay "$CUSTOM_SOUND"
}
```

**Key Change:** `readlink -f "$0"` resolves the symlink to the actual file path before extracting the directory.

**Example:**
```bash
# When called as /tmp/permission-chime.sh
readlink -f "$0"  # Returns: /mnt/c/.../weavelight/.claude/hooks/permission-chime.sh
dirname           # Returns: /mnt/c/.../weavelight/.claude/hooks/
../sounds         # Returns: /mnt/c/.../weavelight/.claude/sounds/ ✓ CORRECT
```

---

## Files Modified

| File | Change | Lines |
|------|--------|-------|
| `.claude/hooks/permission-chime.sh` | Added symlink resolution | 30-36 |
| `.claude/hooks/response-complete-chime.sh` | Added symlink resolution | 30-36 |

---

## Testing & Validation

### Test Commands

```bash
# Test permission chime directly
echo '{"message":"Test"}' | /tmp/permission-chime.sh

# Test completion chime directly
echo '{}' | /tmp/response-complete-chime.sh

# Test direct audio playback (bypass hooks)
paplay .claude/sounds/permission.wav
paplay .claude/sounds/complete.wav

# Check logs
tail -5 /tmp/claude-notification-logs/permissions.log
tail -5 /tmp/claude-notification-logs/completions.log
```

### Validation Checklist

- [x] Hooks execute without errors (exit code 0)
- [x] Sound files are found in `.claude/sounds/`
- [x] `paplay` plays .wav files correctly in WSL
- [x] Permission chime plays glass sound
- [x] Completion chime plays bottle sound
- [x] Logs record hook execution with timestamps
- [x] Works when called via symlink in `/tmp/`
- [x] Works when called directly from `.claude/hooks/`

---

## Lessons Learned

### What Went Wrong

1. **Incomplete symlink handling** - The original scripts didn't account for being called via symlinks
2. **Silent failures** - Fallback mechanisms failed silently without logging errors
3. **Missing system sounds** - WSL installation lacked standard Linux sound files, causing fallbacks to fail
4. **Over-reliance on defaults** - Assumed system sounds would always be available

### What Went Right

1. **Logging worked** - We could verify hooks were executing via logs
2. **Symlink approach is valid** - Using `/tmp/` symlinks provides consistency across project moves
3. **Graceful degradation** - Multiple fallback mechanisms prevented complete failure
4. **Root cause identified quickly** - Debug process was systematic

### Prevention Strategies

1. **Always test with symlinks** - If scripts support symlinks, test both direct and symlinked execution
2. **Log file access attempts** - Add debug logging for file existence checks
3. **Validate assumptions** - Don't assume system sound files exist; check explicitly
4. **Use `readlink -f` by default** - When calculating relative paths, always resolve symlinks first
5. **Add setup validation** - Create a script to verify hook setup (check sounds exist, audio commands available)

---

## Related Documentation

- **Setup Guide:** `docs/setup/notification-hooks-guide.md` (if exists)
- **Hook Scripts:** `.claude/hooks/permission-chime.sh`, `.claude/hooks/response-complete-chime.sh`
- **Sound Files:** `.claude/sounds/permission.wav`, `.claude/sounds/complete.wav`
- **Settings:** `.claude/settings.json`

---

## Environment Details

- **Platform:** WSL2 (Windows Subsystem for Linux)
- **OS:** Linux 5.15.153.1-microsoft-standard-WSL2
- **Audio System:** PulseAudio (unix:/mnt/wslg/PulseServer)
- **Audio Command:** `paplay` (PulseAudio client)
- **Shell:** bash/sh (POSIX-compatible)

---

## Appendix: Alternative Solutions Considered

### Option 1: Remove Symlinks ❌
**Approach:** Update `.claude/settings.json` to point directly to scripts in `.claude/hooks/`

**Pros:**
- Simpler configuration
- No symlink complexity

**Cons:**
- Absolute paths break when project is moved
- Less portable across different installations
- Harder to manage hooks centrally

**Decision:** Rejected in favor of fixing symlink handling

### Option 2: Use Absolute Paths in Scripts ❌
**Approach:** Hardcode absolute paths to sound files in scripts

**Pros:**
- No path calculation needed

**Cons:**
- Breaks when project is moved
- Not portable across users/machines
- Violates DRY principle

**Decision:** Rejected in favor of dynamic path resolution

### Option 3: Environment Variables ⚠️
**Approach:** Set `CLAUDE_SOUNDS_DIR` environment variable

**Pros:**
- Flexible configuration
- Easy to override

**Cons:**
- Requires additional setup step
- Easy to forget to set
- Not self-contained

**Decision:** Considered as future enhancement

### Option 4: Fix Symlink Resolution ✅
**Approach:** Use `readlink -f` to resolve symlinks before calculating paths

**Pros:**
- Minimal code change
- Preserves symlink benefits
- Portable and self-contained
- No configuration changes needed

**Cons:**
- Requires `readlink` command (widely available)

**Decision:** ✅ **IMPLEMENTED** - Best balance of simplicity and robustness

---

## Future Improvements

1. **Add setup validation script** - Verify hooks, sounds, and audio system before first use
2. **Enhanced error logging** - Log when sound files are not found
3. **Configuration documentation** - Document the symlink approach and path resolution
4. **Automated testing** - Add tests for hook execution in CI/CD
5. **Fallback priority** - Prefer custom sounds over system sounds, log when using fallbacks

---

**Report Created By:** Claude Code (Automated Bug Analysis)
**Reviewed By:** User (thejackluo)
**Last Updated:** 2025-12-17
