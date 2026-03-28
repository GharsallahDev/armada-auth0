"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Search,
  MoreHorizontal,
  Check,
  CheckCheck,
  Paperclip,
  Bot,
  GitPullRequest,
  Terminal,
  FileCode,
  AlertTriangle,
  CheckCircle,
  Circle,
  XCircle,
  Clock,
  ArrowUpRight,
  Shield,
  TrendingUp,
  BarChart3,
  Download,
  Copy,
  ChevronRight,
  Cpu,
  Zap,
  ExternalLink,
  RefreshCw,
  Pin,
  Slash,
  Mail,
  CreditCard,
  Share2,
  Calendar,
  Link2,
  ShieldCheck,
  Eye,
  Lock,
  Globe,
  MessageSquare,
  ShoppingCart,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Message types ──────────────────────────────────────────────

type MessageType =
  | "text"
  | "code"
  | "table"
  | "approval_request"
  | "approval_resolved"
  | "service_action"
  | "metric_card"
  | "file_attachment"
  | "command_result"
  | "alert"
  | "progress"
  | "thinking"
  | "email_preview"
  | "payment_card"
  | "social_post";

interface BaseMessage {
  id: string;
  sender: "user" | "agent" | "system";
  time: string;
  read: boolean;
}

interface TextMessage extends BaseMessage { type: "text"; text: string }
interface CodeMessage extends BaseMessage { type: "code"; text?: string; language: string; code: string; filename?: string }
interface TableMessage extends BaseMessage { type: "table"; text?: string; headers: string[]; rows: string[][]; footer?: string }

interface ApprovalRequestMessage extends BaseMessage {
  type: "approval_request";
  action: string;
  service: string;
  risk: "low" | "medium" | "high" | "critical";
  details: string;
  status: "pending" | "approved" | "denied";
}

interface ApprovalResolvedMessage extends BaseMessage {
  type: "approval_resolved";
  action: string;
  approved: boolean;
  resolvedBy: string;
}

interface ServiceActionMessage extends BaseMessage {
  type: "service_action";
  service: string;
  serviceIcon: string;
  action: string;
  status: "running" | "success" | "failed";
  details: string;
  scopes?: string[];
}

interface MetricCardMessage extends BaseMessage {
  type: "metric_card";
  text?: string;
  metrics: { label: string; value: string; change?: string; trend?: "up" | "down" | "flat" }[];
}

interface FileAttachmentMessage extends BaseMessage {
  type: "file_attachment";
  filename: string;
  filesize: string;
  filetype: string;
  text?: string;
}

interface CommandResultMessage extends BaseMessage {
  type: "command_result";
  command: string;
  output: string;
  exitCode: number;
}

interface AlertMessage extends BaseMessage {
  type: "alert";
  severity: "info" | "warning" | "error" | "success";
  title: string;
  text: string;
}

interface ProgressMessage extends BaseMessage {
  type: "progress";
  task: string;
  percent: number;
  steps: { label: string; done: boolean }[];
}

interface ThinkingMessage extends BaseMessage { type: "thinking"; text: string }

interface EmailPreviewMessage extends BaseMessage {
  type: "email_preview";
  from: string;
  to: string;
  subject: string;
  body: string;
  service: string;
  status: "draft" | "sent" | "scheduled";
}

interface PaymentCardMessage extends BaseMessage {
  type: "payment_card";
  service: string;
  amount: string;
  currency: string;
  recipient: string;
  description: string;
  status: "pending" | "completed" | "failed";
  reference?: string;
}

interface SocialPostMessage extends BaseMessage {
  type: "social_post";
  platform: string;
  content: string;
  scheduledFor?: string;
  status: "draft" | "published" | "scheduled";
  engagement?: { likes: number; comments: number; shares: number };
}

type Message =
  | TextMessage | CodeMessage | TableMessage | ApprovalRequestMessage
  | ApprovalResolvedMessage | ServiceActionMessage | MetricCardMessage
  | FileAttachmentMessage | CommandResultMessage | AlertMessage
  | ProgressMessage | ThinkingMessage | EmailPreviewMessage
  | PaymentCardMessage | SocialPostMessage;

interface Conversation {
  id: string;
  agentName: string;
  agentRole: string;
  agentGradient: string;
  agentAvatar: string;
  status: "online" | "busy" | "offline";
  trustLevel: number;
  services: string[];
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
}

// ── Commands — per-service via Token Vault ────────────────────

import { getCommandsForServices, type ServiceCommand } from "@/lib/service-commands";
import { SERVICE_DISPLAY } from "@/lib/trust/levels";

// Icon mapping for command palette display
const COMMAND_SERVICE_ICONS: Record<string, React.ReactNode> = {
  _global: <Globe className="h-3.5 w-3.5" />,
  gmail: <Mail className="h-3.5 w-3.5" />,
  calendar: <Calendar className="h-3.5 w-3.5" />,
  drive: <Globe className="h-3.5 w-3.5" />,
  slack: <MessageSquare className="h-3.5 w-3.5" />,
  discord: <MessageSquare className="h-3.5 w-3.5" />,
  stripe: <CreditCard className="h-3.5 w-3.5" />,
  paypal: <CreditCard className="h-3.5 w-3.5" />,
  klarna: <CreditCard className="h-3.5 w-3.5" />,
  shopify: <ShoppingCart className="h-3.5 w-3.5" />,
  github: <Globe className="h-3.5 w-3.5" />,
  bitbucket: <Globe className="h-3.5 w-3.5" />,
  linkedin: <Share2 className="h-3.5 w-3.5" />,
  twitter: <Share2 className="h-3.5 w-3.5" />,
  facebook: <Share2 className="h-3.5 w-3.5" />,
  instagram: <Share2 className="h-3.5 w-3.5" />,
  salesforce: <Globe className="h-3.5 w-3.5" />,
  figma: <Globe className="h-3.5 w-3.5" />,
  dropbox: <Globe className="h-3.5 w-3.5" />,
  microsoft: <Globe className="h-3.5 w-3.5" />,
  quickbooks: <Receipt className="h-3.5 w-3.5" />,
  freshbooks: <Receipt className="h-3.5 w-3.5" />,
  spotify: <Globe className="h-3.5 w-3.5" />,
  wordpress: <Globe className="h-3.5 w-3.5" />,
};

// ── Avatar helper ──────────────────────────────────────────────

