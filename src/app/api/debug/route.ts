import { auth0 } from "@/lib/auth0";
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

    // Try My Account API token exchange
    let myAccountResult = "not_attempted";
    if (hasRefreshToken) {
      try {
        const domain = process.env.AUTH0_DOMAIN!;
        const res = await fetch(`https://${domain}/oauth/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: process.env.AUTH0_CLIENT_ID!,
            client_secret: process.env.AUTH0_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: session.tokenSet.refreshToken,
            audience: `https://${domain}/me/`,
            scope: "create:me:connected_accounts read:me:connected_accounts delete:me:connected_accounts",
          }),
        });
        const data = await res.json();
        myAccountResult = res.ok ? "success" : JSON.stringify(data);
      } catch (e: any) {
        myAccountResult = `error: ${e.message}`;
      }
    }

    return NextResponse.json({
      user: session.user.sub,
      hasRefreshToken,
      hasAccessToken,
      scopes,
      tokenSetKeys: Object.keys(session.tokenSet),
      myAccountResult,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
