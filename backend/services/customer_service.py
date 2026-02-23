from utils.jwt_utils import generate_token
from werkzeug.security import generate_password_hash, check_password_hash
from repositories.customer_repository import (
    get_customer_by_email,
    create_customer
)
import secrets
from datetime import datetime, timedelta
from utils.email_utils import send_email
from models import Customer, db



def register_customer(name, email, password, phone):

    if not name or not email or not password or not phone:
        return {"error": "All fields are required"}, 400

    existing = get_customer_by_email(email)
    if existing:
        return {"error": "Email already registered"}, 400

    hashed_password = generate_password_hash(password)

    customer = create_customer(name, email, hashed_password, phone)

    return {"message": "Customer registered successfully"}, 201


def authenticate_customer(email, password):

    if not email or not password:
        return {"error": "Email and Password are required"}, 400

    customer = get_customer_by_email(email)

    if not customer:
        return {"error": "Invalid email or password"}, 401

    if not check_password_hash(customer.password, password):
        return {"error": "Invalid email or password"}, 401

    # Force password change (first login case)
    if customer.must_change_password:
        return {
            "message": "You must change your password",
            "force_password_change": True,
            "customer_id": customer.id
        }, 200

    # Normal login
    token = generate_token(customer.id, "customer")

    return {
        "message": "Login successful",
        "token": token,
        "role": "customer",
        "customer_id": customer.id
    }, 200

def send_reset_code(email):

    if not email:
        return {"error": "Email is required"}, 400

    customer = get_customer_by_email(email)

    # Security best practice: don't reveal if email exists
    if not customer:
        return {"message": "If this email exists, a reset code was sent."}, 200

    import random

    code = str(random.randint(100000, 999999))

    customer.reset_code = code
    customer.reset_code_expiry = datetime.utcnow() + timedelta(minutes=10)

    db.session.commit()

    send_email(
        email,
        "JR Jardinage Password Reset",
        f"""
Hello {customer.name},

Your reset code is:

{code}

This code expires in 10 minutes.

JR Jardinage
"""
    )

    return {"message": "Reset code sent to your email."}, 200

def reset_password_with_code(email, code, new_password):

    if not email or not code or not new_password:
        return {"error": "Missing data"}, 400

    customer = get_customer_by_email(email)

    if not customer:
        return {"error": "Invalid code"}, 400

    if customer.reset_code != code:
        return {"error": "Invalid code"}, 400

    if customer.reset_code_expiry < datetime.utcnow():
        return {"error": "Code expired"}, 400

    customer.password = generate_password_hash(new_password)
    customer.reset_code = None
    customer.reset_code_expiry = None
    customer.must_change_password = False

    db.session.commit()

    return {"message": "Password updated successfully"}, 200