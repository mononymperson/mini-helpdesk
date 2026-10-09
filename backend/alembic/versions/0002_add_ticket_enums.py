"""add ticket status and priority enums

Revision ID: 0002_add_ticket_enums
Revises: 0001_create_helpdesk_tables
"""

from typing import Sequence, Union

from alembic import op
from sqlalchemy.dialects import postgresql
import sqlalchemy as sa


revision: str = "0002_add_ticket_enums"
down_revision: Union[str, None] = "0001_create_helpdesk_tables"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    ticket_status = postgresql.ENUM(
        "open", "in_progress", "resolved", "closed",
        name="ticket_status",
    )
    ticket_priority = postgresql.ENUM(
        "low", "medium", "high",
        name="ticket_priority",
    )

    ticket_status.create(op.get_bind(), checkfirst=True)
    ticket_priority.create(op.get_bind(), checkfirst=True)

    op.alter_column(
        "tickets",
        "status",
        type_=ticket_status,
        postgresql_using="status::ticket_status",
    )
    op.alter_column(
        "tickets",
        "priority",
        type_=ticket_priority,
        postgresql_using="priority::ticket_priority",
    )


def downgrade() -> None:
    op.alter_column(
        "tickets",
        "priority",
        type_=sa.String(length=20),
        postgresql_using="priority::text",
    )
    op.alter_column(
        "tickets",
        "status",
        type_=sa.String(length=20),
        postgresql_using="status::text",
    )
    op.execute("DROP TYPE ticket_priority")
    op.execute("DROP TYPE ticket_status")