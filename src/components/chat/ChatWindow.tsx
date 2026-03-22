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

const TOOL_LABELS: Record<string, { agent: string; action: string; color: string }> = {
  check_all_trust_levels: { agent: "Orchestrator", action: "Checking trust levels", color: "text-indigo-400" },
  check_action_permission: { agent: "Orchestrator", action: "Checking permissions", color: "text-indigo-400" },
  gmail_list_emails: { agent: "Comms", action: "Reading inbox", color: "text-blue-400" },
  gmail_read_email: { agent: "Comms", action: "Reading email", color: "text-blue-400" },
  gmail_draft_email: { agent: "Comms", action: "Drafting email", color: "text-blue-400" },
  gmail_send_email: { agent: "Comms", action: "Sending email", color: "text-blue-400" },
  slack_list_channels: { agent: "Comms", action: "Listing Slack channels", color: "text-blue-400" },
  slack_read_messages: { agent: "Comms", action: "Reading Slack messages", color: "text-blue-400" },
  slack_send_message: { agent: "Comms", action: "Sending Slack message", color: "text-blue-400" },
  calendar_list_events: { agent: "Scheduler", action: "Checking calendar", color: "text-purple-400" },
  calendar_check_availability: { agent: "Scheduler", action: "Checking availability", color: "text-purple-400" },
  calendar_create_event: { agent: "Scheduler", action: "Creating event", color: "text-purple-400" },
  stripe_get_balance: { agent: "Finance", action: "Checking balance", color: "text-green-400" },
  stripe_list_payments: { agent: "Finance", action: "Listing payments", color: "text-green-400" },
  stripe_list_customers: { agent: "Finance", action: "Listing customers", color: "text-green-400" },
  stripe_list_invoices: { agent: "Finance", action: "Listing invoices", color: "text-green-400" },
  stripe_create_invoice: { agent: "Finance", action: "Creating invoice", color: "text-green-400" },
  stripe_send_invoice: { agent: "Finance", action: "Sending invoice", color: "text-green-400" },
  drive_list_files: { agent: "Docs", action: "Listing files", color: "text-orange-400" },
  drive_read_document: { agent: "Docs", action: "Reading document", color: "text-orange-400" },
  drive_create_document: { agent: "Docs", action: "Creating document", color: "text-orange-400" },
  drive_share_document: { agent: "Docs", action: "Sharing document", color: "text-orange-400" },
  create_ciba_request: { agent: "CIBA", action: "Requesting approval", color: "text-amber-400" },
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
            <Shield className="size-10 text-indigo-500/30" />
            <p className="text-sm text-neutral-500">Start a conversation with Armada</p>
            <div className="flex flex-wrap gap-2 mt-2 max-w-md justify-center">
              {["Check my Stripe balance", "List my Slack channels", "What's on my calendar today?", "Show my recent emails"].map((suggestion) => (
                <span key={suggestion} className="text-xs text-neutral-600 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1">
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
                            <Loader2 className={cn("size-3 animate-spin", label?.color || "text-neutral-500")} />
                          ) : (
                            <Wrench className={cn("size-3", label?.color || "text-neutral-500")} />
                          )}
                          <span className={cn("font-medium", label?.color || "text-neutral-500")}>
                            {label?.agent || "Agent"}
                          </span>
                          <span className="text-neutral-600">
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
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                      <Shield className="size-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-white/[0.04] text-neutral-200 border border-white/[0.06]"
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
                              <pre className="my-2 overflow-x-auto rounded-md bg-black/20 p-3 text-xs">
                                <code>{children}</code>
                              </pre>
                            ) : (
                              <code className="rounded bg-white/[0.08] px-1 py-0.5 text-xs">{children}</code>
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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
              <Shield className="size-4" />
            </div>
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-indigo-400" />
              <span className="text-sm text-neutral-400">Agents are thinking...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
