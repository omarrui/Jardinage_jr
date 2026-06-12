from flask import request, jsonify, current_app
from app.services import admin_service
from app.models.models import Availability, ServiceRequest, db
from app.utils.jwt_utils import verify_token, generate_token
from functools import wraps
import os


def require_admin(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if request.method == "OPTIONS":
            return "", 204

        auth_header = request.headers.get("Authorization", "")
        token = auth_header.split(" ", 1)[1] if auth_header.startswith("Bearer ") else auth_header

        if not token:
            return jsonify({"error": "Missing token"}), 401

        payload = verify_token(token)

        if not payload or payload.get("role") != "admin":
            return jsonify({"error": "Unauthorized"}), 403

        return fn(*args, **kwargs)

    return wrapper


def register_admin_routes(app):

    @app.route("/api/admin/customers", methods=["GET"])
    @require_admin
    def admin_get_all_customers():
        response, status = admin_service.get_all_customers()
        return jsonify(response), status
    

    @app.route("/api/admin/customers", methods=["POST"])
    @require_admin
    def admin_create_customer():
        data = request.get_json()
        response, status = admin_service.create_customer_by_admin(data)
        return jsonify(response), status
    

    @app.route("/api/admin/login", methods=["POST"])
    def admin_login():
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        admin_email = os.getenv("ADMIN_EMAIL")
        admin_password = os.getenv("ADMIN_PASSWORD")

        
   
 

        if email == admin_email and password == admin_password:
            token = generate_token(customer_id=0, role="admin")
            
            return jsonify({
                "message": "Admin login successful",
                "token": token,
                "role": "admin"
            }), 200

        return jsonify({"error": "Invalid admin credentials"}), 401
    

    @app.route("/api/admin/customers/<int:customer_id>", methods=["DELETE"])
    @require_admin
    def delete_customer(customer_id):
        response, status = admin_service.delete_customer(customer_id)
        return jsonify(response), status
    
    
    @app.route("/api/admin/customers/<int:customer_id>", methods=["PUT"])
    @require_admin
    def update_customer(customer_id):
        data = request.get_json()

        response, status = admin_service.update_customer(customer_id, data)
        return jsonify(response), status


    @app.route("/api/admin/resend-temp-password/<int:customer_id>", methods=["POST"])
    @require_admin
    def resend_temp_password(customer_id):
        response, status = admin_service.resend_temp_password(customer_id)
        return jsonify(response), status
    

    @app.route("/api/admin/service-requests", methods=["GET"])
    @require_admin
    def admin_get_all_service_requests():
        response, status = admin_service.get_all_service_requests()
        return jsonify(response), status


    @app.route("/api/admin/service-requests/<int:request_id>", methods=["PUT"])
    @require_admin
    def admin_update_service_request(request_id):
        data = request.get_json()
        response, status = admin_service.update_service_request(request_id, data)
        return jsonify(response), status
    
    @app.route("/api/admin/create-appointment", methods=["POST"])
    @require_admin
    def create_appointment():
        data = request.get_json()
        response, status = admin_service.create_appointment(data)
        return jsonify(response), status
    
    @app.route("/api/admin/appointments", methods=["POST"])
    @require_admin
    def create_appointment_v2():
        data = request.get_json()
        response, status = admin_service.create_appointment(data)
        return jsonify(response), status
    
    @app.route("/api/admin/appointment-requests", methods=["GET"])
    @require_admin
    def get_appointment_requests():
        response, status = admin_service.get_all_service_requests()
        return jsonify(response), status

    @app.route("/api/admin/availability", methods=["POST"])
    @require_admin
    def block_date():
        data = request.get_json()
        date = data.get("date")

        new_block = Availability(date=date)
        db.session.add(new_block)
        db.session.commit()

        return {"message": "Date bloquée"}, 201

    @app.route("/api/admin/availability", methods=["GET"])
    @require_admin
    def get_blocked_dates():
        dates = Availability.query.all()
        return jsonify([{"date": d.date} for d in dates]), 200
    
    @app.route("/api/admin/availability/<string:date>", methods=["DELETE"])
    @require_admin
    def delete_availability(date):
        blocked = Availability.query.filter_by(date=date).first()

        if not blocked:
            return {"error": "Date non trouvée"}, 404

        db.session.delete(blocked)
        db.session.commit()

        return {"message": "Date débloquée"}, 200

    @app.route("/api/admin/appointments/<int:appointment_id>", methods=["DELETE"])
    @require_admin
    def delete_appointment(appointment_id):
        from app.models.models import ServiceRequest, db
        
        service_request = ServiceRequest.query.get(appointment_id)
        
        if not service_request:
            return jsonify({"error": "Rendez-vous introuvable"}), 404
        
        service_request.status = "cancelled"
        db.session.commit()
        
        return jsonify({"message": "Rendez-vous annulé"}), 200

    @app.route("/api/admin/appointments/<int:appointment_id>", methods=["PUT"])
    @require_admin
    def update_appointment(appointment_id):
        from app.models.models import ServiceRequest, db
        from datetime import datetime
        
        data = request.get_json()
        service_request = ServiceRequest.query.get(appointment_id)
        
        if not service_request:
            return jsonify({"error": "Rendez-vous introuvable"}), 404
        
        service_request.scheduled_start = datetime.fromisoformat(data["scheduled_start"])
        service_request.scheduled_end = datetime.fromisoformat(data["scheduled_end"])
        service_request.address = data.get("address", service_request.address)
        
        db.session.commit()
        
        return jsonify({"message": "Rendez-vous modifié"}), 200
    
    @app.route("/api/admin/appointment-requests/<int:request_id>/cancel", methods=["PUT"])
    @require_admin
    def cancel_appointment_request(request_id):

        request_obj = ServiceRequest.query.get(request_id)

        if not request_obj:
            return jsonify({"error": "Request not found"}), 404

        request_obj.status = "cancelled"
        db.session.commit()

        return jsonify({"message": "Request cancelled successfully"}), 200
