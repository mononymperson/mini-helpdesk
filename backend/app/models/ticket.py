from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SqlEnum, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import relationship

from app.db import Base


class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Ticket(Base):
    __tablename__ = "tickets"
    __table_args__ = (Index("ix_tickets_business_status", "business_id", "status"),)

    id = Column(Integer, primary_key=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_agent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    subject = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    priority = Column(
        SqlEnum(TicketPriority, name="ticket_priority", values_callable=lambda values: [item.value for item in values]),
        default=TicketPriority.MEDIUM.value,
        nullable=False,
    )
    status = Column(
        SqlEnum(TicketStatus, name="ticket_status", values_callable=lambda values: [item.value for item in values]),
        default=TicketStatus.OPEN.value,
        nullable=False,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    business = relationship("Business", back_populates="tickets")
    customer = relationship("User", foreign_keys=[customer_id], back_populates="customer_tickets")
    assigned_agent = relationship(
        "User", foreign_keys=[assigned_agent_id], back_populates="assigned_tickets"
    )
    messages = relationship("Message", back_populates="ticket", order_by="Message.created_at")