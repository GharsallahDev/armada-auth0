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
import * as linkedin from "@/lib/services/linkedin";
import * as shopify from "@/lib/services/shopify";
import * as sheets from "@/lib/services/sheets";
import * as contacts from "@/lib/services/contacts";
import * as tasks from "@/lib/services/tasks";

export type ServiceName = "gmail" | "calendar" | "drive" | "slack" | "stripe" | "github" | "discord" | "linkedin" | "shopify" | "sheets" | "contacts" | "tasks";

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
      inputSchema: z.object({ maxResults: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "gmail", "read", "gmail_list_emails",
        async (params) => gmail.listEmails(userId, params.maxResults)),
    }),
    gmail_read_email: tool({
      description: "Read the full content of a specific email",
      inputSchema: z.object({ messageId: z.string().describe("The email message ID") }),
      execute: withTrustCheck(userId, agentSlug, "gmail", "read", "gmail_read_email",
        async (params) => gmail.readEmail(userId, params.messageId)),
    }),
    gmail_draft_email: tool({
      description: "Create an email draft (does not send)",
      inputSchema: z.object({ to: z.string(), subject: z.string(), body: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "gmail", "draft", "gmail_draft_email",
        async (params) => gmail.draftEmail(userId, params.to, params.subject, params.body)),
    }),
    gmail_send_email: tool({
      description: "Send an email (requires manager approval at Senior level, autonomous at Executive)",
      inputSchema: z.object({ to: z.string(), subject: z.string(), body: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "gmail", "execute", "send_email_external",
        async (params) => gmail.sendEmail(userId, params.to, params.subject, params.body)),
    }),
  };
}

