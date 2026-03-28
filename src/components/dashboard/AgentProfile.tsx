"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { motion } from "framer-motion";
import {
  Pause, Play, Trash2, AlertTriangle,
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
  Clock, Zap, Shield, MessageSquare,
  Pencil, Check, X, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogAction, AlertDialogCancel, AlertDialogMedia,
} from "@/components/ui/alert-dialog";
import { TRUST_LEVEL_NAMES, SERVICE_DISPLAY, type TrustLevel } from "@/lib/trust/levels";
import { resolveAvatarUrl } from "@/lib/avatar";
import { TrustGauge } from "./TrustGauge";
import { AgentChat } from "./AgentChat";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PROVIDER_TO_SERVICES: Record<string, string[]> = {
  google: ["gmail", "calendar", "drive", "sheets", "contacts", "tasks"],
  github: ["github"],
  slack: ["slack"],
  stripe: ["stripe"],
  discord: ["discord"],
  linkedin: ["linkedin"],
  shopify: ["shopify"],
};

const CONNECTION_TO_PROVIDER: Record<string, string> = {
  "google-oauth2": "google",
  github: "github",
  "sign-in-with-slack": "slack",
  stripe: "stripe",
};

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
  avatarUrl?: string | null;
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
  const { data: connectedServices } = useSWR<{ provider: string; connected: boolean }[]>("/api/services", fetcher);

  const availableServices = useMemo(() => {
    if (!connectedServices) return [];
    const providers = connectedServices
      .filter((s) => s.connected)
      .map((s) => CONNECTION_TO_PROVIDER[s.provider] || s.provider);
    return providers.flatMap((p) => PROVIDER_TO_SERVICES[p] || [p]);
  }, [connectedServices]);

  const [isTerminating, setIsTerminating] = useState(false);
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [draftInstructions, setDraftInstructions] = useState(agent.instructions);
  const [editingServices, setEditingServices] = useState(false);
  const [draftServices, setDraftServices] = useState<string[]>(agent.services);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(agent.name);
  const [editingRole, setEditingRole] = useState(false);
  const [draftRole, setDraftRole] = useState(agent.role);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraftInstructions(agent.instructions);
    setDraftServices(agent.services);
    setDraftName(agent.name);
    setDraftRole(agent.role);
  }, [agent.instructions, agent.services, agent.name, agent.role]);

  async function saveField(field: string, value: any) {
    setSaving(true);
    await fetch(`/api/agents/${agent.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    setSaving(false);
    onRefresh();
  }

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
            <div className="h-14 w-14 rounded-2xl bg-muted/30 overflow-hidden shadow-lg ring-1 ring-border/30">
              <img src={resolveAvatarUrl(agent.avatarUrl, agent.slug)} alt={agent.name} className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="text-xl font-bold text-foreground bg-transparent border-b border-primary/50 outline-none px-0 py-0 w-48"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { saveField("name", draftName); setEditingName(false); }
                        if (e.key === "Escape") { setDraftName(agent.name); setEditingName(false); }
                      }}
                    />
                    <button onClick={() => { saveField("name", draftName); setEditingName(false); }} className="h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"><Check className="h-3.5 w-3.5" /></button>
                    <button onClick={() => { setDraftName(agent.name); setEditingName(false); }} className="h-6 w-6 rounded-md bg-muted/50 text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ) : (
                  <h1 className="text-xl font-bold text-foreground group/name cursor-pointer flex items-center gap-2" onClick={() => setEditingName(true)}>
                    {agent.name}
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground/0 group-hover/name:text-muted-foreground/60 transition-colors" />
                  </h1>
                )}
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${colors.bg} ${colors.text} ${colors.border} border`}>
                  {levelName}
                </span>
                {agent.status === "paused" && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Paused</span>
                )}
              </div>
              {editingRole ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <input
                    value={draftRole}
                    onChange={(e) => setDraftRole(e.target.value)}
                    className="text-sm text-muted-foreground bg-transparent border-b border-primary/50 outline-none px-0 py-0 w-48"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { saveField("role", draftRole); setEditingRole(false); }
                      if (e.key === "Escape") { setDraftRole(agent.role); setEditingRole(false); }
                    }}
                  />
                  <button onClick={() => { saveField("role", draftRole); setEditingRole(false); }} className="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"><Check className="h-3 w-3" /></button>
                  <button onClick={() => { setDraftRole(agent.role); setEditingRole(false); }} className="h-5 w-5 rounded bg-muted/50 text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors"><X className="h-3 w-3" /></button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-0.5 group/role cursor-pointer flex items-center gap-1.5" onClick={() => setEditingRole(true)}>
                  {agent.role}
                  <Pencil className="h-3 w-3 text-muted-foreground/0 group-hover/role:text-muted-foreground/60 transition-colors" />
                </p>
              )}
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
            {/* Instructions — editable */}
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Instructions</p>
                {editingInstructions ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { saveField("instructions", draftInstructions); setEditingInstructions(false); }}
                      disabled={saving}
                      className="h-7 px-2.5 rounded-lg bg-primary/10 text-primary text-[11px] font-medium flex items-center gap-1 hover:bg-primary/20 transition-colors"
                    >
                      <Check className="h-3 w-3" />Save
                    </button>
                    <button
                      onClick={() => { setDraftInstructions(agent.instructions); setEditingInstructions(false); }}
                      className="h-7 px-2.5 rounded-lg bg-muted/50 text-muted-foreground text-[11px] font-medium flex items-center gap-1 hover:bg-muted transition-colors"
                    >
                      <X className="h-3 w-3" />Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingInstructions(true)}
                    className="h-7 px-2.5 rounded-lg text-[11px] font-medium text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all flex items-center gap-1"
                  >
                    <Pencil className="h-3 w-3" />Edit
                  </button>
                )}
              </div>
              {editingInstructions ? (
                <Textarea
                  value={draftInstructions}
                  onChange={(e) => setDraftInstructions(e.target.value)}
                  className="min-h-[120px] text-sm bg-muted/30 border-border/50 rounded-xl resize-y"
                  autoFocus
                />
              ) : (
                <p className="text-sm text-foreground/80 leading-relaxed">{agent.instructions}</p>
              )}
            </div>

            {/* Services — editable */}
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Assigned Services</p>
                {editingServices ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { saveField("services", draftServices); setEditingServices(false); }}
                      disabled={saving}
                      className="h-7 px-2.5 rounded-lg bg-primary/10 text-primary text-[11px] font-medium flex items-center gap-1 hover:bg-primary/20 transition-colors"
                    >
                      <Check className="h-3 w-3" />Save
                    </button>
                    <button
                      onClick={() => { setDraftServices(agent.services); setEditingServices(false); }}
                      className="h-7 px-2.5 rounded-lg bg-muted/50 text-muted-foreground text-[11px] font-medium flex items-center gap-1 hover:bg-muted transition-colors"
                    >
                      <X className="h-3 w-3" />Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingServices(true)}
                    className="h-7 px-2.5 rounded-lg text-[11px] font-medium text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all flex items-center gap-1"
                  >
                    <Pencil className="h-3 w-3" />Edit
                  </button>
                )}
              </div>
              {editingServices ? (
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const GOOGLE_SERVICES = ["gmail", "calendar", "drive", "sheets", "contacts", "tasks"];
                    const googleSet = new Set(GOOGLE_SERVICES);
                    const availableGoogle = availableServices.filter(s => googleSet.has(s));
                    const availableNonGoogle = availableServices.filter(s => !googleSet.has(s));
                    const hasAnyGoogle = availableGoogle.length > 0;
                    const googleActive = hasAnyGoogle && availableGoogle.some(s => draftServices.includes(s));

                    const toggleGoogle = () => {
                      setDraftServices((prev) => {
                        if (googleActive) return prev.filter(s => !googleSet.has(s));
                        return [...prev.filter(s => !googleSet.has(s)), ...availableGoogle];
                      });
                    };

                    const badges = availableNonGoogle.map((s: string) => {
                      const display = SERVICE_DISPLAY[s];
                      const IconComp = display ? ICON_MAP[display.icon] : null;
                      const isActive = draftServices.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setDraftServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all",
                            isActive
                              ? "bg-primary/10 text-primary border-primary/30 ring-1 ring-primary/20"
                              : "bg-muted/30 text-muted-foreground/50 border-border/30 hover:border-border/60"
                          )}
                        >
                          {IconComp && <IconComp className="h-3.5 w-3.5" />}
                          {display?.label || s}
                        </button>
                      );
                    });

                    if (hasAnyGoogle) {
                      badges.unshift(
                        <button
                          key="google"
                          type="button"
                          onClick={toggleGoogle}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all",
                            googleActive
                              ? "bg-primary/10 text-primary border-primary/30 ring-1 ring-primary/20"
                              : "bg-muted/30 text-muted-foreground/50 border-border/30 hover:border-border/60"
                          )}
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Google
                        </button>
                      );
                    }

                    return badges;
                  })()}
                  {availableServices.length === 0 && (
                    <p className="text-[11px] text-muted-foreground/60">
                      No services connected. <a href="/dashboard/settings" className="text-primary hover:underline">Connect services in Settings</a> first.
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const GOOGLE_SERVICES = new Set(["gmail", "calendar", "drive", "sheets", "contacts", "tasks"]);
                    const hasGoogle = agent.services.some(s => GOOGLE_SERVICES.has(s));
                    const nonGoogle = agent.services.filter(s => !GOOGLE_SERVICES.has(s));
                    const badges = nonGoogle.map((s: string) => {
                      const display = SERVICE_DISPLAY[s];
                      const IconComp = display ? ICON_MAP[display.icon] : null;
                      return (
                        <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-sm text-foreground/80 border border-border/50">
                          {IconComp && <IconComp className="h-3.5 w-3.5" />}
                          {display?.label || s}
                        </span>
                      );
                    });
                    if (hasGoogle) {
                      badges.unshift(
                        <span key="google" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-sm text-foreground/80 border border-border/50">
                          <Mail className="h-3.5 w-3.5" />
                          Google
                        </span>
                      );
                    }
                    return badges;
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Chat — always visible */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-visible">
            <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h3 className="text-[13px] font-semibold text-foreground">Chat with {agent.name}</h3>
            </div>
            <AgentChat slug={agent.slug} agentName={agent.name} avatarGradient={agent.avatarGradient} avatarUrl={agent.avatarUrl} services={agent.services} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
