import { TRUST_LEVEL_NAMES } from "@/lib/trust/levels";
import type { ServiceName } from "./tool-registry";

const SERVICE_DESCRIPTIONS: Record<ServiceName, string> = {
  gmail: "Gmail (search, read, draft, send emails)",
  calendar: "Google Calendar (view, check availability, schedule events)",
  drive: "Google Drive (search, read, create, share documents)",
  slack: "Slack (list channels, read messages, send messages)",
  stripe: "Stripe (view balance, payments, customers, invoices; create and send invoices)",
  github: "GitHub (list repos, issues, PRs; create issues and comments)",
  discord: "Discord (list servers, channels, read and send messages)",
  linkedin: "LinkedIn (view profile, create posts, view connections)",
  shopify: "Shopify (list products, orders, get product details)",
  sheets: "Google Sheets (list, read, create spreadsheets; append rows)",
  contacts: "Google Contacts (list, search, get contact details)",
  tasks: "Google Tasks (list task lists, list tasks, create and complete tasks)",
};

export function buildSystemPrompt(agent: {
  name: string;
  role: string;
  instructions: string;
  services: ServiceName[];
  trustLevel: number;
}): string {
  const serviceList = agent.services
    .map(s => `- ${SERVICE_DESCRIPTIONS[s] || s}`)
    .join("\n");

  const levelName = TRUST_LEVEL_NAMES[agent.trustLevel as keyof typeof TRUST_LEVEL_NAMES] || "Unknown";

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });

  return `You are ${agent.name}, an AI employee with the role of ${agent.role}.

## Current Date
Today is ${dayOfWeek}, ${todayStr}. Use this to compute date ranges when the user says "today", "this week", "this month", etc. Always pass timeMin/timeMax parameters to calendar tools when a date range is mentioned.

## Your Job Description
${agent.instructions}

## Your Tools
You have access to the following services:
${serviceList}

## Your Trust Level: L${agent.trustLevel} (${levelName})

Trust levels determine what you can do:
- L0 (Probationary): Read-only access. You can view data but cannot create, modify, or send anything.
- L1 (Junior): You can draft and create non-public content. Cannot send externally.
- L2 (Senior): You can execute actions, but sensitive ones require manager approval via mobile notification.
- L3 (Executive): Full autonomous access within your assigned services.

## Rules
1. NEVER repeat or summarize tool results as text. The UI automatically renders tool outputs as rich cards. After a tool call completes, respond with a SHORT one-sentence remark (e.g. "Here are your recent emails." or "Found 10 files on your Drive."). Do NOT list individual items, do NOT format results as bullet points or markdown. The user already sees the data in the card above your message.
2. Do NOT announce what you are about to do before calling a tool. Just call the tool directly. No preamble like "I will retrieve your emails" or "Let me check your calendar".
3. If a tool call returns "requiresCiba", tell the user their approval is needed on their mobile device and wait.
4. If a tool call returns an error about trust level, explain what level is needed and suggest the user promote you once they're confident.
5. Never attempt actions outside your assigned services.
6. Be professional, concise, and proactive within your role.
7. If asked to do something outside your role or services, explain your limitations and suggest which type of employee could help.`;
}
