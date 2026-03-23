"use client";

import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Users, TrendingUp, Clock, Activity } from "lucide-react";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { KillSwitch } from "@/components/dashboard/KillSwitch";
import { TRUST_LEVEL_NAMES, type TrustLevel } from "@/lib/trust/levels";

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
  const { data: activity } = useSWR("/api/audit?type=activity&limit=20", fetcher, { refreshInterval: 5000 });

  const activeAgents = agents?.filter((a) => a.status === "active") || [];
  const avgTrust = activeAgents.length > 0
    ? Math.round(activeAgents.reduce((sum, a) => sum + (trustData?.[a.slug]?.decayedScore || 0), 0) / activeAgents.length)
    : 0;

  const stats = [
    { label: "Total Employees", value: activeAgents.length, icon: Users },
    { label: "Avg Trust Score", value: avgTrust, icon: TrendingUp },
    { label: "Total Actions", value: activity?.length || 0, icon: Activity },
  ];

  return (
    <div className="min-h-full">
      <div className="border-b border-white/[0.06]">
        <div className="px-8 py-6 flex items-center justify-between max-w-[1400px]">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Workforce</h1>
            <p className="text-[13px] text-neutral-500 mt-0.5">Manage your AI employees</p>
          </div>
          <KillSwitch onRevoke={() => mutateTrust()} />
        </div>
      </div>

      <div className="px-8 py-8 max-w-[1400px] space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <stat.icon className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-[11px] text-neutral-600">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Agent Grid */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 mb-4">Employees</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
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
            {/* Hire card */}
            <Link href="/dashboard/hire">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: activeAgents.length * 0.05 }}
                className="rounded-xl border-2 border-dashed border-white/[0.08] bg-transparent p-5 flex flex-col items-center justify-center gap-3 min-h-[200px] hover:border-indigo-500/30 hover:bg-indigo-500/[0.03] transition-all cursor-pointer group"
              >
                <div className="h-10 w-10 rounded-full bg-white/[0.04] flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                  <UserPlus className="h-5 w-5 text-neutral-600 group-hover:text-indigo-400 transition-colors" />
                </div>
                <p className="text-[13px] font-medium text-neutral-600 group-hover:text-neutral-400 transition-colors">Hire Employee</p>
              </motion.div>
            </Link>
          </div>
        </section>

        <div className="border-t border-white/[0.06]" />

        {/* Activity */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 mb-4">Recent Activity</h2>
          <ActivityFeed activities={activity || []} />
        </section>
      </div>
    </div>
  );
}
