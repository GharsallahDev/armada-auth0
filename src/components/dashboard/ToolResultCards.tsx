"use client";

import { useState } from "react";
import {
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  Send,
  Eye,
  Globe,
  Cpu,
  TrendingUp,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  PenLine,
  Reply,
  Forward,
  Paperclip,
  MailCheck,
  MailPlus,
  Hash,
  Users,
  MessageSquare,
  Gamepad2,
  Linkedin,
  UserCircle,
  Briefcase,
  Link2,
  ShoppingBag,
  Package,
  DollarSign,
  Receipt,
  CreditCard,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────

function safeArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "error" in (data as Record<string, unknown>)) return [];
  return [];
}

function truncate(str: string, max: number) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "..." : str;
}

function formatDate(d: string | undefined) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return d;
  }
}

// ── Error / Trust Cards ─────────────────────────────────

function TrustErrorCard({ result }: { result: { error: string } }) {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3">
      <div className="flex items-center gap-2 mb-1.5">
        <Shield className="h-4 w-4 text-amber-500" />
        <span className="text-[13px] font-semibold text-foreground">Trust Level Required</span>
      </div>
      <p className="text-[12px] text-foreground/70 leading-relaxed">{result.error}</p>
    </div>
  );
}

function CibaRequiredCard({ result }: { result: { message: string; action?: string; service?: string } }) {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-amber-500/10">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-500" />
          <span className="text-[13px] font-semibold text-foreground">Approval Required</span>
        </div>
        <Clock className="h-3.5 w-3.5 text-amber-500" />
      </div>
      <div className="px-4 py-3 space-y-2">
        {result.action && (
          <div className="flex items-center gap-2 text-[12px]">
            <span className="text-muted-foreground/60">Action:</span>
            <span className="text-foreground font-medium">{result.action}</span>
          </div>
        )}
        {result.service && (
          <div className="flex items-center gap-2 text-[12px]">
            <span className="text-muted-foreground/60">Service:</span>
            <span className="text-foreground font-medium">{result.service}</span>
          </div>
        )}
        <p className="text-[12px] text-muted-foreground/70 leading-relaxed">{result.message}</p>
      </div>
    </div>
  );
}

function ErrorCard({ error }: { error: string }) {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <XCircle className="h-4 w-4 text-red-500" />
        <span className="text-[13px] font-semibold text-foreground">Error</span>
      </div>
      <p className="text-[12px] text-red-400/80 leading-relaxed">{error}</p>
    </div>
  );
}

// ── Gmail Cards ────────────────────────────────────────

interface EmailItem {
  id?: string;
  from?: string;
  subject?: string;
  snippet?: string;
  date?: string;
  unread?: boolean;
  body?: string;
  to?: string;
  labels?: string[];
}

function parseSender(from: string | undefined): { name: string; email: string } {
  if (!from) return { name: "Unknown", email: "" };
  const match = from.match(/^"?(.+?)"?\s*<(.+?)>$/);
  if (match) return { name: match[1].trim(), email: match[2] };
  if (from.includes("@")) return { name: from.split("@")[0], email: from };
  return { name: from, email: "" };
}

function senderInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

const SENDER_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-blue-500",
  "from-teal-500 to-green-500",
  "from-red-500 to-orange-500",
];

function senderColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) | 0;
  return SENDER_COLORS[Math.abs(hash) % SENDER_COLORS.length];
}

