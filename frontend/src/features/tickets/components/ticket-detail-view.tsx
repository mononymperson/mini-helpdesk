'use client'

import { useEffect, useRef, useState } from 'react'
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
  accessToken,
}: {
  ticketId: number
  role: Role
  currentUserId: number
  accessToken?: string
}) {
  const [wsConnected, setWsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [pending, setPending] = useState<(Message & { pending: true; tempId: string })[]>([])

  const ticket = useSWR<Ticket>(`/api/tickets/${ticketId}`, fetcher)
  const messages = useSWR<Message[]>(
    `/api/tickets/${ticketId}/messages`,
    fetcher,
  )

  useEffect(() => {
    if (!accessToken) return

    const socketBaseUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ??
      `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8000`
    const socketUrl = new URL(
      `/ws/tickets/${ticketId}`,
      socketBaseUrl.endsWith('/') ? socketBaseUrl : `${socketBaseUrl}/`,
    )
    socketUrl.searchParams.set('token', accessToken)

    const ws = new WebSocket(socketUrl)

    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log(data)
        if (data.type === 'message.new') {
          setPending((prev) =>
            prev.filter(
              (p) =>
                !(
                  p.sender_id === data.data.sender_id &&
                  p.body === data.data.body
                ),
            ),
          )
          messages.mutate((prev = []) => [...prev, data.data], {
            revalidate: false,
          })
        }
        if (data.type === 'ticket.status_changed') {
          ticket.mutate(
            (prev) =>
              prev
                ? {
                    ...prev,
                    status: data.data.status,
                    updated_at: data.data.updated_at,
                  }
                : prev,
            { revalidate: false },
          )
        }
      } catch (e) {
        console.log(e)
        // ignore
      }
    }

    ws.onerror = (e) => {
      setWsConnected(false)
    }

    ws.onopen = () => {
      setWsConnected(true)
      wsRef.current = ws
    }
    ws.onclose = () => {
      setWsConnected(false)
      wsRef.current = null
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [ticketId, accessToken])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'auto',
      })
    })
  }, [messages.data?.length])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    })
  }, [pending.length])

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
      <div className="min-h-0 flex-1 overflow-y-auto" ref={scrollRef}>
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
            messages={[...(messages.data ?? []), ...pending]}
            currentUserId={currentUserId}
          />
        )}
      </div>
      {canReply(ticket.data, role, currentUserId) && (
        <TicketReplyForm
          onSend={async (body) => {
            const ws = wsRef.current
            const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
            setPending((prev) => [
              ...prev,
              {
                id: 0 as unknown as number,
                ticket_id: ticketId,
                sender_id: currentUserId,
                body,
                created_at: new Date().toISOString(),
                sender: ticket.data?.customer ?? ({} as any),
                pending: true,
                tempId,
              } as any,
            ])
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'message.send', body }))
            }
          }}
        />
      )}
    </div>
  )
}
