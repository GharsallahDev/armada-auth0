"use client";

import { useChat } from "@ai-sdk/react";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Shield } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { SendHorizontal, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const { messages, sendMessage, status, error } = useChat();
  const [input, setInput] = useState("");

  const isLoading = status === "submitted" || status === "streaming";

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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-white tracking-tight">Armada Chat</h1>
            <p className="text-[11px] text-neutral-500">
              Talk to your agent fleet — they&apos;ll coordinate across services
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow messages={messages} isLoading={isLoading} />
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-4 mb-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2 text-sm text-red-400">
          Error: {error.message}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/[0.06] p-4">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "Agents are working..." : "Ask Armada to help with your business..."}
            disabled={isLoading}
            className="min-h-[44px] flex-1 resize-none bg-white/[0.03] border-white/[0.08] text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-white/[0.1]"
            rows={1}
          />
          <Button
            type="button"
            size="icon"
            disabled={isLoading || !input.trim()}
            onClick={handleSend}
            className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SendHorizontal className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
