import os
import resend
from datetime import datetime, timezone
import html

# Note: In a production environment, ensure your RESEND_API_KEY, CONTACT_FROM_EMAIL, and CONTACT_TO_EMAIL are properly configured.
resend.api_key = os.environ.get("RESEND_API_KEY")

def send_contact_email(
    first_name: str,
    last_name: str,
    email: str,
    phone: str,
    message: str
) -> bool:
    """
    Sends a contact notification email using the Resend SDK.
    Returns True if successful, False if the delivery fails or configuration is missing.
    """
    api_key = os.environ.get("RESEND_API_KEY")
    to_email = os.environ.get("CONTACT_TO_EMAIL")
    from_email = os.environ.get("CONTACT_FROM_EMAIL")

    if not api_key or not to_email or not from_email:
        return False

    # Escape HTML to prevent injection
    safe_first_name = html.escape(first_name)
    safe_last_name = html.escape(last_name)
    safe_email = html.escape(email)
    safe_phone = html.escape(phone)
    safe_message = html.escape(message).replace("\n", "<br>")

    # Prepare current time
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    # Construct plain text version
    text_content = f"""
New Portfolio Enquiry

Name: {first_name} {last_name}
Email: {email}
Phone: {phone}
Time: {timestamp}

Message:
{message}
"""

    # Construct HTML version
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

    try:
        response = resend.Emails.send({
            "from": from_email,
            "to": to_email,
            "subject": f"New portfolio enquiry — {first_name} {last_name}",
            "reply_to": email,
            "text": text_content,
            "html": html_content
        })
        # If no exception was raised and an ID is returned, consider it successful
        return "id" in response
    except Exception:
        # Catch any Resend API exception or network error gracefully
        return False
