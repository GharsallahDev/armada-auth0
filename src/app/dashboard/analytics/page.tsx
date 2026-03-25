"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, TrendingDown, Users, Shield, Zap, Clock,
  ArrowUpRight, ArrowDownRight, Activity,
} from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { TRUST_LEVEL_NAMES, type TrustLevel } from "@/lib/trust/levels";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const LEVEL_COLORS: Record<number, string> = {
  0: "#ef4444",
  1: "#f59e0b",
  2: "#3b82f6",
  3: "#10b981",
};

const LEVEL_BG: Record<number, string> = {
  0: "bg-red-500",
  1: "bg-amber-500",
  2: "bg-blue-500",
  3: "bg-emerald-500",
};

interface Agent {
  slug: string;
  name: string;
  role: string;
  services: string[];
  avatarGradient: string;
  status: string;
  createdAt: string;
}

interface TrustData {
  score: number;
  level: number;
  decayedScore: number;
}

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

function MiniBarChart({ data, color, height = 60 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data, 1);
  const barWidth = 100 / data.length;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${data.length * 12} ${height}`} className="overflow-visible">
      {data.map((val, i) => {
        const barH = (val / max) * (height - 4);
        return (
          <rect
            key={i}
            x={i * 12 + 1}
            y={height - barH}
            width={10}
            height={barH}
            rx={2}
            fill={color}
            opacity={0.6 + (i / data.length) * 0.4}
          />
        );
      })}
    </svg>
  );
}

function MiniLineChart({ data, color, height = 60 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const width = data.length * 16;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (val / max) * (height - 8);
    return `${x},${y}`;
  });
  const areaPoints = `0,${height} ${points.join(" ")} ${width},${height}`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color})`} />
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (val / max) * (height - 8);
        return i === data.length - 1 ? (
          <circle key={i} cx={x} cy={y} r="3" fill={color} />
        ) : null;
      })}
    </svg>
  );
}

