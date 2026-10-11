from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.user import UserResponse


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: int
    sender_id: int
    body: str
    created_at: datetime
    sender: UserResponse
