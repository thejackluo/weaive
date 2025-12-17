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
cp .env.example .env
```

Then edit `.env` and add your actual credentials.

### 3. Run Development Server

```bash
uvicorn app.main:app --reload
```

The API will be available at: http://localhost:8000

### 4. View API Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Available Commands

- `uvicorn app.main:app --reload` - Start development server
- `uv sync` - Install/update dependencies
- `ruff check .` - Run linter

## API Endpoints

### Health Check
GET /health

### Root
GET /

## Next Steps

- Story 0.2: Database schema
- Story 0.3: Authentication
- Story 0.6: AI service
