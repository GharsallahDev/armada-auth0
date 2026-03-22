import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db/client";
import { connectedServices } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const code = request.nextUrl.searchParams.get("code");
  if (!code) return new Response("Missing authorization code", { status: 400 });

  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3002";

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${baseUrl}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();
  if (!tokenRes.ok) {
    console.error("Google token exchange failed:", tokens);
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=google_auth_failed`);
  }

  const userId = session.user.sub;
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  // Upsert connected service
  const existing = await db
    .select()
    .from(connectedServices)
    .where(and(eq(connectedServices.userId, userId), eq(connectedServices.provider, "google")))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(connectedServices)
      .set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || existing[0].refreshToken,
        expiresAt,
        scopes: tokens.scope,
        updatedAt: new Date(),
      })
      .where(and(eq(connectedServices.userId, userId), eq(connectedServices.provider, "google")));
  } else {
    await db.insert(connectedServices).values({
      userId,
      provider: "google",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      scopes: tokens.scope,
    });
  }

  return NextResponse.redirect(`${baseUrl}/dashboard/settings?connected=google`);
}
