from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import relationship

from app.db import Base


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