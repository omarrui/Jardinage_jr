from repositories.customer_repository import get_customer_by_email
from repositories import admin_repository
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
from utils.jwt_utils import generate_token
import random
import string
from utils.email_utils import send_email


def create_customer_by_admin(data):
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    has_account = data.get("has_account", False)

    if not name or not phone:
        return {"Error": "NAME and PHONE are required"}, 400

    # INTERNAL RECORD ONLY
    if not has_account:
        customer = admin_repository.create_customer(
            name=name,
            email=email,
            phone=phone,
            password=None,
            has_account=False,
            must_change_password=True
        )
        return {"message": "Internal customer created"}, 201

    # LOGIN ACCOUNT CASE
    if not email:
        return {"error": "Email required for login account"}, 400
    
    from repositories.customer_repository import get_customer_by_email

    existing = get_customer_by_email(email)
    if existing:
        return {"error": "Email already exists"}, 400

    # Generate random password
    temp_password = ''.join(
        random.choices(string.ascii_letters + string.digits, k=8)
    )
    hashed_password = generate_password_hash(temp_password)

    customer = admin_repository.create_customer(
        name=name,
        email=email,
        phone=phone,
        password=hashed_password,
        has_account=True,
        must_change_password=True
    )

    # SEND EMAIL BEFORE RETURN
    send_email(
        email,
        "Your JR Jardinage Account",
        f"""
Hello {name},

Your account has been created.

Temporary password: {temp_password}

Please log in and change your password.

Regards,
JR Jardinage
"""
    )

    return {
        "message": "Customer account created",
        "temporary_password": temp_password
    }, 201



def authenticate_customer(email, password):

    if not email or not password:
        return {"error": "Email and Password are required"}, 400

    customer = get_customer_by_email(email)

    if not customer:
        return {"error": "Invalid email or password"}, 401

    if not check_password_hash(customer.password, password):
        return {"error": "Invalid email or password"}, 401

    # make the customer change password first time he loggs in 
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
        "force_password_change": False
    }, 200

def authenticate_admin(email, password):

    if not email or not password:
        return {"error": "Email and password are required"}, 400

    admin = admin_repository.get_admin_by_email(email)

    if not admin:
        return {"error": "Invalid email or password"}, 401

    if not check_password_hash(admin.password, password):
        return {"error": "Invalid email or password"}, 401

    token = generate_token(admin.id, "admin")

    return {
        "message": "Admin login successful",
        "token": token,
        "role": "admin"
    }, 200



def get_all_service_requests():

    requests = admin_repository.get_all_requests()
    result = []

    for req in requests:
        customer = admin_repository.get_customer_by_id(req.customer_id)

        result.append({
            "id": req.id,
            "customer_name": customer.name if customer else "Unknown",
            "customer_email": customer.email if customer else "Unknown",
            "customer_phone": customer.phone if customer else "Unknown",
            "preferred_date": req.preferred_date,
            "description": req.description,
            "status": req.status,
            "scheduled_start_date": req.scheduled_start_date,
            "scheduled_end_date": req.scheduled_end_date,
            "scheduled_time": req.scheduled_time
        })

    return result, 200


def update_service_request(request_id, data):

    service_request = admin_repository.get_request_by_id(request_id)

    if not service_request:
        return {"error": "Service request not found"}, 404

    new_status = data.get("status")
    start_date = data.get("scheduled_start_date")
    end_date = data.get("scheduled_end_date")
    time = data.get("scheduled_time")

    today = datetime.today().date()

    # Validate start date
    if start_date:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        if start < today:
            return {"error": "Start date cannot be in the past"}, 400

    # Validate end date
    if end_date:
        end = datetime.strptime(end_date, "%Y-%m-%d").date()

        if start_date:
            start = datetime.strptime(start_date, "%Y-%m-%d").date()
        else:
            start = datetime.strptime(
                service_request.scheduled_start_date,
                "%Y-%m-%d"
            ).date()

        if end < start:
            return {"error": "End date cannot be before start date"}, 400

    # Apply updates
    if new_status:
        service_request.status = new_status

    if start_date:
        service_request.scheduled_start_date = start_date

    if end_date:
        service_request.scheduled_end_date = end_date

    if time:
        service_request.scheduled_time = time

    admin_repository.commit()

    return {"message": "Service request updated successfully"}, 200

def get_all_customers():
    customers = admin_repository.get_all_customers()

    result = []

    for customer in customers:
        result.append({
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone
        })
    
    return result, 200