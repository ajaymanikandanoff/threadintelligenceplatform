import os
import json
import time
import secrets
import hashlib
from typing import Dict, Any, Optional

import database

# In-memory OTP storage: email -> { "otp": "123456", "expires_at": timestamp }
otp_storage: Dict[str, Dict[str, Any]] = {}

# In-memory Sign-Up OTP storage: email -> { "otp": "123456", "name": "...", "password": "...", "expires_at": timestamp }
signup_otp_storage: Dict[str, Dict[str, Any]] = {}

def _hash_password(password: str, salt: str) -> str:
    data = (salt + password).encode("utf-8")
    return hashlib.sha256(data).hexdigest()

def _load_users() -> Dict[str, Dict[str, Any]]:
    return database.load_users()

def _save_users(users: Dict[str, Dict[str, Any]]):
    database.save_users(users)

def register_user(name: str, email: str, password: str) -> Dict[str, Any]:
    if not name or len(name.strip()) < 2:
        return {"success": False, "error": "Name must be at least 2 characters."}
    if not email or "@" not in email:
        return {"success": False, "error": "Invalid email address."}
    if not password or len(password) < 6:
        return {"success": False, "error": "Password must be at least 6 characters."}

    email_key = email.strip().lower()
    users = _load_users()
    if email_key in users:
        return {"success": False, "error": "An account with this email already exists."}

    salt = secrets.token_hex(8)
    pw_hash = _hash_password(password, salt)
    user_id = f"usr-{secrets.token_hex(6)}"

    new_user = {
        "id": user_id,
        "name": name.strip(),
        "email": email_key,
        "password_hash": pw_hash,
        "salt": salt,
        "auth_provider": "LOCAL",
        "role": "Security analyst",
        "phone": "",
        "occupation": "Threat Intelligence Analyst",
        "picture_url": ""
    }
    users[email_key] = new_user
    _save_users(users)

    return {
        "success": True,
        "message": "User registered successfully",
        "user": {
            "id": new_user["id"],
            "name": new_user["name"],
            "email": new_user["email"],
            "role": new_user["role"],
            "authProvider": "LOCAL"
        }
    }

def login_user(email: str, password: str) -> Dict[str, Any]:
    if not email or not password:
        return {"success": False, "error": "Email and password are required."}

    email_key = email.strip().lower()
    users = _load_users()
    user = users.get(email_key)

    if not user:
        return {"success": False, "error": "No account found with this email."}

    if user.get("auth_provider") == "GOOGLE" and not user.get("password_hash"):
        return {"success": False, "error": "This account is linked with Google. Please use 'Sign in with Google'."}

    salt = user.get("salt", "")
    computed = _hash_password(password, salt)
    if computed != user.get("password_hash"):
        return {"success": False, "error": "Incorrect password. Try again."}

    return {
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "Security analyst"),
            "phone": user.get("phone", ""),
            "occupation": user.get("occupation", "Security Analyst"),
            "pictureUrl": user.get("picture_url", ""),
            "authProvider": user.get("auth_provider", "LOCAL")
        }
    }

def google_login(email: str, name: Optional[str] = None, picture: Optional[str] = None) -> Dict[str, Any]:
    if not email or "@" not in email:
        return {"success": False, "error": "Google email is required."}

    email_key = email.strip().lower()
    users = _load_users()
    user = users.get(email_key)

    if not user:
        display_name = name.strip() if name and name.strip() else email_key.split("@")[0]
        user = {
            "id": f"usr-google-{secrets.token_hex(4)}",
            "name": display_name,
            "email": email_key,
            "password_hash": None,
            "salt": None,
            "auth_provider": "GOOGLE",
            "role": "Security analyst",
            "phone": "",
            "occupation": "Security Analyst",
            "picture_url": picture or ""
        }
        users[email_key] = user
        _save_users(users)
    else:
        if picture:
            user["picture_url"] = picture
            _save_users(users)

    return {
        "success": True,
        "message": "Google authentication successful",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "Security analyst"),
            "phone": user.get("phone", ""),
            "occupation": user.get("occupation", "Security Analyst"),
            "pictureUrl": user.get("picture_url", ""),
            "authProvider": "GOOGLE"
        }
    }

