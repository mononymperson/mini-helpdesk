'use client'

import { useEffect, useRef } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
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

type DisplayMessage = Message & { pending?: boolean; tempId?: string }

export function TicketMessages({
  messages,
  currentUserId,
}: {
  messages: DisplayMessage[]
  currentUserId: number
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'auto',
      })
    })
  }, [])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div ref={scrollRef} className="h-full">
        <p className="py-6 text-sm text-muted-foreground">No messages yet.</p>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="h-full">
      <ItemGroup>
        {messages.map((message) => (
          <Item
            key={message.id || message.tempId}
            variant={'outline'}
            className={message.pending ? 'opacity-60' : ''}
          >
            <ItemMedia>
              <Avatar size="sm">
                <AvatarFallback>
                  {message.sender?.name ? initials(message.sender.name) : 'U'}
                </AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                {message.sender_id === currentUserId
                  ? 'You'
                  : message.sender?.name}
              </ItemTitle>
              <ItemDescription className="line-clamp-none">
                {message.body}
              </ItemDescription>
              <ItemDescription className="text-right text-xs text-muted-foreground mt-3">
                {message.pending ? 'Sending...' : formatDateTime(message.created_at)}
              </ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}
