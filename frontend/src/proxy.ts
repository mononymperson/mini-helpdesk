import { NextResponse, type NextRequest } from "next/server";

import { refresh } from "@/api/auth";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_REFRESH_THRESHOLD_SECONDS,
  REFRESH_TOKEN_COOKIE,
  authCookieOptions,
} from "@/features/auth/cookies";
import { getTokenExpiry } from "@/lib/jwt";

const AUTH_PAGES = new Set(["/login", "/register"]);

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const hasSession = Boolean(accessToken || refreshToken);
  const isAuthPage = AUTH_PAGES.has(pathname);

  if (isAuthPage) {
    if (hasSession) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const now = Math.floor(Date.now() / 1000);
  const accessExpiry = accessToken ? getTokenExpiry(accessToken) : null;
  const shouldRefresh =
    Boolean(refreshToken) &&
    (!accessToken ||
      accessExpiry === null ||
      accessExpiry - now <= ACCESS_TOKEN_REFRESH_THRESHOLD_SECONDS);

  if (shouldRefresh && refreshToken) {
    const { data } = await refresh(refreshToken);

    if (!data) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }

    const options = authCookieOptions(data.access_token, data.refresh_token);
    const response = NextResponse.next();
    response.cookies.set(
      ACCESS_TOKEN_COOKIE,
      data.access_token,
      options.access,
    );
    response.cookies.set(
      REFRESH_TOKEN_COOKIE,
      data.refresh_token,
      options.refresh,
    );
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
