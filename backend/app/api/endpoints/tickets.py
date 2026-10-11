from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.dependencies import (
    customer_required,
    get_current_user,
    get_ticket_for_current_user,
    ticket_user_required,
)
from app.models import Role, User
from app.models.message import Message
from app.models.ticket import Ticket, TicketStatus, TicketPriority
from app.schemas.common import Pagination, ResponseJson, ResponseWithPagination, ResponseValidationError
from app.schemas.message import MessageResponse
from app.schemas.ticket import TicketCreateRequest, TicketResponse, TicketUpdateRequest
from app.core.ws_manager import manager
from app.schemas.ws import (
    WSTicketStatusChangedData,
    WSTicketStatusChangedEvent,
)

import math


router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.post(
    "",
    response_model=ResponseJson[TicketResponse],
    status_code=status.HTTP_201_CREATED,
    responses={422: {"model": ResponseValidationError}},
    openapi_extra={"security": [{"BearerAuth": []}]},
)
def create_ticket(
    payload: TicketCreateRequest,
    current_user: User = Depends(customer_required),
    db: Session = Depends(get_db),
) -> ResponseJson[TicketResponse]:
    ticket = Ticket(
        business_id=current_user.business_id,
        customer_id=current_user.id,
        subject=payload.subject,
        category=payload.category,
        priority=payload.priority.value,
        status=TicketStatus.OPEN.value,
    )
    db.add(ticket)
    db.flush()

    first_message = Message(
        ticket_id=ticket.id,
        sender_id=current_user.id,
        body=payload.message,
    )
    db.add(first_message)
    db.commit()
    db.refresh(ticket, ["customer", "assigned_agent"])
    return ResponseJson(data=ticket, message="Ticket created successfully")