function AgentAvatar({ name, gradient, avatar, size = "md" }: { name: string; gradient: string; avatar: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-10 w-10" };
  const textSizes = { sm: "text-[10px]", md: "text-sm", lg: "text-sm" };
  return (
    <div className={cn("rounded-xl overflow-hidden shrink-0", sizes[size])}>
      <img
        src={avatar}
        alt={name}
        className="h-full w-full object-cover"
        onError={(e) => {
          // Fallback to gradient initial
          const el = e.currentTarget;
          el.style.display = "none";
          el.parentElement!.classList.add("flex", "items-center", "justify-center", "font-bold", "text-white", "bg-gradient-to-br", ...gradient.split(" "));
          el.parentElement!.innerHTML = `<span class="${textSizes[size]}">${name[0]}</span>`;
        }}
      />
    </div>
  );
}

// ── Static conversations ──────────────────────────────────────

const CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    agentName: "Nova",
    agentRole: "Marketing Manager",
    agentGradient: "from-pink-500 to-rose-500",
    agentAvatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Nova",
    status: "online",
    trustLevel: 2,
    services: ["linkedin", "twitter", "facebook", "instagram", "gmail", "calendar"],
    lastMessage: "LinkedIn post scheduled for tomorrow 9 AM",
    lastTime: "5m ago",
    unread: 2,
    messages: [
      { id: "m1", sender: "user", type: "text", text: "Nova, we need to announce the new Token Vault integration on our socials.", time: "10:00 AM", read: true },
      { id: "m2", sender: "agent", type: "thinking", text: "Checking connected social accounts via Token Vault... LinkedIn (read/write), Twitter (read/write), Facebook Page (read/write) available.", time: "10:01 AM", read: true },
      { id: "m3", sender: "agent", type: "service_action", service: "LinkedIn", serviceIcon: "linkedin", action: "Fetching audience analytics", status: "success", details: "12.4K followers, avg engagement 3.2%, peak hours: 9-11 AM EST", scopes: ["r_liteprofile", "w_member_social"], time: "10:02 AM", read: true },
      { id: "m4", sender: "agent", type: "social_post", platform: "LinkedIn", content: "Excited to announce our Token Vault integration! Your AI agents can now securely connect to 34+ services with delegated OAuth. No more credential sharing. No more security headaches.\n\nThe future of AI workforce management is here.\n\n#Auth0 #AIAgents #TokenVault #Security", scheduledFor: "Tomorrow, 9:00 AM EST", status: "draft", time: "10:05 AM", read: true },
      { id: "m5", sender: "user", type: "text", text: "Looks good! Also draft one for Twitter, shorter.", time: "10:08 AM", read: true },
      { id: "m6", sender: "agent", type: "social_post", platform: "Twitter", content: "Your AI agents just got superpowers.\n\nToken Vault: secure OAuth delegation for 34+ services. Your agents authenticate like humans, but you stay in control.\n\nBuilt on @auth0 for AI Agents.", status: "draft", time: "10:10 AM", read: true },
      { id: "m7", sender: "user", type: "text", text: "/post linkedin", time: "10:12 AM", read: true },
      { id: "m8", sender: "agent", type: "approval_request", action: "Publish post to LinkedIn company page", service: "LinkedIn", risk: "medium", details: "This will be visible to 12.4K followers. Content has been reviewed. Scheduling for tomorrow 9:00 AM EST for optimal engagement.", status: "pending", time: "10:12 AM", read: false },
      { id: "m9", sender: "agent", type: "text", text: "I've queued the LinkedIn post for your approval. Should I also schedule the Twitter one?", time: "10:13 AM", read: false },
    ],
  },
  {
    id: "conv-2",
    agentName: "Atlas",
    agentRole: "Finance Assistant",
    agentGradient: "from-emerald-500 to-teal-500",
    agentAvatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Atlas",
    status: "busy",
    trustLevel: 2,
    services: ["stripe", "paypal", "klarna", "gmail", "quickbooks"],
    lastMessage: "3 invoices processed via Stripe",
    lastTime: "15m ago",
    unread: 1,
    messages: [
      { id: "m1", sender: "user", type: "text", text: "/status", time: "9:00 AM", read: true },
      { id: "m2", sender: "agent", type: "service_action", service: "Stripe", serviceIcon: "stripe", action: "Connected via Token Vault", status: "success", details: "Scopes: read_write (payments, invoices, customers). Token refreshed 2h ago. 847 API calls today.", scopes: ["payments.read", "payments.write", "invoices.read", "invoices.write", "customers.read"], time: "9:01 AM", read: true },
      { id: "m3", sender: "user", type: "text", text: "Process the pending invoices for this month.", time: "9:05 AM", read: true },
      { id: "m4", sender: "agent", type: "progress", task: "Processing March Invoices via Stripe", percent: 100, steps: [
        { label: "Fetch pending invoices from Stripe", done: true },
        { label: "Validate customer payment methods", done: true },
        { label: "Process invoice #INV-2026-031 ($4,200)", done: true },
        { label: "Process invoice #INV-2026-032 ($1,850)", done: true },
        { label: "Process invoice #INV-2026-033 ($7,600)", done: true },
      ], time: "9:12 AM", read: true },
      { id: "m5", sender: "agent", type: "payment_card", service: "Stripe", amount: "13,650.00", currency: "USD", recipient: "3 customers", description: "March 2026 invoice batch", status: "completed", reference: "batch_3x8kL2mN", time: "9:13 AM", read: true },
      { id: "m6", sender: "agent", type: "table", text: "Invoice Summary", headers: ["Invoice", "Customer", "Amount", "Status"], rows: [
        ["INV-2026-031", "Acme Corp", "$4,200.00", "Paid"],
        ["INV-2026-032", "Globex Inc", "$1,850.00", "Paid"],
        ["INV-2026-033", "Initech Ltd", "$7,600.00", "Paid"],
      ], footer: "Total collected: $13,650.00 | Processing fee: $395.85", time: "9:14 AM", read: true },
      { id: "m7", sender: "agent", type: "email_preview", from: "billing@armada.dev", to: "accounting@acme.corp", subject: "Invoice INV-2026-031 — Payment Confirmed", body: "Hi,\n\nThis is to confirm that payment of $4,200.00 for invoice INV-2026-031 has been successfully processed via Stripe.\n\nTransaction reference: ch_3x8kL2mN_acme\n\nThank you for your business.", service: "Gmail", status: "sent", time: "9:15 AM", read: false },
    ],
  },
  {
    id: "conv-3",
    agentName: "Cipher",
    agentRole: "Compliance Officer",
    agentGradient: "from-rose-500 to-red-500",
    agentAvatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Cipher",
    status: "online",
    trustLevel: 3,
    services: ["gmail", "slack", "github", "stripe", "shopify", "linkedin"],
    lastMessage: "Token Vault audit complete",
    lastTime: "1h ago",
    unread: 0,
    messages: [
      { id: "m1", sender: "user", type: "text", text: "/audit", time: "8:00 AM", read: true },
      { id: "m2", sender: "agent", type: "thinking", text: "Scanning Token Vault connections, OAuth scopes, and recent agent activity across all services...", time: "8:01 AM", read: true },
      { id: "m3", sender: "agent", type: "table", text: "Token Vault — Connected Services Audit", headers: ["Service", "Agent(s)", "Scopes", "Last Used", "Risk"], rows: [
        ["Gmail", "Atlas, Relay", "send, read, labels", "2m ago", "Low"],
        ["Stripe", "Atlas", "payments.rw, invoices.rw", "15m ago", "Medium"],
        ["LinkedIn", "Nova", "w_member_social", "1h ago", "Low"],
        ["Slack", "Relay, Nova", "chat.write, channels.read", "5m ago", "Low"],
        ["Shopify", "Pixel", "read_orders, write_orders", "3h ago", "Medium"],
        ["GitHub", "—", "repo, workflow", "2d ago", "Info"],
      ], footer: "6 services connected | 4 agents with active tokens | 2 medium-risk scopes", time: "8:05 AM", read: true },
      { id: "m4", sender: "agent", type: "alert", severity: "warning", title: "Scope Over-Provisioning Detected", text: "Atlas has payments.write scope on Stripe but has only performed read operations in the last 30 days (until today's invoice batch). Consider narrowing to payments.read + invoices.write if batch processing isn't regular.", time: "8:06 AM", read: true },
      { id: "m5", sender: "agent", type: "alert", severity: "info", title: "Unused Connection", text: "GitHub connection hasn't been used in 2 days and no agent is assigned to it. Consider revoking the token to minimize attack surface.", time: "8:07 AM", read: true },
      { id: "m6", sender: "user", type: "text", text: "/revoke github", time: "8:10 AM", read: true },
      { id: "m7", sender: "agent", type: "approval_request", action: "Revoke GitHub OAuth token from Token Vault", service: "GitHub", risk: "medium", details: "This will invalidate the OAuth token for GitHub. No active agents are using this connection. To reconnect, a new OAuth flow will be required through Auth0.", status: "approved", time: "8:10 AM", read: true },
      { id: "m8", sender: "agent", type: "service_action", service: "GitHub", serviceIcon: "github", action: "Token revoked via Auth0 Token Vault", status: "success", details: "OAuth token invalidated. Connection removed from active vault. Audit log entry created.", scopes: [], time: "8:11 AM", read: true },
    ],
  },
  {
    id: "conv-4",
    agentName: "Pixel",
    agentRole: "E-commerce Manager",
    agentGradient: "from-amber-500 to-orange-500",
    agentAvatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Pixel",
    status: "online",
    trustLevel: 1,
    services: ["shopify", "klarna", "gmail", "stripe"],
    lastMessage: "Shopify order fulfilled + tracking sent",
    lastTime: "30m ago",
    unread: 0,
    messages: [
      { id: "m1", sender: "agent", type: "service_action", service: "Shopify", serviceIcon: "shopify", action: "New order received (#SH-4821)", status: "success", details: "Customer: sarah.johnson@gmail.com | 3 items | Total: $289.00 | Payment: Klarna (3 installments)", scopes: ["read_orders", "write_orders", "read_customers"], time: "11:00 AM", read: true },
      { id: "m2", sender: "agent", type: "table", headers: ["Item", "Qty", "Price"], rows: [
        ["Auth0 Security Hub (Pro)", "1", "$149.00"],
        ["Token Vault Extension Pack", "1", "$89.00"],
        ["Priority Support (1yr)", "1", "$51.00"],
      ], footer: "Subtotal: $289.00 | Klarna: 3x $96.33", time: "11:01 AM", read: true },
      { id: "m3", sender: "agent", type: "approval_request", action: "Fulfill order and send tracking email", service: "Shopify + Gmail", risk: "low", details: "Order #SH-4821 is ready for fulfillment. Will mark as shipped in Shopify and send tracking email to customer via Gmail.", status: "approved", time: "11:02 AM", read: true },
      { id: "m4", sender: "agent", type: "email_preview", from: "orders@armada.dev", to: "sarah.johnson@gmail.com", subject: "Your order #SH-4821 has shipped!", body: "Hi Sarah,\n\nGreat news! Your order has been fulfilled and is on its way.\n\nOrder #SH-4821\nTracking: 1Z999AA10123456784\nEstimated delivery: March 28-30\n\nThank you for your purchase!", service: "Gmail", status: "sent", time: "11:05 AM", read: true },
      { id: "m5", sender: "agent", type: "payment_card", service: "Klarna", amount: "96.33", currency: "USD", recipient: "sarah.johnson@gmail.com", description: "First installment of 3 — Order #SH-4821", status: "completed", reference: "klarna_3x_4821_1", time: "11:06 AM", read: true },
      { id: "m6", sender: "agent", type: "text", text: "Order #SH-4821 fully processed. Shopify marked as fulfilled, tracking email sent via Gmail, first Klarna installment confirmed. Next installment auto-processes in 30 days.", time: "11:07 AM", read: true },
    ],
  },
  {
    id: "conv-5",
    agentName: "Relay",
    agentRole: "Communications Manager",
    agentGradient: "from-sky-500 to-blue-500",
    agentAvatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Relay",
    status: "online",
    trustLevel: 2,
    services: ["gmail", "slack", "calendar", "discord"],
    lastMessage: "Slack + Gmail daily digest sent",
    lastTime: "2h ago",
    unread: 0,
    messages: [
      { id: "m1", sender: "agent", type: "metric_card", text: "Daily Communications Summary", metrics: [
        { label: "Emails Handled", value: "47", change: "+8 vs avg", trend: "up" },
        { label: "Slack Messages", value: "134", change: "+12", trend: "up" },
        { label: "Calendar Events", value: "6", change: "-2", trend: "down" },
        { label: "Response Time", value: "1.8m", change: "-0.4m", trend: "up" },
      ], time: "5:00 PM", read: true },
      { id: "m2", sender: "agent", type: "service_action", service: "Gmail", serviceIcon: "gmail", action: "Inbox triage complete", status: "success", details: "47 emails processed: 12 replied, 23 labeled & archived, 8 flagged for review, 4 delegated to other agents.", scopes: ["gmail.send", "gmail.readonly", "gmail.labels"], time: "5:01 PM", read: true },
      { id: "m3", sender: "agent", type: "alert", severity: "warning", title: "Flagged Email — Urgent", text: "Email from legal@partnercorp.com regarding contract renewal deadline (March 28). Requires human review. Subject: \"RE: MSA Renewal — Action Required by Friday\"", time: "5:02 PM", read: true },
      { id: "m4", sender: "user", type: "text", text: "Forward that legal email to our counsel.", time: "5:10 PM", read: true },
      { id: "m5", sender: "agent", type: "approval_request", action: "Forward email to external address (counsel@lawfirm.co)", service: "Gmail", risk: "high", details: "This email contains contract terms and will be forwarded outside the organization. Token Vault scope: gmail.send. CIBA step-up authentication required for external forwarding.", status: "pending", time: "5:10 PM", read: true },
      { id: "m6", sender: "agent", type: "text", text: "I've triggered a CIBA push notification to your phone for approval. This is a high-risk action since it involves forwarding to an external address.", time: "5:11 PM", read: true },
      { id: "m7", sender: "agent", type: "service_action", service: "Slack", serviceIcon: "slack", action: "Posted daily digest to #team-updates", status: "success", details: "Summary of today's communications posted. 3 action items highlighted, 1 urgent flag included.", scopes: ["chat:write", "channels:read"], time: "5:15 PM", read: true },
    ],
  },
];

