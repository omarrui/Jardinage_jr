# backend/routes/appointment_routes.py

from flask import request, jsonify
from services import appointment_service


def register_appointment_routes(app):

    @app.route("/api/service-requests", methods=["POST"])
    def create_service_request():

        data = request.get_json()

        response, status = appointment_service.create_service_request(
            data.get("customer_id"),
            data.get("preferred_date"),
            data.get("description", "")
        )

        return jsonify(response), status


    @app.route("/api/customer/service-requests", methods=["GET"])
    def get_customer_service_requests():

        customer_id = request.args.get("customer_id")

        response, status = appointment_service.get_customer_requests(customer_id)

        return jsonify(response), status