import { getAuthenticatedUser } from "@/lib/auth";
import { getAllTrustScores } from "@/lib/trust/engine";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const scores = await getAllTrustScores(user.sub);
  return NextResponse.json(scores);
}
