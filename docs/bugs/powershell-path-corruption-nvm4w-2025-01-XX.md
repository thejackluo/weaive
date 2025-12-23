# Bug Report: PowerShell PATH Corruption with nvm4w - Node.js Command Not Found

**Date:** 2025-01-XX  
**Status:** 🔍 INVESTIGATING  
**Severity:** High (P1) - Blocks Development  
**Component:** Local Development Environment (Windows PowerShell)  
**Affected Version:** Windows 10/11, PowerShell 5.1+, nvm4w  
**Reporter:** Jack  
**Bug Type:** ⚠️ **LOCAL COMPUTER BUG - NOT A PROJECT BUG**

---

## Executive Summary

Node.js commands (`node`, `npm`, `npx`) intermittently fail in PowerShell with "CommandNotFoundException" even though Node.js is globally installed via nvm4w. The root cause is **PATH environment variable corruption** where PATH entries are concatenated without semicolon separators, causing Windows to be unable to locate the `node.exe` executable.

**Time to Resolution:** TBD  
**Impact:** Complete blocking of Node.js development workflows, npm commands, and project builds

---

## Problem Description

### User Report

> "why does my node sometimes disappear, like node is globally installed but in my powershell it doesn't want to work at all"

### Symptoms

1. ❌ `node --version` fails with `CommandNotFoundException`
2. ❌ `npm --version` fails with `CommandNotFoundException`
3. ❌ `npx` commands fail
4. ✅ Node.js is installed and visible in `C:\nvm4w\nodejs\`
5. ✅ PATH contains Node.js path, but it's corrupted/merged with other entries
6. ⚠️ Issue is intermittent - sometimes works after restarting PowerShell

### Visual Evidence

**PATH Inspection Output:**
```powershell
$env:PATH -split ';' | Select-String -Pattern "node"

# Shows corrupted entry:
C:\nvm4w\nodejsc:\Users\Jack Luo\.cursor\extensions\ms-python.debugpy-2025.14.1-win32-x64\bundled\scripts\noConfigScripts
```

**Expected PATH Entry:**
```
C:\nvm4w\nodejs;c:\Users\Jack Luo\.cursor\extensions\...
```

**Actual PATH Entry (Corrupted):**
```
C:\nvm4w\nodejsc:\Users\Jack Luo\.cursor\extensions\...
```

**Problem:** Missing semicolon separator causes Windows to look for `node.exe` at path `C:\nvm4w\nodejsc:\Users\...` instead of `C:\nvm4w\nodejs\`.

---

## Root Causes

### Primary Cause: PATH Entry Corruption

**Issue:** The PATH environment variable contains a malformed entry where `C:\nvm4w\nodejs` is concatenated directly with the next PATH entry (`c:\Users\Jack Luo\.cursor\...`) without a semicolon separator.

**Evidence:**
```powershell
# Corrupted PATH entry
C:\nvm4w\nodejsc:\Users\Jack Luo\.cursor\extensions\ms-python.debugpy-2025.14.1-win32-x64\bundled\scripts\noConfigScripts

# Should be two separate entries:
C:\nvm4w\nodejs
c:\Users\Jack Luo\.cursor\extensions\ms-python.debugpy-2025.14.1-win32-x64\bundled\scripts\noConfigScripts
```

**Why this breaks Node.js:**
- Windows PATH parser expects semicolon-separated entries
- When entries are merged, `where.exe node` cannot find `node.exe`
- PowerShell caches PATH at startup, so corruption persists until session restart
- Even if nvm4w sets PATH correctly, corrupted entries override it

### Secondary Causes

1. **nvm4w PATH Management**
   - nvm4w modifies PATH when switching Node versions
   - If PATH was already corrupted, nvm4w's updates may not fix it
   - nvm4w scripts may have bugs that cause PATH corruption

2. **PowerShell PATH Caching**
   - PowerShell loads PATH once at startup
   - Changes to system/user PATH variables don't reflect until restart
   - Corrupted PATH persists in active session

3. **Multiple Tools Modifying PATH**
   - Cursor extensions (Python debugpy) add to PATH
   - nvm4w modifies PATH
   - Other installers may modify PATH incorrectly
   - Conflicts can cause corruption

---

## Solution

### Immediate Fix

**Step 1: Identify Corrupted Entry**
```powershell
$env:PATH -split ';' | Where-Object { $_ -match 'nvm4w|node' }
```

**Step 2: Fix User PATH Variable**
```powershell
# Get current user PATH
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")

# Fix the corrupted entry by replacing merged paths
$fixedPath = $userPath -replace 'C:\\nvm4w\\nodejsc:', 'C:\nvm4w\nodejs;c:'

# Save the fixed PATH
[Environment]::SetEnvironmentVariable("Path", $fixedPath, "User")

# Verify the fix
$fixedPath -split ';' | Where-Object { $_ -match 'nvm4w|node' }
```

**Step 3: Refresh Current Session**
```powershell
# Reload PATH from environment
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

**Step 4: Verify Node Works**
```powershell
node --version
npm --version
```

