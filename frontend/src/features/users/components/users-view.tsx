'use client'

import useSWR from 'swr'

import { Button } from '@/components/ui/button'
import { CreateUserDialog } from '@/features/users/components/create-user-dialog'
import { UsersTable } from '@/features/users/components/users-table'
import { UsersTableSkeleton } from '@/features/users/components/users-table-skeleton'
import { fetcher } from '@/lib/fetcher'
import type { User } from '@/lib/types'

export function UsersView() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<User[]>(
    '/api/users',
    fetcher,
  )

  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
            {isValidating && !isLoading ? (
              <span className="text-xs text-muted-foreground">Refreshing…</span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Manage the agents and customers in your business.
          </p>
        </div>
        <CreateUserDialog onCreated={() => mutate()} />
      </div>
      <div className="mt-6">
        {isLoading ? (
          <UsersTableSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {error instanceof Error && error.message
                ? error.message
                : 'Failed to load users.'}
            </p>
            <Button variant="outline" size="sm" onClick={() => mutate()}>
              Try again
            </Button>
          </div>
        ) : (
          <UsersTable users={data ?? []} />
        )}
      </div>
    </div>
  )
}
