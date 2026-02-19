from flask import request, jsonify
from models import db, ServiceRequest, Customer


def register_service_request_routes(app):

    # CREATE SERVICE REQUEST
    @app.route("/api/service-requests", methods=["POST"])
    def create_service_request():

        data = request.get_json()

        customer_id = data.get("customer_id")
        preferred_date = data.get("preferred_date")
        description = data.get("description", "")

        if not customer_id or not preferred_date:
            return jsonify({
                "error": "Customer ID and preferred date are required"
            }), 400

        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({"error": "Customer not found"}), 404

        new_request = ServiceRequest(
            customer_id=customer_id,
            preferred_date=preferred_date,
            description=description,
            status="pending"
        )

        db.session.add(new_request)
        db.session.commit()

        return jsonify({
            "message": "Service request created successfully"
        }), 201


    # GET CUSTOMER SERVICE REQUESTS
    @app.route("/api/customer/service-requests", methods=["GET"])
    def get_customer_service_requests():
        print("INSIDE CUSTOMER ROUTE")

        customer_id = request.args.get("customer_id")

        if not customer_id:
            return jsonify({"error": "Customer ID is required"}), 400

        requests = ServiceRequest.query.filter_by(
            customer_id=customer_id
        ).all()

        result = []

        for req in requests:
            result.append({
                "id": req.id,
                "preferred_date": req.preferred_date,
                "description": req.description,
                "status": req.status,
                "scheduled_start_date": req.scheduled_start_date,
                "scheduled_end_date": req.scheduled_end_date,
                "scheduled_time": req.scheduled_time
            })
        print("RESULT BEING SENT TO FRONTEND:", result)
        return jsonify(result), 200