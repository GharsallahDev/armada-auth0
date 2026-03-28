"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { TRUST_LEVEL_NAMES, SERVICE_DISPLAY, type TrustLevel } from "@/lib/trust/levels";
import { resolveAvatarUrl } from "@/lib/avatar";
import { AgentChat } from "@/components/dashboard/AgentChat";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Agent {
  id: string;
  name: string;
  slug: string;
  role: string;
  services: string[];
  avatarGradient: string;
  avatarUrl?: string | null;
  status: string;
  createdAt: string;
}

const LEVEL_DOT: Record<number, string> = {
  0: "bg-red-400",
  1: "bg-amber-400",
  2: "bg-blue-400",
  3: "bg-emerald-400",
};

export default function MessagesPage() {
  const { data: agents, isLoading } = useSWR<Agent[]>("/api/agents", fetcher, { refreshInterval: 5000 });
  const { data: trustData } = useSWR<Record<string, { score: number; level: number; decayedScore: number }>>("/api/trust", fetcher, { refreshInterval: 10000 });
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const activeAgents = (agents || []).filter((a) => a.status === "active");
  const filtered = search
    ? activeAgents.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase()))
    : activeAgents;

  const selected = activeAgents.find((a) => a.slug === selectedSlug);

  // Auto-select first agent if none selected
  if (!selectedSlug && activeAgents.length > 0 && !selected) {
    // Don't call setState during render — handled by onClick or useEffect below
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar — conversation list */}
      <div className="w-[340px] border-r border-border/50 flex flex-col shrink-0">
        {/* Header */}
        <div className="px-4 py-4 border-b border-border/50">
          <h1 className="text-[15px] font-bold text-foreground mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[13px] rounded-xl bg-muted/40 dark:bg-white/[0.04] border border-border/40 dark:border-white/[0.06] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>

        {/* Agent list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="divide-y divide-border/20 dark:divide-white/[0.03]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                  <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-40" />
                    <div className="flex gap-1">
                      <Skeleton className="h-4 w-12 rounded" />
                      <Skeleton className="h-4 w-14 rounded" />
                      <Skeleton className="h-4 w-10 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isLoading && activeAgents.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <div className="h-14 w-14 rounded-2xl bg-muted/30 border border-border/40 flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-[13px] font-medium text-muted-foreground">No employees yet</p>
              <p className="text-[11px] text-muted-foreground/50 mt-1">Hire an employee to start chatting</p>
            </div>
          )}
          {filtered.map((agent) => {
            const trust = trustData?.[agent.slug];
            const level = trust?.level ?? 0;
            const isSelected = agent.slug === selectedSlug;
            return (
              <button
                key={agent.slug}
                onClick={() => setSelectedSlug(agent.slug)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-150 border-b border-border/20 dark:border-white/[0.03]",
                  isSelected
                    ? "bg-primary/[0.06] dark:bg-primary/[0.08] border-l-2 border-l-primary"
                    : "hover:bg-muted/30 dark:hover:bg-white/[0.03] border-l-2 border-l-transparent"
                )}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="h-10 w-10 rounded-xl overflow-hidden bg-muted/30 shadow-sm">
                    <img src={resolveAvatarUrl(agent.avatarUrl, agent.slug)} alt={agent.name} className="h-full w-full object-cover" />
                  </div>
                  <div className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background", agent.status === "active" ? "bg-emerald-400" : "bg-gray-400")} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-[13px] font-semibold truncate", isSelected ? "text-foreground" : "text-foreground/80")}>{agent.name}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={cn("h-1.5 w-1.5 rounded-full", LEVEL_DOT[level])} />
                      <span className="text-[10px] text-muted-foreground/50">L{level}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">{agent.role}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {agent.services.slice(0, 3).map((s) => (
                      <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 dark:bg-white/[0.04] text-muted-foreground/50 font-medium">
                        {SERVICE_DISPLAY[s]?.label || s}
                      </span>
                    ))}
                    {agent.services.length > 3 && (
                      <span className="text-[9px] text-muted-foreground/40">+{agent.services.length - 3}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel — chat */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col h-full">
            {/* Skeleton chat header */}
            <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3 shrink-0">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <div className="flex-1" />
          </div>
        ) : (
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full min-h-0"
            >
              {/* Chat header */}
              <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3 shrink-0">
                <div className="h-8 w-8 rounded-lg overflow-hidden bg-muted/30">
                  <img src={resolveAvatarUrl(selected.avatarUrl, selected.slug)} alt={selected.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[14px] font-semibold text-foreground">{selected.name}</h2>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", LEVEL_DOT[trustData?.[selected.slug]?.level ?? 0] + "/10", "text-foreground/60")}>
                      {TRUST_LEVEL_NAMES[(trustData?.[selected.slug]?.level ?? 0) as TrustLevel]}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/60">{selected.role} &middot; {selected.services.length} services</p>
                </div>
              </div>

              {/* Chat body — fills remaining height */}
              <div className="flex-1 min-h-0">
                <AgentChat
                  slug={selected.slug}
                  agentName={selected.name}
                  avatarGradient={selected.avatarGradient}
                  avatarUrl={selected.avatarUrl}
                  services={selected.services}
                  fillHeight
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="h-16 w-16 rounded-2xl bg-muted/20 border border-border/30 flex items-center justify-center mb-4">
                <MessageSquare className="h-7 w-7 text-muted-foreground/30" />
              </div>
              <p className="text-[14px] font-medium text-muted-foreground/60">Select an employee to chat</p>
              <p className="text-[12px] text-muted-foreground/40 mt-1">
                {activeAgents.length > 0
                  ? `${activeAgents.length} employee${activeAgents.length > 1 ? "s" : ""} available`
                  : "Hire an employee to get started"
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </div>
    </div>
  );
}
