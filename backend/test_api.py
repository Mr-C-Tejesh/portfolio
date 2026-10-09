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
            assert model == "gemini-2.5-flash"
            # In google.genai, config is an object or dictionary. Let's check attributes.
            assert getattr(config, 'system_instruction', None) is not None
            # Ensure temperature is not provided
            assert getattr(config, 'temperature', None) is None
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

    def mock_send_contact_email(name, email, message):
        return True

    import backend.main
    monkeypatch.setattr(backend.main, "send_contact_email", mock_send_contact_email)

    from backend.main import contact_client_last_request_time, contact_rate_limit_lock
    with contact_rate_limit_lock:
        if "testclient" in contact_client_last_request_time:
            del contact_client_last_request_time["testclient"]

    response = client.post("/api/contact", json={
        "name": "John Doe",
        "email": "john@example.com",
        "message": "Hello world"
    })

    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_contact_invalid_email(monkeypatch):
    response = client.post("/api/contact", json={
        "name": "John Doe",
        "email": "not-an-email",
        "message": "Hello world"
    })
    assert response.status_code == 422


def test_contact_missing_fields(monkeypatch):
    monkeypatch.setenv("CONTACT_RATE_LIMIT_SECONDS", "0.001")
    from backend.main import contact_client_last_request_time, contact_rate_limit_lock
    with contact_rate_limit_lock:
        if "testclient" in contact_client_last_request_time:
            del contact_client_last_request_time["testclient"]

    response = client.post("/api/contact", json={
        "email": "john@example.com",
        "message": "Hello world"
    })
    assert response.status_code == 422

def test_contact_message_too_long(monkeypatch):
    response = client.post("/api/contact", json={
        "name": "John Doe",
        "email": "john@example.com",
        "message": "A" * 3001
    })
    assert response.status_code == 422

def test_contact_provider_failure(monkeypatch):
    monkeypatch.setenv("CONTACT_RATE_LIMIT_SECONDS", "0.001")

    def mock_send_contact_email(name, email, message):
        return False

    import backend.main
    monkeypatch.setattr(backend.main, "send_contact_email", mock_send_contact_email)

    response = client.post("/api/contact", json={
        "name": "John Doe",
        "email": "john@example.com",
        "message": "Hello world"
    })
    assert response.status_code == 503
    assert "Failed to send the enquiry" in response.json()["detail"]

def test_contact_rate_limiting(monkeypatch):
    monkeypatch.setenv("CONTACT_RATE_LIMIT_SECONDS", "100.0")

    def mock_send_contact_email(name, email, message):
        return True

    import backend.main
    monkeypatch.setattr(backend.main, "send_contact_email", mock_send_contact_email)

    from backend.main import contact_client_last_request_time, contact_rate_limit_lock
    with contact_rate_limit_lock:
        if "testclient" in contact_client_last_request_time:
            del contact_client_last_request_time["testclient"]

    response1 = client.post("/api/contact", json={
        "name": "John Doe",
        "email": "john@example.com",
        "message": "Hello world"
    })
    assert response1.status_code == 200

    response2 = client.post("/api/contact", json={
        "name": "John Doe",
        "email": "john@example.com",
        "message": "Hello world"
    })
    assert response2.status_code == 429
    assert "Rate limit exceeded" in response2.json()["detail"]

    with contact_rate_limit_lock:
        if "testclient" in contact_client_last_request_time:
            del contact_client_last_request_time["testclient"]

def test_contact_honeypot(monkeypatch):
    response = client.post("/api/contact", json={
        "name": "John Doe",
        "email": "john@example.com",
        "message": "Hello world",
        "honeypot": "spam bot value"
    })
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_contact_validation_names(monkeypatch):
    # Empty name
    res1 = client.post("/api/contact", json={
        "name": "   ",
        "email": "a@example.com",
        "message": "Valid message"
    })
    assert res1.status_code == 422

    # Control character in name
    res2 = client.post("/api/contact", json={
        "name": "John\nDoe",
        "email": "a@example.com",
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
        "name": "Jean-Luc O'Connor",
        "email": "a@example.com",
        "message": "Valid message"
    })
    assert res3.status_code == 200

def test_contact_validation_message(monkeypatch):
    # Empty message
    res = client.post("/api/contact", json={
        "name": "John Doe",
        "email": "a@example.com",
        "message": "   \n  "
    })
    assert res.status_code == 422

