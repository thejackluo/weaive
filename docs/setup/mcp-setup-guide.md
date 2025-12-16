# MCP Servers Setup Guide (Optimized for Windows)

## 🎯 Quick Overview

This guide sets up 6 MCP servers for WeaveLight with **minimal configuration** and **maximum security**.

**Time Required:** 20-30 minutes  
**Difficulty:** Easy  
**Prerequisites:** Node.js installed (check with `node --version`)

---

## 📋 What You're Setting Up

| Server | What It Does | Setup Time | Required? |
|--------|--------------|------------|-----------|
| **Ripgrep** | Fast code search | 0 min (works instantly) | ✅ Essential |
| **Filesystem** | Read project files | 0 min (works instantly) | ✅ Essential |
| **Context7** | Up-to-date docs | 3 min | ⭐ Highly Recommended |
| **GitHub** | Manage issues/PRs | 5 min | ⭐ Highly Recommended |
| **Notion** | Product docs | 5 min | 🔄 Optional |
| **BrowserStack** | Device testing | 5 min | 🔄 Optional |

---

## 🚀 Quick Start (3 Steps)

### Step 1: Create Environment File

Copy the template file to `.env` in your project root:

```bash
# In PowerShell, run:
cp docs/setup/env-example.txt .env
notepad .env
```

Or manually create `.env` and copy the contents from `docs/setup/env-example.txt`.

Save the file (empty values are fine for now - we'll fill them in next).

---

### Step 2: Update `.mcp.json`

Replace your entire `.mcp.json` with this optimized version:

```json
{
  "mcpServers": {
    "ripgrep": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-ripgrep"]
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

**Note:** `ripgrep` and `filesystem` work immediately! Others need API keys.

---

### Step 3: Get API Keys (Do This As You Need Them)

You don't need all keys at once. Start with these two:

#### A. Context7 (5 minutes) - For Library Docs

1. Go to https://console.upstash.com/
2. Sign up/login (free tier available)
3. Create a new Vector Database
4. Copy the API key
5. Paste into `.env` file: `CONTEXT7_API_KEY=your_key_here`
6. In `.mcp.json`, change `"disabled": false` to `"disabled": false` for context7

#### B. GitHub (3 minutes) - For Repo Management

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it: `WeaveLight MCP`
4. Select scopes:
   - ✅ `repo` (all)
   - ✅ `read:org`
5. Generate and copy token
6. Paste into `.env` file: `GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here`

---

## ✅ Test Your Setup

Restart Cursor completely, then try these commands:

### Test Ripgrep (Should Work Immediately)
```
Ask AI: "Use ripgrep to find all files with 'supabase' in them"
```

### Test Filesystem (Should Work Immediately)
```
Ask AI: "Read the README.md file and summarize it"
```

### Test Context7 (After Adding API Key)
```
Ask AI: "What's the latest React Native navigation best practice?"
```

### Test GitHub (After Adding Token)
```
Ask AI: "List all branches in this repository"
```

---

## 🎨 Optional Servers (Set Up Later)

### Notion Setup (5 minutes)

**When to use:** If you store product specs in Notion

1. Go to https://www.notion.so/my-integrations
2. Click "+ New integration"
3. Name: `WeaveLight MCP`
4. Select workspace → Submit
5. Copy "Internal Integration Token"
6. Paste into `.env`: `NOTION_API_KEY=your_token`
7. **Important:** Share your Notion pages with this integration:
   - Open page in Notion
   - Click "..." → "Add connections" → Select "WeaveLight MCP"
8. In `.mcp.json`, change notion's `"disabled": true` to `"disabled": false`

### BrowserStack Setup (5 minutes)

**When to use:** If you need real device testing

1. Sign up at https://www.browserstack.com/ (has free trial)
2. Go to https://www.browserstack.com/accounts/settings
3. Copy Username and Access Key
4. Paste into `.env`:
   ```
   BROWSERSTACK_USERNAME=your_username
   BROWSERSTACK_ACCESS_KEY=your_access_key
   ```
5. In `.mcp.json`, change browserstack's `"disabled": true` to `"disabled": false`

---

## 🔒 Security Checklist

- ✅ `.env` is in `.gitignore` (already done)
- ✅ `.mcp.json` is in `.gitignore` (already done)
- ✅ Never commit API keys to GitHub
- ✅ Use `.mcp.json.example` for team sharing (already created)

---

## 🐛 Troubleshooting

### "Server not appearing in Cursor"
1. **Restart Cursor completely** (close all windows)
2. Check `.mcp.json` is valid JSON (use a validator)
3. Check Cursor Developer Tools: Help → Toggle Developer Tools → Console

### "Command 'npx' not found"
- Install Node.js: https://nodejs.org/ (LTS version)
- Restart PowerShell after installation
- Verify: `node --version` and `npx --version`

### "Context7/GitHub not working"
- Verify API key is in `.env` (no quotes, no spaces)
- Verify `"disabled": false` in `.mcp.json`
- Check that `.env` is in the project root
- Restart Cursor

### "Filesystem can't find files"
- Check the path in `.mcp.json` matches your actual project path
- Use double backslashes: `C:\\Users\\...`
- Make sure path has no typos

---

## 📊 What's Enabled Right Now

After following Steps 1-2:
- ✅ **Ripgrep**: Ready to search code
- ✅ **Filesystem**: Ready to read files
- ⏳ **Context7**: Needs API key
- ⏳ **GitHub**: Needs token
- 💤 **Notion**: Disabled (enable when needed)
- 💤 **BrowserStack**: Disabled (enable when needed)

---

## 🎯 Recommended Setup Order

**Day 1** (Right now):
1. ✅ Ripgrep (works instantly)
2. ✅ Filesystem (works instantly)

**When you need library docs:**
3. 📚 Context7 (5 min setup)

**When you start using GitHub issues/PRs:**
4. 🐙 GitHub (3 min setup)

**When you have product specs in Notion:**
5. 📓 Notion (5 min setup)

**When you need device testing:**
6. 📱 BrowserStack (5 min setup)

---

## 🔄 Updating Servers

To update all servers to latest versions:

```powershell
# Clear npx cache
npx clear-npx-cache

# Or manually clear cache
npm cache clean --force
```

Servers auto-update on next use thanks to `npx -y` flag.

---

## 💡 Pro Tips

1. **Start with 2 servers** (ripgrep + filesystem) and add others as needed
2. **Context7 is a game-changer** for React Native development
3. **GitHub server** saves tons of time managing issues
4. **Use environment variables** - never hardcode keys
5. **Disable unused servers** - keeps Cursor fast

---

## 📚 Quick Command Reference

```bash
# Create .env file
notepad .env

# Edit .mcp.json
notepad .mcp.json

# Check Node.js version
node --version

# Check if npx works
npx --version

# View Cursor logs (for debugging)
# Help → Toggle Developer Tools → Console
```

---

## 🆘 Still Having Issues?

1. Check the [MCP Registry](https://registry.mcp.run/) for official servers
2. Verify package names haven't changed
3. Check Cursor Discord for community help
4. Review Cursor DevTools console for errors

---

## ✨ What's Next?

Once your servers are running:

1. Try the test commands above
2. Read `docs/mcp-quick-reference.md` for daily usage tips
3. Experiment with combining servers (e.g., "Search code with ripgrep, then explain using Context7")

**Remember:** You only need ripgrep and filesystem to start. Add others when you need them!