def github_login(email: str, name: Optional[str] = None, username: Optional[str] = None, picture: Optional[str] = None) -> Dict[str, Any]:
    if not email or "@" not in email:
        return {"success": False, "error": "GitHub account email is required."}

    email_key = email.strip().lower()
    users = _load_users()
    user = users.get(email_key)

    display_name = name.strip() if name and name.strip() else (username.strip() if username else email_key.split("@")[0])

    if not user:
        user = {
            "id": f"usr-github-{secrets.token_hex(4)}",
            "name": display_name,
            "email": email_key,
            "password_hash": None,
            "salt": None,
            "auth_provider": "GITHUB",
            "role": "SecOps Engineer",
            "phone": "",
            "occupation": "Threat Intelligence Engineer",
            "picture_url": picture or "https://avatars.githubusercontent.com/u/9919?v=4"
        }
        users[email_key] = user
        _save_users(users)
    else:
        user["auth_provider"] = "GITHUB"
        if picture:
            user["picture_url"] = picture
        _save_users(users)

    return {
        "success": True,
        "message": "GitHub authentication successful",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "SecOps Engineer"),
            "phone": user.get("phone", ""),
            "occupation": user.get("occupation", "Threat Intelligence Engineer"),
            "pictureUrl": user.get("picture_url", ""),
            "authProvider": "GITHUB"
        }
    }

def get_profile(email: str) -> Dict[str, Any]:
    email_key = email.strip().lower()
    users = _load_users()
    user = users.get(email_key)
    if not user:
        return {"success": False, "error": "User not found"}
    return {
        "success": True,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "Security analyst"),
            "phone": user.get("phone", ""),
            "occupation": user.get("occupation", ""),
            "pictureUrl": user.get("picture_url", ""),
            "authProvider": user.get("auth_provider", "LOCAL")
        }
    }

def update_profile(email: str, name: Optional[str] = None, phone: Optional[str] = None, occupation: Optional[str] = None, picture_url: Optional[str] = None) -> Dict[str, Any]:
    email_key = email.strip().lower()
    users = _load_users()
    user = users.get(email_key)
    if not user:
        return {"success": False, "error": "User not found"}

    if name and name.strip():
        user["name"] = name.strip()
    if phone is not None:
        user["phone"] = phone.strip()
    if occupation is not None:
        user["occupation"] = occupation.strip()
    if picture_url is not None:
        user["picture_url"] = picture_url.strip()

    _save_users(users)
    return {
        "success": True,
        "message": "Profile updated successfully",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "Security analyst"),
            "phone": user.get("phone", ""),
            "occupation": user.get("occupation", ""),
            "pictureUrl": user.get("picture_url", ""),
            "authProvider": user.get("auth_provider", "LOCAL")
        }
    }

def request_password_otp(email: str) -> Dict[str, Any]:
    if not email or "@" not in email:
        return {"success": False, "error": "Invalid email address format."}

    email_key = email.strip().lower()
    users = _load_users()
    if email_key not in users:
        # Create user record so analyst can complete registration / reset
        display_name = email_key.split("@")[0].replace(".", " ").title()
        users[email_key] = {
            "id": f"usr-{secrets.token_hex(6)}",
            "name": display_name,
            "email": email_key,
            "password_hash": None,
            "salt": secrets.token_hex(8),
            "auth_provider": "LOCAL",
            "role": "Security analyst",
            "phone": "",
            "occupation": "Threat Intelligence Analyst",
            "picture_url": ""
        }
        _save_users(users)

    # Generate 6-digit code
    code = str(secrets.randbelow(900000) + 100000)
    expires_at = time.time() + (5 * 60) # 5 minutes

    otp_storage[email_key] = {"otp": code, "expires_at": expires_at}
    print(f"[AUTH OTP] Generated 6-digit OTP for password reset {email_key}: {code} (Valid for 5 min)")

    # Dispatch real email via Gmail SMTP
    email_delivered = False
    try:
        import email_service
        email_delivered = email_service.send_otp_email(email_key, code, purpose="password_reset")
    except Exception as err:
        print(f"[WARN] Email delivery exception: {err}")

    delivery_status = "sent to your email inbox" if email_delivered else "dispatched"

    return {
        "success": True,
        "message": f"A 6-digit OTP verification code has been {delivery_status} ({email_key}). Valid for 5 minutes.",
        "email_delivered": email_delivered
    }

