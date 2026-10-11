'use client'

import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  takeTicketAction,
  updateTicketStatusAction,
} from '@/features/tickets/actions'
import { AssignTicketDialog } from '@/features/tickets/components/assign-ticket-dialog'
import { TicketActionButton } from '@/features/tickets/components/ticket-action-button'
import {
  TICKET_PRIORITY_VARIANT,
  TICKET_STATUS_LABEL,
  TICKET_STATUS_VARIANT,
} from '@/features/tickets/labels'
import { formatDateTime } from '@/lib/format'
import type { Role, Ticket } from '@/lib/types'

const HEADER_ROW = 'bg-secondary/50 hover:bg-secondary/50'
const HEADER_CELL = 'text-xs font-medium text-muted-foreground'

function TicketRowActions({
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
  if (role === 'customer') {
    if (ticket.status !== 'resolved') {
      return null
    }

    return (
      <TicketActionButton
        label="Reopen"
        pendingLabel="Reopening..."
        successMessage="Ticket reopened"
        action={() => updateTicketStatusAction(ticket.id, 'open')}
        onDone={onChanged}
      />
    )
  }

  if (role === 'admin') {
    return (
      <>
        <AssignTicketDialog ticket={ticket} onAssigned={onChanged} />
        {ticket.status === 'in_progress' && (
          <TicketActionButton
            label="Resolve"
            pendingLabel="Resolving..."
            successMessage="Ticket resolved"
            action={() => updateTicketStatusAction(ticket.id, 'resolved')}
            onDone={onChanged}
          />
        )}
        {ticket.status === 'resolved' && (
          <TicketActionButton
            label="Close"
            pendingLabel="Closing..."
            successMessage="Ticket closed"
            action={() => updateTicketStatusAction(ticket.id, 'closed')}
            onDone={onChanged}
          />
        )}
      </>
    )
  }

  if (role === 'agent') {
    if (ticket.assigned_agent_id == null) {
      if (ticket.status !== 'open') {
        return null
      }

      return (
        <TicketActionButton
          label="Take"
          pendingLabel="Taking..."
          successMessage="Ticket assigned to you"
          action={() => takeTicketAction(ticket.id)}
          onDone={onChanged}
        />
      )
    }

    if (ticket.assigned_agent_id !== currentUserId) {
      return <span className="text-xs text-muted-foreground">&mdash;</span>
    }

    if (ticket.status === 'in_progress') {
      return (
        <TicketActionButton
          label="Resolve"
          pendingLabel="Resolving..."
          successMessage="Ticket resolved"
          action={() => updateTicketStatusAction(ticket.id, 'resolved')}
          onDone={onChanged}
        />
      )
    }

    if (ticket.status === 'resolved') {
      return (
        <TicketActionButton
          label="Close"
          pendingLabel="Closing..."
          successMessage="Ticket closed"
          action={() => updateTicketStatusAction(ticket.id, 'closed')}
          onDone={onChanged}
        />
      )
    }

    return <span className="text-xs text-muted-foreground">&mdash;</span>
  }

  return <span className="text-xs text-muted-foreground">&mdash;</span>
}

export function TicketsTable({
  tickets,
  role,
  currentUserId,
  onChanged,
  emptyMessage,
}: {
  tickets: Ticket[]
  role: Role
  currentUserId: number
  onChanged?: () => void
  emptyMessage?: string
}) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className={HEADER_ROW}>
            <TableHead className={HEADER_CELL}>Subject</TableHead>
            <TableHead className={HEADER_CELL}>Customer</TableHead>
            <TableHead className={HEADER_CELL}>Category</TableHead>
            <TableHead className={HEADER_CELL}>Priority</TableHead>
            <TableHead className={HEADER_CELL}>Status</TableHead>
            <TableHead className={HEADER_CELL}>Assigned</TableHead>
            <TableHead className={HEADER_CELL}>Updated</TableHead>
            <TableHead className={HEADER_CELL} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage ?? 'No tickets yet.'}
              </TableCell>
            </TableRow>
          ) : (
            tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="hover:underline"
                  >
                    {ticket.subject}
                  </Link>
                </TableCell>
                <TableCell>
                  {ticket.customer?.name ?? `#${ticket.customer_id}`}
                </TableCell>
                <TableCell>{ticket.category}</TableCell>
                <TableCell>
                  <Badge
                    variant={TICKET_PRIORITY_VARIANT[ticket.priority]}
                    className="capitalize"
                  >
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={TICKET_STATUS_VARIANT[ticket.status]}>
                    {TICKET_STATUS_LABEL[ticket.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {ticket.assigned_agent?.name ?? 'Unassigned'}
                </TableCell>
                <TableCell>{formatDateTime(ticket.updated_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <TicketRowActions
                      ticket={ticket}
                      role={role}
                      currentUserId={currentUserId}
                      onChanged={onChanged}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
