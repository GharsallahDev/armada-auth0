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

    // Method 1: session.tokenSet.accessToken (raw)
    const rawToken = session.tokenSet.accessToken;
    const rawPreview = rawToken ? rawToken.slice(0, 30) : null;

    // Method 2: auth0.getAccessToken() with /me/ audience
    let sdkTokenResult: any;
    let sdkToken: string | null = null;
    try {
      const tokenResponse = await auth0.getAccessToken({
        audience: `https://${domain}/me/`,
        scope: "create:me:connected_accounts read:me:connected_accounts delete:me:connected_accounts",
      });
      sdkToken = tokenResponse.token;
      sdkTokenResult = {
        success: true,
        length: sdkToken?.length,
        preview: sdkToken?.slice(0, 30),
      };
    } catch (e: any) {
      sdkTokenResult = { error: e.message };
    }

    // Test both tokens against the My Account API
    const testToken = async (label: string, token: string | null) => {
      if (!token) return { skipped: true };
      try {
        const res = await fetch(
          `https://${domain}/me/v1/connected-accounts/accounts`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const text = await res.text();
        return { status: res.status, body: text.slice(0, 300) };
      } catch (e: any) {
        return { error: e.message };
      }
    };

    const rawTokenTest = await testToken("raw", rawToken);
    const sdkTokenTest = await testToken("sdk", sdkToken);

    return NextResponse.json({
      user: session.user.sub,
      sessionScopes: session.tokenSet.scope,
      rawToken: { preview: rawPreview, length: rawToken?.length },
      sdkTokenResult,
      rawTokenTest,
      sdkTokenTest,
    });
  } catch (e: any) {
    return NextResponse.json({
      error: e.message,
      stack: e.stack?.split("\n").slice(0, 5),
    });
  }
}
