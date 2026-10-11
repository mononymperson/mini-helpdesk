'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { assignTicketAction } from '@/features/tickets/actions'
import { fetcher } from '@/lib/fetcher'
import type { Ticket, User } from '@/lib/types'

export function AssignTicketDialog({
  ticket,
  onAssigned,
}: {
  ticket: Ticket
  onAssigned?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [agentId, setAgentId] = useState(
    ticket.assigned_agent_id ? String(ticket.assigned_agent_id) : '',
  )
  const [submitting, setSubmitting] = useState(false)

  const { data, isLoading, error } = useSWR<User[]>(
    open ? '/api/users' : null,
    fetcher,
  )
  const agents = data?.filter((user) => user.role === 'agent') ?? []
  const agentItems = Object.fromEntries(
    agents.map((agent) => [String(agent.id), agent.name]),
  )

  async function onSubmit() {
    if (!agentId) {
      toast.error('Select an agent')
      return
    }

    setSubmitting(true)
    const result = await assignTicketAction(ticket.id, Number(agentId))
    setSubmitting(false)

    if (!result.ok) {
      toast.error(result.message ?? 'Failed to assign ticket')
      return
    }

    toast.success('Ticket assigned')
    setOpen(false)
    onAssigned?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        {ticket.assigned_agent_id ? 'Reassign' : 'Assign'}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign ticket</DialogTitle>
          <DialogDescription>{ticket.subject}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <Skeleton className="h-8 w-full" />
        ) : error ? (
          <p className="text-sm text-muted-foreground">
            Failed to load agents.
          </p>
        ) : agents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No agents available.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <Select
              value={agentId}
              onValueChange={(value) => setAgentId(value ?? '')}
              items={agentItems}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={String(agent.id)}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={onSubmit} disabled={submitting}>
              {submitting ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
