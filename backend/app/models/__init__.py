from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Don't import models here to avoid circular imports
# Models will import db from this file

__all__ = ['db']