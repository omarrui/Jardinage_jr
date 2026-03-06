from app.models import db
from app.models.models import ServiceRequest, Customer
from datetime import datetime

def create_service_request(data):
    """Create a new service request from customer"""
    try:
        # Debug: Print what data is received
        print("Received data:", data)
        
        customer_id = data.get("customer_id")
        # ✅ Change "date" to "preferred_date" to match frontend
        date = data.get("preferred_date") or data.get("date")
        time = data.get("time")
        description = data.get("description", "Service request")
        address = data.get("address", "TBD")
        
        print(f"customer_id: {customer_id}, date: {date}, address: {address}")
        
        # Validation
        if not customer_id or not date:
            return {"error": "Missing required fields"}, 400
        
        # Check customer exists
        customer = db.session.get(Customer, int(customer_id))  # ✅ Convert to int
        if not customer:
            return {"error": "Customer not found"}, 404
        
        # Create service request
        service_request = ServiceRequest(
            customer_id=int(customer_id), 
            preferred_date=f"{date} {time}" if time else date,
            description=description or "Service request",
            address=address,
            status="pending"
        )
        
        db.session.add(service_request)
        db.session.commit()
        
        return {
            "message": "Appointment created",
            "id": service_request.id
        }, 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating service request: {str(e)}")
        return {"error": str(e)}, 500


def get_customer_requests(customer_id):
    """Get all service requests for a customer"""
    try:
        requests = ServiceRequest.query.filter_by(customer_id=customer_id).all()
        
        result = [{
            "id": req.id,
            "preferred_date": req.preferred_date,
            "description": req.description,
            "address": req.address,
            "status": req.status,
            "created_at": req.created_at.isoformat() if req.created_at else None
        } for req in requests]
        
        return {"requests": result}, 200
    except Exception as e:
        return {"error": str(e)}, 500


def cancel_service_request(request_id, customer_id):
    """Cancel a service request"""
    try:
        service_request = db.session.get(ServiceRequest, request_id)
        
        if not service_request:
            return {"error": "Appointment not found"}, 404
        
        if service_request.customer_id != customer_id:
            return {"error": "Unauthorized"}, 403
        
        service_request.status = "cancelled"
        db.session.commit()
        
        return {"message": "Appointment cancelled successfully"}, 200
        
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


def get_all_requests():
    """Get all service requests (admin only)"""
    try:
        requests = ServiceRequest.query.all()
        
        result = [{
            "id": req.id,
            "customer_id": req.customer_id,
            "preferred_date": req.preferred_date,
            "description": req.description,
            "address": req.address,
            "status": req.status,
            "created_at": req.created_at.isoformat() if req.created_at else None
        } for req in requests]
        
        return result, 200  # Return tuple: (data, status_code)
    except Exception as e:
        print(f"Error in get_all_requests: {str(e)}")  
        return {"error": str(e)}, 500


def get_all_requests_with_customers():
    """Get all service requests with customer details for admin calendar"""
    try:
        from app.models.models import ServiceRequest, Customer
        from app.models import db
        
        requests = ServiceRequest.query.all()
        
        result = []
        for req in requests:
            customer = db.session.get(Customer, req.customer_id)
            result.append({
                "id": req.id,
                "customer_id": req.customer_id,
                "customer_name": customer.name if customer else "Unknown",
                "customer_phone": customer.phone if customer else "",
                "preferred_date": req.preferred_date,
                "scheduled_start": req.scheduled_start.isoformat() if req.scheduled_start else None,
                "scheduled_end": req.scheduled_end.isoformat() if req.scheduled_end else None,
                "description": req.description,
                "address": req.address,
                "status": req.status,
                "created_at": req.created_at.isoformat() if req.created_at else None
            })
        
        return result, 200
    except Exception as e:
        print(f"Error in get_all_requests_with_customers: {str(e)}")  
        return {"error": str(e)}, 500