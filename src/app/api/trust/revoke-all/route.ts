import { auth0 } from "@/lib/auth0";
import { revokeAllTrust } from "@/lib/trust/engine";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth0.getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  await revokeAllTrust(session.user.sub);
  return NextResponse.json({
    success: true,
    message: "All agent trust levels revoked — emergency kill switch activated",
  });
}
