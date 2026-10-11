from datetime import datetime
from typing import Literal, Optional, Union

from pydantic import BaseModel

from app.models.ticket import TicketStatus
from app.schemas.message import MessageResponse


# Event types
EventTypeMessageNew = Literal["message.new"]
EventTypeTicketStatusChanged = Literal["ticket.status_changed"]
EventTypeError = Literal["error"]
EventTypeConnected = Literal["connected"]
EventTypePing = Literal["ping"]
EventTypePong = Literal["pong"]


class WSConnectedPayload(BaseModel):
    ticket_id: int


class WSErrorPayload(BaseModel):
    code: str
    message: str


class WSTicketStatusChangedData(BaseModel):
    ticket_id: int
    status: TicketStatus
    updated_at: datetime
    actor_id: Optional[int] = None


class WSMessageSend(BaseModel):
    # Client kirim pesan via WS
    type: Literal["message.send"] = "message.send"
    body: str


class WSBaseEvent(BaseModel):
    type: str


class WSMessageNewEvent(BaseModel):
    type: Literal["message.new"]
    data: MessageResponse


class WSTicketStatusChangedEvent(BaseModel):
    type: Literal["ticket.status_changed"]
    data: WSTicketStatusChangedData


class WSErrorEvent(BaseModel):
    type: Literal["error"]
    data: WSErrorPayload


class WSConnectedEvent(BaseModel):
    type: Literal["connected"]
    data: WSConnectedPayload


# Union untuk receive (client -> server) / bisa dipakai untuk validasi ringan
WSIncoming = Union[WSMessageSend]
