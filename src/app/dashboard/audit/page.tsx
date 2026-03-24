"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Shield, CheckCircle, XCircle, Clock, ScrollText, Activity,
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

const AGENT_COLORS = [
  "bg-indigo-500/10 text-indigo-400",
  "bg-cyan-500/10 text-cyan-400",
  "bg-emerald-500/10 text-emerald-400",
  "bg-amber-500/10 text-amber-400",
  "bg-rose-500/10 text-rose-400",
  "bg-violet-500/10 text-violet-400",
];

function getAgentColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AGENT_COLORS[Math.abs(hash) % AGENT_COLORS.length];
}

export default function AuditPage() {
  const { data: logs } = useSWR("/api/audit?limit=100", fetcher, { refreshInterval: 5000 });

  const totalActions = logs?.length || 0;
  const cibaActions = logs?.filter((l: { cibaRequired: boolean }) => l.cibaRequired).length || 0;
  const cibaApproved = logs?.filter((l: { cibaRequired: boolean; cibaApproved: boolean }) => l.cibaRequired && l.cibaApproved).length || 0;
  const successRate = totalActions
    ? Math.round((logs.filter((l: { success: boolean }) => l.success).length / totalActions) * 100)
    : 0;

  const stats = [
    { label: "Total Actions", value: totalActions, icon: Activity, color: "text-indigo-400", gradient: "from-indigo-500/20 to-violet-500/20", borderColor: "border-indigo-500/20" },
    { label: "CIBA Requests", value: cibaActions, icon: Clock, color: "text-amber-400", gradient: "from-amber-500/20 to-orange-500/20", borderColor: "border-amber-500/20" },
    { label: "CIBA Approved", value: cibaApproved, icon: CheckCircle, color: "text-emerald-400", gradient: "from-emerald-500/20 to-green-500/20", borderColor: "border-emerald-500/20" },
    { label: "Success Rate", value: `${successRate}%`, icon: Shield, color: "text-blue-400", gradient: "from-blue-500/20 to-cyan-500/20", borderColor: "border-blue-500/20" },
  ];

  return (
    <div className="min-h-full">
      <div className="border-b border-border/50 px-8 py-6">
        <div className="max-w-[1400px] flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center">
            <ScrollText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Audit Trail</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Complete log of all agent actions and authorization events</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-[1400px] space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`group relative overflow-hidden rounded-2xl border ${stat.borderColor} bg-card/50 backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-lg`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Log Table */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="w-[100px] text-[11px]">Time</TableHead>
                  <TableHead className="w-[100px] text-[11px]">Agent</TableHead>
                  <TableHead className="text-[11px]">Action</TableHead>
                  <TableHead className="w-[80px] text-[11px]">Service</TableHead>
                  <TableHead className="w-[60px] text-[11px]">Trust</TableHead>
                  <TableHead className="w-[60px] text-[11px]">CIBA</TableHead>
                  <TableHead className="w-[60px] text-[11px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs?.map((log: {
                  id: string; createdAt: string; agentName: string; action: string;
                  service: string; actionType: string; trustLevel: number;
                  cibaRequired: boolean; cibaApproved: boolean | null; success: boolean;
                }) => (
                  <TableRow key={log.id} className="border-border/20 hover:bg-muted/20">
                    <TableCell className="text-[11px] text-muted-foreground tabular-nums">{timeAgo(log.createdAt)}</TableCell>
                    <TableCell>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${getAgentColor(log.agentName)}`}>
                        {log.agentName}
                      </span>
                    </TableCell>
                    <TableCell className="text-[12px] font-mono text-foreground/80 truncate max-w-[200px]">{log.action}</TableCell>
                    <TableCell>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground border border-border/30">{log.service}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-[11px] font-bold text-muted-foreground">L{log.trustLevel}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {log.cibaRequired ? (
                        log.cibaApproved ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400 inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 inline" />
                        )
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {log.success ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400 inline" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400 inline" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!logs || logs.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                      No agent actions yet. Chat with an employee to see the audit trail populate.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
