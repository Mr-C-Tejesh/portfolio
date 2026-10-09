# Tejesh C Portfolio

Live website: [https://tejesh-portfolio-8yhq.onrender.com](https://tejesh-portfolio-8yhq.onrender.com/)

A personal portfolio showcasing software engineering and AI projects, built with a Nothing-inspired, monochrome design identity.

## Key Pages
- **Homepage**: A recruiter-first landing page with immediate access to key resources and a curated selection of work.
- **All Work**: A comprehensive gallery of technical projects.
- **Resume**: Downloadable technical resume.
- **Bio-data**: A detailed snapshot of education and focus areas (also accessible as Profile).
- **Ask Tejesh**: A grounded AI assistant that answers questions based on a curated knowledge base.
- **Contact**: A validated contact form that delivers enquiries directly to my inbox.

## Features
- **Recruiter-First Homepage**: Designed for immediate discoverability of resume, profile, and contact links.
- **Grounded AI Assistant**: Integrates Google Gemini with curated system instructions to accurately answer questions without hallucinations.
- **Validated Contact Form**: Server-side validation using Pydantic, with automated email delivery via the Gmail API with OAuth.
- **Project Detail Pages**: In-depth overviews of technical projects.

## Technical Stack
- **Frontend**: React, Vite, React Router
- **Backend**: Python, FastAPI, Pydantic
- **Integrations**: Google Gemini, Gmail API (OAuth)

## Local Development Setup

### Prerequisites
- Node.js (v20+)
- Python (3.11+)

### Frontend
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
- Local URL: `http://localhost:5173`

### Backend
1. Create a virtual environment: `python3 -m venv backend/.venv`
2. Activate virtual environment (macOS/Linux): `source backend/.venv/bin/activate`
3. Install dependencies: `pip install -r backend/requirements.txt`
4. Start development server: `uvicorn backend.main:app --reload`
- Local URL: `http://127.0.0.1:8000`
- Health check: `http://127.0.0.1:8000/health`

## Environment Variables and Secrets
For the backend to function fully, create a `.env` file in the `backend` directory. **Never include real credentials in version control.** Refer to `backend/.env.example` for the required keys:

```env
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GMAIL_CLIENT_ID=your_gmail_client_id_here
GMAIL_CLIENT_SECRET=your_gmail_client_secret_here
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token_here
GMAIL_SENDER_EMAIL=your_sender_email@gmail.com
CONTACT_TO_EMAIL=your_destination_email@example.com
```

Ensure your `.env` is listed in your `.gitignore` file.

## Disclaimer
**Note:** The skin-lesion classifier featured in the portfolio projects is an educational prototype and is not clinically validated. It must not be used for medical diagnoses.
