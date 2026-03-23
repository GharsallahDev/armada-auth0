"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MessageSquare, BarChart3, Settings2, Pause, Play, Trash2, AlertTriangle,
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
  Clock, Zap, Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

const LEVEL_STYLES: Record<number, string> = {
  0: "bg-red-500/10 text-red-400 border-red-500/20",
  1: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  2: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  3: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
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
    <div>
      <div className="border-b border-border">
        <div className="px-8 py-6 max-w-[1400px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${agent.avatarGradient} flex items-center justify-center text-xl font-bold text-primary-foreground shadow-lg ring-1 ring-border`}>
                {agent.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-semibold text-foreground">{agent.name}</h1>
                  <Badge variant="outline" className={LEVEL_STYLES[agent.trust.level] || ""}>{levelName}</Badge>
                  {agent.status === "paused" && (
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400">Paused</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{agent.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleTogglePause}>
                {agent.status === "paused" ? <Play className="h-3.5 w-3.5 mr-1.5" /> : <Pause className="h-3.5 w-3.5 mr-1.5" />}
                {agent.status === "paused" ? "Resume" : "Pause"}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger render={
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Terminate
                  </Button>
                } />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10">
                      <AlertTriangle className="text-destructive" />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Terminate {agent.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently deactivate this employee, revoke all trust points, and deny any pending approval requests. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleTerminate}
                      disabled={isTerminating}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isTerminating ? "Terminating..." : "Terminate Employee"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-[1400px]">
        <Tabs defaultValue="overview">
          <TabsList variant="line" className="mb-6">
            <TabsTrigger value="overview"><Settings2 className="h-4 w-4 mr-1.5" />Overview</TabsTrigger>
            <TabsTrigger value="chat"><MessageSquare className="h-4 w-4 mr-1.5" />Chat</TabsTrigger>
            <TabsTrigger value="performance"><BarChart3 className="h-4 w-4 mr-1.5" />Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    <TrustGauge score={agent.trust.decayedScore} level={agent.trust.level} agentName={agent.slug} />
                  </CardContent>
                </Card>
                <Card className="col-span-2">
                  <CardContent className="space-y-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Instructions</p>
                      <p className="text-sm text-foreground/80 leading-relaxed">{agent.instructions}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Assigned Services</p>
                      <div className="flex flex-wrap gap-2">
                        {agent.services.map((s: string) => {
                          const display = SERVICE_DISPLAY[s];
                          const IconComp = display ? ICON_MAP[display.icon] : null;
                          return (
                            <Badge key={s} variant="secondary" className="gap-1.5 px-2.5 py-1">
                              {IconComp && <IconComp className="h-3.5 w-3.5" />}
                              {display?.label || s}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"><Clock className="h-4 w-4 text-muted-foreground" /></div>
                        <div><p className="text-lg font-bold text-foreground tabular-nums">{daysEmployed}</p><p className="text-[11px] text-muted-foreground">Days Employed</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"><Zap className="h-4 w-4 text-muted-foreground" /></div>
                        <div><p className="text-lg font-bold text-foreground tabular-nums">{agent.trust.score}</p><p className="text-[11px] text-muted-foreground">Trust Points</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"><Shield className="h-4 w-4 text-muted-foreground" /></div>
                        <div><p className="text-lg font-bold text-foreground tabular-nums">L{agent.trust.level}</p><p className="text-[11px] text-muted-foreground">{levelName}</p></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="chat">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="overflow-hidden">
                <AgentChat slug={agent.slug} agentName={agent.name} avatarGradient={agent.avatarGradient} />
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="performance">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardHeader><CardTitle>Performance History</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-2xl font-bold text-foreground tabular-nums">{agent.trust.decayedScore}<span className="text-sm text-muted-foreground font-normal">/750</span></p>
                      <p className="text-xs text-muted-foreground mt-1">Current Trust Score</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-2xl font-bold text-foreground">{levelName}</p>
                      <p className="text-xs text-muted-foreground mt-1">Current Level</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Trust decays with a 7-day half-life. Consistent successful actions increase trust score. Visit the Audit Trail for complete action history.</p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
