import { getAuthenticatedUser } from "@/lib/auth";
import { getMyAccountToken } from "@/lib/token-vault";
import { db } from "@/lib/db/client";
import { connectedServices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return new Response("Unauthorized", { status: 401 });

  // Try Auth0 My Account API first
  try {
    const token = await getMyAccountToken();
    const domain = process.env.AUTH0_DOMAIN!;

    const res = await fetch(
      `https://${domain}/me/v1/connected-accounts/accounts`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      // Auth0 wraps accounts in { accounts: [...] }
      const accounts = Array.isArray(data) ? data : data.accounts || [];

      return NextResponse.json(
        accounts.map(
          (a: { connection?: string; created_at?: string; id?: string }) => ({
            provider: a.connection,
            connected: true,
            connectedAt: a.created_at,
            connectionId: a.id,
          })
        )
      );
    }

    // If My Account API returned an error, fall through to DB
    console.warn(
      "My Account API returned non-OK status, falling back to DB:",
      res.status
    );
  } catch (error) {
    console.warn("My Account API failed, falling back to DB:", error);
  }

  // Fallback: read from database
  const services = await db
    .select({
      provider: connectedServices.provider,
      scopes: connectedServices.scopes,
      createdAt: connectedServices.createdAt,
    })
    .from(connectedServices)
    .where(eq(connectedServices.userId, user.sub));

  return NextResponse.json(
    services.map((s) => ({
      provider: s.provider,
      connected: true,
      connectedAt: s.createdAt,
    }))
  );
}
