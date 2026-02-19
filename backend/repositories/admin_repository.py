from models import ServiceRequest, Customer, db


def get_all_requests():
    return ServiceRequest.query.all()


def get_request_by_id(request_id):
    return ServiceRequest.query.get(request_id)


def get_customer_by_id(customer_id):
    return Customer.query.get(customer_id)


def commit():
    db.session.commit()