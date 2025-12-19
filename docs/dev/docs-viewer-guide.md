# Documentation Viewer Guide

## Overview

The Weavelight Documentation Viewer is a lightweight, standalone web application that provides an organized, developer-friendly interface for browsing all project documentation.

## Features

- 📚 **Organized Navigation** - Documents grouped by category (Product, Development, Setup, Research)
- 🔍 **Search Functionality** - Quickly find documents by name
- 🎨 **Beautiful UI** - Modern dark theme with syntax highlighting
- ⚡ **Fast & Lightweight** - No build process, runs entirely in the browser
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Quick Start

### Option 1: PowerShell (Windows - Recommended)

```powershell
.\serve-docs.ps1
```

This script automatically detects whether you have Python or Node.js installed and uses the appropriate method.

### Option 2: Node.js

```bash
node serve-docs.js
```

Requires: Node.js (any version)

### Option 3: Python

```bash
python serve-docs.py
```

Requires: Python 3.x

### Option 4: Python Simple Server

```bash
python -m http.server 3030
```

Then navigate to `http://localhost:3030/docs-viewer.html`

## Usage

1. Start the server using one of the methods above
2. Open your browser to `http://localhost:3030`
3. Browse documents using the sidebar navigation
4. Use the search box to quickly find specific documents
5. Press `/` to focus the search box (keyboard shortcut)

## File Structure

```
weavelight/
├── docs-viewer.html       # Main documentation viewer app
├── serve-docs.ps1         # PowerShell server script (Windows)
├── serve-docs.js          # Node.js server script
├── serve-docs.py          # Python server script
└── docs/                  # All markdown documentation
    ├── prd.md
    ├── ux-design.md
    ├── analysis/
    ├── dev/
    ├── setup/
    └── idea/
```

## Adding New Documents

To add new documentation to the viewer:

1. Add your markdown file to the appropriate folder in `docs/`
2. Open `docs-viewer.html`
3. Find the `docs` object in the `<script>` section
4. Add your document to the appropriate category:

```javascript
const docs = {
    'Your Category': [
        { 
            path: 'docs/your-folder/your-file.md', 
            title: 'Your Document Title', 
            icon: '📄' 
        },
    ],
};
```

5. Refresh the browser to see your changes

## Categories

### Product
- Product Requirements Document (PRD)
- UX Design specifications
- Product briefs and analysis

### Development
- MCP Quick Reference
- Backend, MVP, AI, and UX implementation ideas

### Setup
- MCP setup guide
- TTS (Text-to-Speech) setup guide

### Research
- Market research and competitive analysis

## Customization

### Changing the Theme

Edit the CSS variables in `docs-viewer.html`:

```css
:root {
    --primary: #6366f1;        /* Primary color */
    --bg-main: #0f172a;        /* Main background */
    --bg-secondary: #1e293b;   /* Secondary background */
    --text-primary: #f1f5f9;   /* Primary text color */
    /* ... more variables */
}
```

### Changing the Port

Edit the `PORT` variable in your chosen server script:

```javascript
// serve-docs.js
const PORT = 3030;
```

```python
# serve-docs.py
PORT = 3030
```

```powershell
# serve-docs.ps1
$PORT = 3030
```

## Troubleshooting

### Port Already in Use

If port 3030 is already in use, edit the server script to use a different port (e.g., 3031, 8080).

### CORS Issues

If you're experiencing CORS (Cross-Origin Resource Sharing) issues:

1. Make sure you're using one of the provided server scripts
2. Don't open `docs-viewer.html` directly with `file://` protocol
3. The server scripts include proper CORS headers

### Documents Not Loading

1. Verify the document exists in the `docs/` folder
2. Check the path in `docs-viewer.html` matches the actual file location
3. Ensure the markdown file is properly formatted
4. Check browser console (F12) for error messages

### Search Not Working

The search feature filters the navigation items by matching the search query against document titles. If it's not working:

1. Try refreshing the page
2. Clear your browser cache
3. Check browser console for JavaScript errors

## Technical Details

### Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling with CSS variables for theming
- **Vanilla JavaScript** - No frameworks or dependencies
- **Marked.js** - Markdown parsing (loaded from CDN)

### Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ❌ Not supported

### Performance

- Initial load: ~50ms
- Document load: ~10-50ms (depending on file size)
- Search: Real-time filtering with no noticeable lag

## Future Enhancements

Potential features to add:

- [ ] Table of contents for each document
- [ ] Dark/light theme toggle
- [ ] Export to PDF
- [ ] Version history
- [ ] Collaborative comments
- [ ] Full-text search across all documents
- [ ] Mobile-optimized sidebar toggle
- [ ] Breadcrumb navigation improvements
- [ ] Print-friendly CSS

## Contributing

When adding documentation:

1. Use clear, descriptive titles
2. Include proper markdown formatting
3. Add appropriate emoji icons for visual clarity
4. Organize content with headers and sections
5. Include code examples where relevant
6. Link to related documents

## Support

For issues or questions about the documentation viewer:

1. Check this guide first
2. Review browser console for errors
3. Verify file paths and permissions
4. Contact the development team

---

**Last Updated:** December 2025  
**Version:** 1.0.0  
**Maintainer:** Weavelight Development Team


