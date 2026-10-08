from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models import Role


class BusinessResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    business_id: int
    name: str
    email: str
    role: Role
    created_at: datetime


class MeResponse(UserResponse):
    business: BusinessResponse