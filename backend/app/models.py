from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SqlEnum, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.db import Base


class Role(str, Enum):
    ADMIN = "admin"
    AGENT = "agent"
    CUSTOMER = "customer"


class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    slug = Column(String(150), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    users = relationship("User", back_populates="business")
    tickets = relationship("Ticket", back_populates="business")


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


class Ticket(Base):
    __tablename__ = "tickets"
    __table_args__ = (Index("ix_tickets_business_status", "business_id", "status"),)

    id = Column(Integer, primary_key=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_agent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    subject = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    priority = Column(String(20), default="normal", nullable=False)
    status = Column(String(20), default="open", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    business = relationship("Business", back_populates="tickets")
    customer = relationship("User", foreign_keys=[customer_id], back_populates="customer_tickets")
    assigned_agent = relationship(
        "User", foreign_keys=[assigned_agent_id], back_populates="assigned_tickets"
    )
    messages = relationship("Message", back_populates="ticket", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    ticket = relationship("Ticket", back_populates="messages")
    sender = relationship("User", back_populates="messages")