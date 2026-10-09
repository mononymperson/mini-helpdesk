from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    business_name: str = Field(min_length=1, max_length=150)
    name: str = Field(min_length=1, max_length=150)
    email: EmailStr = Field(min_length=1, max_length=255)
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str


class RegisterResponse(BaseModel):
    user: UserResponse
    access_token: str
    refresh_token: str