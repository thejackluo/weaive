# 📚 Weavelight Documentation Viewer

Modern internal development tool for viewing project documentation with a beautiful UI.

## Quick Start

### Start the Server

```bash
# PowerShell (Windows)
.\dev\docs-viewer\scripts\serve.ps1

# Bash (Mac/Linux)
./dev/docs-viewer/scripts/serve.sh

# Node.js directly
node dev/docs-viewer/scripts/server.js

# Python directly
python dev/docs-viewer/scripts/server.py
```

Then open: **http://localhost:3030**

## Features

- **Dynamic Discovery** - Automatically finds all markdown files in `docs/` folder
- **Auto-Categorization** - Smart categorization based on folder structure
- **No Configuration** - Add/remove docs, changes reflect immediately
- **Reading Time Estimation** - Shows estimated reading time for each document
- **Scroll-Based Progress** - See time remaining as you scroll through documents
- **Comprehensive Stats** - Total words, lines, reading time across all docs
- **Progress Tracking** - Mark documents as complete and track your progress
- **Persistent Highlighting** - Highlight text in multiple colors with localStorage persistence
- **Minimal Design** - Mintlify-inspired clean, professional aesthetic
- **Professional Icons** - Lucide icon library with smart icon detection
- **Monochrome Palette** - Pure black with strategic blue accent
- **Smart Search** - Real-time filtering (press `/` to search)
- **Responsive** - Works on desktop and mobile
- **Fast** - No build process, instant startup

## Project Structure

```
dev/docs-viewer/
├── index.html              # Main viewer interface
├── scripts/
│   ├── server.js           # Node.js server
│   ├── server.py           # Python server
│   ├── serve.ps1           # PowerShell launcher
│   └── serve.sh            # Bash launcher
├── README.md               # This file
├── USAGE.md                # Quick reference
└── QUICK_REFERENCE.md      # One-page cheat sheet
```

## Adding Documents

**Just add markdown files to the `docs/` folder!** The viewer automatically discovers them.

The server will:
- 🔍 Scan all subdirectories recursively
- 📁 Auto-categorize based on folder structure
- 🎯 Detect appropriate icons from filenames/paths
- 📝 Generate friendly titles from filenames
- ♻️ Refresh on every page load

**Folder Structure:**
```
docs/
├── prd.md              → Product category
├── analysis/
│   └── product-brief.md → Product category
├── dev/
│   └── guide.md         → Development category
├── setup/
│   └── mcp-setup.md     → Setup category
└── idea/
    └── features.md      → Development category
```

**That's it!** No configuration needed.

## Customization

### Change Colors

Edit CSS variables in `index.html` (around line 15):

```css
:root {
    --primary: #6366f1;       /* Main accent color */
    --accent: #a78bfa;        /* Secondary accent */
    --bg-main: #0a0a0f;       /* Background */
    --text-primary: #f8fafc;  /* Text color */
}
```

### Change Port

Edit the PORT variable in server files:

```javascript
const PORT = 3030;  // Change to your preferred port
```

## Enhanced Reading Features (v3.0)

### ⏱️ Reading Time Estimation & Scroll Progress

**Reading Time Badge:**
- Automatically calculates reading time based on word count
- Uses industry standard: **200 words per minute**
- Displayed as a badge in the document header

**Dynamic Time Remaining:**
- Shows how much time is left as you scroll through a document
- Example: **"7 minute read, 3 min left"**
- Appears in top-right corner when you scroll past 5%
- Updates in real-time based on scroll position

**Scroll Progress Bar:**
- Thin progress bar at the very top of the content area
- Fills from left to right as you scroll
- Visual gradient (blue to green)
- Always visible for quick reference

**How It Works:**
1. Load a document
2. Start scrolling down
3. After scrolling ~5%, indicator appears showing time remaining
4. Progress bar fills proportionally
5. Near the end (~95%), shows "Almost done!"

**Benefits:**
- Plan your reading sessions effectively
- Know exactly how much time you need
- See progress at a glance
- Stay motivated to finish

---

### 📊 Comprehensive Documentation Statistics

**Library Stats Card** (in sidebar):
- **Total Documents**: Count of all markdown files
- **Total Time**: Sum of all reading times (e.g., "2h 45m")
- **Total Words**: Complete word count across all docs
- **Total Lines**: Total line count for size reference

