import { auth0 } from "@/lib/auth0";
import { createOrchestratorStream } from "@/lib/agents/orchestrator";
import { convertToModelMessages, type UIMessage } from "ai";

export async function POST(req: Request) {
  const session = await auth0.getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = (await req.json()) as { messages: UIMessage[] };
  const userId = session.user.sub;

  const modelMessages = await convertToModelMessages(messages);
  const result = createOrchestratorStream(userId, modelMessages);
  return result.toUIMessageStreamResponse();
}
