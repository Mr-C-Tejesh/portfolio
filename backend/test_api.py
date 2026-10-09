import os
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_chat_missing_config(monkeypatch, capsys):
    monkeypatch.setenv("GEMINI_API_KEY", "")
    response = client.post("/api/chat", json={"messages": [{"role": "user", "content": "hi"}]})
    assert response.status_code == 500
    assert "missing configuration" in response.json()["detail"]

    captured = capsys.readouterr()
    assert "Diagnostic [Ask Tejesh]: GEMINI_API_KEY is missing or unconfigured." in captured.out

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

def test_chat_provider_error(monkeypatch, capsys):
    monkeypatch.setenv("GEMINI_API_KEY", "fake_key_123")

    class FakeModels:
        def generate_content(self, model, contents, config):
            raise Exception("Gemini Internal Server Error")

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
    assert response.status_code == 503

    captured = capsys.readouterr()
    assert "Diagnostic [Ask Tejesh]: Gemini API generation failed" in captured.out
    assert "fake_key_123" not in captured.out
    assert "Gemini Internal Server Error" in captured.out

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

@pytest.mark.parametrize("value,fallback,expected", [
    ("not-a-number", None, 5.0),
    ("", None, 5.0),
    ("0", None, 5.0),
    ("-1", None, 5.0),
    ("nan", None, 5.0),
    ("inf", None, 5.0),
    ("-inf", None, 5.0),
    ("10.5", None, 10.5),
    # Test with custom fallback
    ("not-a-number", 60.0, 60.0),
    ("", 60.0, 60.0),
    ("0", 60.0, 60.0),
    ("-1", 60.0, 60.0),
    ("nan", 60.0, 60.0),
    ("inf", 60.0, 60.0),
    ("-inf", 60.0, 60.0),
    ("10.5", 60.0, 10.5),
])
def test_parse_rate_limit(value, fallback, expected):
    from backend.main import parse_rate_limit
    if fallback is None:
        assert parse_rate_limit(value) == expected
    else:
        assert parse_rate_limit(value, fallback=fallback) == expected

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

def test_contact_validation_names(monkeypatch):
    # Empty name
    res1 = client.post("/api/contact", json={
        "firstName": "   ",
        "lastName": "Doe",
        "email": "a@example.com",
        "confirmEmail": "a@example.com",
        "phone": "",
        "message": "Valid message"
    })
    assert res1.status_code == 422

    # Control character in name
    res2 = client.post("/api/contact", json={
        "firstName": "John\n",
        "lastName": "Doe",
        "email": "a@example.com",
        "confirmEmail": "a@example.com",
        "phone": "",
        "message": "Valid message"
    })
    assert res2.status_code == 422

    # Valid name with symbols
    monkeypatch.setenv("CONTACT_RATE_LIMIT_SECONDS", "0.001")
    monkeypatch.setattr("backend.main.send_contact_email", lambda *a, **k: True)
    from backend.main import contact_client_last_request_time, contact_rate_limit_lock
    with contact_rate_limit_lock:
        if "testclient" in contact_client_last_request_time:
            del contact_client_last_request_time["testclient"]

    res3 = client.post("/api/contact", json={
        "firstName": "Jean-Luc",
        "lastName": "O'Connor",
        "email": "a@example.com",
        "confirmEmail": "a@example.com",
        "phone": "",
        "message": "Valid message"
    })
    assert res3.status_code == 200

def test_contact_validation_message(monkeypatch):
    # Empty message
    res = client.post("/api/contact", json={
        "firstName": "John",
        "lastName": "Doe",
        "email": "a@example.com",
        "confirmEmail": "a@example.com",
        "phone": "",
        "message": "   \n  "
    })
    assert res.status_code == 422

# --- CONTACT EMAIL UNIT TESTS ---

def test_send_contact_email_success(monkeypatch):
    monkeypatch.setenv("RESEND_API_KEY", "test_key")
    monkeypatch.setenv("CONTACT_TO_EMAIL", "to@example.com")
    monkeypatch.setenv("CONTACT_FROM_EMAIL", "from@example.com")

    call_args = {}

    class FakeEmails:
        @staticmethod
        def send(kwargs):
            call_args.update(kwargs)
            return {"id": "email_123"}

    class FakeResend:
        api_key = "test_key"
        Emails = FakeEmails()

    import sys
    # Monkeypatch the resend module directly
    monkeypatch.setattr("backend.contact_email.resend", FakeResend)

    from backend.contact_email import send_contact_email

    success = send_contact_email(
        first_name="<script>alert(1)</script>",
        last_name="Doe",
        email="visitor@example.com",
        phone="555-1234",
        message="Hello!\nNew line here."
    )

    assert success is True
    assert call_args["to"] == "to@example.com"
    assert call_args["from"] == "from@example.com"
    assert call_args["reply_to"] == "visitor@example.com"
    assert call_args["subject"] == "New portfolio enquiry — <script>alert(1)</script> Doe"

    # Check escaping in HTML
    assert "&lt;script&gt;alert(1)&lt;/script&gt;" in call_args["html"]
    # Check newline replacement
    assert "Hello!<br>New line here." in call_args["html"]

    # Text content should have un-escaped but raw string
    assert "<script>alert(1)</script>" in call_args["text"]
    assert "Hello!\nNew line here." in call_args["text"]

def test_send_contact_email_missing_config(monkeypatch, capsys):
    monkeypatch.setenv("RESEND_API_KEY", "")

    from backend.contact_email import send_contact_email
    success = send_contact_email("John", "Doe", "test@example.com", "", "Hi")
    assert success is False

    captured = capsys.readouterr()
    assert "Diagnostic [Contact]: Email service missing configuration" in captured.out
    assert "RESEND_API_KEY" in captured.out

def test_send_contact_email_provider_error(monkeypatch, capsys):
    monkeypatch.setenv("RESEND_API_KEY", "secret_resend_key_123")
    monkeypatch.setenv("CONTACT_TO_EMAIL", "to@example.com")
    monkeypatch.setenv("CONTACT_FROM_EMAIL", "from@example.com")

    class FakeEmails:
        @staticmethod
        def send(kwargs):
            raise Exception("API error inside provider")

    class FakeResend:
        api_key = "secret_resend_key_123"
        Emails = FakeEmails()

    monkeypatch.setattr("backend.contact_email.resend", FakeResend)

    from backend.contact_email import send_contact_email
    success = send_contact_email("John", "Doe", "test@example.com", "", "Hi")
    assert success is False

    captured = capsys.readouterr()
    assert "Diagnostic [Contact]: Resend API email delivery failed" in captured.out
    assert "secret_resend_key_123" not in captured.out
    assert "API error inside provider" in captured.out
