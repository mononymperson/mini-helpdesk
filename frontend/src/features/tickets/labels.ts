import type { TicketPriority, TicketStatus } from "@/lib/types";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost";

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const TICKET_STATUS_VARIANT: Record<TicketStatus, BadgeVariant> = {
  open: "default",
  in_progress: "secondary",
  resolved: "outline",
  closed: "ghost",
};

export const TICKET_PRIORITY_VARIANT: Record<TicketPriority, BadgeVariant> = {
  low: "outline",
  medium: "secondary",
  high: "destructive",
};

export const TICKET_PRIORITY_CLASS: Record<TicketPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-secondary text-secondary-foreground",
  high: "bg-destructive/10 text-destructive",
};
