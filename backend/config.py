import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required. Set it to your MySQL connection string.")

if not DATABASE_URL.startswith("mysql"):
    raise RuntimeError("DATABASE_URL must use MySQL, for example mysql+pymysql://user:password@host:3306/database")