function DonutChart({ segments, size = 120 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/30" />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dashArray = `${pct * circumference} ${circumference}`;
          const dashOffset = -offset * circumference;
          offset += pct;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="transition-all duration-700"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{total}</span>
        <span className="text-[10px] text-muted-foreground">Total</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: agents } = useSWR<Agent[]>("/api/agents", fetcher, { refreshInterval: 10000 });
  const { data: trustData } = useSWR<Record<string, TrustData>>("/api/trust", fetcher, { refreshInterval: 10000 });
  const { data: logs } = useSWR<AuditLog[]>("/api/audit?limit=200", fetcher, { refreshInterval: 10000 });
  const { data: cibaRequests } = useSWR("/api/ciba", fetcher, { refreshInterval: 10000 });

  const activeAgents = agents?.filter((a) => a.status === "active") || [];
  const avgTrust = activeAgents.length > 0
    ? Math.round(activeAgents.reduce((sum, a) => sum + (trustData?.[a.slug]?.decayedScore || 0), 0) / activeAgents.length)
    : 0;
  const totalActions = logs?.length || 0;
  const successRate = totalActions ? Math.round((logs!.filter((l) => l.success).length / totalActions) * 100) : 0;
  const cibaCount = logs?.filter((l) => l.cibaRequired).length || 0;
  const cibaApprovedCount = logs?.filter((l) => l.cibaRequired && l.cibaApproved).length || 0;
  const cibaApprovalRate = cibaCount ? Math.round((cibaApprovedCount / cibaCount) * 100) : 0;

  // Trust level distribution
  const levelDistribution = [0, 1, 2, 3].map((level) => ({
    level,
    count: activeAgents.filter((a) => (trustData?.[a.slug]?.level || 0) === level).length,
    color: LEVEL_COLORS[level],
    label: TRUST_LEVEL_NAMES[level as TrustLevel],
  }));

  // Actions per service
  const serviceActions: Record<string, number> = {};
  logs?.forEach((l) => {
    serviceActions[l.service] = (serviceActions[l.service] || 0) + 1;
  });
  const topServices = Object.entries(serviceActions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  // Actions per agent
  const agentActions: Record<string, { total: number; success: number }> = {};
  logs?.forEach((l) => {
    if (!agentActions[l.agentName]) agentActions[l.agentName] = { total: 0, success: 0 };
    agentActions[l.agentName].total++;
    if (l.success) agentActions[l.agentName].success++;
  });

  // Simulate time-series data from logs (group by hour)
  const hourlyActions: number[] = Array(12).fill(0);
  const hourlySuccess: number[] = Array(12).fill(0);
  logs?.forEach((l) => {
    const hoursAgo = Math.floor((Date.now() - new Date(l.createdAt).getTime()) / 3600000);
    const bucket = Math.min(11, Math.max(0, 11 - hoursAgo));
    hourlyActions[bucket]++;
    if (l.success) hourlySuccess[bucket]++;
  });

  const kpiCards = [
    { label: "Active Employees", value: activeAgents.length, icon: Users, gradient: "from-indigo-500/20 to-violet-500/20", iconColor: "text-indigo-400", change: "+2", positive: true },
    { label: "Avg Trust Score", value: avgTrust, icon: Shield, gradient: "from-emerald-500/20 to-green-500/20", iconColor: "text-emerald-400", change: "+12%", positive: true },
    { label: "Total Actions", value: totalActions, icon: Zap, gradient: "from-amber-500/20 to-orange-500/20", iconColor: "text-amber-400", change: "+34", positive: true },
    { label: "Success Rate", value: `${successRate}%`, icon: Activity, gradient: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-400", change: successRate >= 90 ? "Excellent" : "Needs attention", positive: successRate >= 90 },
    { label: "CIBA Requests", value: cibaCount, icon: Clock, gradient: "from-violet-500/20 to-purple-500/20", iconColor: "text-violet-400", change: `${cibaApprovalRate}% approved`, positive: cibaApprovalRate >= 80 },
    { label: "Services Used", value: Object.keys(serviceActions).length, icon: BarChart3, gradient: "from-rose-500/20 to-pink-500/20", iconColor: "text-rose-400", change: `${topServices.length} active`, positive: true },
  ];

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-border/50 px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
        <div className=" flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Analytics</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Workforce performance metrics and trust insights</p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8  space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative group"
            >
              <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className={`absolute -inset-2 rounded-3xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-40 blur-xl transition-all duration-700`} />
              <div className="relative overflow-hidden rounded-2xl bg-card/80 dark:bg-card/60 backdrop-blur-xl p-5">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} border border-white/10 flex items-center justify-center`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
                      <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-semibold ${stat.positive ? "text-emerald-400" : "text-amber-400"}`}>
                    {stat.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Action Trend */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[14px] font-semibold text-foreground">Action Activity</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Last 12 hours</p>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-indigo-400" />
                  <span className="text-muted-foreground">Total</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-muted-foreground">Successful</span>
                </div>
              </div>
            </div>
            {totalActions > 0 ? (
              <div className="space-y-3">
                <div className="h-[80px]">
                  <MiniLineChart data={hourlyActions} color="#818cf8" height={80} />
                </div>
                <div className="h-[60px]">
                  <MiniBarChart data={hourlySuccess} color="#34d399" height={60} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-indigo-400/60" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-medium text-muted-foreground">No activity yet</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">Actions will appear here as your employees work</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Trust Level Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
          >
            <h3 className="text-[14px] font-semibold text-foreground mb-1">Trust Distribution</h3>
            <p className="text-[11px] text-muted-foreground mb-5">Employees by trust level</p>
            {activeAgents.length > 0 ? (
              <>
                <div className="flex justify-center mb-5">
                  <DonutChart
                    segments={levelDistribution.map((l) => ({
                      value: l.count,
                      color: l.color,
                      label: l.label,
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  {levelDistribution.map((l) => (
                    <div key={l.level} className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${LEVEL_BG[l.level]}`} />
                        <span className="text-foreground/80">L{l.level} {l.label}</span>
                      </div>
                      <span className="font-bold text-foreground tabular-nums">{l.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-400/60" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-medium text-muted-foreground">No trust data yet</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">Hire employees to see trust distribution</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Services */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
          >
            <h3 className="text-[14px] font-semibold text-foreground mb-1">Top Services</h3>
            <p className="text-[11px] text-muted-foreground mb-5">Actions by service</p>
            <div className="space-y-3">
              {topServices.length > 0 ? topServices.map(([service, count]) => {
                const maxCount = topServices[0][1] as number;
                const pct = ((count as number) / (maxCount as number)) * 100;
                return (
                  <div key={service} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-medium text-foreground/80 capitalize">{service}</span>
                      <span className="tabular-nums text-muted-foreground font-semibold">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <BarChart3 className="h-4.5 w-4.5 text-indigo-400/60" />
                  </div>
                  <div className="text-center">
                    <p className="text-[12px] font-medium text-muted-foreground">No services used yet</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">Service usage will appear as employees take actions</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Agent Performance */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
          >
            <h3 className="text-[14px] font-semibold text-foreground mb-1">Employee Performance</h3>
            <p className="text-[11px] text-muted-foreground mb-5">Actions and success rate per employee</p>
            <div className="space-y-3">
              {activeAgents.length > 0 ? activeAgents.map((agent) => {
                const stats = agentActions[agent.name] || { total: 0, success: 0 };
                const rate = stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0;
                const trust = trustData?.[agent.slug];
                return (
                  <div key={agent.slug} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 transition-colors">
                    <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${agent.avatarGradient} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
                      {agent.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-foreground truncate">{agent.name}</p>
                      <p className="text-[10px] text-muted-foreground">{stats.total} actions</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className={`text-[11px] font-bold tabular-nums ${rate >= 90 ? "text-emerald-400" : rate >= 70 ? "text-amber-400" : "text-red-400"}`}>
                          {rate}%
                        </p>
                        <p className="text-[9px] text-muted-foreground">success</p>
                      </div>
                      {trust && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border" style={{ color: LEVEL_COLORS[trust.level], borderColor: LEVEL_COLORS[trust.level] + "33", backgroundColor: LEVEL_COLORS[trust.level] + "15" }}>
                          L{trust.level}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Users className="h-4.5 w-4.5 text-emerald-400/60" />
                  </div>
                  <div className="text-center">
                    <p className="text-[12px] font-medium text-muted-foreground">No employees yet</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">Hire your first employee to see performance data</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
