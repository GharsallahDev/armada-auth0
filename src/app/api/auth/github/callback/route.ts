import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { connectedServices } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=missing_params`);
  }

  let userId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    userId = decoded.userId;
  } catch {
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=invalid_state`);
  }

  // Exchange code for token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=token_exchange_failed`);
  }

  // Upsert connected service
  const existing = await db
    .select()
    .from(connectedServices)
    .where(and(eq(connectedServices.userId, userId), eq(connectedServices.provider, "github")))
    .limit(1);

  if (existing.length > 0) {
    await db.update(connectedServices)
      .set({ accessToken: tokenData.access_token, scopes: tokenData.scope, updatedAt: new Date() })
      .where(and(eq(connectedServices.userId, userId), eq(connectedServices.provider, "github")));
  } else {
    await db.insert(connectedServices).values({
      userId,
      provider: "github",
      accessToken: tokenData.access_token,
      scopes: tokenData.scope,
    });
  }

  return NextResponse.redirect(`${baseUrl}/dashboard/settings?connected=github`);
}
