import * as z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "email is required")
    .email("email must be a valid email"),
  password: z.string().min(1, "password is required"),
});

export const registerSchema = z.object({
  business_name: z
    .string()
    .min(1, "business_name is required")
    .max(150, "business_name must be at most 150 characters"),
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
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