@router.get(
    "",
    response_model=ResponseWithPagination[list[TicketResponse]],
    responses={422: {"model": ResponseValidationError}},
    openapi_extra={"security": [{"BearerAuth": []}]},
)
def list_tickets(
    limit: int = Query(default=10, ge=1, le=100),
    page: int = Query(default=1, ge=1),
    search: str | None = Query(default=None, alias="search"),
    priority: TicketPriority | str | None = Query(default="all", alias="priority"),
    status: TicketStatus | str | None = Query(default="all", alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ResponseJson[list[TicketResponse]]:
    query = select(Ticket).where(Ticket.business_id == current_user.business_id)

    if current_user.role == Role.CUSTOMER:
        query = query.where(Ticket.customer_id == current_user.id)
    if status is not None and status != "all":
        query = query.where(Ticket.status == status)
    if priority is not None and priority != "all":
        query = query.where(Ticket.priority == priority)
    if search is not None:
        query = query.where(Ticket.subject.ilike(f"%{search}%"))

    total_items = db.scalar(
        select(func.count()).select_from(query.subquery())
    )
    current_page = page
    per_page = limit
    total_pages = math.ceil(total_items / per_page)

    tickets = list(db.scalars(
        query.order_by(Ticket.updated_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .options(
            joinedload(Ticket.customer),
            joinedload(Ticket.assigned_agent),
        )
    ).all())

    return ResponseWithPagination(
        data=tickets, 
        message="Tickets retrieved successfully", 
        pagination=Pagination(
            current_page=current_page,
            per_page=per_page,
            total_pages=total_pages,
            total_items=total_items,
        )
    )


@router.get(
    "/{id}",
    response_model=ResponseJson[TicketResponse],
    responses={422: {"model": ResponseValidationError}},
    openapi_extra={"security": [{"BearerAuth": []}]},
)
def get_ticket(
    ticket: Ticket = Depends(get_ticket_for_current_user),
) -> ResponseJson[TicketResponse]:
    return ResponseJson(data=ticket, message="Ticket retrieved successfully")


@router.get(
    "/{id}/messages",
    response_model=ResponseJson[list[MessageResponse]],
    responses={422: {"model": ResponseValidationError}},
    openapi_extra={"security": [{"BearerAuth": []}]},
)
def list_ticket_messages(
    ticket: Ticket = Depends(get_ticket_for_current_user),
    db: Session = Depends(get_db),
) -> ResponseJson[list[MessageResponse]]:
    messages = list(
        db.scalars(
            select(Message)
            .where(Message.ticket_id == ticket.id)
            .order_by(Message.created_at)
            .options(joinedload(Message.sender))
        ).all()
    )
    return ResponseJson(data=messages, message="Messages retrieved successfully")


@router.patch(
    "/{id}",
    response_model=ResponseJson[TicketResponse],
    responses={422: {"model": ResponseValidationError}},
    openapi_extra={"security": [{"BearerAuth": []}]},
)
def update_ticket(
    payload: TicketUpdateRequest,
    current_user: User = Depends(ticket_user_required),
    ticket: Ticket = Depends(get_ticket_for_current_user),
    db: Session = Depends(get_db),
) -> ResponseJson[TicketResponse]:
    if current_user.role == Role.CUSTOMER:
        if ticket.status != TicketStatus.RESOLVED.value or payload.status != TicketStatus.OPEN:
            raise HTTPException(status_code=403, detail="Customer can only reopen resolved tickets")
        ticket.status = TicketStatus.OPEN.value
        ticket.assigned_agent_id = None

    elif current_user.role == Role.AGENT:
        if payload.assigned_agent_id not in (None, current_user.id):
            raise HTTPException(status_code=403, detail="Agent can only assign tickets to self")
        if payload.assigned_agent_id is not None:
            if ticket.assigned_agent_id not in (None, current_user.id):
                raise HTTPException(status_code=409, detail="Ticket is already assigned")
            ticket.assigned_agent_id = current_user.id
            if ticket.status == TicketStatus.OPEN.value:
                ticket.status = TicketStatus.IN_PROGRESS.value
        if payload.status is not None:
            if ticket.assigned_agent_id != current_user.id:
                raise HTTPException(
                    status_code=403,
                    detail="Only the assigned agent can update the status",
                )
            if not (
                ticket.status == TicketStatus.IN_PROGRESS.value
                and payload.status == TicketStatus.RESOLVED
            ) and not (
                ticket.status == TicketStatus.RESOLVED.value
                and payload.status == TicketStatus.CLOSED
            ):
                raise HTTPException(status_code=403, detail="Invalid status transition")
            ticket.status = payload.status.value

    elif current_user.role == Role.ADMIN:
        if payload.assigned_agent_id is not None:
            agent = db.scalar(
                select(User).where(
                    User.id == payload.assigned_agent_id,
                    User.business_id == current_user.business_id,
                    User.role == Role.AGENT,
                )
            )
            if agent is None:
                raise HTTPException(status_code=400, detail="Agent not found in this business")
            ticket.assigned_agent_id = agent.id
            if ticket.status == TicketStatus.OPEN.value:
                ticket.status = TicketStatus.IN_PROGRESS.value
        if payload.status is not None:
            if not (
                ticket.status == TicketStatus.IN_PROGRESS.value
                and payload.status == TicketStatus.RESOLVED
            ) and not (
                ticket.status == TicketStatus.RESOLVED.value
                and payload.status == TicketStatus.CLOSED
            ):
                raise HTTPException(status_code=403, detail="Invalid status transition")
            ticket.status = payload.status.value

    db.commit()
    db.refresh(ticket, ["customer", "assigned_agent"])

    try:
        event = WSTicketStatusChangedEvent(
            type="ticket.status_changed",
            data=WSTicketStatusChangedData(
                ticket_id=ticket.id,
                status=ticket.status,
                updated_at=ticket.updated_at,
                actor_id=current_user.id,
            ),
        )
        import asyncio

        asyncio.create_task(
            manager.broadcast(
                ticket.id,
                event.model_dump(mode="json"),
            )
        )
    except Exception:
        pass

    return ResponseJson(data=ticket, message="Ticket updated successfully")
