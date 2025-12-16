# MCP Servers Setup Guide

Complete guide for setting up and managing MCP servers for WeaveLight on Windows and WSL/Linux.

**Time Required:** 20-30 minutes  
**Difficulty:** Easy  
**Prerequisites:** Node.js installed (check with `node --version`)

---

## 📋 What You're Setting Up

| Server | What It Does | Setup Time | Required? |
|--------|--------------|------------|-----------|
| **Ripgrep** | Fast code search | 0 min (works instantly) | ✅ Essential |
| **Filesystem** | Read project files | 0 min (works instantly) | ✅ Essential |
| **Context7** | Up-to-date library docs | 3 min | ⭐ Highly Recommended |
| **GitHub** | Manage issues/PRs | 5 min | ⭐ Highly Recommended |
| **Notion** | Product docs | 5 min | 🔄 Optional (disabled by default) |
| **BrowserStack** | Device testing | 5 min | 🔄 Optional (disabled by default) |

---

## 🚀 Quick Start

### Step 1: Choose Your Configuration

We have **platform-specific configuration files** ready for you:

| File | For | Paths |
|------|-----|-------|
| `.mcp.json.windows` | Windows PowerShell | `C:\\Users\\...` |
| `.mcp.json.wsl` | WSL/Linux | `/mnt/c/Users/...` |

**Copy the right one to `.mcp.json`:**

```bash
# For WSL/Linux (e.g., running Claude CLI from WSL)
cp .mcp.json.wsl .mcp.json

# For Windows PowerShell
# (In PowerShell)
Copy-Item .mcp.json.windows .mcp.json
```

**Note:** `.mcp.json` is in `.gitignore` to protect API keys. The template files (`.mcp.json.windows`, `.mcp.json.wsl`) are safe to commit.

---

### Step 2: Create Environment File (Optional)

Only needed if you want Context7 or GitHub servers:

```bash
# Create .env file
notepad .env
```

Add your API keys:
```env
CONTEXT7_API_KEY=your_key_here
GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here
NOTION_API_KEY=your_key_here
BROWSERSTACK_USERNAME=your_username_here
BROWSERSTACK_ACCESS_KEY=your_key_here
```

**Don't have keys yet?** That's fine! Ripgrep and Filesystem work without any configuration.

---

### Step 3: Restart and Test

```bash
# If using Claude CLI
Ctrl+C  # Exit
claude  # Restart

# If using Cursor
# Restart Cursor completely (close all windows)
```

**Test your setup:**

```
# Test ripgrep
"Find all files that mention 'supabase'"

# Test filesystem
"Read the README.md file and summarize it"
```

---

## 🔧 Complete Configuration Reference

### Full Configuration for WSL/Linux

```json
{
  "mcpServers": {
    "ripgrep": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-ripgrep", "/mnt/c/Users/Jack Luo/Desktop/(local) github software/weavelight"]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/mnt/c/Users/Jack Luo/Desktop/(local) github software/weavelight"
      ]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "env": {
        "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}"
      },
      "disabled": false
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      },
      "disabled": false
    },
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/mcp-server-notion"],
      "env": {
        "NOTION_API_KEY": "${NOTION_API_KEY}"
      },
      "disabled": true
    },
    "browserstack": {
      "command": "npx",
      "args": ["-y", "@browserstack/mcp-server-browserstack"],
      "env": {
        "BROWSERSTACK_USERNAME": "${BROWSERSTACK_USERNAME}",
        "BROWSERSTACK_ACCESS_KEY": "${BROWSERSTACK_ACCESS_KEY}"
      },
      "disabled": true
    }
  }
}
```

### Full Configuration for Windows PowerShell

```json
{
  "mcpServers": {
    "ripgrep": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-ripgrep", "C:\\Users\\Jack Luo\\Desktop\\(local) github software\\weavelight"]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\Jack Luo\\Desktop\\(local) github software\\weavelight"
      ]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "env": {
        "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}"
      },
      "disabled": false
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      },
      "disabled": false
    },
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/mcp-server-notion"],
      "env": {
        "NOTION_API_KEY": "${NOTION_API_KEY}"
      },
      "disabled": true
    },
    "browserstack": {
      "command": "npx",
      "args": ["-y", "@browserstack/mcp-server-browserstack"],
      "env": {
        "BROWSERSTACK_USERNAME": "${BROWSERSTACK_USERNAME}",
        "BROWSERSTACK_ACCESS_KEY": "${BROWSERSTACK_ACCESS_KEY}"
      },
      "disabled": true
    }
  }
}
```

**Key Differences:**
- **Windows:** `C:\\Users\\...` (double backslashes)
- **WSL/Linux:** `/mnt/c/Users/...` (Unix-style path to mounted Windows drive)

---

## 🔑 Getting API Keys

### Context7 (5 minutes) - For Library Documentation

Context7 provides up-to-date documentation for React Native, Expo, and other libraries.

1. Go to https://console.upstash.com/
2. Sign up/login (free tier available)
3. Create a new Vector Database
4. Copy the API key
5. Add to `.env`: `CONTEXT7_API_KEY=your_key_here`
6. Restart Claude CLI/Cursor

