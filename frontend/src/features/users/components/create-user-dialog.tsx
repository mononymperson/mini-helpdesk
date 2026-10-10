'use client'

import { useState } from 'react'
import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CreateUserForm } from '@/features/users/components/create-user-form'

export function CreateUserDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Add user
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Add an agent or customer to your business.
          </DialogDescription>
        </DialogHeader>
        <CreateUserForm
          onSuccess={() => {
            setOpen(false)
            onCreated?.()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
