from dotenv import load_dotenv
load_dotenv(".env.local")

import os
from flask import Flask
from flask_cors import CORS
from config import SECRET_KEY, DATABASE_URL
from models import db, Admin
from werkzeug.security import generate_password_hash

from routes.customer_routes import register_customer_routes
from routes.appointment_routes import register_appointment_routes
from routes.admin_routes import register_admin_routes


app = Flask(__name__)

# CORS configured for stateless JWT authentication.
# No cookies or session-based auth are used → CSRF protection not required.
CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:5173"}}
)

# App configuration
app.config["SECRET_KEY"] = SECRET_KEY  # NOSONAR - Loaded from .env via config.py
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL  # NOSONAR - Loaded from .env via config.py
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize database
db.init_app(app)

# Register routes
register_customer_routes(app)
register_appointment_routes(app)
register_admin_routes(app)


@app.route("/", methods=["GET"])
def home():
    return "Backend is running"


# Admin seeding (runs once)
def seed_admin():
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    
    if not admin_email or not admin_password:
        raise RuntimeError("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables.")

    existing_admin = Admin.query.filter_by(email=admin_email).first()
    if not existing_admin:
        hashed_password = generate_password_hash(admin_password)
        admin = Admin(email=admin_email, password=hashed_password)
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created")
    else:
        print("ℹ️ Admin already exists")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        seed_admin()
    app.run(debug=os.getenv("FLASK_ENV") == "development", host="127.0.0.1", port=5000)