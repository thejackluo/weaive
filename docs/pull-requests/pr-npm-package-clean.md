# PR #2: Feature – @thejackluo/docs-viewer npm Package

**Branch:** `feature/npm-package-clean` → `main`  
**Package:** [@thejackluo/docs-viewer v0.1.2](https://www.npmjs.com/package/@thejackluo/docs-viewer)  
**Commits:** 9 (8 feature, 1 fix)

---

## Overview

Introduces a standalone npm package for viewing Markdown documentation with a lightweight, zero-config setup. Provides a clean UI with dark mode, syntax highlighting, folder navigation, and both Node.js and Python server implementations. The package is already published to npm and used in the Weave docs workflow.

---

## Features

- GitHub-style Markdown rendering
- Dark mode with smooth transitions
- Syntax highlighting (Prism.js)
- Folder tree navigation
- Zero-config CLI usage (`docs-viewer` / `npx`)
- Cross-platform support (Windows, macOS, Linux)

---

## Server Implementations

- **Node.js server** (`lib/server.js`) – primary
- **Python server** (`lib/server.py`) – alternative
- Configurable port and docs directory
- Path traversal protection for file access

---

## Key Files

```
dev/docs-viewer-npm/
├── bin/docs-viewer.js        # CLI executable
├── lib/server.js             # Node.js server
├── lib/server.py             # Python server
├── public/index.html         # Viewer UI (single file)
├── test/basic.test.js        # Basic tests
├── package.json              # npm manifest
└── README.md                 # Documentation
```

---

## Code Review Fixes

**Commit:** `e242788`

- ✅ Corrected repository URLs (`jackluo` → `thejackluo`)
- ✅ Added path traversal protection to prevent access outside docs root
- ✅ Returns 403 Forbidden for invalid paths

---

## Notes

- Viewer UI is intentionally bundled into a single HTML file for simplicity
- Pagination not included yet; acceptable for small to medium doc sets

---

## How to Test

```bash
npm install -g @thejackluo/docs-viewer
cd your-project/docs
docs-viewer
# Visit http://localhost:3456
```

**Security check:**
```bash
curl http://localhost:3456/../../etc/passwd
# Should return 403 Forbidden
```

---

## Status

- ✅ Published to npm (v0.1.2)
- ✅ All review feedback addressed
- ✅ Ready to merge

---

## Links

- **npm Package:** https://www.npmjs.com/package/@thejackluo/docs-viewer
- **Repository:** https://github.com/thejackluo/weavelight/tree/main/dev/docs-viewer-npm

