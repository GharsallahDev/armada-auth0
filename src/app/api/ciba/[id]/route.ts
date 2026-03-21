import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db/client";
import { cibaRequests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// PATCH — approve or deny a CIBA request
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth0.getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action } = body as { action: "approve" | "deny" };

  if (!["approve", "deny"].includes(action)) {
    return Response.json({ error: "Invalid action" }, { status: 400 });
  }

  // Get the request first to verify ownership
  const [request] = await db
    .select()
    .from(cibaRequests)
    .where(
      and(eq(cibaRequests.id, id), eq(cibaRequests.userId, session.user.sub))
    );

  if (!request) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (request.status !== "pending") {
    return Response.json(
      { error: "Request already resolved", status: request.status },
      { status: 409 }
    );
  }

  // Check if expired
  if (new Date() > request.expiresAt) {
    await db
      .update(cibaRequests)
      .set({ status: "expired" })
      .where(eq(cibaRequests.id, id));
    return Response.json({ error: "Request expired" }, { status: 410 });
  }

  const newStatus = action === "approve" ? "approved" : "denied";

  const [updated] = await db
    .update(cibaRequests)
    .set({ status: newStatus, respondedAt: new Date() })
    .where(eq(cibaRequests.id, id))
    .returning();

  return Response.json(updated);
}
