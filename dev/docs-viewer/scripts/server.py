#!/usr/bin/env python3
"""
Weavelight Documentation Viewer Server

Dynamic HTTP server with automatic document discovery
Run from project root: python dev/docs-viewer/scripts/server.py
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
    path_lower = str(file_path).lower()
    
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
    
    # Path-based categorization
    if 'setup' in path_lower:
        return 'settings'
    if 'dev' in path_lower:
        return 'code'
    if 'idea' in path_lower:
        return 'sparkles'
    if 'analysis' in path_lower or 'research' in path_lower:
        return 'bar-chart-2'
    
    return 'file-text'

def get_category_from_path(file_path):
    """Extract category from file path"""
    parts = Path(file_path).parts
    
    try:
        docs_index = parts.index('docs')
        if len(parts) > docs_index + 1:
            category = parts[docs_index + 1]
            
            # Map to friendly names
            if category == 'dev':
                return 'Development'
            if category == 'setup':
                return 'Setup'
            if category == 'analysis':
                if 'research' in str(file_path).lower():
                    return 'Research'
                return 'Product'
            if category == 'idea':
                return 'Development'
            
            return category.capitalize()
    except (ValueError, IndexError):
        pass
    
    return 'Documentation'

def get_title_from_filename(file_name):
    """Convert filename to friendly title"""
    title = file_name.replace('.md', '').replace('-', ' ').replace('_', ' ')
    return ' '.join(word.capitalize() for word in title.split())

def scan_docs_directory(docs_dir):
    """Recursively scan directory for markdown files"""
    docs = []
    
    try:
        for root, dirs, files in os.walk(docs_dir):
            # Skip hidden directories
            dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
            
            for file in files:
                if file.endswith('.md'):
                    full_path = Path(root) / file
                    relative_path = full_path.relative_to(docs_dir.parent)
                    web_path = str(relative_path).replace('\\', '/')
                    
                    docs.append({
                        'path': web_path,
                        'title': get_title_from_filename(file),
                        'category': get_category_from_path(full_path),
                        'icon': get_icon_for_file(full_path, file)
                    })
    except Exception as e:
        print(f"Error scanning directory: {e}", file=sys.stderr)
    
    return docs

def organize_docs(docs):
    """Organize docs by category"""
    organized = {}
    
    for doc in docs:
        category = doc['category']
        if category not in organized:
            organized[category] = []
        organized[category].append(doc)
    
    # Sort categories
    sort_order = ['Product', 'Development', 'Setup', 'Research', 'Documentation']
    sorted_dict = {}
    
    for cat in sort_order:
        if cat in organized:
            sorted_dict[cat] = sorted(organized[cat], key=lambda x: x['title'])
    
    # Add remaining categories
    for cat in sorted(organized.keys()):
        if cat not in sorted_dict:
            sorted_dict[cat] = sorted(organized[cat], key=lambda x: x['title'])
    
    return sorted_dict

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
        
        # API endpoint for dynamic document discovery
        if parsed_path.path == '/api/docs':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            all_docs = scan_docs_directory(self.docs_dir)
            organized = organize_docs(all_docs)
            
            self.wfile.write(json.dumps(organized, indent=2).encode())
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
        print("   - Dynamic document discovery")
        print("   - Auto-categorization")
        print("   - Press / in browser to search")
        print("   - Press Ctrl+C to stop\n")
        
        # Show discovered docs count
        all_docs = scan_docs_directory(docs_dir)
        print(f"Discovered: {len(all_docs)} documents\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n✨ Server stopped. Goodbye!\n")
            sys.exit(0)

if __name__ == "__main__":
    main()
