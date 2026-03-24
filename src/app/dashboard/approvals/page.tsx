"use client";

import useSWR from "swr";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, CheckCircle, XCircle, Clock, AlertTriangle,
  Shield, Bell, ArrowUpRight, Filter, Loader2,
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

function timeRemaining(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")} remaining`;
}

interface CibaRequest {
  id: string;
  agentName: string;
  action: string;
  details: string;
  service: string;
  status: "pending" | "approved" | "denied" | "expired";
  createdAt: string;
  expiresAt: string;
}

type FilterTab = "all" | "pending" | "approved" | "denied";

export default function ApprovalsPage() {
  const { data: requests, mutate } = useSWR<CibaRequest[]>("/api/ciba", fetcher, { refreshInterval: 3000 });
  const [filter, setFilter] = useState<FilterTab>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pending = requests?.filter((r) => r.status === "pending") || [];
  const approved = requests?.filter((r) => r.status === "approved") || [];
  const denied = requests?.filter((r) => r.status === "denied" || r.status === "expired") || [];

  const filtered = filter === "all" ? requests || [] :
    filter === "pending" ? pending :
    filter === "approved" ? approved : denied;

  const tabs: { id: FilterTab; label: string; count: number; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "all", label: "All", count: requests?.length || 0, icon: Shield },
    { id: "pending", label: "Pending", count: pending.length, icon: Clock },
    { id: "approved", label: "Approved", count: approved.length, icon: CheckCircle },
    { id: "denied", label: "Denied", count: denied.length, icon: XCircle },
  ];

  async function handleAction(id: string, action: "approved" | "denied") {
    setProcessingId(id);
    try {
      await fetch(`/api/ciba/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      await mutate();
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-border/50 px-8 py-6">
        <div className="max-w-[1400px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Approvals</h1>
              <p className="text-[13px] text-muted-foreground mt-0.5">CIBA authorization requests from your AI employees</p>
            </div>
          </div>
          {pending.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Bell className="h-4 w-4 text-amber-400 animate-pulse" />
              <span className="text-[12px] font-semibold text-amber-400">{pending.length} pending</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-8 max-w-[1400px] space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Requests", value: requests?.length || 0, gradient: "from-indigo-500 to-violet-500", icon: Shield },
            { label: "Pending", value: pending.length, gradient: "from-amber-500 to-orange-500", icon: Clock },
            { label: "Approved", value: approved.length, gradient: "from-emerald-500 to-green-500", icon: CheckCircle },
            { label: "Denied / Expired", value: denied.length, gradient: "from-red-500 to-rose-500", icon: XCircle },
          ].map((stat, i) => (
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
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="approval-tab-bg"
                    className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/30 tabular-nums">
                    {tab.count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Requests List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((req, i) => {
              const isPending = req.status === "pending";
              const isExpired = new Date(req.expiresAt).getTime() < Date.now() && isPending;
              return (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className={`group rounded-xl border bg-card/30 backdrop-blur-sm px-5 py-4 transition-all ${
                    isPending && !isExpired
                      ? "border-amber-500/30 bg-amber-500/[0.03]"
                      : req.status === "approved"
                      ? "border-emerald-500/20"
                      : "border-border/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isPending && !isExpired ? "bg-amber-500/10 border border-amber-500/20" :
                      req.status === "approved" ? "bg-emerald-500/10 border border-emerald-500/20" :
                      "bg-red-500/10 border border-red-500/20"
                    }`}>
                      {isPending && !isExpired ? <Clock className="h-4 w-4 text-amber-400" /> :
                       req.status === "approved" ? <CheckCircle className="h-4 w-4 text-emerald-400" /> :
                       <XCircle className="h-4 w-4 text-red-400" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[14px] font-semibold text-foreground">{req.action}</span>
                        {isPending && !isExpired && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                            Awaiting approval
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-muted-foreground mb-2 line-clamp-2">{req.details}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[11px] text-muted-foreground tabular-nums">{timeAgo(req.createdAt)}</span>
                        <span className="text-border/50">·</span>
                        <span className="text-[11px] font-semibold text-foreground/70">{req.agentName}</span>
                        <span className="text-border/50">·</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground border border-border/30 capitalize">{req.service}</span>
                        {isPending && !isExpired && (
                          <>
                            <span className="text-border/50">·</span>
                            <span className="text-[10px] text-amber-400 font-medium tabular-nums">{timeRemaining(req.expiresAt)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {isPending && !isExpired && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAction(req.id, "denied")}
                          disabled={processingId === req.id}
                          className="h-9 px-3 rounded-lg text-[12px] font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          {processingId === req.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Deny"}
                        </button>
                        <button
                          onClick={() => handleAction(req.id, "approved")}
                          disabled={processingId === req.id}
                          className="h-9 px-4 rounded-lg text-[12px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                        >
                          {processingId === req.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Approve"}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed border-border/50 bg-card/30 py-16 flex flex-col items-center justify-center gap-3"
            >
              <div className="h-12 w-12 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-[13px] text-muted-foreground">
                {filter === "pending" ? "No pending approval requests" :
                 filter === "approved" ? "No approved requests yet" :
                 filter === "denied" ? "No denied requests" :
                 "No CIBA requests yet. Agents will request approval for sensitive actions."}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
