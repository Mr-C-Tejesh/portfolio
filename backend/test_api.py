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
        def __init__(self, api_key, **kwargs):
            self.models = FakeModels()

    import google.genai as genai
    monkeypatch.setattr(genai, "Client", FakeClient)

    # Reset rate limit state for testclient
    from backend.main import client_last_request_time, rate_limit_lock
    with rate_limit_lock:
        if "testclient" in client_last_request_time:
            del client_last_request_time["testclient"]

    response = client.post("/api/chat", json={"messages": [{"role": "user", "content": "hi"}]})
    assert response.status_code == 200
    assert response.json() == {"response": "Hello, I am Ask Tejesh."}

def test_chat_exceeds_max_messages(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "fake_key")
    messages = [{"role": "user", "content": f"msg {i}"} for i in range(9)]
    response = client.post("/api/chat", json={"messages": messages})
    assert response.status_code == 422

def test_rate_limiting(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "fake_key")
    monkeypatch.setenv("CHAT_RATE_LIMIT_SECONDS", "100.0")

    class FakeResponse:
        text = "Hello, rate limit test."

    class FakeModels:
        def generate_content(self, model, contents, config):
            return FakeResponse()

    class FakeClient:
        def __init__(self, api_key, **kwargs):
            self.models = FakeModels()

    import google.genai as genai
    monkeypatch.setattr(genai, "Client", FakeClient)

    from backend.main import client_last_request_time, rate_limit_lock

    with rate_limit_lock:
        if "testclient" in client_last_request_time:
            del client_last_request_time["testclient"]

    # First request
    response1 = client.post("/api/chat", json={"messages": [{"role": "user", "content": "hi"}]})
    assert response1.status_code == 200

    # Second request should be rate limited
    response2 = client.post("/api/chat", json={"messages": [{"role": "user", "content": "hi"}]})
    assert response2.status_code == 429
    assert "Rate limit exceeded" in response2.json()["detail"]

    # Clean up
    with rate_limit_lock:
        if "testclient" in client_last_request_time:
            del client_last_request_time["testclient"]

@pytest.mark.parametrize("value,expected", [
    ("not-a-number", 5.0),
    ("", 5.0),
    ("0", 5.0),
    ("-1", 5.0),
    ("nan", 5.0),
    ("inf", 5.0),
    ("-inf", 5.0),
    ("10.5", 10.5),
])
def test_parse_rate_limit(value, expected):
    from backend.main import parse_rate_limit
    assert parse_rate_limit(value) == expected

# --- CONTACT ENQUIRY TESTS ---

def test_contact_success(monkeypatch):
    monkeypatch.setenv("CONTACT_RATE_LIMIT_SECONDS", "0.001")

    def mock_send_contact_email(first_name, last_name, email, phone, message):
        return True

    import backend.main
    monkeypatch.setattr(backend.main, "send_contact_email", mock_send_contact_email)

    from backend.main import contact_client_last_request_time, contact_rate_limit_lock
    with contact_rate_limit_lock:
        if "testclient" in contact_client_last_request_time:
            del contact_client_last_request_time["testclient"]

    response = client.post("/api/contact", json={
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "confirmEmail": "John@example.com",
        "phone": "1234567890",
        "message": "Hello world"
    })

    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_contact_invalid_email(monkeypatch):
    response = client.post("/api/contact", json={
        "firstName": "John",
        "lastName": "Doe",
        "email": "not-an-email",
        "confirmEmail": "not-an-email",
        "phone": "1234567890",
        "message": "Hello world"
    })
    assert response.status_code == 422

def test_contact_email_mismatch(monkeypatch):
    response = client.post("/api/contact", json={
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "confirmEmail": "jane@example.com",
        "phone": "1234567890",
        "message": "Hello world"
    })
    assert response.status_code == 422
    assert "Emails do not match" in response.json()["detail"]

def test_contact_missing_fields(monkeypatch):
    response = client.post("/api/contact", json={
        "firstName": "John",
        "email": "john@example.com",
        "confirmEmail": "john@example.com",
        "message": "Hello world"
    })
    assert response.status_code == 422

def test_contact_message_too_long(monkeypatch):
    response = client.post("/api/contact", json={
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "confirmEmail": "john@example.com",
        "phone": "1234567890",
        "message": "A" * 3001
    })
    assert response.status_code == 422

def test_contact_provider_failure(monkeypatch):
    monkeypatch.setenv("CONTACT_RATE_LIMIT_SECONDS", "0.001")

    def mock_send_contact_email(first_name, last_name, email, phone, message):
        return False

    import backend.main
    monkeypatch.setattr(backend.main, "send_contact_email", mock_send_contact_email)

    response = client.post("/api/contact", json={
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "confirmEmail": "john@example.com",
        "phone": "1234567890",
        "message": "Hello world"
    })
    assert response.status_code == 503
    assert "Failed to send the enquiry" in response.json()["detail"]

def test_contact_rate_limiting(monkeypatch):
    monkeypatch.setenv("CONTACT_RATE_LIMIT_SECONDS", "100.0")

    def mock_send_contact_email(first_name, last_name, email, phone, message):
        return True

    import backend.main
    monkeypatch.setattr(backend.main, "send_contact_email", mock_send_contact_email)

    from backend.main import contact_client_last_request_time, contact_rate_limit_lock
    with contact_rate_limit_lock:
        if "testclient" in contact_client_last_request_time:
            del contact_client_last_request_time["testclient"]

    response1 = client.post("/api/contact", json={
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "confirmEmail": "john@example.com",
        "phone": "1234567890",
        "message": "Hello world"
    })
    assert response1.status_code == 200

    response2 = client.post("/api/contact", json={
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "confirmEmail": "john@example.com",
        "phone": "1234567890",
        "message": "Hello world"
    })
    assert response2.status_code == 429
    assert "Rate limit exceeded" in response2.json()["detail"]

    with contact_rate_limit_lock:
        if "testclient" in contact_client_last_request_time:
            del contact_client_last_request_time["testclient"]

def test_contact_honeypot(monkeypatch):
    response = client.post("/api/contact", json={
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "confirmEmail": "john@example.com",
        "phone": "1234567890",
        "message": "Hello world",
        "honeypot": "spam bot value"
    })
    assert response.status_code == 200
    assert response.json()["status"] == "success"
