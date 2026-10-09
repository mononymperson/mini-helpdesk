from datetime import datetime

from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field

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


class UserCreateRole(str, Enum):
    AGENT = Role.AGENT.value
    CUSTOMER = Role.CUSTOMER.value


class UserCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    email: EmailStr = Field(min_length=1, max_length=255)
    password: str = Field(min_length=8)
    role: UserCreateRole = UserCreateRole.CUSTOMER


class MeResponse(UserResponse):
    business: BusinessResponse