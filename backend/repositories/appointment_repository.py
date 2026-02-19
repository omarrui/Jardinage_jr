# backend/repositories/appointment_repository.py

from models import db, ServiceRequest


def create_request(customer_id, preferred_date, description):
    new_request = ServiceRequest(
        customer_id=customer_id,
        preferred_date=preferred_date,
        description=description,
        status="pending"
    )

    db.session.add(new_request)
    db.session.commit()

    return new_request


def get_by_customer(customer_id):
    return ServiceRequest.query.filter_by(customer_id=customer_id).all()


def get_all():
    return ServiceRequest.query.all()


def get_by_id(request_id):
    return ServiceRequest.query.get(request_id)


def commit():
    db.session.commit()