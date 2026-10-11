import * as z from "zod";

export const TICKET_PRIORITIES = ["low", "medium", "high"] as const;

export const TICKET_PRIORITY_LABEL: Record<
  (typeof TICKET_PRIORITIES)[number],
  string
> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(1, "subject is required")
    .max(255, "subject must be at most 255 characters"),
  category: z
    .string()
    .min(1, "category is required")
    .max(100, "category must be at most 100 characters"),
  priority: z.enum(["low", "medium", "high"]),
  message: z.string().min(1, "message is required"),
});

export type CreateTicketValues = z.infer<typeof createTicketSchema>;
