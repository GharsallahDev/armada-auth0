import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db/client";
import { connectedServices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth0.getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const services = await db
    .select({
      provider: connectedServices.provider,
      scopes: connectedServices.scopes,
      createdAt: connectedServices.createdAt,
    })
    .from(connectedServices)
    .where(eq(connectedServices.userId, session.user.sub));

  return NextResponse.json(
    services.map((s) => ({
      provider: s.provider,
      connected: true,
      connectedAt: s.createdAt,
    }))
  );
}
