"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Search,
  MoreHorizontal,
  Check,
  CheckCheck,
  Paperclip,
  Smile,
  Circle,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  time: string;
  read: boolean;
}

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

const CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    agentName: "Nova",
    agentRole: "Senior Engineer",
    agentGradient: "from-indigo-500 to-violet-500",
    status: "online",
    trustLevel: 3,
    lastMessage: "Deployment to staging completed successfully. All 47 tests passing.",
    lastTime: "2m ago",
    unread: 2,
    messages: [
      { id: "m1", sender: "agent", text: "Good morning! I've started the code review for PR #234. Found 3 issues so far.", time: "9:00 AM", read: true },
      { id: "m2", sender: "user", text: "What kind of issues?", time: "9:05 AM", read: true },
      { id: "m3", sender: "agent", text: "Two are minor - unused imports and a missing type annotation. The third is a potential memory leak in the WebSocket handler. I've drafted fixes for all three.", time: "9:06 AM", read: true },
      { id: "m4", sender: "user", text: "Go ahead and push the fixes. Make sure to run the full test suite after.", time: "9:10 AM", read: true },
      { id: "m5", sender: "agent", text: "Done. All fixes pushed to the feature branch. Running tests now.", time: "9:15 AM", read: true },
      { id: "m6", sender: "agent", text: "Tests complete - 47/47 passing. No regressions detected.", time: "9:22 AM", read: true },
      { id: "m7", sender: "user", text: "Perfect. Deploy to staging when ready.", time: "9:25 AM", read: true },
      { id: "m8", sender: "agent", text: "Deployment to staging completed successfully. All 47 tests passing.", time: "9:32 AM", read: false },
      { id: "m9", sender: "agent", text: "Also flagged a dependency update - express 4.19.2 has a security patch. Should I create a separate PR?", time: "9:33 AM", read: false },
    ],
  },
  {
    id: "conv-2",
    agentName: "Atlas",
    agentRole: "Data Analyst",
    agentGradient: "from-emerald-500 to-teal-500",
    status: "busy",
    trustLevel: 2,
    lastMessage: "The Q1 revenue report is ready. Want me to share it with the team?",
    lastTime: "15m ago",
    unread: 1,
    messages: [
      { id: "m1", sender: "user", text: "Atlas, I need the Q1 revenue breakdown by region.", time: "8:30 AM", read: true },
      { id: "m2", sender: "agent", text: "On it. Pulling data from the analytics warehouse now. This usually takes about 5 minutes for the full dataset.", time: "8:31 AM", read: true },
      { id: "m3", sender: "agent", text: "Data pulled. Processing 1.2M rows. Here's the preliminary breakdown:\n\n- NA: $4.2M (+12% YoY)\n- EU: $2.8M (+8% YoY)\n- APAC: $1.9M (+23% YoY)\n- LATAM: $680K (+5% YoY)", time: "8:37 AM", read: true },
      { id: "m4", sender: "user", text: "APAC growth is impressive. Can you dig deeper into that?", time: "8:40 AM", read: true },
      { id: "m5", sender: "agent", text: "APAC breakdown: Japan ($820K, +18%), Australia ($440K, +31%), Singapore ($340K, +28%), India ($300K, +19%). Australia and Singapore are the standout performers - both driven by enterprise deals closed in Feb.", time: "8:45 AM", read: true },
      { id: "m6", sender: "agent", text: "The Q1 revenue report is ready. Want me to share it with the team?", time: "8:50 AM", read: false },
    ],
  },
  {
    id: "conv-3",
    agentName: "Cipher",
    agentRole: "Security Analyst",
    agentGradient: "from-rose-500 to-pink-500",
    status: "online",
    trustLevel: 2,
    lastMessage: "Vulnerability scan complete. 2 medium-severity findings documented.",
    lastTime: "1h ago",
    unread: 0,
    messages: [
      { id: "m1", sender: "agent", text: "Starting scheduled vulnerability scan on production infrastructure.", time: "7:00 AM", read: true },
      { id: "m2", sender: "agent", text: "Scan complete. Found 2 medium-severity issues:\n\n1. Outdated TLS config on api-gateway (TLS 1.1 still enabled)\n2. Missing rate limiting on /api/v2/search endpoint", time: "7:45 AM", read: true },
      { id: "m3", sender: "user", text: "Create tickets for both and assign them priority.", time: "7:50 AM", read: true },
      { id: "m4", sender: "agent", text: "Vulnerability scan complete. 2 medium-severity findings documented.", time: "7:52 AM", read: true },
    ],
  },
  {
    id: "conv-4",
    agentName: "Pixel",
    agentRole: "UI Designer",
    agentGradient: "from-amber-500 to-orange-500",
    status: "offline",
    trustLevel: 1,
    lastMessage: "Mockups for the new dashboard are ready for review.",
    lastTime: "3h ago",
    unread: 0,
    messages: [
      { id: "m1", sender: "user", text: "We need a redesign for the analytics dashboard. Focus on data density.", time: "6:00 AM", read: true },
      { id: "m2", sender: "agent", text: "Understood. I'll create 3 variants - one minimal, one data-dense, one balanced. Give me about 2 hours.", time: "6:05 AM", read: true },
      { id: "m3", sender: "agent", text: "Mockups for the new dashboard are ready for review.", time: "8:10 AM", read: true },
    ],
  },
  {
    id: "conv-5",
    agentName: "Relay",
    agentRole: "Support Agent",
    agentGradient: "from-sky-500 to-blue-500",
    status: "online",
    trustLevel: 1,
    lastMessage: "Handled 23 tickets today. 4 escalated to engineering.",
    lastTime: "5h ago",
    unread: 0,
    messages: [
      { id: "m1", sender: "agent", text: "Daily support summary:\n\n- 23 tickets resolved\n- Average response time: 2.3 minutes\n- Customer satisfaction: 4.8/5\n- 4 tickets escalated to engineering (auth issues)", time: "5:00 PM", read: true },
      { id: "m2", sender: "user", text: "What are the auth issues about?", time: "5:10 PM", read: true },
      { id: "m3", sender: "agent", text: "Handled 23 tickets today. 4 escalated to engineering.", time: "5:12 PM", read: true },
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

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState(CONVERSATIONS[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const selected = CONVERSATIONS.find((c) => c.id === selectedId)!;
  const filtered = searchQuery
    ? CONVERSATIONS.filter(
        (c) =>
          c.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.agentRole.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : CONVERSATIONS;

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
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br shadow-sm",
                    conv.agentGradient
                  )}
                >
                  {conv.agentName[0]}
                </div>
                <div
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-background",
                    STATUS_COLOR[conv.status]
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[13px] font-medium text-foreground truncate">
                    {conv.agentName}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 shrink-0 ml-2">
                    {conv.lastTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-muted-foreground/70 truncate pr-2">
                    {conv.lastMessage}
                  </p>
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
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-border/40 dark:border-white/[0.08] shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br",
                  selected.agentGradient
                )}
              >
                {selected.agentName[0]}
              </div>
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background",
                  STATUS_COLOR[selected.status]
                )}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">{selected.agentName}</h2>
                <Bot className="h-3 w-3 text-muted-foreground/40" />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                <span>{selected.agentRole}</span>
                <span className="text-muted-foreground/30">|</span>
                <span>{TRUST_LABEL[selected.trustLevel]}</span>
                <span className="text-muted-foreground/30">|</span>
                <span className="capitalize">{selected.status}</span>
              </div>
            </div>
          </div>
          <button className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 dark:hover:bg-white/[0.06] transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {selected.messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed",
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted/50 dark:bg-white/[0.06] text-foreground rounded-bl-md border border-border/30 dark:border-white/[0.06]"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div
                  className={cn(
                    "flex items-center gap-1 mt-1",
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px]",
                      msg.sender === "user"
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground/50"
                    )}
                  >
                    {msg.time}
                  </span>
                  {msg.sender === "user" &&
                    (msg.read ? (
                      <CheckCheck className="h-3 w-3 text-primary-foreground/60" />
                    ) : (
                      <Check className="h-3 w-3 text-primary-foreground/40" />
                    ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/40 dark:border-white/[0.08]">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Message ${selected.agentName}...`}
                rows={1}
                className="w-full resize-none rounded-xl border border-border/50 dark:border-white/[0.08] bg-muted/20 dark:bg-white/[0.03] px-4 py-3 pr-20 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/30 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    setMessageInput("");
                  }
                }}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                  <Paperclip className="h-3.5 w-3.5" />
                </button>
                <button className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                  <Smile className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <button
              className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors shadow-sm"
              onClick={() => setMessageInput("")}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
