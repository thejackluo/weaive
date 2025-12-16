# MCP Troubleshooting Guide

Comprehensive troubleshooting for MCP server issues on Windows and WSL/Linux.

---

## 🔍 Quick Diagnostics

Run these commands to quickly identify issues:

**Check MCP Status:**
```
/mcp
```

**Check Environment:**
```bash
# WSL/Linux
pwd
echo $SHELL
node --version
npx --version

# Windows PowerShell
$pwd
$PSVersionTable.PSVersion
node --version
npx --version
```

**Check Config:**
```bash
# WSL/Linux
cat .mcp.json | grep -A 3 "ripgrep\|filesystem"

# Windows PowerShell
Get-Content .mcp.json | Select-String -Pattern "ripgrep","filesystem" -Context 0,3
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Filesystem Server Failing

**Symptoms:**
- ❌ filesystem: failed
- Error: "Cannot find path..."
- Error: "ENOENT: no such file or directory"

**Root Cause:** Path format doesn't match your environment

**Solution:**

1. **Check which environment you're in:**
   ```bash
   # WSL: Shows /mnt/c/Users/...
   pwd
   
   # Windows: Shows C:\Users\...
   $pwd
   ```

2. **Use the correct config:**
   ```bash
   # For WSL/Linux
   cp .mcp.json.wsl .mcp.json
   
   # For Windows PowerShell
   Copy-Item .mcp.json.windows .mcp.json
   ```

3. **Verify the path exists:**
   ```bash
   # WSL
   ls "/mnt/c/Users/Jack Luo/Desktop/(local) github software/weavelight"
   
   # Windows
   Test-Path "C:\Users\Jack Luo\Desktop\(local) github software\weavelight"
   ```

4. **Restart Claude CLI/Cursor**

---

### Issue 2: Ripgrep Server Wrong Package

**Symptoms:**
- ❌ ripgrep: failed
- Error mentioning `@modelcontextprotocol/server-everything`
- Package not found error

**Root Cause:** Wrong package name in config

**Solution:**

Check your `.mcp.json` has the **correct package**:

```json
"ripgrep": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-ripgrep", "...path..."]
}
```

❌ **Wrong:** `@modelcontextprotocol/server-everything`  
✅ **Correct:** `@modelcontextprotocol/server-ripgrep`

**Fix it:**
1. Edit `.mcp.json`
2. Change to correct package name
3. Also update `.mcp.json.windows` and `.mcp.json.wsl`
4. Restart

---

### Issue 3: "Fetch" Server Appearing (Not in Config)

**Symptoms:**
- ❌ fetch: failed
- Server appears in `/mcp` but not in your `.mcp.json`

**Root Cause:** Defined in user-level config

**Solution:**

1. **Check user config:**
   ```bash
   # WSL/Linux
   cat ~/.claude.json
   
   # Windows
   Get-Content ~/.claude.json
   ```

2. **Look for "fetch" server and remove it**

3. **Alternative:** Look for project-specific user config:
   ```bash
   # Check all MCP config locations shown in /mcp output
   ```

4. **Restart Claude CLI**

---

### Issue 4: Disabled Servers Still Showing as Failed

**Symptoms:**
- ❌ notion: failed (even though `"disabled": true`)
- ❌ browserstack: failed (even though `"disabled": true`)

**Root Cause:** Cache or config not properly loaded

**Solution:**

1. **Verify "disabled" is set correctly:**
   ```json
   "notion": {
     "command": "npx",
     "args": ["-y", "@notionhq/mcp-server-notion"],
     "env": {
       "NOTION_API_KEY": "${NOTION_API_KEY}"
     },
     "disabled": true  // ← Must be at server level
   }
   ```

2. **Clear MCP cache:**
   ```bash
   # WSL/Linux
   rm -rf ~/.cache/claude-cli-nodejs
   
   # Windows
   Remove-Item -Recurse -Force ~/.cache/claude-cli-nodejs
   ```

3. **Restart Claude CLI**

**Note:** Properly disabled servers won't appear in `/mcp` output at all.

---

### Issue 5: API Keys Not Working

**Symptoms:**
- ⏳ context7: waiting for connection
- ⏳ github: waiting for connection
- Or: ❌ Authentication failed

**Root Cause:** API keys not loaded or incorrect format

**Solution:**

1. **Check `.env` exists in project root:**
   ```bash
   ls .env
   cat .env
   ```

2. **Verify key format (NO quotes, NO spaces):**
   ```env
   # ✅ Correct
   CONTEXT7_API_KEY=abc123def456
   
   # ❌ Wrong
   CONTEXT7_API_KEY = "abc123def456"
   CONTEXT7_API_KEY='abc123def456'
   ```

3. **Check key names match exactly:**
   ```bash
   # Check what .mcp.json expects
   grep "API_KEY\|TOKEN" .mcp.json
   
   # Check what .env provides
   cat .env
   ```

4. **Common name issues:**
   - `GITHUB_TOKEN` vs `GITHUB_PERSONAL_ACCESS_TOKEN` ← Must match!
   - `CONTEXT7_KEY` vs `CONTEXT7_API_KEY` ← Must match!

5. **Restart after adding keys**

---

### Issue 6: "npx" Command Not Found

**Symptoms:**
- Error: "npx: command not found"
- Error: "'npx' is not recognized..."

**Root Cause:** Node.js not installed or not in PATH

**Solution:**

1. **Install Node.js:**
   - Download from https://nodejs.org/ (LTS version)
   - Run installer
   - **Important:** Check "Add to PATH" during installation

2. **Restart terminal/PowerShell**

3. **Verify installation:**
   ```bash
   node --version    # Should show v18.x or v20.x
   npx --version     # Should show version number
   ```

4. **If still not found (Windows):**
   - Add to PATH manually: `C:\Program Files\nodejs\`
   - Restart terminal

5. **If still not found (WSL):**
   ```bash
   # Install Node.js via nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install --lts
   nvm use --lts
   ```

---

### Issue 7: Servers Work on Windows but Fail on WSL (or vice versa)

**Symptoms:**
- Servers work in one environment
- Same config fails in another environment

**Root Cause:** Path format mismatch

**Solution:**

Use the **platform-specific config files**:

| Environment | File to Use |
|-------------|-------------|
| Windows PowerShell | `.mcp.json.windows` |
| WSL/Linux | `.mcp.json.wsl` |

**Quick switch:**
```bash
# Switching to WSL
cp .mcp.json.wsl .mcp.json

