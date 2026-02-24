from models import ServiceRequest, Customer, db
from models import Admin


def delete_customer(customer):
    db.session.delete(customer)

def commit():
    db.session.commit()

def create_customer(name, email, phone, password, has_account, must_change_password=False):
    customer = Customer(
        name=name,
        email=email,
        phone=phone,
        password=password,
        has_account=has_account,
        must_change_password=must_change_password
    )

    db.session.add(customer)
    db.session.commit()

    return customer

def get_all_customers():
    return Customer.query.all()

def get_admin_by_email(email):
    return Admin.query.filter_by(email=email).first()

def get_all_requests():
    return ServiceRequest.query.all()


def get_request_by_id(request_id):
    return ServiceRequest.query.get(request_id)


def get_customer_by_id(customer_id):
    return Customer.query.get(customer_id)


def commit():
    db.session.commit()