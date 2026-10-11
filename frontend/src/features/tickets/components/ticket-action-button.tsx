'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import type { ActionState } from '@/lib/action-state'

export function TicketActionButton({
  label,
  pendingLabel,
  action,
  successMessage,
  variant = 'default',
  onDone,
}: {
  label: string
  pendingLabel: string
  action: () => Promise<ActionState>
  successMessage: string
  variant?: 'default' | 'outline'
  onDone?: () => void
}) {
  const [pending, startTransition] = useTransition()

  function onClick() {
    startTransition(async () => {
      const result = await action()

      if (!result.ok) {
        toast.error(result.message ?? 'Something went wrong')
        return
      }

      toast.success(successMessage)
      onDone?.()
    })
  }

  return (
    <Button
      className={'w-full'}
      variant={variant}
      onClick={onClick}
      disabled={pending}
    >
      {pending ? pendingLabel : label}
    </Button>
  )
}
