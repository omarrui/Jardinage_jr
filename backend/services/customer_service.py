from utils.jwt_utils import generate_token
from werkzeug.security import generate_password_hash, check_password_hash
from repositories.customer_repository import (
    get_customer_by_email,
    create_customer
)

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

    token = generate_token(customer.id, "customer")

    return {
        "message": "Login successful",
        "token": token,
        "role": "customer",
        "customer_id": customer.id
    }, 200