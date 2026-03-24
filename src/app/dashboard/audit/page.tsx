"use client";

import useSWR from "swr";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, CheckCircle, XCircle, Clock, ScrollText, Activity,
  ArrowUpRight, AlertTriangle, Zap, Filter,
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

type FilterType = "all" | "success" | "failed" | "ciba";

export default function AuditPage() {
  const { data: logs } = useSWR<AuditLog[]>("/api/audit?limit=100", fetcher, { refreshInterval: 5000 });
  const [filter, setFilter] = useState<FilterType>("all");

  const totalActions = logs?.length || 0;
  const cibaActions = logs?.filter((l) => l.cibaRequired).length || 0;
  const cibaApproved = logs?.filter((l) => l.cibaRequired && l.cibaApproved).length || 0;
  const successRate = totalActions
    ? Math.round((logs!.filter((l) => l.success).length / totalActions) * 100)
    : 0;

  const filtered = filter === "all" ? logs || [] :
    filter === "success" ? (logs || []).filter((l) => l.success) :
    filter === "failed" ? (logs || []).filter((l) => !l.success) :
    (logs || []).filter((l) => l.cibaRequired);

  const counts = {
    all: totalActions,
    success: (logs || []).filter((l) => l.success).length,
    failed: (logs || []).filter((l) => !l.success).length,
    ciba: cibaActions,
  };

  const stats = [
    { label: "Total Actions", value: totalActions, gradient: "from-indigo-500/20 to-violet-500/20", icon: Activity },
    { label: "CIBA Requests", value: cibaActions, gradient: "from-amber-500/20 to-orange-500/20", icon: Clock },
    { label: "CIBA Approved", value: cibaApproved, gradient: "from-emerald-500/20 to-green-500/20", icon: CheckCircle },
    { label: "Success Rate", value: `${successRate}%`, gradient: "from-blue-500/20 to-cyan-500/20", icon: Shield },
  ];

  const filterTabs: { id: FilterType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "all", label: "All", icon: ScrollText },
    { id: "success", label: "Success", icon: CheckCircle },
    { id: "failed", label: "Failed", icon: XCircle },
    { id: "ciba", label: "CIBA", icon: Shield },
  ];

  return (
    <div className="min-h-full">
      <div className="border-b border-border/50 px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center">
            <ScrollText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Audit Trail</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Complete log of all agent actions and authorization events</p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* Stats — same style as Tasks/Approvals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative group"
            >
              <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-40 group-hover:opacity-70 transition-opacity duration-500`} />
              <div className="relative rounded-2xl bg-card/80 dark:bg-card/60 backdrop-blur-xl p-4 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${stat.gradient} border border-white/10 flex items-center justify-center`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground tabular-nums">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-1.5">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = filter === tab.id;
            const count = counts[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="audit-tab-bg"
                    className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/30 tabular-nums">
                      {count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Cards */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((log, i) => (
              <motion.div
                key={log.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className={`group rounded-xl border bg-card/30 backdrop-blur-sm px-5 py-4 hover:bg-muted/20 transition-all ${
                  !log.success ? "border-red-500/20" : log.cibaRequired ? "border-amber-500/20" : "border-border/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Status indicator */}
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    log.success ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"
                  }`}>
                    {log.success ? (
                      <Zap className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    )}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-semibold text-foreground truncate">{log.action}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] text-muted-foreground tabular-nums">{timeAgo(log.createdAt)}</span>
                      <span className="text-border/50">·</span>
                      <span className="text-[11px] font-medium text-foreground/80">{log.agentName}</span>
                      <span className="text-border/50">·</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground border border-border/30 capitalize">{log.service}</span>
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
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed border-border/50 bg-card/30 py-16 flex flex-col items-center justify-center gap-3"
            >
              <div className="h-12 w-12 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center">
                <ScrollText className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-[13px] text-muted-foreground">
                {filter === "failed" ? "No failed actions. Your workforce is performing well." :
                 filter === "ciba" ? "No CIBA requests yet." :
                 "No agent actions yet. Chat with an employee to see the audit trail populate."}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
