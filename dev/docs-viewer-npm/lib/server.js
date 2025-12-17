/**
 * @thejackluo/docs-viewer
 * HTTP server for documentation viewer
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.md': 'text/markdown',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Icon mapping based on file path/name
function getIconForFile(filePath, fileName) {
    const lower = fileName.toLowerCase();

    if (lower.includes('prd') || lower.includes('requirements')) return 'file-text';
    if (lower.includes('design') || lower.includes('ux')) return 'layout';
    if (lower.includes('brief')) return 'clipboard';
    if (lower.includes('guide')) return 'book';
    if (lower.includes('reference')) return 'zap';
    if (lower.includes('backend')) return 'server';
    if (lower.includes('mvp')) return 'target';
    if (lower.includes('ai')) return 'cpu';
    if (lower.includes('setup')) return 'settings';
    if (lower.includes('tts') || lower.includes('audio')) return 'volume-2';
    if (lower.includes('research') || lower.includes('market')) return 'bar-chart-2';
    if (lower.includes('architecture')) return 'box';
    if (lower.includes('api')) return 'plug';
    if (lower.includes('test')) return 'check-circle';

    return 'file-text';
}

function getTitleFromFilename(fileName) {
    return fileName
        .replace(/\.md$/i, '')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function buildFolderStructure(dir, basePath = '', level = 0) {
    const structure = {
        folders: {},
        files: []
    };

    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            if (item.name.startsWith('.') || item.name === 'node_modules') {
                continue;
            }

            const fullPath = path.join(dir, item.name);
            const relativePath = path.join(basePath, item.name);

            if (item.isDirectory()) {
                structure.folders[item.name] = buildFolderStructure(fullPath, relativePath, level + 1);
            } else if (item.isFile() && item.name.endsWith('.md')) {
                const webPath = relativePath.replace(/\\/g, '/');
                structure.files.push({
                    path: webPath,
                    title: getTitleFromFilename(item.name),
                    icon: getIconForFile(fullPath, item.name),
                    name: item.name
                });
            }
        }

        structure.files.sort((a, b) => a.title.localeCompare(b.title));

    } catch (error) {
        console.error(`Error scanning directory ${dir}:`, error.message);
    }

    return structure;
}

function countDocs(structure) {
    let count = structure.files.length;
    for (const folder in structure.folders) {
        count += countDocs(structure.folders[folder]);
    }
    return count;
}

function startServer(port, docsDir) {
    // Resolve paths relative to package installation
    const PACKAGE_ROOT = path.join(__dirname, '..');
    const VIEWER_HTML = path.join(PACKAGE_ROOT, 'public', 'index.html');
    const DOCS_DIR = path.resolve(docsDir);

    // Verify docs directory exists
    if (!fs.existsSync(DOCS_DIR)) {
        console.error(`\n❌ Error: Docs directory not found: ${DOCS_DIR}`);
        console.error(`\n💡 Tip: Create a 'docs/' folder with .md files, or specify a custom path with --dir\n`);
        process.exit(1);
    }

    const server = http.createServer((req, res) => {
        // API endpoint for folder structure
        if (req.url === '/api/docs') {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });

            const structure = buildFolderStructure(DOCS_DIR);
            res.end(JSON.stringify(structure, null, 2));
            return;
        }

        // Serve viewer HTML at root
        if (req.url === '/' || req.url === '/index.html') {
            fs.readFile(VIEWER_HTML, (error, content) => {
                if (error) {
                    res.writeHead(500);
                    res.end('Error loading viewer');
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            });
            return;
        }

        // Serve markdown files from docs directory
        const filePath = path.join(DOCS_DIR, req.url);
        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(`
                        <html>
                            <head><title>404 - Not Found</title></head>
                            <body style="font-family: system-ui; padding: 40px; text-align: center;">
                                <h1>404 - File Not Found</h1>
                                <p><code>${req.url}</code></p>
                            </body>
                        </html>
                    `);
                } else {
                    res.writeHead(500);
                    res.end(`Server Error: ${error.code}`);
                }
            } else {
                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(content);
            }
        });
    });

    server.listen(port, () => {
        const structure = buildFolderStructure(DOCS_DIR);
        const totalDocs = countDocs(structure);

        console.log('\n┌──────────────────────────────────────────┐');
        console.log('│  📚 Docs Viewer                          │');
        console.log('└──────────────────────────────────────────┘\n');
        console.log(`🌐 Server:      http://localhost:${port}`);
        console.log(`📁 Docs:        ${DOCS_DIR}`);
        console.log(`📄 Discovered:  ${totalDocs} documents`);
        console.log('\n💡 Press Ctrl+C to stop\n');
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n✨ Server stopped. Goodbye!\n');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n\n✨ Server stopped. Goodbye!\n');
        process.exit(0);
    });

    return server;
}

module.exports = { startServer };
