import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

MAIL_SERVER = 'smtp.gmail.com'
MAIL_PORT = 587
MAIL_USERNAME = 'rouiguio919@gmail.com'
MAIL_PASSWORD = 'nyuwcwrzcujqcxxu'

def send_email(recipient, subject, body):
    try:
        msg = MIMEMultipart()
        msg['From'] = MAIL_USERNAME
        msg['To'] = recipient
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT)
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        print(f"❌ Email error: {str(e)}")
        return False