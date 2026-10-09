# portfolio
Personal portfolio scaffold currently under construction.

## Technologies
- Frontend: React + Vite (JavaScript)
- Backend: FastAPI (Python)

## Status
- **Current phase**: Foundational scaffold.
- **Not implemented**: Visual design, dotted hero interaction, AI assistant, contact form, project pages, routing, deployment.

## Prerequisites
- Node.js (v20+)
- Python (3.11+)

## Setup Instructions

### Frontend
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
- Local URL: `http://localhost:5173` (default)

### Backend
1. Create a virtual environment: `python3 -m venv backend/.venv`
2. Activate virtual environment (macOS/Linux): `source backend/.venv/bin/activate`
3. Install dependencies: `pip install -r backend/requirements.txt`
4. Start development server: `uvicorn backend.main:app --reload`
- Local URL: `http://127.0.0.1:8000`
- Health check: `http://127.0.0.1:8000/health` (Expected response: `{"status": "ok"}`)

### Configuration
Backend reads allowed CORS origins from the `FRONTEND_ORIGINS` environment variable. By default, it allows `http://localhost:5173` and `http://127.0.0.1:5173`.
