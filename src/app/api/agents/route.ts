import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { agents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AGENT_COLOR_PALETTE } from "@/lib/trust/levels";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userAgents = await db
    .select()
    .from(agents)
    .where(eq(agents.userId, user.sub))
    .orderBy(agents.createdAt);

  return NextResponse.json(userAgents);
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, role, instructions, services } = body;

  if (!name || !role || !instructions || !services?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await db.select().from(agents).where(eq(agents.userId, user.sub));
  if (existing.filter(a => a.status === "active").length >= 10) {
    return NextResponse.json({ error: "Maximum workforce reached (10 employees)" }, { status: 400 });
  }

  let slug = slugify(name);
  const slugExists = existing.some(a => a.slug === slug);
  if (slugExists) {
    let counter = 2;
    while (existing.some(a => a.slug === `${slug}-${counter}`)) counter++;
    slug = `${slug}-${counter}`;
  }

  const colorIndex = existing.length % AGENT_COLOR_PALETTE.length;
  const gradient = AGENT_COLOR_PALETTE[colorIndex].gradient;

  const [newAgent] = await db.insert(agents).values({
    userId: user.sub,
    name,
    slug,
    avatarGradient: gradient,
    role,
    instructions,
    services,
    trustPolicy: body.trustPolicy || {},
    status: "active",
  }).returning();

  return NextResponse.json(newAgent, { status: 201 });
}