### GitHub (3 minutes) - For Repository Management

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it: `WeaveLight MCP`
4. Select scopes:
   - ✅ `repo` (all)
   - ✅ `read:org`
5. Generate and copy token
6. Add to `.env`: `GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here`
7. Restart Claude CLI/Cursor

### Notion (Optional) - For Product Documentation

1. Go to https://www.notion.so/my-integrations
2. Click "+ New integration"
3. Name: `WeaveLight MCP`
4. Select workspace → Submit
5. Copy "Internal Integration Token"
6. Add to `.env`: `NOTION_API_KEY=your_token`
7. **Important:** Share your Notion pages with this integration
8. In `.mcp.json`, change notion's `"disabled": true` to `"disabled": false`
9. Restart Claude CLI/Cursor

### BrowserStack (Optional) - For Device Testing

1. Sign up at https://www.browserstack.com/ (has free trial)
2. Go to https://www.browserstack.com/accounts/settings
3. Copy Username and Access Key
4. Add to `.env`:
   ```
   BROWSERSTACK_USERNAME=your_username
   BROWSERSTACK_ACCESS_KEY=your_access_key
   ```
5. In `.mcp.json`, change browserstack's `"disabled": true` to `"disabled": false`
6. Restart Claude CLI/Cursor

---

## 🔄 Switching Between Windows and WSL

### Check Current Environment

**WSL/Linux:**
```bash
pwd
# Should show: /mnt/c/Users/Jack Luo/Desktop/(local) github software/weavelight
```

**Windows:**
```powershell
$pwd
# Should show: C:\Users\Jack Luo\Desktop\(local) github software\weavelight
```

### Switch Configurations

**From WSL to Windows:**
```bash
# Backup current config
cp .mcp.json .mcp.json.backup

# Use Windows config
cp .mcp.json.windows .mcp.json
```

**From Windows to WSL:**
```powershell
# Backup current config
Copy-Item .mcp.json .mcp.json.backup

# Use WSL config
Copy-Item .mcp.json.wsl .mcp.json
```

### Verify Config Matches Environment

```bash
# Check if using WSL paths
grep "/mnt/c" .mcp.json && echo "✅ Using WSL paths" || echo "❌ Using Windows paths"
```

```powershell
# Check if using Windows paths
Select-String -Pattern "C:\\\\" .mcp.json
# If found: Using Windows paths (correct for Windows)
# If not found: Using WSL paths (wrong for Windows)
```

### Keep Both Configs in Sync

When you add/change API keys, update both config files:

```bash
# Edit Windows config
notepad .mcp.json.windows

# Edit WSL config
notepad .mcp.json.wsl
```

Or use search/replace to update paths only, keeping keys the same.

---

## 🎛️ Managing Servers

### Enable a Disabled Server

1. Edit `.mcp.json`
2. Find the server (e.g., `notion`)
3. Change `"disabled": true` to `"disabled": false`
4. Make sure you have the required API keys in `.env`
5. Restart Claude CLI/Cursor

### Disable an Enabled Server

1. Edit `.mcp.json`
2. Find the server
3. Add `"disabled": true` to the server config:
   ```json
   "context7": {
     "command": "npx",
     "args": ["-y", "@upstash/context7-mcp"],
     "env": {
       "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}"
     },
     "disabled": true  // ← Add this line
   }
   ```
4. Restart Claude CLI/Cursor

### Check Server Status

**In Claude CLI:**
```
/mcp
```

**Expected output:**
- ✅ Green/connected: Server is working
- ⏳ Waiting: Server needs API key
- ❌ Failed: Configuration problem (see troubleshooting)
- (No entry): Server is disabled

---

## ✅ Testing Your Setup

### Test Ripgrep (Code Search)

```
"Find all TypeScript files that use useState"
"Search for all components that import Button"
"Show me where we use Supabase"
```

### Test Filesystem (File Reading)

```
"Read the README.md file and summarize the project"
"What's in docs/architecture.md?"
"Show me the contents of package.json"
```

### Test Context7 (Library Docs)

```
"What's the latest Expo Router syntax for tabs?"
"How do I use TanStack Query with React Native?"
"Show me best practices for Supabase RLS"
```

### Test GitHub (Repository Management)

```
"List all open issues in this repository"
"Show me recent commits on the main branch"
"What branches exist in this repo?"
```

---

## 🔒 Security Best Practices

1. ✅ **Never commit `.mcp.json`** - Contains API keys (already in `.gitignore`)
2. ✅ **Never commit `.env`** - Contains API keys (already in `.gitignore`)
3. ✅ **Commit template configs** - `.mcp.json.windows` and `.mcp.json.wsl` are safe (use environment variables)
4. ✅ **Use environment variables** - Never hardcode keys in config files
5. ✅ **Rotate keys regularly** - Especially if shared or exposed
6. ✅ **Use minimal permissions** - GitHub tokens should only have necessary scopes

---

## 🐛 Quick Troubleshooting

### Servers Not Appearing

