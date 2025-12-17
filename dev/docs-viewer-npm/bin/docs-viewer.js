#!/usr/bin/env node

/**
 * @thejackluo/docs-viewer
 * CLI entry point for documentation viewer
 */

const path = require('path');
const { startServer } = require('../lib/server.js');

// Parse command line arguments
const args = process.argv.slice(2);
let port = 3030;
let docsDir = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' || args[i] === '-p') {
    port = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--dir' || args[i] === '-d') {
    docsDir = args[i + 1];
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
╔════════════════════════════════════════╗
║     📚 Docs Viewer CLI                ║
╚════════════════════════════════════════╝

Usage:
  docs-viewer [options]

Options:
  -p, --port <port>     Port to run server on (default: 3030)
  -d, --dir <path>      Path to docs directory (default: ./docs)
  -h, --help            Show this help message

Examples:
  docs-viewer                    # Start server on port 3030
  docs-viewer --port 8080        # Start on custom port
  docs-viewer --dir ./my-docs    # Use custom docs directory

🌐 Server will be available at http://localhost:<port>
📂 Docs directory must contain .md files
    `);
    process.exit(0);
  }
}

// Resolve docs directory
if (!docsDir) {
  docsDir = path.join(process.cwd(), 'docs');
}

// Start the server
try {
  startServer(port, docsDir);
} catch (error) {
  console.error('❌ Error starting server:', error.message);
  process.exit(1);
}
