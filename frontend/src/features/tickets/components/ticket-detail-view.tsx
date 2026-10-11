'use client'

import useSWR from 'swr'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TicketDetailHeader } from '@/features/tickets/components/ticket-detail-header'
import { TicketMessages } from '@/features/tickets/components/ticket-messages'
import { TicketReplyForm } from '@/features/tickets/components/ticket-reply-form'
import { fetcher } from '@/lib/fetcher'
import type { Message, Role, Ticket } from '@/lib/types'

const HEIGHT =
  'h-[calc(100dvh-var(--header-height)-2rem)] md:h-[calc(100dvh-var(--header-height)-4rem)]'

function canReply(ticket: Ticket, role: Role, currentUserId: number) {
  if (ticket.status === 'closed') {
    return false
  }

  if (role === 'admin') {
    return false
  }

  if (role === 'agent') {
    return ticket.assigned_agent_id === currentUserId
  }

  return true
}

export function TicketDetailView({
  ticketId,
  role,
  currentUserId,
}: {
  ticketId: number
  role: Role
  currentUserId: number
}) {
  const ticket = useSWR<Ticket>(`/api/tickets/${ticketId}`, fetcher)
  const messages = useSWR<Message[]>(
    `/api/tickets/${ticketId}/messages`,
    fetcher,
  )

  if (ticket.isLoading) {
    return (
      <div className={`flex ${HEIGHT} flex-col px-4 lg:px-6`}>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-48" />
        <Skeleton className="mt-6 flex-1" />
      </div>
    )
  }

  if (ticket.error || !ticket.data) {
    return (
      <div
        className={`flex ${HEIGHT} flex-col items-center justify-center gap-3 px-4 text-center lg:px-6`}
      >
        <p className="text-sm text-muted-foreground">
          {ticket.error?.message ?? 'Failed to load ticket'}
        </p>
        <Button variant="outline" onClick={() => ticket.mutate()}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex ${HEIGHT} flex-col gap-4 px-4 lg:px-6`}>
      <TicketDetailHeader
        ticket={ticket.data}
        role={role}
        currentUserId={currentUserId}
        onChanged={() => ticket.mutate()}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {messages.isLoading ? (
          <div className="flex flex-col gap-5 py-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.error ? (
          <p className="py-6 text-sm text-destructive">
            {messages.error.message}
          </p>
        ) : (
          <TicketMessages
            messages={messages.data ?? []}
            currentUserId={currentUserId}
          />
        )}
      </div>
      {canReply(ticket.data, role, currentUserId) && <TicketReplyForm />}
    </div>
  )
}
