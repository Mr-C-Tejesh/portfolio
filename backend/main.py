import os
import time
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal
from dotenv import load_dotenv

load_dotenv()

try:
    from knowledge import TEJESH_KNOWLEDGE
except ImportError:
    from .knowledge import TEJESH_KNOWLEDGE

app = FastAPI()

frontend_origins_env = os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in frontend_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., max_length=1500)

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

# Extremely simple in-memory rate limiting for single-instance use
# This is process-local and not distributed, safe for portfolio use.
RATE_LIMIT_SECONDS = 5
client_last_request_time = {}

@app.post("/api/chat")
def chat_endpoint(request: Request, chat_req: ChatRequest):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()

    if client_ip in client_last_request_time:
        if now - client_last_request_time[client_ip] < RATE_LIMIT_SECONDS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please wait a few seconds before messaging again."
            )

    client_last_request_time[client_ip] = now

    api_key = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    if not api_key or api_key == "your_gemini_api_key_here":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI Assistant is currently unavailable due to missing configuration."
        )

    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=api_key)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize the AI provider."
        )

    # Bound conversation history to last 8 messages
    history_messages = chat_req.messages[-8:]

    formatted_contents = []
    for msg in history_messages:
        role = "model" if msg.role == "assistant" else "user"
        formatted_contents.append(
            types.Content(role=role, parts=[types.Part.from_text(text=msg.content)])
        )

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=formatted_contents,
            config=types.GenerateContentConfig(
                system_instruction=TEJESH_KNOWLEDGE,
                max_output_tokens=500,
                temperature=0.3,
            )
        )
        return {"response": response.text}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI provider failed to generate a response or timed out. Please try again."
        )
