from collections.abc import Callable

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.security import get_user_id_from_token
from app.db import get_db
from app.models import Role, User
from app.models.ticket import Ticket


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


def require_role(*allowed_roles: Role) -> Callable[[User], User]:
    """Create a dependency that restricts access to the supplied user roles."""

    def role_guard(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )

        return current_user

    return role_guard


admin_required = require_role(Role.ADMIN)
customer_required = require_role(Role.CUSTOMER)
ticket_user_required = require_role(Role.ADMIN, Role.AGENT, Role.CUSTOMER)


def get_ticket_for_current_user(
    id: int,
    current_user: User = Depends(ticket_user_required),
    db: Session = Depends(get_db),
) -> Ticket:
    ticket = db.get(Ticket, id)

    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if ticket.business_id != current_user.business_id:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if current_user.role == Role.CUSTOMER and ticket.customer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return ticket