import { getAuthenticatedUser } from "@/lib/auth";
import { getAuditLogs, getAgentActivity } from "@/lib/audit/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type") || "audit";
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  if (type === "activity") {
    const activity = await getAgentActivity(user.sub, limit);
    return NextResponse.json(activity);
  }

  const logs = await getAuditLogs(user.sub, limit, offset);
  return NextResponse.json(logs);
}
