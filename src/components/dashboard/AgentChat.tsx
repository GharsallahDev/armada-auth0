"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useMemo, type KeyboardEvent } from "react";
import { SendHorizontal, Loader2, Bot, User } from "lucide-react";
import { motion } from "framer-motion";

interface AgentChatProps {
  slug: string;
  agentName: string;
  avatarGradient: string;
}

export function AgentChat({ slug, agentName, avatarGradient }: AgentChatProps) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: `/api/chat/${slug}` }),
    [slug],
  );
  const { messages, sendMessage, status } = useChat({ transport });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

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
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-lg font-bold text-white mb-3`}>
              {agentName[0]}
            </div>
            <p className="text-[14px] font-medium text-neutral-300">Chat with {agentName}</p>
            <p className="text-[12px] text-neutral-600 mt-1">Ask them to help with their assigned tasks</p>
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
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                isUser
                  ? "bg-white/[0.08]"
                  : `bg-gradient-to-br ${avatarGradient}`
              }`}>
                {isUser ? (
                  <User className="h-3.5 w-3.5 text-neutral-400" />
                ) : (
                  <span className="text-[10px] font-bold text-white">{agentName[0]}</span>
                )}
              </div>
              <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-[13px] leading-relaxed ${
                isUser
                  ? "bg-indigo-500/[0.15] text-neutral-200"
                  : "bg-white/[0.04] text-neutral-300 border border-white/[0.06]"
              }`}>
                {message.parts?.map((part, i) => {
                  if (part.type === "text") return <span key={i}>{part.text}</span>;
                  if (part.type.startsWith("tool-")) {
                    return (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[11px] font-medium my-1">
                        <Bot className="h-3 w-3" />
                        {part.type.replace(/^tool-/, "").replace(/_/g, " ")}
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </motion.div>
          );
        })}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${avatarGradient} flex items-center justify-center`}>
              <span className="text-[10px] font-bold text-white">{agentName[0]}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
              <span className="text-[12px] text-neutral-500">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agentName}...`}
            rows={1}
            className="flex-1 min-h-[40px] max-h-[120px] px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[13px] text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-10 w-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition-colors disabled:opacity-40"
          >
            <SendHorizontal className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
