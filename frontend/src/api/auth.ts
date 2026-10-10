import { apiFetch } from "@/api/client";
import type { ApiResponse, User } from "@/lib/types";

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  business_name: string;
  name: string;
  email: string;
  password: string;
}

export interface RegisterData extends TokenPair {
  user: User;
}

export function login(payload: LoginRequest): Promise<ApiResponse<TokenPair>> {
  return apiFetch<TokenPair>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function register(
  payload: RegisterRequest,
): Promise<ApiResponse<RegisterData>> {
  return apiFetch<RegisterData>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function me(accessToken: string): Promise<ApiResponse<User>> {
  return apiFetch<User>("/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function refresh(refreshToken: string): Promise<ApiResponse<TokenPair>> {
  return apiFetch<TokenPair>("/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}
