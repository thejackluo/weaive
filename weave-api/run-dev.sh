#!/bin/bash
# Cross-platform script to remove .venv and run the development server
# Works on macOS, Linux, and WSL

set -e  # Exit on error

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Removing .venv directory if it exists..."
if [ -d ".venv" ]; then
    rm -rf .venv
    echo "[OK] .venv removed successfully"
else
    echo "[INFO] .venv directory not found, skipping removal"
fi

echo ""
echo "Starting development server..."
echo "   Command: uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8002"
echo ""

# Run the uvicorn server
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8002

