# Tech-Spec: Publish Docs-Viewer as NPM Package

**Created:** 2025-12-17
**Status:** Ready for Development

## Overview

### Problem Statement

The docs-viewer is a lightweight, beautiful documentation viewer currently living in `dev/docs-viewer/`. It would be useful as a standalone npm package that can be installed and used in other projects to quickly spin up a documentation site from markdown files.

### Solution

Package the docs-viewer as an npm package (`@jackluo923/docs-viewer`) and publish it to the npm registry. The package will include:
- The HTML viewer interface
- Node.js server script
- CLI command for easy startup
- Simple installation and usage

### Scope (In/Out)

**In Scope:**
- Package structure (package.json, bin entry, files config)
- Basic npm package configuration
- Simple README with installation/usage instructions
- Publishing to npm registry (public)

**Out of Scope:**
- Python server (focus on Node.js only for simplicity)
- Build process or bundling (ship as-is, no compilation)
- Advanced configuration options
- TypeScript definitions
- Tests (level 0 experimental package)
- CI/CD automation

## Context for Development

### Codebase Patterns

Current docs-viewer structure:
```
dev/docs-viewer/
├── index.html              # Main viewer interface (2036 lines)
├── scripts/
│   ├── server.js          # Node.js HTTP server (192 lines)
│   ├── server.py          # Python server (skip for npm)
│   ├── serve.sh           # Shell launcher
│   └── serve.ps1          # PowerShell launcher
├── README.md              # Local documentation
├── USAGE.md               # Usage guide
└── QUICK_REFERENCE.md     # Quick reference
```

### Files to Reference

- `dev/docs-viewer/index.html` - Core viewer (no changes needed)
- `dev/docs-viewer/scripts/server.js` - Server logic (may need minor path adjustments)
- `dev/docs-viewer/README.md` - Basis for npm README

### Technical Decisions

**Package Name:** `@jackluo923/docs-viewer`
- Scoped to user namespace
- Clear, descriptive name
- Author: Jack Luo

**Entry Points:**
- **Bin command:** `docs-viewer` → runs the server
- **Main export:** Server code (for programmatic use if needed)

**File Structure:**
```
@jackluo923/docs-viewer/
├── package.json
├── README.md              # New: npm-focused README
├── bin/
│   └── docs-viewer.js     # CLI entry point
├── lib/
│   └── server.js          # Core server code
└── public/
    └── index.html         # Viewer interface
```

**Dependencies:**
- None! Pure Node.js standard library (http, fs, path)

**Registry:** npm (public)

## Implementation Plan

### Tasks

- [ ] **Task 1:** Create package structure
  - Create root-level package directory (or use `dev/docs-viewer` directly)
  - Organize files into `bin/`, `lib/`, `public/`

- [ ] **Task 2:** Create package.json
  - Set name: `@jackluo923/docs-viewer`
  - Set version: `0.1.0` (experimental)
  - Set author: `Jack Luo`
  - Set bin: `{ "docs-viewer": "./bin/docs-viewer.js" }`
  - Set files: `["bin", "lib", "public", "README.md"]`
  - Set main: `./lib/server.js`
  - Add keywords, description, license (MIT)
  - Set repository field (optional but recommended)

- [ ] **Task 3:** Create bin/docs-viewer.js CLI entry point
  - Add shebang: `#!/usr/bin/env node`
  - Import server from `../lib/server.js`
  - Start server with default config
  - Handle command-line arguments (optional: port override)

- [ ] **Task 4:** Adapt lib/server.js for npm package context
  - Adjust paths to work when installed as npm package
  - Use `__dirname` relative to package location
  - Export server creation function for programmatic use

- [ ] **Task 5:** Write npm-focused README.md
  - Installation: `npm install -g @jackluo923/docs-viewer` (global) or `npx @jackluo923/docs-viewer` (one-time)
  - Usage: `docs-viewer` (runs server on port 3030)
  - Features: bullet list of key features
  - Requirements: Node.js 14+
  - Keep it simple and concise (< 100 lines)

- [ ] **Task 6:** Create one basic test
  - Test file: `test/basic.test.js`
  - Simple smoke test using plain Node.js assert
  - Test that server can start and find docs/

- [ ] **Task 7:** Test package locally
  - Use `npm link` to test CLI command
  - Verify server starts correctly
  - Verify viewer loads and works
  - Run basic test: `node test/basic.test.js`

- [ ] **Task 8:** Publish to npm
  - Run `npm login` (if not already logged in)
  - Run `npm publish --access public` (scoped packages default to private)
  - Verify package appears on npmjs.com

### Acceptance Criteria

- [ ] **AC1:** Package structure is clean and organized
  - Given the package files are organized into bin/, lib/, public/
  - When I inspect the package structure
  - Then all files are in their logical locations

- [ ] **AC2:** CLI command works globally
  - Given I install the package globally: `npm install -g @jackluo923/docs-viewer`
  - When I run `docs-viewer` from any directory
  - Then the server starts on port 3030 and serves the docs viewer

- [ ] **AC3:** npx one-time usage works
  - Given I have not installed the package
  - When I run `npx @jackluo923/docs-viewer` in a project with docs/
  - Then the server starts and serves documentation

- [ ] **AC4:** Package is published to npm
  - Given I have run `npm publish --access public`
  - When I visit https://www.npmjs.com/package/@jackluo923/docs-viewer
  - Then the package page exists and shows correct version/description

- [ ] **AC5:** README is clear and actionable
  - Given a user reads the npm README
  - When they follow the installation and usage instructions
  - Then they can successfully run the docs-viewer in < 2 minutes

## Additional Context

### Dependencies

**Runtime Dependencies:** None
- Uses only Node.js built-in modules (http, fs, path)

**Dev Dependencies:** None needed for level 0 package

### Testing Strategy

**One Basic Test:**
- `test/basic.test.js` - Simple smoke test
- Just verify server.js can be loaded
- No test framework - plain Node.js assert
- Run with: `node test/basic.test.js`

**Manual Testing:**
1. Test `npm link` in package directory
2. Run `docs-viewer` from different directories
3. Verify server finds docs/ folder correctly
4. Test with sample markdown files

### Notes

**Path Resolution Strategy:**
- Server should look for `docs/` folder in current working directory (where user runs command)
- Viewer HTML (index.html) should be served from package installation location

**Version Strategy:**
- Start with `0.1.0` to signal experimental
- Semantic versioning going forward

**Publishing Checklist:**
1. Ensure `.npmignore` or `files` field excludes unnecessary files
2. Test with `npm pack` to inspect package contents
3. Login to npm: `npm login`
4. Publish: `npm publish --access public`
5. Verify on npmjs.com
6. Test installation: `npm install -g @jackluo923/docs-viewer`

**Future Enhancements (Post-Level 0):**
- Configuration file support (custom port, docs directory)
- TypeScript definitions
- Watch mode for auto-reload
- Custom theme support
- Better error handling