### Alternative Fix: Manual PATH Edit

If PowerShell fix doesn't work:

1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. Go to "Advanced" tab → "Environment Variables"
3. Under "User variables", find "Path" and click "Edit"
4. Look for entry: `C:\nvm4w\nodejsc:\Users\...` (corrupted)
5. Edit it to be: `C:\nvm4w\nodejs` (ensure proper semicolon separation)
6. Click OK on all dialogs
7. Close and reopen PowerShell

### Long-term Prevention

**Use nvm4w Properly:**
```powershell
# List installed versions
nvm list

# Use a specific version (this should fix PATH)
nvm use <version-number>

# Set a default version
nvm alias default <version-number>
```

**Regular PATH Health Check:**
```powershell
# Check for corrupted entries (no semicolon before drive letter)
$env:PATH -split ';' | Where-Object { $_ -match '^[^;]+[a-zA-Z]:\\' -and $_ -notmatch '^[a-zA-Z]:\\' }
```

---

## Verification

### Pre-Fix Behavior
- ❌ `node --version`: CommandNotFoundException
- ❌ `npm --version`: CommandNotFoundException
- ❌ PATH shows: `C:\nvm4w\nodejsc:\Users\...` (corrupted)

### Post-Fix Behavior
- ✅ `node --version`: Shows version (e.g., v20.x.x)
- ✅ `npm --version`: Shows version
- ✅ PATH shows: `C:\nvm4w\nodejs` (separate entry)

---

## Why This Was Hard to Debug

### 1. Intermittent Nature
- Sometimes works after restarting PowerShell
- PATH corruption may not be immediately obvious
- Issue appears "random" to user

### 2. Silent Failure
- No error message explaining PATH corruption
- Windows just says "command not found"
- PATH inspection required to see the problem

### 3. Multiple PATH Sources
- System PATH
- User PATH
- Session PATH ($env:PATH)
- nvm4w modifications
- Other tool modifications
- Hard to track which source is corrupted

### 4. PowerShell Caching
- PATH loaded once at startup
- Changes don't reflect until restart
- Can mask the actual problem

---

## Prevention Guidelines

### For Developers

1. **Regular PATH Health Checks**
   ```powershell
   # Check for corrupted entries
   $env:PATH -split ';' | ForEach-Object { 
     if ($_ -match '^[^;]+[a-zA-Z]:\\' -and $_ -notmatch '^[a-zA-Z]:\\') {
       Write-Warning "Potentially corrupted PATH entry: $_"
     }
   }
   ```

2. **Always Use nvm4w Commands**
   - Use `nvm use <version>` instead of manually editing PATH
   - Let nvm4w manage PATH entries
   - Set default version with `nvm alias default`

3. **Restart PowerShell After PATH Changes**
   - Close all PowerShell windows
   - Open fresh session
   - Verify Node works: `node --version`

4. **Backup PATH Before Changes**
   ```powershell
   # Save current PATH
   [Environment]::GetEnvironmentVariable("Path", "User") | Out-File "path-backup.txt"
   ```

### For System Maintenance

1. **Audit PATH Regularly**
   - Check for duplicate entries
   - Check for corrupted entries
   - Remove unused entries

2. **Use Version Control for PATH**
   - Document which tools add which PATH entries
   - Keep track of PATH modifications

3. **Monitor nvm4w Updates**
   - Check nvm4w changelog for PATH-related fixes
   - Update nvm4w if bugs are fixed

---

## Related Issues

### Similar Problems to Watch For

1. **Other PATH Corruption**
   - Python PATH corruption
   - Java PATH corruption
   - Any tool that modifies PATH can cause similar issues

2. **nvm4w Bugs**
   - Check nvm4w GitHub issues for PATH-related bugs
   - May need to update or switch to alternative (nvm-windows)

3. **PowerShell Profile Issues**
   - PowerShell profile may modify PATH incorrectly
   - Check `$PROFILE` for PATH modifications

---

## References

- [nvm4w Documentation](https://github.com/coreybutler/nvm-windows)
- [Windows PATH Environment Variable](https://learn.microsoft.com/en-us/windows/win32/procthread/environment-variables)
- [PowerShell Environment Variables](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables)

---

## Lessons Learned

### Technical Lessons

1. **PATH corruption is silent** - No error messages, just "command not found"
2. **Always inspect PATH when commands fail** - Use `$env:PATH -split ';'` to see entries
3. **Semicolon separators are critical** - Missing separators cause merged entries
4. **PowerShell caches PATH** - Restart required after PATH changes

### Process Lessons

1. **Check environment first** - Before debugging code, verify environment setup
2. **Document local environment issues** - Separate from project bugs
3. **Use version managers properly** - Let tools manage PATH instead of manual edits

---

## Notes

- **This is a LOCAL COMPUTER BUG, not a project bug**
- Issue is specific to Jack's Windows development environment
- Does not affect other developers or CI/CD systems
- Solution is documented for future reference and troubleshooting

---

**Report Author:** Jack  
**Last Updated:** 2025-01-XX  
**Status:** Documented for reference

