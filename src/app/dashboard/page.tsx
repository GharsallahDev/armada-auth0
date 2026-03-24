"use client";

import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Users, TrendingUp, Activity, Sparkles } from "lucide-react";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { KillSwitch } from "@/components/dashboard/KillSwitch";

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
  const { data: agents } = useSWR<Agent[]>("/api/agents", fetcher, { refreshInterval: 5000 });
  const { data: trustData, mutate: mutateTrust } = useSWR<Record<string, { score: number; level: number; decayedScore: number }>>("/api/trust", fetcher, { refreshInterval: 5000 });
  const { data: activity } = useSWR("/api/audit?type=activity&limit=20", fetcher);

  const activeAgents = agents?.filter((a) => a.status === "active") || [];
  const avgTrust = activeAgents.length > 0
    ? Math.round(activeAgents.reduce((sum, a) => sum + (trustData?.[a.slug]?.decayedScore || 0), 0) / activeAgents.length)
    : 0;

  const stats = [
    { label: "Employees", value: activeAgents.length, icon: Users, gradient: "from-indigo-500/20 to-violet-500/20", iconColor: "text-indigo-400", borderColor: "border-indigo-500/20" },
    { label: "Avg Trust", value: avgTrust, icon: TrendingUp, gradient: "from-emerald-500/20 to-green-500/20", iconColor: "text-emerald-400", borderColor: "border-emerald-500/20" },
    { label: "Actions", value: activity?.length || 0, icon: Activity, gradient: "from-amber-500/20 to-orange-500/20", iconColor: "text-amber-400", borderColor: "border-amber-500/20" },
  ];

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-border/50 px-8 py-6">
        <div className="flex items-center justify-between max-w-[1400px]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Workforce</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your AI employees</p>
          </div>
          <div className="flex items-center gap-3">
            <KillSwitch onRevoke={() => mutateTrust()} />
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

      <div className="px-8 py-8 max-w-[1400px] space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative group overflow-hidden rounded-2xl border ${stat.borderColor} bg-card/50 backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-lg`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center backdrop-blur-sm">
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground tabular-nums">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Employees */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground/60">Employees</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
            <Link href="/dashboard/hire">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: activeAgents.length * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-dashed border-border/50 hover:border-primary/30 bg-card/30 backdrop-blur-sm transition-all duration-300 cursor-pointer h-full min-h-[200px] flex flex-col items-center justify-center gap-3"
              >
                <div className="h-12 w-12 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                  <UserPlus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Hire Employee</p>
              </motion.div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
