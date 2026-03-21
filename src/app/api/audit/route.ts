import { auth0 } from "@/lib/auth0";
import { getAuditLogs, getAgentActivity } from "@/lib/audit/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth0.getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type") || "audit";
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  if (type === "activity") {
    const activity = await getAgentActivity(session.user.sub, limit);
    return NextResponse.json(activity);
  }

  const logs = await getAuditLogs(session.user.sub, limit, offset);
  return NextResponse.json(logs);
}
