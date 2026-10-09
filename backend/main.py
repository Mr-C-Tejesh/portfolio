import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
