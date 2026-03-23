"use client";

import { useEffect, useRef } from "react";
import { Shield, Loader2, Wrench } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";

interface ChatWindowProps {
  messages: UIMessage[];
  isLoading: boolean;
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function getToolCalls(message: UIMessage) {
  return message.parts.filter(
    (part) => part.type.startsWith("tool-")
  );
}

const TOOL_LABELS: Record<string, { action: string; color: string }> = {
  gmail_list_emails: { action: "Reading inbox", color: "text-blue-400" },
  gmail_read_email: { action: "Reading email", color: "text-blue-400" },
  gmail_draft_email: { action: "Drafting email", color: "text-blue-400" },
  gmail_send_email: { action: "Sending email", color: "text-blue-400" },
  slack_list_channels: { action: "Listing channels", color: "text-blue-400" },
  slack_read_messages: { action: "Reading messages", color: "text-blue-400" },
  slack_send_message: { action: "Sending message", color: "text-blue-400" },
  calendar_list_events: { action: "Checking calendar", color: "text-purple-400" },
  calendar_check_availability: { action: "Checking availability", color: "text-purple-400" },
  calendar_create_event: { action: "Creating event", color: "text-purple-400" },
  stripe_get_balance: { action: "Checking balance", color: "text-green-400" },
  stripe_list_payments: { action: "Listing payments", color: "text-green-400" },
  stripe_list_customers: { action: "Listing customers", color: "text-green-400" },
  stripe_list_invoices: { action: "Listing invoices", color: "text-green-400" },
  stripe_create_invoice: { action: "Creating invoice", color: "text-green-400" },
  stripe_send_invoice: { action: "Sending invoice", color: "text-green-400" },
  drive_list_files: { action: "Listing files", color: "text-orange-400" },
  drive_read_document: { action: "Reading document", color: "text-orange-400" },
  drive_create_document: { action: "Creating document", color: "text-orange-400" },
  drive_share_document: { action: "Sharing document", color: "text-orange-400" },
  github_list_repos: { action: "Listing repos", color: "text-neutral-400" },
  github_list_issues: { action: "Listing issues", color: "text-neutral-400" },
  github_read_issue: { action: "Reading issue", color: "text-neutral-400" },
  github_create_issue: { action: "Creating issue", color: "text-neutral-400" },
  github_create_comment: { action: "Commenting", color: "text-neutral-400" },
  github_list_prs: { action: "Listing PRs", color: "text-neutral-400" },
  discord_list_servers: { action: "Listing servers", color: "text-violet-400" },
  discord_list_channels: { action: "Listing channels", color: "text-violet-400" },
  discord_read_messages: { action: "Reading messages", color: "text-violet-400" },
  discord_send_message: { action: "Sending message", color: "text-violet-400" },
  create_ciba_request: { action: "Requesting approval", color: "text-amber-400" },
};

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col gap-4 p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Shield className="size-10 text-primary/30" />
            <p className="text-sm text-muted-foreground">Start a conversation with Armada</p>
            <div className="flex flex-wrap gap-2 mt-2 max-w-md justify-center">
              {["Check my Stripe balance", "List my Slack channels", "What's on my calendar today?", "Show my recent emails"].map((suggestion) => (
                <span key={suggestion} className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-full px-3 py-1">
                  {suggestion}
                </span>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const text = getMessageText(message);
          const toolCalls = getToolCalls(message);

          return (
            <div key={message.id}>
              {/* Tool call indicators */}
              {message.role === "assistant" && toolCalls.length > 0 && (
                <div className="flex gap-3 mb-2">
                  <div className="w-8" /> {/* Spacer for avatar alignment */}
                  <div className="flex flex-col gap-1">
                    {toolCalls.map((tc, i) => {
                      const toolName = "toolName" in tc ? String(tc.toolName) : "unknown";
                      const state = "state" in tc ? String(tc.state) : "result";
                      const label = TOOL_LABELS[toolName];
                      const isRunning = state === "call" || state === "partial-call" || state === "input-streaming";
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {isRunning ? (
                            <Loader2 className={cn("size-3 animate-spin", label?.color || "text-muted-foreground")} />
                          ) : (
                            <Wrench className={cn("size-3", label?.color || "text-muted-foreground")} />
                          )}
                          <span className={cn("font-medium", label?.color || "text-muted-foreground")}>
                            {label?.action || toolName}
                            {isRunning ? "..." : " ✓"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Message bubble */}
              {text && (
                <div
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Shield className="size-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-foreground border border-border"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="mb-2 list-disc pl-4 last:mb-0">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-2 list-decimal pl-4 last:mb-0">{children}</ol>,
                          code: ({ children, className }) => {
                            const isBlock = className?.includes("language-");
                            return isBlock ? (
                              <pre className="my-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">
                                <code>{children}</code>
                              </pre>
                            ) : (
                              <code className="rounded bg-muted px-1 py-0.5 text-xs">{children}</code>
                            );
                          },
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        }}
                      >
                        {text}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{text}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Thinking indicator */}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield className="size-4" />
            </div>
            <div className="bg-muted/50 border border-border rounded-xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Agents are thinking...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
