import { auth0 } from "@/lib/auth0";
import { getMyAccountToken } from "@/lib/token-vault";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "No session" });
    }

    const hasRefreshToken = !!session.tokenSet.refreshToken;
    const hasAccessToken = !!session.tokenSet.accessToken;
    const scopes = session.tokenSet.scope;

    // Step 1: Get My Account token
    let tokenResult: string;
    let token: string | null = null;
    try {
      token = await getMyAccountToken();
      tokenResult = `success (length=${token.length}, preview=${token.slice(0, 20)}...)`;
    } catch (e: any) {
      tokenResult = `error: ${e.message}`;
    }

    // Step 2: Try listing connected accounts with that token
    let listAccountsResult: string;
    if (token) {
      try {
        const domain = process.env.AUTH0_DOMAIN!;
        const res = await fetch(
          `https://${domain}/me/v1/connected-accounts/accounts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        listAccountsResult = res.ok
          ? `success: ${JSON.stringify(data)}`
          : `error (${res.status}): ${JSON.stringify(data)}`;
      } catch (e: any) {
        listAccountsResult = `fetch error: ${e.message}`;
      }
    } else {
      listAccountsResult = "skipped (no token)";
    }

    // Step 3: Try initiating a connect (dry run - just to see if the API accepts us)
    let connectTestResult: string;
    if (token) {
      try {
        const domain = process.env.AUTH0_DOMAIN!;
        const baseUrl = process.env.APP_BASE_URL || "http://localhost:3002";
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
        const data = await res.json();
        connectTestResult = res.ok
          ? `success: ${JSON.stringify(data).slice(0, 200)}`
          : `error (${res.status}): ${JSON.stringify(data)}`;
      } catch (e: any) {
        connectTestResult = `fetch error: ${e.message}`;
      }
    } else {
      connectTestResult = "skipped (no token)";
    }

    return NextResponse.json({
      user: session.user.sub,
      hasRefreshToken,
      hasAccessToken,
      scopes,
      tokenResult,
      listAccountsResult,
      connectTestResult,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.split("\n").slice(0, 5) });
  }
}
