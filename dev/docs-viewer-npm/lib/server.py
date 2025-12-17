#!/usr/bin/env python3
"""
@thejackluo/docs-viewer
Python HTTP server for documentation viewer (alternative to Node.js server)

Usage: python lib/server.py [docs_directory]
"""

import http.server
import socketserver
import os
import sys
import json
from pathlib import Path
from urllib.parse import urlparse

PORT = 3030

def get_icon_for_file(file_path, file_name):
    """Determine icon based on file path and name"""
    lower = file_name.lower()
    
    # Specific file matches
    if 'prd' in lower or 'requirements' in lower:
        return 'file-text'
    if 'design' in lower or 'ux' in lower:
        return 'layout'
    if 'brief' in lower:
        return 'clipboard'
    if 'guide' in lower:
        return 'book'
    if 'reference' in lower:
        return 'zap'
    if 'backend' in lower:
        return 'server'
    if 'mvp' in lower:
        return 'target'
    if 'ai' in lower:
        return 'cpu'
    if 'setup' in lower:
        return 'settings'
    if 'tts' in lower or 'audio' in lower:
        return 'volume-2'
    if 'research' in lower or 'market' in lower:
        return 'bar-chart-2'
    if 'architecture' in lower:
        return 'box'
    if 'api' in lower:
        return 'plug'
    if 'test' in lower:
        return 'check-circle'
    
    return 'file-text'

def get_title_from_filename(file_name):
    """Convert filename to friendly title"""
    title = file_name.replace('.md', '').replace('-', ' ').replace('_', ' ')
    return ' '.join(word.capitalize() for word in title.split())

def build_folder_structure(docs_dir, base_path=''):
    """Build nested folder structure"""
    structure = {
        'folders': {},
        'files': []
    }
    
    try:
        items = sorted(os.listdir(docs_dir))
        
        for item in items:
            # Skip hidden items and node_modules
            if item.startswith('.') or item == 'node_modules':
                continue
            
            full_path = os.path.join(docs_dir, item)
            relative_path = os.path.join(base_path, item) if base_path else item
            
            if os.path.isdir(full_path):
                # Recursively build folder structure
                structure['folders'][item] = build_folder_structure(
                    full_path, 
                    relative_path
                )
            elif os.path.isfile(full_path) and item.endswith('.md'):
                web_path = os.path.join('docs', relative_path).replace('\\', '/')
                structure['files'].append({
                    'path': web_path,
                    'title': get_title_from_filename(item),
                    'icon': get_icon_for_file(full_path, item),
                    'name': item
                })
        
        # Sort files by title
        structure['files'].sort(key=lambda x: x['title'])
        
    except Exception as e:
        print(f"Error scanning directory: {e}", file=sys.stderr)
    
    return structure

def count_docs(structure):
    """Count total documents recursively"""
    count = len(structure.get('files', []))
    for folder in structure.get('folders', {}).values():
        count += count_docs(folder)
    return count

class DocsViewerHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler for documentation viewer"""
    
    def __init__(self, *args, **kwargs):
        self.docs_dir = Path(__file__).parent.parent.parent.parent / 'docs'
        project_root = Path(__file__).parent.parent.parent.parent
        super().__init__(*args, directory=str(project_root), **kwargs)
    
    def end_headers(self):
        """Add CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        # API endpoint for folder structure
        if parsed_path.path == '/api/docs':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            structure = build_folder_structure(self.docs_dir)
            
            self.wfile.write(json.dumps(structure, indent=2).encode())
            return
        
        # Root serves the viewer index.html
        if self.path == '/' or self.path == '/index.html':
            self.path = '/dev/docs-viewer/index.html'
        
        return super().do_GET()
    
    def log_message(self, format, *args):
        """Custom logging format"""
        print(f"{self.command} {args[0]}")

def main():
    """Start the documentation server"""
    script_dir = Path(__file__).parent.parent
    project_root = script_dir.parent.parent
    docs_dir = project_root / 'docs'
    
    # Change to project root
    os.chdir(project_root)
    
    # Create server
    with socketserver.TCPServer(("", PORT), DocsViewerHandler) as httpd:
        print("\n" + "="*44)
        print(" Weavelight Documentation Viewer")
        print("="*44 + "\n")
        print(f"Server:      http://localhost:{PORT}")
        print(f"Project:     {project_root}")
        print(f"Docs:        {docs_dir}")
        print("\nFeatures:")
        print("   - Dynamic folder structure")
        print("   - Nested navigation")
        print("   - Press / in browser to search")
        print("   - Press Ctrl+C to stop\n")
        
        # Show discovered docs count
        structure = build_folder_structure(docs_dir)
        total_docs = count_docs(structure)
        print(f"Discovered: {total_docs} documents\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped. Goodbye!\n")
            sys.exit(0)

if __name__ == "__main__":
    main()
