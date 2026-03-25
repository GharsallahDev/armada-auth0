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
  GitCommit,
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
  Table,
  Download,
  Copy,
  Play,
  ChevronRight,
  Cpu,
  Globe,
  Zap,
  ExternalLink,
  Code,
  RefreshCw,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Pin,
  Slash,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Message types ──────────────────────────────────────────────

type MessageType =
  | "text"
  | "code"
  | "table"
  | "approval_request"
  | "approval_resolved"
  | "deploy_status"
  | "pr_card"
  | "metric_card"
  | "file_attachment"
  | "command_result"
  | "alert"
  | "progress"
  | "thinking";

interface BaseMessage {
  id: string;
  sender: "user" | "agent" | "system";
  time: string;
  read: boolean;
}

interface TextMessage extends BaseMessage {
  type: "text";
  text: string;
}

interface CodeMessage extends BaseMessage {
  type: "code";
  text?: string;
  language: string;
  code: string;
  filename?: string;
}

interface TableMessage extends BaseMessage {
  type: "table";
  text?: string;
  headers: string[];
  rows: string[][];
  footer?: string;
}

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

interface DeployStatusMessage extends BaseMessage {
  type: "deploy_status";
  environment: string;
  status: "building" | "deploying" | "success" | "failed" | "rollback";
  commit: string;
  branch: string;
  duration?: string;
  url?: string;
  stages: { name: string; status: "done" | "running" | "pending" | "failed" }[];
}

