from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Models will import db from this file

__all__ = ['db']