**Welcome Screen Stats:**
- Shows comprehensive overview when no document is selected
- Displays calculated reading time
- Shows total word count
- Updates automatically when docs are added/removed

**Stats Calculation:**
- Calculated once on first page load
- Cached in localStorage for performance
- Recalculates if docs change
- Background process (doesn't block UI)

**Use Cases:**
- **Assess Scope**: Understand how comprehensive your documentation is
- **Plan Time**: Allocate enough time for thorough reading
- **Track Growth**: See documentation expand over time
- **Onboarding**: Set realistic expectations for new team members

---

### ✅ Progress Tracking

**Mark as Complete:**
- Click the "Mark as Complete" button when finished reading
- Button turns blue and shows "Completed"
- Click again to toggle completion status

**Visual Indicators:**
- ✓ checkmark appears next to completed docs in sidebar
- Completed docs stand out from unread ones
- Easy to see what you've already covered

**Progress Bar:**
- Located at the bottom of the sidebar
- Shows fraction completed (e.g., "5 of 12 completed")
- Visual bar fills as you complete more documents
- Updates in real-time

**Use Cases:**
- **Onboarding**: Track progress through documentation for new team members
- **Learning**: Check off docs as you master each topic
- **Review**: Know what you've already read during updates
- **Goal Setting**: Aim to complete all docs in a sprint

---

### 🎨 Persistent Text Highlighting

**How to Highlight:**

1. **Select Text**
   - Click and drag to select text in any document
   - Works on paragraphs, sentences, or individual words

2. **Choose Color**
   - Toolbar appears in bottom-right corner
   - 4 color options available:
     - 🟨 **Yellow** - General highlights
     - 🟩 **Green** - Important/positive notes
     - 🟦 **Blue** - Technical details
     - 🟪 **Pink** - Critical/warnings

3. **Apply**
   - Click a color button
   - Text is highlighted immediately
   - Highlight is saved automatically

**Remove Highlights:**
1. Select the highlighted text
2. Click the **X** button in the toolbar
3. Highlight is removed and change is saved

**Color Coding Suggestions:**

| Color | Suggested Use |
|-------|---------------|
| 🟨 Yellow | Key concepts, definitions |
| 🟩 Green | Best practices, good examples |
| 🟦 Blue | Technical details, code references |
| 🟪 Pink | Warnings, important notes, TODOs |

**Technical Details:**
- Highlights stored in browser **localStorage**
- Each document has independent highlights
- Persists across sessions (even after closing browser)
- No server storage required
- Privacy-friendly (all data stays local)

---

### 💾 Data Storage & Management

**localStorage Structure:**

All data is stored in your browser's localStorage:

```javascript
// Completed documents
{
  "docs_completed": {
    "docs/prd.md": "2025-12-16T10:30:00.000Z",
    "docs/setup/guide.md": "2025-12-16T11:45:00.000Z"
  }
}

// Highlights
{
  "docs_highlights": {
    "docs/prd.md": [
      { "text": "key feature", "color": "yellow", "index": 0 },
      { "text": "important note", "color": "pink", "index": 1 }
    ]
  }
}
```

**Data Management:**

**Clear All Data:**
```javascript
// Open browser console and run:
localStorage.removeItem('docs_completed');
localStorage.removeItem('docs_highlights');
```

**Export Data (for backup):**
```javascript
// In browser console:
const data = {
  completed: localStorage.getItem('docs_completed'),
  highlights: localStorage.getItem('docs_highlights')
};
console.log(JSON.stringify(data, null, 2));
```

**Import Data (restore backup):**
```javascript
// In browser console:
localStorage.setItem('docs_completed', '<your_completed_json>');
localStorage.setItem('docs_highlights', '<your_highlights_json>');
location.reload();
```

---

### 🎯 Best Practices

**For Individual Users:**

1. **Start with Quick Reads**
   - Check reading times
   - Complete shorter docs first for quick wins

2. **Use Color Coding Consistently**
   - Define your color system early
   - Stick to it across all documents

3. **Mark Completion Honestly**
   - Only mark as complete when fully understood
   - Re-visit and un-mark if you need a refresh

**For Teams:**

1. **Standardize Color System**
   - Agree on color meanings
   - Document in team wiki or README

2. **Track Onboarding**
   - New members can track their progress
   - Mentors can suggest completion order

3. **Review Cycles**
   - Un-mark docs during major updates
   - Re-read and re-mark to stay current

---

### 🔧 Configuration & Customization

**Disable Features (if needed):**

Edit `index.html` to hide specific features:

```css
/* Hide Progress Tracking */
.progress-header,
.progress-stats-card {
  display: none !important;
}

/* Hide Highlight Toolbar */
.highlight-toolbar {
  display: none !important;
}

/* Hide Reading Time */
.meta-badge:has([data-lucide="clock"]) {
  display: none !important;
}
```

**Customize Highlight Colors:**

```css
/* In index.html (around line 450) */
.highlight-yellow { background: #fbbf24; }
.highlight-green { background: #34d399; }
.highlight-blue { background: #60a5fa; }
.highlight-pink { background: #f472b6; }
```

**Customize Progress Bar:**

```css
/* In index.html (around line 380) */
.progress-bar-fill {
  background: linear-gradient(90deg, var(--primary), var(--accent-green));
}
```

---

### 📱 Mobile Support

All features work seamlessly on mobile devices:

- **Highlighting**: Touch and hold to select text
- **Toolbar**: Appears above mobile menu button (non-conflicting)
- **Progress**: Full progress bar visible in sidebar
- **Completion**: Full-width button for easy tapping

---

### 🐛 Known Limitations

1. **Highlight Restoration**: Uses simple text matching; may fail if document content changes significantly
2. **Complex Selections**: Highlights across multiple elements may not work perfectly
3. **localStorage Limit**: Browser limit is ~5-10MB (sufficient for most use cases)
4. **No Cloud Sync**: Data doesn't sync across devices or browsers

---

### 🚀 Future Enhancements

Potential additions (not yet implemented):

- Export highlights as markdown notes
- Share reading progress with team
- Custom reading speed setting
- Highlight annotations/notes
- Reading streak tracking
- Category-based progress
- Time spent reading analytics

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search box |
| `Esc` | Close sidebar (mobile) |

## Troubleshooting

### Server won't start
- Ensure Node.js or Python is installed
- Check if port 3030 is available
- Run from project root directory

### Documents won't load
- Verify file paths in `docs` object
- Check files exist in correct location
- Look for errors in browser console

### Search not working
- Clear browser cache
- Check JavaScript console for errors
- Verify marked.js CDN is accessible

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Modern mobile browsers

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Icons**: Lucide Icons library (via CDN)
- **Markdown**: marked.js (v11.1.1 via CDN)
- **Server**: Node.js or Python with dynamic API endpoint
- **API**: `/api/docs` endpoint for document discovery
- **Design**: Minimal monochrome with Mintlify-inspired aesthetic

## Security

⚠️ **Internal Development Tool Only**

- Do NOT expose to public internet
- Runs on localhost only
- No authentication mechanism
- CORS enabled for local development

## Additional Resources

- [USAGE.md](./USAGE.md) - Quick start guide
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - One-page cheat sheet

---

## Version History

### v3.1.0 - December 16, 2025 🚀

**Scroll-Based Reading Progress:**
- Dynamic "time remaining" indicator that updates as you scroll
- Scroll progress bar at top of content area
- Shows "X min left" based on current position
- Appears after scrolling 5% through document

**Comprehensive Documentation Statistics:**
- Library stats card in sidebar showing totals
- Total reading time across all documents
- Total word count and line count
- Stats cached in localStorage for performance
- Welcome screen shows comprehensive overview

### v3.0.0 - December 16, 2025 ✨

**Major Features Added:**
- ⏱️ Reading time estimation for all documents
- ✅ Progress tracking with completion status
- 🎨 Persistent text highlighting in 4 colors
- 💾 localStorage-based data persistence
- 📊 Progress bar showing overall completion
- 📱 Full mobile optimization for all features

**Technical Improvements:**
- localStorage management system
- Text selection and highlighting engine
- Highlight restoration on page load
- Reading time calculation algorithm
- Enhanced mobile layouts

**Migration:** Fully backward compatible - no migration needed!

### v2.0.0 - Previous Release

- Dynamic document discovery
- Auto-categorization
- Folder/file tree navigation
- Real-time search
- Minimal monochrome design

---

**Version 3.1** • Made with ❤️ for Weavelight • Smart Reading Progress! 📚⚡
