from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, status
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.core.security import decode_access_token
from app.core.ws_manager import manager
from app.db.session import SessionLocal
from app.models import Role, User
from app.models.message import Message
from app.models.ticket import Ticket, TicketStatus
from app.schemas.message import MessageResponse

router = APIRouter()


def _get_user_from_token(token: Optional[str]) -> Optional[User]:
    if not token:
        return None
    try:
        payload = decode_access_token(token)
    except JWTError:
        return None
    sub = payload.get("sub")
    if not sub:
        return None
    try:
        user_id = int(sub)
    except (TypeError, ValueError):
        return None
    db = SessionLocal()
    try:
        return db.get(User, user_id)
    finally:
        db.close()


@router.websocket("/tickets/{ticket_id}")
async def ws_ticket(websocket: WebSocket, ticket_id: int, token: Optional[str] = Query(default=None)) -> None:
    user = _get_user_from_token(token)
    if user is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    db = SessionLocal()
    try:
        ticket = db.scalar(
            select(Ticket)
            .options(joinedload(Ticket.customer), joinedload(Ticket.assigned_agent))
            .where(Ticket.id == ticket_id)
        )
    finally:
        db.close()

    if ticket is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    is_participant = False
    if user.role == Role.CUSTOMER:
        is_participant = ticket.customer_id == user.id
    elif user.role == Role.AGENT:
        is_participant = ticket.assigned_agent_id == user.id
    elif user.role == Role.ADMIN:
        is_participant = False

    can_subscribe = is_participant or user.role == Role.ADMIN
    if not can_subscribe:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    await manager.connect(ticket_id, websocket)
    await websocket.send_json({"type": "connected", "data": {"ticket_id": ticket_id}})

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = __import__("json").loads(raw)
            except Exception:
                await websocket.send_json({"type": "error", "data": {"message": "Invalid JSON"}})
                continue

            if data.get("type") != "message.send":
                continue

            if not is_participant:
                await websocket.send_json({"type": "error", "data": {"message": "Forbidden"}})
                continue

            if ticket.status == TicketStatus.CLOSED.value:
                await websocket.send_json({"type": "error", "data": {"message": "Ticket closed"}})
                continue

            body = (data.get("body") or "").strip()
            if body == "":
                await websocket.send_json({"type": "error", "data": {"message": "Empty message"}})
                continue

            db_msg = SessionLocal()
            try:
                msg = Message(ticket_id=ticket_id, sender_id=user.id, body=body)
                db_msg.add(msg)
                db_msg.commit()
                db_msg.refresh(msg)
                msg_with_sender = db_msg.scalar(
                    select(Message)
                    .options(joinedload(Message.sender))
                    .where(Message.id == msg.id)
                )
                msg_json = MessageResponse.model_validate(msg_with_sender, from_attributes=True).model_dump(mode="json")
                await manager.broadcast(ticket_id, {"type": "message.new", "data": msg_json})
            except Exception:
                db_msg.rollback()
                await websocket.send_json({"type": "error", "data": {"message": "Failed to send"}})
            finally:
                db_msg.close()

    except WebSocketDisconnect:
        manager.disconnect(ticket_id, websocket)
    except Exception:
        manager.disconnect(ticket_id, websocket)
