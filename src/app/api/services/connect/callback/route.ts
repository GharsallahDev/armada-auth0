import { getAuthenticatedUser } from "@/lib/auth";
import { getMyAccountToken } from "@/lib/token-vault";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3002";

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.redirect(`${baseUrl}/auth/login`);
    }

    const connectCode = req.nextUrl.searchParams.get("connect_code");
    const state = req.nextUrl.searchParams.get("state");

    if (!connectCode) {
      console.error("Missing connect_code in callback");
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings?error=missing_code`
      );
    }

    const cookieStore = await cookies();
    const authSession = cookieStore.get("auth0_connect_session")?.value;

    if (!authSession) {
      console.error("Missing auth0_connect_session cookie");
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings?error=missing_session`
      );
    }

    const domain = process.env.AUTH0_DOMAIN!;
    const token = await getMyAccountToken();

    const res = await fetch(
      `https://${domain}/me/v1/connected-accounts/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          auth_session: authSession,
          connect_code: connectCode,
          redirect_uri: `${baseUrl}/api/services/connect/callback`,
        }),
      }
    );

    const data = await res.json();

    // Clear the session cookie
    cookieStore.set("auth0_connect_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    if (!res.ok) {
      console.error("Connected Accounts complete failed:", data);
      return NextResponse.redirect(
        `${baseUrl}/dashboard/settings?error=connect_complete_failed`
      );
    }

    const connectionName = data.connection || state || "unknown";

    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?connected=${encodeURIComponent(connectionName)}`
    );
  } catch (error) {
    console.error("Connect callback error:", error);
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?error=connect_failed`
    );
  }
}
