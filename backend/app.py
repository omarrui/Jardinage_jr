from flask import Flask
from flask_cors import CORS
from config import SECRET_KEY, DATABASE_URL
from models import db, Admin
from werkzeug.security import generate_password_hash

from routes.customer_routes import register_customer_routes
from routes.appointment_routes import register_appointment_routes
from routes.admin_routes import register_admin_routes

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

@app.route("/")
def home():
    return "Backend is running"

# Admin seeding (runs once)
def seed_admin():
    admin_email = "admin@gardening.com"
    admin_password = "admin123"

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