# Switching to Windows
Copy-Item .mcp.json.windows .mcp.json
```

**Path format reference:**
- **Windows:** `C:\\Users\\Jack Luo\\Desktop\\...`
- **WSL:** `/mnt/c/Users/Jack Luo/Desktop/...`

---

### Issue 8: Servers Work But Can't Read Files

**Symptoms:**
- ✅ filesystem: connected
- But errors when trying to read files
- "Permission denied" or "File not found"

**Root Cause:** Permissions or incorrect working directory

**Solution:**

1. **Check permissions:**
   ```bash
   # WSL
   ls -la "/mnt/c/Users/Jack Luo/Desktop/(local) github software/weavelight"
   
   # Should show readable permissions (r--)
   ```

2. **Fix permissions if needed:**
   ```bash
   # WSL (if needed)
   chmod -R u+r "/mnt/c/Users/Jack Luo/Desktop/(local) github software/weavelight"
   ```

3. **Check you're in the right directory:**
   ```bash
   pwd  # Should match the path in .mcp.json
   ```

4. **Try with explicit path in command:**
   ```
   "Read the file at /mnt/c/Users/Jack Luo/Desktop/(local) github software/weavelight/README.md"
   ```

---

### Issue 9: Changes to `.mcp.json` Not Taking Effect

**Symptoms:**
- Updated `.mcp.json`
- Servers still showing old behavior
- New servers not appearing

**Root Cause:** Cache or not restarted

**Solution:**

1. **Restart properly:**
   ```bash
   # Claude CLI: Full exit and restart
   Ctrl+C
   claude
   
   # Cursor: Close all windows, restart application
   ```

2. **Clear cache if needed:**
   ```bash
   rm -rf ~/.cache/claude-cli-nodejs
   npm cache clean --force
   ```

3. **Verify changes saved:**
   ```bash
   cat .mcp.json | grep "server_name"
   ```

4. **Check for JSON syntax errors:**
   - Missing commas
   - Extra commas before closing braces
   - Mismatched quotes
   - Use JSON validator: https://jsonlint.com/

---

### Issue 10: Servers Working But Slow

**Symptoms:**
- ✅ Servers connected
- But responses take a long time
- Timeouts occasionally

**Root Cause:** Network issues, cache, or large codebase

**Solution:**

1. **Check internet connection** (for Context7, GitHub)

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   npx clear-npx-cache
   ```

3. **For large codebases:**
   - Ripgrep might be slow first time (building index)
   - Subsequent searches will be faster
   - Consider adding `.gitignore` patterns to exclude `node_modules`, etc.

4. **Check server logs:**
   ```bash
   ls -la ~/.cache/claude-cli-nodejs
   # Look for error logs
   ```

---

## 🔬 Advanced Diagnostics

### Check All MCP Config Locations

MCP checks multiple config locations in order:

```bash
# 1. Project-specific (local)
cat .mcp.json

# 2. User global
cat ~/.claude.json

# 3. Project-specific user config
# Shown in /mcp output under "MCP Config locations"
```

**Tip:** Run `/mcp` and look for "MCP Config locations" section.

### Verify Environment Variables

