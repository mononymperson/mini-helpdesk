import type { ApiResponse } from "@/lib/types";

const BASE_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      cache: "no-store",
    });

    const payload = (await response
      .json()
      .catch(() => null)) as ApiResponse<T> | null;

    if (payload) {
      return payload;
    }

    return {
      data: null,
      message: response.ok ? "Invalid response from server" : "Request failed",
      errors: null,
    };
  } catch {
    return { data: null, message: "Unable to reach server", errors: null };
  }
}
