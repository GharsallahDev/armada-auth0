import { auth0 } from "@/lib/auth0";
import { getTrustScore, revokeTrust } from "@/lib/trust/engine";
import { type AgentName } from "@/lib/trust/levels";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ agent: string }> }
) {
  const session = await auth0.getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { agent } = await params;
  const score = await getTrustScore(session.user.sub, agent as AgentName);
  return NextResponse.json(score);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ agent: string }> }
) {
  const session = await auth0.getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { agent } = await params;
  const body = await req.json();

  if (body.action === "revoke") {
    await revokeTrust(session.user.sub, agent as AgentName);
    return NextResponse.json({ success: true, message: `Trust revoked for ${agent}` });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
