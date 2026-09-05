import crypto from "node:crypto";

export const ADMIN_COOKIE_NAME = "ottica_admin_session";

export type AdminSession = {
  id: number;
  username: string;
  exp: number;
};

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET mancante o troppo corta. Deve contenere almeno 32 caratteri."
    );
  }

  return secret;
}

function base64url(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function sign(value: string) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("base64url");
}

export function createAdminSessionToken(
  id: number,
  username: string,
  durataSecondi = 60 * 60 * 8
) {
  const payload: AdminSession = {
    id,
    username,
    exp: Math.floor(Date.now() / 1000) + durataSecondi,
  };

  const encoded = base64url(JSON.stringify(payload));
  const signature = sign(encoded);

  return `${encoded}.${signature}`;
}

export function verifyAdminSessionToken(
  token: string | undefined | null
): AdminSession | null {
  if (!token) return null;

  const parti = token.split(".");
  if (parti.length !== 2) return null;

  const [encoded, signature] = parti;
  const expected = sign(encoded);

  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expected);

  if (
    sigBuffer.length !== expBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as AdminSession;

    if (
      !payload ||
      typeof payload.id !== "number" ||
      typeof payload.username !== "string" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
