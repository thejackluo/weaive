# Weave

Turn vague goals into daily wins, proof, and a stronger identity in 10 days.

## Tech Stack

- **Frontend:** React Native mobile app (iOS App Store)
- **Backend:** Python FastAPI (deployed on Railway)
- **Database:** Supabase (Postgres + Auth + Storage)
- **Push Notifications:** iOS APNs
- **Analytics:** PostHog

## Project Structure

- `docs/` - Product and technical documentation
  - `idea/` - Original product specifications  
  - `setup/` - Setup guides
    - **`mcp-setup-guide.md`** - MCP servers setup (start here!)
    - `env-example.txt` - Environment variables template
  - `dev/` - Developer resources
    - `mcp-quick-reference.md` - Daily MCP usage reference
- `scripts/` - Utility scripts
  - `verify-mcp-setup.ps1` - Verify MCP configuration
- `.cursor/.cursor-changes` - Project changelog

## 🚀 Quick Start: MCP Servers

### Get AI Development Tools Running in 2 Minutes

**Read the guide:** [`docs/setup/mcp-setup-guide.md`](docs/setup/mcp-setup-guide.md)

**TL;DR:**
1. Copy config from guide to `.mcp.json`
2. Restart Cursor
3. Test: `"Read README.md and summarize it"`
4. **Done!** 2 servers work instantly. Add more as needed.

### 🤖 What You Get

| Server | Status | What It Does |
|--------|--------|--------------|
| **Filesystem** | ✅ Works instantly | Read project files |
| **Everything** | ✅ Works instantly | Code search, git ops, file operations |
| **Context7** | ⚙️ 5 min setup | Up-to-date docs (React Native, Expo, Supabase) |
| **GitHub** | ⚙️ 3 min setup | Issues, PRs, branches |
| **Notion** | 🔄 Optional | Product specs |
| **BrowserStack** | 🔄 Optional | Device testing |

**📖 Full guide:** [`docs/setup/mcp-setup-guide.md`](docs/setup/mcp-setup-guide.md)  
**📚 Daily reference:** [`docs/dev/mcp-quick-reference.md`](docs/dev/mcp-quick-reference.md)

