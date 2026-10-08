from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SqlEnum, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.db import Base


class Role(str, Enum):
    ADMIN = "admin"
    AGENT = "agent"
    CUSTOMER = "customer"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(
        SqlEnum(
            Role,
            name="user_role",
            values_callable=lambda roles: [role.value for role in roles],
        ),
        default=Role.CUSTOMER.value,
        nullable=False,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    business = relationship("Business", back_populates="users")
    customer_tickets = relationship(
        "Ticket", foreign_keys="Ticket.customer_id", back_populates="customer"
    )
    assigned_tickets = relationship(
        "Ticket", foreign_keys="Ticket.assigned_agent_id", back_populates="assigned_agent"
    )
    messages = relationship("Message", back_populates="sender")