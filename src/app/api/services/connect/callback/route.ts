import { getAuthenticatedUser } from "@/lib/auth";
import { getMyAccountToken } from "@/lib/token-vault";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function getBaseUrl() {
  if (process.env.APP_BASE_URL && process.env.APP_BASE_URL !== "http://localhost:3002") {
    return process.env.APP_BASE_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.APP_BASE_URL || "http://localhost:3002";
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { connect_code, state } = body;

    if (!connect_code) {
      return NextResponse.json(
        { error: "Missing connect_code" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const authSession = cookieStore.get("auth0_connect_session")?.value;

    if (!authSession) {
      return NextResponse.json(
        { error: "Missing auth0_connect_session cookie. Session may have expired." },
        { status: 400 }
      );
    }

    const domain = process.env.AUTH0_DOMAIN!;
    const baseUrl = getBaseUrl();
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
          connect_code: connect_code,
          redirect_uri: `${baseUrl}/dashboard/connect/callback`,
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
      return NextResponse.json(
        { error: data.error_description || data.error || "Complete failed" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      connection: data.connection || state || "unknown",
    });
  } catch (error) {
    console.error("Connect callback error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Connect callback failed" },
      { status: 500 }
    );
  }
}