def request_signup_otp(name: str, email: str, password: str) -> Dict[str, Any]:
    """Sends a mandatory 6-digit verification OTP to the user's email before creating the account."""
    if not name or len(name.strip()) < 2:
        return {"success": False, "error": "Full name must be at least 2 characters."}
    if not email or "@" not in email:
        return {"success": False, "error": "Valid email address is required."}
    if not password or len(password) < 6:
        return {"success": False, "error": "Password must be at least 6 characters."}

    email_key = email.strip().lower()
    users = _load_users()
    if email_key in users:
        existing = users[email_key]
        if existing.get("password_hash"):
            return {"success": False, "error": "An account with this email already exists. Please sign in."}

    code = str(secrets.randbelow(900000) + 100000)
    expires_at = time.time() + (5 * 60) # 5 minutes

    signup_otp_storage[email_key] = {
        "otp": code,
        "name": name.strip(),
        "password": password,
        "expires_at": expires_at
    }
    print(f"[SIGNUP OTP] Generated 6-digit verification code for new user {email_key}: {code} (Valid for 5 min)")

    email_delivered = False
    try:
        import email_service
        email_delivered = email_service.send_otp_email(email_key, code, purpose="signup")
    except Exception as err:
        print(f"[WARN] Signup email delivery exception: {err}")

    delivery_status = "sent to your email" if email_delivered else "dispatched"

    return {
        "success": True,
        "message": f"Verification code {delivery_status} ({email_key}). Enter the 6-digit OTP to complete registration.",
        "email_delivered": email_delivered
    }

def verify_signup_otp(email: str, otp: str) -> Dict[str, Any]:
    """Verifies the mandatory sign-up OTP and creates the account."""
    email_key = email.strip().lower()
    otp_code = otp.strip()

    entry = signup_otp_storage.get(email_key)
    if not entry:
        return {"success": False, "error": "Verification code expired or not requested. Please request a new code."}

    if time.time() > entry["expires_at"]:
        del signup_otp_storage[email_key]
        return {"success": False, "error": "Verification code has expired. Please request a new code."}

    if entry["otp"] != otp_code:
        return {"success": False, "error": "Invalid verification code. Please check and retry."}

    # Verified! Register the new user
    result = register_user(
        name=entry["name"],
        email=email_key,
        password=entry["password"]
    )
    if result.get("success"):
        del signup_otp_storage[email_key]

    return result

def reset_password_with_otp(email: str, otp: str, new_password: str) -> Dict[str, Any]:
    email_key = email.strip().lower()
    otp_code = otp.strip()

    if not new_password or len(new_password) < 6:
        return {"success": False, "error": "New password must be at least 6 characters."}

    entry = otp_storage.get(email_key)
    if not entry:
        return {"success": False, "error": "No OTP requested for this email or OTP expired. Please request a new OTP."}

    if time.time() > entry["expires_at"]:
        del otp_storage[email_key]
        return {"success": False, "error": "OTP has expired. Please request a new OTP."}

    if entry["otp"] != otp_code:
        return {"success": False, "error": "Invalid OTP entered. Please check and try again."}

    # Verified! Update password
    users = _load_users()
    user = users.get(email_key)
    if not user:
        return {"success": False, "error": "Account not found."}

    salt = secrets.token_hex(8)
    user["salt"] = salt
    user["password_hash"] = _hash_password(new_password, salt)
    _save_users(users)
    del otp_storage[email_key]

    return {
        "success": True,
        "message": "Password reset successfully. You can now sign in with your new password."
    }

def change_password(email: str, old_password: str, new_password: str) -> Dict[str, Any]:
    if not old_password or not new_password:
        return {"success": False, "error": "Both current and new password are required."}
    if len(new_password) < 6:
        return {"success": False, "error": "New password must be at least 6 characters."}

    email_key = email.strip().lower()
    users = _load_users()
    user = users.get(email_key)
    if not user:
        return {"success": False, "error": "User account not found."}

    salt = user.get("salt", "")
    if _hash_password(old_password, salt) != user.get("password_hash"):
        return {"success": False, "error": "Current password does not match."}

    new_salt = secrets.token_hex(8)
    user["salt"] = new_salt
    user["password_hash"] = _hash_password(new_password, new_salt)
    _save_users(users)

    return {
        "success": True,
        "message": "Password updated successfully."
    }
