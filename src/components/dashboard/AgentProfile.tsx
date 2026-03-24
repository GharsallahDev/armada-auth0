"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Pause, Play, Trash2, AlertTriangle,
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
  Clock, Zap, Shield, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogAction, AlertDialogCancel, AlertDialogMedia,
} from "@/components/ui/alert-dialog";
import { TRUST_LEVEL_NAMES, SERVICE_DISPLAY, type TrustLevel } from "@/lib/trust/levels";
import { TrustGauge } from "./TrustGauge";
import { AgentChat } from "./AgentChat";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
};

const LEVEL_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  1: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  2: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  3: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
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
  const [isTerminating, setIsTerminating] = useState(false);

  const levelName = TRUST_LEVEL_NAMES[agent.trust.level as TrustLevel] || "Unknown";
  const colors = LEVEL_COLORS[agent.trust.level] || LEVEL_COLORS[0];
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

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-border/50 px-8 py-6">
        <div className="flex items-center justify-between max-w-[1400px]">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${agent.avatarGradient} flex items-center justify-center text-xl font-bold text-white shadow-lg ring-1 ring-white/20`}>
              {agent.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground">{agent.name}</h1>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${colors.bg} ${colors.text} ${colors.border} border`}>
                  {levelName}
                </span>
                {agent.status === "paused" && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Paused</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{agent.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePause}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium text-muted-foreground border border-border/50 hover:bg-muted/50 hover:text-foreground transition-all"
            >
              {agent.status === "paused" ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              {agent.status === "paused" ? "Resume" : "Pause"}
            </button>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all" />
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
                Terminate
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogMedia className="bg-destructive/10">
                    <AlertTriangle className="text-destructive" />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Terminate {agent.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently deactivate this employee, revoke all trust points, and deny any pending approval requests.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleTerminate} disabled={isTerminating} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {isTerminating ? "Terminating..." : "Terminate Employee"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Full-page content — NO TABS */}
      <div className="px-8 py-8 max-w-[1400px] space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Trust gauge */}
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 flex flex-col items-center justify-center">
              <TrustGauge score={agent.trust.decayedScore} level={agent.trust.level} agentName={agent.slug} />
            </div>

            {/* Quick stats */}
            {[
              { icon: Clock, label: "Days Employed", value: daysEmployed, color: "text-blue-400" },
              { icon: Zap, label: "Trust Points", value: agent.trust.score, color: "text-amber-400" },
              { icon: Shield, label: "Level", value: `L${agent.trust.level} ${levelName}`, color: colors.text },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground tabular-nums">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Instructions + Services side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Instructions</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{agent.instructions}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Assigned Services</p>
              <div className="flex flex-wrap gap-2">
                {agent.services.map((s: string) => {
                  const display = SERVICE_DISPLAY[s];
                  const IconComp = display ? ICON_MAP[display.icon] : null;
                  return (
                    <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-sm text-foreground/80 border border-border/50">
                      {IconComp && <IconComp className="h-3.5 w-3.5" />}
                      {display?.label || s}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chat — always visible */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h3 className="text-[13px] font-semibold text-foreground">Chat with {agent.name}</h3>
            </div>
            <AgentChat slug={agent.slug} agentName={agent.name} avatarGradient={agent.avatarGradient} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
