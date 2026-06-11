from dotenv import load_dotenv
load_dotenv()

import os
from flask import Flask, make_response, request
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

def parse_allowed_origins():
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    for env_name in ("FRONTEND_URL", "FRONTEND_ORIGINS"):
        env_value = os.getenv(env_name, "")
        origins.extend(origin.strip() for origin in env_value.split(",") if origin.strip())

    return sorted({origin.rstrip("/") for origin in origins})


frontend_origins = parse_allowed_origins()

CORS(
    app,
    supports_credentials=True,
    resources={r"/api/*": {"origins": frontend_origins}},
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        return make_response("", 204)

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
    import os
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

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
    app.run(
        host=os.getenv("FLASK_RUN_HOST", "0.0.0.0"),
        port=int(os.getenv("FLASK_RUN_PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "1") == "1"
    )
