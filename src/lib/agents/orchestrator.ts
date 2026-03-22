import { google } from "@ai-sdk/google";
import { streamText, tool, stepCountIs, type ModelMessage } from "ai";
import { z } from "zod";
import { getTrustScore, getAllTrustScores, canPerformAction } from "@/lib/trust/engine";
import { logAction } from "@/lib/audit/logger";
import { AGENT_SYSTEM_PROMPTS } from "./types";
import { TRUST_LEVEL_NAMES, AGENT_DISPLAY, type AgentName } from "@/lib/trust/levels";

// Service imports
import * as gmail from "@/lib/services/gmail";
import * as calendar from "@/lib/services/calendar";
import * as drive from "@/lib/services/drive";
import * as slack from "@/lib/services/slack";
import * as stripe from "@/lib/services/stripe";

export function createOrchestratorStream(userId: string, messages: ModelMessage[]) {
  return streamText({
    model: google("gemini-2.5-flash-preview-05-20"),
    system: AGENT_SYSTEM_PROMPTS.orchestrator,
    messages,
    tools: {
      // ─── Trust inspection tools ───
      check_all_trust_levels: tool({
        description: "Check trust levels for all agents. Call this at the start to understand capabilities.",
        inputSchema: z.object({}),
        execute: async () => {
          const scores = await getAllTrustScores(userId);
          const result: Record<string, string> = {};
          for (const [agent, data] of Object.entries(scores)) {
            const display = AGENT_DISPLAY[agent as AgentName];
            result[agent] = `${display.label}: Level ${data.level} (${TRUST_LEVEL_NAMES[data.level]}) — Score: ${data.decayedScore}`;
          }
          return result;
        },
      }),

      check_action_permission: tool({
        description: "Check if a specific action can be performed at the agent's current trust level. Always call this BEFORE executing actions.",
        inputSchema: z.object({
          agentName: z.enum(["comms", "scheduler", "finance", "docs"]),
          actionType: z.enum(["read", "draft", "execute"]),
          actionName: z.string().optional().describe("Specific action name like send_email_external, create_invoice"),
        }),
        execute: async ({ agentName, actionType, actionName }) => {
          const trust = await getTrustScore(userId, agentName);
          const permission = canPerformAction(trust.level, actionType, actionName);
          return { ...permission, agentTrustLevel: trust.level, agentTrustScore: trust.decayedScore };
        },
      }),

      // ─── Gmail tools (Comms Agent) ───
      gmail_list_emails: tool({
        description: "Read the user's recent inbox emails. Comms Agent — Level 0+ required.",
        inputSchema: z.object({
          maxResults: z.number().optional().default(5).describe("Number of emails to fetch"),
        }),
        execute: async ({ maxResults }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "comms");
          try {
            const emails = await gmail.listEmails(userId, maxResults);
            await logAction({ userId, agentName: "comms", action: "list_inbox_emails", actionType: "read", service: "gmail", trustLevel: trust.level, details: { count: emails.length }, inputSummary: `List ${maxResults} emails`, outputSummary: `Found ${emails.length} emails`, durationMs: Date.now() - start, tokenUsed: true });
            return { success: true, emails };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            await logAction({ userId, agentName: "comms", action: "list_inbox_emails", actionType: "read", service: "gmail", trustLevel: trust.level, success: false, durationMs: Date.now() - start, outputSummary: msg });
            return { success: false, error: msg };
          }
        },
      }),

      gmail_read_email: tool({
        description: "Read a specific email by ID. Comms Agent — Level 0+.",
        inputSchema: z.object({ messageId: z.string().describe("The email message ID") }),
        execute: async ({ messageId }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "comms");
          try {
            const email = await gmail.readEmail(userId, messageId);
            await logAction({ userId, agentName: "comms", action: "read_email", actionType: "read", service: "gmail", trustLevel: trust.level, details: { messageId }, inputSummary: `Read email ${messageId}`, outputSummary: `Subject: ${email.subject}`, durationMs: Date.now() - start, tokenUsed: true });
            return { success: true, email };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      gmail_draft_email: tool({
        description: "Draft an email (saves as draft, does not send). Comms Agent — Level 1+ required.",
        inputSchema: z.object({
          to: z.string().describe("Recipient email address"),
          subject: z.string().describe("Email subject"),
          body: z.string().describe("Email body text"),
        }),
        execute: async ({ to, subject, body }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "comms");
          const perm = canPerformAction(trust.level, "draft");
          if (!perm.allowed) return { success: false, error: `Trust level too low. Current: Level ${trust.level} (${TRUST_LEVEL_NAMES[trust.level]}). Need Level 1+ to draft.` };
          try {
            const result = await gmail.draftEmail(userId, to, subject, body);
            await logAction({ userId, agentName: "comms", action: "draft_email", actionType: "draft", service: "gmail", trustLevel: trust.level, details: { to, subject }, inputSummary: `Draft to ${to}: ${subject}`, outputSummary: result.message, durationMs: Date.now() - start, tokenUsed: true });
            return { success: true, ...result };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      gmail_send_email: tool({
        description: "Send an email directly. Comms Agent — Level 2+ required. ALWAYS requires CIBA approval for external recipients.",
        inputSchema: z.object({
          to: z.string().describe("Recipient email"),
          subject: z.string().describe("Subject"),
          body: z.string().describe("Body text"),
        }),
        execute: async ({ to, subject, body }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "comms");
          const perm = canPerformAction(trust.level, "execute", "send_email_external");
          if (!perm.allowed) return { success: false, error: `Trust level too low. Current: Level ${trust.level}. Need Level 2+ to send emails.` };
          if (perm.requiresCiba) return { success: false, requiresCiba: true, message: `Sending email to ${to} requires human approval (CIBA). Please create a CIBA request first.`, to, subject };
          try {
            const result = await gmail.sendEmail(userId, to, subject, body);
            await logAction({ userId, agentName: "comms", action: "send_email", actionType: "execute", service: "gmail", trustLevel: trust.level, details: { to, subject }, inputSummary: `Send to ${to}: ${subject}`, outputSummary: result.message, durationMs: Date.now() - start, tokenUsed: true });
            return { success: true, ...result };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      // ─── Slack tools (Comms Agent) ───
      slack_list_channels: tool({
        description: "List Slack channels. Comms Agent — Level 0+.",
        inputSchema: z.object({}),
        execute: async () => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "comms");
          try {
            const channels = await slack.listChannels();
            await logAction({ userId, agentName: "comms", action: "list_slack_channels", actionType: "read", service: "slack", trustLevel: trust.level, details: { count: channels.length }, inputSummary: "List channels", outputSummary: `Found ${channels.length} channels`, durationMs: Date.now() - start });
            return { success: true, channels };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      slack_read_messages: tool({
        description: "Read recent messages from a Slack channel. Comms Agent — Level 0+.",
        inputSchema: z.object({
          channelName: z.string().describe("Channel name (without #)"),
          limit: z.number().optional().default(5),
        }),
        execute: async ({ channelName, limit }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "comms");
          try {
            const channel = await slack.searchChannelByName(channelName);
            if (!channel) return { success: false, error: `Channel "${channelName}" not found.` };
            const messages = await slack.readMessages(channel.id, limit);
            await logAction({ userId, agentName: "comms", action: "read_slack_messages", actionType: "read", service: "slack", trustLevel: trust.level, details: { channel: channelName, count: messages.length }, inputSummary: `Read #${channelName}`, outputSummary: `${messages.length} messages`, durationMs: Date.now() - start });
            return { success: true, channel: channelName, messages };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      slack_send_message: tool({
        description: "Send a message to a Slack channel. Comms Agent — Level 2+ required.",
        inputSchema: z.object({
          channelName: z.string().describe("Channel name"),
          message: z.string().describe("Message text"),
        }),
        execute: async ({ channelName, message }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "comms");
          const perm = canPerformAction(trust.level, "execute");
          if (!perm.allowed) return { success: false, error: `Trust level too low. Current: Level ${trust.level}. Need Level 2+ to send Slack messages.` };
          try {
            const channel = await slack.searchChannelByName(channelName);
            if (!channel) return { success: false, error: `Channel "${channelName}" not found.` };
            const result = await slack.sendMessage(channel.id, message);
            await logAction({ userId, agentName: "comms", action: "send_slack_message", actionType: "execute", service: "slack", trustLevel: trust.level, details: { channel: channelName }, inputSummary: `Send to #${channelName}`, outputSummary: `Message sent`, durationMs: Date.now() - start });
            return { success: true, ...result };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      // ─── Calendar tools (Scheduler Agent) ───
      calendar_list_events: tool({
        description: "List upcoming calendar events. Scheduler Agent — Level 0+.",
        inputSchema: z.object({ maxResults: z.number().optional().default(5) }),
        execute: async ({ maxResults }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "scheduler");
          try {
            const events = await calendar.listEvents(userId, maxResults);
            await logAction({ userId, agentName: "scheduler", action: "list_events", actionType: "read", service: "calendar", trustLevel: trust.level, details: { count: events.length }, inputSummary: "List upcoming events", outputSummary: `${events.length} events`, durationMs: Date.now() - start, tokenUsed: true });
            return { success: true, events };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      calendar_check_availability: tool({
        description: "Check availability for a specific date. Scheduler Agent — Level 0+.",
        inputSchema: z.object({ date: z.string().describe("Date in YYYY-MM-DD format") }),
        execute: async ({ date }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "scheduler");
          try {
            const result = await calendar.checkAvailability(userId, date);
            await logAction({ userId, agentName: "scheduler", action: "check_availability", actionType: "read", service: "calendar", trustLevel: trust.level, details: { date }, inputSummary: `Check ${date}`, outputSummary: result.freeSlots, durationMs: Date.now() - start, tokenUsed: true });
            return { success: true, ...result };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      calendar_create_event: tool({
        description: "Create a calendar event. Scheduler Agent — Level 2+ required. CIBA required for external attendees.",
        inputSchema: z.object({
          title: z.string(),
          startTime: z.string().describe("ISO 8601 datetime"),
          endTime: z.string().describe("ISO 8601 datetime"),
          attendees: z.array(z.string()).optional().describe("List of attendee emails"),
          description: z.string().optional(),
        }),
        execute: async ({ title, startTime, endTime, attendees, description }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "scheduler");
          const actionName = attendees && attendees.length > 0 ? "schedule_external_meeting" : undefined;
          const perm = canPerformAction(trust.level, "execute", actionName);
          if (!perm.allowed) return { success: false, error: `Trust level too low. Need Level 2+ to create events.` };
          if (perm.requiresCiba) return { success: false, requiresCiba: true, message: `Creating event with external attendees requires CIBA approval.`, title, attendees };
          try {
            const result = await calendar.createEvent(userId, title, startTime, endTime, attendees, description);
            await logAction({ userId, agentName: "scheduler", action: "create_event", actionType: "execute", service: "calendar", trustLevel: trust.level, details: { title, attendees }, inputSummary: `Create: ${title}`, outputSummary: `Event created`, durationMs: Date.now() - start, tokenUsed: true });
            return { success: true, ...result };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      // ─── Stripe tools (Finance Agent) ───
      stripe_get_balance: tool({
        description: "Check Stripe account balance. Finance Agent — Level 0+.",
        inputSchema: z.object({}),
        execute: async () => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "finance");
          try {
            const balance = await stripe.getBalance();
            await logAction({ userId, agentName: "finance", action: "check_balance", actionType: "read", service: "stripe", trustLevel: trust.level, inputSummary: "Check balance", outputSummary: JSON.stringify(balance.available), durationMs: Date.now() - start });
            return { success: true, balance };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      stripe_list_payments: tool({
        description: "List recent payments/charges. Finance Agent — Level 0+.",
        inputSchema: z.object({ limit: z.number().optional().default(5) }),
        execute: async ({ limit }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "finance");
          try {
            const payments = await stripe.listRecentPayments(limit);
            await logAction({ userId, agentName: "finance", action: "list_payments", actionType: "read", service: "stripe", trustLevel: trust.level, details: { count: payments.length }, inputSummary: "List payments", outputSummary: `${payments.length} payments`, durationMs: Date.now() - start });
            return { success: true, payments };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      stripe_list_customers: tool({
        description: "List Stripe customers. Finance Agent — Level 0+.",
        inputSchema: z.object({ limit: z.number().optional().default(10) }),
        execute: async ({ limit }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "finance");
          try {
            const customers = await stripe.listCustomers(limit);
            await logAction({ userId, agentName: "finance", action: "list_customers", actionType: "read", service: "stripe", trustLevel: trust.level, inputSummary: "List customers", outputSummary: `${customers.length} customers`, durationMs: Date.now() - start });
            return { success: true, customers };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      stripe_list_invoices: tool({
        description: "List invoices. Finance Agent — Level 0+.",
        inputSchema: z.object({ limit: z.number().optional().default(10) }),
        execute: async ({ limit }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "finance");
          try {
            const invoices = await stripe.listInvoices(limit);
            await logAction({ userId, agentName: "finance", action: "list_invoices", actionType: "read", service: "stripe", trustLevel: trust.level, inputSummary: "List invoices", outputSummary: `${invoices.length} invoices`, durationMs: Date.now() - start });
            return { success: true, invoices };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      stripe_create_invoice: tool({
        description: "Create a draft invoice. Finance Agent — Level 1+ to draft, Level 2+ to finalize. ALWAYS requires CIBA to send.",
        inputSchema: z.object({
          customerEmail: z.string().describe("Customer email"),
          items: z.array(z.object({
            description: z.string(),
            amount: z.number().describe("Amount in USD"),
          })).describe("Invoice line items"),
        }),
        execute: async ({ customerEmail, items }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "finance");
          const perm = canPerformAction(trust.level, "draft", "create_invoice");
          if (!perm.allowed) return { success: false, error: `Trust level too low. Need Level 1+ to create invoices.` };
          try {
            const result = await stripe.createInvoice(customerEmail, items);
            await logAction({ userId, agentName: "finance", action: "create_invoice", actionType: "draft", service: "stripe", trustLevel: trust.level, details: { customerEmail, items: items.length }, inputSummary: `Invoice for ${customerEmail}`, outputSummary: `Draft invoice ${result.id}`, durationMs: Date.now() - start });
            return { success: true, ...result, note: "Invoice created as draft. Sending requires CIBA approval." };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      stripe_send_invoice: tool({
        description: "Send a draft invoice to the customer. Finance Agent — ALWAYS requires CIBA approval.",
        inputSchema: z.object({ invoiceId: z.string().describe("Stripe invoice ID") }),
        execute: async ({ invoiceId }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "finance");
          const perm = canPerformAction(trust.level, "execute", "send_invoice");
          if (!perm.allowed) return { success: false, error: `Trust level too low. Need Level 2+ to send invoices.` };
          if (perm.requiresCiba) return { success: false, requiresCiba: true, message: `Sending invoice requires CIBA approval.`, invoiceId };
          try {
            const result = await stripe.sendInvoice(invoiceId);
            await logAction({ userId, agentName: "finance", action: "send_invoice", actionType: "execute", service: "stripe", trustLevel: trust.level, cibaRequired: true, cibaApproved: true, details: { invoiceId }, inputSummary: `Send invoice ${invoiceId}`, outputSummary: `Invoice sent`, durationMs: Date.now() - start });
            return { success: true, ...result };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      // ─── Drive tools (Docs Agent) ───
      drive_list_files: tool({
        description: "List files in Google Drive. Docs Agent — Level 0+.",
        inputSchema: z.object({
          query: z.string().optional().describe("Search query to filter files"),
          maxResults: z.number().optional().default(10),
        }),
        execute: async ({ query, maxResults }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "docs");
          try {
            const files = await drive.listFiles(userId, maxResults, query);
            await logAction({ userId, agentName: "docs", action: "list_files", actionType: "read", service: "drive", trustLevel: trust.level, details: { query, count: files.length }, inputSummary: query ? `Search: ${query}` : "List files", outputSummary: `${files.length} files`, durationMs: Date.now() - start, tokenUsed: true });
            return { success: true, files };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      drive_read_document: tool({
        description: "Read a document from Google Drive. Docs Agent — Level 0+.",
        inputSchema: z.object({ fileId: z.string().describe("Google Drive file ID") }),
        execute: async ({ fileId }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "docs");
          try {
            const doc = await drive.readDocument(userId, fileId);
            await logAction({ userId, agentName: "docs", action: "read_document", actionType: "read", service: "drive", trustLevel: trust.level, details: { fileId }, inputSummary: `Read ${doc.name}`, outputSummary: `${doc.content.length} chars`, durationMs: Date.now() - start, tokenUsed: true });
            return { success: true, ...doc };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      drive_create_document: tool({
        description: "Create a new Google Doc. Docs Agent — Level 1+ to draft, Level 2+ to create.",
        inputSchema: z.object({
          title: z.string().describe("Document title"),
          content: z.string().describe("Document content"),
        }),
        execute: async ({ title, content }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "docs");
          const perm = canPerformAction(trust.level, "draft");
          if (!perm.allowed) return { success: false, error: `Trust level too low. Need Level 1+ to create documents.` };
          try {
            const result = await drive.createDocument(userId, title, content);
            await logAction({ userId, agentName: "docs", action: "create_document", actionType: "draft", service: "drive", trustLevel: trust.level, details: { title }, inputSummary: `Create: ${title}`, outputSummary: `Doc created: ${result.link}`, durationMs: Date.now() - start, tokenUsed: true });
            return { success: true, ...result };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      drive_share_document: tool({
        description: "Share a document with someone. Docs Agent — Level 2+ required. ALWAYS requires CIBA for external sharing.",
        inputSchema: z.object({
          fileId: z.string(),
          email: z.string().describe("Email to share with"),
          role: z.enum(["reader", "writer"]).optional().default("reader"),
        }),
        execute: async ({ fileId, email, role }) => {
          const start = Date.now();
          const trust = await getTrustScore(userId, "docs");
          const perm = canPerformAction(trust.level, "execute", "share_document_external");
          if (!perm.allowed) return { success: false, error: `Trust level too low. Need Level 2+ to share documents.` };
          if (perm.requiresCiba) return { success: false, requiresCiba: true, message: `Sharing document externally requires CIBA approval.`, fileId, email };
          try {
            const result = await drive.shareDocument(userId, fileId, email, role);
            await logAction({ userId, agentName: "docs", action: "share_document", actionType: "execute", service: "drive", trustLevel: trust.level, cibaRequired: true, cibaApproved: true, details: { fileId, email, role }, inputSummary: `Share with ${email}`, outputSummary: `Shared ${result.fileName}`, durationMs: Date.now() - start, tokenUsed: true });
            return { success: true, ...result };
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            return { success: false, error: msg };
          }
        },
      }),

      // ─── CIBA request tool ───
      create_ciba_request: tool({
        description: "Create a CIBA (Client Initiated Backchannel Authentication) request when an action requires human approval. The user will receive a push notification on their mobile app to approve or deny.",
        inputSchema: z.object({
          agentName: z.enum(["comms", "scheduler", "finance", "docs"]),
          action: z.string().describe("Human-readable description of the action"),
          service: z.string().describe("The service (gmail, slack, calendar, stripe, drive)"),
          details: z.string().describe("Full details of what will happen if approved"),
        }),
        execute: async ({ agentName, action, service, details }) => {
          const { db } = await import("@/lib/db/client");
          const { cibaRequests } = await import("@/lib/db/schema");
          const { sendCibaNotification } = await import("@/lib/firebase-admin");

          const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
          const [request] = await db.insert(cibaRequests).values({
            userId,
            agentName,
            action,
            details,
            service,
            status: "pending",
            expiresAt,
          }).returning();

          sendCibaNotification(userId, request.id, agentName, action, service).catch(console.error);

          return {
            success: true,
            cibaRequestId: request.id,
            status: "pending",
            expiresAt: expiresAt.toISOString(),
            message: `CIBA request created. The user has been notified on their mobile device. Waiting for approval (expires in 5 minutes).`,
          };
        },
      }),
    },
    stopWhen: stepCountIs(8),
  });
}
