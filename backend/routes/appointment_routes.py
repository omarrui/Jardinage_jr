# backend/routes/appointment_routes.py

from flask import Blueprint, request, jsonify
from services.appointment_service import AppointmentService

appointment_bp = Blueprint("appointments", __name__)
appointment_service = AppointmentService()


@appointment_bp.route("/api/service-requests", methods=["POST"])
def create_service_request():
    data = request.json
    response, status = appointment_service.create_service_request(data)
    return jsonify(response), status


@appointment_bp.route("/api/customer/service-requests", methods=["GET"])
def get_customer_service_requests():
    customer_id = request.args.get("customer_id")
    if not customer_id:
        return jsonify({"error": "customer_id required"}), 400
    
    response, status = appointment_service.get_customer_requests(customer_id)
    return jsonify(response), status


@appointment_bp.route("/api/admin/appointment-requests/count", methods=["GET"])
def get_pending_requests_count():
    """Get count of pending appointment requests for notification badge"""
    response, status = appointment_service.get_pending_requests_count()
    return jsonify(response), status


@appointment_bp.route("/api/admin/appointment-requests", methods=["GET"])
def get_appointment_requests():
    """Get all appointment requests (pending and scheduled)"""
    response, status = appointment_service.get_all_requests()
    return jsonify(response), status


def register_appointment_routes(app):
    app.register_blueprint(appointment_bp)