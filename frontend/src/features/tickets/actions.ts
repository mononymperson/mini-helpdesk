"use server";

import { createTicket, updateTicket } from "@/api/tickets";
import { getCurrentUser } from "@/features/auth/data";
import { getAccessToken } from "@/features/auth/session";
import {
  createTicketSchema,
  type CreateTicketValues,
} from "@/features/tickets/schema";
import type { ActionState } from "@/lib/action-state";
import type { TicketStatus } from "@/lib/types";

export async function createTicketAction(
  values: CreateTicketValues,
): Promise<ActionState> {
  const parsed = createTicketSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: "Invalid input" };
  }

  const user = await getCurrentUser();

  if (!user || user.role !== "customer") {
    return { ok: false, message: "Only customers can create tickets" };
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { ok: false, message: "Not authenticated" };
  }

  const { data, message, errors } = await createTicket(parsed.data, accessToken);

  if (!data) {
    return { ok: false, message: message || "Failed to create ticket", errors };
  }

  return { ok: true };
}

export async function takeTicketAction(ticketId: number): Promise<ActionState> {
  const user = await getCurrentUser();

  if (!user || user.role !== "agent") {
    return { ok: false, message: "Only agents can take tickets" };
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { ok: false, message: "Not authenticated" };
  }

  const { data, message, errors } = await updateTicket(
    ticketId,
    { assigned_agent_id: user.id },
    accessToken,
  );

  if (!data) {
    return { ok: false, message: message || "Failed to take ticket", errors };
  }

  return { ok: true };
}

export async function assignTicketAction(
  ticketId: number,
  agentId: number,
): Promise<ActionState> {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return { ok: false, message: "Only admins can assign tickets" };
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { ok: false, message: "Not authenticated" };
  }

  const { data, message, errors } = await updateTicket(
    ticketId,
    { assigned_agent_id: agentId },
    accessToken,
  );

  if (!data) {
    return { ok: false, message: message || "Failed to assign ticket", errors };
  }

  return { ok: true };
}

export async function updateTicketStatusAction(
  ticketId: number,
  status: TicketStatus,
): Promise<ActionState> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { ok: false, message: "Not authenticated" };
  }

  const { data, message, errors } = await updateTicket(
    ticketId,
    { status },
    accessToken,
  );

  if (!data) {
    return { ok: false, message: message || "Failed to update ticket", errors };
  }

  return { ok: true };
}