# --- CONTACT EMAIL UNIT TESTS ---

def test_send_contact_email_success(monkeypatch):
    monkeypatch.setenv("GMAIL_CLIENT_ID", "test_client_id")
    monkeypatch.setenv("GMAIL_CLIENT_SECRET", "test_client_secret")
    monkeypatch.setenv("GMAIL_REFRESH_TOKEN", "test_refresh_token")
    monkeypatch.setenv("GMAIL_SENDER_EMAIL", "from@example.com")
    monkeypatch.setenv("CONTACT_TO_EMAIL", "to@example.com")

    post_args = {}

    class FakeResponse:
        def raise_for_status(self):
            pass
        def json(self):
            return {"access_token": "fake_access_token"}

    def fake_post(url, **kwargs):
        if url == "https://oauth2.googleapis.com/token":
            return FakeResponse()
        elif url == "https://gmail.googleapis.com/gmail/v1/users/me/messages/send":
            post_args.update(kwargs)
            return FakeResponse()

    import requests
    monkeypatch.setattr(requests, "post", fake_post)

    from backend.contact_email import send_contact_email

    success = send_contact_email(
        name="<script>alert(1)</script> Doe",
        email="visitor@example.com",
        message="Hello!\nNew line here."
    )

    assert success is True
    assert "headers" in post_args
    assert post_args["headers"]["Authorization"] == "Bearer fake_access_token"
    assert "json" in post_args
    assert "raw" in post_args["json"]

    import base64
    raw_decoded = base64.urlsafe_b64decode(post_args["json"]["raw"]).decode()

    import email
    msg = email.message_from_string(raw_decoded)

    assert msg["To"] == "to@example.com"
    assert msg["From"] == "from@example.com"
    assert msg["Reply-To"] == "visitor@example.com"

    from email.header import decode_header
    decoded_subject = "".join([
        t[0].decode(t[1] or "utf-8") if isinstance(t[0], bytes) else t[0]
        for t in decode_header(msg["Subject"])
    ])
    assert "New portfolio enquiry" in decoded_subject

    # Check body
    plain_part = msg.get_payload(0).get_payload()
    html_part = msg.get_payload(1).get_payload()

    # Check escaping in HTML
    assert "&lt;script&gt;alert(1)&lt;/script&gt;" in html_part
    # Check newline replacement
    assert "Hello!<br>New line here." in html_part

    # Text content should have un-escaped but raw string
    assert "<script>alert(1)</script>" in plain_part
    assert "Hello!\nNew line here." in plain_part

def test_send_contact_email_missing_config(monkeypatch, capsys):
    monkeypatch.setenv("GMAIL_REFRESH_TOKEN", "")

    from backend.contact_email import send_contact_email
    success = send_contact_email("John Doe", "test@example.com", "Hi")
    assert success is False

    captured = capsys.readouterr()
    assert "Diagnostic [Contact]: Email service missing configuration" in captured.out
    assert "GMAIL_REFRESH_TOKEN" in captured.out

def test_send_contact_email_provider_error(monkeypatch, capsys):
    monkeypatch.setenv("GMAIL_CLIENT_ID", "test_client_id")
    monkeypatch.setenv("GMAIL_CLIENT_SECRET", "test_client_secret")
    monkeypatch.setenv("GMAIL_REFRESH_TOKEN", "secret_gmail_refresh_token_123")
    monkeypatch.setenv("GMAIL_SENDER_EMAIL", "from@example.com")
    monkeypatch.setenv("CONTACT_TO_EMAIL", "to@example.com")

    class FakeResponse:
        def raise_for_status(self):
            pass
        def json(self):
            return {"access_token": "fake_access_token"}

    def fake_post(url, **kwargs):
        if url == "https://oauth2.googleapis.com/token":
            return FakeResponse()
        elif url == "https://gmail.googleapis.com/gmail/v1/users/me/messages/send":
            raise Exception("API error inside Gmail provider")

    import requests
    monkeypatch.setattr(requests, "post", fake_post)

    from backend.contact_email import send_contact_email
    success = send_contact_email("John Doe", "test@example.com", "Hi")
    assert success is False

    captured = capsys.readouterr()
    assert "Diagnostic [Contact]: Gmail API email delivery failed" in captured.out
    assert "secret_gmail_refresh_token_123" not in captured.out
    assert "API error inside Gmail provider" in captured.out
