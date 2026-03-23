// src/lib/agents/tool-registry.ts
import { tool } from "ai";
import { z } from "zod";
import { getTrustScore, canPerformAction } from "@/lib/trust/engine";
import { logAction } from "@/lib/audit/logger";

// Service imports
import * as gmail from "@/lib/services/gmail";
import * as calendar from "@/lib/services/calendar";
import * as drive from "@/lib/services/drive";
import * as slack from "@/lib/services/slack";
import * as stripe from "@/lib/services/stripe";
import * as github from "@/lib/services/github";
import * as discord from "@/lib/services/discord";

export type ServiceName = "gmail" | "calendar" | "drive" | "slack" | "stripe" | "github" | "discord";

function withTrustCheck(
  userId: string,
  agentSlug: string,
  serviceName: string,
  actionType: "read" | "draft" | "execute",
  actionName: string,
  executeFn: (params: any) => Promise<any>
) {
  return async (params: any) => {
    const trust = await getTrustScore(userId, agentSlug);
    const permission = canPerformAction(trust.level, actionType, actionName);

    if (!permission.allowed) {
      return { error: `Trust level too low. Current: L${trust.level}. ${permission.reason}` };
    }

    if (permission.requiresCiba) {
      return {
        requiresCiba: true,
        agentSlug,
        action: actionName,
        service: serviceName,
        message: `This action requires manager approval. ${permission.reason}`,
      };
    }

    const start = Date.now();
    try {
      const result = await executeFn(params);
      await logAction({
        userId, agentName: agentSlug, action: actionName,
        actionType, service: serviceName, trustLevel: trust.level,
        success: true, durationMs: Date.now() - start,
      });
      return result;
    } catch (error: any) {
      await logAction({
        userId, agentName: agentSlug, action: actionName,
        actionType, service: serviceName, trustLevel: trust.level,
        success: false, durationMs: Date.now() - start,
      });
      return { error: `Failed: ${error.message}` };
    }
  };
}

