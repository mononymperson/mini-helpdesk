import { apiFetch } from "@/api/client";
import type {
  ApiResponse,
  Message,
  Ticket,
  TicketPriority,
  TicketStatus,
} from "@/lib/types";

export interface CreateTicketRequest {
  subject: string;
  category: string;
  priority: TicketPriority;
  message: string;
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  assigned_agent_id?: number;
}

export function listTickets(
  accessToken: string,
  status?: TicketStatus,
): Promise<ApiResponse<Ticket[]>> {
  const query = status ? `?status=${status}` : "";

  return apiFetch<Ticket[]>(`/tickets${query}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function createTicket(
  payload: CreateTicketRequest,
  accessToken: string,
): Promise<ApiResponse<Ticket>> {
  return apiFetch<Ticket>("/tickets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateTicket(
  id: number,
  payload: UpdateTicketRequest,
  accessToken: string,
): Promise<ApiResponse<Ticket>> {
  return apiFetch<Ticket>(`/tickets/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function getTicket(
  id: number,
  accessToken: string,
): Promise<ApiResponse<Ticket>> {
  return apiFetch<Ticket>(`/tickets/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function listMessages(
  ticketId: number,
  accessToken: string,
): Promise<ApiResponse<Message[]>> {
  return apiFetch<Message[]>(`/tickets/${ticketId}/messages`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
