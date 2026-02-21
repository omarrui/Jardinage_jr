import jwt
from datetime import datetime, timedelta
from flask import current_app

def generate_token(user_id, role):
    """
    Creates a secure JWT token for a user.
    user_id → ID of the logged-in user
    role → "admin" or "customer"
    """

    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }

    token = jwt.encode(
        payload,
        current_app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return token

def decode_token(token):
    """
    Decodes a JWT token and verifies it.
    Returns payload if valid.
    Returns None if expired or invalid.
    """

    try:
        payload = jwt.decode(
            token,
            current_app.config["SECRET_KEY"],
            algorithms=["HS256"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    
    except jwt.InvalidTokenError:
        return None