import { apiFetch } from "@/api/client";
import type { ApiResponse, User } from "@/lib/types";

export type CreateUserRole = "agent" | "customer";

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: CreateUserRole;
}

export function listUsers(accessToken: string): Promise<ApiResponse<User[]>> {
  return apiFetch<User[]>("/users", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function createUser(
  payload: CreateUserRequest,
  accessToken: string,
): Promise<ApiResponse<User>> {
  return apiFetch<User>("/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}
