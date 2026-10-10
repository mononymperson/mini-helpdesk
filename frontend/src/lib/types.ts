export type Role = "admin" | "agent" | "customer";

export interface Business {
  id: number;
  slug: string;
  name: string;
}

export interface User {
  id: number;
  business_id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  business?: Business;
}

export interface ApiResponse<T> {
  data: T | null;
  message: string;
  errors: Record<string, string> | null;
}
