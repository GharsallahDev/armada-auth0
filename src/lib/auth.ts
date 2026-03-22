import { auth0 } from "@/lib/auth0";

interface AuthResult {
  sub: string;
  name?: string;
  email?: string;
}

/**
 * Get the authenticated user from either:
 * 1. Auth0 session cookie (web app)
 * 2. Bearer token (mobile app) - JWT verified via Auth0 JWKS
 */
export async function getAuthenticatedUser(
  request?: Request
): Promise<AuthResult | null> {
  // Try session-based auth first (web)
  try {
    const session = await auth0.getSession();
    if (session) {
      return {
        sub: session.user.sub,
        name: session.user.name,
        email: session.user.email,
      };
    }
  } catch {
    // Session auth failed, try Bearer token
  }

  // Try Bearer token auth (mobile)
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      try {
        const decoded = await verifyJwt(token);
        if (decoded) {
          return {
            sub: decoded.sub,
            name: decoded.name,
            email: decoded.email,
          };
        }
      } catch (e) {
        console.error("Bearer token verification failed:", e);
      }
    }
  }

  return null;
}

// JWKS cache
let jwksCache: { keys: JsonWebKey[]; fetchedAt: number } | null = null;

async function getJwks() {
  if (jwksCache && Date.now() - jwksCache.fetchedAt < 3600_000) {
    return jwksCache.keys;
  }
  const domain = process.env.AUTH0_DOMAIN;
  const res = await fetch(`https://${domain}/.well-known/jwks.json`);
  const data = await res.json();
  jwksCache = { keys: data.keys, fetchedAt: Date.now() };
  return data.keys;
}

async function verifyJwt(
  token: string
): Promise<{ sub: string; name?: string; email?: string } | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const headerStr = Buffer.from(parts[0], "base64url").toString();
  const header = JSON.parse(headerStr);
  const payloadStr = Buffer.from(parts[1], "base64url").toString();
  const payload = JSON.parse(payloadStr);

  // Check expiration
  if (payload.exp && payload.exp < Date.now() / 1000) return null;

  // Check issuer
  const domain = process.env.AUTH0_DOMAIN;
  if (payload.iss !== `https://${domain}/`) return null;

  // Verify signature using Web Crypto API
  const jwks = await getJwks();
  const key = jwks.find(
    (k: { kid?: string; kty?: string }) =>
      k.kid === header.kid && k.kty === "RSA"
  );
  if (!key) return null;

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    key,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const signature = Buffer.from(parts[2], "base64url");
  const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);

  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    signature,
    data
  );

  if (!valid) return null;

  return {
    sub: payload.sub,
    name: payload.name,
    email: payload.email,
  };
}
