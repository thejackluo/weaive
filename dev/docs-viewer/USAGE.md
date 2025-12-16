# 🚀 Usage Guide

Quick guide for the **dynamic** documentation viewer.

## Starting the Server

### Windows (PowerShell)
```powershell
.\dev\docs-viewer\scripts\serve.ps1
```

### Mac/Linux (Bash)
```bash
chmod +x dev/docs-viewer/scripts/serve.sh  # First time only
./dev/docs-viewer/scripts/serve.sh
```

### Using Node.js
```bash
node dev/docs-viewer/scripts/server.js
```

### Using Python
```bash
python dev/docs-viewer/scripts/server.py
```

## Accessing the Viewer

Open your browser to: **http://localhost:3030**

## Using the Viewer

### Navigation
- Click any document in the sidebar to view it
- Active document is highlighted in blue
- Categories organize documents by type

### Search
- Click the search box or press `/` to search
- Type to filter documents in real-time
- Clear search to see all documents again

### Mobile
- On small screens, tap the floating button (📚) to toggle sidebar
- Tap outside sidebar to close it
- All features work on mobile

## Adding Documents

**Just add markdown files to the `docs/` folder!**

```bash
# Example: Add a new setup guide
echo "# Database Setup" > docs/setup/database-guide.md

# Refresh browser - it appears automatically!
```

The viewer will:
- 🔍 Find it automatically
- 📁 Categorize it (Setup category)
- 🎯 Pick an appropriate icon
- 📝 Generate a friendly title

## Tips

✨ **Keyboard Shortcut**: Press `/` anywhere to focus search  
📱 **Mobile Friendly**: Fully responsive design  
🔄 **Dynamic**: Add/remove docs anytime - no config needed  
🎨 **Minimal UI**: Professional Mintlify-inspired design  
♻️ **Auto-Updates**: Changes reflect on page refresh

## Stopping the Server

Press `Ctrl + C` in the terminal where the server is running.

---

For more details, see [README.md](./README.md)
