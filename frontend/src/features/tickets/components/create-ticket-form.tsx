'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createTicketAction } from '@/features/tickets/actions'
import {
  TICKET_PRIORITY_LABEL,
  createTicketSchema,
  type CreateTicketValues,
} from '@/features/tickets/schema'

const CREATE_TICKET_FIELDS = ['subject', 'category', 'priority', 'message'] as const

export function CreateTicketForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void
  onCancel?: () => void
}) {
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<CreateTicketValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      subject: '',
      category: '',
      priority: 'medium',
      message: '',
    },
  })

  async function onSubmit(values: CreateTicketValues) {
    setServerError(null)

    const result = await createTicketAction(values)

    if (!result.ok) {
      for (const [field, message] of Object.entries(result.errors ?? {})) {
        if ((CREATE_TICKET_FIELDS as readonly string[]).includes(field)) {
          form.setError(field as (typeof CREATE_TICKET_FIELDS)[number], {
            type: 'server',
            message,
          })
        }
      }
      setServerError(result.message ?? 'Failed to create ticket')
      return
    }

    toast.success('Ticket created')
    form.reset()
    onSuccess?.()
  }

  return (
    <form id="create-ticket-form" noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="subject"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="create-ticket-subject">Subject</FieldLabel>
              <Input
                {...field}
                id="create-ticket-subject"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="category"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="create-ticket-category">Category</FieldLabel>
              <Input
                {...field}
                id="create-ticket-category"
                placeholder="e.g. Billing"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="priority"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="create-ticket-priority">Priority</FieldLabel>
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                items={TICKET_PRIORITY_LABEL}
              >
                <SelectTrigger
                  id="create-ticket-priority"
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Select a priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="message"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="create-ticket-message">Message</FieldLabel>
              <Textarea
                {...field}
                id="create-ticket-message"
                rows={4}
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                Describe the issue. This becomes the first message.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {serverError && <FieldError errors={[{ message: serverError }]} />}

        <div className="flex items-center justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            form="create-ticket-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Creating...' : 'Create ticket'}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