function gmailTools(userId: string, agentSlug: string) {
  return {
    gmail_list_emails: tool({
      description: "List recent emails from the connected Gmail inbox",
      parameters: z.object({ maxResults: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "gmail", "read", "gmail_list_emails",
        async (params) => gmail.listEmails(userId, params.maxResults)),
    }),
    gmail_read_email: tool({
      description: "Read the full content of a specific email",
      parameters: z.object({ messageId: z.string().describe("The email message ID") }),
      execute: withTrustCheck(userId, agentSlug, "gmail", "read", "gmail_read_email",
        async (params) => gmail.readEmail(userId, params.messageId)),
    }),
    gmail_draft_email: tool({
      description: "Create an email draft (does not send)",
      parameters: z.object({ to: z.string(), subject: z.string(), body: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "gmail", "draft", "gmail_draft_email",
        async (params) => gmail.draftEmail(userId, params.to, params.subject, params.body)),
    }),
    gmail_send_email: tool({
      description: "Send an email (requires manager approval at Senior level, autonomous at Executive)",
      parameters: z.object({ to: z.string(), subject: z.string(), body: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "gmail", "execute", "send_email_external",
        async (params) => gmail.sendEmail(userId, params.to, params.subject, params.body)),
    }),
  };
}

function calendarTools(userId: string, agentSlug: string) {
  return {
    calendar_list_events: tool({
      description: "List upcoming calendar events",
      parameters: z.object({ maxResults: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "calendar", "read", "calendar_list_events",
        async (params) => calendar.listEvents(userId, params.maxResults)),
    }),
    calendar_check_availability: tool({
      description: "Check availability for a specific date",
      parameters: z.object({ date: z.string().describe("Date in YYYY-MM-DD format") }),
      execute: withTrustCheck(userId, agentSlug, "calendar", "read", "calendar_check_availability",
        async (params) => calendar.checkAvailability(userId, params.date)),
    }),
    calendar_create_event: tool({
      description: "Schedule a new calendar event",
      parameters: z.object({
        summary: z.string(), start: z.string(), end: z.string(),
        attendees: z.array(z.string()).optional(), description: z.string().optional(),
      }),
      execute: withTrustCheck(userId, agentSlug, "calendar", "execute", "schedule_external_meeting",
        async (params) => calendar.createEvent(userId, params.summary, params.start, params.end, params.attendees, params.description)),
    }),
  };
}

function driveTools(userId: string, agentSlug: string) {
  return {
    drive_list_files: tool({
      description: "Search and list files in Google Drive",
      parameters: z.object({ query: z.string().optional(), maxResults: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "drive", "read", "drive_list_files",
        async (params) => drive.listFiles(userId, params.maxResults, params.query)),
    }),
    drive_read_document: tool({
      description: "Read the content of a Google Drive document",
      parameters: z.object({ fileId: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "drive", "read", "drive_read_document",
        async (params) => drive.readDocument(userId, params.fileId)),
    }),
    drive_create_document: tool({
      description: "Create a new Google Doc",
      parameters: z.object({ title: z.string(), content: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "drive", "draft", "drive_create_document",
        async (params) => drive.createDocument(userId, params.title, params.content)),
    }),
    drive_share_document: tool({
      description: "Share a document with someone (always requires manager approval)",
      parameters: z.object({ fileId: z.string(), email: z.string(), role: z.string().optional().default("reader") }),
      execute: withTrustCheck(userId, agentSlug, "drive", "execute", "share_document_external",
        async (params) => drive.shareDocument(userId, params.fileId, params.email, params.role as "reader" | "writer")),
    }),
  };
}

function slackTools(userId: string, agentSlug: string) {
  return {
    slack_list_channels: tool({
      description: "List available Slack channels",
      parameters: z.object({}),
      execute: withTrustCheck(userId, agentSlug, "slack", "read", "slack_list_channels",
        async () => slack.listChannels()),
    }),
    slack_read_messages: tool({
      description: "Read recent messages from a Slack channel",
      parameters: z.object({ channelId: z.string(), limit: z.number().optional().default(20) }),
      execute: withTrustCheck(userId, agentSlug, "slack", "read", "slack_read_messages",
        async (params) => slack.readMessages(params.channelId, params.limit)),
    }),
    slack_send_message: tool({
      description: "Send a message to a Slack channel",
      parameters: z.object({ channelId: z.string(), text: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "slack", "execute", "slack_send_message",
        async (params) => slack.sendMessage(params.channelId, params.text)),
    }),
  };
}

function stripeTools(userId: string, agentSlug: string) {
  return {
    stripe_get_balance: tool({
      description: "Check the current Stripe balance",
      parameters: z.object({}),
      execute: withTrustCheck(userId, agentSlug, "stripe", "read", "stripe_get_balance",
        async () => stripe.getBalance()),
    }),
    stripe_list_payments: tool({
      description: "List recent Stripe payments",
      parameters: z.object({ limit: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "stripe", "read", "stripe_list_payments",
        async (params) => stripe.listRecentPayments(params.limit)),
    }),
    stripe_list_customers: tool({
      description: "List Stripe customers",
      parameters: z.object({ limit: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "stripe", "read", "stripe_list_customers",
        async (params) => stripe.listCustomers(params.limit)),
    }),
    stripe_list_invoices: tool({
      description: "List Stripe invoices",
      parameters: z.object({ limit: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "stripe", "read", "stripe_list_invoices",
        async (params) => stripe.listInvoices(params.limit)),
    }),
    stripe_create_invoice: tool({
      description: "Create a new invoice (always requires manager approval)",
      parameters: z.object({ customerEmail: z.string(), items: z.array(z.object({ description: z.string(), amount: z.number() })) }),
      execute: withTrustCheck(userId, agentSlug, "stripe", "execute", "create_invoice",
        async (params) => stripe.createInvoice(params.customerEmail, params.items)),
    }),
    stripe_send_invoice: tool({
      description: "Send a draft invoice (always requires manager approval)",
      parameters: z.object({ invoiceId: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "stripe", "execute", "send_invoice",
        async (params) => stripe.sendInvoice(params.invoiceId)),
    }),
  };
}

function githubTools(userId: string, agentSlug: string) {
  return {
    github_list_repos: tool({
      description: "List GitHub repositories",
      parameters: z.object({ limit: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "github", "read", "github_list_repos",
        async (params) => github.listRepos(userId, params.limit)),
    }),
    github_list_issues: tool({
      description: "List open issues in a GitHub repository",
      parameters: z.object({ repo: z.string().describe("Full repo name like owner/repo"), limit: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "github", "read", "github_list_issues",
        async (params) => github.listIssues(userId, params.repo, params.limit)),
    }),
    github_read_issue: tool({
      description: "Read details of a specific GitHub issue",
      parameters: z.object({ repo: z.string(), issueNumber: z.number() }),
      execute: withTrustCheck(userId, agentSlug, "github", "read", "github_read_issue",
        async (params) => github.readIssue(userId, params.repo, params.issueNumber)),
    }),
    github_create_issue: tool({
      description: "Create a new GitHub issue",
      parameters: z.object({ repo: z.string(), title: z.string(), body: z.string(), labels: z.array(z.string()).optional() }),
      execute: withTrustCheck(userId, agentSlug, "github", "execute", "github_create_issue",
        async (params) => github.createIssue(userId, params.repo, params.title, params.body, params.labels)),
    }),
    github_create_comment: tool({
      description: "Comment on a GitHub issue or PR",
      parameters: z.object({ repo: z.string(), issueNumber: z.number(), body: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "github", "execute", "github_create_comment",
        async (params) => github.createComment(userId, params.repo, params.issueNumber, params.body)),
    }),
    github_list_prs: tool({
      description: "List open pull requests in a GitHub repository",
      parameters: z.object({ repo: z.string(), limit: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "github", "read", "github_list_prs",
        async (params) => github.listPRs(userId, params.repo, params.limit)),
    }),
  };
}

function discordTools(userId: string, agentSlug: string) {
  return {
    discord_list_servers: tool({
      description: "List Discord servers the user is in",
      parameters: z.object({}),
      execute: withTrustCheck(userId, agentSlug, "discord", "read", "discord_list_servers",
        async () => discord.listServers(userId)),
    }),
    discord_list_channels: tool({
      description: "List text channels in a Discord server",
      parameters: z.object({ serverId: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "discord", "read", "discord_list_channels",
        async (params) => discord.listChannels(userId, params.serverId)),
    }),
    discord_read_messages: tool({
      description: "Read recent messages from a Discord channel",
      parameters: z.object({ channelId: z.string(), limit: z.number().optional().default(20) }),
      execute: withTrustCheck(userId, agentSlug, "discord", "read", "discord_read_messages",
        async (params) => discord.readMessages(userId, params.channelId, params.limit)),
    }),
    discord_send_message: tool({
      description: "Send a message to a Discord channel",
      parameters: z.object({ channelId: z.string(), content: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "discord", "execute", "discord_send_message",
        async (params) => discord.sendMessage(userId, params.channelId, params.content)),
    }),
  };
}

const SERVICE_TOOL_FACTORIES: Record<ServiceName, (userId: string, agentSlug: string) => Record<string, any>> = {
  gmail: gmailTools,
  calendar: calendarTools,
  drive: driveTools,
  slack: slackTools,
  stripe: stripeTools,
  github: githubTools,
  discord: discordTools,
};

export function buildAgentTools(userId: string, agentSlug: string, services: ServiceName[]): Record<string, any> {
  const tools: Record<string, any> = {};
  for (const service of services) {
    const factory = SERVICE_TOOL_FACTORIES[service];
    if (factory) {
      Object.assign(tools, factory(userId, agentSlug));
    }
  }
  return tools;
}

export function getToolDisplayMap(services: ServiceName[]): Record<string, { service: string; label: string }> {
  const map: Record<string, { service: string; label: string }> = {};
  const toolMeta: Record<string, { service: string; label: string }> = {
    gmail_list_emails: { service: "gmail", label: "Listing emails" },
    gmail_read_email: { service: "gmail", label: "Reading email" },
    gmail_draft_email: { service: "gmail", label: "Drafting email" },
    gmail_send_email: { service: "gmail", label: "Sending email" },
    calendar_list_events: { service: "calendar", label: "Listing events" },
    calendar_check_availability: { service: "calendar", label: "Checking availability" },
    calendar_create_event: { service: "calendar", label: "Scheduling event" },
    drive_list_files: { service: "drive", label: "Listing files" },
    drive_read_document: { service: "drive", label: "Reading document" },
    drive_create_document: { service: "drive", label: "Creating document" },
    drive_share_document: { service: "drive", label: "Sharing document" },
    slack_list_channels: { service: "slack", label: "Listing channels" },
    slack_read_messages: { service: "slack", label: "Reading messages" },
    slack_send_message: { service: "slack", label: "Sending message" },
    stripe_get_balance: { service: "stripe", label: "Checking balance" },
    stripe_list_payments: { service: "stripe", label: "Listing payments" },
    stripe_list_customers: { service: "stripe", label: "Listing customers" },
    stripe_list_invoices: { service: "stripe", label: "Listing invoices" },
    stripe_create_invoice: { service: "stripe", label: "Creating invoice" },
    stripe_send_invoice: { service: "stripe", label: "Sending invoice" },
    github_list_repos: { service: "github", label: "Listing repos" },
    github_list_issues: { service: "github", label: "Listing issues" },
    github_read_issue: { service: "github", label: "Reading issue" },
    github_create_issue: { service: "github", label: "Creating issue" },
    github_create_comment: { service: "github", label: "Commenting" },
    github_list_prs: { service: "github", label: "Listing PRs" },
    discord_list_servers: { service: "discord", label: "Listing servers" },
    discord_list_channels: { service: "discord", label: "Listing channels" },
    discord_read_messages: { service: "discord", label: "Reading messages" },
    discord_send_message: { service: "discord", label: "Sending message" },
  };
  for (const [name, meta] of Object.entries(toolMeta)) {
    if (services.includes(meta.service as ServiceName)) {
      map[name] = meta;
    }
  }
  return map;
}
