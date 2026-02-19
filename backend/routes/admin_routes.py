from flask import request, jsonify
from werkzeug.security import check_password_hash
from models import Admin, ServiceRequest, Customer, db
from datetime import datetime


def register_admin_routes(app):

    @app.route("/api/admin/login", methods=["POST"])
    def admin_login():
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        admin = Admin.query.filter_by(email=email).first()
        if not admin:
            return jsonify({"error": "Invalid email or password"}), 401

        if not check_password_hash(admin.password, password):
            return jsonify({"error": "Invalid email or password"}), 401

        return jsonify({"message": "Admin login successful"}), 200


    # ADMIN VIEW ALL SERVICE REQUESTS
    @app.route("/api/admin/service-requests", methods=["GET"])
    def admin_get_all_service_requests():

        requests = ServiceRequest.query.all()
        result = []

        for req in requests:
            customer = Customer.query.get(req.customer_id)

            result.append({
                "id": req.id,
                "customer_name": customer.name if customer else "Unknown",
                "customer_email": customer.email if customer else "Unknown",
                "customer_phone": customer.phone if customer else "Unknown",
                "preferred_date": req.preferred_date,
                "description": req.description,
                "status": req.status,
                "scheduled_start_date": req.scheduled_start_date,
                "scheduled_end_date": req.scheduled_end_date,
                "scheduled_time": req.scheduled_time
            })
        return jsonify(result), 200
    
    # ADMIN UPDATE SERVICE REQUEST
    from datetime import datetime

    # ADMIN UPDATE SERVICE REQUEST
    @app.route("/api/admin/service-requests/<int:request_id>", methods=["PUT"])
    def admin_update_service_request(request_id):

        data = request.get_json()

        service_request = ServiceRequest.query.get(request_id)

        if not service_request:
            return jsonify({"error": "Service request not found"}), 404

        new_status = data.get("status")
        start_date = data.get("scheduled_start_date")
        end_date = data.get("scheduled_end_date")
        time = data.get("scheduled_time")

        today = datetime.today().date()

        # Validate dates if provided
        if start_date:
            start = datetime.strptime(start_date, "%Y-%m-%d").date()

            if start < today:
                return jsonify({"error": "Start date cannot be in the past"}), 400

        if end_date:
            end = datetime.strptime(end_date, "%Y-%m-%d").date()

            if start_date:
                start = datetime.strptime(start_date, "%Y-%m-%d").date()
            else:
                start = datetime.strptime(service_request.scheduled_start_date, "%Y-%m-%d").date()

            if end < start:
                return jsonify({"error": "End date cannot be before start date"}), 400

        # If everything valid → update
        if new_status:
            service_request.status = new_status

        if start_date:
            service_request.scheduled_start_date = start_date

        if end_date:
            service_request.scheduled_end_date = end_date

        if time:
            service_request.scheduled_time = time

        db.session.commit()

        return jsonify({"message": "Service request updated successfully"}), 200