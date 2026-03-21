import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db/client";
import { cibaRequests } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET — list pending CIBA requests for the current user
export async function GET() {
  const session = await auth0.getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const requests = await db
    .select()
    .from(cibaRequests)
    .where(eq(cibaRequests.userId, session.user.sub))
    .orderBy(desc(cibaRequests.createdAt))
    .limit(50);

  return Response.json(requests);
}

// POST — create a new CIBA request (called by agents)
export async function POST(req: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { agentName, action, details, service } = body;

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minute timeout

  const [request] = await db
    .insert(cibaRequests)
    .values({
      userId: session.user.sub,
      agentName,
      action,
      details,
      service,
      status: "pending",
      expiresAt,
    })
    .returning();

  return Response.json(request);
}
