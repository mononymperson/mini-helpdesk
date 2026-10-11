'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import useSWR from 'swr'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TicketsTable } from '@/features/tickets/components/tickets-table'
import { TicketsTableSkeleton } from '@/features/tickets/components/tickets-table-skeleton'
import { fetcher } from '@/lib/fetcher'
import type { Role, Ticket, TicketPriority } from '@/lib/types'

const PRIORITY_FILTER_ITEMS = {
  all: 'Priority: All',
  low: 'Priority: Low',
  medium: 'Priority: Medium',
  high: 'Priority: High',
} as const

export function TicketsView({
  role,
  currentUserId,
}: {
  role: Role
  currentUserId: number
}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Ticket[]>(
    '/api/tickets',
    fetcher,
  )
  const [priority, setPriority] = useState<TicketPriority | 'all'>('all')

  const tickets = data ?? []
  const filtered =
    priority === 'all'
      ? tickets
      : tickets.filter((ticket) => ticket.priority === priority)

  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Tickets</h1>
            {isValidating && !isLoading ? (
              <span className="text-xs text-muted-foreground">
                Refreshing&hellip;
              </span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {role === 'customer'
              ? 'Your support tickets.'
              : 'All support tickets in your business.'}
          </p>
        </div>
        {role === 'customer' ? (
          <Link href="/tickets/new" className={buttonVariants()}>
            <PlusIcon data-icon="inline-start" />
            New ticket
          </Link>
        ) : null}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between gap-4 border-b p-2">
          <Select
            value={priority}
            onValueChange={(value) =>
              setPriority((value ?? 'all') as TicketPriority | 'all')
            }
            items={PRIORITY_FILTER_ITEMS}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <TicketsTableSkeleton />
        ) : error ? (
          <div className="flex flex-col items-start gap-3 p-6">
            <div>
              <p className="font-medium">Failed to load tickets</p>
              <p className="text-sm text-muted-foreground">
                Something went wrong. Please try again.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => mutate()}>
              Try again
            </Button>
          </div>
        ) : (
          <TicketsTable
            tickets={filtered}
            role={role}
            currentUserId={currentUserId}
            onChanged={() => mutate()}
            emptyMessage={
              priority === 'all'
                ? 'No tickets yet.'
                : 'No tickets match this filter.'
            }
          />
        )}
      </div>
    </div>
  )
}
