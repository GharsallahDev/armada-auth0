import { auth0 } from "@/lib/auth0";

// Auth0 connection names for each service
export const SERVICE_TO_CONNECTION: Record<string, string> = {
  google: "google-oauth2",
  gmail: "google-oauth2",
  calendar: "google-oauth2",
  drive: "google-oauth2",
  github: "github",
  discord: "discord",
  slack: "sign-in-with-slack",
  stripe: "stripe",
  linkedin: "linkedin",
  shopify: "shopify",
  spotify: "spotify",
  twitch: "twitch",
  facebook: "facebook",
  twitter: "twitter",
  dropbox: "dropbox",
  paypal: "paypal",
  microsoft: "windowslive",
  apple: "apple",
  bitbucket: "bitbucket",
  box: "box",
  salesforce: "salesforce",
  figma: "figma",
  quickbooks: "Quickbooks-Online",
  freshbooks: "FreshBooks",
};

/**
 * Exchange the user's Auth0 refresh token for an external provider's access token
 * via Auth0 Token Vault (RFC 8693 Token Exchange).
 */
export async function getProviderToken(connection: string): Promise<string> {
  const session = await auth0.getSession();
  if (!session) {
    throw new Error("No active session. User must be logged in.");
  }

  const refreshToken = session.tokenSet.refreshToken;
  if (!refreshToken) {
    throw new Error(
      "No refresh token in session. Ensure offline_access scope is configured."
    );
  }

  const domain = process.env.AUTH0_DOMAIN!;
  const clientId = process.env.AUTH0_CLIENT_ID!;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET!;

  const res = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      subject_token: refreshToken,
      grant_type:
        "urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token",
      subject_token_type: "urn:ietf:params:oauth:token-type:refresh_token",
      requested_token_type:
        "http://auth0.com/oauth/token-type/federated-connection-access-token",
      connection,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Token Vault exchange failed:", data);
    throw new Error(
      `Token Vault exchange failed for ${connection}: ${data.error_description || data.error || "Unknown error"}`
    );
  }

  return data.access_token;
}

/**
 * Get a provider token for a specific service (maps service name to Auth0 connection)
 */
export async function getServiceToken(service: string): Promise<string> {
  const connection = SERVICE_TO_CONNECTION[service];
  if (!connection) {
    throw new Error(`No Auth0 connection configured for service: ${service}`);
  }
  return getProviderToken(connection);
}

/**
 * Get a My Account API access token via refresh token exchange.
 * Client grant cgr_nAhyHQYjfnVufrYW authorizes this app for /me/ audience.
 */
export async function getMyAccountToken(): Promise<string> {
  const session = await auth0.getSession();
  if (!session) {
    throw new Error("No active session");
  }

  const refreshToken = session.tokenSet.refreshToken;
  if (!refreshToken) {
    throw new Error("No refresh token in session");
  }

  const domain = process.env.AUTH0_DOMAIN!;
  const clientId = process.env.AUTH0_CLIENT_ID!;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET!;

  const res = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      audience: `https://${domain}/me/`,
      scope:
        "create:me:connected_accounts read:me:connected_accounts delete:me:connected_accounts",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `My Account token failed (${res.status}): ${JSON.stringify(data)}`
    );
  }

  return data.access_token;
}
