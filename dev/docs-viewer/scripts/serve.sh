#!/bin/bash

# Documentation Viewer - Bash Launcher
# Run from project root: ./dev/docs-viewer/scripts/serve.sh

PORT=3030
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VIEWER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

echo ""
echo "┌──────────────────────────────────────────┐"
echo "│  📚 Documentation Viewer                │"
echo "└──────────────────────────────────────────┘"
echo ""
echo "🌐 Server:      http://localhost:$PORT"
echo "📂 Project:     $PROJECT_ROOT"
echo "📁 Viewer:      $VIEWER_DIR"
echo ""
echo "💡 Tips:"
echo "   • Press \"/\" in browser to search"
echo "   • Press Ctrl+C to stop server"
echo "   • Modern UI with glassmorphism"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# Try Node.js first
if command -v node &> /dev/null; then
    echo "🚀 Starting with Node.js..."
    echo ""
    node "$SCRIPT_DIR/server.js"
# Then try Python
elif command -v python3 &> /dev/null; then
    echo "🚀 Starting with Python..."
    echo ""
    python3 "$SCRIPT_DIR/server.py"
elif command -v python &> /dev/null; then
    echo "🚀 Starting with Python..."
    echo ""
    python "$SCRIPT_DIR/server.py"
# Fallback message
else
    echo ""
    echo "❌ Error: Neither Node.js nor Python found!"
    echo ""
    echo "Please install one of:"
    echo "  • Node.js: https://nodejs.org/"
    echo "  • Python 3: https://www.python.org/downloads/"
    echo ""
    exit 1
fi