interface PRCardMessage extends BaseMessage {
  type: "pr_card";
  title: string;
  prNumber: number;
  branch: string;
  additions: number;
  deletions: number;
  files: number;
  checks: { passed: number; total: number };
  reviewStatus: "pending" | "approved" | "changes_requested";
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

interface ThinkingMessage extends BaseMessage {
  type: "thinking";
  text: string;
}

type Message =
  | TextMessage
  | CodeMessage
  | TableMessage
  | ApprovalRequestMessage
  | ApprovalResolvedMessage
  | DeployStatusMessage
  | PRCardMessage
  | MetricCardMessage
  | FileAttachmentMessage
  | CommandResultMessage
  | AlertMessage
  | ProgressMessage
  | ThinkingMessage;

interface Conversation {
  id: string;
  agentName: string;
  agentRole: string;
  agentGradient: string;
  status: "online" | "busy" | "offline";
  trustLevel: number;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
}

// ── Commands ──────────────────────────────────────────────

interface SlashCommand {
  command: string;
  label: string;
  description: string;
  args?: string;
  icon: React.ReactNode;
}

const SLASH_COMMANDS: SlashCommand[] = [
  { command: "/deploy", label: "Deploy", description: "Deploy to an environment", args: "<env>", icon: <Play className="h-3.5 w-3.5" /> },
  { command: "/rollback", label: "Rollback", description: "Rollback last deployment", args: "<env>", icon: <RefreshCw className="h-3.5 w-3.5" /> },
  { command: "/status", label: "Status", description: "Get current task status", icon: <Eye className="h-3.5 w-3.5" /> },
  { command: "/run", label: "Run", description: "Execute a shell command", args: "<cmd>", icon: <Terminal className="h-3.5 w-3.5" /> },
  { command: "/analyze", label: "Analyze", description: "Run analysis on data or code", args: "<target>", icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { command: "/review", label: "Review", description: "Request code review on a PR", args: "<pr#>", icon: <GitPullRequest className="h-3.5 w-3.5" /> },
  { command: "/scan", label: "Scan", description: "Run security vulnerability scan", args: "[scope]", icon: <Shield className="h-3.5 w-3.5" /> },
  { command: "/report", label: "Report", description: "Generate a report", args: "<type>", icon: <FileCode className="h-3.5 w-3.5" /> },
  { command: "/escalate", label: "Escalate", description: "Escalate to human supervisor", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  { command: "/trust", label: "Trust", description: "View or modify trust level", args: "[level]", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { command: "/pause", label: "Pause", description: "Pause current agent tasks", icon: <Clock className="h-3.5 w-3.5" /> },
  { command: "/logs", label: "Logs", description: "Fetch recent activity logs", args: "[n]", icon: <Terminal className="h-3.5 w-3.5" /> },
];

// ── Static conversations ──────────────────────────────────

const CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    agentName: "Nova",
    agentRole: "Senior Engineer",
    agentGradient: "from-indigo-500 to-violet-500",
    status: "online",
    trustLevel: 3,
    lastMessage: "Deployment to staging complete",
    lastTime: "2m ago",
    unread: 2,
    messages: [
      { id: "m1", sender: "agent", type: "text", text: "Good morning! Starting code review for PR #234. Found 3 issues so far.", time: "9:00 AM", read: true },
      { id: "m2", sender: "agent", type: "pr_card", title: "fix: resolve WebSocket memory leak in event handler", prNumber: 234, branch: "fix/ws-memory-leak", additions: 47, deletions: 12, files: 3, checks: { passed: 44, total: 47 }, reviewStatus: "changes_requested", time: "9:01 AM", read: true },
      { id: "m3", sender: "user", type: "text", text: "What kind of issues?", time: "9:05 AM", read: true },
      { id: "m4", sender: "agent", type: "code", text: "The main issue — WebSocket handler never cleans up listeners on disconnect:", language: "typescript", filename: "src/handlers/ws.ts", code: `// Before (leaks)\nws.on('message', handler)\n\n// After (fixed)\nws.on('message', handler)\nws.on('close', () => {\n  ws.removeAllListeners()\n  connectionPool.delete(ws.id)\n})`, time: "9:06 AM", read: true },
      { id: "m5", sender: "user", type: "text", text: "/run npm test", time: "9:10 AM", read: true },
      { id: "m6", sender: "agent", type: "command_result", command: "npm test", output: "Test Suites: 12 passed, 12 total\nTests:       47 passed, 47 total\nSnapshots:   0 total\nTime:        4.832s\nRan all test suites.", exitCode: 0, time: "9:15 AM", read: true },
      { id: "m7", sender: "user", type: "text", text: "/deploy staging", time: "9:20 AM", read: true },
      { id: "m8", sender: "agent", type: "deploy_status", environment: "staging", status: "success", commit: "a3f7c2d", branch: "fix/ws-memory-leak", duration: "2m 14s", url: "https://staging.armada.dev", stages: [
        { name: "Build", status: "done" },
        { name: "Test", status: "done" },
        { name: "Deploy", status: "done" },
        { name: "Health Check", status: "done" },
      ], time: "9:24 AM", read: false },
      { id: "m9", sender: "agent", type: "alert", severity: "warning", title: "Dependency Alert", text: "express 4.19.2 has a security patch (CVE-2024-XXXX). Priority: medium. Should I create a separate PR?", time: "9:25 AM", read: false },
    ],
  },
  {
    id: "conv-2",
    agentName: "Atlas",
    agentRole: "Data Analyst",
    agentGradient: "from-emerald-500 to-teal-500",
    status: "busy",
    trustLevel: 2,
    lastMessage: "Q1 report ready for review",
    lastTime: "15m ago",
    unread: 1,
    messages: [
      { id: "m1", sender: "user", type: "text", text: "/analyze Q1 revenue by region", time: "8:30 AM", read: true },
      { id: "m2", sender: "agent", type: "thinking", text: "Pulling data from analytics warehouse... Processing 1.2M rows across 4 regions.", time: "8:31 AM", read: true },
      { id: "m3", sender: "agent", type: "table", text: "Q1 Revenue Breakdown by Region", headers: ["Region", "Revenue", "YoY Growth", "Deals Closed"], rows: [
        ["North America", "$4.2M", "+12%", "134"],
        ["Europe", "$2.8M", "+8%", "89"],
        ["APAC", "$1.9M", "+23%", "67"],
        ["LATAM", "$680K", "+5%", "28"],
      ], footer: "Total: $9.58M | Avg Growth: +12%", time: "8:37 AM", read: true },
      { id: "m4", sender: "user", type: "text", text: "APAC growth is impressive. Dig deeper.", time: "8:40 AM", read: true },
      { id: "m5", sender: "agent", type: "metric_card", text: "APAC Sub-region Performance", metrics: [
        { label: "Japan", value: "$820K", change: "+18%", trend: "up" },
        { label: "Australia", value: "$440K", change: "+31%", trend: "up" },
        { label: "Singapore", value: "$340K", change: "+28%", trend: "up" },
        { label: "India", value: "$300K", change: "+19%", trend: "up" },
      ], time: "8:45 AM", read: true },
      { id: "m6", sender: "agent", type: "text", text: "Australia and Singapore are the standout performers — both driven by enterprise deals closed in February. Australia had 3 deals over $100K.", time: "8:46 AM", read: true },
      { id: "m7", sender: "agent", type: "file_attachment", filename: "Q1_Revenue_Report_2026.pdf", filesize: "2.4 MB", filetype: "pdf", text: "Full report generated with charts and executive summary.", time: "8:50 AM", read: false },
    ],
  },
  {
    id: "conv-3",
    agentName: "Cipher",
    agentRole: "Security Analyst",
    agentGradient: "from-rose-500 to-pink-500",
    status: "online",
    trustLevel: 2,
    lastMessage: "2 vulnerabilities found",
    lastTime: "1h ago",
    unread: 0,
    messages: [
      { id: "m1", sender: "user", type: "text", text: "/scan production", time: "7:00 AM", read: true },
      { id: "m2", sender: "agent", type: "progress", task: "Production Security Scan", percent: 100, steps: [
        { label: "Port scan (443 endpoints)", done: true },
        { label: "TLS configuration audit", done: true },
        { label: "Dependency vulnerability check", done: true },
        { label: "API rate limit verification", done: true },
        { label: "Auth flow penetration test", done: true },
      ], time: "7:40 AM", read: true },
      { id: "m3", sender: "agent", type: "alert", severity: "error", title: "TLS Misconfiguration", text: "api-gateway still accepts TLS 1.1 connections. This is below PCI-DSS compliance threshold. Recommend immediate remediation.", time: "7:41 AM", read: true },
      { id: "m4", sender: "agent", type: "alert", severity: "warning", title: "Missing Rate Limiting", text: "/api/v2/search has no rate limiting configured. Current traffic: ~200 req/min. Susceptible to abuse.", time: "7:42 AM", read: true },
      { id: "m5", sender: "agent", type: "approval_request", action: "Create JIRA tickets for vulnerabilities", service: "Jira", risk: "low", details: "Will create 2 tickets: SEC-441 (TLS - Critical) and SEC-442 (Rate Limit - Medium) in the Security backlog with auto-assigned priority.", status: "pending", time: "7:43 AM", read: true },
      { id: "m6", sender: "user", type: "text", text: "Approved. Assign both as high priority.", time: "7:50 AM", read: true },
      { id: "m7", sender: "agent", type: "approval_resolved", action: "Create JIRA tickets", approved: true, resolvedBy: "You", time: "7:50 AM", read: true },
      { id: "m8", sender: "agent", type: "command_result", command: "jira create --project SEC --type Bug --priority High", output: "Created SEC-441: TLS 1.1 enabled on api-gateway (Critical)\nCreated SEC-442: Missing rate limit on /api/v2/search (High)\nBoth assigned to @cipher with due date 2026-03-28", exitCode: 0, time: "7:52 AM", read: true },
    ],
  },
  {
    id: "conv-4",
    agentName: "Pixel",
    agentRole: "UI Designer",
    agentGradient: "from-amber-500 to-orange-500",
    status: "offline",
    trustLevel: 1,
    lastMessage: "3 mockup variants ready",
    lastTime: "3h ago",
    unread: 0,
    messages: [
      { id: "m1", sender: "user", type: "text", text: "We need a redesign for the analytics dashboard. Focus on data density.", time: "6:00 AM", read: true },
      { id: "m2", sender: "agent", type: "thinking", text: "Analyzing current dashboard layout... Benchmarking against Datadog, Grafana, and Linear dashboards for data density patterns.", time: "6:02 AM", read: true },
      { id: "m3", sender: "agent", type: "text", text: "I'll create 3 variants. Here's my approach for each:", time: "6:05 AM", read: true },
      { id: "m4", sender: "agent", type: "table", headers: ["Variant", "Style", "Data Density", "Best For"], rows: [
        ["A — Minimal", "Large cards, lots of whitespace", "Low", "Executive overview"],
        ["B — Dense", "Compact grid, sparklines, mini-charts", "High", "Power users & ops"],
        ["C — Hybrid", "Collapsible sections, progressive disclosure", "Adaptive", "Mixed audiences"],
      ], time: "6:06 AM", read: true },
      { id: "m5", sender: "agent", type: "file_attachment", filename: "dashboard_variants_v1.fig", filesize: "8.1 MB", filetype: "figma", text: "All 3 variants with component specs and responsive breakpoints.", time: "8:10 AM", read: true },
      { id: "m6", sender: "agent", type: "metric_card", text: "Variant Comparison", metrics: [
        { label: "Variant A", value: "6 widgets", change: "40% whitespace", trend: "down" },
        { label: "Variant B", value: "14 widgets", change: "12% whitespace", trend: "up" },
        { label: "Variant C", value: "10 widgets", change: "22% whitespace", trend: "flat" },
      ], time: "8:11 AM", read: true },
    ],
  },
  {
    id: "conv-5",
    agentName: "Relay",
    agentRole: "Support Agent",
    agentGradient: "from-sky-500 to-blue-500",
    status: "online",
    trustLevel: 1,
    lastMessage: "4 auth tickets escalated",
    lastTime: "5h ago",
    unread: 0,
    messages: [
      { id: "m1", sender: "agent", type: "metric_card", text: "Daily Support Summary", metrics: [
        { label: "Resolved", value: "23", change: "+4 vs avg", trend: "up" },
        { label: "Avg Response", value: "2.3m", change: "-0.8m", trend: "up" },
        { label: "CSAT", value: "4.8/5", change: "+0.2", trend: "up" },
        { label: "Escalated", value: "4", change: "+2", trend: "down" },
      ], time: "5:00 PM", read: true },
      { id: "m2", sender: "agent", type: "alert", severity: "warning", title: "Escalation Cluster Detected", text: "4 tickets in the last 2 hours all relate to OAuth token refresh failures. Possibly a systemic issue.", time: "5:01 PM", read: true },
      { id: "m3", sender: "user", type: "text", text: "Show me the escalated tickets.", time: "5:10 PM", read: true },
      { id: "m4", sender: "agent", type: "table", headers: ["Ticket", "Customer", "Issue", "Priority"], rows: [
        ["#4821", "Acme Corp", "Token refresh returns 401 after password reset", "High"],
        ["#4823", "Globex Inc", "SSO loop after IdP session timeout", "High"],
        ["#4825", "Initech", "Refresh token expired despite remember-me", "Medium"],
        ["#4827", "Umbrella Co", "Silent auth fails in Safari 18", "Medium"],
      ], time: "5:11 PM", read: true },
      { id: "m5", sender: "agent", type: "approval_request", action: "Notify engineering on-call about auth regression", service: "PagerDuty", risk: "medium", details: "This appears to be a systemic regression affecting OAuth token refresh. 4 customers impacted in the last 2 hours. Recommending P2 incident.", status: "approved", time: "5:12 PM", read: true },
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
          <button
            onClick={() => { navigator.clipboard.writeText(msg.code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-1"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="p-3 text-[12px] leading-relaxed font-mono text-gray-300 overflow-x-auto scrollbar-none">
          <code>{msg.code}</code>
        </pre>
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
            <thead>
              <tr className="bg-muted/30 dark:bg-white/[0.04]">
                {msg.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-semibold text-muted-foreground/80 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {msg.rows.map((row, i) => (
                <tr key={i} className="border-t border-border/20 dark:border-white/[0.04]">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-foreground/80 whitespace-nowrap">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {msg.footer && (
          <div className="px-3 py-2 border-t border-border/20 dark:border-white/[0.04] bg-muted/20 dark:bg-white/[0.02] text-[11px] text-muted-foreground/60 font-medium">
            {msg.footer}
          </div>
        )}
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
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-500" />
          <span className="text-[13px] font-semibold text-foreground">Approval Required</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-md", riskColors[msg.risk])}>{msg.risk} risk</span>
          {statusIcons[msg.status]}
        </div>
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-2 text-[12px]">
          <span className="text-muted-foreground/60">Action:</span>
          <span className="text-foreground font-medium">{msg.action}</span>
        </div>
        <div className="flex items-center gap-2 text-[12px]">
          <span className="text-muted-foreground/60">Service:</span>
          <span className="text-foreground font-medium">{msg.service}</span>
        </div>
        <p className="text-[12px] text-muted-foreground/70 leading-relaxed">{msg.details}</p>
        {msg.status === "pending" && (
          <div className="flex items-center gap-2 pt-1">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-[12px] font-medium hover:bg-emerald-600 transition-colors">
              <CheckCircle className="h-3 w-3" /> Approve
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 dark:bg-white/[0.06] text-foreground text-[12px] font-medium hover:bg-muted dark:hover:bg-white/[0.1] transition-colors border border-border/40 dark:border-white/[0.08]">
              <XCircle className="h-3 w-3" /> Deny
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ApprovalResolvedBlock({ msg }: { msg: ApprovalResolvedMessage }) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg text-[12px]",
      msg.approved ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
    )}>
      {msg.approved ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      <span className="font-medium">{msg.action}</span>
      <span className="text-muted-foreground/60">—</span>
      <span>{msg.approved ? "Approved" : "Denied"} by {msg.resolvedBy}</span>
    </div>
  );
}

function DeployStatusBlock({ msg }: { msg: DeployStatusMessage }) {
  const statusConfig = {
    building: { color: "text-amber-500", bg: "bg-amber-500/10", label: "Building" },
    deploying: { color: "text-blue-500", bg: "bg-blue-500/10", label: "Deploying" },
    success: { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Deployed" },
    failed: { color: "text-red-500", bg: "bg-red-500/10", label: "Failed" },
    rollback: { color: "text-orange-500", bg: "bg-orange-500/10", label: "Rolled Back" },
  };
  const config = statusConfig[msg.status];
  const stageIcons = { done: <CheckCircle className="h-3 w-3 text-emerald-500" />, running: <RefreshCw className="h-3 w-3 text-blue-500 animate-spin" />, pending: <Circle className="h-3 w-3 text-muted-foreground/30" />, failed: <XCircle className="h-3 w-3 text-red-500" /> };

  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between bg-muted/20 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Zap className={cn("h-4 w-4", config.color)} />
          <span className="text-[13px] font-semibold text-foreground">Deployment</span>
          <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-md", config.bg, config.color)}>{config.label}</span>
        </div>
        {msg.duration && <span className="text-[11px] text-muted-foreground/50">{msg.duration}</span>}
      </div>
      <div className="px-4 py-3 space-y-3">
        <div className="grid grid-cols-3 gap-3 text-[12px]">
          <div>
            <span className="text-muted-foreground/50 block">Environment</span>
            <span className="text-foreground font-medium capitalize">{msg.environment}</span>
          </div>
          <div>
            <span className="text-muted-foreground/50 block">Branch</span>
            <span className="text-foreground font-mono text-[11px]">{msg.branch}</span>
          </div>
          <div>
            <span className="text-muted-foreground/50 block">Commit</span>
            <span className="text-foreground font-mono text-[11px]">{msg.commit}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {msg.stages.map((stage, i) => (
            <div key={i} className="flex items-center gap-1">
              {stageIcons[stage.status]}
              <span className="text-[11px] text-muted-foreground/70">{stage.name}</span>
              {i < msg.stages.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/20 mx-0.5" />}
            </div>
          ))}
        </div>
        {msg.url && (
          <a href="#" className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline">
            <ExternalLink className="h-3 w-3" /> {msg.url}
          </a>
        )}
      </div>
    </div>
  );
}

function PRCardBlock({ msg }: { msg: PRCardMessage }) {
  const reviewColors = { pending: "text-amber-500 bg-amber-500/10", approved: "text-emerald-500 bg-emerald-500/10", changes_requested: "text-orange-500 bg-orange-500/10" };
  const reviewLabels = { pending: "Review Pending", approved: "Approved", changes_requested: "Changes Requested" };
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-3 flex items-start justify-between">
        <div className="flex items-start gap-2.5">
          <GitPullRequest className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[13px] font-medium text-foreground">{msg.title}</p>
            <p className="text-[11px] text-muted-foreground/50 font-mono mt-0.5">#{msg.prNumber} · {msg.branch}</p>
          </div>
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0", reviewColors[msg.reviewStatus])}>{reviewLabels[msg.reviewStatus]}</span>
      </div>
      <div className="px-4 py-2.5 border-t border-border/20 dark:border-white/[0.04] bg-muted/10 dark:bg-white/[0.01] flex items-center gap-4 text-[11px] text-muted-foreground/60">
        <span className="text-emerald-500 font-mono">+{msg.additions}</span>
        <span className="text-red-500 font-mono">-{msg.deletions}</span>
        <span>{msg.files} files</span>
        <span className="ml-auto">{msg.checks.passed}/{msg.checks.total} checks passed</span>
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
              {m.change && (
                <div className="flex items-center gap-0.5">
                  {m.trend && trendIcons[m.trend]}
                  <span className={cn("text-[11px] font-medium", m.trend === "up" ? "text-emerald-500" : m.trend === "down" ? "text-red-500" : "text-muted-foreground/50")}>{m.change}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FileAttachmentBlock({ msg }: { msg: FileAttachmentMessage }) {
  const typeIcons: Record<string, string> = { pdf: "bg-red-500/10 text-red-500", figma: "bg-violet-500/10 text-violet-500", csv: "bg-emerald-500/10 text-emerald-500", zip: "bg-amber-500/10 text-amber-500" };
  const colors = typeIcons[msg.filetype] || "bg-muted/30 text-muted-foreground";
  return (
    <div className="space-y-1.5">
      {msg.text && <p className="text-[13px] text-foreground/90">{msg.text}</p>}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border/40 dark:border-white/[0.08] bg-muted/10 dark:bg-white/[0.02] hover:bg-muted/20 dark:hover:bg-white/[0.04] transition-colors cursor-pointer group">
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase shrink-0", colors)}>
          {msg.filetype}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-foreground truncate">{msg.filename}</p>
          <p className="text-[11px] text-muted-foreground/50">{msg.filesize}</p>
        </div>
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
        <span className={cn("ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded", msg.exitCode === 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
          exit {msg.exitCode}
        </span>
      </div>
      <pre className="p-3 text-[12px] leading-relaxed font-mono text-gray-400 overflow-x-auto scrollbar-none whitespace-pre-wrap">
        {msg.output}
      </pre>
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
      <div className="flex items-center gap-2 mb-1.5">
        <span className={c.color}>{c.icon}</span>
        <span className="text-[13px] font-semibold text-foreground">{msg.title}</span>
      </div>
      <p className="text-[12px] text-foreground/70 leading-relaxed">{msg.text}</p>
    </div>
  );
}

function ProgressBlock({ msg }: { msg: ProgressMessage }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-foreground">{msg.task}</span>
        <span className="text-[12px] text-primary font-bold">{msg.percent}%</span>
      </div>
      <div className="mx-4 mb-3 h-1.5 rounded-full bg-muted/30 dark:bg-white/[0.06] overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-500" style={{ width: `${msg.percent}%` }} />
      </div>
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

// ── Message renderer ──────────────────────────────────────────

function MessageBubble({ msg, agentName, agentGradient }: { msg: Message; agentName: string; agentGradient: string }) {
  const isUser = msg.sender === "user";
  const isRichAgent = !isUser && msg.type !== "text";

  if (msg.sender === "system") return null;

  // User text messages
  if (isUser) {
    const isCommand = msg.type === "text" && (msg as TextMessage).text.startsWith("/");
    return (
      <div className="flex justify-end">
        <div className={cn(
          "max-w-[70%] rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] leading-relaxed",
          isCommand
            ? "bg-[#0d1117] dark:bg-black/60 text-gray-300 font-mono border border-border/20 dark:border-white/[0.06]"
            : "bg-primary text-primary-foreground"
        )}>
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

  // Agent messages
  return (
    <div className="flex items-start gap-2.5">
      <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br shrink-0 mt-0.5", agentGradient)}>
        {agentName[0]}
      </div>
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
        {msg.type === "deploy_status" && <DeployStatusBlock msg={msg as DeployStatusMessage} />}
        {msg.type === "pr_card" && <PRCardBlock msg={msg as PRCardMessage} />}
        {msg.type === "metric_card" && <MetricCardBlock msg={msg as MetricCardMessage} />}
        {msg.type === "file_attachment" && <FileAttachmentBlock msg={msg as FileAttachmentMessage} />}
        {msg.type === "command_result" && <CommandResultBlock msg={msg as CommandResultMessage} />}
        {msg.type === "alert" && <AlertBlock msg={msg as AlertMessage} />}
        {msg.type === "progress" && <ProgressBlock msg={msg as ProgressMessage} />}
        {msg.type === "thinking" && <ThinkingBlock msg={msg as ThinkingMessage} />}
        {msg.type !== "text" && <p className="text-[10px] text-muted-foreground/30 px-1">{msg.time}</p>}
      </div>
    </div>
  );
}

// ── Slash command palette ──────────────────────────────────

function CommandPalette({ query, onSelect }: { query: string; onSelect: (cmd: string) => void }) {
  const search = query.slice(1).toLowerCase();
  const filtered = SLASH_COMMANDS.filter(
    (c) => c.command.toLowerCase().includes(search) || c.label.toLowerCase().includes(search)
  );

  if (filtered.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-border/50 dark:border-white/[0.1] bg-background/95 backdrop-blur-xl shadow-xl overflow-hidden z-50"
    >
      <div className="px-3 py-2 border-b border-border/30 dark:border-white/[0.06]">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Commands</p>
      </div>
      <div className="max-h-[240px] overflow-y-auto py-1">
        {filtered.map((cmd) => (
          <button
            key={cmd.command}
            onClick={() => onSelect(cmd.command + " ")}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/40 dark:hover:bg-white/[0.06] transition-colors text-left"
          >
            <div className="h-7 w-7 rounded-lg bg-muted/40 dark:bg-white/[0.06] flex items-center justify-center text-muted-foreground/60 shrink-0">
              {cmd.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-foreground">{cmd.command}</span>
                {cmd.args && <span className="text-[11px] text-muted-foreground/40 font-mono">{cmd.args}</span>}
              </div>
              <p className="text-[11px] text-muted-foreground/50">{cmd.description}</p>
            </div>
          </button>
        ))}
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const selected = CONVERSATIONS.find((c) => c.id === selectedId)!;
  const filtered = searchQuery
    ? CONVERSATIONS.filter(
        (c) =>
          c.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.agentRole.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : CONVERSATIONS;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMessageInput(val);
    // Show commands when typing / at the start or after a newline
    const lastLine = val.split("\n").pop() || "";
    setShowCommands(lastLine.startsWith("/") && !lastLine.includes(" "));
  }, []);

  const handleCommandSelect = useCallback((cmd: string) => {
    setMessageInput(cmd);
    setShowCommands(false);
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div className="w-[340px] shrink-0 border-r border-border/40 dark:border-white/[0.08] flex flex-col">
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-foreground">Messages</h1>
            <span className="text-xs font-medium px-2 py-1 rounded-lg bg-primary/10 text-primary">
              {CONVERSATIONS.reduce((sum, c) => sum + c.unread, 0)} new
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-border/50 dark:border-white/[0.08] bg-muted/30 dark:bg-white/[0.03] text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/30 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left",
                selectedId === conv.id
                  ? "bg-primary/[0.08] dark:bg-white/[0.08]"
                  : "hover:bg-muted/40 dark:hover:bg-white/[0.04]"
              )}
            >
              <div className="relative shrink-0">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br shadow-sm", conv.agentGradient)}>
                  {conv.agentName[0]}
                </div>
                <div className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-background", STATUS_COLOR[conv.status])} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-medium text-foreground truncate">{conv.agentName}</span>
                    <Bot className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 shrink-0 ml-2">{conv.lastTime}</span>
                </div>
                <p className="text-[10px] text-muted-foreground/40 mb-0.5">{conv.agentRole} · {TRUST_LABEL[conv.trustLevel]}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-muted-foreground/70 truncate pr-2">{conv.lastMessage}</p>
                  {conv.unread > 0 && (
                    <span className="shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-border/40 dark:border-white/[0.08] shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br", selected.agentGradient)}>
                {selected.agentName[0]}
              </div>
              <div className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background", STATUS_COLOR[selected.status])} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">{selected.agentName}</h2>
                <Bot className="h-3 w-3 text-muted-foreground/40" />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                <span>{selected.agentRole}</span>
                <span className="text-muted-foreground/20">|</span>
                <span>{TRUST_LABEL[selected.trustLevel]}</span>
                <span className="text-muted-foreground/20">|</span>
                <span className="capitalize">{selected.status}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 dark:hover:bg-white/[0.06] transition-colors">
              <Pin className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 dark:hover:bg-white/[0.06] transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {selected.messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.2 }}
            >
              <MessageBubble msg={msg} agentName={selected.agentName} agentGradient={selected.agentGradient} />
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/40 dark:border-white/[0.08]">
          <div className="relative">
            <AnimatePresence>
              {showCommands && <CommandPalette query={messageInput} onSelect={handleCommandSelect} />}
            </AnimatePresence>
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder={`Message ${selected.agentName}... or type / for commands`}
                  rows={1}
                  className="w-full resize-none rounded-xl border border-border/50 dark:border-white/[0.08] bg-muted/20 dark:bg-white/[0.03] px-4 py-3 pr-20 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/30 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      setMessageInput("");
                      setShowCommands(false);
                    }
                    if (e.key === "Escape") {
                      setShowCommands(false);
                    }
                  }}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <button
                    onClick={() => { setMessageInput("/"); setShowCommands(true); inputRef.current?.focus(); }}
                    className={cn("h-7 w-7 rounded-lg flex items-center justify-center transition-colors", showCommands ? "text-primary bg-primary/10" : "text-muted-foreground/40 hover:text-muted-foreground")}
                  >
                    <Slash className="h-3.5 w-3.5" />
                  </button>
                  <button className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    <Paperclip className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <button
                className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors shadow-sm"
                onClick={() => { setMessageInput(""); setShowCommands(false); }}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
