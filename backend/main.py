import os
import time
import math
import threading
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr, field_validator, ValidationInfo
from typing import List, Literal, Optional
from dotenv import load_dotenv

load_dotenv()

try:
    from knowledge import TEJESH_KNOWLEDGE
except ImportError:
    from .knowledge import TEJESH_KNOWLEDGE

try:
    from contact_email import send_contact_email
except ImportError:
    from .contact_email import send_contact_email

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
    messages: List[ChatMessage] = Field(..., max_length=8)

rate_limit_lock = threading.Lock()
client_last_request_time = {}

contact_rate_limit_lock = threading.Lock()
contact_client_last_request_time = {}

def parse_rate_limit(env_value: str, fallback: float = 5.0) -> float:
    try:
        val = float(env_value)
        if not math.isfinite(val) or val <= 0:
            return fallback
        return val
    except (ValueError, TypeError):
        return fallback

@app.post("/api/chat")
def chat_endpoint(request: Request, chat_req: ChatRequest):
    client_ip = request.client.host if request.client else "unknown"
    now = time.monotonic()

    rate_limit_seconds = parse_rate_limit(os.getenv("CHAT_RATE_LIMIT_SECONDS", "5.0"))

    with rate_limit_lock:
        # Cleanup expired items
        expired_ips = [ip for ip, t in client_last_request_time.items() if now - t >= rate_limit_seconds]
        for ip in expired_ips:
            del client_last_request_time[ip]

        if client_ip in client_last_request_time:
            if now - client_last_request_time[client_ip] < rate_limit_seconds:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please wait a few seconds before messaging again."
                )

        client_last_request_time[client_ip] = now

    api_key = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    if not api_key or api_key == "your_gemini_api_key_here":
        print("Diagnostic [Ask Tejesh]: GEMINI_API_KEY is missing or unconfigured.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI Assistant is currently unavailable due to missing configuration."
        )

    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=api_key, http_options={'timeout': 30000})
    except Exception as e:
        print(f"Diagnostic [Ask Tejesh]: Failed to initialize the AI provider. Type: {type(e).__name__}, Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize the AI provider."
        )

    history_messages = chat_req.messages

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
    except Exception as e:
        error_msg = f"Diagnostic [Ask Tejesh]: Gemini API generation failed. Type: {type(e).__name__}"
        if hasattr(e, 'code'):
            error_msg += f", Status/Code: {e.code}"
        if hasattr(e, 'message'):
            error_msg += f", Message: {e.message}"
        else:
            # Safely log the string representation of the error
            error_msg += f", Details: {str(e)}"
        print(error_msg)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI provider failed to generate a response or timed out. Please try again."
        )

class ContactRequest(BaseModel):
    firstName: str = Field(..., max_length=100)
    lastName: str = Field(..., max_length=100)
    email: EmailStr
    confirmEmail: EmailStr
    phone: Optional[str] = Field(default="", max_length=50)
    message: str = Field(..., min_length=1, max_length=3000)
    honeypot: Optional[str] = None

    @field_validator("firstName", "lastName")
    @classmethod
    def validate_name(cls, v: str) -> str:
        # Reject control characters (CR, LF, etc.) before stripping
        if any(ord(c) < 32 for c in v):
            raise ValueError("Name contains invalid characters.")
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty or just whitespace.")
        return v

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Message cannot be empty or just whitespace.")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> str:
        if v is None:
            return ""
        return v.strip()

@app.post("/api/contact")
def contact_endpoint(request: Request, contact_req: ContactRequest):
    # Validation: Confirm email matching (case-insensitive)
    if contact_req.email.lower() != contact_req.confirmEmail.lower():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Emails do not match.")

    # Honeypot check: If filled, act like it succeeded but do nothing.
    if contact_req.honeypot:
        return {"status": "success", "message": "Enquiry submitted successfully."}

    client_ip = request.client.host if request.client else "unknown"
    now = time.monotonic()

    rate_limit_seconds = parse_rate_limit(os.getenv("CONTACT_RATE_LIMIT_SECONDS", "60.0"), fallback=60.0)

    with contact_rate_limit_lock:
        # Cleanup expired items
        expired_ips = [ip for ip, t in contact_client_last_request_time.items() if now - t >= rate_limit_seconds]
        for ip in expired_ips:
            del contact_client_last_request_time[ip]

        if client_ip in contact_client_last_request_time:
            if now - contact_client_last_request_time[client_ip] < rate_limit_seconds:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please wait before submitting another enquiry."
                )

        contact_client_last_request_time[client_ip] = now

    # Send email
    success = send_contact_email(
        first_name=contact_req.firstName.strip(),
        last_name=contact_req.lastName.strip(),
        email=contact_req.email.strip(),
        phone=contact_req.phone.strip(),
        message=contact_req.message.strip()
    )

    if not success:
        # Diagnostics for contact email failure are logged in send_contact_email
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to send the enquiry due to server configuration or delivery error."
        )

    return {"status": "success", "message": "Enquiry submitted successfully."}
