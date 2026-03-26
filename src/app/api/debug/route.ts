import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "No session" });
    }

    const domain = process.env.AUTH0_DOMAIN!;
    const clientId = process.env.AUTH0_CLIENT_ID!;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET!;
    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3002";

    // Step 1: Raw token exchange — show FULL response
    let tokenExchangeResult: any = null;
    let token: string | null = null;

    const refreshToken = session.tokenSet.refreshToken;
    if (refreshToken) {
      // Try form-urlencoded (as shown in Auth0 docs)
      const params = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        audience: `https://${domain}/me/`,
        scope: "create:me:connected_accounts read:me:connected_accounts delete:me:connected_accounts",
      });

      const res = await fetch(`https://${domain}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      const data = await res.json();
      tokenExchangeResult = {
        status: res.status,
        has_access_token: !!data.access_token,
        token_type: data.token_type,
        scope: data.scope,
        expires_in: data.expires_in,
        token_preview: data.access_token?.slice(0, 30),
        token_length: data.access_token?.length,
        error: data.error,
        error_description: data.error_description,
      };
      token = data.access_token || null;
    }

    // Step 2: Test listing connected accounts
    let listResult: any = null;
    if (token) {
      const res = await fetch(
        `https://${domain}/me/v1/connected-accounts/accounts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const text = await res.text();
      listResult = {
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
        body: text.slice(0, 500),
      };
    }

    // Step 3: Test listing available connections
    let connectionsResult: any = null;
    if (token) {
      const res = await fetch(
        `https://${domain}/me/v1/connected-accounts/connections`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const text = await res.text();
      connectionsResult = {
        status: res.status,
        body: text.slice(0, 500),
      };
    }

    // Step 4: Test connect initiation
    let connectResult: any = null;
    if (token) {
      const res = await fetch(
        `https://${domain}/me/v1/connected-accounts/connect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            connection: "google-oauth2",
            redirect_uri: `${baseUrl}/api/services/connect/callback`,
            state: "debug-test",
            scopes: ["openid", "profile", "email"],
          }),
        }
      );
      const text = await res.text();
      connectResult = {
        status: res.status,
        body: text.slice(0, 500),
      };
    }

    return NextResponse.json({
      user: session.user.sub,
      hasRefreshToken: !!refreshToken,
      sessionScopes: session.tokenSet.scope,
      tokenExchangeResult,
      listResult,
      connectionsResult,
      connectResult,
    });
  } catch (e: any) {
    return NextResponse.json({
      error: e.message,
      stack: e.stack?.split("\n").slice(0, 5),
    });
  }
}
