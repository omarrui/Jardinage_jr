from flask import request, jsonify
from models import db, Appointment, Customer
from datetime import datetime

def register_appointment_routes(app):

    @app.route("/api/appointments", methods=["POST"])
    def create_appointment():
        data = request.get_json()

        customer_id = data.get("customer_id")
        date = data.get("date")
        time = data.get("time")

        if not customer_id or not time or not date:
            return jsonify({"error": "All fields are required"}), 400
        
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({"error": "Customer not found"}), 404
        
        try:
            datetime.strptime(time, "%H:%M")
        except ValueError:
            return jsonify({"error": "Invalid time format. use HH:MM"}), 400
        
        new_appointment = Appointment(
            customer_id=customer_id,
            date=date,
            time=time,
            status="pending"
        )

        db.session.add(new_appointment)
        db.session.commit()

        return jsonify({"message": "Appointment booked succesfully"}), 201