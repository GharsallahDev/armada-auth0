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
    <div className="min-h-full">
      {/* Page header */}
      <div className="border-b border-white/[0.06]">
        <div className="px-8 py-6 flex items-center justify-between max-w-[1400px]">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Permission Control Center
            </h1>
            <p className="text-[13px] text-neutral-500 mt-0.5">
              Monitor and manage your AI agent fleet
            </p>
          </div>
          <KillSwitch onRevoke={() => mutateTrust()} />
        </div>
      </div>

      <div className="px-8 py-8 max-w-[1400px] space-y-10">
        {/* Fleet overview */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 mb-4">
            Fleet Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
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
        </section>

        {/* Divider */}
        <div className="border-t border-white/[0.06]" />

        {/* Activity and permissions */}
        <section>
          <Tabs defaultValue="activity" className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                Operations
              </h2>
              <TabsList>
                <TabsTrigger value="activity">Live Activity</TabsTrigger>
                <TabsTrigger value="permissions">Permission Matrix</TabsTrigger>
              </TabsList>
            </div>

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
        </section>
      </div>
    </div>
  );
}
