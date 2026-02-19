from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, Customer

def register_customer_routes(app):

    @app.route("/api/signup", methods=["POST"])
    def customer_signup():
        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        phone = data.get("phone")

        if not name or not email or not password or not phone:
            return jsonify({"error": "All fields are required"}), 400

        existing_customer = Customer.query.filter_by(email=email).first()
        if existing_customer:
            return jsonify({"error": "Email already registered"}), 400

        hashed_password = generate_password_hash(password)

        new_customer = Customer(
            name=name,
            email=email,
            password=hashed_password,
            phone=phone
        )

        db.session.add(new_customer)
        db.session.commit()

        return jsonify({"message": "Customer registered successfully"}), 201


    @app.route("/api/login", methods=["POST"])
    def customer_login():
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and Password are required"}), 400

        customer = Customer.query.filter_by(email=email).first()
        if not customer:
            return jsonify({"error": "Invalid email or password"}), 401

        if not check_password_hash(customer.password, password):
            return jsonify({"error": "Invalid email or password"}), 401

        return jsonify({"message": "Login successful",
        "customer_id": customer.id   
        }), 200