function calendarTools(userId: string, agentSlug: string) {
  return {
    calendar_list_events: tool({
      description: "List upcoming calendar events. Use timeMin/timeMax to filter by date range (ISO 8601). For 'this week', set timeMax to end of the week.",
      inputSchema: z.object({
        maxResults: z.number().optional().default(10),
        timeMin: z.string().optional().describe("Start of range in ISO 8601 (e.g. 2026-03-28T00:00:00Z). Defaults to now."),
        timeMax: z.string().optional().describe("End of range in ISO 8601 (e.g. 2026-04-04T23:59:59Z). Omit to return all future events."),
      }),
      execute: withTrustCheck(userId, agentSlug, "calendar", "read", "calendar_list_events",
        async (params) => calendar.listEvents(userId, params.maxResults, params.timeMin, params.timeMax)),
    }),
    calendar_check_availability: tool({
      description: "Check availability for a specific date",
      inputSchema: z.object({ date: z.string().describe("Date in YYYY-MM-DD format") }),
      execute: withTrustCheck(userId, agentSlug, "calendar", "read", "calendar_check_availability",
        async (params) => calendar.checkAvailability(userId, params.date)),
    }),
    calendar_create_event: tool({
      description: "Schedule a new calendar event",
      inputSchema: z.object({
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
      inputSchema: z.object({ query: z.string().optional(), maxResults: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "drive", "read", "drive_list_files",
        async (params) => drive.listFiles(userId, params.maxResults, params.query)),
    }),
    drive_read_document: tool({
      description: "Read the content of a Google Drive document",
      inputSchema: z.object({ fileId: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "drive", "read", "drive_read_document",
        async (params) => drive.readDocument(userId, params.fileId)),
    }),
    drive_create_document: tool({
      description: "Create a new Google Doc",
      inputSchema: z.object({ title: z.string(), content: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "drive", "draft", "drive_create_document",
        async (params) => drive.createDocument(userId, params.title, params.content)),
    }),
    drive_share_document: tool({
      description: "Share a document with someone (always requires manager approval)",
      inputSchema: z.object({ fileId: z.string(), email: z.string(), role: z.string().optional().default("reader") }),
      execute: withTrustCheck(userId, agentSlug, "drive", "execute", "share_document_external",
        async (params) => drive.shareDocument(userId, params.fileId, params.email, params.role as "reader" | "writer")),
    }),
  };
}

function slackTools(userId: string, agentSlug: string) {
  return {
    slack_list_channels: tool({
      description: "List available Slack channels",
      inputSchema: z.object({}),
      execute: withTrustCheck(userId, agentSlug, "slack", "read", "slack_list_channels",
        async () => slack.listChannels()),
    }),
    slack_read_messages: tool({
      description: "Read recent messages from a Slack channel. Pass the channel ID (from slack_list_channels) or channel name.",
      inputSchema: z.object({ channel: z.string().describe("Channel ID (e.g. C0AMV9X2C59) or channel name (e.g. general)"), limit: z.number().optional().default(20) }),
      execute: withTrustCheck(userId, agentSlug, "slack", "read", "slack_read_messages",
        async (params) => {
          const id = params.channel.startsWith("C") && !params.channel.includes(" ") && params.channel.length > 5
            ? params.channel
            : (await slack.searchChannelByName(params.channel))?.id;
          if (!id) return { error: `Channel "${params.channel}" not found. Use slack_list_channels to see available channels.` };
          return slack.readMessages(id, params.limit);
        }),
    }),
    slack_send_message: tool({
      description: "Send a message to a Slack channel. Pass the channel ID (from slack_list_channels) or channel name.",
      inputSchema: z.object({ channel: z.string().describe("Channel ID or channel name"), text: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "slack", "execute", "slack_send_message",
        async (params) => {
          const id = params.channel.startsWith("C") && !params.channel.includes(" ") && params.channel.length > 5
            ? params.channel
            : (await slack.searchChannelByName(params.channel))?.id;
          if (!id) return { error: `Channel "${params.channel}" not found. Use slack_list_channels to see available channels.` };
          return slack.sendMessage(id, params.text);
        }),
    }),
  };
}

function stripeTools(userId: string, agentSlug: string) {
  return {
    stripe_get_balance: tool({
      description: "Check the current Stripe balance",
      inputSchema: z.object({}),
      execute: withTrustCheck(userId, agentSlug, "stripe", "read", "stripe_get_balance",
        async () => stripe.getBalance()),
    }),
    stripe_list_payments: tool({
      description: "List recent Stripe payments",
      inputSchema: z.object({ limit: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "stripe", "read", "stripe_list_payments",
        async (params) => stripe.listRecentPayments(params.limit)),
    }),
    stripe_list_customers: tool({
      description: "List Stripe customers",
      inputSchema: z.object({ limit: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "stripe", "read", "stripe_list_customers",
        async (params) => stripe.listCustomers(params.limit)),
    }),
    stripe_list_invoices: tool({
      description: "List Stripe invoices",
      inputSchema: z.object({ limit: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "stripe", "read", "stripe_list_invoices",
        async (params) => stripe.listInvoices(params.limit)),
    }),
    stripe_create_invoice: tool({
      description: "Create a new invoice (always requires manager approval)",
      inputSchema: z.object({ customerEmail: z.string(), items: z.array(z.object({ description: z.string(), amount: z.number() })) }),
      execute: withTrustCheck(userId, agentSlug, "stripe", "execute", "create_invoice",
        async (params) => stripe.createInvoice(params.customerEmail, params.items)),
    }),
    stripe_send_invoice: tool({
      description: "Send a draft invoice (always requires manager approval)",
      inputSchema: z.object({ invoiceId: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "stripe", "execute", "send_invoice",
        async (params) => stripe.sendInvoice(params.invoiceId)),
    }),
  };
}

function githubTools(userId: string, agentSlug: string) {
  return {
    github_list_repos: tool({
      description: "List GitHub repositories",
      inputSchema: z.object({ limit: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "github", "read", "github_list_repos",
        async (params) => github.listRepos(userId, params.limit)),
    }),
    github_list_issues: tool({
      description: "List open issues in a GitHub repository",
      inputSchema: z.object({ repo: z.string().describe("Full repo name like owner/repo"), limit: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "github", "read", "github_list_issues",
        async (params) => github.listIssues(userId, params.repo, params.limit)),
    }),
    github_read_issue: tool({
      description: "Read details of a specific GitHub issue",
      inputSchema: z.object({ repo: z.string(), issueNumber: z.number() }),
      execute: withTrustCheck(userId, agentSlug, "github", "read", "github_read_issue",
        async (params) => github.readIssue(userId, params.repo, params.issueNumber)),
    }),
    github_create_issue: tool({
      description: "Create a new GitHub issue",
      inputSchema: z.object({ repo: z.string(), title: z.string(), body: z.string(), labels: z.array(z.string()).optional() }),
      execute: withTrustCheck(userId, agentSlug, "github", "execute", "github_create_issue",
        async (params) => github.createIssue(userId, params.repo, params.title, params.body, params.labels)),
    }),
    github_create_comment: tool({
      description: "Comment on a GitHub issue or PR",
      inputSchema: z.object({ repo: z.string(), issueNumber: z.number(), body: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "github", "execute", "github_create_comment",
        async (params) => github.createComment(userId, params.repo, params.issueNumber, params.body)),
    }),
    github_list_prs: tool({
      description: "List open pull requests in a GitHub repository",
      inputSchema: z.object({ repo: z.string(), limit: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "github", "read", "github_list_prs",
        async (params) => github.listPRs(userId, params.repo, params.limit)),
    }),
  };
}

function discordTools(userId: string, agentSlug: string) {
  return {
    discord_list_servers: tool({
      description: "List Discord servers the user is in",
      inputSchema: z.object({}),
      execute: withTrustCheck(userId, agentSlug, "discord", "read", "discord_list_servers",
        async () => discord.listServers(userId)),
    }),
    discord_list_channels: tool({
      description: "List text channels in a Discord server",
      inputSchema: z.object({ serverId: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "discord", "read", "discord_list_channels",
        async (params) => discord.listChannels(userId, params.serverId)),
    }),
    discord_read_messages: tool({
      description: "Read recent messages from a Discord channel",
      inputSchema: z.object({ channelId: z.string(), limit: z.number().optional().default(20) }),
      execute: withTrustCheck(userId, agentSlug, "discord", "read", "discord_read_messages",
        async (params) => discord.readMessages(userId, params.channelId, params.limit)),
    }),
    discord_send_message: tool({
      description: "Send a message to a Discord channel",
      inputSchema: z.object({ channelId: z.string(), content: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "discord", "execute", "discord_send_message",
        async (params) => discord.sendMessage(userId, params.channelId, params.content)),
    }),
  };
}

function linkedinTools(userId: string, agentSlug: string) {
  return {
    linkedin_get_profile: tool({
      description: "Get LinkedIn profile",
      inputSchema: z.object({}),
      execute: withTrustCheck(userId, agentSlug, "linkedin", "read", "linkedin_get_profile",
        async () => linkedin.getProfile(userId)),
    }),
    linkedin_create_post: tool({
      description: "Create a LinkedIn post",
      inputSchema: z.object({ text: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "linkedin", "execute", "linkedin_create_post",
        async (params) => linkedin.createPost(userId, params.text)),
    }),
    linkedin_get_connections: tool({
      description: "List connections",
      inputSchema: z.object({}),
      execute: withTrustCheck(userId, agentSlug, "linkedin", "read", "linkedin_get_connections",
        async () => linkedin.getConnections(userId)),
    }),
  };
}

function shopifyTools(userId: string, agentSlug: string) {
  return {
    shopify_list_products: tool({
      description: "List Shopify products",
      inputSchema: z.object({ limit: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "shopify", "read", "shopify_list_products",
        async (params) => shopify.listProducts(userId, params.limit)),
    }),
    shopify_list_orders: tool({
      description: "List orders",
      inputSchema: z.object({ limit: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "shopify", "read", "shopify_list_orders",
        async (params) => shopify.listOrders(userId, params.limit)),
    }),
    shopify_get_product: tool({
      description: "Get product details",
      inputSchema: z.object({ productId: z.string() }),
      execute: withTrustCheck(userId, agentSlug, "shopify", "read", "shopify_get_product",
        async (params) => shopify.getProduct(userId, params.productId)),
    }),
  };
}

function sheetsTools(userId: string, agentSlug: string) {
  return {
    sheets_list_spreadsheets: tool({
      description: "List recent Google Sheets spreadsheets",
      inputSchema: z.object({ maxResults: z.number().optional().default(10) }),
      execute: withTrustCheck(userId, agentSlug, "sheets", "read", "sheets_list_spreadsheets",
        async (params) => sheets.listSpreadsheets(userId, params.maxResults)),
    }),
    sheets_read_spreadsheet: tool({
      description: "Read data from a Google Sheets spreadsheet",
      inputSchema: z.object({
        spreadsheetId: z.string().describe("The spreadsheet ID"),
        range: z.string().optional().describe("Cell range like Sheet1!A1:D10"),
      }),
      execute: withTrustCheck(userId, agentSlug, "sheets", "read", "sheets_read_spreadsheet",
        async (params) => sheets.readSpreadsheet(userId, params.spreadsheetId, params.range)),
    }),
    sheets_create_spreadsheet: tool({
      description: "Create a new Google Sheets spreadsheet",
      inputSchema: z.object({
        title: z.string(),
        headers: z.array(z.string()).optional().describe("Column headers"),
        rows: z.array(z.array(z.string())).optional().describe("Initial data rows"),
      }),
      execute: withTrustCheck(userId, agentSlug, "sheets", "draft", "sheets_create_spreadsheet",
        async (params) => sheets.createSpreadsheet(userId, params.title, params.headers, params.rows)),
    }),
    sheets_append_rows: tool({
      description: "Append rows to an existing Google Sheets spreadsheet",
      inputSchema: z.object({
        spreadsheetId: z.string(),
        range: z.string().default("Sheet1"),
        rows: z.array(z.array(z.string())).describe("Rows of data to append"),
      }),
      execute: withTrustCheck(userId, agentSlug, "sheets", "draft", "sheets_append_rows",
        async (params) => sheets.appendRows(userId, params.spreadsheetId, params.range, params.rows)),
    }),
  };
}

function contactsTools(userId: string, agentSlug: string) {
  return {
    contacts_list: tool({
      description: "List Google contacts",
      inputSchema: z.object({ maxResults: z.number().optional().default(20) }),
      execute: withTrustCheck(userId, agentSlug, "contacts", "read", "contacts_list",
        async (params) => contacts.listContacts(userId, params.maxResults)),
    }),
    contacts_search: tool({
      description: "Search Google contacts by name, email, or company",
      inputSchema: z.object({ query: z.string().describe("Search query") }),
      execute: withTrustCheck(userId, agentSlug, "contacts", "read", "contacts_search",
        async (params) => contacts.searchContacts(userId, params.query)),
    }),
    contacts_get: tool({
      description: "Get detailed info about a specific contact",
      inputSchema: z.object({ contactId: z.string().describe("The contact ID") }),
      execute: withTrustCheck(userId, agentSlug, "contacts", "read", "contacts_get",
        async (params) => contacts.getContact(userId, params.contactId)),
    }),
  };
}

function tasksTools(userId: string, agentSlug: string) {
  return {
    tasks_list_task_lists: tool({
      description: "List all Google Tasks task lists",
      inputSchema: z.object({}),
      execute: withTrustCheck(userId, agentSlug, "tasks", "read", "tasks_list_task_lists",
        async () => tasks.listTaskLists(userId)),
    }),
    tasks_list: tool({
      description: "List tasks from a Google Tasks list",
      inputSchema: z.object({
        taskListId: z.string().optional().describe("Task list ID (defaults to primary)"),
        maxResults: z.number().optional().default(20),
      }),
      execute: withTrustCheck(userId, agentSlug, "tasks", "read", "tasks_list",
        async (params) => tasks.listTasks(userId, params.taskListId, params.maxResults)),
    }),
    tasks_create: tool({
      description: "Create a new task in Google Tasks",
      inputSchema: z.object({
        title: z.string(),
        notes: z.string().optional(),
        due: z.string().optional().describe("Due date in YYYY-MM-DD format"),
        taskListId: z.string().optional(),
      }),
      execute: withTrustCheck(userId, agentSlug, "tasks", "draft", "tasks_create",
        async (params) => tasks.createTask(userId, params.title, params.notes, params.due, params.taskListId)),
    }),
    tasks_complete: tool({
      description: "Mark a task as completed",
      inputSchema: z.object({
        taskId: z.string(),
        taskListId: z.string().optional(),
      }),
      execute: withTrustCheck(userId, agentSlug, "tasks", "execute", "tasks_complete",
        async (params) => tasks.completeTask(userId, params.taskId, params.taskListId)),
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
  linkedin: linkedinTools,
  shopify: shopifyTools,
  sheets: sheetsTools,
  contacts: contactsTools,
  tasks: tasksTools,
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
    linkedin_get_profile: { service: "linkedin", label: "Getting profile" },
    linkedin_create_post: { service: "linkedin", label: "Creating post" },
    linkedin_get_connections: { service: "linkedin", label: "Listing connections" },
    shopify_list_products: { service: "shopify", label: "Listing products" },
    shopify_list_orders: { service: "shopify", label: "Listing orders" },
    shopify_get_product: { service: "shopify", label: "Getting product" },
    sheets_list_spreadsheets: { service: "sheets", label: "Listing spreadsheets" },
    sheets_read_spreadsheet: { service: "sheets", label: "Reading spreadsheet" },
    sheets_create_spreadsheet: { service: "sheets", label: "Creating spreadsheet" },
    sheets_append_rows: { service: "sheets", label: "Appending rows" },
    contacts_list: { service: "contacts", label: "Listing contacts" },
    contacts_search: { service: "contacts", label: "Searching contacts" },
    contacts_get: { service: "contacts", label: "Getting contact" },
    tasks_list_task_lists: { service: "tasks", label: "Listing task lists" },
    tasks_list: { service: "tasks", label: "Listing tasks" },
    tasks_create: { service: "tasks", label: "Creating task" },
    tasks_complete: { service: "tasks", label: "Completing task" },
  };
  for (const [name, meta] of Object.entries(toolMeta)) {
    if (services.includes(meta.service as ServiceName)) {
      map[name] = meta;
    }
  }
  return map;
}
