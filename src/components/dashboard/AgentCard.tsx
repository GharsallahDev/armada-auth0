"use client";

import Link from "next/link";
import {
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TRUST_LEVEL_NAMES, SERVICE_DISPLAY, type TrustLevel } from "@/lib/trust/levels";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
};

const LEVEL_STYLES: Record<number, string> = {
  0: "bg-red-500/10 text-red-400 border-red-500/20",
  1: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  2: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  3: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const LEVEL_PROGRESS_COLORS: Record<number, string> = {
  0: "[&_[data-slot=progress-indicator]]:bg-red-500",
  1: "[&_[data-slot=progress-indicator]]:bg-amber-500",
  2: "[&_[data-slot=progress-indicator]]:bg-blue-500",
  3: "[&_[data-slot=progress-indicator]]:bg-emerald-500",
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
  const maxScore = trust.level === 0 ? 100 : trust.level === 1 ? 300 : trust.level === 2 ? 750 : 1000;
  const progressValue = Math.min((trust.decayedScore / maxScore) * 100, 100);

  return (
    <Link href={`/dashboard/employee/${agent.slug}`}>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:ring-primary/20 hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardContent className="relative space-y-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${agent.avatarGradient} flex items-center justify-center text-sm font-bold text-white shadow-sm ring-1 ring-white/10`}>
              {agent.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-semibold text-foreground truncate">{agent.name}</h3>
              <p className="text-[11px] text-muted-foreground truncate">{agent.role}</p>
            </div>
            <Badge variant="outline" className={LEVEL_STYLES[trust.level] || ""}>
              {levelName}
            </Badge>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Trust Score</span>
              <span className="font-medium text-foreground tabular-nums">{trust.decayedScore} pts</span>
            </div>
            <Progress value={progressValue} className={LEVEL_PROGRESS_COLORS[trust.level] || ""} />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {agent.services.map((s: string) => {
              const display = SERVICE_DISPLAY[s];
              const IconComp = display ? ICON_MAP[display.icon] : null;
              return (
                <Badge key={s} variant="secondary" className="gap-1 text-[10px] px-1.5 h-5">
                  {IconComp && <IconComp className="h-3 w-3" />}
                  {display?.label || s}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
