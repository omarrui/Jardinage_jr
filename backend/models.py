# I use this file to define the structure of my database.
# Each class represents one table.
# This is only the structure for Sprint 1 (no logic yet).

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Admin(db.Model):
    # This table is for the business owner (admin).
    # Admins can log in and manage appointments and availability.
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), nullable=False, unique=True)
    password = db.Column(db.String(200), nullable=False)
    # Password will be stored hashed later


class Customer(db.Model):
    # This table is for customers who sign up and log in.
    # Customers can book, view, and cancel their own appointments.
    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=True, unique=True)
    phone = db.Column(db.String(50), nullable=False)

    password = db.Column(db.String(200), nullable=True)  # now optional
    has_account = db.Column(db.Boolean, default=False)
    # Phone number is stored so the admin can contact the customer if needed



class Availability(db.Model):
    # This table stores days that are blocked by the admin.
    # Customers cannot book appointments on these dates.
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(50), nullable=False)


class Review(db.Model):
    # This table stores reviews left by customers.
    # Reviews are shown publicly on the website.
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(150), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.String(500), nullable=False)
    date = db.Column(db.String(50), nullable=False)


class ContactRequest(db.Model):
    # This table stores messages sent through the contact form.
    # Customers do not need to be logged in to send a message.
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    message = db.Column(db.String(500), nullable=False)


class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    customer_id = db.Column(
        db.Integer,
        db.ForeignKey("customer.id"),
        nullable=False
    )

    preferred_date = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    status = db.Column(db.String(50), nullable=False, default="pending")

    # ADMIN SCHEDULING
    scheduled_start_date = db.Column(db.String(50), nullable=True)
    scheduled_end_date = db.Column(db.String(50), nullable=True)
    scheduled_time = db.Column(db.String(50), nullable=True)


