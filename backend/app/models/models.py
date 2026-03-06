from app.models import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

# Define all your models here
class Admin(db.Model):
    __tablename__ = 'admins'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=True, unique=True)
    password = db.Column(db.String(200), nullable=True)
    phone = db.Column(db.String(50), nullable=False)

    has_account = db.Column(db.Boolean, default=False)
    must_change_password = db.Column(db.Boolean, default=False)

    reset_code = db.Column(db.String(10), nullable=True)
    reset_code_expiry = db.Column(db.DateTime, nullable=True)


class ServiceRequest(db.Model):
    __tablename__ = 'service_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    preferred_date = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    address = db.Column(db.String(200))
    status = db.Column(db.String(50), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # ADMIN SCHEDULING
    scheduled_start = db.Column(db.DateTime, nullable=True)
    scheduled_end = db.Column(db.DateTime, nullable=True)


class Availability(db.Model):
    __tablename__ = 'availability'
    
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(50), nullable=False)


class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(150), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.String(500), nullable=False)
    date = db.Column(db.String(50), nullable=False)


class ContactRequest(db.Model):
    __tablename__ = 'contact_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    message = db.Column(db.String(500), nullable=False)


