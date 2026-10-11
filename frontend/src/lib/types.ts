export type Role = 'admin' | 'agent' | 'customer'

export interface Business {
  id: number
  slug: string
  name: string
}

export interface User {
  id: number
  business_id: number
  name: string
  email: string
  role: Role
  created_at: string
  business?: Business
}

export interface ApiResponse<T> {
  data: T | null
  message: string
  errors: Record<string, string> | null
  pagination?: {
    current_page: number
    per_page: number
    total_pages: number
    total_items: number
  }
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export type TicketPriority = 'low' | 'medium' | 'high'

export interface Ticket {
  id: number
  business_id: number
  customer_id: number
  assigned_agent_id: number | null
  subject: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  created_at: string
  updated_at: string
  customer: User
  assigned_agent: User | null
}

export interface Message {
  id: number
  ticket_id: number
  sender_id: number
  body: string
  created_at: string
  sender: User
}
