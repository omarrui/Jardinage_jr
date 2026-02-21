# backend/services/appointment_service.py

from repositories import appointment_repository
from datetime import datetime


def create_service_request(customer_id, preferred_date, description):

    if not customer_id or not preferred_date:
        return {"error": "Customer and preferred date are required"}, 400

    appointment_repository.create_request(
        customer_id,
        preferred_date,
        description
    )

    return {"message": "Service request created successfully"}, 201


def get_customer_requests(customer_id):

    if not customer_id:
        return {"error": "Customer ID is required"}, 400

    requests = appointment_repository.get_by_customer(customer_id)

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

    return result, 200