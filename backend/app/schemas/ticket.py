from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.ticket import TicketPriority, TicketStatus
from app.schemas.user import UserResponse


class TicketCreateRequest(BaseModel):
    subject: str = Field(min_length=1, max_length=255)
    category: str = Field(min_length=1, max_length=100)
    priority: TicketPriority
    message: str = Field(min_length=1)


class TicketUpdateRequest(BaseModel):
    status: TicketStatus | None = None
    assigned_agent_id: int | None = None


class TicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    business_id: int
    customer_id: int
    assigned_agent_id: int | None
    subject: str
    category: str
    priority: TicketPriority
    status: TicketStatus
    created_at: datetime
    updated_at: datetime
    customer: UserResponse
    assigned_agent: UserResponse | None = None