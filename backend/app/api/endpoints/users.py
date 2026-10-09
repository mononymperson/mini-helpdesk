from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db import get_db
from app.dependencies import admin_required
from app.models import Role, User
from app.schemas.common import ResponseJson, ResponseValidationError
from app.schemas.user import UserCreateRequest, UserResponse


router = APIRouter(prefix="/users", tags=["users"], dependencies=[Depends(admin_required)])


@router.get(
    "",
    response_model=ResponseJson[list[UserResponse]],
    responses={422: {"model": ResponseValidationError}},
    openapi_extra={"security": [{"BearerAuth": []}]},
)
def list_users(
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db),
) -> ResponseJson[list[UserResponse]]:
    users = db.scalars(
        select(User)
        .where(User.business_id == current_user.business_id)
        .order_by(User.id)
    ).all()
    return ResponseJson(data=users, message="Users retrieved successfully")


@router.post(
    "",
    response_model=ResponseJson[UserResponse],
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ResponseJson[None]},
        422: {"model": ResponseValidationError},
    },
    openapi_extra={"security": [{"BearerAuth": []}]},
)
def create_user(
    payload: UserCreateRequest,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db),
) -> ResponseJson[UserResponse]:
    email_exists = db.scalar(select(User).where(User.email == payload.email))
    if email_exists:
        raise HTTPException(
            status_code=422,
            detail={"email": "Email already registered"},
        )

    user = User(
        business_id=current_user.business_id,
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=Role(payload.role),
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Unable to create user",
        )

    return ResponseJson(data=user, message="User created successfully")
