from flask import request, jsonify
from app.services import appointment_service
from app.utils.jwt_utils import verify_token

def register_service_request_routes(app):
    @app.route("/api/public/service-requests", methods=["POST"])
    def create_public_service_request():
        data = request.get_json(silent=True) or {}
        response, status = appointment_service.create_public_service_request(data)
        return jsonify(response), status
    
    @app.route("/api/service-requests", methods=["POST"])
    def create_service_request():
        data = request.get_json(silent=True) or {}
        # Call the correct function name from appointment_service
        response, status = appointment_service.create_service_request(data)
        return jsonify(response), status
    
    @app.route("/api/service-requests/<int:customer_id>", methods=["GET"])
    def get_customer_requests(customer_id):
        response, status = appointment_service.get_customer_requests(customer_id)
        return jsonify(response), status
