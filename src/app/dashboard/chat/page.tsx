"use client";

import { useChat } from "@ai-sdk/react";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { Shield } from "lucide-react";

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat();

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Armada Chat</h1>
            <p className="text-xs text-muted-foreground">
              Talk to your agent fleet — they&apos;ll coordinate across services
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow messages={messages} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <ChatInput
          onSend={(text) => sendMessage({ text })}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
