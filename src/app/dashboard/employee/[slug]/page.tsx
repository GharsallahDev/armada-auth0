"use client";

import { use } from "react";
import useSWR from "swr";
import { AgentProfile } from "@/components/dashboard/AgentProfile";
import { Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function EmployeePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: agent, isLoading, mutate } = useSWR(
    `/api/agents/${slug}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (!agent || agent.error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-neutral-500">Employee not found</p>
      </div>
    );
  }

  return <AgentProfile agent={agent} onRefresh={() => mutate()} />;
}
