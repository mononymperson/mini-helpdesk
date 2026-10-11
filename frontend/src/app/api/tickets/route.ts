import { listTickets } from '@/api/tickets'
import { getCurrentUser } from '@/features/auth/data'
import { getAccessToken } from '@/features/auth/session'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return Response.json({ message: 'Not authenticated' }, { status: 401 })
  }

  const accessToken = await getAccessToken()

  if (!accessToken) {
    return Response.json({ message: 'Not authenticated' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('pageSize') || '10', 10)
  const priority = searchParams.get('priority') || 'all'
  const status = searchParams.get('status') || 'all'
  const search = searchParams.get('search') || ''

  const { data, pagination, message } = await listTickets(accessToken, {
    page,
    limit,
    status,
    priority,
    search,
  })

  if (!data) {
    return Response.json(
      { message: message || 'Failed to load tickets' },
      { status: 404 },
    )
  }

  return Response.json({
    items: data,
    pagination,
    message,
  })
}
