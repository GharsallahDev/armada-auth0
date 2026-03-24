"use client";

import useSWR from "swr";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, BellOff, CheckCircle, XCircle, AlertTriangle, Info,
  TrendingUp, TrendingDown, Shield, Zap, UserPlus, Trash2,
  Clock, ArrowUpRight, Check, Filter,
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

interface Notification {
  id: string;
  type: "success" | "warning" | "error" | "info" | "promotion" | "ciba";
  title: string;
  message: string;
  agentName?: string;
  timestamp: string;
  read: boolean;
}

function generateNotifications(logs: AuditLog[], cibaRequests: any[]): Notification[] {
  const notifications: Notification[] = [];

  // Generate from audit logs
  logs?.slice(0, 30).forEach((log) => {
    if (log.cibaRequired && log.cibaApproved === false) {
      notifications.push({
        id: `ciba-denied-${log.id}`,
        type: "warning",
        title: "CIBA Request Denied",
        message: `${log.agentName}'s request to ${log.action} was denied.`,
        agentName: log.agentName,
        timestamp: log.createdAt,
        read: false,
      });
    }
    if (!log.success) {
      notifications.push({
        id: `fail-${log.id}`,
        type: "error",
        title: "Action Failed",
        message: `${log.agentName} failed to ${log.action} on ${log.service}.`,
        agentName: log.agentName,
        timestamp: log.createdAt,
        read: false,
      });
    }
    if (log.cibaRequired && log.cibaApproved === true) {
      notifications.push({
        id: `ciba-approved-${log.id}`,
        type: "ciba",
        title: "CIBA Approved",
        message: `You approved ${log.agentName}'s request to ${log.action}.`,
        agentName: log.agentName,
        timestamp: log.createdAt,
        read: true,
      });
    }
  });

  // Pending CIBA requests
  cibaRequests?.filter((r: any) => r.status === "pending").forEach((req: any) => {
    notifications.push({
      id: `ciba-pending-${req.id}`,
      type: "ciba",
      title: "Approval Needed",
      message: `${req.agentName} is requesting approval to ${req.action}.`,
      agentName: req.agentName,
      timestamp: req.createdAt,
      read: false,
    });
  });

  return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }> = {
  success: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  error: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  promotion: { icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  ciba: { icon: Shield, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
};

type FilterType = "all" | "unread" | "ciba" | "errors";

export default function NotificationsPage() {
  const { data: logs } = useSWR<AuditLog[]>("/api/audit?limit=100", fetcher, { refreshInterval: 5000 });
  const { data: cibaRequests } = useSWR("/api/ciba", fetcher, { refreshInterval: 5000 });
  const [filter, setFilter] = useState<FilterType>("all");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const allNotifications = generateNotifications(logs || [], cibaRequests || []);
  const notifications = allNotifications.map((n) => ({
    ...n,
    read: n.read || readIds.has(n.id),
  }));

  const filtered = filter === "all" ? notifications :
    filter === "unread" ? notifications.filter((n) => !n.read) :
    filter === "ciba" ? notifications.filter((n) => n.type === "ciba") :
    notifications.filter((n) => n.type === "error" || n.type === "warning");

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markRead(id: string) {
    setReadIds((prev) => new Set([...prev, id]));
  }

  function markAllRead() {
    setReadIds(new Set(notifications.map((n) => n.id)));
  }

  const filterTabs: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "unread", label: `Unread (${unreadCount})` },
    { id: "ciba", label: "CIBA" },
    { id: "errors", label: "Errors" },
  ];

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-border/50 px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
        <div className=" flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/20 flex items-center justify-center">
                <Bell className="h-5 w-5 text-rose-400" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-background">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Notifications</h1>
              <p className="text-[13px] text-muted-foreground mt-0.5">System alerts, approvals, and employee activity</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium text-muted-foreground border border-border/50 hover:bg-muted/50 hover:text-foreground transition-all"
            >
              <Check className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8  space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-1.5">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`relative px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="notif-tab-bg"
                    className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Notification List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((notif, i) => {
              const config = typeConfig[notif.type] || typeConfig.info;
              const Icon = config.icon;
              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  onClick={() => markRead(notif.id)}
                  className={`group rounded-xl border px-5 py-4 cursor-pointer transition-all ${
                    notif.read
                      ? "border-border/30 bg-card/20"
                      : `${config.border} ${config.bg.replace("/10", "/[0.03]")} border-l-2`
                  } hover:bg-muted/20`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[13px] font-semibold ${notif.read ? "text-foreground/70" : "text-foreground"}`}>
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                      <p className="text-[12px] text-muted-foreground">{notif.message}</p>
                      <span className="text-[10px] text-muted-foreground/60 mt-1 inline-block tabular-nums">
                        {timeAgo(notif.timestamp)}
                      </span>
                    </div>
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
                <BellOff className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-[13px] text-muted-foreground">
                {filter === "unread" ? "All caught up! No unread notifications." :
                 filter === "errors" ? "No errors or warnings. Your workforce is performing well." :
                 "No notifications yet. Activity will appear here as your agents work."}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
