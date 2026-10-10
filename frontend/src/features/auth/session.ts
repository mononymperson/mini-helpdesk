import { cookies } from "next/headers";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  authCookieOptions,
} from "@/features/auth/cookies";

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  const cookieStore = await cookies();
  const options = authCookieOptions(accessToken, refreshToken);
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, options.access);
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, options.refresh);
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}
