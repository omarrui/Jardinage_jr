# backend/routes/appointment_routes.py

from flask import Blueprint, request, jsonify
from app.services import admin_service, facade
from app.utils.jwt_utils import verify_token

appointment_bp = Blueprint("appointments", __name__)


@appointment_bp.route("/api/service-requests", methods=["POST"])
def create_service_request():
    data = request.json
    response, status = facade.create_service_request(data)
    return jsonify(response), status


@appointment_bp.route("/api/customer/service-requests", methods=["GET"])
def get_customer_service_requests():
    customer_id = request.args.get("customer_id")
    if not customer_id:
        return jsonify({"error": "customer_id required"}), 400
    
    response, status = facade.get_customer_requests(customer_id)
    return jsonify(response), status


@appointment_bp.route("/api/admin/appointment-requests/count", methods=["GET"])
def get_pending_requests_count():
    """Get count of pending appointment requests for notification badge"""
    response, status = facade.get_pending_requests_count()
    return jsonify(response), status


@appointment_bp.route("/api/admin/appointment-requests", methods=["GET"])
def get_appointment_requests():
    """Get all appointment requests with customer details for admin calendar"""
    response, status = facade.get_all_requests_with_customers()
    
    if isinstance(response, dict) and 'error' in response:
        return jsonify(response), status
    
    return jsonify({"requests": response}), status


def register_appointment_routes(app):
    app.register_blueprint(appointment_bp)
    
    @app.route("/api/customer/appointments/<int:customer_id>", methods=["GET"])
    def get_customer_appointments(customer_id):
        # Authentication check
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Missing token"}), 401
        
        token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        payload = verify_token(token)
        
        if not payload or payload.get("customer_id") != customer_id:
            return jsonify({"error": "Unauthorized"}), 403
        
        response, status = facade.get_customer_requests(customer_id)
        return jsonify(response), status

    @app.route("/api/customer/appointments/<int:request_id>", methods=["DELETE"])
    def cancel_appointment(request_id):
        # Authentication check
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Missing token"}), 401
        
        token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        payload = verify_token(token)
        
        if not payload:
            return jsonify({"error": "Unauthorized"}), 403
        
        customer_id = payload.get("customer_id")
        response, status = facade.cancel_service_request(request_id, customer_id)
        return jsonify(response), status

    @app.route("/api/admin/appointments", methods=["GET"])
    def get_all_appointments():
        # Authentication check (admin only)
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Missing token"}), 401
        
        token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        payload = verify_token(token)
        
        if not payload or payload.get("role") != "admin":
            return jsonify({"error": "Unauthorized"}), 403
        
        response, status = facade.get_all_requests()
        return jsonify(response), status