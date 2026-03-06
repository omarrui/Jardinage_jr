from flask import request, jsonify
from app.services import facade

def register_booking_routes(app):
    
    @app.route("/api/appointments", methods=["POST"])
    def customer_book_appointment():
        data = request.get_json()
        response, status = facade.create_service_request(data)
        return jsonify(response), status