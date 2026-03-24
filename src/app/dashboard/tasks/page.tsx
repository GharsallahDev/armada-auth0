"use client";

import useSWR from "swr";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListTodo, Clock, CheckCircle2, XCircle, Loader2, Play,
  Pause, ArrowUpRight, Filter, Zap, Users, BarChart3,
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
} from "lucide-react";
import { SERVICE_DISPLAY } from "@/lib/trust/levels";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail, Calendar, HardDrive, Hash, CreditCard, Github, MessageCircle,
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface Agent {
  slug: string;
  name: string;
  role: string;
  avatarGradient: string;
  services: string[];
  status: string;
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

interface Task {
  id: string;
  agentName: string;
  agentSlug: string;
  avatarGradient: string;
  action: string;
  service: string;
  status: "running" | "completed" | "failed" | "waiting_approval";
  startedAt: string;
  cibaRequired: boolean;
}

function generateTasks(agents: Agent[], logs: AuditLog[], cibaRequests: any[]): Task[] {
  const tasks: Task[] = [];

  // Pending CIBA = waiting approval
  cibaRequests?.filter((r: any) => r.status === "pending").forEach((req: any) => {
    const agent = agents.find((a) => a.name === req.agentName);
    tasks.push({
      id: `ciba-${req.id}`,
      agentName: req.agentName,
      agentSlug: agent?.slug || "",
      avatarGradient: agent?.avatarGradient || "from-gray-500 to-slate-600",
      action: req.action,
      service: req.service,
      status: "waiting_approval",
      startedAt: req.createdAt,
      cibaRequired: true,
    });
  });

  // Recent audit logs as tasks
  logs?.slice(0, 30).forEach((log) => {
    const agent = agents.find((a) => a.name === log.agentName);
    tasks.push({
      id: `log-${log.id}`,
      agentName: log.agentName,
      agentSlug: agent?.slug || "",
      avatarGradient: agent?.avatarGradient || "from-gray-500 to-slate-600",
      action: log.action,
      service: log.service,
      status: log.success ? "completed" : "failed",
      startedAt: log.createdAt,
      cibaRequired: log.cibaRequired,
    });
  });

  // Simulate some running tasks for active agents
  agents.filter((a) => a.status === "active").forEach((agent) => {
    if (Math.random() > 0.5 && agent.services.length > 0) {
      tasks.push({
        id: `running-${agent.slug}`,
        agentName: agent.name,
        agentSlug: agent.slug,
        avatarGradient: agent.avatarGradient,
        action: `Processing ${agent.services[0]} tasks`,
        service: agent.services[0],
        status: "running",
        startedAt: new Date(Date.now() - Math.random() * 300000).toISOString(),
        cibaRequired: false,
      });
    }
  });

  return tasks.sort((a, b) => {
    const statusOrder = { running: 0, waiting_approval: 1, completed: 2, failed: 3 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
  });
}

const statusConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string; label: string }> = {
  running: { icon: Loader2, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Running" },
  completed: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Completed" },
  failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Failed" },
  waiting_approval: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Awaiting Approval" },
};

type FilterType = "all" | "running" | "completed" | "failed" | "waiting_approval";

export default function TasksPage() {
  const { data: agents } = useSWR<Agent[]>("/api/agents", fetcher, { refreshInterval: 5000 });
  const { data: logs } = useSWR<AuditLog[]>("/api/audit?limit=50", fetcher, { refreshInterval: 5000 });
  const { data: cibaRequests } = useSWR("/api/ciba", fetcher, { refreshInterval: 3000 });
  const [filter, setFilter] = useState<FilterType>("all");

  const activeAgents = agents?.filter((a) => a.status === "active") || [];
  const tasks = generateTasks(activeAgents, logs || [], cibaRequests || []);

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const counts = {
    all: tasks.length,
    running: tasks.filter((t) => t.status === "running").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    failed: tasks.filter((t) => t.status === "failed").length,
    waiting_approval: tasks.filter((t) => t.status === "waiting_approval").length,
  };

  const filterTabs: { id: FilterType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "all", label: "All", icon: ListTodo },
    { id: "running", label: "Running", icon: Play },
    { id: "waiting_approval", label: "Pending", icon: Clock },
    { id: "completed", label: "Done", icon: CheckCircle2 },
    { id: "failed", label: "Failed", icon: XCircle },
  ];

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-border/50 px-8 py-6">
        <div className=" flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center">
            <ListTodo className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Task Queue</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Monitor active work and task history across your workforce</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-8  space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Running", value: counts.running, gradient: "from-blue-500 to-cyan-500", icon: Play },
            { label: "Awaiting Approval", value: counts.waiting_approval, gradient: "from-amber-500 to-orange-500", icon: Clock },
            { label: "Completed", value: counts.completed, gradient: "from-emerald-500 to-green-500", icon: CheckCircle2 },
            { label: "Failed", value: counts.failed, gradient: "from-red-500 to-rose-500", icon: XCircle },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
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
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = filter === tab.id;
            const count = counts[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="task-tab-bg"
                    className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${tab.id === "running" && isActive ? "animate-spin" : ""}`} />
                  {tab.label}
                  {count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/30 tabular-nums">
                      {count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Task List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((task, i) => {
              const config = statusConfig[task.status];
              const StatusIcon = config.icon;
              const serviceDisplay = SERVICE_DISPLAY[task.service];
              const ServiceIcon = serviceDisplay ? ICON_MAP[serviceDisplay.icon] : null;
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className={`group rounded-xl border bg-card/30 backdrop-blur-sm px-5 py-4 hover:bg-muted/20 transition-all ${
                    task.status === "running" ? "border-blue-500/20" :
                    task.status === "waiting_approval" ? "border-amber-500/20" :
                    "border-border/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Agent Avatar */}
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${task.avatarGradient} flex items-center justify-center text-[12px] font-bold text-white shrink-0 shadow-sm`}>
                      {task.agentName[0]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-semibold text-foreground truncate">{task.action}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-muted-foreground tabular-nums">{timeAgo(task.startedAt)}</span>
                        <span className="text-border/50">·</span>
                        <span className="text-[11px] font-medium text-foreground/70">{task.agentName}</span>
                        {serviceDisplay && (
                          <>
                            <span className="text-border/50">·</span>
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground border border-border/30">
                              {ServiceIcon && <ServiceIcon className="h-3 w-3" />}
                              {serviceDisplay.label}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${config.bg} ${config.color} ${config.border} border shrink-0`}>
                      <StatusIcon className={`h-3.5 w-3.5 ${task.status === "running" ? "animate-spin" : ""}`} />
                      {config.label}
                    </div>

                    {task.cibaRequired && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                        CIBA
                      </span>
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
                <ListTodo className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-[13px] text-muted-foreground">
                {filter === "running" ? "No tasks currently running." :
                 filter === "waiting_approval" ? "No tasks awaiting approval." :
                 filter === "failed" ? "No failed tasks. Your workforce is performing well." :
                 "No tasks yet. Chat with an employee to assign work."}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
