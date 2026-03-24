"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
} from "lucide-react";
import { TRUST_LEVEL_NAMES, SERVICE_DISPLAY, type TrustLevel } from "@/lib/trust/levels";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
};

const LEVEL_COLORS: Record<number, { bg: string; text: string; border: string; glow: string }> = {
  0: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", glow: "shadow-red-500/5" },
  1: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", glow: "shadow-amber-500/5" },
  2: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", glow: "shadow-blue-500/5" },
  3: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", glow: "shadow-emerald-500/5" },
};

interface Agent {
  name: string;
  slug: string;
  role: string;
  services: string[];
  avatarGradient: string;
  status: string;
}

interface AgentCardProps {
  agent: Agent;
  trust: { score: number; level: number; decayedScore: number };
}

export function AgentCard({ agent, trust }: AgentCardProps) {
  const levelName = TRUST_LEVEL_NAMES[trust.level as TrustLevel] ?? "Unknown";
  const colors = LEVEL_COLORS[trust.level] || LEVEL_COLORS[0];
  const maxScore = trust.level === 0 ? 100 : trust.level === 1 ? 300 : trust.level === 2 ? 750 : 1000;
  const progressValue = Math.min((trust.decayedScore / maxScore) * 100, 100);

  return (
    <Link href={`/dashboard/employee/${agent.slug}`}>
      <div className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colors.glow} cursor-pointer p-5`}>
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${agent.avatarGradient} flex items-center justify-center text-sm font-bold text-white shadow-lg ring-1 ring-white/20`}>
              {agent.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-semibold text-foreground truncate">{agent.name}</h3>
              <p className="text-[11px] text-muted-foreground truncate">{agent.role}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${colors.bg} ${colors.text} ${colors.border} border`}>
              {levelName}
            </span>
          </div>

          {/* Trust progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Trust</span>
              <span className={`font-bold tabular-nums ${colors.text}`}>{trust.decayedScore} pts</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${colors.bg.replace('/10', '')}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressValue}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ backgroundColor: trust.level === 0 ? "#ef4444" : trust.level === 1 ? "#f59e0b" : trust.level === 2 ? "#3b82f6" : "#10b981" }}
              />
            </div>
          </div>

          {/* Services */}
          <div className="flex flex-wrap gap-1.5">
            {agent.services.map((s: string) => {
              const display = SERVICE_DISPLAY[s];
              const IconComp = display ? ICON_MAP[display.icon] : null;
              return (
                <span key={s} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground border border-border/30">
                  {IconComp && <IconComp className="h-3 w-3" />}
                  {display?.label || s}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </Link>
  );
}
