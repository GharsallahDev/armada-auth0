"use client";

import { useState } from "react";
import { ShieldOff, Loader2 } from "lucide-react";

interface KillSwitchProps {
  onRevoke: () => void;
}

export function KillSwitch({ onRevoke }: KillSwitchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleConfirm() {
    setIsLoading(true);
    try {
      await fetch("/api/trust/revoke-all", { method: "POST" });
      onRevoke();
    } catch (error) {
      console.error("Failed to revoke all trust:", error);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-red-400/80">Revoke all trust?</span>
        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          {isLoading ? "Revoking..." : "Confirm"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isLoading}
          className="h-8 px-3 rounded-xl text-[12px] font-medium text-muted-foreground border border-border/50 hover:bg-muted/50 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-2 h-8 px-3.5 rounded-xl text-[12px] font-medium border border-red-500/20 text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
    >
      <ShieldOff className="h-3.5 w-3.5" />
      Kill Switch
    </button>
  );
}
