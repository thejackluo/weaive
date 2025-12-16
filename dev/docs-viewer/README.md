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

**Version 2.0** • Made with ❤️ for Weavelight
