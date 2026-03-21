"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { PermissionMatrix } from "@/components/dashboard/PermissionMatrix";
import { KillSwitch } from "@/components/dashboard/KillSwitch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AgentName } from "@/lib/trust/levels";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type TrustData = Record<
  string,
  { score: number; level: number; decayedScore: number }
>;

export default function DashboardPage() {
  const {
    data: trustData,
    mutate: mutateTrust,
  } = useSWR<TrustData>("/api/trust", fetcher, {
    refreshInterval: 5000,
  });

  const { data: activity } = useSWR("/api/audit?type=activity&limit=20", fetcher, {
    refreshInterval: 5000,
  });

  const agents: AgentName[] = ["comms", "scheduler", "finance", "docs"];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Permission Control Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage your AI agent fleet
          </p>
        </div>
        <KillSwitch onRevoke={() => mutateTrust()} />
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <AgentCard
            key={agent}
            agentName={agent}
            trust={
              trustData?.[agent] || { score: 0, level: 0, decayedScore: 0 }
            }
          />
        ))}
      </div>

      {/* Tabs: Activity + Permissions */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Live Activity</TabsTrigger>
          <TabsTrigger value="permissions">Permission Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <ActivityFeed activities={activity || []} />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionMatrix
            agentTrustLevels={
              Object.fromEntries(
                Object.entries(trustData || {}).map(([k, v]) => [k, v.level])
              ) as Record<AgentName, number>
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