function EmailListCard({ emails }: { emails: EmailItem[] }) {
  const [showAll, setShowAll] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const shown = showAll ? emails : emails.slice(0, 5);
  const unreadCount = emails.filter((e) => e.unread).length;

  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Inbox</span>
          <span className="text-[10px] text-muted-foreground/40">{emails.length} emails</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">{unreadCount} new</span>
          )}
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">fetched</span>
      </div>
      <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
        {shown.map((email, i) => {
          const sender = parseSender(email.from);
          const isExpanded = expandedId === (email.id || String(i));
          const colorGrad = senderColor(sender.email || sender.name);

          return (
            <div key={email.id || i}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : (email.id || String(i)))}
                className={cn(
                  "w-full text-left px-4 py-3 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-all",
                  email.unread && "bg-primary/[0.03]",
                  isExpanded && "bg-muted/10 dark:bg-white/[0.02]"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Sender avatar */}
                  <div className={cn("h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 mt-0.5", colorGrad)}>
                    <span className="text-[11px] font-bold text-white">{senderInitial(sender.name)}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {email.unread && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                        <span className={cn("text-[12px] truncate", email.unread ? "font-semibold text-foreground" : "text-foreground/80")}>
                          {sender.name}
                        </span>
                        {sender.email && (
                          <span className="text-[10px] text-muted-foreground/40 truncate hidden sm:inline">{sender.email}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-muted-foreground/50">{formatDate(email.date)}</span>
                        {isExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground/40" /> : <ChevronDown className="h-3 w-3 text-muted-foreground/40" />}
                      </div>
                    </div>
                    <p className={cn("text-[12px] truncate", email.unread ? "font-medium text-foreground/90" : "text-foreground/70")}>
                      {email.subject || "(no subject)"}
                    </p>
                    {!isExpanded && email.snippet && (
                      <p className="text-[11px] text-muted-foreground/50 truncate mt-0.5">{truncate(email.snippet, 100)}</p>
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded detail */}
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: isExpanded ? "500px" : "0px",
                  opacity: isExpanded ? 1 : 0,
                }}
              >
                <div className="px-4 pb-3 pt-2 ml-11">
                  <div className="rounded-lg border border-border/20 dark:border-white/[0.04] bg-muted/10 dark:bg-white/[0.01] overflow-hidden max-w-full">
                    <div className="px-3 py-2 space-y-1 border-b border-border/15 dark:border-white/[0.03]">
                      <div className="flex gap-2 text-[11px]">
                        <span className="text-muted-foreground/50 w-10 shrink-0">From</span>
                        <span className="text-foreground/80 break-all">{email.from}</span>
                      </div>
                      {email.to && (
                        <div className="flex gap-2 text-[11px]">
                          <span className="text-muted-foreground/50 w-10 shrink-0">To</span>
                          <span className="text-foreground/70 break-all">{email.to}</span>
                        </div>
                      )}
                      <div className="flex gap-2 text-[11px]">
                        <span className="text-muted-foreground/50 w-10 shrink-0">Date</span>
                        <span className="text-foreground/70">{email.date}</span>
                      </div>
                      <div className="flex gap-2 text-[11px]">
                        <span className="text-muted-foreground/50 w-10 shrink-0">Subj</span>
                        <span className="text-foreground font-medium break-words">{email.subject}</span>
                      </div>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-[11px] text-foreground/70 leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                        {email.body || email.snippet || "No preview available"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {emails.length > 5 && (
        <button onClick={() => setShowAll(!showAll)} className="w-full px-4 py-2 text-[11px] text-primary font-medium hover:bg-muted/20 transition-colors flex items-center justify-center gap-1 border-t border-border/20 dark:border-white/[0.04]">
          {showAll ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> Show all {emails.length}</>}
        </button>
      )}
    </div>
  );
}

interface EmailDetail {
  id?: string;
  from?: string;
  to?: string;
  cc?: string;
  subject?: string;
  date?: string;
  body?: string;
  snippet?: string;
  labels?: string[];
  attachments?: { filename?: string; mimeType?: string; size?: number }[];
}

function EmailDetailCard({ email }: { email: EmailDetail }) {
  const [bodyExpanded, setBodyExpanded] = useState(false);
  const sender = parseSender(email.from);
  const colorGrad = senderColor(sender.email || sender.name);
  const body = email.body || email.snippet || "";
  const isLong = body.length > 500;
  const displayBody = isLong && !bodyExpanded ? body.slice(0, 500) + "..." : body;

  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Email</span>
        </div>
        <Eye className="h-3.5 w-3.5 text-muted-foreground/40" />
      </div>

      {/* Sender row */}
      <div className="px-4 py-3 flex items-start gap-3 border-b border-border/15 dark:border-white/[0.03]">
        <div className={cn("h-9 w-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0", colorGrad)}>
          <span className="text-[12px] font-bold text-white">{senderInitial(sender.name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[13px] font-semibold text-foreground">{sender.name}</span>
              {sender.email && <span className="text-[11px] text-muted-foreground/50 ml-1.5">&lt;{sender.email}&gt;</span>}
            </div>
            {email.date && <span className="text-[10px] text-muted-foreground/50 shrink-0">{formatDate(email.date)}</span>}
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-muted-foreground/50">
            {email.to && <span>To: {email.to}</span>}
            {email.cc && <span className="ml-2">Cc: {email.cc}</span>}
          </div>
        </div>
      </div>

      {/* Subject */}
      <div className="px-4 py-2.5 border-b border-border/10 dark:border-white/[0.02]">
        <p className="text-[13px] font-semibold text-foreground leading-snug">{email.subject || "(no subject)"}</p>
        {email.labels && email.labels.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            {email.labels.map((label, i) => (
              <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-muted/40 dark:bg-white/[0.04] text-muted-foreground/60">{label}</span>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      {body && (
        <div className="px-4 py-3">
          <div className="p-3 rounded-lg bg-muted/10 dark:bg-white/[0.015] border border-border/15 dark:border-white/[0.03] max-h-[350px] overflow-y-auto">
            <p className="text-[12px] text-foreground/70 leading-relaxed whitespace-pre-wrap">{displayBody}</p>
          </div>
          {isLong && (
            <button
              onClick={() => setBodyExpanded(!bodyExpanded)}
              className="mt-1.5 text-[11px] text-primary font-medium hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              {bodyExpanded ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> Read full email</>}
            </button>
          )}
        </div>
      )}

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <div className="px-4 py-2.5 border-t border-border/15 dark:border-white/[0.03]">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground/50 mb-1.5">Attachments ({email.attachments.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {email.attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/20 dark:bg-white/[0.03] border border-border/20 dark:border-white/[0.04]">
                <FileText className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[10px] text-foreground/70">{att.filename || "attachment"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmailDraftCard({ result }: { result: { id?: string; to?: string; subject?: string; body?: string; status?: string; message?: string } }) {
  const [showBody, setShowBody] = useState(false);
  const recipient = parseSender(result.to);

  return (
    <div className="rounded-xl border border-amber-500/20 dark:border-amber-500/10 overflow-hidden">
      {/* Header bar */}
      <div className="px-4 py-2.5 flex items-center justify-between bg-amber-500/[0.04] dark:bg-amber-500/[0.03] border-b border-amber-500/10">
        <div className="flex items-center gap-2">
          <PenLine className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-[12px] font-semibold text-foreground">Draft Created</span>
          <span className="text-[10px] text-muted-foreground/40">via Gmail</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500">draft</span>
      </div>

      {/* Email compose preview */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-3">
          <div className={cn("h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0", senderColor(recipient.email || recipient.name))}>
            <span className="text-[11px] font-bold text-white">{senderInitial(recipient.name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-muted-foreground/50">To:</span>
              <span className="text-foreground/80 font-medium">{recipient.name}</span>
              {recipient.email && <span className="text-muted-foreground/40 text-[10px]">&lt;{recipient.email}&gt;</span>}
            </div>
          </div>
        </div>

        {result.subject && (
          <div className="flex items-center gap-2 pl-11">
            <span className="text-[13px] font-semibold text-foreground">{result.subject}</span>
          </div>
        )}

        {result.body && (
          <div className="pl-11">
            <button
              onClick={() => setShowBody(!showBody)}
              className="text-[11px] text-primary/70 hover:text-primary font-medium flex items-center gap-1 transition-colors"
            >
              {showBody ? <ChevronUp className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showBody ? "Hide preview" : "Preview draft"}
            </button>
            {showBody && (
              <div className="mt-2 p-3 rounded-lg bg-muted/10 dark:bg-white/[0.015] border border-border/15 dark:border-white/[0.03]">
                <p className="text-[12px] text-foreground/70 leading-relaxed whitespace-pre-wrap">{result.body}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-amber-500/10 bg-amber-500/[0.02] flex items-center gap-2">
        <MailPlus className="h-3 w-3 text-amber-500/60" />
        <p className="text-[11px] text-muted-foreground/60">{result.message || "Draft saved to Gmail"}</p>
      </div>
    </div>
  );
}

function EmailSentCard({ result }: { result: { id?: string; to?: string; subject?: string; body?: string; status?: string; message?: string } }) {
  const [showBody, setShowBody] = useState(false);
  const recipient = parseSender(result.to);

  return (
    <div className="rounded-xl border border-emerald-500/20 dark:border-emerald-500/10 overflow-hidden">
      {/* Header bar */}
      <div className="px-4 py-2.5 flex items-center justify-between bg-emerald-500/[0.04] dark:bg-emerald-500/[0.03] border-b border-emerald-500/10">
        <div className="flex items-center gap-2">
          <Send className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-[12px] font-semibold text-foreground">Email Sent</span>
          <span className="text-[10px] text-muted-foreground/40">via Gmail</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">sent</span>
      </div>

      {/* Recipient + subject */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <MailCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-muted-foreground/50">To:</span>
              <span className="text-foreground/80 font-medium">{recipient.name}</span>
              {recipient.email && <span className="text-muted-foreground/40 text-[10px]">&lt;{recipient.email}&gt;</span>}
            </div>
            {result.subject && (
              <p className="text-[12px] font-semibold text-foreground mt-0.5">{result.subject}</p>
            )}
          </div>
        </div>

        {result.body && (
          <div className="pl-11">
            <button
              onClick={() => setShowBody(!showBody)}
              className="text-[11px] text-primary/70 hover:text-primary font-medium flex items-center gap-1 transition-colors"
            >
              {showBody ? <ChevronUp className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showBody ? "Hide content" : "View sent email"}
            </button>
            {showBody && (
              <div className="mt-2 p-3 rounded-lg bg-muted/10 dark:bg-white/[0.015] border border-border/15 dark:border-white/[0.03]">
                <p className="text-[12px] text-foreground/70 leading-relaxed whitespace-pre-wrap">{result.body}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-emerald-500/10 bg-emerald-500/[0.02] flex items-center gap-2">
        <CheckCircle className="h-3 w-3 text-emerald-500/60" />
        <p className="text-[11px] text-muted-foreground/60">{result.message || "Email delivered successfully"}</p>
      </div>
    </div>
  );
}

// ── Slack Cards ─────────────────────────────────────────

interface SlackChannel {
  id?: string;
  name?: string;
  topic?: string;
  memberCount?: number;
}

function SlackChannelListCard({ channels }: { channels: SlackChannel[] }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Slack Channels</span>
          <span className="text-[10px] text-muted-foreground/40">{channels.length} channels</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">fetched</span>
      </div>
      <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
        {channels.length === 0 && (
          <div className="px-4 py-6 text-center text-[12px] text-muted-foreground/50">No channels found</div>
        )}
        {channels.map((ch, i) => (
          <div key={ch.id || i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors">
            <div className="h-8 w-8 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
              <Hash className="h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-medium text-foreground truncate">{ch.name}</span>
                {ch.memberCount != null && (
                  <span className="text-[10px] text-muted-foreground/40 flex items-center gap-1 shrink-0">
                    <Users className="h-3 w-3" />{ch.memberCount}
                  </span>
                )}
              </div>
              {ch.topic && <p className="text-[11px] text-muted-foreground/50 truncate mt-0.5">{ch.topic}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SlackMessage {
  user?: string;
  text?: string;
  timestamp?: string;
}

function SlackMessageListCard({ messages }: { messages: SlackMessage[] }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Messages</span>
          <span className="text-[10px] text-muted-foreground/40">{messages.length} messages</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">fetched</span>
      </div>
      <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
        {messages.length === 0 && (
          <div className="px-4 py-6 text-center text-[12px] text-muted-foreground/50">No messages found</div>
        )}
        {messages.map((msg, i) => {
          const colorGrad = senderColor(msg.user || "unknown");
          return (
            <div key={i} className="px-4 py-2.5 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors">
              <div className="flex items-start gap-3">
                <div className={cn("h-7 w-7 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 mt-0.5", colorGrad)}>
                  <span className="text-[10px] font-bold text-white">{senderInitial(msg.user || "?")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[12px] font-semibold text-foreground">{msg.user || "Unknown"}</span>
                    {msg.timestamp && <span className="text-[10px] text-muted-foreground/40">{formatDate(msg.timestamp)}</span>}
                  </div>
                  <p className="text-[12px] text-foreground/70 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlackSentCard({ result }: { result: { ok?: boolean; channel?: string; timestamp?: string; message?: string } }) {
  return (
    <div className="rounded-xl border border-emerald-500/20 dark:border-emerald-500/10 overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Send className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Message Sent</span>
          <span className="text-[10px] text-muted-foreground/40">via Slack</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">sent</span>
      </div>
      <div className="px-4 py-3 space-y-2">
        {result.channel && (
          <div className="flex items-center gap-2">
            <Hash className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span className="text-[12px] text-foreground/80 font-medium">{result.channel}</span>
          </div>
        )}
        {result.message && (
          <div className="p-2.5 rounded-lg bg-muted/10 dark:bg-white/[0.015] border border-border/15 dark:border-white/[0.03]">
            <p className="text-[12px] text-foreground/70 leading-relaxed whitespace-pre-wrap">{result.message}</p>
          </div>
        )}
      </div>
      <div className="px-4 py-2 border-t border-emerald-500/10 bg-emerald-500/[0.02] flex items-center gap-2">
        <CheckCircle className="h-3 w-3 text-emerald-500/60" />
        <p className="text-[11px] text-muted-foreground/60">Message delivered to Slack</p>
      </div>
    </div>
  );
}

// ── Discord Cards ───────────────────────────────────────

interface DiscordServer {
  id?: string;
  name?: string;
  icon?: string | null;
  memberCount?: number;
}

function DiscordServerListCard({ servers }: { servers: DiscordServer[] }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Discord Servers</span>
          <span className="text-[10px] text-muted-foreground/40">{servers.length} servers</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">fetched</span>
      </div>
      <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
        {servers.length === 0 && (
          <div className="px-4 py-6 text-center text-[12px] text-muted-foreground/50">No servers found</div>
        )}
        {servers.map((srv, i) => (
          <div key={srv.id || i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors">
            <div className="h-9 w-9 rounded-xl bg-muted/30 flex items-center justify-center shrink-0 text-[13px] font-bold text-muted-foreground/50">
              {srv.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[12px] font-medium text-foreground truncate block">{srv.name}</span>
              {srv.memberCount != null && (
                <span className="text-[10px] text-muted-foreground/40 flex items-center gap-1 mt-0.5">
                  <Users className="h-3 w-3" />{srv.memberCount} members
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DiscordChannel {
  id?: string;
  name?: string;
  topic?: string;
}

function DiscordChannelListCard({ channels }: { channels: DiscordChannel[] }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Channels</span>
          <span className="text-[10px] text-muted-foreground/40">{channels.length} channels</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">fetched</span>
      </div>
      <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
        {channels.length === 0 && (
          <div className="px-4 py-6 text-center text-[12px] text-muted-foreground/50">No channels found</div>
        )}
        {channels.map((ch, i) => (
          <div key={ch.id || i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors">
            <Hash className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[12px] font-medium text-foreground truncate block">{ch.name}</span>
              {ch.topic && <p className="text-[11px] text-muted-foreground/50 truncate mt-0.5">{ch.topic}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DiscordMessage {
  id?: string;
  author?: string;
  content?: string;
  timestamp?: string;
}

function DiscordMessageListCard({ messages }: { messages: DiscordMessage[] }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Messages</span>
          <span className="text-[10px] text-muted-foreground/40">{messages.length} messages</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">fetched</span>
      </div>
      <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
        {messages.length === 0 && (
          <div className="px-4 py-6 text-center text-[12px] text-muted-foreground/50">No messages found</div>
        )}
        {messages.map((msg, i) => {
          const colorGrad = senderColor(msg.author || "unknown");
          return (
            <div key={msg.id || i} className="px-4 py-2.5 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors">
              <div className="flex items-start gap-3">
                <div className={cn("h-7 w-7 rounded-full bg-gradient-to-br flex items-center justify-center shrink-0 mt-0.5", colorGrad)}>
                  <span className="text-[10px] font-bold text-white">{senderInitial(msg.author || "?")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[12px] font-semibold text-foreground">{msg.author || "Unknown"}</span>
                    {msg.timestamp && <span className="text-[10px] text-muted-foreground/40">{formatDate(msg.timestamp)}</span>}
                  </div>
                  <p className="text-[12px] text-foreground/70 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DiscordSentCard({ result }: { result: { id?: string; content?: string; status?: string } }) {
  return (
    <div className="rounded-xl border border-emerald-500/20 dark:border-emerald-500/10 overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Send className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Message Sent</span>
          <span className="text-[10px] text-muted-foreground/40">via Discord</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">sent</span>
      </div>
      <div className="px-4 py-3">
        {result.content && (
          <div className="p-2.5 rounded-lg bg-muted/10 dark:bg-white/[0.015] border border-border/15 dark:border-white/[0.03]">
            <p className="text-[12px] text-foreground/70 leading-relaxed whitespace-pre-wrap">{result.content}</p>
          </div>
        )}
      </div>
      <div className="px-4 py-2 border-t border-emerald-500/10 bg-emerald-500/[0.02] flex items-center gap-2">
        <CheckCircle className="h-3 w-3 text-emerald-500/60" />
        <p className="text-[11px] text-muted-foreground/60">Message delivered to Discord</p>
      </div>
    </div>
  );
}

// ── LinkedIn Cards ──────────────────────────────────────

function LinkedInProfileCard({ result }: { result: { name?: string; email?: string; picture?: string; sub?: string } }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Linkedin className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">LinkedIn Profile</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">fetched</span>
      </div>
      <div className="px-4 py-4 flex items-center gap-4">
        {result.picture ? (
          <img src={result.picture} alt={result.name || ""} className="h-12 w-12 rounded-xl object-cover ring-2 ring-border/20" />
        ) : (
          <div className="h-12 w-12 rounded-xl bg-muted/30 flex items-center justify-center">
            <UserCircle className="h-6 w-6 text-muted-foreground/60" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-foreground">{result.name || "Unknown"}</p>
          {result.email && <p className="text-[12px] text-muted-foreground/60 mt-0.5">{result.email}</p>}
          {result.sub && <p className="text-[10px] text-muted-foreground/40 mt-0.5 font-mono">ID: {result.sub}</p>}
        </div>
      </div>
    </div>
  );
}

function LinkedInPostCard({ result }: { result: { status?: string; id?: string; message?: string } }) {
  return (
    <div className="rounded-xl border border-emerald-500/20 dark:border-emerald-500/10 overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Linkedin className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Post Published</span>
          <span className="text-[10px] text-muted-foreground/40">via LinkedIn</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">{result.status || "posted"}</span>
      </div>
      <div className="px-4 py-3">
        {result.message && (
          <div className="p-2.5 rounded-lg bg-muted/10 dark:bg-white/[0.015] border border-border/15 dark:border-white/[0.03]">
            <p className="text-[12px] text-foreground/70 leading-relaxed whitespace-pre-wrap">{result.message}</p>
          </div>
        )}
      </div>
      <div className="px-4 py-2 border-t border-emerald-500/10 bg-emerald-500/[0.02] flex items-center gap-2">
        <CheckCircle className="h-3 w-3 text-emerald-500/60" />
        <p className="text-[11px] text-muted-foreground/60">Post published to LinkedIn</p>
      </div>
    </div>
  );
}

function LinkedInConnectionsCard({ result }: { result: { profile?: { name?: string; email?: string }; note?: string } }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Linkedin className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Connections</span>
        </div>
        <Link2 className="h-3.5 w-3.5 text-muted-foreground/40" />
      </div>
      <div className="px-4 py-3 space-y-2">
        {result.profile && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/10 dark:bg-white/[0.015] border border-border/15 dark:border-white/[0.03]">
            <div className="h-8 w-8 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
              <UserCircle className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-foreground">{result.profile.name || "You"}</p>
              {result.profile.email && <p className="text-[10px] text-muted-foreground/50">{result.profile.email}</p>}
            </div>
          </div>
        )}
        {result.note && <p className="text-[11px] text-muted-foreground/50 leading-relaxed">{result.note}</p>}
      </div>
    </div>
  );
}

// ── Shopify Cards ───────────────────────────────────────

interface ShopifyProduct {
  id?: string | number;
  title?: string;
  status?: string;
  vendor?: string;
  product_type?: string;
  variants?: { price?: string; inventory_quantity?: number }[];
  image?: { src?: string };
  images?: { src?: string }[];
}

function ShopifyProductListCard({ result }: { result: { products?: ShopifyProduct[]; note?: string; tokenAvailable?: boolean } }) {
  const products = result.products || [];
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Shopify Products</span>
          <span className="text-[10px] text-muted-foreground/40">{products.length} products</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">fetched</span>
      </div>
      {products.length > 0 ? (
        <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
          {products.map((p, i) => {
            const price = p.variants?.[0]?.price;
            return (
              <div key={p.id || i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors">
                <div className="h-9 w-9 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-muted-foreground/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-medium text-foreground truncate">{p.title}</span>
                    {price && <span className="text-[12px] font-bold text-foreground shrink-0">${price}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground/50">
                    {p.vendor && <span>{p.vendor}</span>}
                    {p.status && (
                      <span className={cn("font-bold uppercase px-1.5 py-0.5 rounded-md text-[9px]",
                        p.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted/30 text-muted-foreground"
                      )}>{p.status}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-4">
          {result.note && <p className="text-[11px] text-muted-foreground/50 leading-relaxed">{result.note}</p>}
          {result.tokenAvailable && (
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-500">
              <CheckCircle className="h-3 w-3" />
              <span>Shopify token available</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ShopifyOrder {
  id?: string | number;
  name?: string;
  email?: string;
  total_price?: string;
  financial_status?: string;
  fulfillment_status?: string | null;
  created_at?: string;
  line_items?: { title?: string; quantity?: number }[];
}

function ShopifyOrderListCard({ result }: { result: { orders?: ShopifyOrder[]; note?: string; tokenAvailable?: boolean } }) {
  const orders = result.orders || [];
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Receipt className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Shopify Orders</span>
          <span className="text-[10px] text-muted-foreground/40">{orders.length} orders</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">fetched</span>
      </div>
      {orders.length > 0 ? (
        <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
          {orders.map((o, i) => {
            const statusColors: Record<string, string> = {
              paid: "bg-emerald-500/10 text-emerald-500",
              pending: "bg-amber-500/10 text-amber-500",
              refunded: "bg-red-500/10 text-red-500",
            };
            return (
              <div key={o.id || i} className="px-4 py-2.5 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-foreground">{o.name || `#${o.id}`}</span>
                    {o.email && <span className="text-[10px] text-muted-foreground/40">{o.email}</span>}
                  </div>
                  <span className="text-[13px] font-bold text-foreground">{o.total_price ? `$${o.total_price}` : ""}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {o.financial_status && (
                    <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md", statusColors[o.financial_status] || "bg-muted/30 text-muted-foreground")}>
                      {o.financial_status}
                    </span>
                  )}
                  {o.fulfillment_status && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500">{o.fulfillment_status}</span>
                  )}
                  {o.created_at && <span className="text-[10px] text-muted-foreground/40">{formatDate(o.created_at)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-4">
          {result.note && <p className="text-[11px] text-muted-foreground/50 leading-relaxed">{result.note}</p>}
          {result.tokenAvailable && (
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-500">
              <CheckCircle className="h-3 w-3" />
              <span>Shopify token available</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ShopifyProductDetailCard({ result }: { result: { product?: ShopifyProduct | null; note?: string; tokenAvailable?: boolean } }) {
  const p = result.product;
  if (!p) {
    return (
      <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
        <div className="px-4 py-2.5 flex items-center gap-2 bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
          <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Product</span>
        </div>
        <div className="px-4 py-4">
          {result.note && <p className="text-[11px] text-muted-foreground/50 leading-relaxed">{result.note}</p>}
        </div>
      </div>
    );
  }
  const price = p.variants?.[0]?.price;
  const stock = p.variants?.[0]?.inventory_quantity;
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Product Detail</span>
        </div>
        {p.status && (
          <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-md",
            p.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted/30 text-muted-foreground"
          )}>{p.status}</span>
        )}
      </div>
      <div className="px-4 py-3 space-y-2">
        <p className="text-[14px] font-semibold text-foreground">{p.title}</p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60">
          {p.vendor && <span>{p.vendor}</span>}
          {p.product_type && <span className="px-1.5 py-0.5 rounded-md bg-muted/20 dark:bg-white/[0.03]">{p.product_type}</span>}
        </div>
        <div className="flex items-center gap-4 pt-1">
          {price && (
            <div>
              <p className="text-[10px] text-muted-foreground/50 uppercase">Price</p>
              <p className="text-lg font-bold text-foreground">${price}</p>
            </div>
          )}
          {stock != null && (
            <div>
              <p className="text-[10px] text-muted-foreground/50 uppercase">In Stock</p>
              <p className="text-lg font-bold text-foreground">{stock}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Google Sheets Cards ─────────────────────────────────

interface SpreadsheetItem {
  id?: string;
  name?: string;
  modifiedTime?: string;
  owner?: string;
  webViewLink?: string;
}

function SheetsListCard({ spreadsheets }: { spreadsheets: SpreadsheetItem[] }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Google Sheets</span>
          <span className="text-[10px] text-muted-foreground/40">{spreadsheets.length} spreadsheets</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">fetched</span>
      </div>
      <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
        {spreadsheets.length === 0 && (
          <div className="px-4 py-6 text-center text-[12px] text-muted-foreground/50">No spreadsheets found</div>
        )}
        {spreadsheets.map((ss, i) => {
          const sheetLink = ss.webViewLink;
          const Wrapper = sheetLink ? "a" : "div";
          const linkProps = sheetLink ? { href: sheetLink, target: "_blank" as const, rel: "noopener noreferrer" } : {};
          return (
            <Wrapper key={ss.id || i} {...linkProps} className={cn("flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors", sheetLink && "cursor-pointer")}>
              <div className="h-8 w-8 rounded-lg bg-green-600/10 flex items-center justify-center shrink-0 text-[9px] font-bold text-green-600">XLS</div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-foreground truncate">{ss.name}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground/50">
                  {ss.owner && <span>{ss.owner}</span>}
                  {ss.modifiedTime && <span>{formatDate(ss.modifiedTime)}</span>}
                </div>
              </div>
              {sheetLink && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />}
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}

interface SpreadsheetData {
  title?: string;
  sheets?: { name?: string; id?: number }[];
  range?: string;
  headers?: string[];
  rows?: string[][];
  totalRows?: number;
}

function SheetsDataCard({ data }: { data: SpreadsheetData }) {
  const [showAll, setShowAll] = useState(false);
  const rows = data.rows || [];
  const shown = showAll ? rows : rows.slice(0, 8);

  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">{data.title || "Spreadsheet"}</span>
        </div>
        <div className="flex items-center gap-2">
          {data.range && <span className="text-[10px] text-muted-foreground/40 font-mono">{data.range}</span>}
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">{data.totalRows} rows</span>
        </div>
      </div>

      {data.sheets && data.sheets.length > 1 && (
        <div className="px-4 py-1.5 flex items-center gap-1.5 border-b border-border/15 dark:border-white/[0.03] overflow-x-auto">
          {data.sheets.map((sheet, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-muted/20 dark:bg-white/[0.03] text-muted-foreground/60 whitespace-nowrap">{sheet.name}</span>
          ))}
        </div>
      )}

      {(data.headers || rows.length > 0) && (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            {data.headers && data.headers.length > 0 && (
              <thead>
                <tr className="bg-muted/30 dark:bg-white/[0.04]">
                  {data.headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-semibold text-foreground/70 whitespace-nowrap border-b border-border/20 dark:border-white/[0.04]">{h}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {shown.map((row, i) => (
                <tr key={i} className="border-b border-border/10 dark:border-white/[0.02] hover:bg-muted/10 dark:hover:bg-white/[0.02]">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-1.5 text-foreground/70 whitespace-nowrap max-w-[200px] truncate">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 8 && (
        <button onClick={() => setShowAll(!showAll)} className="w-full px-4 py-2 text-[11px] text-primary font-medium hover:bg-muted/20 transition-colors flex items-center justify-center gap-1 border-t border-border/20 dark:border-white/[0.04]">
          {showAll ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> Show all {rows.length} rows</>}
        </button>
      )}
    </div>
  );
}

function SheetsCreatedCard({ result }: { result: { id?: string; title?: string; url?: string; status?: string; message?: string } }) {
  return (
    <div className="rounded-xl border border-emerald-500/20 dark:border-emerald-500/10 overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Spreadsheet Created</span>
          <span className="text-[10px] text-muted-foreground/40">via Google Sheets</span>
        </div>
        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
      </div>
      <div className="px-4 py-3 space-y-1.5">
        <p className="text-[13px] font-medium text-foreground">{result.title}</p>
        {result.message && <p className="text-[11px] text-muted-foreground/60">{result.message}</p>}
      </div>
      {result.url && (
        <div className="px-4 py-2 border-t border-emerald-500/10 bg-emerald-500/[0.02] flex items-center gap-2">
          <ExternalLink className="h-3 w-3 text-emerald-500/60" />
          <span className="text-[11px] text-muted-foreground/60 truncate">{result.url}</span>
        </div>
      )}
    </div>
  );
}

function SheetsAppendCard({ result }: { result: { spreadsheetId?: string; updatedRange?: string; updatedRows?: number; message?: string } }) {
  return (
    <div className="rounded-xl border border-emerald-500/20 dark:border-emerald-500/10 overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Rows Appended</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">{result.updatedRows} rows</span>
      </div>
      <div className="px-4 py-3 space-y-1.5">
        {result.updatedRange && <p className="text-[12px] text-foreground/70 font-mono">{result.updatedRange}</p>}
        {result.message && <p className="text-[11px] text-muted-foreground/60">{result.message}</p>}
      </div>
    </div>
  );
}

// ── Google Contacts Cards ───────────────────────────────

interface ContactItem {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  organization?: string;
  title?: string;
  photo?: string;
}

function ContactListCard({ contacts: contactList }: { contacts: ContactItem[] }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? contactList : contactList.slice(0, 8);

  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Contacts</span>
          <span className="text-[10px] text-muted-foreground/40">{contactList.length} contacts</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">fetched</span>
      </div>
      <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
        {contactList.length === 0 && (
          <div className="px-4 py-6 text-center text-[12px] text-muted-foreground/50">No contacts found</div>
        )}
        {shown.map((c, i) => {
          const colorGrad = senderColor(c.email || c.name || String(i));
          return (
            <div key={c.id || i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors">
              {c.photo ? (
                <img src={c.photo} alt="" className="h-8 w-8 rounded-lg object-cover shrink-0" />
              ) : (
                <div className={cn("h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0", colorGrad)}>
                  <span className="text-[10px] font-bold text-white">{senderInitial(c.name || "?")}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-foreground truncate">{c.name}</span>
                  {c.organization && <span className="text-[10px] text-muted-foreground/40">{c.organization}</span>}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground/50">
                  {c.email && <span>{c.email}</span>}
                  {c.phone && <span>{c.phone}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {contactList.length > 8 && (
        <button onClick={() => setShowAll(!showAll)} className="w-full px-4 py-2 text-[11px] text-primary font-medium hover:bg-muted/20 transition-colors flex items-center justify-center gap-1 border-t border-border/20 dark:border-white/[0.04]">
          {showAll ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> Show all {contactList.length}</>}
        </button>
      )}
    </div>
  );
}

interface ContactDetail {
  id?: string;
  name?: string;
  emails?: { email?: string; type?: string }[];
  phones?: { number?: string; type?: string }[];
  organization?: string;
  title?: string;
  photo?: string;
  address?: string;
  birthday?: string;
  bio?: string;
}

function ContactDetailCard({ contact }: { contact: ContactDetail }) {
  const colorGrad = senderColor(contact.emails?.[0]?.email || contact.name || "");

  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Contact</span>
        </div>
        <Eye className="h-3.5 w-3.5 text-muted-foreground/40" />
      </div>
      <div className="px-4 py-4 flex items-start gap-4">
        {contact.photo ? (
          <img src={contact.photo} alt="" className="h-12 w-12 rounded-xl object-cover ring-2 ring-border/20 shrink-0" />
        ) : (
          <div className={cn("h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0", colorGrad)}>
            <span className="text-[16px] font-bold text-white">{senderInitial(contact.name || "?")}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-foreground">{contact.name}</p>
          {contact.title && <p className="text-[12px] text-muted-foreground/60">{contact.title}</p>}
          {contact.organization && <p className="text-[11px] text-muted-foreground/50">{contact.organization}</p>}
        </div>
      </div>
      <div className="px-4 pb-3 space-y-2">
        {contact.emails && contact.emails.length > 0 && (
          <div className="space-y-1">
            {contact.emails.map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <Mail className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-foreground/70">{e.email}</span>
                <span className="text-[9px] text-muted-foreground/40 uppercase">{e.type}</span>
              </div>
            ))}
          </div>
        )}
        {contact.phones && contact.phones.length > 0 && (
          <div className="space-y-1">
            {contact.phones.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <Globe className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-foreground/70">{p.number}</span>
                <span className="text-[9px] text-muted-foreground/40 uppercase">{p.type}</span>
              </div>
            ))}
          </div>
        )}
        {contact.address && (
          <div className="flex items-center gap-2 text-[11px]">
            <Globe className="h-3 w-3 text-muted-foreground/40" />
            <span className="text-foreground/70">{contact.address}</span>
          </div>
        )}
        {contact.birthday && (
          <div className="flex items-center gap-2 text-[11px]">
            <Calendar className="h-3 w-3 text-muted-foreground/40" />
            <span className="text-foreground/70">{contact.birthday}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Google Tasks Cards ──────────────────────────────────

interface TaskListItem {
  id?: string;
  title?: string;
  updated?: string;
}

function TaskListsCard({ lists }: { lists: TaskListItem[] }) {
  // Render as a compact inline chip instead of a full card to avoid double-card with TasksListCard
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/15 border border-border/20 w-fit">
      <CheckCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
      <span className="text-[11px] text-muted-foreground/70">
        {lists.length} task {lists.length === 1 ? "list" : "lists"} found
        {lists.length > 0 && `: ${lists.map(l => l.title).join(", ")}`}
      </span>
    </div>
  );
}

interface TaskItem {
  id?: string;
  title?: string;
  notes?: string;
  status?: string;
  due?: string;
  completed?: string;
  updated?: string;
}

function TasksListCard({ taskItems }: { taskItems: TaskItem[] }) {
  const completedCount = taskItems.filter((t) => t.status === "completed").length;
  const pendingCount = taskItems.length - completedCount;

  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Tasks</span>
          <span className="text-[10px] text-muted-foreground/40">{taskItems.length} tasks</span>
          {pendingCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500">{pendingCount} pending</span>
          )}
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">fetched</span>
      </div>
      <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
        {taskItems.length === 0 && (
          <div className="px-4 py-6 text-center text-[12px] text-muted-foreground/50">No tasks found</div>
        )}
        {taskItems.map((task, i) => {
          const isDone = task.status === "completed";
          return (
            <div key={task.id || i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors">
              <div className={cn(
                "h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5",
                isDone ? "border-emerald-500 bg-emerald-500/10" : "border-muted-foreground/30"
              )}>
                {isDone && <Check className="h-3 w-3 text-emerald-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className={cn("text-[12px] font-medium block", isDone ? "text-muted-foreground/50 line-through" : "text-foreground")}>
                  {task.title}
                </span>
                {task.notes && <p className="text-[11px] text-muted-foreground/50 mt-0.5 truncate">{task.notes}</p>}
                <div className="flex items-center gap-2 mt-0.5">
                  {task.due && (
                    <span className={cn("text-[10px] flex items-center gap-1",
                      isDone ? "text-muted-foreground/40" : "text-amber-500"
                    )}>
                      <Clock className="h-3 w-3" />{formatDate(task.due)}
                    </span>
                  )}
                  {isDone && task.completed && (
                    <span className="text-[10px] text-emerald-500/60">Completed {formatDate(task.completed)}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskCreatedCard({ result }: { result: { id?: string; title?: string; notes?: string; status?: string; due?: string; message?: string } }) {
  return (
    <div className="rounded-xl border border-emerald-500/20 dark:border-emerald-500/10 overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Task Created</span>
          <span className="text-[10px] text-muted-foreground/40">via Google Tasks</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">created</span>
      </div>
      <div className="px-4 py-3 space-y-1.5">
        <p className="text-[13px] font-medium text-foreground">{result.title}</p>
        {result.notes && <p className="text-[11px] text-muted-foreground/60">{result.notes}</p>}
        {result.due && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-500">
            <Clock className="h-3 w-3" />
            <span>Due: {formatDate(result.due)}</span>
          </div>
        )}
      </div>
      <div className="px-4 py-2 border-t border-emerald-500/10 bg-emerald-500/[0.02] flex items-center gap-2">
        <CheckCircle className="h-3 w-3 text-emerald-500/60" />
        <p className="text-[11px] text-muted-foreground/60">{result.message || "Task added to Google Tasks"}</p>
      </div>
    </div>
  );
}

function TaskCompletedCard({ result }: { result: { id?: string; title?: string; status?: string; completed?: string; message?: string } }) {
  return (
    <div className="rounded-xl border border-emerald-500/20 dark:border-emerald-500/10 overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-emerald-500/[0.04] dark:bg-emerald-500/[0.03] border-b border-emerald-500/10">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-[12px] font-semibold text-foreground">Task Completed</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">done</span>
      </div>
      <div className="px-4 py-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md border-2 border-emerald-500 bg-emerald-500/10 flex items-center justify-center">
            <Check className="h-3 w-3 text-emerald-500" />
          </div>
          <p className="text-[13px] font-medium text-foreground line-through opacity-70">{result.title}</p>
        </div>
      </div>
      <div className="px-4 py-2 border-t border-emerald-500/10 bg-emerald-500/[0.02] flex items-center gap-2">
        <CheckCircle className="h-3 w-3 text-emerald-500/60" />
        <p className="text-[11px] text-muted-foreground/60">{result.message || "Task marked as complete"}</p>
      </div>
    </div>
  );
}

// ── Stripe Enhanced Cards ───────────────────────────────

interface StripeCustomer {
  id?: string;
  name?: string;
  email?: string;
  created?: number | string;
  currency?: string;
  balance?: number;
}

function StripeCustomerListCard({ customers }: { customers: StripeCustomer[] }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Customers</span>
          <span className="text-[10px] text-muted-foreground/40">{customers.length} customers</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">stripe</span>
      </div>
      <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
        {customers.length === 0 && (
          <div className="px-4 py-6 text-center text-[12px] text-muted-foreground/50">No customers found</div>
        )}
        {customers.map((c, i) => {
          const colorGrad = senderColor(c.email || c.name || String(i));
          return (
            <div key={c.id || i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors">
              <div className={cn("h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0", colorGrad)}>
                <span className="text-[10px] font-bold text-white">{senderInitial(c.name || c.email || "?")}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[12px] font-medium text-foreground truncate block">{c.name || "Unnamed"}</span>
                {c.email && <span className="text-[10px] text-muted-foreground/50">{c.email}</span>}
              </div>
              {c.id && <span className="text-[9px] text-muted-foreground/30 font-mono shrink-0">{c.id.slice(0, 18)}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface StripeInvoice {
  id?: string;
  number?: string;
  customer_name?: string;
  customer_email?: string;
  amount_due?: number;
  amount_paid?: number;
  currency?: string;
  status?: string;
  due_date?: string | number;
  created?: string | number;
}

function StripeInvoiceListCard({ invoices }: { invoices: StripeInvoice[] }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Receipt className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Invoices</span>
          <span className="text-[10px] text-muted-foreground/40">{invoices.length} invoices</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">stripe</span>
      </div>
      <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
        {invoices.length === 0 && (
          <div className="px-4 py-6 text-center text-[12px] text-muted-foreground/50">No invoices found</div>
        )}
        {invoices.map((inv, i) => {
          const statusColors: Record<string, string> = {
            paid: "bg-emerald-500/10 text-emerald-500",
            open: "bg-blue-500/10 text-blue-500",
            draft: "bg-amber-500/10 text-amber-500",
            void: "bg-red-500/10 text-red-500",
            uncollectible: "bg-red-500/10 text-red-500",
          };
          const amount = inv.amount_due ?? inv.amount_paid ?? 0;
          return (
            <div key={inv.id || i} className="px-4 py-2.5 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                  <span className="text-[12px] font-medium text-foreground truncate">{inv.number || inv.id?.slice(0, 18)}</span>
                </div>
                <span className="text-[13px] font-bold text-foreground shrink-0">${(amount / 100).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 ml-5">
                {inv.customer_name && <span className="text-[10px] text-muted-foreground/50">{inv.customer_name}</span>}
                {inv.status && (
                  <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md", statusColors[inv.status] || "bg-muted/30 text-muted-foreground")}>
                    {inv.status}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StripeInvoiceActionCard({ result, action }: { result: { number?: string; id?: string; status?: string; amount_due?: number; customer_name?: string }; action: string }) {
  return (
    <div className="rounded-xl border border-emerald-500/20 dark:border-emerald-500/10 overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Receipt className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">{action}</span>
          <span className="text-[10px] text-muted-foreground/40">via Stripe</span>
        </div>
        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
      </div>
      <div className="px-4 py-3 space-y-1.5">
        <p className="text-[13px] font-medium text-foreground">{result.number || result.id}</p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60">
          {result.customer_name && <span>{result.customer_name}</span>}
          {result.status && <span className="font-medium capitalize">{result.status}</span>}
          {result.amount_due != null && <span className="font-bold text-foreground">${(result.amount_due / 100).toFixed(2)}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Calendar Cards ──────────────────────────────────────

interface CalendarEvent {
  id?: string;
  summary?: string;
  title?: string;
  start?: string | { dateTime?: string; date?: string };
  end?: string | { dateTime?: string; date?: string };
  location?: string;
  status?: string;
  description?: string;
}

function parseEventTime(t: string | { dateTime?: string; date?: string } | undefined): string {
  if (!t) return "";
  if (typeof t === "string") return formatDate(t);
  return formatDate(t.dateTime || t.date || "");
}

function CalendarEventListCard({ events }: { events: CalendarEvent[] }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Calendar</span>
          <span className="text-[10px] text-muted-foreground/40">{events.length} events</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">fetched</span>
      </div>
      <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
        {events.length === 0 && (
          <div className="px-4 py-6 text-center text-[12px] text-muted-foreground/50">No upcoming events</div>
        )}
        {events.map((evt, i) => (
          <div key={evt.id || i} className="px-4 py-2.5 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-foreground truncate">{evt.summary || evt.title || "(untitled)"}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground/50">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{parseEventTime(evt.start)}</span>
              {evt.location && <span className="truncate max-w-[150px]">{evt.location}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarEventCreatedCard({ result }: { result: CalendarEvent & { status?: string; message?: string } }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Event Created</span>
        </div>
        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
      </div>
      <div className="px-4 py-3 space-y-1.5">
        <p className="text-[13px] font-medium text-foreground">{result.summary || result.title}</p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60">
          {result.start && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{parseEventTime(result.start)}</span>}
          {result.location && <span>{result.location}</span>}
        </div>
      </div>
    </div>
  );
}

function CalendarAvailabilityCard({ result }: { result: { available?: boolean; busy?: boolean; slots?: unknown[]; message?: string } }) {
  const isAvailable = result.available || !result.busy;
  return (
    <div className={cn("rounded-xl border px-4 py-3", isAvailable ? "border-emerald-500/20 bg-emerald-500/[0.04]" : "border-amber-500/20 bg-amber-500/[0.04]")}>
      <div className="flex items-center gap-2 mb-1">
        {isAvailable ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
        <span className="text-[13px] font-semibold text-foreground">{isAvailable ? "Available" : "Busy"}</span>
      </div>
      {result.message && <p className="text-[12px] text-foreground/70">{result.message}</p>}
    </div>
  );
}

// ── Drive Cards ─────────────────────────────────────────

interface DriveFile {
  id?: string;
  name?: string;
  mimeType?: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
}

function DriveFileListCard({ files }: { files: DriveFile[] }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Google Drive</span>
          <span className="text-[10px] text-muted-foreground/40">{files.length} files</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">fetched</span>
      </div>
      <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
        {files.length === 0 && (
          <div className="px-4 py-6 text-center text-[12px] text-muted-foreground/50">No files found</div>
        )}
        {files.map((file, i) => {
          const ext = file.mimeType?.includes("document") ? "DOC" : file.mimeType?.includes("spreadsheet") ? "XLS" : file.mimeType?.includes("presentation") ? "PPT" : file.mimeType?.includes("pdf") ? "PDF" : "FILE";
          const extColors: Record<string, string> = { DOC: "bg-blue-500/10 text-blue-500", XLS: "bg-emerald-500/10 text-emerald-500", PPT: "bg-orange-500/10 text-orange-500", PDF: "bg-red-500/10 text-red-500", FILE: "bg-muted/30 text-muted-foreground" };
          const fileLink = (file as any).link || file.webViewLink;
          const Wrapper = fileLink ? "a" : "div";
          const linkProps = fileLink ? { href: fileLink, target: "_blank", rel: "noopener noreferrer" } : {};
          return (
            <Wrapper key={file.id || i} {...linkProps} className={cn("flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors", fileLink && "cursor-pointer")}>
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-[9px] font-bold uppercase shrink-0", extColors[ext])}>{ext}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-foreground truncate">{file.name}</p>
                <p className="text-[10px] text-muted-foreground/50">{formatDate(file.modifiedTime)}</p>
              </div>
              {fileLink && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />}
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}

function DriveDocCard({ result }: { result: { id?: string; title?: string; name?: string; content?: string; body?: string; webViewLink?: string; url?: string } }) {
  const content = result.content || result.body || "";
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">{result.title || result.name || "Document"}</span>
        </div>
      </div>
      {content && (
        <div className="px-4 py-3">
          <div className="p-3 rounded-lg bg-muted/20 dark:bg-white/[0.02] border border-border/20 dark:border-white/[0.04] max-h-[200px] overflow-y-auto">
            <p className="text-[12px] text-foreground/70 leading-relaxed whitespace-pre-wrap">{truncate(content, 1500)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function DriveActionCard({ result, action }: { result: { id?: string; title?: string; name?: string; webViewLink?: string; url?: string; message?: string }; action: string }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">{action}</span>
        </div>
        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
      </div>
      <div className="px-4 py-3 space-y-1.5">
        <p className="text-[13px] font-medium text-foreground">{result.title || result.name}</p>
        {result.message && <p className="text-[11px] text-muted-foreground/60">{result.message}</p>}
      </div>
    </div>
  );
}

// ── Service Action Card (generic) ───────────────────────

function ServiceActionCard({ toolName, status, details }: { toolName: string; status: "success" | "failed" | "running"; details: string }) {
  const serviceName = toolName.split("_")[0];
  const serviceLabels: Record<string, string> = { gmail: "Gmail", calendar: "Calendar", drive: "Drive", slack: "Slack", stripe: "Stripe", github: "GitHub", discord: "Discord", linkedin: "LinkedIn", shopify: "Shopify" };
  const actionLabel = toolName.replace(/_/g, " ").replace(/^\w+\s/, "");
  const statusConfig = {
    running: { color: "text-blue-500", bg: "bg-blue-500/10" },
    success: { color: "text-emerald-500", bg: "bg-emerald-500/10" },
    failed: { color: "text-red-500", bg: "bg-red-500/10" },
  };
  const c = statusConfig[status];
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">{serviceLabels[serviceName] || serviceName}</span>
          <span className="text-[10px] text-muted-foreground/40">via Token Vault</span>
        </div>
        <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-md", c.bg, c.color)}>
          {status === "running" ? "In Progress" : status}
        </span>
      </div>
      <div className="px-4 py-2.5 space-y-1">
        <p className="text-[12px] font-medium text-foreground capitalize">{actionLabel}</p>
        <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{details}</p>
      </div>
    </div>
  );
}

// ── GitHub Cards ────────────────────────────────────────

function GitHubRepoListCard({ repos }: { repos: { name?: string; description?: string; language?: string; stars?: number; url?: string; isPrivate?: boolean }[] }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">GitHub Repos</span>
          <span className="text-[10px] text-muted-foreground/40">{repos.length} repos</span>
        </div>
      </div>
      <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
        {repos.map((repo, i) => {
          const repoLink = repo.url;
          const Wrapper = repoLink ? "a" : "div";
          const linkProps = repoLink ? { href: repoLink, target: "_blank" as const, rel: "noopener noreferrer" } : {};
          return (
            <Wrapper key={i} {...linkProps} className={cn("block px-4 py-2.5 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors", repoLink && "cursor-pointer")}>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-foreground">{repo.name}</span>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50">
                  {repo.language && <span>{repo.language}</span>}
                  {repo.stars != null && <span>{repo.stars}</span>}
                  {repoLink && <ExternalLink className="h-3 w-3 text-muted-foreground/30 shrink-0" />}
                </div>
              </div>
              {repo.description && <p className="text-[11px] text-muted-foreground/50 truncate mt-0.5">{repo.description}</p>}
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}

function GitHubIssueListCard({ issues }: { issues: { number?: number; title?: string; state?: string; author?: string; labels?: string[]; url?: string }[] }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Issues</span>
          <span className="text-[10px] text-muted-foreground/40">{issues.length} open</span>
        </div>
      </div>
      <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
        {issues.map((issue, i) => {
          const issueLink = issue.url;
          const Wrapper = issueLink ? "a" : "div";
          const linkProps = issueLink ? { href: issueLink, target: "_blank" as const, rel: "noopener noreferrer" } : {};
          return (
            <Wrapper key={i} {...linkProps} className={cn("block px-4 py-2.5 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors", issueLink && "cursor-pointer")}>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground/50">#{issue.number}</span>
                <span className="text-[12px] font-medium text-foreground truncate">{issue.title}</span>
                {issueLink && <ExternalLink className="h-3 w-3 text-muted-foreground/30 shrink-0 ml-auto" />}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {issue.author && <span className="text-[10px] text-muted-foreground/50">{issue.author}</span>}
                {issue.labels?.map((label, j) => (
                  <span key={j} className="text-[9px] px-1.5 py-0.5 rounded-md bg-primary/8 text-primary/70 font-mono">{label}</span>
                ))}
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}

// ── Stripe Cards ────────────────────────────────────────

function StripeBalanceCard({ result }: { result: { available?: { amount: number; currency: string }[]; pending?: { amount: number; currency: string }[] } }) {
  const avail = result.available?.[0];
  const pend = result.pending?.[0];
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Stripe Balance</span>
        </div>
      </div>
      <div className="px-4 py-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-muted-foreground/50 uppercase">Available</p>
          <p className="text-lg font-bold text-foreground">{avail ? `$${(avail.amount / 100).toFixed(2)}` : "$0.00"}</p>
          {avail && <p className="text-[10px] text-muted-foreground/40 uppercase">{avail.currency}</p>}
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground/50 uppercase">Pending</p>
          <p className="text-lg font-bold text-foreground/70">{pend ? `$${(pend.amount / 100).toFixed(2)}` : "$0.00"}</p>
          {pend && <p className="text-[10px] text-muted-foreground/40 uppercase">{pend.currency}</p>}
        </div>
      </div>
    </div>
  );
}

function StripePaymentListCard({ payments }: { payments: { id?: string; amount?: number; currency?: string; status?: string; description?: string; customer?: string; created?: string }[] }) {
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold text-foreground">Payments</span>
          <span className="text-[10px] text-muted-foreground/40">{payments.length} charges</span>
        </div>
      </div>
      <div className="divide-y divide-border/20 dark:divide-white/[0.04]">
        {payments.map((p, i) => (
          <div key={p.id || i} className="px-4 py-2.5 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-medium text-foreground">{p.description || p.customer || "Payment"}</p>
              <p className="text-[10px] text-muted-foreground/50">{formatDate(p.created)}</p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-bold text-foreground">${((p.amount || 0) / 100).toFixed(2)}</p>
              <span className={cn("text-[10px] font-bold uppercase", p.status === "succeeded" ? "text-emerald-500" : "text-amber-500")}>{p.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Generic Table Card ──────────────────────────────────

function GenericTableCard({ data }: { data: Record<string, unknown>[] }) {
  if (data.length === 0) return null;
  const headers = Object.keys(data[0]).filter(k => typeof data[0][k] !== "object");
  return (
    <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-muted/30 dark:bg-white/[0.04]">
              {headers.map((h, i) => <th key={i} className="px-3 py-2 text-left font-semibold text-muted-foreground/80 whitespace-nowrap capitalize">{h.replace(/_/g, " ")}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((row, i) => (
              <tr key={i} className="border-t border-border/20 dark:border-white/[0.04]">
                {headers.map((h, j) => <td key={j} className="px-3 py-2 text-foreground/80 whitespace-nowrap">{String(row[h] ?? "")}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Thinking Card ───────────────────────────────────────

function ThinkingCard() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 dark:bg-white/[0.02] border border-dashed border-border/30 dark:border-white/[0.06]">
      <Cpu className="h-3.5 w-3.5 text-muted-foreground/40 animate-pulse" />
      <span className="text-[12px] text-muted-foreground/50 italic">Working on it...</span>
    </div>
  );
}

// ── Main Renderer ───────────────────────────────────────

export function ToolInvocationCard({ toolName, state, args, result }: {
  toolName: string;
  state: string;
  args?: Record<string, unknown>;
  result?: unknown;
}) {
  // Still running
  if (state === "call" || state === "partial-call") {
    return (
      <ServiceActionCard
        toolName={toolName}
        status="running"
        details={args ? `${Object.entries(args).map(([k, v]) => `${k}: ${typeof v === "string" ? truncate(v, 40) : v}`).join(", ")}` : "Processing..."}
      />
    );
  }

  // Has result
  const r = result as Record<string, unknown> | unknown[] | undefined;

  // Error responses
  if (r && typeof r === "object" && !Array.isArray(r)) {
    if ("error" in r && typeof r.error === "string") {
      if (r.error.includes("Trust level")) {
        return <TrustErrorCard result={r as { error: string }} />;
      }
      return <ErrorCard error={r.error} />;
    }
    if ("requiresCiba" in r) {
      return <CibaRequiredCard result={r as { message: string; action?: string; service?: string }} />;
    }
  }

  // Tool-specific rendering
  switch (toolName) {
    // Gmail
    case "gmail_list_emails": {
      const emails = safeArray(r) as EmailItem[];
      if (emails.length > 0) return <EmailListCard emails={emails} />;
      return (
        <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
          <div className="px-4 py-2.5 flex items-center justify-between bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-[12px] font-semibold text-foreground">Inbox</span>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">fetched</span>
          </div>
          <div className="px-4 py-8 flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-xl bg-muted/20 dark:bg-white/[0.03] flex items-center justify-center mb-2">
              <MailCheck className="h-5 w-5 text-muted-foreground/30" />
            </div>
            <p className="text-[12px] font-medium text-muted-foreground/60">Inbox zero</p>
            <p className="text-[10px] text-muted-foreground/40 mt-0.5">No emails found</p>
          </div>
        </div>
      );
    }
    case "gmail_read_email":
      return <EmailDetailCard email={r as EmailDetail} />;
    case "gmail_draft_email":
      return <EmailDraftCard result={r as { id?: string; to?: string; subject?: string; body?: string; status?: string; message?: string }} />;
    case "gmail_send_email":
      return <EmailSentCard result={r as { id?: string; to?: string; subject?: string; body?: string; status?: string; message?: string }} />;

    // Calendar
    case "calendar_list_events": {
      const events = safeArray(r) as CalendarEvent[];
      return <CalendarEventListCard events={events} />;
    }
    case "calendar_check_availability":
      return <CalendarAvailabilityCard result={r as { available?: boolean; busy?: boolean; message?: string }} />;
    case "calendar_create_event":
      return <CalendarEventCreatedCard result={r as CalendarEvent} />;

    // Drive
    case "drive_list_files": {
      const files = safeArray(r) as DriveFile[];
      return <DriveFileListCard files={files} />;
    }
    case "drive_read_document":
      return <DriveDocCard result={r as { title?: string; name?: string; content?: string; body?: string }} />;
    case "drive_create_document":
      return <DriveActionCard result={r as { title?: string; name?: string; message?: string }} action="Document Created" />;
    case "drive_share_document":
      return <DriveActionCard result={r as { title?: string; name?: string; message?: string }} action="Document Shared" />;

    // GitHub
    case "github_list_repos": {
      const repos = safeArray(r) as { name?: string; description?: string; language?: string; stars?: number; url?: string }[];
      return <GitHubRepoListCard repos={repos} />;
    }
    case "github_list_issues":
    case "github_list_prs": {
      const issues = safeArray(r) as { number?: number; title?: string; state?: string; author?: string; labels?: string[]; url?: string }[];
      return <GitHubIssueListCard issues={issues} />;
    }
    case "github_read_issue":
      return (
        <div className="rounded-xl border border-border/40 dark:border-white/[0.08] overflow-hidden">
          <div className="px-4 py-2.5 bg-muted/15 dark:bg-white/[0.02] border-b border-border/20 dark:border-white/[0.04]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground/50">#{(r as { number?: number })?.number}</span>
              <span className="text-[13px] font-semibold text-foreground">{(r as { title?: string })?.title}</span>
            </div>
          </div>
          {(r as { body?: string })?.body && (
            <div className="px-4 py-3">
              <div className="p-3 rounded-lg bg-muted/20 dark:bg-white/[0.02] border border-border/20 dark:border-white/[0.04] max-h-[200px] overflow-y-auto">
                <p className="text-[12px] text-foreground/70 leading-relaxed whitespace-pre-wrap">{truncate((r as { body: string }).body, 1500)}</p>
              </div>
            </div>
          )}
        </div>
      );
    case "github_create_issue":
    case "github_create_comment":
      return (
        <ServiceActionCard
          toolName={toolName}
          status="success"
          details={`${(r as { url?: string })?.url || (r as { status?: string })?.status || "Created successfully"}`}
        />
      );

    // Stripe
    case "stripe_get_balance":
      return <StripeBalanceCard result={r as { available?: { amount: number; currency: string }[]; pending?: { amount: number; currency: string }[] }} />;
    case "stripe_list_payments": {
      const payments = safeArray(r) as { id?: string; amount?: number; currency?: string; status?: string; description?: string; customer?: string; created?: string }[];
      return <StripePaymentListCard payments={payments} />;
    }
    case "stripe_list_customers": {
      const customers = safeArray(r) as StripeCustomer[];
      return <StripeCustomerListCard customers={customers} />;
    }
    case "stripe_list_invoices": {
      const invoices = safeArray(r) as StripeInvoice[];
      return <StripeInvoiceListCard invoices={invoices} />;
    }
    case "stripe_create_invoice":
      return <StripeInvoiceActionCard result={r as { number?: string; id?: string; status?: string; amount_due?: number; customer_name?: string }} action="Invoice Created" />;
    case "stripe_send_invoice":
      return <StripeInvoiceActionCard result={r as { number?: string; id?: string; status?: string; amount_due?: number; customer_name?: string }} action="Invoice Sent" />;

    // Google Sheets
    case "sheets_list_spreadsheets": {
      const spreadsheets = safeArray(r) as SpreadsheetItem[];
      return <SheetsListCard spreadsheets={spreadsheets} />;
    }
    case "sheets_read_spreadsheet":
      return <SheetsDataCard data={r as SpreadsheetData} />;
    case "sheets_create_spreadsheet":
      return <SheetsCreatedCard result={r as { id?: string; title?: string; url?: string; status?: string; message?: string }} />;
    case "sheets_append_rows":
      return <SheetsAppendCard result={r as { spreadsheetId?: string; updatedRange?: string; updatedRows?: number; message?: string }} />;

    // Google Contacts
    case "contacts_list":
    case "contacts_search": {
      const contactItems = safeArray(r) as ContactItem[];
      return <ContactListCard contacts={contactItems} />;
    }
    case "contacts_get":
      return <ContactDetailCard contact={r as ContactDetail} />;

    // Google Tasks
    case "tasks_list_task_lists": {
      const taskLists = safeArray(r) as TaskListItem[];
      return <TaskListsCard lists={taskLists} />;
    }
    case "tasks_list": {
      const taskItems = safeArray(r) as TaskItem[];
      return <TasksListCard taskItems={taskItems} />;
    }
    case "tasks_create":
      return <TaskCreatedCard result={r as { id?: string; title?: string; notes?: string; status?: string; due?: string; message?: string }} />;
    case "tasks_complete":
      return <TaskCompletedCard result={r as { id?: string; title?: string; status?: string; completed?: string; message?: string }} />;

    // Slack
    case "slack_list_channels": {
      const channels = safeArray(r) as SlackChannel[];
      return <SlackChannelListCard channels={channels} />;
    }
    case "slack_read_messages": {
      const msgs = safeArray(r) as SlackMessage[];
      return <SlackMessageListCard messages={msgs} />;
    }
    case "slack_send_message":
      return <SlackSentCard result={r as { ok?: boolean; channel?: string; timestamp?: string; message?: string }} />;

    // Discord
    case "discord_list_servers": {
      const servers = safeArray(r) as DiscordServer[];
      return <DiscordServerListCard servers={servers} />;
    }
    case "discord_list_channels": {
      const dChannels = safeArray(r) as DiscordChannel[];
      return <DiscordChannelListCard channels={dChannels} />;
    }
    case "discord_read_messages": {
      const dMsgs = safeArray(r) as DiscordMessage[];
      return <DiscordMessageListCard messages={dMsgs} />;
    }
    case "discord_send_message":
      return <DiscordSentCard result={r as { id?: string; content?: string; status?: string }} />;

    // LinkedIn
    case "linkedin_get_profile":
      return <LinkedInProfileCard result={r as { name?: string; email?: string; picture?: string; sub?: string }} />;
    case "linkedin_create_post":
      return <LinkedInPostCard result={r as { status?: string; id?: string; message?: string }} />;
    case "linkedin_get_connections":
      return <LinkedInConnectionsCard result={r as { profile?: { name?: string; email?: string }; note?: string }} />;

    // Shopify
    case "shopify_list_products":
      return <ShopifyProductListCard result={r as { products?: ShopifyProduct[]; note?: string; tokenAvailable?: boolean }} />;
    case "shopify_list_orders":
      return <ShopifyOrderListCard result={r as { orders?: ShopifyOrder[]; note?: string; tokenAvailable?: boolean }} />;
    case "shopify_get_product":
      return <ShopifyProductDetailCard result={r as { product?: ShopifyProduct | null; note?: string; tokenAvailable?: boolean }} />;

    // CIBA
    case "create_ciba_request":
      return <CibaRequiredCard result={r as { message: string; action?: string; service?: string }} />;

    // Fallback: try to render as generic table if array
    default: {
      if (Array.isArray(r) && r.length > 0 && typeof r[0] === "object") {
        return <GenericTableCard data={r as Record<string, unknown>[] } />;
      }
      // Generic success card
      return (
        <ServiceActionCard
          toolName={toolName}
          status="success"
          details={r ? (typeof r === "string" ? r : JSON.stringify(r).slice(0, 200)) : "Completed"}
        />
      );
    }
  }
}
