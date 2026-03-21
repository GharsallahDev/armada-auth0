import { auth0 } from "@/lib/auth0";
import { getAllTrustScores } from "@/lib/trust/engine";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth0.getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const scores = await getAllTrustScores(session.user.sub);
  return NextResponse.json(scores);
}
