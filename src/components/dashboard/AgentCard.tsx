"use client";

import { useState } from "react";
import {
  Brain,
  MessageSquare,
  Calendar,
  DollarSign,
  FileText,
} from "lucide-react";
import {
  AGENT_DISPLAY,
  AGENT_SERVICES,
  TRUST_LEVEL_NAMES,
  type AgentName,
  type TrustLevel,
} from "@/lib/trust/levels";
import { TrustGauge } from "./TrustGauge";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  MessageSquare,
  Calendar,
  DollarSign,
  FileText,
};

interface AgentCardProps {
  agentName: AgentName;
  trust: {
    score: number;
    level: number;
    decayedScore: number;
  };
}

export function AgentCard({ agentName, trust }: AgentCardProps) {
  const [isRevoking, setIsRevoking] = useState(false);
  const display = AGENT_DISPLAY[agentName];
  const services = AGENT_SERVICES[agentName];
  const IconComponent = ICON_MAP[display.icon];
  const color = display.color;
  const levelName = TRUST_LEVEL_NAMES[trust.level as TrustLevel] ?? "Unknown";

  async function handleRevoke() {
    setIsRevoking(true);
    try {
      await fetch(`/api/trust/${agentName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke" }),
      });
    } catch (error) {
      console.error("Failed to revoke trust:", error);
    } finally {
      setIsRevoking(false);
    }
  }

  return (
    <div
      className="rounded-xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        borderColor: `${color}18`,
        background: `linear-gradient(135deg, ${color}06 0%, transparent 60%)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {IconComponent && (
            <IconComponent className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-medium text-white truncate">
            {display.label}
          </h3>
          <p className="text-[11px] text-neutral-500 truncate">
            {display.description}
          </p>
        </div>
        {/* Status dot */}
        <div className="relative flex h-2.5 w-2.5 shrink-0">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-40"
            style={{ backgroundColor: color }}
          />
          <span
            className="relative inline-flex h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>

      {/* Trust gauge */}
      <div className="flex justify-center mb-4">
        <TrustGauge
          score={trust.decayedScore}
          level={trust.level}
          agentName={agentName}
        />
      </div>

      {/* Services */}
      {services.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 mb-4">
          {services.map((service) => (
            <span
              key={service}
              className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium"
              style={{
                backgroundColor: `${color}12`,
                color: `${color}cc`,
              }}
            >
              {service}
            </span>
          ))}
        </div>
      )}

      {/* Revoke */}
      <button
        onClick={handleRevoke}
        disabled={isRevoking || trust.level === 0}
        className="w-full h-7 rounded-md text-[12px] font-medium transition-colors border border-red-500/10 text-red-400/60 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none"
      >
        {isRevoking ? "Revoking..." : "Revoke Trust"}
      </button>
    </div>
  );
}
