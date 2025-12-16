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
- Completed documents show a ✓ checkmark

### Search
- Click the search box or press `/` to search
- Type to filter documents in real-time
- Clear search to see all documents again

### Reading Progress

**Reading Time**
- Each document shows estimated reading time at the top (e.g., "5 min read")
- Based on average reading speed of ~200 words per minute

**Dynamic Time Remaining** 🆕
- As you scroll, see how much time is left (e.g., "3 min left")
- Indicator appears in top-right after scrolling ~5%
- Updates in real-time as you read
- Shows "Almost done!" when near the end

**Scroll Progress Bar** 🆕
- Thin bar at the very top of the page
- Fills left-to-right as you scroll
- Visual gradient (blue to green)
- Quick glance at your reading position

**Mark as Complete**
- Click the "Mark as Complete" button when you finish reading
- Button turns blue and shows "Completed"
- Click again to unmark if needed
- Completed documents get a ✓ in the sidebar

**Progress Tracking**
- Check the sidebar footer for overall progress
- Shows completion count (e.g., "5 of 12 completed")
- Visual progress bar updates in real-time

**Library Statistics** 🆕
- Sidebar shows comprehensive stats:
  - Total documents in library
  - Combined reading time (e.g., "2h 45m")
  - Total word count
  - Total line count
- Helps assess documentation scope

### Text Highlighting

**How to Highlight**
1. Select any text in the document
2. A color toolbar appears in the bottom-right
3. Click a color button to apply highlight (yellow, green, blue, or pink)
4. Highlight is saved automatically

**Remove Highlights**
- Select the highlighted text
- Click the X button in the toolbar
- Highlight is removed and changes are saved

**Persistence**
- All highlights are saved to browser localStorage
- Highlights automatically restore when you reopen the document
- Different documents maintain separate highlights

### Mobile
- On small screens, tap the floating button (📚) to toggle sidebar
- Tap outside sidebar to close it
- All features work on mobile
- Highlight toolbar appears above the menu button

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
⏱️ **Watch Time Remaining**: Scroll indicator shows time left as you read  
📊 **Track Progress**: Use completion tracking to stay organized  
🎯 **Highlight Key Info**: Use different colors for different types of notes  
💾 **Data Persists**: All progress and highlights saved in localStorage  
📈 **Check Stats**: View comprehensive library statistics in sidebar

## Stopping the Server

Press `Ctrl + C` in the terminal where the server is running.

---

For more details, see [README.md](./README.md)
