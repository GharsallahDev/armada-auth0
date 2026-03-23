import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { agents, cibaRequests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getTrustScore, revokeTrust } from "@/lib/trust/engine";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const [agent] = await db.select().from(agents)
    .where(and(eq(agents.userId, user.sub), eq(agents.slug, slug)));

  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const trust = await getTrustScore(user.sub, slug);
  return NextResponse.json({ ...agent, trust });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const body = await request.json();

  const [updated] = await db.update(agents)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(agents.userId, user.sub), eq(agents.slug, slug)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const [terminated] = await db.update(agents)
    .set({ status: "terminated", updatedAt: new Date() })
    .where(and(eq(agents.userId, user.sub), eq(agents.slug, slug)))
    .returning();

  if (!terminated) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  await db.update(cibaRequests)
    .set({ status: "denied", respondedAt: new Date() })
    .where(and(eq(cibaRequests.userId, user.sub), eq(cibaRequests.agentName, slug), eq(cibaRequests.status, "pending")));

  await revokeTrust(user.sub, slug);

  return NextResponse.json(terminated);
}
