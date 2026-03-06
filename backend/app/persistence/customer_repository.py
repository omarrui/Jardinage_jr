from models import db, Customer

def get_customer_by_email(email):
    return Customer.query.filter_by(email=email).first()

def create_customer(name, email, password, phone):
    new_customer = Customer(
        name=name,
        email=email,
        password=password,
        phone=phone
    )
    db.session.add(new_customer)
    db.session.commit()
    return new_customer