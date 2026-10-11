'use client'

import { Badge } from '@/components/ui/badge'
import { TicketDetailsDrawer } from '@/features/tickets/components/ticket-details-drawer'
import {
  TICKET_STATUS_LABEL,
  TICKET_STATUS_VARIANT,
} from '@/features/tickets/labels'
import { formatDateTime } from '@/lib/format'
import type { Role, Ticket } from '@/lib/types'

export function TicketDetailHeader({
  ticket,
  role,
  currentUserId,
  onChanged,
}: {
  ticket: Ticket
  role: Role
  currentUserId: number
  onChanged?: () => void
}) {
  return (
    <div className="flex shrink-0 items-start justify-between gap-4 border-b pb-4">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-tight">
          {ticket.subject}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Started by {ticket.customer?.name ?? `#${ticket.customer_id}`} ·{' '}
          {formatDateTime(ticket.created_at)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={TICKET_STATUS_VARIANT[ticket.status]}>
          {TICKET_STATUS_LABEL[ticket.status]}
        </Badge>
        <TicketDetailsDrawer
          ticket={ticket}
          role={role}
          currentUserId={currentUserId}
          onChanged={onChanged}
        />
      </div>
    </div>
  )
}
