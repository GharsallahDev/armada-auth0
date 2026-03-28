"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useMemo, type KeyboardEvent } from "react";
import useSWR from "swr";
import {
  SendHorizontal, Loader2, User, Slash, X, ChevronRight,
  Globe, Mail, Calendar, CreditCard, MessageSquare, Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getCommandsForServices, type ServiceCommand } from "@/lib/service-commands";
import { SERVICE_DISPLAY } from "@/lib/trust/levels";
import { resolveAvatarUrl } from "@/lib/avatar";
import { ToolInvocationCard } from "./ToolResultCards";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ── Slash command palette ──────────────────────────────

const CMD_ICONS: Record<string, React.ReactNode> = {
  _global: <Globe className="h-3.5 w-3.5" />,
  gmail: <Mail className="h-3.5 w-3.5" />,
  calendar: <Calendar className="h-3.5 w-3.5" />,
  drive: <Globe className="h-3.5 w-3.5" />,
  slack: <MessageSquare className="h-3.5 w-3.5" />,
  discord: <MessageSquare className="h-3.5 w-3.5" />,
  stripe: <CreditCard className="h-3.5 w-3.5" />,
  github: <Globe className="h-3.5 w-3.5" />,
  linkedin: <Share2 className="h-3.5 w-3.5" />,
  twitter: <Share2 className="h-3.5 w-3.5" />,
  shopify: <Globe className="h-3.5 w-3.5" />,
};

