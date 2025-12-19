#!/usr/bin/env node

/**
 * Weavelight Documentation Viewer Server
 * 
 * Dynamic HTTP server with folder-structure-based organization
 * Run from project root: node dev/docs-viewer/scripts/server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3030;
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
                structure.files.push({
                    path: webPath,
                    title: getTitleFromFilename(item.name),
                    icon: getIconForFile(fullPath, item.name),
                    name: item.name
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

server.listen(PORT, () => {
    console.log('\n┌──────────────────────────────────────────┐');
    console.log('│  📚 Weavelight Documentation Viewer     │');
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
