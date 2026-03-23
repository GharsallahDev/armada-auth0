"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useMemo, type KeyboardEvent } from "react";
import { SendHorizontal, Loader2, User } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <ScrollArea className="h-[540px]" ref={scrollRef}>
        <div className="p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[480px] text-center gap-3">
            <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-xl font-bold text-primary-foreground shadow-lg ring-1 ring-border`}>
              {agentName[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Chat with {agentName}</p>
              <p className="text-xs text-muted-foreground mt-1">Ask them to help with their assigned tasks</p>
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
                <Avatar size="sm"><AvatarFallback><User className="h-3 w-3" /></AvatarFallback></Avatar>
              ) : (
                <div className={`h-6 w-6 rounded-md bg-gradient-to-br ${avatarGradient} flex items-center justify-center shrink-0`}>
                  <span className="text-[9px] font-bold text-primary-foreground">{agentName[0]}</span>
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                isUser ? "bg-primary/15 text-foreground" : "bg-muted text-foreground/90 ring-1 ring-border"
              }`}>
                {message.parts?.map((part, i) => {
                  if (part.type === "text") return <span key={i}>{part.text}</span>;
                  if (part.type.startsWith("tool-")) {
                    return <Badge key={i} variant="secondary" className="my-1 gap-1">{part.type.replace(/^tool-/, "").replace(/_/g, " ")}</Badge>;
                  }
                  return null;
                })}
              </div>
            </motion.div>
          );
        })}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className={`h-6 w-6 rounded-md bg-gradient-to-br ${avatarGradient} flex items-center justify-center`}>
              <span className="text-[9px] font-bold text-primary-foreground">{agentName[0]}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted ring-1 ring-border">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
        </div>
      </ScrollArea>
      <div className="border-t border-border p-4">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agentName}...`}
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
