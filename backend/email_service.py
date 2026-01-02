import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# Configuration (In a real app, use env vars)
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
# For hackathon, we might need to hardcode or ask user for creds. 
# Using placeholders for now.
SENDER_EMAIL = os.getenv("SAFE_STREET_EMAIL", "safestreet.hackathon@gmail.com")
SENDER_PASSWORD = os.getenv("SAFE_STREET_PASSWORD", "app_password_here") 

def send_email_report(to_email: str, report_data: dict):
    """
    Sends an email report about the detected road damage.
    """
    try:
        subject = f"Road Damage Alert: {report_data['damage_type']} Detected"
        
        body = f"""
        <h2>Safe Street Damage Report</h2>
        <p><strong>Damage Type:</strong> {report_data['damage_type']}</p>
        <p><strong>Severity:</strong> {report_data['severity']}</p>
        <p><strong>Confidence:</strong> {report_data['confidence']}</p>
        <p><strong>Summary:</strong></p>
        <p>{report_data['summary']}</p>
        
        <br>
        <p><em>This is an automated message from the Safe Street system.</em></p>
        """

        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))

        # Only attempt to send if we have a password (mock mode otherwise)
        if "app_password_here" in SENDER_PASSWORD:
            print(f"Bypassing Email Send (Mock Mode). Content:\n{body}")
            return True

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
            
        print(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False
