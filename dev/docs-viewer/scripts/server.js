#!/usr/bin/env node

/**
 * Weavelight Documentation Viewer Server
 * 
 * Simple HTTP server for viewing project documentation
 * Run from project root: node dev/docs-viewer/scripts/server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3030;
const PROJECT_ROOT = path.join(__dirname, '../../..');
const VIEWER_DIR = path.join(__dirname, '..');

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
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    let filePath;
    
    // Root serves the index.html from viewer directory
    if (req.url === '/' || req.url === '/index.html') {
        filePath = path.join(VIEWER_DIR, 'index.html');
    } 
    // Other requests are resolved relative to project root
    else {
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

server.listen(PORT, () => {
    console.log('\n┌──────────────────────────────────────────┐');
    console.log('│  📚 Weavelight Documentation Viewer     │');
    console.log('└──────────────────────────────────────────┘\n');
    console.log(`🌐 Server:      http://localhost:${PORT}`);
    console.log(`📂 Project:     ${PROJECT_ROOT}`);
    console.log(`📁 Viewer:      ${VIEWER_DIR}`);
    console.log('\n💡 Tips:');
    console.log('   • Press "/" in browser to search');
    console.log('   • Press Ctrl+C to stop server');
    console.log('   • Modern UI with glassmorphism\n');
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
