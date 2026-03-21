"use client";

import { useState, type KeyboardEvent } from "react";
import { SendHorizontal, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");

  function handleSubmit() {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput("");
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex items-end gap-2">
      <div className="relative flex-1">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isLoading
              ? "Agent is thinking..."
              : "Ask Armada to help with your business..."
          }
          disabled={isLoading}
          className="min-h-[44px] resize-none pr-2 bg-white/[0.03] border-white/[0.08] text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-white/[0.1]"
          rows={1}
        />
      </div>
      <Button
        type="button"
        size="icon"
        disabled={isLoading || !input.trim()}
        onClick={handleSubmit}
        className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white"
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <SendHorizontal className="size-4" />
        )}
      </Button>
    </div>
  );
}
