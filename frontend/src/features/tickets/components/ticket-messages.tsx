'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDateTime } from '@/lib/format'
import type { Message } from '@/lib/types'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function TicketMessages({
  messages,
  currentUserId,
}: {
  messages: Message[]
  currentUserId: number
}) {
  if (messages.length === 0) {
    return (
      <p className="py-6 text-sm text-muted-foreground">No messages yet.</p>
    )
  }

  return (
    <div className="flex flex-col gap-5 py-4">
      {messages.map((message) => (
        <div key={message.id} className="flex gap-3">
          <Avatar size="sm">
            <AvatarFallback>{initials(message.sender.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-sm font-medium">{message.sender.name}</span>
              {message.sender_id === currentUserId ? (
                <span className="text-xs text-muted-foreground">You</span>
              ) : null}
              <span className="text-xs text-muted-foreground">
                {formatDateTime(message.created_at)}
              </span>
            </div>
            <p className="mt-1 text-sm whitespace-pre-wrap">{message.body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
