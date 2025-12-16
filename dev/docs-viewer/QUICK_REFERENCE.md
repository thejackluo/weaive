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

**Version 2.0** • **Quick & Simple**
