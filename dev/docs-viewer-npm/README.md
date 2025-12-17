# 📚 @jackluo/docs-viewer

A lightweight, beautiful documentation viewer for markdown files with dark mode, syntax highlighting, folder navigation, and reading progress tracking.

## ✨ Features

- 🎨 **Beautiful Dark Mode UI** - Modern, clean interface optimized for reading
- 📂 **Folder Navigation** - Automatic folder tree structure with collapsible sections
- 🔍 **Fast Search** - Quickly find documents by name or folder
- 🖍️ **Syntax Highlighting** - Code blocks with Prism.js support for 15+ languages
- 📊 **Mermaid Diagrams** - Render flowcharts, sequence diagrams, and more
- ⏱️ **Reading Progress** - Track completion status and reading time per document
- 🎯 **Text Highlighting** - Highlight and save important sections (4 colors)
- 📱 **Mobile Responsive** - Works great on all screen sizes
- 🚀 **Zero Configuration** - Just point it at your `docs/` folder and go

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g @jackluo/docs-viewer
```

### One-Time Usage with npx

```bash
npx @jackluo/docs-viewer
```

## 🚀 Usage

### Basic Usage

Navigate to your project directory with a `docs/` folder and run:

```bash
docs-viewer
```

The server will start at `http://localhost:3030` and automatically discover all `.md` files in your `docs/` directory.

### Custom Port

```bash
docs-viewer --port 8080
```

### Custom Docs Directory

```bash
docs-viewer --dir ./my-documentation
```

### All Options

```bash
docs-viewer --help
```

## 📁 Requirements

- **Node.js** 14.0.0 or higher
- A folder containing markdown (`.md`) files

## 🎯 Example Project Structure

```
my-project/
├── docs/
│   ├── getting-started.md
│   ├── api/
│   │   ├── endpoints.md
│   │   └── authentication.md
│   └── guides/
│       ├── installation.md
│       └── configuration.md
└── ...
```

Run `docs-viewer` from `my-project/` and all your docs will be beautifully rendered!

## 🛠️ Programmatic Usage

You can also use the viewer programmatically in your Node.js applications:

```javascript
const { startServer } = require('@jackluo/docs-viewer');

// Start server on port 3030 with docs in ./docs
startServer(3030, './docs');
```

## 📸 Features Showcase

- **Folder Tree Navigation** - Automatic hierarchical file organization
- **Live Search** - Instant filtering as you type
- **Progress Tracking** - Mark documents as complete
- **Stats Dashboard** - See total docs, words, reading time
- **Anchor Links** - Clickable heading anchors for easy sharing
- **YAML Frontmatter** - Metadata display for documents

## 🤝 Contributing

This is an experimental package (`v0.1.0`). Feedback and contributions welcome!

## 📄 License

MIT © Jack Luo

## 🔗 Links

- [GitHub Repository](https://github.com/jackluo/weavelight)
- [Report Issues](https://github.com/jackluo/weavelight/issues)
- [npm Package](https://www.npmjs.com/package/@jackluo/docs-viewer)

---

Made with ❤️ by Jack Luo
