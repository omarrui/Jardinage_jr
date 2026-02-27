from flask import request, jsonify
from services import admin_service
from models import Availability, db



def register_admin_routes(app):

    @app.route("/api/admin/customers", methods=["GET"])
    def admin_get_all_customers():
        response, status = admin_service.get_all_customers()
        return jsonify(response), status
    

    @app.route("/api/admin/customers", methods=["POST"])
    def admin_create_customer():
        data = request.get_json()
        response, status = admin_service.create_customer_by_admin(data)
        return jsonify(response), status
    

    @app.route("/api/admin/login", methods=["POST"])
    def admin_login():
        data = request.get_json()

        response, status = admin_service.authenticate_admin(
            data.get("email"),
            data.get("password")
        )

        return jsonify(response), status
    

    @app.route("/api/admin/customers/<int:customer_id>", methods=["DELETE"])
    def delete_customer(customer_id):
        response, status = admin_service.delete_customer(customer_id)
        return jsonify(response), status
    
    
    @app.route("/api/admin/customers/<int:customer_id>", methods=["PUT"])
    def update_customer(customer_id):
        data = request.get_json()

        response, status = admin_service.update_customer(customer_id, data)
        return jsonify(response), status


    @app.route("/api/admin/resend-temp-password/<int:customer_id>", methods=["POST"])
    def resend_temp_password(customer_id):
        response, status = admin_service.resend_temp_password(customer_id)
        return jsonify(response), status
    

    @app.route("/api/admin/service-requests", methods=["GET"])
    def admin_get_all_service_requests():
        response, status = admin_service.get_all_service_requests()
        return jsonify(response), status


    @app.route("/api/admin/service-requests/<int:request_id>", methods=["PUT"])
    def admin_update_service_request(request_id):
        data = request.get_json()
        response, status = admin_service.update_service_request(request_id, data)
        return jsonify(response), status
    
    @app.route("/api/admin/create-appointment", methods=["POST"])
    def create_appointment():
        data = request.get_json()
        response, status = admin_service.create_appointment(data)
        return jsonify(response), status
    
    @app.route("/api/admin/availability", methods=["POST"])
    def block_date():
        data = request.get_json()
        date = data.get("date")

        new_block = Availability(date=date)
        db.session.add(new_block)
        db.session.commit()

        return {"message": "Date bloquée"}, 201

    @app.route("/api/admin/availability", methods=["GET"])
    def get_blocked_dates():
        dates = Availability.query.all()
        return jsonify([{"date": d.date} for d in dates]), 200
    
    @app.route("/api/admin/availability/<string:date>", methods=["DELETE"])
    def delete_availability(date):
        blocked = Availability.query.filter_by(date=date).first()

        if not blocked:
            return {"error": "Date non trouvée"}, 404

        db.session.delete(blocked)
        db.session.commit()

        return {"message": "Date débloquée"}, 200