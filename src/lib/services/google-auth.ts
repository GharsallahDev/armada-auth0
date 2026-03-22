import { db } from "@/lib/db/client";
import { eq, and } from "drizzle-orm";
import { connectedServices } from "@/lib/db/schema";

// Get stored Google tokens for a user
export async function getGoogleTokens(userId: string) {
  const rows = await db
    .select()
    .from(connectedServices)
    .where(
      and(
        eq(connectedServices.userId, userId),
        eq(connectedServices.provider, "google")
      )
    )
    .limit(1);

  if (rows.length === 0) return null;

  const row = rows[0];

  // Check if token is expired and refresh if needed
  if (row.expiresAt && row.expiresAt < new Date() && row.refreshToken) {
    return refreshGoogleToken(userId, row.refreshToken);
  }

  return {
    accessToken: row.accessToken,
    refreshToken: row.refreshToken,
  };
}

async function refreshGoogleToken(userId: string, refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Google token refresh failed: ${data.error}`);

  // Update stored tokens
  await db
    .update(connectedServices)
    .set({
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(connectedServices.userId, userId),
        eq(connectedServices.provider, "google")
      )
    );

  return {
    accessToken: data.access_token,
    refreshToken,
  };
}

async function googleApi(
  accessToken: string,
  url: string,
  options?: RequestInit
) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google API error (${res.status}): ${err}`);
  }
  return res.json();
}

export { googleApi };