```bash
# Check if .env is loaded
cat .env

# Check specific keys
grep CONTEXT7 .env
grep GITHUB .env

# Verify no extra characters
cat -A .env  # Shows hidden characters
```

### Test npx Directly

```bash
# Test if package exists
npx -y @modelcontextprotocol/server-ripgrep --version

# Test if package can be downloaded
npx -y @modelcontextprotocol/server-filesystem --help
```

### Check Node.js Configuration

```bash
# Check Node.js version
node --version

# Check npm configuration
npm config list

# Check npm registry
npm config get registry
# Should be: https://registry.npmjs.org/

# Check for network issues
npm ping
```

---

## 📋 Verification Checklist

Use this checklist after making changes:

```
□ Correct config file copied to .mcp.json
□ Path format matches environment (Windows vs WSL)
□ .env file exists in project root
□ API keys in .env have no quotes/spaces
□ API key names match .mcp.json exactly
□ Node.js and npx are installed and in PATH
□ Restarted Claude CLI/Cursor after changes
□ /mcp shows expected servers
□ Test commands work (read file, search code)
```

---

## 🛠️ Recovery Procedures

### Complete Reset

If nothing else works, start fresh:

```bash
# 1. Backup everything
cp .mcp.json .mcp.json.old
cp .env .env.old

# 2. Clear all caches
rm -rf ~/.cache/claude-cli-nodejs
npm cache clean --force
npx clear-npx-cache

# 3. Copy fresh config
cp .mcp.json.wsl .mcp.json  # or .mcp.json.windows

# 4. Verify config
cat .mcp.json

# 5. Restart
claude
```

### Rollback to Working State

```bash
# 1. Restore from backup
cp .mcp.json.backup .mcp.json

# 2. Or restore from git
git checkout .mcp.json.windows
git checkout .mcp.json.wsl
cp .mcp.json.wsl .mcp.json  # or .mcp.json.windows

# 3. Restart
claude
```

---

## 📞 Getting More Help

### Information to Gather

When asking for help, provide:

1. **Environment:**
   ```bash
   # Run and share output:
   echo "OS: $(uname -a)"
   echo "Node: $(node --version)"
   echo "NPM: $(npm --version)"
   echo "Shell: $SHELL"
   pwd
   ```

2. **MCP Status:**
   ```
   /mcp
   # Screenshot or copy output
   ```

3. **Config (sanitized):**
   ```bash
   # Remove API keys before sharing!
   cat .mcp.json | sed 's/"[A-Z_]*KEY".*/"KEY": "***"/'
   ```

4. **Error Messages:**
   - Full error text
   - When it occurs (startup, specific command, etc.)
   - What you've tried already

### Resources

- **MCP Registry:** https://registry.mcp.run/
- **Claude CLI Docs:** https://code.claude.com/docs/en/mcp
- **Cursor Discord:** Community support
- **GitHub Issues:** For specific package issues
- **Setup Guide:** `docs/setup/mcp-setup-guide.md`

---

## 🎯 Prevention Tips

1. **Always backup before changes:**
   ```bash
   cp .mcp.json .mcp.json.backup
   ```

2. **Keep both platform configs in sync:**
   - When adding API keys, update both `.mcp.json.windows` and `.mcp.json.wsl`
   - Use same key names across configs

3. **Test after every change:**
   - Quick test: "Read the README.md file"
   - Check `/mcp` status

4. **Document your changes:**
   - Note what API keys you've added
   - Note which servers you've enabled/disabled

5. **Use version control:**
   - Commit `.mcp.json.windows` and `.mcp.json.wsl` (safe - no keys)
   - Never commit `.mcp.json` or `.env` (has keys)

6. **Regular maintenance:**
   ```bash
   # Weekly: Clear caches
   npm cache clean --force
   
   # Monthly: Update packages
   npx clear-npx-cache
   ```

---

## 📊 Expected Behavior

After successful setup:

| Server | Expected Status | What It Means |
|--------|----------------|---------------|
| ripgrep | ✅ connected | Ready to search code |
| filesystem | ✅ connected | Ready to read files |
| context7 | ✅ connected | Has valid API key, ready |
| context7 | ⏳ waiting | Needs API key in .env |
| github | ✅ connected | Has valid token, ready |
| github | ⏳ waiting | Needs token in .env |
| notion | (not listed) | Properly disabled |
| browserstack | (not listed) | Properly disabled |

**Servers with `"disabled": true` should NOT appear in `/mcp` output at all.**

---

## 🔍 Still Stuck?

If you've tried everything here:

1. Check the setup guide: `docs/setup/mcp-setup-guide.md`
2. Search Cursor Discord for similar issues
3. Check MCP Registry for updated package names
4. Try the complete reset procedure above
5. Ask for help with gathered diagnostic info

**Remember:** Most issues are path format or API key problems. Double-check those first!

