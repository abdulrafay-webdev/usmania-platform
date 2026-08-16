import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import settings

def send_password_reset_email(to_email: str, user_name: str, raw_token: str) -> bool:
    """
    Sends an official branded password reset email via Gmail SMTP.
    Returns True if sent successfully, False otherwise.
    """
    reset_url = f"{settings.APP_BASE_URL.rstrip('/')}/reset-password?token={raw_token}"
    
    subject = "Password Reset Request — Jamia Usmania Trust"
    
    # HTML Branded Email Template
    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      color: #333333;
    }}
    .container {{
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }}
    .header {{
      background-color: #145A32;
      padding: 24px;
      text-align: center;
      color: #ffffff;
    }}
    .header h1 {{
      margin: 0;
      font-size: 22px;
      letter-spacing: 0.5px;
      font-family: Georgia, serif;
    }}
    .header p {{
      margin: 6px 0 0 0;
      font-size: 12px;
      color: #FDF6E3;
      font-weight: 500;
    }}
    .content {{
      padding: 32px 28px;
      line-height: 1.6;
    }}
    .greeting {{
      font-size: 16px;
      font-weight: 600;
      color: #145A32;
      margin-bottom: 16px;
    }}
    .btn-container {{
      text-align: center;
      margin: 32px 0;
    }}
    .btn {{
      display: inline-block;
      background-color: #145A32;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 13px 32px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(20, 90, 50, 0.3);
    }}
    .btn:hover {{
      background-color: #0E4124;
    }}
    .notice {{
      background-color: #FDF6E3;
      border-left: 4px solid #145A32;
      padding: 12px 16px;
      border-radius: 4px;
      font-size: 12px;
      color: #5d4a13;
      margin: 20px 0;
    }}
    .footer {{
      background-color: #f8fafc;
      padding: 20px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }}
    .link-fallback {{
      word-break: break-all;
      color: #145A32;
      font-size: 11px;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>JAMIA USMANIA TRUST</h1>
      <p>Management Platform • Official Account Security</p>
    </div>
    <div class="content">
      <div class="greeting">Assalamu Alaikum {user_name},</div>
      <p>We received a request to reset your password for the Jamia Usmania Trust Management Platform. Click the button below to set a new password:</p>
      
      <div class="btn-container">
        <a href="{reset_url}" class="btn" target="_blank">Reset Password</a>
      </div>

      <div class="notice">
        <strong>⚠️ Note:</strong> This password reset link is valid for <strong>30 minutes only</strong>. If you did not request a password reset, you can safely ignore this email.
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 24px;">If the button above does not work, copy and paste this link into your browser:</p>
      <p class="link-fallback">{reset_url}</p>
    </div>
    <div class="footer">
      <p style="margin: 0 0 4px 0;"><strong>Jamia Usmania Trust</strong></p>
      <p style="margin: 0;">Email: jamiausmaniatrust1994@gmail.com • Web: www.usmaniatrust.org</p>
    </div>
  </div>
</body>
</html>
"""

    text_content = f"""Assalamu Alaikum {user_name},

We received a request to reset your password for Jamia Usmania Trust Management Platform.

Please click or open the link below to set your new password (valid for 30 minutes):
{reset_url}

If you did not request this, please ignore this message.

Jamia Usmania Trust
"""

    # If SMTP is not configured (e.g. no password provided in dev), log token to console for local testing
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"[EmailService] (SMTP not configured) Password reset link for {to_email}: {reset_url}")
        return True

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
        msg['To'] = to_email

        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')

        msg.attach(part1)
        msg.attach(part2)

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, [to_email], msg.as_string())

        print(f"[EmailService] Successfully sent password reset email to {to_email}")
        return True
    except Exception as e:
        print(f"[EmailService] Error sending email to {to_email}: {e}")
        return False
