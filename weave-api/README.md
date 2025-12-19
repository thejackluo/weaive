# Weave API

FastAPI backend for Weave MVP.

## Prerequisites

- Python 3.11+
- uv package manager

### Installing uv

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
pip install uv
```

## Setup Instructions

### 1. Install Dependencies

```bash
uv sync
```

This will create a virtual environment in `.venv/` and install all dependencies.

### 2. Configure Environment Variables

Copy the example environment file:

```bash
# macOS/Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Then edit `.env` and add your actual credentials.

### 3. Run Development Server

```bash
uv run uvicorn app.main:app --reload
```

The API will be available at: http://localhost:8000

**Note:** Always use `uv run` to execute commands in the virtual environment. This ensures you're using the correct Python version and dependencies.

### 4. View API Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Available Commands

All commands should be run with `uv run` to use the virtual environment:

- `uv run uvicorn app.main:app --reload` - Start development server
- `uv sync` - Install/update dependencies
- `uv run ruff check .` - Run linter
- `uv run ruff check . --fix` - Run linter and auto-fix issues
- `uv run pytest` - Run tests
- `uv run pytest -v` - Run tests with verbose output

**Important:** When using `uv`, always prefix commands with `uv run` to ensure they execute in the correct virtual environment. Direct commands like `uvicorn` or `ruff` won't work unless they're installed globally.

## API Endpoints

### Health Check
GET /health

### Root
GET /

## Next Steps

- Story 0.2: Database schema
- Story 0.3: Authentication
- Story 0.6: AI service
