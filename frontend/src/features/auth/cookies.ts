import { getTokenExpiry } from "@/lib/jwt";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

export const ACCESS_TOKEN_REFRESH_THRESHOLD_SECONDS = 60;

const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProduction,
  path: "/",
};

export const accessTokenCookieOptions = {
  ...baseCookieOptions,
  maxAge: 60 * 30,
};

export const refreshTokenCookieOptions = {
  ...baseCookieOptions,
  maxAge: 60 * 60 * 24 * 7,
};

function maxAgeFromToken(token: string, fallback: number): number {
  const expiry = getTokenExpiry(token);

  if (expiry === null) {
    return fallback;
  }

  const seconds = expiry - Math.floor(Date.now() / 1000);
  return seconds > 0 ? seconds : fallback;
}

export function authCookieOptions(accessToken: string, refreshToken: string) {
  return {
    access: {
      ...accessTokenCookieOptions,
      maxAge: maxAgeFromToken(accessToken, accessTokenCookieOptions.maxAge),
    },
    refresh: {
      ...refreshTokenCookieOptions,
      maxAge: maxAgeFromToken(refreshToken, refreshTokenCookieOptions.maxAge),
    },
  };
}