function SlashPalette({ query, services, onSelect }: { query: string; services: string[]; onSelect: (cmd: string) => void }) {
  const allCmds = useMemo(() => getCommandsForServices(services), [services]);
  const search = query.slice(1).toLowerCase();
  const filtered = allCmds.filter(
    (c) => c.command.toLowerCase().includes(search) || c.label.toLowerCase().includes(search) || c.service.toLowerCase().includes(search)
  );
  if (filtered.length === 0) return null;

  const grouped: Record<string, ServiceCommand[]> = {};
  for (const cmd of filtered) {
    if (!grouped[cmd.service]) grouped[cmd.service] = [];
    grouped[cmd.service].push(cmd);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-border/50 dark:border-white/[0.1] bg-background/95 backdrop-blur-xl shadow-xl overflow-hidden z-50"
    >
      <div className="px-3 py-2 border-b border-border/30 dark:border-white/[0.06] flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Commands</p>
        <p className="text-[10px] text-muted-foreground/30">{services.length} services</p>
      </div>
      <div className="max-h-[300px] overflow-y-auto py-1">
        {Object.entries(grouped).map(([service, cmds]) => (
          <div key={service}>
            <div className="px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-muted-foreground/40">{CMD_ICONS[service] || <Globe className="h-3 w-3" />}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40">
                {service === "_global" ? "General" : SERVICE_DISPLAY[service]?.label || service}
              </span>
            </div>
            {cmds.map((cmd) => (
              <button
                key={cmd.command}
                onClick={() => onSelect(cmd.command + " ")}
                className="w-full flex items-center gap-3 px-3 py-1.5 hover:bg-muted/40 dark:hover:bg-white/[0.06] transition-colors text-left group"
              >
                <div className="flex-1 min-w-0 pl-5">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-foreground">{cmd.command}</span>
                    {cmd.args && (
                      <span className="text-[10px] text-muted-foreground/40 font-mono flex items-center gap-1">
                        {cmd.args}
                        <ChevronRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary/50" />
                      </span>
                    )}
                  </div>
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

// ── Param parsing & guided form ──────────────────────────

interface ParsedParam {
  name: string;
  required: boolean;
  placeholder: string;
}

function parseCommandArgs(args?: string): ParsedParam[] {
  if (!args) return [];
  const matches = args.match(/<[^>]+>|\[[^\]]+\]/g);
  if (!matches) return [];
  return matches.map((m) => {
    const required = m.startsWith("<");
    const name = m.replace(/[<>\[\]]/g, "");
    return {
      name,
      required,
      placeholder: required ? `${name} (required)` : `${name} (optional)`,
    };
  });
}

function CommandParamForm({
  command,
  onSend,
  onCancel,
}: {
  command: ServiceCommand;
  onSend: (text: string) => void;
  onCancel: () => void;
}) {
  const params = useMemo(() => parseCommandArgs(command.args), [command.args]);
  const [values, setValues] = useState<Record<string, string>>({});
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const allRequiredFilled = params
    .filter((p) => p.required)
    .every((p) => (values[p.name] || "").trim().length > 0);

  function handleSubmit() {
    if (!allRequiredFilled) return;
    const parts = [command.command];
    for (const p of params) {
      const v = (values[p.name] || "").trim();
      if (v) parts.push(v);
    }
    onSend(parts.join(" "));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      onCancel();
    }
  }

  const icon = CMD_ICONS[command.service] || <Globe className="h-3.5 w-3.5" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-border/50 dark:border-white/[0.1] bg-background/95 backdrop-blur-xl shadow-xl overflow-hidden z-50"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30 dark:border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-muted-foreground/60">{icon}</span>
          <span className="text-[13px] font-semibold text-foreground font-mono">{command.command}</span>
          <span className="text-[10px] text-muted-foreground/40">—</span>
          <span className="text-[11px] text-muted-foreground/60">{command.description}</span>
        </div>
        <button
          onClick={onCancel}
          className="h-5 w-5 rounded flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground/40 hover:text-muted-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Param fields */}
      <div className="px-4 py-3 space-y-2.5">
        {params.map((p, i) => (
          <div key={p.name} className="flex items-center gap-2.5">
            <div className="w-[100px] shrink-0 flex items-center gap-1.5">
              <span
                className={cn(
                  "text-[11px] font-medium",
                  p.required ? "text-foreground/80" : "text-muted-foreground/50"
                )}
              >
                {p.name}
              </span>
              {p.required && (
                <span className="text-[8px] font-bold uppercase tracking-wider text-red-400/70 bg-red-500/10 px-1 py-0.5 rounded">
                  req
                </span>
              )}
            </div>
            <input
              ref={i === 0 ? firstRef : undefined}
              type="text"
              value={values[p.name] || ""}
              onChange={(e) => setValues((v) => ({ ...v, [p.name]: e.target.value }))}
              onKeyDown={handleKeyDown}
              placeholder={p.placeholder}
              className={cn(
                "flex-1 text-[12px] px-3 py-1.5 rounded-lg border bg-transparent transition-all focus:outline-none focus:ring-1",
                p.required
                  ? "border-border/50 dark:border-white/[0.08] focus:ring-primary/40 focus:border-primary/30"
                  : "border-border/30 dark:border-white/[0.05] focus:ring-muted-foreground/20 focus:border-muted-foreground/20",
                "placeholder:text-muted-foreground/30 text-foreground"
              )}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border/30 dark:border-white/[0.06] flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground/40">
          {params.filter((p) => p.required).length} required
          {params.filter((p) => !p.required).length > 0 && `, ${params.filter((p) => !p.required).length} optional`}
          {" · Enter to send · Esc to cancel"}
        </p>
        <button
          onClick={handleSubmit}
          disabled={!allRequiredFilled}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium transition-all",
            allRequiredFilled
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted/40 text-muted-foreground/30 cursor-not-allowed"
          )}
        >
          Send
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}

// ── AgentChat (outer loader) ──────────────────────────

interface AgentChatProps {
  slug: string;
  agentName: string;
  avatarGradient: string;
  avatarUrl?: string | null;
  services?: string[];
  fillHeight?: boolean;
}

export function AgentChat({ slug, agentName, avatarGradient, avatarUrl, services = [], fillHeight }: AgentChatProps) {
  const { data: history, isLoading: historyLoading } = useSWR<UIMessage[]>(
    `/api/chat/${slug}/history`,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (historyLoading) {
    return (
      <div className={cn("flex items-center justify-center", fillHeight ? "h-full" : "h-[600px]")}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Key forces remount if slug changes, ensuring useChat re-initializes
  return (
    <AgentChatInner
      key={slug}
      slug={slug}
      agentName={agentName}
      avatarGradient={avatarGradient}
      avatarUrl={avatarUrl}
      services={services}
      fillHeight={fillHeight}
      initialMessages={history && history.length > 0 ? history : undefined}
    />
  );
}

// ── AgentChatInner (actual chat, mounts AFTER history loads) ──

interface AgentChatInnerProps extends AgentChatProps {
  initialMessages?: UIMessage[];
}

function AgentChatInner({ slug, agentName, avatarGradient, avatarUrl, services = [], fillHeight, initialMessages }: AgentChatInnerProps) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: `/api/chat/${slug}` }),
    [slug],
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: initialMessages,
  });

  const [input, setInput] = useState("");
  const [activeCommand, setActiveCommand] = useState<ServiceCommand | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";
  const showPalette = !activeCommand && input.startsWith("/") && !input.includes(" ");

  // Messages are now saved server-side in the chat route
  // No need for client-side persistence
  const prevCountRef = useRef(initialMessages?.length ?? 0);
  useEffect(() => {
    if (status !== "ready") return;
    prevCountRef.current = messages.length;
  }, [status, messages, slug]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage({ text });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      if (activeCommand) setActiveCommand(null);
      else if (showPalette) setInput("");
    }
  }

  const allCmds = useMemo(() => getCommandsForServices(services), [services]);

  function handleSelectCommand(cmd: string) {
    const matched = allCmds.find((c) => c.command + " " === cmd || c.command === cmd);
    if (matched?.args) {
      setActiveCommand(matched);
      setInput("");
    } else {
      setInput(cmd);
    }
  }

  function handleParamSend(text: string) {
    setActiveCommand(null);
    setInput("");
    sendMessage({ text });
  }

  return (
    <div className={cn("flex flex-col", fillHeight ? "h-full" : "h-[600px]")}>
      <div className={cn("overflow-y-auto", fillHeight ? "flex-1 min-h-0" : "h-[540px]")} ref={scrollRef}>
        <div className="p-6 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className={cn("flex flex-col items-center justify-center text-center gap-3", fillHeight ? "h-[400px]" : "h-[480px]")}>
            <div className="h-14 w-14 rounded-xl bg-muted/30 overflow-hidden shadow-lg ring-1 ring-border">
              <img src={resolveAvatarUrl(avatarUrl, slug)} alt={agentName} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Chat with {agentName}</p>
              <p className="text-xs text-muted-foreground mt-1">Ask them to help with their assigned tasks</p>
              {services.length > 0 && (
                <p className="text-[10px] text-muted-foreground/50 mt-2">
                  Type <span className="font-mono text-primary/70 bg-primary/5 px-1 py-0.5 rounded">/</span> for commands
                </p>
              )}
            </div>
          </div>
        )}
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
            >
              {isUser ? (
                <Avatar className="h-6 w-6 shrink-0"><AvatarFallback><User className="h-3 w-3" /></AvatarFallback></Avatar>
              ) : (
                <div className="h-6 w-6 rounded-md bg-muted/30 overflow-hidden shrink-0">
                  <img src={resolveAvatarUrl(avatarUrl, slug)} alt={agentName} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="max-w-[85%] space-y-2">
                {message.parts?.map((part, i) => {
                  // Text parts
                  if (part.type === "text" && part.text) {
                    const isCommand = isUser && part.text.startsWith("/");
                    return (
                      <div key={i} className={cn(
                        "rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                        isUser
                          ? isCommand
                            ? "bg-[#0d1117] dark:bg-black/60 text-gray-300 font-mono border border-border/20 dark:border-white/[0.06]"
                            : "bg-primary/15 text-foreground"
                          : "bg-muted text-foreground/90 ring-1 ring-border"
                      )}>
                        {isCommand && <Slash className="h-3 w-3 inline mr-1 opacity-50" />}
                        <span className="whitespace-pre-wrap">{part.text}</span>
                      </div>
                    );
                  }

                  // Tool invocation parts
                  if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
                    const toolPart = part as unknown as {
                      type: string;
                      toolName?: string;
                      toolCallId?: string;
                      state: string;
                      input?: unknown;
                      output?: unknown;
                    };
                    const toolName = toolPart.toolName || toolPart.type.replace(/^tool-/, "");
                    const isComplete = toolPart.state === "output-available";
                    const isRunning = toolPart.state === "input-streaming" || toolPart.state === "input-available";
                    return (
                      <div key={i} className="my-1">
                        <ToolInvocationCard
                          toolName={toolName}
                          state={isComplete ? "result" : isRunning ? "call" : toolPart.state}
                          args={toolPart.input as Record<string, unknown> | undefined}
                          result={isComplete ? toolPart.output : undefined}
                        />
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </motion.div>
          );
        })}
        {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === "user") && (
          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-md bg-muted/30 overflow-hidden">
              <img src={resolveAvatarUrl(avatarUrl, slug)} alt={agentName} className="h-full w-full object-cover" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted ring-1 ring-border">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
        </div>
      </div>
      <div className="border-t border-border p-4 relative z-20 overflow-visible shrink-0">
        <AnimatePresence>
          {showPalette && services.length > 0 && (
            <SlashPalette query={input} services={services} onSelect={handleSelectCommand} />
          )}
          {activeCommand && (
            <CommandParamForm
              command={activeCommand}
              onSend={handleParamSend}
              onCancel={() => setActiveCommand(null)}
            />
          )}
        </AnimatePresence>
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agentName}... (type / for commands)`}
            rows={1}
            className="min-h-[40px] max-h-[120px] resize-none"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon">
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
