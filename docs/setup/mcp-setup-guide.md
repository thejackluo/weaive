# MCP Servers Setup Guide

This guide will walk you through setting up all 6 MCP servers for the WeaveLight project.

## Overview

Your `.mcp.json` has been configured with the following servers:

1. **Context7** - Up-to-date library documentation
2. **Ripgrep** - Fast local codebase search
3. **Filesystem** - Scoped read access to your repo
4. **GitHub** - Repository operations (PRs, issues, diffs)
5. **BrowserStack** - Real-device testing
6. **Notion** - Product specs and documentation

## Quick Start Checklist

- [ ] Context7 API Key
- [ ] GitHub Personal Access Token
- [ ] BrowserStack credentials
- [ ] Notion Integration Token
- [ ] Restart Cursor after configuration

---

## 1. Context7 Setup

**Purpose:** Access up-to-date documentation for React Native, Expo, Supabase, etc.

### Steps:

1. Visit [Context7 website](https://context7.com) or [Upstash Console](https://console.upstash.com/)
2. Sign up/login and create an API key
3. Copy your API key
4. In `.mcp.json`, replace `YOUR_CONTEXT7_API_KEY_HERE` with your actual key

**Test it:** Ask the AI "What's the latest React Navigation v6 deep linking syntax?"

---

## 2. Ripgrep MCP Setup

**Purpose:** Lightning-fast codebase search using ripgrep.

### Steps:

**No configuration needed!** This server works out of the box.

**Test it:** Ask the AI "Search for all useState hooks in the codebase"

**Note:** Ripgrep must be installed on your system. If not:
- Windows: `choco install ripgrep` or download from [GitHub releases](https://github.com/BurntSushi/ripgrep/releases)
- Or use `npx` which handles it automatically

---

## 3. Filesystem MCP Setup

**Purpose:** Give AI scoped read-only access to your repo and docs.

### Steps:

**Already configured!** The server has access to:
- Your project root: `C:\Users\Jack Luo\Desktop\(local) github software\weavelight`
- Your docs folder: `C:\Users\Jack Luo\Desktop\(local) github software\weavelight\docs`

**Security Note:** Only the specified folders are accessible. Your entire machine is NOT exposed.

**Test it:** Ask the AI "Read my mvp.md file and summarize the core features"

---

## 4. GitHub MCP Setup

**Purpose:** Create PRs, manage issues, review diffs, automate repo workflows.

### Steps:

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name: "MCP Server - WeaveLight"
4. Select scopes:
   - `repo` (full control of private repositories)
   - `read:org` (if you're using an organization)
   - `workflow` (if you want to trigger GitHub Actions)
5. Generate token and **copy it immediately** (you won't see it again!)
6. In `.mcp.json`, replace `YOUR_GITHUB_PAT_HERE` with your token

**Security:** Never commit your `.mcp.json` with real tokens. Add it to `.gitignore` if needed.

**Test it:** Ask the AI "List all open issues in this repository"

---

## 5. BrowserStack MCP Setup

**Purpose:** Run real-device tests and get screenshots without living in dashboards.

### Steps:

1. Sign up at [BrowserStack](https://www.browserstack.com/users/sign_up)
2. Go to [Account Settings > Access Key](https://www.browserstack.com/accounts/settings)
3. Copy your **Username** and **Access Key**
4. In `.mcp.json`, replace:
   - `YOUR_BROWSERSTACK_USERNAME` with your username
   - `YOUR_BROWSERSTACK_ACCESS_KEY` with your access key

**Use Case Example:** "Run smoke tests on iPhone 15 Pro and Pixel 9, show me failures with screenshots"

**Test it:** Ask the AI "List available BrowserStack devices for iOS"

---

## 6. Notion MCP Setup

**Purpose:** Access product specs, decisions, prompts, and launch notes from Notion.

### Steps:

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Name it: "MCP Server - WeaveLight"
4. Select your workspace
5. Set capabilities:
   - Read content: ✅
   - Update content: ✅ (if you want AI to update pages)
   - Insert content: ✅ (if needed)
6. Submit and copy the "Internal Integration Token"
7. **Important:** Share your Notion pages/databases with this integration:
   - Open the page in Notion
   - Click "..." → "Add connections" → Select your integration
8. In `.mcp.json`, replace `YOUR_NOTION_INTEGRATION_TOKEN` with your token

**Test it:** Ask the AI "Search Notion for product roadmap updates"

---

## Security Best Practices

### Option 1: Environment Variables (Recommended)

Instead of hardcoding keys in `.mcp.json`, use environment variables:

1. Create a `.env` file in your project root (add to `.gitignore`)
2. Add your secrets:

```env
CONTEXT7_API_KEY=your_actual_key
GITHUB_PERSONAL_ACCESS_TOKEN=your_actual_token
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_key
NOTION_API_KEY=your_token
```

3. Update `.mcp.json` to reference env vars (syntax depends on your shell)

### Option 2: Git Ignore .mcp.json

If you must keep keys in `.mcp.json`:

1. Add to `.gitignore`:
```
.mcp.json
```

2. Create `.mcp.json.example` with placeholder values for team members:
```json
{
  "mcpServers": {
    "context7": {
      "env": {
        "CONTEXT7_API_KEY": "get_from_context7_console"
      }
    }
  }
}
```

---

## Troubleshooting

### Server not appearing in Cursor

1. **Restart Cursor completely** (close all windows)
2. Check `.mcp.json` syntax with a JSON validator
3. Open Cursor DevTools (Help > Toggle Developer Tools) and check Console for errors

### "Command not found" errors

- Make sure `npx` is available: `npx --version`
- If not, install Node.js from [nodejs.org](https://nodejs.org/)

### Rate limiting issues

- Context7, GitHub, BrowserStack, and Notion all have rate limits
- For heavier usage, consider upgrading to paid tiers
- Use HF_TOKEN for Hugging Face tools to avoid anonymous rate limits

### Ripgrep not working

- Install ripgrep: `choco install ripgrep` (Windows)
- Or download from [GitHub releases](https://github.com/BurntSushi/ripgrep/releases)

---

## Next Steps

1. ✅ Get all API keys and tokens
2. ✅ Update `.mcp.json` with real credentials
3. ✅ Add `.mcp.json` to `.gitignore` (or use env vars)
4. ✅ Restart Cursor
5. ✅ Test each server with simple queries
6. 🚀 Start building with AI that actually knows your codebase and tools!

---

## Useful Commands to Test

Once everything is set up, try these:

**Ripgrep:**
- "Find all TODO comments in the codebase"
- "Search for Supabase client initialization"

**Filesystem:**
- "Read backend.md and list all API endpoints"
- "Show me the structure of the docs folder"

**GitHub:**
- "Create an issue: Add user authentication flow"
- "Show me the last 5 commits on main branch"

**Context7:**
- "What's the latest Expo Router navigation syntax?"
- "Show me Supabase real-time subscription examples"

**BrowserStack:**
- "List available Android devices for testing"
- "Run app on iPhone 14 and capture screenshot"

**Notion:**
- "Get the latest product roadmap from Notion"
- "Update sprint status in Notion database"

---

## Resources

- [MCP Registry](https://registry.mcp.run/) - Official server directory
- [Context7 Docs](https://context7.com/docs)
- [GitHub MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
- [Filesystem MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- [Notion API](https://developers.notion.com/)
- [BrowserStack API](https://www.browserstack.com/docs/automate/api-reference)

---

**Questions?** Check the MCP documentation or ask in the Cursor Discord community.

