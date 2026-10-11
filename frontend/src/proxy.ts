import { NextResponse, type NextRequest } from "next/server";

import { me, refresh } from "@/api/auth";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_REFRESH_THRESHOLD_SECONDS,
  REFRESH_TOKEN_COOKIE,
  authCookieOptions,
} from "@/features/auth/cookies";
import { getTokenExpiry } from "@/lib/jwt";
import type { Role } from "@/lib/types";

const AUTH_PAGES = new Set(["/login", "/register"]);

const ROLE_ROUTES: { pattern: RegExp; roles: Role[] }[] = [
  { pattern: /^\/users(?:\/.*)?$/, roles: ["admin"] },
  { pattern: /^\/tickets\/new(?:\/.*)?$/, roles: ["customer"] },
];

function rolesForPath(pathname: string): Role[] | null {
  for (const route of ROLE_ROUTES) {
    if (route.pattern.test(pathname)) {
      return route.roles;
    }
  }

  return null;
}

function clearSession(redirectTo: string, request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}

const NOT_FOUND_PATH = "/__not-found";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (pathname === NOT_FOUND_PATH) {
    return NextResponse.next();
  }

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

  let currentAccessToken = accessToken;
  const response = NextResponse.next();

  if (shouldRefresh && refreshToken) {
    const { data } = await refresh(refreshToken);

    if (!data) {
      return clearSession("/login", request);
    }

    const options = authCookieOptions(data.access_token, data.refresh_token);
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
    currentAccessToken = data.access_token;
  }

  const requiredRoles = rolesForPath(pathname);

  if (requiredRoles && currentAccessToken) {
    const { data: user } = await me(currentAccessToken);

    if (!user) {
      return clearSession("/login", request);
    }

    if (!requiredRoles.includes(user.role)) {
      return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
