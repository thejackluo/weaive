#!/bin/bash
# Cross-platform script to remove .venv and run the development server
# Works on macOS, Linux, and WSL
# Usage: ./run-dev.sh [--port 8002]

set -e  # Exit on error

# Default port
PORT=8002

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --port)
            PORT="$2"
            shift 2
            ;;
        -p)
            PORT="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--port PORT] or [-p PORT]"
            exit 1
            ;;
    esac
done

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
echo "   Command: uv run uvicorn app.main:app --reload --host 0.0.0.0 --port $PORT"
echo ""

# Run the uvicorn server
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port $PORT

