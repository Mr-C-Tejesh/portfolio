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

    missing_vars = []
    if not api_key or api_key == "your_resend_api_key_here":
        missing_vars.append("RESEND_API_KEY")
    if not to_email or to_email == "tejeshc17@gmail.com" and api_key == "your_resend_api_key_here":
        # Keep tejeshc17@gmail.com valid, but check if it's the example case
        pass
    if not to_email:
        missing_vars.append("CONTACT_TO_EMAIL")
    if not from_email:
        missing_vars.append("CONTACT_FROM_EMAIL")

    if missing_vars:
        print(f"Diagnostic [Contact]: Email service missing configuration for: {', '.join(missing_vars)}")
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
    except Exception as e:
        error_msg = f"Diagnostic [Contact]: Resend API email delivery failed. Type: {type(e).__name__}"
        if hasattr(e, 'code'):
            error_msg += f", Status/Code: {e.code}"

        raw_msg = getattr(e, 'message', str(e))
        short_msg = raw_msg.split('\n')[0][:100]

        # Redact known visitor PII from the error summary
        if email: short_msg = short_msg.replace(email, "[REDACTED_EMAIL]")
        if phone: short_msg = short_msg.replace(phone, "[REDACTED_PHONE]")
        if first_name: short_msg = short_msg.replace(first_name, "[REDACTED_NAME]")
        if last_name: short_msg = short_msg.replace(last_name, "[REDACTED_NAME]")

        error_msg += f", Summary: {short_msg}"
        print(error_msg)
        # Catch any Resend API exception or network error gracefully
        return False
