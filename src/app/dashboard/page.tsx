"use client";

import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Users, TrendingUp, Activity, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    { label: "Total Employees", value: activeAgents.length, icon: Users, color: "text-primary" },
    { label: "Avg Trust Score", value: avgTrust, icon: TrendingUp, color: "text-emerald-400" },
    { label: "Total Actions", value: activity?.length || 0, icon: Activity, color: "text-amber-400" },
  ];

  return (
    <div className="min-h-full">
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center justify-between max-w-[1400px]">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Workforce</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your AI employees</p>
          </div>
          <div className="flex items-center gap-3">
            <KillSwitch onRevoke={() => mutateTrust()} />
            <Button size="sm" render={<Link href="/dashboard/hire" />}>
              <UserPlus className="h-4 w-4 mr-1.5" />
              Hire Employee
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-[1400px] space-y-8">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Employees</h2>
            {activeAgents.length > 0 && (
              <Button variant="ghost" size="xs" render={<Link href="/dashboard/hire" />}>
                <UserPlus className="h-3 w-3 mr-1" />
                Hire
              </Button>
            )}
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
              >
                <Card className="border-dashed hover:border-primary/30 hover:bg-primary/[0.02] transition-all cursor-pointer group h-full">
                  <CardContent className="flex flex-col items-center justify-center gap-3 min-h-[200px]">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <UserPlus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Hire Employee</p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          </div>
        </section>

        <Separator />

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recent Activity</h2>
            <Button variant="ghost" size="xs" render={<Link href="/dashboard/audit" />}>
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <ActivityFeed activities={activity || []} />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
