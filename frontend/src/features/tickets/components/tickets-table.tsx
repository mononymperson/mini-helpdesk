'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import type { ActionState } from '@/lib/action-state'
import type { Role, Ticket } from '@/lib/types'

const PRIORITY_VARIANT = {
  low: 'outline',
  medium: 'secondary',
  high: 'destructive',
} as const

const STATUS_VARIANT = {
  open: 'default',
  in_progress: 'secondary',
  resolved: 'outline',
  closed: 'ghost',
} as const

const STATUS_LABEL = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
} as const

const HEADER_ROW = 'bg-secondary/50 hover:bg-secondary/50'
const HEADER_CELL = 'text-xs font-medium text-muted-foreground'

function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function TicketActionButton({
  label,
  pendingLabel,
  action,
  successMessage,
  variant = 'default',
  onDone,
}: {
  label: string
  pendingLabel: string
  action: () => Promise<ActionState>
  successMessage: string
  variant?: 'default' | 'outline'
  onDone?: () => void
}) {
  const [pending, startTransition] = useTransition()

  function onClick() {
    startTransition(async () => {
      const result = await action()

      if (!result.ok) {
        toast.error(result.message ?? 'Something went wrong')
        return
      }

      toast.success(successMessage)
      onDone?.()
    })
  }

  return (
    <Button size="sm" variant={variant} onClick={onClick} disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  )
}

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

    return (
      <span className="text-xs text-muted-foreground">Assigned to you</span>
    )
  }

  return null
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
                <TableCell className="font-medium">{ticket.subject}</TableCell>
                <TableCell>
                  {ticket.customer?.name ?? `#${ticket.customer_id}`}
                </TableCell>
                <TableCell>{ticket.category}</TableCell>
                <TableCell>
                  <Badge
                    variant={PRIORITY_VARIANT[ticket.priority]}
                    className="capitalize"
                  >
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[ticket.status]}>
                    {STATUS_LABEL[ticket.status]}
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
