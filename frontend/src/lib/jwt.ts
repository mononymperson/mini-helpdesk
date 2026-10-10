export function getTokenExpiry(token: string): number | null {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8"),
    ) as { exp?: number };

    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}
