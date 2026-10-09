import os
import requests
import base64
from datetime import datetime, timezone
import html
from email.message import EmailMessage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def get_access_token(client_id: str, client_secret: str, refresh_token: str) -> str:
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    response = requests.post(token_url, data=data, timeout=10.0)
    response.raise_for_status()
    return response.json()["access_token"]

def send_contact_email(
    first_name: str,
    last_name: str,
    email: str,
    phone: str,
    message: str
) -> bool:
    """
    Sends a contact notification email using the Gmail API.
    Returns True if successful, False if the delivery fails or configuration is missing.
    """
    client_id = os.environ.get("GMAIL_CLIENT_ID")
    client_secret = os.environ.get("GMAIL_CLIENT_SECRET")
    refresh_token = os.environ.get("GMAIL_REFRESH_TOKEN")
    sender_email = os.environ.get("GMAIL_SENDER_EMAIL")
    to_email = os.environ.get("CONTACT_TO_EMAIL")

    missing_vars = []
    if not client_id or client_id == "your_gmail_client_id_here": missing_vars.append("GMAIL_CLIENT_ID")
    if not client_secret or client_secret == "your_gmail_client_secret_here": missing_vars.append("GMAIL_CLIENT_SECRET")
    if not refresh_token or refresh_token == "your_gmail_refresh_token_here": missing_vars.append("GMAIL_REFRESH_TOKEN")
    if not sender_email or sender_email == "tejeshc17@gmail.com" and refresh_token == "your_gmail_refresh_token_here":
        pass
    if not sender_email: missing_vars.append("GMAIL_SENDER_EMAIL")
    if not to_email: missing_vars.append("CONTACT_TO_EMAIL")

    if missing_vars:
        print(f"Diagnostic [Contact]: Email service missing configuration for: {', '.join(missing_vars)}")
        return False

    # Escape HTML to prevent injection
    safe_first_name = html.escape(first_name)
    safe_last_name = html.escape(last_name)
    safe_email = html.escape(email)
    safe_phone = html.escape(phone)
    safe_message = html.escape(message).replace("\n", "<br>")

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    text_content = f"""
New Portfolio Enquiry

Name: {first_name} {last_name}
Email: {email}
Phone: {phone}
Time: {timestamp}

Message:
{message}
"""

    html_content = f"""
    <h2>New Portfolio Enquiry</h2>
    <p><strong>Name:</strong> {safe_first_name} {safe_last_name}</p>
    <p><strong>Email:</strong> {safe_email}</p>
    <p><strong>Phone:</strong> {safe_phone}</p>
    <p><strong>Time:</strong> {timestamp}</p>
    <hr>
    <h3>Message:</h3>
    <p>{safe_message}</p>
    """

    # Create MIME message
    mime_message = MIMEMultipart("alternative")
    mime_message["Subject"] = f"New portfolio enquiry — {first_name} {last_name}"
    mime_message["From"] = sender_email
    mime_message["To"] = to_email
    mime_message["Reply-To"] = email

    part1 = MIMEText(text_content, "plain")
    part2 = MIMEText(html_content, "html")
    mime_message.attach(part1)
    mime_message.attach(part2)

    raw_string = base64.urlsafe_b64encode(mime_message.as_bytes()).decode()

    try:
        access_token = get_access_token(client_id, client_secret, refresh_token)

        send_url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        data = {"raw": raw_string}

        res = requests.post(send_url, headers=headers, json=data, timeout=15.0)
        res.raise_for_status()

        return True
    except Exception as e:
        error_msg = f"Diagnostic [Contact]: Gmail API email delivery failed. Type: {type(e).__name__}"
        if hasattr(e, 'response') and e.response is not None:
            error_msg += f", Status/Code: {e.response.status_code}"

        raw_msg = str(e)
        short_msg = raw_msg.split('\n')[0][:100]

        # Redact known visitor PII from the error summary
        if email: short_msg = short_msg.replace(email, "[REDACTED_EMAIL]")
        if phone: short_msg = short_msg.replace(phone, "[REDACTED_PHONE]")
        if first_name: short_msg = short_msg.replace(first_name, "[REDACTED_NAME]")
        if last_name: short_msg = short_msg.replace(last_name, "[REDACTED_NAME]")

        error_msg += f", Summary: {short_msg}"
        print(error_msg)
        return False
