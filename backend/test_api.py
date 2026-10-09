import os
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_chat_missing_config(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "")
    response = client.post("/api/chat", json={"messages": [{"role": "user", "content": "hi"}]})
    assert response.status_code == 500
    assert "missing configuration" in response.json()["detail"]

def test_chat_validation_error(monkeypatch):
    # Invalid role
    response = client.post("/api/chat", json={"messages": [{"role": "hacker", "content": "hi"}]})
    assert response.status_code == 422
    
    # Message too long
    response = client.post("/api/chat", json={"messages": [{"role": "user", "content": "a" * 2000}]})
    assert response.status_code == 422

def test_chat_success(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "fake_key")
    
    class FakeResponse:
        text = "Hello, I am Ask Tejesh."
        
    class FakeModels:
        def generate_content(self, model, contents, config):
            return FakeResponse()

    class FakeClient:
        def __init__(self, api_key):
            self.models = FakeModels()

    import google.genai as genai
    monkeypatch.setattr(genai, "Client", FakeClient)
    
    # Reset rate limit state for testclient
    from backend.main import client_last_request_time
    if "testclient" in client_last_request_time:
        del client_last_request_time["testclient"]
        
    response = client.post("/api/chat", json={"messages": [{"role": "user", "content": "hi"}]})
    assert response.status_code == 200
    assert response.json() == {"response": "Hello, I am Ask Tejesh."}
