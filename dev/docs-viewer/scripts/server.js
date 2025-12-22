#!/usr/bin/env node

/**
 * Documentation Viewer Server
 *
 * Dynamic HTTP server with folder-structure-based organization
 * Run from project root: node dev/docs-viewer/scripts/server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
let PORT = 3030;
const args = process.argv.slice(2);

for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--port' || args[i] === '-p') && i + 1 < args.length) {
        const parsedPort = parseInt(args[i + 1], 10);
        if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
            console.error('❌ Error: Port must be a number between 1 and 65535');
            process.exit(1);
        }
        PORT = parsedPort;
        i++; // Skip next argument since we consumed it
    } else if (args[i] === '--help' || args[i] === '-h') {
        console.log(`
Usage: node server.js [options]

Options:
  --port, -p <number>    Port number (1-65535, default: 3030)
  --help, -h             Show this help message
        `);
        process.exit(0);
    }
}

const PROJECT_ROOT = path.join(__dirname, '../../..');
const VIEWER_DIR = path.join(__dirname, '..');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');

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
    
    // Specific file matches
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

// Get friendly title from filename
function getTitleFromFilename(fileName) {
    return fileName
        .replace(/\.md$/i, '')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Calculate file stats (lines, words, reading time)
function calculateFileStats(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').length;
        const words = content.trim().split(/\s+/).length;
        const readingTime = Math.ceil(words / 200); // 200 words per minute
        return { lines, words, readingTime };
    } catch (error) {
        return { lines: 0, words: 0, readingTime: 0 };
    }
}

// Build nested folder structure
function buildFolderStructure(dir, basePath = '', level = 0) {
    const structure = {
        folders: {},
        files: []
    };

    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            // Skip hidden items and node_modules
            if (item.name.startsWith('.') || item.name === 'node_modules') {
                continue;
            }

            const fullPath = path.join(dir, item.name);
            const relativePath = path.join(basePath, item.name);

            if (item.isDirectory()) {
                // Recursively build folder structure
                structure.folders[item.name] = buildFolderStructure(fullPath, relativePath, level + 1);
            } else if (item.isFile() && item.name.endsWith('.md')) {
                const webPath = path.join('docs', relativePath).replace(/\\/g, '/');
                const stats = calculateFileStats(fullPath);
                structure.files.push({
                    path: webPath,
                    title: getTitleFromFilename(item.name),
                    icon: getIconForFile(fullPath, item.name),
                    name: item.name,
                    ...stats // Include lines, words, readingTime
                });
            }
        }

        // Sort folders and files alphabetically
        structure.files.sort((a, b) => a.title.localeCompare(b.title));

    } catch (error) {
        console.error(`Error scanning directory ${dir}:`, error.message);
    }

    return structure;
}

// Calculate aggregate stats from structure
function calculateAggregateStats(structure) {
    let totalFiles = 0;
    let totalWords = 0;
    let totalLines = 0;
    let totalReadingTime = 0;

    function traverse(struct) {
        totalFiles += struct.files.length;
        for (const file of struct.files) {
            totalWords += file.words || 0;
            totalLines += file.lines || 0;
            totalReadingTime += file.readingTime || 0;
        }
        for (const folderName in struct.folders) {
            traverse(struct.folders[folderName]);
        }
    }

    traverse(structure);
    return { totalFiles, totalWords, totalLines, totalReadingTime };
}

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

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

    // API endpoint for aggregate stats
    if (req.url === '/api/stats') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });

        const structure = buildFolderStructure(DOCS_DIR);
        const stats = calculateAggregateStats(structure);
        res.end(JSON.stringify(stats, null, 2));
        return;
    }

    // Static file serving
    let filePath;
    
    if (req.url === '/' || req.url === '/index.html') {
        filePath = path.join(VIEWER_DIR, 'index.html');
    } else {
        filePath = path.join(PROJECT_ROOT, req.url);
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head>
                            <title>404 - Not Found</title>
                            <style>
                                body { 
                                    font-family: system-ui; 
                                    display: flex; 
                                    align-items: center; 
                                    justify-content: center; 
                                    height: 100vh; 
                                    margin: 0;
                                    background: #0a0a0f;
                                    color: #f8fafc;
                                }
                                .error-box {
                                    text-align: center;
                                    padding: 40px;
                                    background: #14141f;
                                    border-radius: 16px;
                                    border: 1px solid #2e2e3e;
                                }
                                h1 { color: #6366f1; margin: 0 0 16px; }
                                p { color: #94a3b8; margin: 0; }
                                code { 
                                    background: #1e1e2e; 
                                    padding: 4px 8px; 
                                    border-radius: 4px;
                                    color: #a78bfa;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="error-box">
                                <h1>404 - File Not Found</h1>
                                <p>Could not find: <code>${req.url}</code></p>
                            </div>
                        </body>
                    </html>
                `, 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content, 'utf-8');
        }
    });
});

// Count total docs recursively
function countDocs(structure) {
    let count = structure.files.length;
    for (const folder in structure.folders) {
        count += countDocs(structure.folders[folder]);
    }
    return count;
}

// Error handling for server
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Error: Port ${PORT} is already in use`);
        console.error(`💡 Try a different port with --port <number>\n`);
    } else {
        console.error(`\n❌ Server error: ${error.message}\n`);
    }
    process.exit(1);
});

server.listen(PORT, () => {
    console.log('\n┌──────────────────────────────────────────┐');
    console.log('│  📚 Documentation Viewer                │');
    console.log('└──────────────────────────────────────────┘\n');
    console.log(`🌐 Server:      http://localhost:${PORT}`);
    console.log(`📂 Project:     ${PROJECT_ROOT}`);
    console.log(`📁 Docs:        ${DOCS_DIR}`);
    console.log('\n💡 Features:');
    console.log('   • Dynamic folder structure');
    console.log('   • Nested navigation');
    console.log('   • Press "/" in browser to search');
    console.log('   • Press Ctrl+C to stop\n');

    // Show discovered docs count
    const structure = buildFolderStructure(DOCS_DIR);
    const totalDocs = countDocs(structure);
    console.log(`📄 Discovered: ${totalDocs} documents\n`);
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
