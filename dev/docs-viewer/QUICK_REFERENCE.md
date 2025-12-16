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

Edit `index.html` (line ~421):

```javascript
const docs = {
    'Category': [
        { 
            path: 'docs/file.md',
            title: 'Title',
            icon: '📄'
        }
    ]
};
```

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

## 📝 Common Tasks

**Add category:**
```javascript
'New Category': [
    { path: 'docs/new.md', title: 'New', icon: '📝' }
]
```

**Change title:**
```html
<!-- Line 395 -->
<h1>Your Title</h1>
```

---

## 🔐 Security

- ⚠️ Internal use only
- 🏠 Localhost only
- 🚫 No authentication

---

**Version 2.0** • **Quick & Simple**
