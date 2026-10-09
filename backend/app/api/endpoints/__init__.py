from app.api.endpoints.auth import router as auth
from app.api.endpoints.tickets import router as ticket
from app.api.endpoints.users import router as user

__all__ = ["auth", "ticket", "user"]
