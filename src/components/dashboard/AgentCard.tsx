"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
} from "lucide-react";
import { TRUST_LEVEL_NAMES, SERVICE_DISPLAY, type TrustLevel } from "@/lib/trust/levels";
import { TrustGauge } from "./TrustGauge";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
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

  return (
    <Link href={`/dashboard/employee/${agent.slug}`}>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20 cursor-pointer">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${agent.avatarGradient} flex items-center justify-center text-sm font-bold text-white shadow-sm`}>
            {agent.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-medium text-white truncate">{agent.name}</h3>
            <p className="text-[11px] text-neutral-500 truncate">{agent.role}</p>
          </div>
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${
            trust.level === 0 ? "bg-red-500/10 text-red-400" :
            trust.level === 1 ? "bg-amber-500/10 text-amber-400" :
            trust.level === 2 ? "bg-yellow-500/10 text-yellow-400" :
            "bg-emerald-500/10 text-emerald-400"
          }`}>
            {levelName}
          </span>
        </div>

        {/* Trust gauge */}
        <div className="flex justify-center mb-4">
          <TrustGauge score={trust.decayedScore} level={trust.level} agentName={agent.slug} />
        </div>

        {/* Services */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {agent.services.map((s: string) => {
            const display = SERVICE_DISPLAY[s];
            return (
              <span key={s} className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-white/[0.04] text-neutral-500">
                {display?.label || s}
              </span>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
