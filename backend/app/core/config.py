import os


DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "helpdesk")
DB_USERNAME = os.getenv("DB_USERNAME", "helpdesk")
DB_PASSWORD = os.getenv("DB_PASSWORD", "helpdesk")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-in-development")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))