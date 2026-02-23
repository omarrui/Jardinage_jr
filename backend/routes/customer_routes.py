from flask import request, jsonify
from services.customer_service import (
    register_customer,
    authenticate_customer,
    send_reset_code,
    reset_password_with_code
)

def register_customer_routes(app):

    # ===============================
    # SIGNUP
    # ===============================
    @app.route("/api/signup", methods=["POST"])
    def customer_signup():
        data = request.get_json()

        response, status = register_customer(
            data.get("name"),
            data.get("email"),
            data.get("password"),
            data.get("phone")
        )

        return jsonify(response), status


    # ===============================
    # LOGIN
    # ===============================
    @app.route("/api/login", methods=["POST"])
    def customer_login():
        data = request.get_json()

        response, status = authenticate_customer(
            data.get("email"),
            data.get("password")
        )

        return jsonify(response), status


    # ===============================
    # FORGOT PASSWORD (SEND RESET CODE)
    # ===============================
    @app.route("/api/customer/forgot-password", methods=["POST"])
    def forgot_password():
        data = request.get_json()
        email = data.get("email")

        response, status = send_reset_code(email)

        return jsonify(response), status


    # ===============================
    # RESET PASSWORD WITH CODE
    # ===============================
    @app.route("/api/customer/reset-password", methods=["POST"])
    def reset_password():
        data = request.get_json()

        email = data.get("email")
        code = data.get("code")
        new_password = data.get("new_password")

        response, status = reset_password_with_code(
            email,
            code,
            new_password
        )

        return jsonify(response), status


    # ===============================
    # FORCE CHANGE PASSWORD (First Login)
    # ===============================
    @app.route("/api/customer/force-change-password", methods=["POST"])
    def force_change_password():
        from models import Customer, db
        from werkzeug.security import generate_password_hash

        data = request.get_json()

        customer_id = data.get("customer_id")
        new_password = data.get("new_password")

        if not customer_id or not new_password:
            return jsonify({"error": "Missing data"}), 400

        customer = Customer.query.get(customer_id)

        if not customer:
            return jsonify({"error": "Customer not found"}), 404

        customer.password = generate_password_hash(new_password)
        customer.must_change_password = False

        db.session.commit()

        return jsonify({"message": "Password updated successfully"}), 200


    # ===============================
    # NORMAL PASSWORD CHANGE (Logged In)
    # ===============================
    @app.route("/api/customer/change-password", methods=["PUT"])
    def update_password():
        from models import Customer, db
        from werkzeug.security import check_password_hash, generate_password_hash

        data = request.get_json()

        customer_id = data.get("customer_id")
        current_password = data.get("current_password")
        new_password = data.get("new_password")

        if not customer_id or not current_password or not new_password:
            return jsonify({"error": "Missing fields"}), 400

        customer = Customer.query.get(customer_id)

        if not customer:
            return jsonify({"error": "Customer not found"}), 404

        if not check_password_hash(customer.password, current_password):
            return jsonify({"error": "Current password is incorrect"}), 401

        customer.password = generate_password_hash(new_password)

        db.session.commit()

        return jsonify({"message": "Password updated successfully"}), 200


    # ===============================
    # UPDATE PROFILE
    # ===============================
    @app.route("/api/customer/update-profile", methods=["PUT"])
    def update_profile():
        from models import Customer, db
        from repositories.customer_repository import get_customer_by_email

        data = request.get_json()

        customer_id = data.get("customer_id")
        name = data.get("name")
        email = data.get("email")
        phone = data.get("phone")

        if not customer_id:
            return jsonify({"error": "Missing customer ID"}), 400

        customer = Customer.query.get(customer_id)

        if not customer:
            return jsonify({"error": "Customer not found"}), 404

        # Check if email changed and already exists
        if email and email != customer.email:
            existing = get_customer_by_email(email)
            if existing:
                return jsonify({"error": "Email already in use"}), 400
            customer.email = email

        if name:
            customer.name = name

        if phone:
            customer.phone = phone

        db.session.commit()

        return jsonify({"message": "Profile updated successfully"}), 200
    
    @app.route("/api/customer/get-profile/<int:customer_id>", methods=["GET"])
    def get_profile(customer_id):
        from models import Customer

        customer = Customer.query.get(customer_id)

        if not customer:
            return jsonify({"error": "Customer not found"}), 404

        return jsonify({
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone
        }), 200