'use client'

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
    <ItemGroup>
      {messages.map((message) => (
        <Item key={message.id} variant={'outline'}>
          <ItemMedia>
            <Avatar size="sm">
              <AvatarFallback>{initials(message.sender.name)}</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              {message.sender_id === currentUserId
                ? 'You'
                : message.sender.name}
            </ItemTitle>
            <ItemDescription className="line-clamp-none">
              {message.body}
            </ItemDescription>
            <ItemDescription className="text-right text-xs text-muted-foreground mt-3">
              {formatDateTime(message.created_at)}
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}
