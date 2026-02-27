from models import db, ServiceRequest, Customer
from datetime import datetime

class AppointmentService:
    
    def create_service_request(self, data):
        """Create a new service request from customer"""
        try:
            customer_id = data.get("customer_id")
            preferred_date = data.get("preferred_date")
            address = data.get("address")
            description = data.get("description", None)
            
            if not customer_id or not preferred_date or not address:
                return {"error": "Missing required fields"}, 400
            
            new_request = ServiceRequest(
                customer_id=customer_id,
                preferred_date=preferred_date,
                address=address,
                description=description,
                status="pending"
            )
            
            db.session.add(new_request)
            db.session.commit()
            
            return {"message": "Service request created successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500
    
    def get_customer_requests(self, customer_id):
        """Get all service requests for a specific customer"""
        try:
            requests = ServiceRequest.query.filter_by(customer_id=customer_id).all()
            
            result = []
            for req in requests:
                result.append({
                    "id": req.id,
                    "preferred_date": req.preferred_date,
                    "address": req.address,
                    "description": req.description,
                    "status": req.status,
                    "scheduled_start": req.scheduled_start.isoformat() if req.scheduled_start else None,
                    "scheduled_end": req.scheduled_end.isoformat() if req.scheduled_end else None
                })
            
            return {"requests": result}, 200
        except Exception as e:
            return {"error": str(e)}, 500

    def get_all_requests(self):
        """Get all service requests for admin dashboard"""
        try:
            requests = ServiceRequest.query.all()

            result = []
            for req in requests:
                customer = Customer.query.get(req.customer_id)
                result.append({
                    "id": req.id,
                    "customer_id": req.customer_id,
                    "preferred_date": req.preferred_date,
                    "address": req.address,
                    "description": req.description,
                    "status": req.status,
                    "customer_name": customer.name if customer else "Unknown",
                    "scheduled_start": req.scheduled_start.isoformat() if req.scheduled_start else None,
                    "scheduled_end": req.scheduled_end.isoformat() if req.scheduled_end else None
                    
                })

            return {"requests": result}, 200
        except Exception as e:
            return {"error": str(e)}, 500