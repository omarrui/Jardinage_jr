from run import app, db, seed_admin


with app.app_context():
    db.create_all()
    seed_admin()

