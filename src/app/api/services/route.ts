import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { connectedServices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return new Response("Unauthorized", { status: 401 });

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
