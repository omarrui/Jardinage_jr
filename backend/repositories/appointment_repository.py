from models import db, ServiceRequest

def create_service_request_repo(customer_id, preferred_date, description):

    new_request = ServiceRequest(
        customer_id,
        preferred_date=preferred_date,
        description=description,
        status="pending"
    )

    db.session.add(new_request)
    db.session.commit()

    return {"message": "Service request created succesfully"}, 200

def get_customer_requests_repo(customer_id):
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
    
    return result, 200