from app.persistence.customer_repository import get_customer_by_email
from app.persistence import admin_repository
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
from app.utils.jwt_utils import generate_token
import secrets 
import string
from app.utils.email_utils import send_email
from app.models.models import Customer
from app.models.models import db 

# define constants to avoid duplication
ERROR_INVALID_CREDENTIALS = "Invalid email or password"
ERROR_CUSTOMER_NOT_FOUND = "Customer not found"
ERROR_NAME_PHONE_REQUIRED = "NAME and PHONE are required"


def create_customer_by_admin(data):
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    has_account = data.get("has_account", False)

    if not name or not phone:
        return {"Error": ERROR_NAME_PHONE_REQUIRED}, 400

    # INTERNAL RECORD ONLY
    if not has_account:
        admin_repository.create_customer(
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
    
    existing = get_customer_by_email(email)
    if existing:
        return {"error": "Email already exists"}, 400

    # Generate SECURE random password
    alphabet = string.ascii_letters + string.digits + string.punctuation
    temp_password = ''.join(secrets.choice(alphabet) for _ in range(12))
    
    hashed_password = generate_password_hash(temp_password)

    admin_repository.create_customer(
        name=name,
        email=email,
        phone=phone,
        password=hashed_password,
        has_account=True,
        must_change_password=True
    )

    # Send email
    send_email(
        email,
        "Your JR Jardinage Account",
        f"""
Hello {name},

Your account has been created.

Temporary password: {temp_password}

⚠️ This password will expire after first login. Please change it immediately.

Regards,
JR Jardinage
"""
    )

    return {"message": "Customer account created and email sent"}, 201


def resend_temp_password(customer_id):
    customer = Customer.query.get(customer_id)

    if not customer:
        return {"error": ERROR_CUSTOMER_NOT_FOUND}, 404

    if not customer.must_change_password:
        return {"error": "Customer has already activated their account"}, 400

    if not customer.email:
        return {"error": "Customer has no email"}, 400

    # Generate SECURE random password
    alphabet = string.ascii_letters + string.digits + string.punctuation
    temp_password = ''.join(secrets.choice(alphabet) for _ in range(12))

    hashed_password = generate_password_hash(temp_password)

    customer.password = hashed_password
    customer.must_change_password = True

    db.session.commit()

    send_email(
        customer.email,
        "Your New Temporary Password - JR Jardinage",
        f"""
Hello {customer.name},

Your temporary password has been reset.

Temporary password: {temp_password}

⚠️ Please log in and change it immediately for security.

JR Jardinage
"""
    )

    return {"message": "Temporary password resent successfully"}, 200


def authenticate_customer(email, password):
    if not email or not password:
        return {"error": "Email and Password are required"}, 400

    customer = get_customer_by_email(email)

    if not customer:
        return {"error": ERROR_INVALID_CREDENTIALS}, 401

    if not check_password_hash(customer.password, password):
        return {"error": ERROR_INVALID_CREDENTIALS}, 401

    if customer.must_change_password:
        return {
            "message": "You must change your password",
            "force_password_change": True,
            "customer_id": customer.id
        }, 200

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
        return {"error": ERROR_INVALID_CREDENTIALS}, 401

    if not check_password_hash(admin.password, password):
        return {"error": ERROR_INVALID_CREDENTIALS}, 401

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

        request_data = {
            "id": req.id,
            "customer_id": req.customer_id,
            "customer_name": customer.name if customer else "Unknown",
            "customer_email": customer.email if (customer and customer.email) else None,  
            "customer_phone": customer.phone if (customer and customer.phone) else None, 
            "preferred_date": req.preferred_date,
            "description": req.description,
            "address": req.address,
            "status": req.status,
            "scheduled_start": req.scheduled_start.isoformat() if req.scheduled_start else None,
            "scheduled_end": req.scheduled_end.isoformat() if req.scheduled_end else None
        }
        
        print(f"🔍 Request data: {request_data}")
        result.append(request_data)

    return result, 200


def update_service_request(request_id, data):
    from app.models.models import ServiceRequest, db
    from datetime import datetime
    
    service_request = ServiceRequest.query.get(request_id)
    
    if not service_request:
        return {"error": "Service request not found"}, 404
    
    scheduled_start = data.get("scheduled_start")
    scheduled_end = data.get("scheduled_end")
    address = data.get("address")
    
    if scheduled_start:
        # Parse the datetime string and make it timezone-naive
        start_dt = datetime.fromisoformat(scheduled_start.replace('Z', '+00:00'))
        if start_dt.tzinfo is not None:
            start_dt = start_dt.replace(tzinfo=None)  # Remove timezone
        
        # Compare with timezone-naive datetime.now()
        if start_dt < datetime.now():
            return {"error": "Cannot schedule in the past"}, 400
        
        service_request.scheduled_start = start_dt
    
    if scheduled_end:
        # Parse and make timezone-naive
        end_dt = datetime.fromisoformat(scheduled_end.replace('Z', '+00:00'))
        if end_dt.tzinfo is not None:
            end_dt = end_dt.replace(tzinfo=None)  # Remove timezone
        
        service_request.scheduled_end = end_dt
    
    if address:
        service_request.address = address
    
    # Validate start < end
    if service_request.scheduled_start and service_request.scheduled_end:
        if service_request.scheduled_start >= service_request.scheduled_end:
            return {"error": "Start time must be before end time"}, 400
    
    # Update status if provided (e.g., cancelled)
    status = data.get("status")
    if status:
        service_request.status = status

    db.session.commit()
    
    return {"message": "Appointment updated successfully"}, 200


def get_all_customers():
    customers = admin_repository.get_all_customers()

    result = []

    for customer in customers:
        result.append({
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "must_change_password": customer.must_change_password,
            "has_account": customer.has_account
        })
    
    return result, 200


def update_customer(customer_id, data):
    customer = admin_repository.get_customer_by_id(customer_id)

    if not customer:
        return {"error": ERROR_CUSTOMER_NOT_FOUND}, 404

    email = data.get("email")
    phone = data.get("phone")

    # Prevent duplicate email
    if email and email != customer.email:
        existing = get_customer_by_email(email)
        if existing:
            return {"error": "Email already in use"}, 400
        customer.email = email

    if phone:
        customer.phone = phone

    admin_repository.commit()

    return {"message": "Customer updated successfully"}, 200


def delete_customer(customer_id):
    customer = admin_repository.get_customer_by_id(customer_id)

    if not customer:
        return {"error": ERROR_CUSTOMER_NOT_FOUND}, 404

    if not customer.must_change_password:
        return {"error": "Cannot delete activated customer"}, 400

    admin_repository.delete_customer(customer)
    admin_repository.commit()

    return {"message": "Customer deleted successfully"}, 200


def create_appointment(data):
    from app.models.models import ServiceRequest, db

    request_id = data.get("request_id")
    customer_id = data.get("customer_id")
    scheduled_start = data.get("scheduled_start")
    scheduled_end = data.get("scheduled_end")
    address = data.get("address", "")
    description = data.get("description", "Scheduled by admin")

    if not scheduled_start:
        return {"error": "Start time required"}, 400

    # Validaite datetime format
    try:
        start_dt = datetime.fromisoformat(scheduled_start)
        end_dt = datetime.fromisoformat(scheduled_end) if scheduled_end else None

        if start_dt.replace(tzinfo=None) < datetime.now():
            return {"error": "Start time cannot be in the past"}, 400

        if end_dt and end_dt < start_dt:
            return {"error": "End time cannot be before start time"}, 400

    except ValueError:
        return {"error": "Invalid datetime format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}, 400

    # CASE 1: Confirm existing request
    if request_id:
        service_request = ServiceRequest.query.get(request_id)
        
        if not service_request:
            return {"error": "Service request not found"}, 404

        service_request.status = "scheduled"
        service_request.scheduled_start = start_dt
        service_request.scheduled_end = end_dt
        if address:
            service_request.address = address

        db.session.commit()
        return {"message": "Appointment scheduled successfully"}, 200

    # CASE 2: Create new appointment directly
    elif customer_id:
        new_request = ServiceRequest(
            customer_id=customer_id,
            preferred_date=start_dt.strftime("%Y-%m-%d"),
            description=description,
            address=address,
            status="scheduled",
            scheduled_start=start_dt,
            scheduled_end=end_dt
        )
        
        db.session.add(new_request)
        db.session.commit()
        return {"message": "Appointment created successfully"}, 201

    else:
        return {"error": "Missing request_id or customer_id"}, 400
