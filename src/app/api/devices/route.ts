import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db/client";
import { deviceTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// POST — register a device token for push notifications
export async function POST(req: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { token, platform } = await req.json();

  if (!token) {
    return Response.json({ error: "Token required" }, { status: 400 });
  }

  // Upsert — delete old token for this user/platform, insert new
  await db
    .delete(deviceTokens)
    .where(
      and(
        eq(deviceTokens.userId, session.user.sub),
        eq(deviceTokens.platform, platform || "android")
      )
    );

  const [device] = await db
    .insert(deviceTokens)
    .values({
      userId: session.user.sub,
      token,
      platform: platform || "android",
    })
    .returning();

  return Response.json(device);
}
