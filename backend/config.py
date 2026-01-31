# i use this file to keep settings for my application in one place
# this helps keep app.py clean and easy to manage later

# this secret key belongs to the application, not to a user
# it is used internally by Flask to secure sessions and cookies
# this is just a placeholder
# later when authentication is fully implemented this will be replaced
# with a secure randomly generated value.
SECRET_KEY = "temporary-key-will-e-hashed-later"

# SQLite database for development
DATABASE_URL = "sqlite:///gardening.db"
