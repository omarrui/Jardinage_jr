import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header

def _clean_env_value(value, remove_spaces=False):
    if value is None:
        return None

    cleaned = value.strip()
    if remove_spaces:
        cleaned = cleaned.replace(" ", "").replace("\xa0", "")

    return cleaned


MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
MAIL_USERNAME = _clean_env_value(os.getenv("MAIL_USERNAME"))
MAIL_PASSWORD = _clean_env_value(os.getenv("MAIL_PASSWORD"), remove_spaces=True)

def send_email(recipient, subject, body):
    if not MAIL_USERNAME or not MAIL_PASSWORD:
        print("Email not sent: MAIL_USERNAME or MAIL_PASSWORD is missing")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = MAIL_USERNAME
        msg['To'] = recipient
        msg['Subject'] = str(Header(subject, 'utf-8'))
        msg.attach(MIMEText(body, 'plain', 'utf-8'))

        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"❌ Email error: {str(e)}")
        return False
