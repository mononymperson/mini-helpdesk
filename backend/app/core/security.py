from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.core.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    JWT_SECRET_KEY,
    REFRESH_TOKEN_EXPIRE_DAYS,
)


def hash_password(password: str) -> str:
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed_password.decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_token(user_id: int, token_type: str, expires_in: timedelta) -> str:
    expires_at = datetime.now(timezone.utc) + expires_in
    payload = {"sub": str(user_id), "type": token_type, "exp": expires_at}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def create_token_pair(user_id: int) -> tuple[str, str]:
    access_token = create_token(
        user_id,
        "access",
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = create_token(
        user_id,
        "refresh",
        timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )
    return access_token, refresh_token


def decode_access_token(token: str) -> dict:
    payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    if payload.get("type") != "access":
        raise JWTError("Invalid token type")
    return payload


def get_user_id_from_token(token: str, expected_type: str) -> int | None:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != expected_type:
            return None
        return int(payload["sub"])
    except (JWTError, KeyError, TypeError, ValueError):
        return None
