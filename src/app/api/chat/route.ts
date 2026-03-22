import { getAuthenticatedUser } from "@/lib/auth";
import { createOrchestratorStream } from "@/lib/agents/orchestrator";
import { convertToModelMessages, type UIMessage } from "ai";

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = (await req.json()) as { messages: UIMessage[] };
  const userId = user.sub;

  const modelMessages = await convertToModelMessages(messages);
  const result = createOrchestratorStream(userId, modelMessages);
  return result.toUIMessageStreamResponse();
}
