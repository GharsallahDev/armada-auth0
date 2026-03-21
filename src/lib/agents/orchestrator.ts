import { google } from "@ai-sdk/google";
import { streamText, tool, stepCountIs, type ModelMessage } from "ai";
import { z } from "zod";
import { getTrustScore, getAllTrustScores } from "@/lib/trust/engine";
import { canPerformAction } from "@/lib/trust/engine";
import { logAction } from "@/lib/audit/logger";
import { AGENT_SYSTEM_PROMPTS } from "./types";
import {
  TRUST_LEVEL_NAMES,
  AGENT_DISPLAY,
  type AgentName,
} from "@/lib/trust/levels";

export function createOrchestratorStream(
  userId: string,
  messages: ModelMessage[]
) {
  return streamText({
    model: google("gemini-2.5-flash-preview-05-20"),
    system: AGENT_SYSTEM_PROMPTS.orchestrator,
    messages,
    tools: {
      check_all_trust_levels: tool({
        description:
          "Check the current trust levels for all agents. Call this at the start of complex tasks to understand what each agent can do.",
        inputSchema: z.object({}),
        execute: async () => {
          const scores = await getAllTrustScores(userId);
          const result: Record<string, string> = {};
          for (const [agent, data] of Object.entries(scores)) {
            const display = AGENT_DISPLAY[agent as AgentName];
            result[agent] =
              `${display.label}: Level ${data.level} (${TRUST_LEVEL_NAMES[data.level]}) — Score: ${data.decayedScore}`;
          }
          return result;
        },
      }),

      check_agent_trust: tool({
        description:
          "Check the trust level and capabilities of a specific agent.",
        inputSchema: z.object({
          agentName: z
            .enum(["comms", "scheduler", "finance", "docs"])
            .describe("The agent to check"),
        }),
        execute: async ({ agentName }) => {
          const trust = await getTrustScore(userId, agentName);
          const display = AGENT_DISPLAY[agentName];
          return {
            agent: display.label,
            level: trust.level,
            levelName: TRUST_LEVEL_NAMES[trust.level],
            score: trust.decayedScore,
            canRead: true,
            canDraft: trust.level >= 1,
            canExecute: trust.level >= 2,
            isAutonomous: trust.level >= 3,
          };
        },
      }),

      check_action_permission: tool({
        description:
          "Check if a specific action can be performed by an agent at their current trust level.",
        inputSchema: z.object({
          agentName: z
            .enum(["comms", "scheduler", "finance", "docs"])
            .describe("The agent that would perform the action"),
          actionType: z
            .enum(["read", "draft", "execute"])
            .describe("The type of action"),
          actionName: z
            .string()
            .optional()
            .describe(
              "The specific action name (e.g., send_email_external, create_invoice)"
            ),
        }),
        execute: async ({ agentName, actionType, actionName }) => {
          const trust = await getTrustScore(userId, agentName);
          const permission = canPerformAction(
            trust.level,
            actionType,
            actionName
          );
          return {
            ...permission,
            agentTrustLevel: trust.level,
            agentTrustScore: trust.decayedScore,
          };
        },
      }),

      delegate_to_comms: tool({
        description:
          "Delegate an email or Slack task to the Comms Agent. Use for reading emails, drafting replies, sending messages.",
        inputSchema: z.object({
          task: z
            .string()
            .describe("The task to perform (e.g., 'read latest emails', 'draft reply to John')"),
        }),
        execute: async ({ task }) => {
          const trust = await getTrustScore(userId, "comms");
          await logAction({
            userId,
            agentName: "comms",
            action: `delegated: ${task}`,
            actionType: "read",
            service: "gmail",
            trustLevel: trust.level,
            details: { task },
            inputSummary: task,
          });
          return {
            agent: "Comms Agent",
            trustLevel: trust.level,
            task,
            status: "Comms Agent is handling this task. Trust level: " + TRUST_LEVEL_NAMES[trust.level],
            note: "In a full implementation, this would execute the actual Gmail/Slack API calls via Token Vault.",
          };
        },
      }),

      delegate_to_scheduler: tool({
        description:
          "Delegate a calendar task to the Scheduler Agent. Use for checking availability, creating events.",
        inputSchema: z.object({
          task: z
            .string()
            .describe("The task to perform (e.g., 'check availability tomorrow', 'schedule meeting')"),
        }),
        execute: async ({ task }) => {
          const trust = await getTrustScore(userId, "scheduler");
          await logAction({
            userId,
            agentName: "scheduler",
            action: `delegated: ${task}`,
            actionType: "read",
            service: "calendar",
            trustLevel: trust.level,
            details: { task },
            inputSummary: task,
          });
          return {
            agent: "Scheduler Agent",
            trustLevel: trust.level,
            task,
            status: "Scheduler Agent is handling this task. Trust level: " + TRUST_LEVEL_NAMES[trust.level],
          };
        },
      }),

      delegate_to_finance: tool({
        description:
          "Delegate a financial task to the Finance Agent. Use for invoicing, payment tracking, balance checks.",
        inputSchema: z.object({
          task: z
            .string()
            .describe("The task to perform (e.g., 'list unpaid invoices', 'create invoice')"),
        }),
        execute: async ({ task }) => {
          const trust = await getTrustScore(userId, "finance");
          await logAction({
            userId,
            agentName: "finance",
            action: `delegated: ${task}`,
            actionType: "read",
            service: "stripe",
            trustLevel: trust.level,
            details: { task },
            inputSummary: task,
          });
          return {
            agent: "Finance Agent",
            trustLevel: trust.level,
            task,
            status: "Finance Agent is handling this task. Trust level: " + TRUST_LEVEL_NAMES[trust.level],
          };
        },
      }),

      delegate_to_docs: tool({
        description:
          "Delegate a document task to the Docs Agent. Use for file management, document creation, sharing.",
        inputSchema: z.object({
          task: z
            .string()
            .describe("The task to perform (e.g., 'list recent documents', 'create proposal')"),
        }),
        execute: async ({ task }) => {
          const trust = await getTrustScore(userId, "docs");
          await logAction({
            userId,
            agentName: "docs",
            action: `delegated: ${task}`,
            actionType: "read",
            service: "drive",
            trustLevel: trust.level,
            details: { task },
            inputSummary: task,
          });
          return {
            agent: "Docs Agent",
            trustLevel: trust.level,
            task,
            status: "Docs Agent is handling this task. Trust level: " + TRUST_LEVEL_NAMES[trust.level],
          };
        },
      }),
    },
    stopWhen: stepCountIs(5),
  });
}
