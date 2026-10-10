import * as z from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "name is required")
    .max(150, "name must be at most 150 characters"),
  email: z
    .string()
    .min(1, "email is required")
    .email("email must be a valid email")
    .max(255, "email must be at most 255 characters"),
  password: z
    .string()
    .min(1, "password is required")
    .min(8, "password must be at least 8 characters"),
  role: z.enum(["agent", "customer"]),
});

export type CreateUserValues = z.infer<typeof createUserSchema>;
