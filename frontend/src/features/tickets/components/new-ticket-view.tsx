'use client'

import { useRouter } from 'next/navigation'

import { CreateTicketForm } from '@/features/tickets/components/create-ticket-form'

export function NewTicketView() {
  const router = useRouter()

  return (
    <div className="px-4 lg:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">New ticket</h1>
      <p className="text-sm text-muted-foreground">
        Tell us what you need help with.
      </p>
      <div className="mt-6">
        <CreateTicketForm
          onSuccess={() => router.push('/tickets')}
          onCancel={() => router.push('/tickets')}
        />
      </div>
    </div>
  )
}
