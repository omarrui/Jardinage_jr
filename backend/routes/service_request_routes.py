from flask import request, jsonify
from services.appointment_service import (
    create_service_request_service,
    get_customer_requests_service
)


def register_appointment_routes(app):

    @app.route("/api/service-requests", methods=["POST"])
    def create_service_request():
        data = request.get_json()
        response, status = create_service_request_service(data)
        return jsonify(response), status


    @app.route("api/service-requests", methods=["GET"])
    def get_customer_service_requests():
        customer_id = request.args.get("customer_id")
        response, status = get_customer_requests_service(customer_id)
        return jsonify(response), status