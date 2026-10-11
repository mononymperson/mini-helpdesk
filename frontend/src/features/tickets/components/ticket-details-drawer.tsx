'use client'

import { PanelRightIcon } from 'lucide-react'
import { useState } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import {
  takeTicketAction,
  updateTicketStatusAction,
} from '@/features/tickets/actions'
import { AssignTicketDialog } from '@/features/tickets/components/assign-ticket-dialog'
import { TicketActionButton } from '@/features/tickets/components/ticket-action-button'
import {
  TICKET_PRIORITY_CLASS,
  TICKET_STATUS_LABEL,
  TICKET_STATUS_VARIANT,
} from '@/features/tickets/labels'
import type { Role, Ticket } from '@/lib/types'
import { cn } from 'cn'

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function TicketDetailsDrawer({
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
  const [open, setOpen] = useState(false)

  const assigned = ticket.assigned_agent
  const isAssignedToMe =
    role === 'agent' && ticket.assigned_agent_id === currentUserId
  const canTake = role === 'agent' && ticket.assigned_agent_id === null
  const canAssignAdmin = role === 'admin'
  const canResolve =
    (role === 'admin' || isAssignedToMe) && ticket.status === 'in_progress'
  const canClose =
    (role === 'admin' || isAssignedToMe) && ticket.status === 'resolved'
  const canReopen = role === 'customer' && ticket.status === 'resolved'

  function done() {
    onChanged?.()
    setOpen(false)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
      <DrawerTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <PanelRightIcon />
        <span className="sr-only">Ticket details</span>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Ticket details</DrawerTitle>
          <DrawerDescription>#{ticket.id}</DrawerDescription>
        </DrawerHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4">
          <div className="flex items-center justify-between">
            <p className="text-base text-muted-foreground">
              Subject: {ticket.subject}
            </p>
            <Badge variant={TICKET_STATUS_VARIANT[ticket.status]}>
              {TICKET_STATUS_LABEL[ticket.status]}
            </Badge>
          </div>

          {role !== 'customer' && (
            <div className="space-y-1">
              <div className="text-sm">Customer</div>
              <Item>
                <ItemMedia>
                  <Avatar size="lg">
                    <AvatarFallback>
                      {initials(ticket.customer.name)}
                    </AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent className="gap-1">
                  <ItemTitle>{ticket.customer.name}</ItemTitle>
                  <ItemDescription className="break-all">
                    {ticket.customer.email}
                  </ItemDescription>
                </ItemContent>
              </Item>
            </div>
          )}

          <div className="space-y-1">
            <div className="text-sm">Assignee</div>
            <Item variant="muted">
              <ItemMedia>
                <Avatar>
                  <AvatarFallback>
                    {assigned
                      ? initials(firstName(assigned.name))
                      : initials('?')}
                  </AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent className="gap-1">
                <ItemTitle>
                  {assigned ? firstName(assigned.name) : 'Unassigned'}
                </ItemTitle>
              </ItemContent>
              <ItemActions>
                {canAssignAdmin && (
                  <AssignTicketDialog ticket={ticket} onAssigned={onChanged} />
                )}
                {canTake && (
                  <TicketActionButton
                    label="Take"
                    pendingLabel="Taking..."
                    successMessage="Ticket assigned to you"
                    action={() => takeTicketAction(ticket.id)}
                    onDone={done}
                  />
                )}
              </ItemActions>
            </Item>
          </div>

          <div className="space-y-1">
            <div className="text-sm">Priority</div>
            <div
              className={cn(
                'p-3 rounded-lg',
                TICKET_PRIORITY_CLASS[ticket.priority],
              )}
            >
              <span className="capitalize text-sm font-medium">
                {ticket.priority}
              </span>
            </div>
          </div>

          <Separator />



          {(canResolve || canClose || canReopen) && (
            <div className="flex flex-wrap gap-2 my-2">
              {canResolve && (
                <TicketActionButton
                  label="Resolve ticket"
                  pendingLabel="Resolving..."
                  successMessage="Ticket resolved"
                  action={() => updateTicketStatusAction(ticket.id, 'resolved')}
                  onDone={done}
                />
              )}
              {canClose && (
                <TicketActionButton
                  label="Close ticket"
                  pendingLabel="Closing..."
                  successMessage="Ticket closed"
                  variant="outline"
                  action={() => updateTicketStatusAction(ticket.id, 'closed')}
                  onDone={done}
                />
              )}
              {canReopen && (
                <TicketActionButton
                  label="Reopen ticket"
                  pendingLabel="Reopening..."
                  successMessage="Ticket reopened"
                  variant="outline"
                  action={() => updateTicketStatusAction(ticket.id, 'open')}
                  onDone={done}
                />
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
