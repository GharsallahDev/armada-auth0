import { streamText, tool, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { agents, cibaRequests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getTrustScore } from "@/lib/trust/engine";
import { buildAgentTools, type ServiceName } from "./tool-registry";
import { buildSystemPrompt } from "./prompt-builder";
import { sendCibaNotification } from "@/lib/firebase-admin";

export async function createAgentStream(
  userId: string,
  agentSlug: string,
  messages: any[]
) {
  const [agent] = await db
    .select()
    .from(agents)
    .where(and(eq(agents.userId, userId), eq(agents.slug, agentSlug), eq(agents.status, "active")));

  if (!agent) {
    throw new Error(`Agent "${agentSlug}" not found or terminated`);
  }

  const trust = await getTrustScore(userId, agentSlug);
  const services = (agent.services as ServiceName[]) || [];
  const agentTools: Record<string, any> = buildAgentTools(userId, agentSlug, services);

  // CIBA tool
  agentTools.create_ciba_request = tool({
    description: "Request manager approval for a sensitive action via mobile push notification",
    parameters: z.object({
      action: z.string().describe("The action requiring approval"),
      details: z.string().describe("Details about what will happen"),
      service: z.string().describe("The service involved"),
    }),
    execute: async (params) => {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      const [request] = await db.insert(cibaRequests).values({
        userId,
        agentName: agentSlug,
        action: params.action,
        details: params.details,
        service: params.service,
        status: "pending",
        expiresAt,
      }).returning();

      sendCibaNotification(userId, request.id, agentSlug, params.action, params.service).catch(console.error);

      return {
        success: true,
        cibaRequestId: request.id,
        status: "pending",
        expiresAt: expiresAt.toISOString(),
        message: "CIBA request created. The user has been notified on their mobile device. Waiting for approval (expires in 5 minutes).",
      };
    },
  });

  const systemPrompt = buildSystemPrompt({
    name: agent.name,
    role: agent.role,
    instructions: agent.instructions,
    services,
    trustLevel: trust.level,
  });

  return streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages,
    tools: agentTools,
    stopWhen: stepCountIs(8),
  });
}
