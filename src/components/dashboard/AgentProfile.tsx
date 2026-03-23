"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MessageSquare, BarChart3, Settings2, Pause, Play, Trash2,
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
} from "lucide-react";
import { TRUST_LEVEL_NAMES, SERVICE_DISPLAY, type TrustLevel } from "@/lib/trust/levels";
import { TrustGauge } from "./TrustGauge";
import { AgentChat } from "./AgentChat";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
};

interface AgentData {
  id: string;
  name: string;
  slug: string;
  role: string;
  instructions: string;
  services: string[];
  avatarGradient: string;
  status: string;
  createdAt: string;
  trust: { score: number; level: number; decayedScore: number };
}

interface AgentProfileProps {
  agent: AgentData;
  onRefresh: () => void;
}

export function AgentProfile({ agent, onRefresh }: AgentProfileProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "chat" | "performance">("overview");
  const [showTerminate, setShowTerminate] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);

  const levelName = TRUST_LEVEL_NAMES[agent.trust.level as TrustLevel] || "Unknown";
  const daysEmployed = Math.floor((Date.now() - new Date(agent.createdAt).getTime()) / 86400000);

  async function handleTerminate() {
    setIsTerminating(true);
    await fetch(`/api/agents/${agent.slug}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  async function handleTogglePause() {
    const newStatus = agent.status === "paused" ? "active" : "paused";
    await fetch(`/api/agents/${agent.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    onRefresh();
  }

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Settings2 },
    { id: "chat" as const, label: "Chat", icon: MessageSquare },
    { id: "performance" as const, label: "Performance", icon: BarChart3 },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="border-b border-white/[0.06]">
        <div className="px-8 py-6 max-w-[1400px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${agent.avatarGradient} flex items-center justify-center text-xl font-bold text-white shadow-lg`}>
                {agent.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-semibold text-white">{agent.name}</h1>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
                    agent.trust.level === 0 ? "bg-red-500/10 text-red-400" :
                    agent.trust.level === 1 ? "bg-amber-500/10 text-amber-400" :
                    agent.trust.level === 2 ? "bg-yellow-500/10 text-yellow-400" :
                    "bg-emerald-500/10 text-emerald-400"
                  }`}>
                    {levelName}
                  </span>
                </div>
                <p className="text-[13px] text-neutral-500">{agent.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePause}
                className="inline-flex items-center gap-2 h-8 px-3 rounded-lg text-[12px] font-medium border border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                {agent.status === "paused" ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                {agent.status === "paused" ? "Resume" : "Pause"}
              </button>
              {showTerminate ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTerminate}
                    disabled={isTerminating}
                    className="h-8 px-3 rounded-lg text-[12px] font-medium bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                  >
                    {isTerminating ? "Terminating..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setShowTerminate(false)}
                    className="h-8 px-3 rounded-lg text-[12px] font-medium text-neutral-400 border border-white/[0.08] hover:bg-white/[0.04]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowTerminate(true)}
                  className="inline-flex items-center gap-2 h-8 px-3 rounded-lg text-[12px] font-medium border border-red-500/20 text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Terminate
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white/[0.06] text-white"
                    : "text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.03]"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="px-8 py-8 max-w-[1400px]">
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Trust Gauge */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col items-center">
                <TrustGauge score={agent.trust.decayedScore} level={agent.trust.level} agentName={agent.slug} />
              </div>

              {/* Info */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4 col-span-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-600 mb-2">Instructions</p>
                  <p className="text-[13px] text-neutral-300 leading-relaxed">{agent.instructions}</p>
                </div>
                <div className="border-t border-white/[0.06] pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-600 mb-2">Assigned Services</p>
                  <div className="flex flex-wrap gap-2">
                    {agent.services.map((s: string) => {
                      const display = SERVICE_DISPLAY[s];
                      const IconComp = display ? ICON_MAP[display.icon] : null;
                      return (
                        <span key={s} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 px-3 py-1.5 text-[12px] font-medium">
                          {IconComp && <IconComp className="h-3.5 w-3.5" />}
                          {display?.label || s}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="border-t border-white/[0.06] pt-4 flex gap-6">
                  <div>
                    <p className="text-[20px] font-bold text-white">{daysEmployed}</p>
                    <p className="text-[11px] text-neutral-600">Days Employed</p>
                  </div>
                  <div>
                    <p className="text-[20px] font-bold text-white">{agent.trust.score}</p>
                    <p className="text-[11px] text-neutral-600">Trust Points</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "chat" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <AgentChat slug={agent.slug} agentName={agent.name} avatarGradient={agent.avatarGradient} />
            </div>
          </motion.div>
        )}

        {activeTab === "performance" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <p className="text-[13px] text-neutral-500">Performance history and audit trail for {agent.name}.</p>
              <p className="text-[12px] text-neutral-600 mt-2">Trust Score: {agent.trust.decayedScore}/750 — Level: {levelName}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
