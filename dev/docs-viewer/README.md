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

- **Minimal Design** - Mintlify-inspired clean, professional aesthetic
- **Professional Icons** - Lucide icon library (no emoji clutter)
- **Monochrome Palette** - Pure black with strategic blue accent
- **Smart Search** - Real-time filtering (press `/` to search)
- **Responsive** - Works on desktop and mobile
- **Markdown** - Full markdown rendering with proper styling
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

Edit the `docs` object in `index.html` (around line 421):

```javascript
const docs = {
    'Category Name': [
        { 
            path: 'docs/path/to/file.md',
            title: 'Document Title',
            icon: '📄'
        }
    ]
};
```

**Path Rules:**
- Relative to project root
- Use forward slashes `/`
- Must be `.md` files

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
- **Server**: Node.js http module or Python http.server
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
