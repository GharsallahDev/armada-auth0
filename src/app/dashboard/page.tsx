"use client";

import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Users, TrendingUp, Activity, Sparkles, Shield, ArrowRight } from "lucide-react";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { KillSwitch } from "@/components/dashboard/KillSwitch";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Agent {
  id: string;
  name: string;
  slug: string;
  role: string;
  services: string[];
  avatarGradient: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: agents, isLoading } = useSWR<Agent[]>("/api/agents", fetcher, { refreshInterval: 5000 });
  const { data: trustData, mutate: mutateTrust } = useSWR<Record<string, { score: number; level: number; decayedScore: number }>>("/api/trust", fetcher, { refreshInterval: 5000 });
  const { data: activity } = useSWR("/api/audit?type=activity&limit=20", fetcher);

  const activeAgents = agents?.filter((a) => a.status === "active") || [];
  const avgTrust = activeAgents.length > 0
    ? Math.round(activeAgents.reduce((sum, a) => sum + (trustData?.[a.slug]?.decayedScore || 0), 0) / activeAgents.length)
    : 0;

  const stats = [
    { label: "Employees", value: activeAgents.length, icon: Users, gradient: "from-indigo-500/20 to-violet-500/20" },
    { label: "Avg Trust", value: avgTrust, icon: TrendingUp, gradient: "from-emerald-500/20 to-green-500/20" },
    { label: "Actions", value: activity?.length || 0, icon: Activity, gradient: "from-amber-500/20 to-orange-500/20" },
  ];

  const hasEmployees = activeAgents.length > 0;

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-border/50 px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Workforce</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your AI employees</p>
          </div>
          <div className="flex items-center gap-3">
            {hasEmployees && <KillSwitch onRevoke={() => mutateTrust()} />}
            <Link
              href="/dashboard/hire"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-foreground bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/20 backdrop-blur-sm shadow-sm hover:shadow-md hover:shadow-primary/10 hover:-translate-y-px transition-all duration-200"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Hire Employee
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-8">
        {isLoading ? (
          <>
            {/* Skeleton Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-5">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-11 w-11 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-7 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skeleton Agent Cards */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-11 w-11 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-2 w-full rounded-full" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-md" />
                      <Skeleton className="h-6 w-14 rounded-md" />
                      <Skeleton className="h-6 w-18 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : hasEmployees ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative group"
                >
                  <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className={`absolute -inset-2 rounded-3xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-40 blur-xl transition-all duration-700`} />
                  <div className="relative overflow-hidden rounded-2xl bg-card/80 dark:bg-card/60 backdrop-blur-xl p-5">
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
                    <div className={`absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br ${stat.gradient} opacity-[0.08] -translate-y-8 translate-x-8 group-hover:opacity-20 transition-opacity duration-500`} />
                    <div className="relative flex items-center gap-4">
                      <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${stat.gradient} border border-white/10 flex items-center justify-center backdrop-blur-sm`}>
                        <stat.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-foreground tabular-nums">{stat.value}</p>
                        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Employees Grid */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground/60">Employees</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {activeAgents.map((agent, i) => (
                  <motion.div
                    key={agent.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <AgentCard
                      agent={agent}
                      trust={trustData?.[agent.slug] || { score: 0, level: 0, decayedScore: 0 }}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          </>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="relative mb-8">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Users className="h-10 w-10 text-indigo-400/60" />
              </div>
              <div className="absolute -inset-4 rounded-[28px] bg-gradient-to-br from-indigo-500/5 to-violet-500/5 -z-10 blur-sm" />
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">No employees yet</h2>
            <p className="text-[14px] text-muted-foreground max-w-md text-center mb-2">
              Your AI workforce is empty. Hire your first employee to get started — choose from pre-built roles like Engineer, Analyst, or Designer, or create a custom role.
            </p>
            <p className="text-[12px] text-muted-foreground/60 max-w-sm text-center mb-8">
              Each employee starts at L0 Probationary with read-only access and earns trust through successful work.
            </p>

            <Link
              href="/dashboard/hire"
              className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[14px] font-semibold text-primary-foreground bg-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Sparkles className="h-4 w-4" />
              Hire Your First Employee
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
              {[
                { icon: Shield, title: "Progressive Trust", desc: "Employees earn permissions through successful work, never granted manually.", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                { icon: Activity, title: "Full Audit Trail", desc: "Every action logged with trust level, service, and approval status.", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                { icon: Users, title: "CIBA Approvals", desc: "Sensitive actions trigger push notifications for your approval.", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 text-center">
                  <div className={`h-10 w-10 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center mx-auto mb-3`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <h3 className="text-[13px] font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
