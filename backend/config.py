import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required. Set it to your database connection string.")

if not DATABASE_URL.startswith(("mysql", "postgresql")):
    raise RuntimeError(
        "DATABASE_URL must use MySQL or PostgreSQL, for example "
        "mysql+pymysql://user:password@host:3306/database or "
        "postgresql+psycopg2://user:password@host:6543/database"
    )
