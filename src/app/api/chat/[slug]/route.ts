import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createAgentStream } from "@/lib/agents/agent-factory";
import { db } from "@/lib/db/client";
import { chatMessages } from "@/lib/db/schema";
import { convertToModelMessages, type UIMessage } from "ai";

// Keep a reference to pending saves so they don't get garbage collected
const pendingSaves: Promise<void>[] = [];

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const body = await request.json();
  const { messages: rawMessages } = body;

  // Convert UI messages (parts format) to model messages (content format) if needed
  const isUIFormat = rawMessages.some((m: any) => m.parts);
  const messages = isUIFormat ? convertToModelMessages(rawMessages as UIMessage[]) : rawMessages;
  const result = await createAgentStream(user.sub, slug, messages);

  // Save the user message to DB immediately (use raw messages to preserve parts format)
  const lastUserMsg = [...rawMessages].reverse().find((m: any) => m.role === "user");
  if (lastUserMsg) {
    const userParts = lastUserMsg.parts || [{ type: "text", text: lastUserMsg.content || "" }];
    await db.insert(chatMessages).values({
      userId: user.sub,
      agentSlug: slug,
      role: "user",
      parts: userParts,
    });
  }

  // Save assistant response after stream is fully consumed
  const savePromise = (async () => {
    try {
      const steps = await result.steps;
      const assistantParts: any[] = [];

      for (const step of steps) {
        const toolCalls = step.toolCalls ?? [];
        const toolResults = step.toolResults ?? [];

        for (const tc of toolCalls) {
          const toolResult = toolResults.find((tr: any) => tr.toolCallId === tc.toolCallId);
          assistantParts.push({
            type: "tool-invocation",
            toolName: tc.toolName,
            toolCallId: tc.toolCallId,
            state: "output-available",
            input: tc.args,
            output: toolResult?.output ?? null,
          });
        }
        if (step.text) {
          assistantParts.push({ type: "text", text: step.text });
        }
      }

      if (assistantParts.length > 0) {
        await db.insert(chatMessages).values({
          userId: user.sub,
          agentSlug: slug,
          role: "assistant",
          parts: assistantParts,
        });
      }
    } catch (err) {
      console.error("Failed to save assistant message:", err);
    }
  })();

  // Keep reference to prevent GC
  pendingSaves.push(savePromise);
  savePromise.finally(() => {
    const idx = pendingSaves.indexOf(savePromise);
    if (idx >= 0) pendingSaves.splice(idx, 1);
  });

  return result.toUIMessageStreamResponse();
}
