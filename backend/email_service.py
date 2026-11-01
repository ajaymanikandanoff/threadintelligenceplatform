import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER", "m.ajaysundharaperumal@gmail.com")
SMTP_PASS = os.environ.get("SMTP_PASS", "rjizwyllhhixukqd")
FROM_NAME = "ThreatLens Security Operations"

def send_otp_email(to_email: str, otp_code: str, purpose: str = "password_reset") -> bool:
    is_signup = purpose == "signup"
    subject_title = "Account Verification Code" if is_signup else "Password Reset Verification Code"
    header_title = "Activate Your Analyst Account" if is_signup else "Password Reset Verification"
    purpose_desc = "activate your new analyst account" if is_signup else "reset the master credentials for your account"

    print("===================================================================")
    print(f"📧 [OTP EMAIL SERVICE] Sending {purpose} 6-digit OTP to: {to_email}")
    print(f"🔑 [OTP CODE]: {otp_code} (Valid for 5 minutes)")
    print("===================================================================")

    if not SMTP_USER or not SMTP_PASS:
        print("[WARN] SMTP credentials not set; skipping live email dispatch.")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Your ThreatLens {subject_title}: {otp_code}"
        msg["From"] = f"{FROM_NAME} <{SMTP_USER}>"
        msg["To"] = to_email

        text_content = f"""Hello Analyst,

We received a request to {purpose_desc} ({to_email}).

Your 6-Digit OTP Verification Code is:
{otp_code}

This code is valid for 5 minutes only.
Do not share this code with anyone. ThreatLens analysts and administrators will never ask for your verification code.

ThreatLens Security Operations Team
"""

        html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 32px 14px; background-color: #06090f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
    <div style="max-width: 520px; margin: 0 auto; background-color: #0b111e; border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.7);">
        <!-- Top Cyan Cyber Stripe -->
        <div style="height: 4px; background: linear-gradient(90deg, #0284c7 0%, #00e5ff 100%);"></div>

        <!-- Header -->
        <div style="padding: 28px 30px 18px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
            <div style="display: inline-block; background-color: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 20px; padding: 5px 14px; margin-bottom: 12px;">
                <span style="color: #38bdf8; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">🛡️ THREATLENS SECURITY PLATFORM</span>
            </div>
            <h1 style="color: #f8fafc; font-size: 22px; font-weight: 800; margin: 6px 0 0 0; letter-spacing: -0.02em;">{header_title}</h1>
        </div>
        
        <!-- Main Body -->
        <div style="padding: 26px 30px; text-align: left;">
            <p style="color: #f8fafc; font-size: 14px; font-weight: 600; margin: 0 0 10px 0;">Hello Analyst,</p>
            <p style="color: #94a3b8; font-size: 13.5px; line-height: 1.6; margin: 0 0 20px 0;">
                We received a request to <strong style="color: #f8fafc;">{purpose_desc}</strong>: <strong style="color: #00e5ff;">{to_email}</strong>.
            </p>
            
            <p style="color: #64748b; font-size: 11.5px; margin: 0 0 10px 0; text-align: center; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Your 6-Digit Verification Code (OTP)</p>
            
            <!-- Large Clear Cyan OTP Box -->
            <div style="background-color: #070b14; border: 2px dashed #00e5ff; border-radius: 12px; padding: 20px 14px; text-align: center; margin-bottom: 22px;">
                <span style="color: #00e5ff; font-size: 38px; font-weight: 900; letter-spacing: 9px; font-family: 'Courier New', Courier, monospace; display: inline-block;">{otp_code}</span>
            </div>
            
            <!-- Validity & Security Warning -->
            <div style="background-color: rgba(244, 63, 94, 0.08); border-left: 4px solid #f43f5e; border-radius: 6px; padding: 12px 16px; margin-bottom: 22px;">
                <p style="color: #fb7185; font-size: 12.5px; font-weight: 700; margin: 0 0 4px 0;">⏱️ Valid for 5 Minutes Only</p>
                <p style="color: #cbd5e1; font-size: 11.5px; line-height: 1.5; margin: 0;">Do not disclose this OTP code to anyone. ThreatLens administrators will never ask for your verification code.</p>
            </div>

            <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
                If you did not initiate this request, please ignore this email. No action will be taken on your account.
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #070b14; padding: 18px 30px; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
            <p style="color: #64748b; font-size: 11.5px; margin: 0 0 4px 0; font-weight: 600;">
                ThreatLens Cyber Threat Intelligence & Incident Response Team
            </p>
            <p style="color: #475569; font-size: 10.5px; margin: 0;">
                Automated Cryptographic Security Notification • Do Not Reply
            </p>
        </div>
    </div>
</body>
</html>
"""
"""

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, [to_email], msg.as_string())
        server.quit()

        print(f"✅ [SUCCESS] Real OTP Email successfully delivered via Gmail SMTP to {to_email}!")
        return True
    except Exception as e:
        print(f"❌ [SMTP ERROR] Failed to send email to {to_email}: {str(e)}")
        return False

