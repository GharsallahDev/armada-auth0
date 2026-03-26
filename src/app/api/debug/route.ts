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
    const token = session.tokenSet.accessToken!;

    // Decode token structure
    const parts = token.split(".");
    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString());

    // Try decoding payload if it's a JWT (3 parts)
    let payload: any = null;
    if (parts.length === 3) {
      try {
        payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
      } catch {}
    }

    // Test 1: Call /me/ with current token
    const test1 = await testEndpoint(
      `https://${domain}/me/v1/connected-accounts/accounts`,
      token
    );

    // Test 2: Try getting a token via client_credentials for Management API
    // to call GET /api/v2/client-grants and verify our grant
    let grantCheck: any = null;
    try {
      // Use the MCP-style approach - get a management token
      const clientId = process.env.AUTH0_CLIENT_ID!;
      const clientSecret = process.env.AUTH0_CLIENT_SECRET!;

      // Direct refresh token exchange with form-urlencoded
      const refreshToken = session.tokenSet.refreshToken!;
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

      if (data.access_token) {
        const exchangeParts = data.access_token.split(".");
        const exchangeHeader = JSON.parse(Buffer.from(exchangeParts[0], "base64url").toString());

        // Test this token too
        const test2 = await testEndpoint(
          `https://${domain}/me/v1/connected-accounts/accounts`,
          data.access_token
        );

        grantCheck = {
          exchangeStatus: res.status,
          exchangeScope: data.scope,
          exchangeTokenParts: exchangeParts.length,
          exchangeHeader,
          exchangeTokenLength: data.access_token.length,
          apiTest: test2,
        };
      } else {
        grantCheck = { exchangeStatus: res.status, error: data };
      }
    } catch (e: any) {
      grantCheck = { error: e.message };
    }

    // Test 3: Try calling a DIFFERENT /me/ endpoint to verify the API is alive
    const test3 = await testEndpoint(
      `https://${domain}/me/`,
      token
    );

    // Test 4: No auth at all — see what error we get
    let noAuthTest: any;
    try {
      const res = await fetch(`https://${domain}/me/v1/connected-accounts/accounts`);
      noAuthTest = { status: res.status, body: (await res.text()).slice(0, 300) };
    } catch (e: any) {
      noAuthTest = { error: e.message };
    }

    return NextResponse.json({
      user: session.user.sub,
      sessionScopes: session.tokenSet.scope,
      tokenAnalysis: {
        parts: parts.length,
        header,
        payload: payload ? { aud: payload.aud, scope: payload.scope, iss: payload.iss, exp: payload.exp } : "encrypted (JWE)",
        length: token.length,
      },
      meApiTest: test1,
      refreshExchangeTest: grantCheck,
      meRootTest: test3,
      noAuthTest,
    });
  } catch (e: any) {
    return NextResponse.json({
      error: e.message,
      stack: e.stack?.split("\n").slice(0, 5),
    });
  }
}

async function testEndpoint(url: string, token: string) {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { status: res.status, body: (await res.text()).slice(0, 300) };
  } catch (e: any) {
    return { error: e.message };
  }
}
