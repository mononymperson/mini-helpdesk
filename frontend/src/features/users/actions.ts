"use server";

import { createUser } from "@/api/users";
import { getAccessToken } from "@/features/auth/session";
import {
  createUserSchema,
  type CreateUserValues,
} from "@/features/users/schema";
import type { ActionState } from "@/lib/action-state";

export async function createUserAction(
  values: CreateUserValues,
): Promise<ActionState> {
  const parsed = createUserSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: "Invalid input" };
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { ok: false, message: "Not authenticated" };
  }

  const { data, message, errors } = await createUser(parsed.data, accessToken);

  if (!data) {
    return { ok: false, message: message || "Failed to create user", errors };
  }

  return { ok: true };
}
