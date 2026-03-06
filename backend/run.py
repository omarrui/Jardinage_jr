from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS
from config import SECRET_KEY, DATABASE_URL
from app.models import db
from app.models.models import Admin
from werkzeug.security import generate_password_hash

# Route imports
from app.api.v1.customer_routes import register_customer_routes
from app.api.v1.admin_routes import register_admin_routes
from app.api.v1.booking_routes import register_booking_routes
from app.api.v1.service_request_routes import register_service_request_routes
from app.api.v1.appointment_routes import register_appointment_routes


app = Flask(__name__)

# CORS FIX
CORS(
    app,
    supports_credentials=True,
    resources={r"/api/*": {"origins": "http://localhost:5173"}}
)

# App configuration
app.config["SECRET_KEY"] = SECRET_KEY
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize database
db.init_app(app)

# Register routes
register_customer_routes(app)
register_appointment_routes(app)
register_admin_routes(app)
register_booking_routes(app)


@app.route("/")
def home():
    return "Backend is running"


# Admin seeding (runs once)
def seed_admin():
    admin_email = "admin@gardening.com"
    admin_password = "password11@"

    existing_admin = Admin.query.filter_by(email=admin_email).first()
    if not existing_admin:
        hashed_password = generate_password_hash(admin_password)
        admin = Admin(email=admin_email, password=hashed_password)
        db.session.add(admin)
        db.session.commit()
        print("Admin user created")
    else:
        print("Admin already exists")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        seed_admin()
    app.run(debug=True)