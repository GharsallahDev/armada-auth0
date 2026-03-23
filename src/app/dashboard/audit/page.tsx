"use client";

import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
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

const AGENT_BADGE_COLORS = [
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
  return AGENT_BADGE_COLORS[Math.abs(hash) % AGENT_BADGE_COLORS.length];
}

export default function AuditPage() {
  const { data: logs } = useSWR("/api/audit?limit=100", fetcher, {
    refreshInterval: 5000,
  });

  const totalActions = logs?.length || 0;
  const cibaActions = logs?.filter((l: { cibaRequired: boolean }) => l.cibaRequired).length || 0;
  const cibaApproved =
    logs?.filter((l: { cibaRequired: boolean; cibaApproved: boolean }) => l.cibaRequired && l.cibaApproved).length || 0;
  const successRate = totalActions
    ? Math.round(
        (logs.filter((l: { success: boolean }) => l.success).length / totalActions) * 100
      )
    : 0;

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-1">Operations Log</p>
        <h1 className="text-xl font-semibold tracking-tight text-white">Audit Trail</h1>
        <p className="text-[13px] text-neutral-500 mt-1">
          Complete log of all agent actions and authorization events
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Actions",
            value: totalActions,
            icon: Shield,
          },
          {
            label: "CIBA Requests",
            value: cibaActions,
            icon: Clock,
          },
          {
            label: "CIBA Approved",
            value: cibaApproved,
            icon: CheckCircle,
          },
          {
            label: "Success Rate",
            value: `${successRate}%`,
            icon: CheckCircle,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Log Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Time</TableHead>
                  <TableHead className="w-[100px]">Agent</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="w-[80px]">Service</TableHead>
                  <TableHead className="w-[80px]">Type</TableHead>
                  <TableHead className="w-[60px]">Trust</TableHead>
                  <TableHead className="w-[60px]">CIBA</TableHead>
                  <TableHead className="w-[60px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs?.map(
                  (log: {
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
                  }) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {timeAgo(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getAgentColor(log.agentName)}
                        >
                          {log.agentName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-mono truncate max-w-[200px]">
                        {log.action}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {log.service}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{log.actionType}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-xs">
                          L{log.trustLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {log.cibaRequired ? (
                          log.cibaApproved ? (
                            <CheckCircle className="h-4 w-4 text-green-500 inline" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 inline" />
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {log.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500 inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 inline" />
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )}
                {(!logs || logs.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No agent actions yet. Chat with an employee to see
                      the audit trail populate.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
