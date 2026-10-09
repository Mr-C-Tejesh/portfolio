import os
import json
from google_auth_oauthlib.flow import InstalledAppFlow

# The only scope we need is to send emails.
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def main():
    secrets_dir = os.path.join(os.path.dirname(__file__), 'secrets')
    os.makedirs(secrets_dir, exist_ok=True)
    
    client_secret_file = os.path.join(secrets_dir, 'client_secret.json')
    token_file = os.path.join(secrets_dir, 'token.json')
    
    if not os.path.exists(client_secret_file):
        print(f"Error: Please place your OAuth 2.0 Client ID JSON file at {client_secret_file}")
        print("You can download this from the Google Cloud Console (Credentials -> OAuth 2.0 Client IDs)")
        return
        
    print("Starting local OAuth flow for Gmail API...")
    
    flow = InstalledAppFlow.from_client_secrets_file(client_secret_file, SCOPES)
    # prompt='consent' forces the consent screen to appear so we get a refresh token
    creds = flow.run_local_server(port=0, prompt='consent', access_type='offline')
    
    if not creds.refresh_token:
        print("Warning: No refresh token was returned. You may need to revoke access in your Google Account and try again.")
    
    with open(token_file, 'w') as token:
        token.write(creds.to_json())
        
    print(f"\nSuccess! OAuth credentials saved to {token_file}")
    print("Use the refresh_token, client_id, and client_secret from this file to configure your environment variables (GMAIL_REFRESH_TOKEN, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET).")
    print("NOTE: Never commit these files to version control.")

if __name__ == '__main__':
    main()
