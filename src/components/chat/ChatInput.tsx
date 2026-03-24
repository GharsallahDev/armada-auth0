"use client";

import type { KeyboardEvent } from "react";
import { SendHorizontal, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, isLoading }: ChatInputProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        e.currentTarget.form?.requestSubmit();
      }
    }
  }

  return (
    <div className="flex items-end gap-2">
      <div className="relative flex-1">
        <Textarea
          name="prompt"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Agents are working..." : "Ask Armada to help with your business..."}
          disabled={isLoading}
          className="min-h-[44px] resize-none pr-2 bg-muted/30 border-border/50 text-foreground placeholder:text-muted-foreground"
          rows={1}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="shrink-0 h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-colors"
      >
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <SendHorizontal className="size-4" />}
      </button>
    </div>
  );
}
