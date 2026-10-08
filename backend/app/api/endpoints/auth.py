import re

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import (
    create_token_pair,
    get_user_id_from_token,
    hash_password,
    verify_password,
)
from app.db import get_db
from app.dependencies import get_current_user
from app.models import Business, Role, User
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
)
from app.schemas.common import ResponseJson, ResponseValidationError
from app.schemas.user import MeResponse, UserResponse


router = APIRouter(prefix="/auth", tags=["auth"])


def create_business_slug(business_name: str, db: Session) -> str:
    slug = re.sub("[^a-z0-9]+", "-", business_name.lower()).strip("-")

    if slug == "":
        slug = "business"

    base_slug = slug[:140]
    slug = base_slug
    number = 2

    while db.scalar(select(Business).where(Business.slug == slug)) is not None:
        slug = f"{base_slug}-{number}"
        number += 1

    return slug


@router.post(
    "/register",
    response_model=ResponseJson[RegisterResponse],
    status_code=status.HTTP_201_CREATED,
    responses={422: {"model": ResponseValidationError}},
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
) -> ResponseJson[RegisterResponse]:
    email_exists = db.scalar(select(User).where(User.email == payload.email))

    if email_exists:
        raise HTTPException(
            status_code=422,
            detail={"email": "Email already registered"},
        )

    business_slug = create_business_slug(payload.business_name, db)
    business = Business(name=payload.business_name, slug=business_slug)
    db.add(business)
    db.flush()

    user = User(
        business_id=business.id,
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=Role.ADMIN,
    )
    db.add(user)

    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email already registered")

    access_token, refresh_token = create_token_pair(user.id)
    return ResponseJson(
        data=RegisterResponse(
            user=user,
            access_token=access_token,
            refresh_token=refresh_token,
        ),
        message="Registration successful",
    )


@router.post(
    "/login",
    response_model=ResponseJson[TokenResponse],
    responses={
        401: {
            "model": ResponseJson[None],
            "description": "Authentication failed",
            "content": {
                "application/json": {
                    "example": {
                        "data": None,
                        "message": "Incorrect email or password",
                        "errors": None,
                    }
                }
            },
        },
        422: {"model": ResponseValidationError},
    },
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> ResponseJson[TokenResponse]:
    user = db.scalar(select(User).where(User.email == payload.email))

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token, refresh_token = create_token_pair(user.id)
    return ResponseJson(
        data=TokenResponse(access_token=access_token, refresh_token=refresh_token),
        message="Login successful",
    )


@router.post(
    "/refresh",
    response_model=ResponseJson[TokenResponse],
    responses={422: {"model": ResponseValidationError}},
)
def refresh(
    payload: RefreshRequest,
    db: Session = Depends(get_db),
) -> ResponseJson[TokenResponse]:
    user_id = get_user_id_from_token(payload.refresh_token, "refresh")
    user = db.get(User, user_id) if user_id is not None else None

    if user is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    access_token, refresh_token = create_token_pair(user.id)
    return ResponseJson(
        data=TokenResponse(access_token=access_token, refresh_token=refresh_token),
        message="Token refreshed successfully",
    )


@router.get(
    "/me",
    response_model=ResponseJson[MeResponse],
    responses={
        401: {
            "model": ResponseJson[None],
            "description": "Authentication failed",
            "content": {
                "application/json": {
                    "example": {
                        "data": None,
                        "message": "Authorization header is required",
                        "errors": None,
                    }
                }
            },
        }
    },
    openapi_extra={"security": [{"BearerAuth": []}]},
)
def me(current_user: User = Depends(get_current_user)) -> ResponseJson[MeResponse]:
    return ResponseJson(data=current_user, message="User retrieved successfully")