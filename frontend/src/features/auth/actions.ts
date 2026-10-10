"use server";

import { redirect } from "next/navigation";

import { login, register } from "@/api/auth";
import {
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from "@/features/auth/schema";
import { clearAuthCookies, setAuthCookies } from "@/features/auth/session";
import type { ActionState } from "@/lib/action-state";

export async function loginAction(values: LoginValues): Promise<ActionState> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: "Invalid input" };
  }

  const { data, message, errors } = await login(parsed.data);

  if (!data?.access_token || !data.refresh_token) {
    return { ok: false, message: message || "Login failed", errors };
  }

  await setAuthCookies(data.access_token, data.refresh_token);
  return { ok: true };
}

export async function registerAction(
  values: RegisterValues,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: "Invalid input" };
  }

  const { data, message, errors } = await register(parsed.data);

  if (!data?.access_token || !data.refresh_token) {
    return { ok: false, message: message || "Registration failed", errors };
  }

  await setAuthCookies(data.access_token, data.refresh_token);
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  await clearAuthCookies();
  redirect("/login");
}
