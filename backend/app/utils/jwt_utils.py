import jwt
from datetime import datetime, timedelta, timezone
from flask import current_app

def generate_token(customer_id, role="customer"):
    """
    Generate a JWT token for authentication
    """
    payload = {
        "customer_id": customer_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24)
    }
    
    token = jwt.encode(
        payload,
        current_app.config["SECRET_KEY"],
        algorithm="HS256"
    )
    
    return token


def verify_token(token):
    """
    Verify and decode a JWT token
    Returns payload if valid, None if invalid
    """
    try:
        payload = jwt.decode(
            token,
            current_app.config["SECRET_KEY"],
            algorithms=["HS256"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token expired
    except jwt.InvalidTokenError:
        return None  # Invalid token