1. Restart Cursor/Claude CLI completely
2. Check `.mcp.json` is valid JSON (use a validator)
3. Look at console: Help → Toggle Developer Tools → Console

### "Command 'npx' not found"

- Install Node.js: https://nodejs.org/ (LTS version)
- Restart terminal after installation
- Verify: `node --version` && `npx --version`

### Path-Related Errors

- **WSL users:** Make sure paths start with `/mnt/c/`
- **Windows users:** Make sure paths use `C:\\` (double backslashes)
- Check which environment you're in: `pwd` (WSL) or `$pwd` (PowerShell)

### API Key Not Working

- Check `.env` is in project root (same folder as `.mcp.json`)
- Keys should have no quotes: `CONTEXT7_API_KEY=abc123` not `CONTEXT7_API_KEY="abc123"`
- Check for typos in key names
- Restart after adding keys

### Server Still Failing After Fix

```bash
# Clear MCP cache
rm -rf ~/.cache/claude-cli-nodejs  # WSL/Linux
# Or
Remove-Item -Recurse ~/.cache/claude-cli-nodejs  # PowerShell

# Clear npm cache
npm cache clean --force

# Restart
claude
```

**For detailed troubleshooting, see `docs/setup/mcp-troubleshooting.md`**

---

## 🔄 Updating Servers

MCP servers auto-update thanks to `npx -y` flag, but you can force updates:

```bash
# Clear npx cache
npx clear-npx-cache

# Or clear npm cache
npm cache clean --force
```

Next time you use Cursor/Claude CLI, the latest versions will download automatically.

---

## 💡 Pro Tips

1. **Start minimal** - Just use ripgrep + filesystem at first, add others as needed
2. **Context7 is a game-changer** - Saves tons of time looking up React Native docs
3. **GitHub server is underrated** - Manages issues/PRs without leaving your editor
4. **Keep both configs updated** - When adding keys, update both `.mcp.json.windows` and `.mcp.json.wsl`
5. **Backup before switching** - Always `cp .mcp.json .mcp.json.backup` before changing configs
6. **Test after changes** - Quick test: "Read the README.md file"
7. **Disable unused servers** - Keeps MCP initialization fast

---

## 📚 Command Reference

```bash
# === Setup ===
# Copy correct config
cp .mcp.json.wsl .mcp.json          # WSL/Linux
Copy-Item .mcp.json.windows .mcp.json  # Windows

# Create .env file
notepad .env

# === Testing ===
# Check environment
pwd                                  # WSL/Linux
$pwd                                # PowerShell

# Verify config
cat .mcp.json                       # WSL/Linux
Get-Content .mcp.json               # PowerShell

# Check which paths are used
grep "/mnt/c" .mcp.json             # WSL/Linux

# === Troubleshooting ===
# Clear caches
rm -rf ~/.cache/claude-cli-nodejs   # WSL/Linux
npm cache clean --force             # Both

# Check Node.js
node --version
npx --version

# === Maintenance ===
# Backup config
cp .mcp.json .mcp.json.backup       # WSL/Linux
Copy-Item .mcp.json .mcp.json.backup  # PowerShell

# Update both configs (example)
notepad .mcp.json.windows
notepad .mcp.json.wsl
```

---

## 🎯 Recommended Setup Order

**Day 1** (Right now):
1. ✅ Copy correct config (`.mcp.json.windows` or `.mcp.json.wsl`)
2. ✅ Test ripgrep + filesystem (no keys needed)

**When you need library docs:**
3. 📚 Add Context7 API key (5 min setup)

**When you start using GitHub:**
4. 🐙 Add GitHub token (3 min setup)

**Later, if needed:**
5. 📓 Enable Notion (add key + enable in config)
6. 📱 Enable BrowserStack (add credentials + enable in config)

---

## 📊 What's Working Right Now

After completing setup:

| Server | Status | Notes |
|--------|--------|-------|
| ✅ **Ripgrep** | Working | No keys needed |
| ✅ **Filesystem** | Working | No keys needed |
| ⏳ **Context7** | Needs key | Optional but recommended |
| ⏳ **GitHub** | Needs token | Optional but recommended |
| 💤 **Notion** | Disabled | Enable when needed |
| 💤 **BrowserStack** | Disabled | Enable when needed |

---

## 🆘 Need More Help?

1. **Detailed troubleshooting:** See `docs/setup/mcp-troubleshooting.md`
2. **MCP Registry:** https://registry.mcp.run/ for more servers
3. **Claude CLI Docs:** https://code.claude.com/docs/en/mcp
4. **Cursor Discord:** Community help and support
5. **Check logs:** Help → Toggle Developer Tools → Console (in Cursor)

---

## ✨ What's Next?

Once your servers are running:

1. Try the test commands above
2. Read `docs/dev/mcp-quick-reference.md` for daily usage patterns
3. Experiment with combining servers:
   - "Find all components with ripgrep, then ask Context7 about React patterns"
   - "Read architecture.md with filesystem, then help me implement it"
4. Set up any optional servers you need (Notion, BrowserStack)

**Remember:** You only need ripgrep and filesystem to start. Add others when you need them!
