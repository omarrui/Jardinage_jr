import smtplib
from email.mime.text import MIMEText
from config import MAIL_SERVER, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD


def send_email(to_email, subject, body):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = MAIL_USERNAME
    msg["To"] = to_email

    server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT)
    server.starttls()
    server.login(MAIL_USERNAME, MAIL_PASSWORD)
    server.send_message(msg)
    server.quit()