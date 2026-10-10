import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/data";
import type { Role } from "@/lib/types";

export async function requireRole(...roles: Role[]) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  if (!roles.includes(user.role)) {
    notFound();
  }

  return user;
}
