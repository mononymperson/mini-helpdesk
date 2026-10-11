'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function TicketReplyForm() {
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => event.preventDefault()}
    >
      <Textarea placeholder="Type your reply..." rows={3} />
      <div className="flex justify-end">
        <Button type="submit" disabled>
          Send reply
        </Button>
      </div>
    </form>
  )
}
