from flask import request, jsonify
from models import db, ServiceRequest, Customer

def register_booking_routes(app):
    
    @app.route("/api/appointments", methods=["POST"])
    def customer_book_appointment():
        data = request.get_json()
        
        customer_id = data.get("customer_id")
        date = data.get("date")
        time = data.get("time")
        description = data.get("description", "Service request")
        address = data.get("address", "TBD")
        
        # Validation
        if not customer_id or not date:
            return jsonify({"error": "Missing required fields"}), 400
        
        # Check customer exists
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({"error": "Customer not found"}), 404
        
        # Include ALL required fields
        service_request = ServiceRequest(
            customer_id=customer_id,
            preferred_date=f"{date} {time}" if time else date,
            description=description,
            address=address,
            status="pending"
        )
        
        db.session.add(service_request)
        db.session.commit()
        
        return jsonify({
            "message": "Appointment created",
            "id": service_request.id
        }), 201