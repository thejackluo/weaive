# ⚡ Quick Reference

One-page reference for the Weavelight Documentation Viewer.

## 🚀 Start Server

```bash
# PowerShell (Windows)
.\dev\docs-viewer\scripts\serve.ps1

# Bash (Mac/Linux)  
./dev/docs-viewer/scripts/serve.sh

# Node.js
node dev/docs-viewer/scripts/server.js

# Python
python dev/docs-viewer/scripts/server.py
```

**URL**: http://localhost:3030

---

## 📁 Project Structure

```
dev/docs-viewer/
├── index.html              # Viewer interface
├── scripts/                # Server files
│   ├── server.js
│   ├── server.py
│   ├── serve.ps1
│   └── serve.sh
├── README.md
├── USAGE.md
└── QUICK_REFERENCE.md      # This file
```

---

## ➕ Add Documents

**Just create a markdown file in `docs/`:**

```bash
# That's it! No config needed.
echo "# My Doc" > docs/new-file.md

# Refresh browser - appears automatically
```

**Auto-categorization by folder:**
- `docs/dev/` → Development
- `docs/setup/` → Setup
- `docs/analysis/` → Product/Research
- `docs/idea/` → Development

---

## 🎨 Change Colors

Edit CSS variables in `index.html` (line ~15):

```css
--primary: #6366f1;
--accent: #a78bfa;
--bg-main: #0a0a0f;
```

---

## ⌨️ Shortcuts

| Key | Action |
|-----|--------|
| `/` | Search |
| `Esc` | Close sidebar (mobile) |

---

## 📚 Reading Features

**Reading Time**
- Auto-calculated for each document (~200 wpm)
- Displayed as badge (e.g., "5 min read")
- **NEW**: Dynamic "time left" as you scroll

**Scroll Progress** 🆕
- Progress bar at top fills as you scroll
- Time remaining indicator (top-right)
- Shows "3 min left" based on position
- Appears after ~5% scroll

**Library Stats** 🆕
- Total docs, words, lines
- Combined reading time (e.g., "2h 45m")
- Shown in sidebar & welcome screen
- Cached for performance

**Progress Tracking**
- Click "Mark as Complete" button
- Progress bar in sidebar footer
- ✓ checkmark on completed docs

**Text Highlighting**
1. Select text in document
2. Choose color from toolbar (bottom-right)
3. Colors: Yellow, Green, Blue, Pink
4. Click X to remove highlight

**Storage**
- All data in localStorage
- Persists across sessions
- Per-document tracking

---

## 🔧 Change Port

Edit server files:

```javascript
const PORT = 3030;  // Your port
```

---

## 🐛 Troubleshooting

**Server won't start**
```bash
# Check port
netstat -ano | findstr :3030  # Windows
lsof -i :3030                 # Mac/Linux
```

**Document won't load**
- Check path in `docs` object
- Verify file exists
- Check browser console

---

## 📊 Key Info

| Item | Value |
|------|-------|
| Port | 3030 |
| Max Width | 900px |
| Sidebar | 300px |
| Mobile BP | 968px |

---

## 🎯 Colors

```
Primary:    #6366f1
Accent:     #a78bfa
Background: #0a0a0f
Text:       #f8fafc
```

---

## 🔍 API Endpoint

**`/api/docs`** - Returns dynamic document list

```bash
curl http://localhost:3030/api/docs
# Returns JSON with all discovered docs
```

---

## 📝 Common Tasks

**Change logo:**
```html
<!-- dev/docs-viewer/index.html, line ~300 -->
<span class="logo-text">Your Name</span>
```

---

## 🔐 Security

- ⚠️ Internal use only
- 🏠 Localhost only
- 🚫 No authentication

---

**Version 3.1** • **Quick & Smart** 📚⚡
