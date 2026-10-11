'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-6">
          <h1 className="border-r border-border pr-6 text-2xl font-semibold leading-[49px]">
            404
          </h1>
          <h2 className="text-sm font-normal leading-[49px]">
            This page could not be found.
          </h2>
        </div>
        <Button variant="outline">
          <Link href="/tickets">Back to tickets</Link>
        </Button>
      </div>
    </div>
  )
}