const STATUS_COLOR: Record<string, string> = {
  online: "bg-emerald-400",
  busy: "bg-amber-400",
  offline: "bg-gray-400 dark:bg-gray-600",
};

const TRUST_LABEL: Record<number, string> = {
  0: "L0 Probation",
  1: "L1 Standard",
  2: "L2 Trusted",
  3: "L3 Autonomous",
};

// ── Rich message renderers ──────────────────────────────────

function CodeBlock({ msg }: { msg: CodeMessage }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-1.5">
      {msg.text && <p className="text-[13px] text-foreground/90">{msg.text}</p>}
      <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden bg-[#0d1117] dark:bg-black/40">
        <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <FileCode className="h-3 w-3 text-muted-foreground/50" />
            <span className="text-[11px] text-muted-foreground/60 font-mono">{msg.filename || msg.language}</span>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(msg.code); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-1">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="p-3 text-[12px] leading-relaxed font-mono text-gray-300 overflow-x-auto scrollbar-none"><code>{msg.code}</code></pre>
      </div>
    </div>
  );
}

function TableBlock({ msg }: { msg: TableMessage }) {
  return (
    <div className="space-y-1.5">
      {msg.text && <p className="text-[13px] font-medium text-foreground/90">{msg.text}</p>}
      <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead><tr className="bg-muted/30 dark:bg-white/[0.04]">{msg.headers.map((h, i) => <th key={i} className="px-3 py-2 text-left font-semibold text-muted-foreground/80 whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>{msg.rows.map((row, i) => <tr key={i} className="border-t border-border/20 dark:border-white/[0.04]">{row.map((cell, j) => <td key={j} className="px-3 py-2 text-foreground/80 whitespace-nowrap">{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
        {msg.footer && <div className="px-3 py-2 border-t border-border/20 dark:border-white/[0.04] bg-muted/20 dark:bg-white/[0.02] text-[11px] text-muted-foreground/60 font-medium">{msg.footer}</div>}
      </div>
    </div>
  );
}

function ApprovalRequestBlock({ msg }: { msg: ApprovalRequestMessage }) {
  const riskColors = { low: "text-emerald-500 bg-emerald-500/10", medium: "text-amber-500 bg-amber-500/10", high: "text-orange-500 bg-orange-500/10", critical: "text-red-500 bg-red-500/10" };
  const statusIcons = { pending: <Clock className="h-3.5 w-3.5 text-amber-500" />, approved: <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />, denied: <XCircle className="h-3.5 w-3.5 text-red-500" /> };
  return (
    <div className="rounded-xl border border-amber-500/20 dark:border-amber-500/10 bg-amber-500/[0.03] dark:bg-amber-500/[0.02] overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-amber-500/10">
        <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-amber-500" /><span className="text-[13px] font-semibold text-foreground">Approval Required</span></div>
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-md", riskColors[msg.risk])}>{msg.risk} risk</span>
          {statusIcons[msg.status]}
        </div>
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-2 text-[12px]"><span className="text-muted-foreground/60">Action:</span><span className="text-foreground font-medium">{msg.action}</span></div>
        <div className="flex items-center gap-2 text-[12px]"><span className="text-muted-foreground/60">Service:</span><span className="text-foreground font-medium">{msg.service}</span></div>
        <p className="text-[12px] text-muted-foreground/70 leading-relaxed">{msg.details}</p>
        {msg.status === "pending" && (
          <div className="flex items-center gap-2 pt-1">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-[12px] font-medium hover:bg-emerald-600 transition-colors"><CheckCircle className="h-3 w-3" /> Approve</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 dark:bg-white/[0.06] text-foreground text-[12px] font-medium hover:bg-muted dark:hover:bg-white/[0.1] transition-colors border border-border/40 dark:border-white/[0.08]"><XCircle className="h-3 w-3" /> Deny</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ApprovalResolvedBlock({ msg }: { msg: ApprovalResolvedMessage }) {
  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-[12px]", msg.approved ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400")}>
      {msg.approved ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      <span className="font-medium">{msg.action}</span>
      <span className="text-muted-foreground/60">—</span>
      <span>{msg.approved ? "Approved" : "Denied"} by {msg.resolvedBy}</span>
    </div>
  );
}

function ServiceActionBlock({ msg }: { msg: ServiceActionMessage }) {
  const statusConfig = { running: { color: "text-blue-500", bg: "bg-blue-500/10" }, success: { color: "text-emerald-500", bg: "bg-emerald-500/10" }, failed: { color: "text-red-500", bg: "bg-red-500/10" } };
  const c = statusConfig[msg.status];
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">{msg.service}</span>
          <span className="text-[10px] text-muted-foreground/40">via Token Vault</span>
        </div>
        <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-md", c.bg, c.color)}>
          {msg.status === "running" ? "In Progress" : msg.status}
        </span>
      </div>
      <div className="px-4 py-2.5 space-y-1.5">
        <p className="text-[12px] font-medium text-foreground">{msg.action}</p>
        <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{msg.details}</p>
        {msg.scopes && msg.scopes.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {msg.scopes.map((s, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/8 dark:bg-primary/10 text-primary/70 font-mono">{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCardBlock({ msg }: { msg: MetricCardMessage }) {
  const trendIcons = { up: <TrendingUp className="h-3 w-3 text-emerald-500" />, down: <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />, flat: <ArrowUpRight className="h-3 w-3 text-muted-foreground/40 rotate-45" /> };
  return (
    <div className="space-y-1.5">
      {msg.text && <p className="text-[13px] font-medium text-foreground/90">{msg.text}</p>}
      <div className="grid grid-cols-2 gap-2">
        {msg.metrics.map((m, i) => (
          <div key={i} className="rounded-xl border border-border/40 dark:border-white/[0.08] px-3 py-2.5 bg-muted/20 dark:bg-white/[0.02]">
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wide">{m.label}</p>
            <div className="flex items-end justify-between mt-1">
              <span className="text-lg font-bold text-foreground tracking-tight">{m.value}</span>
              {m.change && <div className="flex items-center gap-0.5">{m.trend && trendIcons[m.trend]}<span className={cn("text-[11px] font-medium", m.trend === "up" ? "text-emerald-500" : m.trend === "down" ? "text-red-500" : "text-muted-foreground/50")}>{m.change}</span></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FileAttachmentBlock({ msg }: { msg: FileAttachmentMessage }) {
  const typeColors: Record<string, string> = { pdf: "bg-red-500/10 text-red-500", csv: "bg-emerald-500/10 text-emerald-500", xlsx: "bg-green-500/10 text-green-500", zip: "bg-amber-500/10 text-amber-500" };
  const colors = typeColors[msg.filetype] || "bg-muted/30 text-muted-foreground";
  return (
    <div className="space-y-1.5">
      {msg.text && <p className="text-[13px] text-foreground/90">{msg.text}</p>}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border/40 dark:border-white/[0.08] bg-muted/10 dark:bg-white/[0.02] hover:bg-muted/20 dark:hover:bg-white/[0.04] transition-colors cursor-pointer group">
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase shrink-0", colors)}>{msg.filetype}</div>
        <div className="flex-1 min-w-0"><p className="text-[13px] font-medium text-foreground truncate">{msg.filename}</p><p className="text-[11px] text-muted-foreground/50">{msg.filesize}</p></div>
        <Download className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
      </div>
    </div>
  );
}

function CommandResultBlock({ msg }: { msg: CommandResultMessage }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden bg-[#0d1117] dark:bg-black/40">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border-b border-white/[0.06]">
        <Terminal className="h-3 w-3 text-muted-foreground/50" />
        <span className="text-[11px] text-muted-foreground/60 font-mono">$ {msg.command}</span>
        <span className={cn("ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded", msg.exitCode === 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>exit {msg.exitCode}</span>
      </div>
      <pre className="p-3 text-[12px] leading-relaxed font-mono text-gray-400 overflow-x-auto scrollbar-none whitespace-pre-wrap">{msg.output}</pre>
    </div>
  );
}

function AlertBlock({ msg }: { msg: AlertMessage }) {
  const config = {
    info: { icon: <Cpu className="h-4 w-4" />, border: "border-blue-500/20", bg: "bg-blue-500/[0.04]", color: "text-blue-500" },
    warning: { icon: <AlertTriangle className="h-4 w-4" />, border: "border-amber-500/20", bg: "bg-amber-500/[0.04]", color: "text-amber-500" },
    error: { icon: <XCircle className="h-4 w-4" />, border: "border-red-500/20", bg: "bg-red-500/[0.04]", color: "text-red-500" },
    success: { icon: <CheckCircle className="h-4 w-4" />, border: "border-emerald-500/20", bg: "bg-emerald-500/[0.04]", color: "text-emerald-500" },
  };
  const c = config[msg.severity];
  return (
    <div className={cn("rounded-xl border px-4 py-3", c.border, c.bg)}>
      <div className="flex items-center gap-2 mb-1.5"><span className={c.color}>{c.icon}</span><span className="text-[13px] font-semibold text-foreground">{msg.title}</span></div>
      <p className="text-[12px] text-foreground/70 leading-relaxed">{msg.text}</p>
    </div>
  );
}

function ProgressBlock({ msg }: { msg: ProgressMessage }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between"><span className="text-[13px] font-semibold text-foreground">{msg.task}</span><span className="text-[12px] text-primary font-bold">{msg.percent}%</span></div>
      <div className="mx-4 mb-3 h-1.5 rounded-full bg-muted/30 dark:bg-white/[0.06] overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-500" style={{ width: `${msg.percent}%` }} /></div>
      <div className="px-4 pb-3 space-y-1.5">
        {msg.steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px]">
            {step.done ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <Circle className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />}
            <span className={cn(step.done ? "text-foreground/70" : "text-muted-foreground/40")}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThinkingBlock({ msg }: { msg: ThinkingMessage }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-muted/20 dark:bg-white/[0.02] border border-dashed border-border/30 dark:border-white/[0.06]">
      <Cpu className="h-3.5 w-3.5 text-muted-foreground/40 mt-0.5 shrink-0 animate-pulse" />
      <p className="text-[12px] text-muted-foreground/50 italic">{msg.text}</p>
    </div>
  );
}

function EmailPreviewBlock({ msg }: { msg: EmailPreviewMessage }) {
  const statusColors = { draft: "text-amber-500 bg-amber-500/10", sent: "text-emerald-500 bg-emerald-500/10", scheduled: "text-blue-500 bg-blue-500/10" };
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground/60" /><span className="text-[12px] font-semibold text-foreground">Email</span><span className="text-[10px] text-muted-foreground/40">via {msg.service}</span></div>
        <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-md", statusColors[msg.status])}>{msg.status}</span>
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="space-y-1 text-[12px]">
          <div className="flex gap-2"><span className="text-muted-foreground/50 w-10 shrink-0">From</span><span className="text-foreground/80 font-mono text-[11px]">{msg.from}</span></div>
          <div className="flex gap-2"><span className="text-muted-foreground/50 w-10 shrink-0">To</span><span className="text-foreground/80 font-mono text-[11px]">{msg.to}</span></div>
          <div className="flex gap-2"><span className="text-muted-foreground/50 w-10 shrink-0">Subj</span><span className="text-foreground font-medium">{msg.subject}</span></div>
        </div>
        <div className="p-3 rounded-lg bg-muted/20 dark:bg-white/[0.02] border border-border/20 dark:border-white/[0.04]">
          <p className="text-[12px] text-foreground/70 leading-relaxed whitespace-pre-wrap">{msg.body}</p>
        </div>
      </div>
    </div>
  );
}

function PaymentCardBlock({ msg }: { msg: PaymentCardMessage }) {
  const statusColors = { pending: "text-amber-500 bg-amber-500/10", completed: "text-emerald-500 bg-emerald-500/10", failed: "text-red-500 bg-red-500/10" };
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2"><CreditCard className="h-3.5 w-3.5 text-muted-foreground/60" /><span className="text-[12px] font-semibold text-foreground">Payment</span><span className="text-[10px] text-muted-foreground/40">via {msg.service}</span></div>
        <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-md", statusColors[msg.status])}>{msg.status}</span>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-foreground tracking-tight">${msg.amount}</span>
          <span className="text-[11px] text-muted-foreground/50">{msg.currency}</span>
        </div>
        <div className="space-y-1 text-[12px]">
          <div className="flex justify-between"><span className="text-muted-foreground/50">To</span><span className="text-foreground/80">{msg.recipient}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground/50">Description</span><span className="text-foreground/80">{msg.description}</span></div>
          {msg.reference && <div className="flex justify-between"><span className="text-muted-foreground/50">Reference</span><span className="text-foreground/60 font-mono text-[11px]">{msg.reference}</span></div>}
        </div>
      </div>
    </div>
  );
}

function SocialPostBlock({ msg }: { msg: SocialPostMessage }) {
  const statusColors = { draft: "text-amber-500 bg-amber-500/10", published: "text-emerald-500 bg-emerald-500/10", scheduled: "text-blue-500 bg-blue-500/10" };
  const platformColors: Record<string, string> = { LinkedIn: "text-blue-600", Twitter: "text-sky-500", Facebook: "text-blue-500", Instagram: "text-pink-500" };
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2"><Share2 className={cn("h-3.5 w-3.5", platformColors[msg.platform] || "text-muted-foreground/60")} /><span className="text-[12px] font-semibold text-foreground">{msg.platform}</span></div>
        <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-md", statusColors[msg.status])}>{msg.status}</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-[12px] text-foreground/80 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        {msg.scheduledFor && <p className="mt-2 text-[11px] text-muted-foreground/50 flex items-center gap-1"><Calendar className="h-3 w-3" /> {msg.scheduledFor}</p>}
        {msg.engagement && (
          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/20 dark:border-white/[0.04] text-[11px] text-muted-foreground/50">
            <span>{msg.engagement.likes} likes</span>
            <span>{msg.engagement.comments} comments</span>
            <span>{msg.engagement.shares} shares</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Message renderer ──────────────────────────────────────────

function MessageBubble({ msg, agentName, agentGradient, agentAvatar }: { msg: Message; agentName: string; agentGradient: string; agentAvatar: string }) {
  const isUser = msg.sender === "user";
  const isRichAgent = !isUser && msg.type !== "text";
  if (msg.sender === "system") return null;

  if (isUser) {
    const isCommand = msg.type === "text" && (msg as TextMessage).text.startsWith("/");
    return (
      <div className="flex justify-end">
        <div className={cn("max-w-[70%] rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] leading-relaxed", isCommand ? "bg-[#0d1117] dark:bg-black/60 text-gray-300 font-mono border border-border/20 dark:border-white/[0.06]" : "bg-primary text-primary-foreground")}>
          {isCommand && <Slash className="h-3 w-3 inline mr-1 opacity-50" />}
          <span>{(msg as TextMessage).text}</span>
          <div className="flex items-center gap-1 mt-1 justify-end">
            <span className={cn("text-[10px]", isCommand ? "text-gray-500" : "text-primary-foreground/60")}>{msg.time}</span>
            {msg.read ? <CheckCheck className={cn("h-3 w-3", isCommand ? "text-gray-500" : "text-primary-foreground/60")} /> : <Check className={cn("h-3 w-3", isCommand ? "text-gray-600" : "text-primary-foreground/40")} />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <AgentAvatar name={agentName} gradient={agentGradient} avatar={agentAvatar} size="sm" />
      <div className={cn("space-y-1.5", isRichAgent ? "max-w-[85%] min-w-[300px]" : "max-w-[70%]")}>
        {msg.type === "text" && (
          <div className="rounded-2xl rounded-bl-md px-4 py-2.5 bg-muted/40 dark:bg-white/[0.06] border border-border/30 dark:border-white/[0.06]">
            <p className="text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">{(msg as TextMessage).text}</p>
            <p className="text-[10px] text-muted-foreground/40 mt-1">{msg.time}</p>
          </div>
        )}
        {msg.type === "code" && <CodeBlock msg={msg as CodeMessage} />}
        {msg.type === "table" && <TableBlock msg={msg as TableMessage} />}
        {msg.type === "approval_request" && <ApprovalRequestBlock msg={msg as ApprovalRequestMessage} />}
        {msg.type === "approval_resolved" && <ApprovalResolvedBlock msg={msg as ApprovalResolvedMessage} />}
        {msg.type === "service_action" && <ServiceActionBlock msg={msg as ServiceActionMessage} />}
        {msg.type === "metric_card" && <MetricCardBlock msg={msg as MetricCardMessage} />}
        {msg.type === "file_attachment" && <FileAttachmentBlock msg={msg as FileAttachmentMessage} />}
        {msg.type === "command_result" && <CommandResultBlock msg={msg as CommandResultMessage} />}
        {msg.type === "alert" && <AlertBlock msg={msg as AlertMessage} />}
        {msg.type === "progress" && <ProgressBlock msg={msg as ProgressMessage} />}
        {msg.type === "thinking" && <ThinkingBlock msg={msg as ThinkingMessage} />}
        {msg.type === "email_preview" && <EmailPreviewBlock msg={msg as EmailPreviewMessage} />}
        {msg.type === "payment_card" && <PaymentCardBlock msg={msg as PaymentCardMessage} />}
        {msg.type === "social_post" && <SocialPostBlock msg={msg as SocialPostMessage} />}
        {msg.type !== "text" && <p className="text-[10px] text-muted-foreground/30 px-1">{msg.time}</p>}
      </div>
    </div>
  );
}

// ── Slash command palette ──────────────────────────────────

function SlashCommandPalette({ query, onSelect, services }: { query: string; onSelect: (cmd: string) => void; services: string[] }) {
  const allCommands = getCommandsForServices(services);
  const search = query.slice(1).toLowerCase();
  const filtered = allCommands.filter((c) => c.command.toLowerCase().includes(search) || c.label.toLowerCase().includes(search) || c.service.toLowerCase().includes(search));
  if (filtered.length === 0) return null;

  // Group by service
  const grouped: Record<string, ServiceCommand[]> = {};
  for (const cmd of filtered) {
    const key = cmd.service;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(cmd);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-border/50 dark:border-white/[0.1] bg-background/95 backdrop-blur-xl shadow-xl overflow-hidden z-50">
      <div className="px-3 py-2 border-b border-border/30 dark:border-white/[0.06] flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Commands</p>
        <p className="text-[10px] text-muted-foreground/30">{services.length} services connected</p>
      </div>
      <div className="max-h-[300px] overflow-y-auto py-1">
        {Object.entries(grouped).map(([service, cmds]) => (
          <div key={service}>
            <div className="px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-muted-foreground/40">{COMMAND_SERVICE_ICONS[service] || <Globe className="h-3 w-3" />}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40">
                {service === "_global" ? "General" : SERVICE_DISPLAY[service]?.label || service}
              </span>
            </div>
            {cmds.map((cmd) => (
              <button key={cmd.command} onClick={() => onSelect(cmd.command + " ")} className="w-full flex items-center gap-3 px-3 py-1.5 hover:bg-muted/40 dark:hover:bg-white/[0.06] transition-colors text-left">
                <div className="flex-1 min-w-0 pl-5">
                  <div className="flex items-center gap-2"><span className="text-[12px] font-medium text-foreground">{cmd.command}</span>{cmd.args && <span className="text-[10px] text-muted-foreground/40 font-mono">{cmd.args}</span>}</div>
                  <p className="text-[10px] text-muted-foreground/50">{cmd.description}</p>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Agent Edit Panel ──────────────────────────────────────────

function AgentEditPanel({ agent, onClose }: { agent: Conversation; onClose: () => void }) {
  const [name, setName] = useState(agent.agentName);
  const [role, setRole] = useState(agent.agentRole);
  const [services, setServices] = useState<string[]>(agent.services);
  const allServices = Object.keys(SERVICE_DISPLAY);

  const toggleService = (s: string) => {
    setServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute top-0 right-0 h-full w-[340px] bg-background border-l border-border/40 dark:border-white/[0.08] z-40 flex flex-col shadow-xl">
      <div className="px-4 py-3 border-b border-border/40 dark:border-white/[0.08] flex items-center justify-between shrink-0">
        <h3 className="text-[13px] font-semibold text-foreground">Edit Employee</h3>
        <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-colors"><XCircle className="h-4 w-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Avatar */}
        <div className="flex justify-center">
          <AgentAvatar name={agent.agentName} gradient={agent.agentGradient} avatar={agent.agentAvatar} size="lg" />
        </div>
        {/* Name */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-1.5 block">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-border/50 dark:border-white/[0.08] bg-muted/20 dark:bg-white/[0.03] text-sm text-foreground outline-none focus:border-primary/30 transition-colors" />
        </div>
        {/* Role */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-1.5 block">Role</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-border/50 dark:border-white/[0.08] bg-muted/20 dark:bg-white/[0.03] text-sm text-foreground outline-none focus:border-primary/30 transition-colors" />
        </div>
        {/* Trust */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-1.5 block">Trust Level</label>
          <div className="flex items-center gap-2">
            <div className={cn("h-2.5 w-2.5 rounded-full", agent.trustLevel === 0 ? "bg-red-400" : agent.trustLevel === 1 ? "bg-amber-400" : agent.trustLevel === 2 ? "bg-blue-400" : "bg-emerald-400")} />
            <span className="text-sm text-foreground">{TRUST_LABEL[agent.trustLevel]}</span>
          </div>
        </div>
        {/* Connected Services */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2 block">Connected Services ({services.length})</label>
          <div className="grid grid-cols-2 gap-1.5 max-h-[280px] overflow-y-auto">
            {allServices.map((s) => {
              const display = SERVICE_DISPLAY[s];
              if (!display) return null;
              const isActive = services.includes(s);
              return (
                <button key={s} onClick={() => toggleService(s)} className={cn("flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all text-[12px]", isActive ? "bg-primary/10 border border-primary/20 text-foreground" : "bg-muted/20 dark:bg-white/[0.02] border border-border/30 dark:border-white/[0.06] text-muted-foreground/60 hover:text-foreground hover:border-border/50")}>
                  {isActive && <CheckCircle className="h-3 w-3 text-primary shrink-0" />}
                  <span className="truncate">{display.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="p-4 border-t border-border/40 dark:border-white/[0.08] shrink-0">
        <button className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors">Save Changes</button>
      </div>
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState(CONVERSATIONS[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [showMenu, setShowMenu] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const selected = CONVERSATIONS.find((c) => c.id === selectedId)!;
  const isPinned = pinnedIds.has(selectedId);
  const filtered = searchQuery
    ? CONVERSATIONS.filter((c) => c.agentName.toLowerCase().includes(searchQuery.toLowerCase()) || c.agentRole.toLowerCase().includes(searchQuery.toLowerCase()))
    : CONVERSATIONS;

  // Sort: pinned first
  const sorted = [...filtered].sort((a, b) => {
    const aPinned = pinnedIds.has(a.id) ? 0 : 1;
    const bPinned = pinnedIds.has(b.id) ? 0 : 1;
    return aPinned - bPinned;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId]);

  // Close menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMessageInput(val);
    const lastLine = val.split("\n").pop() || "";
    setShowCommands(lastLine.startsWith("/") && !lastLine.includes(" "));
  }, []);

  const handleCommandSelect = useCallback((cmd: string) => {
    setMessageInput(cmd);
    setShowCommands(false);
    inputRef.current?.focus();
  }, []);

  const togglePin = useCallback(() => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(selectedId)) next.delete(selectedId);
      else next.add(selectedId);
      return next;
    });
  }, [selectedId]);

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div className="w-[340px] shrink-0 border-r border-border/40 dark:border-white/[0.08] flex flex-col">
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-foreground">Messages</h1>
            <span className="text-xs font-medium px-2 py-1 rounded-lg bg-primary/10 text-primary">{CONVERSATIONS.reduce((sum, c) => sum + c.unread, 0)} new</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <input type="text" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-9 pl-9 pr-3 rounded-xl border border-border/50 dark:border-white/[0.08] bg-muted/30 dark:bg-white/[0.03] text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/30 transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {sorted.map((conv) => (
            <button key={conv.id} onClick={() => { setSelectedId(conv.id); setShowEditPanel(false); }} className={cn("w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left", selectedId === conv.id ? "bg-primary/[0.08] dark:bg-white/[0.08]" : "hover:bg-muted/40 dark:hover:bg-white/[0.04]")}>
              <div className="relative shrink-0">
                <AgentAvatar name={conv.agentName} gradient={conv.agentGradient} avatar={conv.agentAvatar} size="lg" />
                <div className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-background", STATUS_COLOR[conv.status])} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    {pinnedIds.has(conv.id) && <Pin className="h-2.5 w-2.5 text-primary/60 shrink-0" />}
                    <span className="text-[13px] font-medium text-foreground truncate">{conv.agentName}</span>
                    <Bot className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 shrink-0 ml-2">{conv.lastTime}</span>
                </div>
                <p className="text-[10px] text-muted-foreground/40 mb-0.5">{conv.agentRole} · {TRUST_LABEL[conv.trustLevel]} · {conv.services.length} services</p>
                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-muted-foreground/70 truncate pr-2">{conv.lastMessage}</p>
                  {conv.unread > 0 && <span className="shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">{conv.unread}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Chat header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-border/40 dark:border-white/[0.08] shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <AgentAvatar name={selected.agentName} gradient={selected.agentGradient} avatar={selected.agentAvatar} />
              <div className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background", STATUS_COLOR[selected.status])} />
            </div>
            <div>
              <div className="flex items-center gap-2"><h2 className="text-sm font-semibold text-foreground">{selected.agentName}</h2><Bot className="h-3 w-3 text-muted-foreground/40" /></div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                <span>{selected.agentRole}</span><span className="text-muted-foreground/20">|</span><span>{TRUST_LABEL[selected.trustLevel]}</span><span className="text-muted-foreground/20">|</span><span>{selected.services.length} services</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Pin button */}
            <button onClick={togglePin} className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-colors", isPinned ? "text-primary bg-primary/10" : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 dark:hover:bg-white/[0.06]")} title={isPinned ? "Unpin conversation" : "Pin conversation"}>
              <Pin className="h-4 w-4" />
            </button>
            {/* More menu */}
            <div className="relative" ref={menuRef}>
              <button onClick={() => setShowMenu(!showMenu)} className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-colors", showMenu ? "text-foreground bg-muted/40" : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 dark:hover:bg-white/[0.06]")}>
                <MoreHorizontal className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }} className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-border/50 dark:border-white/[0.1] bg-background/95 backdrop-blur-xl shadow-xl z-50 py-1 overflow-hidden">
                    <button onClick={() => { setShowEditPanel(true); setShowMenu(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-muted/40 dark:hover:bg-white/[0.06] transition-colors text-left">
                      <FileCode className="h-3.5 w-3.5 text-muted-foreground/60" /> Edit Employee
                    </button>
                    <button onClick={() => { togglePin(); setShowMenu(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-muted/40 dark:hover:bg-white/[0.06] transition-colors text-left">
                      <Pin className="h-3.5 w-3.5 text-muted-foreground/60" /> {isPinned ? "Unpin" : "Pin"} Conversation
                    </button>
                    <button onClick={() => setShowMenu(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-muted/40 dark:hover:bg-white/[0.06] transition-colors text-left">
                      <Shield className="h-3.5 w-3.5 text-muted-foreground/60" /> View Permissions
                    </button>
                    <button onClick={() => setShowMenu(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-muted/40 dark:hover:bg-white/[0.06] transition-colors text-left">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground/60" /> View Audit Log
                    </button>
                    <div className="my-1 border-t border-border/30 dark:border-white/[0.06]" />
                    <button onClick={() => setShowMenu(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-500 hover:bg-red-500/10 transition-colors text-left">
                      <AlertTriangle className="h-3.5 w-3.5" /> Terminate Employee
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {selected.messages.map((msg, i) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02, duration: 0.2 }}>
              <MessageBubble msg={msg} agentName={selected.agentName} agentGradient={selected.agentGradient} agentAvatar={selected.agentAvatar} />
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/40 dark:border-white/[0.08]">
          <div className="relative">
            <AnimatePresence>{showCommands && <SlashCommandPalette query={messageInput} onSelect={handleCommandSelect} services={selected.services} />}</AnimatePresence>
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea ref={inputRef} value={messageInput} onChange={handleInputChange} placeholder={`Message ${selected.agentName}... or type / for commands`} rows={1} className="w-full resize-none rounded-xl border border-border/50 dark:border-white/[0.08] bg-muted/20 dark:bg-white/[0.03] px-4 py-3 pr-20 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/30 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); setMessageInput(""); setShowCommands(false); }
                    if (e.key === "Escape") setShowCommands(false);
                  }}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <button onClick={() => { setMessageInput("/"); setShowCommands(true); inputRef.current?.focus(); }} className={cn("h-7 w-7 rounded-lg flex items-center justify-center transition-colors", showCommands ? "text-primary bg-primary/10" : "text-muted-foreground/40 hover:text-muted-foreground")}><Slash className="h-3.5 w-3.5" /></button>
                  <button className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground transition-colors"><Paperclip className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <button className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors shadow-sm" onClick={() => { setMessageInput(""); setShowCommands(false); }}><Send className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        {/* Edit Panel */}
        <AnimatePresence>
          {showEditPanel && <AgentEditPanel agent={selected} onClose={() => setShowEditPanel(false)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
