"use client";

import { useState } from "react";
import { ShieldOff } from "lucide-react";

interface KillSwitchProps {
  onRevoke: () => void;
}

export function KillSwitch({ onRevoke }: KillSwitchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleConfirm() {
    setIsLoading(true);
    try {
      await fetch("/api/trust/revoke-all", {
        method: "POST",
      });
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
          className="h-8 px-3 rounded-lg text-[12px] font-medium bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Revoking..." : "Confirm"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isLoading}
          className="h-8 px-3 rounded-lg text-[12px] font-medium text-neutral-400 border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-2 h-8 px-3.5 rounded-lg text-[12px] font-medium border border-red-500/20 text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
    >
      <ShieldOff className="h-3.5 w-3.5" />
      Kill Switch
    </button>
  );
}
