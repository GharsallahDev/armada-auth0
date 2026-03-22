import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { deviceTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// POST — register a device token for push notifications
export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
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
        eq(deviceTokens.userId, user.sub),
        eq(deviceTokens.platform, platform || "android")
      )
    );

  const [device] = await db
    .insert(deviceTokens)
    .values({
      userId: user.sub,
      token,
      platform: platform || "android",
    })
    .returning();

  return Response.json(device);
}
