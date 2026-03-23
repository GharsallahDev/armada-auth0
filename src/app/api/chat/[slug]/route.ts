import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createAgentStream } from "@/lib/agents/agent-factory";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const { messages } = await request.json();
  const result = await createAgentStream(user.sub, slug, messages);
  return result.toUIMessageStreamResponse();
}
