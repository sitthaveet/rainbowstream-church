import { ApiError } from "./api";

export interface LineIdTokenPayload {
  iss: string;
  sub: string; // LINE userId — maps to users.line_id
  aud: string;
  exp: number;
  name?: string;
  picture?: string;
  email?: string;
}

/**
 * Verifies a LINE ID token (from LIFF `getIDToken()`) against LINE's
 * verification endpoint and returns the decoded, verified claims.
 *
 * Endpoint: POST https://api.line.me/oauth2/v2.1/verify
 * `client_id` must be the LINE Login channel ID — NOT the LIFF ID.
 */
export async function verifyLineIdToken(
  idToken: string,
): Promise<LineIdTokenPayload> {
  const clientId = process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID;
  if (!clientId) {
    throw new ApiError(500, "LINE login channel ID is not configured");
  }

  const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token: idToken, client_id: clientId }),
  });

  if (!res.ok) {
    throw new ApiError(401, "Invalid LINE ID token", "invalid_token");
  }

  const payload = (await res.json()) as Partial<LineIdTokenPayload> & {
    error?: string;
  };

  if (payload.error || !payload.sub) {
    throw new ApiError(401, "Invalid LINE ID token", "invalid_token");
  }
  if (payload.aud !== clientId) {
    throw new ApiError(401, "LINE ID token audience mismatch", "invalid_token");
  }
  if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
    throw new ApiError(401, "LINE ID token expired", "invalid_token");
  }

  return payload as LineIdTokenPayload;
}
