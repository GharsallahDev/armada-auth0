import { getAuthenticatedUser } from "@/lib/auth";
import { revokeAllTrust } from "@/lib/trust/engine";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  await revokeAllTrust(user.sub);
  return NextResponse.json({
    success: true,
    message: "All agent trust levels revoked — emergency kill switch activated",
  });
}
