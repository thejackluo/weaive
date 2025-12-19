# MCP Servers Quick Reference

Quick reference for your 6 MCP servers. Bookmark this!

---

## 🔍 Ripgrep MCP
**Fast local codebase search**

**Use when:** You need to find code patterns, imports, function usage, TODOs

**Example queries:**
```
"Find all React components that use useState"
"Search for Supabase client initialization"
"Show me all TODO comments"
"Find where UserProfile component is imported"
```

**No setup required** - works out of the box!

---

## 📚 Context7
**Up-to-date library documentation**

**Use when:** You need current API docs for React Native, Expo, Supabase, etc.

**Example queries:**
```
"What's the latest Expo Router file-based routing syntax?"
"Show me React Navigation v6 deep linking configuration"
"How do I use Supabase real-time subscriptions?"
"What's the current React Native AsyncStorage API?"
```

**Why it matters:** Stop using outdated blog posts. Get current docs.

---

## 📁 Filesystem MCP
**Scoped read access to your repo**

**Use when:** AI needs to read your code, docs, configs

**Example queries:**
```
"Read mvp.md and summarize the core features"
"Show me the structure of the components folder"
"What's in my backend.md architecture doc?"
"Read package.json and list all dependencies"
```

**Security:** Only accesses folders you specify (project root + docs)

---

## 🐙 GitHub MCP
**Repository operations**

**Use when:** You want to automate repo workflows, manage issues, create PRs

**Example queries:**
```
"List all open issues in this repository"
"Create an issue: Implement user authentication"
"Show me the last 10 commits on main"
"Create a PR for the auth-feature branch"
"Show me diff for PR #42"
```

**Pro tip:** Great for automating repetitive repo tasks

---

## 📱 BrowserStack MCP
**Real-device testing**

**Use when:** You need to test on actual iOS/Android devices

**Example queries:**
```
"List available iOS devices for testing"
"Run smoke tests on iPhone 15 Pro and Pixel 9"
"Test the app on iPad Air and show me screenshots"
"What devices support iOS 17?"
```

**Use case:** "Run tests on real devices, get failures + screenshots"

---

## 📓 Notion MCP
**Product specs & documentation**

**Use when:** Accessing product roadmaps, specs, decisions, launch notes

**Example queries:**
```
"Search Notion for the product roadmap"
"Get the latest sprint planning notes"
"Find decision logs about authentication approach"
"Update the launch checklist in Notion"
```

**Setup tip:** Remember to share Notion pages with your integration!

---

## 🎯 Decision Matrix

| What you need | Use this server |
|--------------|----------------|
| Find code in repo | **Ripgrep** |
| Current library docs | **Context7** |
| Read your own files | **Filesystem** |
| Manage issues/PRs | **GitHub** |
| Test on real devices | **BrowserStack** |
| Access product specs | **Notion** |

---

## 💡 Pro Workflow Examples

### Feature Development Flow
1. **Notion** → Read feature spec
2. **Context7** → Check current API docs for libraries
3. **Ripgrep** → Find similar implementations in codebase
4. **Filesystem** → Read architecture docs
5. **GitHub** → Create issue and track progress
6. **BrowserStack** → Test on real devices before PR

### Bug Investigation Flow
1. **Ripgrep** → Find where error occurs
2. **Filesystem** → Read related components
3. **GitHub** → Check recent commits/PRs
4. **Context7** → Verify API usage is correct
5. **BrowserStack** → Reproduce on specific device

### Code Review Flow
1. **GitHub** → Get PR diff
2. **Ripgrep** → Find related code patterns
3. **Filesystem** → Check architecture compliance
4. **Context7** → Verify library usage is current

---

## 🚀 Next-Level Combinations

**"Contextual Search"**
```
"Use Ripgrep to find all Supabase queries, 
then use Context7 to check if we're using 
the latest API patterns"
```

**"Automated QA"**
```
"Use Filesystem to read test specs,
then use BrowserStack to run those tests
on iPhone 15 and Pixel 9"
```

**"Documentation Sync"**
```
"Use Ripgrep to find all API endpoints,
then update the Notion API documentation
with the current list"
```

---

## 🔧 Troubleshooting Quick Fixes

**Server not showing up:**
- Restart Cursor completely
- Check `.mcp.json` syntax (use JSON validator)
- Check DevTools console (Help > Toggle Developer Tools)

**Authentication errors:**
- Verify API keys are correct (no extra spaces)
- Check token permissions/scopes
- For Notion: ensure pages are shared with integration

**Rate limiting:**
- Wait a few minutes
- Consider upgrading to paid tier
- For GitHub: check your token's rate limit status

---

## 📋 Daily Checklist

Morning startup:
- [ ] Context7 for any new library updates
- [ ] GitHub for overnight issues/PRs
- [ ] Notion for sprint priorities

During development:
- [ ] Ripgrep for finding code patterns
- [ ] Filesystem for reading your docs
- [ ] Context7 for API verification

Before committing:
- [ ] Ripgrep for TODOs and console.logs
- [ ] GitHub to check branch status
- [ ] BrowserStack for device testing

---

**Remember:** These servers work best when combined. Don't just use one at a time!

**Questions?** See the full setup guide: `docs/mcp-setup-guide.md`

