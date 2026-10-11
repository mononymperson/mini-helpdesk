'use client'

import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const COLUMNS = [
  'Subject',
  'Customer',
  'Category',
  'Priority',
  'Status',
  'Assigned',
  'Updated',
  '',
]
const ROWS = 5

export function TicketsTableSkeleton() {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            {COLUMNS.map((column) => (
              <TableHead
                key={column}
                className="text-xs font-medium text-muted-foreground"
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: ROWS }).map((_, row) => (
            <TableRow key={row}>
              {COLUMNS.map((column) => (
                <TableCell key={column}>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
