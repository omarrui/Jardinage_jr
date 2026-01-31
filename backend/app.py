# This file starts the Flask application and connects everything together.

from flask import Flask
from config import SECRET_KEY, DATABASE_URL
from models import db

from routes.customer_routes import register_customer_routes
from routes.appointment_routes import register_appointment_routes

app = Flask(__name__)

# App configuration
app.config["SECRET_KEY"] = SECRET_KEY
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize database
db.init_app(app)

# Register routes
register_customer_routes(app)
register_appointment_routes(app)


@app.route("/")
def home():
    return "Backend is running with database connected"


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
