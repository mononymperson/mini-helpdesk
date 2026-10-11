'use client'

import { ChevronLeft, ChevronRight, PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import useSWR from 'swr'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import type { Role, Ticket, TicketPriority, TicketStatus } from '@/lib/types'
import { useDebounce } from '@/lib/utils'

const PRIORITY_FILTER_ITEMS = {
  all: 'Priority: All',
  low: 'Priority: Low',
  medium: 'Priority: Medium',
  high: 'Priority: High',
} as const

const STATUS_FILTER_ITEMS = {
  all: 'Status: All',
  open: 'Status: Open',
  in_progress: 'Status: In Progress',
  resolved: 'Status: Resolved',
  closed: 'Status: Closed',
} as const

export function TicketsView({
  role,
  currentUserId,
}: {
  role: Role
  currentUserId: number
}) {
  const [filter, setFilter] = useState({
    priority: 'all',
    status: 'all',
    search: '',
  })

  const debounceFilter = useDebounce(filter)

  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    items: Ticket[]
    pagination: {
      current_page: number
      per_page: number
      total_pages: number
      total_items: number
    }
    message: string
  }>(
    debounceFilter
      ? `/api/tickets?${new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
          ...debounceFilter,
        }).toString()}`
      : null,
    fetcher,
  )

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
          <div className="flex items-center gap-3">
            <Select
              value={filter.status}
              onValueChange={(value) => {
                setFilter((prev) => ({
                  ...prev,
                  status: (value ?? 'all') as TicketStatus | 'all',
                }))
                setPage(1)
              }}
              items={STATUS_FILTER_ITEMS}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_FILTER_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filter.priority}
              onValueChange={(value) => {
                setFilter((prev) => ({
                  ...prev,
                  priority: (value ?? 'all') as TicketPriority | 'all',
                }))
                setPage(1)
              }}
              items={PRIORITY_FILTER_ITEMS}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_FILTER_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            className="w-full max-w-xs"
            placeholder="Search tickets..."
            value={filter.search}
            onChange={(e) => {
              setFilter((prev) => ({ ...prev, search: e.target.value }))
              setPage(1)
            }}
          />
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
          <>
            <TicketsTable
              tickets={data?.items ?? []}
              role={role}
              currentUserId={currentUserId}
              onChanged={() => mutate()}
              emptyMessage={
                filter.priority === 'all' && !filter.search
                  ? 'No tickets yet.'
                  : 'No tickets match this filter.'
              }
            />
            {data?.pagination.total_pages ? (
              <div className="flex items-center justify-between border-t p-2 text-sm text-muted-foreground">
                <div>
                  Page {data?.pagination.current_page ?? 1} of{' '}
                  {data?.pagination.total_pages ?? 1}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      (data?.pagination?.current_page ?? 1) >=
                      (data?.pagination.total_pages ?? 1)
                    }
                    onClick={() =>
                      setPage((p) =>
                        Math.min(data?.pagination.total_pages ?? 1, p + 1),
                      )
                    }
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
