from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.security import get_user_id_from_token
from app.db import get_db
from app.models import User


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    authorization = request.headers.get("Authorization")

    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is required",
        )

    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization must use Bearer token",
        )

    token = parts[1]
    user_id = get_user_id_from_token(token, "access")
    user = None
    if user_id is not None:
        user = db.scalar(
            select(User)
            .options(joinedload(User.business))
            .where(User.id == user_id)
        )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    return user