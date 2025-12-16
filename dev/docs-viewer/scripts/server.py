#!/usr/bin/env python3
"""
Weavelight Documentation Viewer Server

Simple HTTP server for viewing project documentation
Run from project root: python dev/docs-viewer/scripts/server.py
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

PORT = 3030

class DocsViewerHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler for documentation viewer"""
    
    def __init__(self, *args, **kwargs):
        # Set the project root as the directory to serve from
        project_root = Path(__file__).parent.parent.parent.parent
        super().__init__(*args, directory=str(project_root), **kwargs)
    
    def end_headers(self):
        """Add CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        # Root serves the viewer index.html
        if self.path == '/' or self.path == '/index.html':
            self.path = '/dev/docs-viewer/index.html'
        
        return super().do_GET()
    
    def log_message(self, format, *args):
        """Custom logging format"""
        print(f"{self.command} {args[0]}")

def main():
    """Start the documentation server"""
    # Get paths
    script_dir = Path(__file__).parent.parent
    project_root = script_dir.parent.parent
    
    # Change to project root
    os.chdir(project_root)
    
    # Create server
    with socketserver.TCPServer(("", PORT), DocsViewerHandler) as httpd:
        print("\n┌──────────────────────────────────────────┐")
        print("│  📚 Weavelight Documentation Viewer     │")
        print("└──────────────────────────────────────────┘\n")
        print(f"🌐 Server:      http://localhost:{PORT}")
        print(f"📂 Project:     {project_root}")
        print(f"📁 Viewer:      {script_dir}")
        print("\n💡 Tips:")
        print("   • Press \"/\" in browser to search")
        print("   • Press Ctrl+C to stop server")
        print("   • Modern UI with glassmorphism\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n✨ Server stopped. Goodbye!\n")
            sys.exit(0)

if __name__ == "__main__":
    main()
