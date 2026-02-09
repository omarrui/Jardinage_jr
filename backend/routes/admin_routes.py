# routes/admin_routes.py
# This file contains all admin-related API routes.
# Admins can log in and manage appointments.

from flask import request, jsonify
from werkzeug.security import check_password_hash
from models import Admin, Appointment, Customer, db


def register_admin_routes(app):

    # Admin login
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

    # View all appointments
    @app.route("/api/admin/appointments", methods=["GET"])
    def admin_get_appointments():
        appointments = Appointment.query.all()
        result = []

        for appointment in appointments:
            customer = Customer.query.get(appointment.customer_id)

            result.append({
                "id": appointment.id,
                "customer_name": customer.name if customer else "Unknown",
                "date": appointment.date,
                "time": appointment.time,
                "status": appointment.status
            })

        return jsonify(result), 200

    # Update appointment status
    @app.route("/api/admin/appointments/<int:appointment_id>", methods=["PUT"])
    def admin_update_appointment(appointment_id):
        data = request.get_json()
        new_status = data.get("status")

        if new_status not in ["pending", "confirmed", "cancelled"]:
            return jsonify({"error": "Invalid status"}), 400

        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404

        appointment.status = new_status
        db.session.commit()

        return jsonify({"message": "Appointment status updated"}), 200
