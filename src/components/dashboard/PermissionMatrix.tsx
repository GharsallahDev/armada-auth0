"use client";

import useSWR from "swr";
import { Lock, Eye, Pencil, Play, Zap } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { TRUST_LEVEL_COLORS, SERVICE_DISPLAY, type TrustLevel } from "@/lib/trust/levels";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PERMISSION_ICONS: Record<number, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  0: { icon: Lock, label: "No Access" },
  1: { icon: Eye, label: "Read" },
  2: { icon: Pencil, label: "Draft" },
  3: { icon: Play, label: "Execute" },
  4: { icon: Zap, label: "Autonomous" },
};

export function PermissionMatrix() {
  const { data: agents } = useSWR<any[]>("/api/agents", fetcher);
  const { data: trustData } = useSWR<Record<string, { level: number }>>("/api/trust", fetcher);

  const activeAgents = agents?.filter((a) => a.status === "active") || [];
  const allServices = [...new Set(activeAgents.flatMap((a) => a.services as string[]))];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[160px]">Employee</TableHead>
            {allServices.map((service) => (
              <TableHead key={service} className="text-center">
                {SERVICE_DISPLAY[service]?.label || service}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeAgents.map((agent) => {
            const trustLevel = trustData?.[agent.slug]?.level ?? 0;
            const color = TRUST_LEVEL_COLORS[trustLevel as TrustLevel] ?? "#ef4444";

            return (
              <TableRow key={agent.slug}>
                <TableCell className="font-medium text-neutral-300">{agent.name}</TableCell>
                {allServices.map((service) => {
                  const hasService = (agent.services as string[]).includes(service);
                  const permLevel = hasService ? trustLevel + 1 : 0;
                  const perm = PERMISSION_ICONS[permLevel] ?? PERMISSION_ICONS[0];
                  const IconComp = perm.icon;

                  return (
                    <TableCell key={service} className="text-center">
                      <div
                        className="mx-auto flex h-8 w-8 items-center justify-center rounded-md"
                        style={{
                          backgroundColor: hasService ? `${color}18` : undefined,
                          color: hasService ? color : undefined,
                        }}
                        title={perm.label}
                      >
                        <IconComp className={`size-4 ${!hasService ? "text-muted-foreground/40" : ""}`} />
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
