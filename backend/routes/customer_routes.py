from flask import request, jsonify
from utils.jwt_utils import generate_token
from services.customer_service import (
    register_customer,
    authenticate_customer
)

def register_customer_routes(app):

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


    @app.route("/api/login", methods=["POST"])
    def customer_login():
        data = request.get_json()
        response, status = authenticate_customer(
            data.get("email"),
            data.get("password")
        )
        return jsonify(response), status