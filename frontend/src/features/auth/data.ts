import { cacheLife } from "next/cache";

import { me } from "@/api/auth";
import { getAccessToken } from "@/features/auth/session";
import type { User } from "@/lib/types";

export async function getCurrentUser(): Promise<User | null> {
  "use cache: private";
  cacheLife({ stale: 60 });

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  const response = await me(accessToken);
  return response.data;
}
