"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import {
  Shield, CheckCircle, XCircle, Clock, ScrollText, Activity,
  ArrowUpRight, AlertTriangle, Zap,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const LEVEL_COLORS: Record<number, string> = {
  0: "text-red-400 bg-red-500/10 border-red-500/20",
  1: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  2: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  3: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

interface AuditLog {
  id: string;
  createdAt: string;
  agentName: string;
  action: string;
  service: string;
  actionType: string;
  trustLevel: number;
  cibaRequired: boolean;
  cibaApproved: boolean | null;
  success: boolean;
}

export default function AuditPage() {
  const { data: logs } = useSWR<AuditLog[]>("/api/audit?limit=100", fetcher, { refreshInterval: 5000 });

  const totalActions = logs?.length || 0;
  const cibaActions = logs?.filter((l) => l.cibaRequired).length || 0;
  const cibaApproved = logs?.filter((l) => l.cibaRequired && l.cibaApproved).length || 0;
  const successRate = totalActions
    ? Math.round((logs!.filter((l) => l.success).length / totalActions) * 100)
    : 0;

  const stats = [
    { label: "Total Actions", value: totalActions, icon: Activity, color: "text-indigo-400", gradient: "from-indigo-500 to-violet-500", borderColor: "border-indigo-500/20" },
    { label: "CIBA Requests", value: cibaActions, icon: Clock, color: "text-amber-400", gradient: "from-amber-500 to-orange-500", borderColor: "border-amber-500/20" },
    { label: "CIBA Approved", value: cibaApproved, icon: CheckCircle, color: "text-emerald-400", gradient: "from-emerald-500 to-green-500", borderColor: "border-emerald-500/20" },
    { label: "Success Rate", value: `${successRate}%`, icon: Shield, color: "text-blue-400", gradient: "from-blue-500 to-cyan-500", borderColor: "border-blue-500/20" },
  ];

  return (
    <div className="min-h-full">
      <div className="border-b border-border/50 px-8 py-6">
        <div className="max-w-[1400px] flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center">
            <ScrollText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Audit Trail</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Complete log of all agent actions and authorization events</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-[1400px] space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative group"
            >
              {/* Gradient border */}
              <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className={`absolute -inset-2 rounded-3xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-40 blur-xl transition-all duration-700`} />

              <div className="relative overflow-hidden rounded-2xl bg-card/80 dark:bg-card/60 backdrop-blur-xl p-5 transition-all duration-300">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
                <div className={`absolute top-0 right-0 h-24 w-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-[0.08] -translate-y-6 translate-x-6 group-hover:opacity-20 transition-opacity duration-500`} />

                <div className="relative flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} border border-white/10 flex items-center justify-center`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Cards */}
        <div className="space-y-2">
          {logs?.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
              className="group rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm px-5 py-3.5 hover:bg-muted/20 hover:border-border/50 transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Status indicator */}
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                  log.success ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"
                }`}>
                  {log.success ? (
                    <Zap className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                  )}
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-medium text-foreground truncate">{log.action}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-muted-foreground tabular-nums">{timeAgo(log.createdAt)}</span>
                    <span className="text-border/50">·</span>
                    <span className="text-[11px] font-semibold text-foreground/70">{log.agentName}</span>
                    <span className="text-border/50">·</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground border border-border/30">{log.service}</span>
                  </div>
                </div>

                {/* Trust level */}
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0 ${LEVEL_COLORS[log.trustLevel] || LEVEL_COLORS[0]}`}>
                  L{log.trustLevel}
                </span>

                {/* CIBA badge */}
                {log.cibaRequired && (
                  <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border shrink-0 ${
                    log.cibaApproved
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {log.cibaApproved ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    CIBA
                  </div>
                )}

                {/* Arrow */}
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
              </div>
            </motion.div>
          ))}

          {(!logs || logs.length === 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed border-border/50 bg-card/30 py-20 flex flex-col items-center justify-center gap-3"
            >
              <div className="h-12 w-12 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center">
                <ScrollText className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-[13px] text-muted-foreground">No agent actions yet. Chat with an employee to see the audit trail populate.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
