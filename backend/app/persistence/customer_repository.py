from app.models.models import db, Customer

def get_customer_by_email(email):
    return Customer.query.filter_by(email=email).first()

def create_customer(name, email, password, phone, has_account=True, must_change_password=False):
    new_customer = Customer(
        name=name,
        email=email,
        password=password,
        phone=phone,
        has_account=has_account,
        must_change_password=must_change_password
    )
    db.session.add(new_customer)
    db.session.commit()
    return new_customer
