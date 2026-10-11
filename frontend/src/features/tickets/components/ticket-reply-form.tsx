'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function TicketReplyForm({
  onSend,
}: {
  onSend?: (body: string) => Promise<void>
}) {
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || !onSend) return

    setSending(true)
    try {
      await onSend(body.trim())
      setBody('')
    } finally {
      setSending(false)
    }
  }

  return (
    <form
      className="flex flex-col gap-2 border-t pt-3"
      onSubmit={handleSubmit}
    >
      <Textarea
        placeholder="Type your reply..."
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={sending || !body.trim()}>
          {sending ? 'Sending...' : 'Send reply'}
        </Button>
      </div>
    </form>
  )
}

