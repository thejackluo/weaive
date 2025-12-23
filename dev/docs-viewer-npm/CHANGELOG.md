# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2025-01-XX

### Added

- **Document Status Workflow** - Track documents as "In Progress", "Archived", or "Finished" with visual status buttons
- **Priority Levels** - Mark documents as High (red !), Medium (orange), or Low (gray ↓) for better organization
- **Folder Completion Tracking** - Automatic badges showing progress (e.g., "3/10" or "✓" when complete) on folder headers
- **Status & Priority Badges** - Color-coded indicators in navigation sidebar for quick overview
- **Library Stats Dashboard** - Real-time stats card showing total documents, words, lines, and reading time
- **Server-side Stats API** - New `/api/stats` endpoint for accurate aggregate statistics calculation
- **Automatic Line Tracking** - Server automatically calculates and includes line counts for all documents
- **GitHub Packages Support** - Configured for publishing to GitHub Packages via `publishConfig` and `.npmrc`

### Changed

- Bumped version to `0.1.3` (aligns npm package with latest Docs Viewer dashboard features)
- Kept canonical repository as `thejackluo/weavelight`
- Stats calculation now uses server-side API for better performance and accuracy
- Document completion now automatically sets status to "Finished"

## [0.0.3] - Internal (not published)

### Notes

- Intermediate internal version used during GitHub Packages setup

## [0.1.2] - Previous Version

### Features

- GitHub-style Markdown rendering
- Dark mode with smooth transitions
- Syntax highlighting (Prism.js)
- Folder tree navigation
- Zero-config CLI usage (`docs-viewer` / `npx`)
- Cross-platform support (Windows, macOS, Linux)
- Node.js and Python server implementations
- Path traversal protection for file access

[0.1.3]: https://github.com/thejackluo/weavelight/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/thejackluo/weavelight/releases/tag/v0.1.2
