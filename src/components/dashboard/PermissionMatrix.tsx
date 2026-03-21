"use client";

import { Lock, Eye, Pencil, Play, Zap } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AGENT_DISPLAY,
  AGENT_SERVICES,
  TRUST_LEVEL_COLORS,
  type AgentName,
  type TrustLevel,
} from "@/lib/trust/levels";

const SERVICES = ["gmail", "calendar", "stripe", "slack", "drive"] as const;

const PERMISSION_ICONS: Record<
  number,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  0: { icon: Lock, label: "No Access" },
  1: { icon: Eye, label: "Read" },
  2: { icon: Pencil, label: "Draft" },
  3: { icon: Play, label: "Execute" },
  4: { icon: Zap, label: "Autonomous" },
};

const AGENTS: AgentName[] = [
  "orchestrator",
  "comms",
  "scheduler",
  "finance",
  "docs",
];

interface PermissionMatrixProps {
  agentTrustLevels: Record<AgentName, number>;
}

function getPermissionLevel(
  agentName: AgentName,
  service: string,
  trustLevel: number
): number {
  const agentServices = AGENT_SERVICES[agentName];
  if (!agentServices.includes(service)) return 0;
  // Map trust level to permission: 0->1(read), 1->2(draft), 2->3(execute), 3->4(autonomous)
  return trustLevel + 1;
}

export function PermissionMatrix({ agentTrustLevels }: PermissionMatrixProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[160px]">Agent</TableHead>
            {SERVICES.map((service) => (
              <TableHead key={service} className="text-center capitalize">
                {service}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {AGENTS.map((agentName) => {
            const trustLevel = agentTrustLevels[agentName] ?? 0;
            const color =
              TRUST_LEVEL_COLORS[trustLevel as TrustLevel] ?? "#ef4444";

            return (
              <TableRow key={agentName}>
                <TableCell className="font-medium">
                  {AGENT_DISPLAY[agentName].label}
                </TableCell>
                {SERVICES.map((service) => {
                  const permLevel = getPermissionLevel(
                    agentName,
                    service,
                    trustLevel
                  );
                  const perm = PERMISSION_ICONS[permLevel] ?? PERMISSION_ICONS[0];
                  const IconComp = perm.icon;
                  const isConnected =
                    AGENT_SERVICES[agentName].includes(service);

                  return (
                    <TableCell key={service} className="text-center">
                      <div
                        className="mx-auto flex h-8 w-8 items-center justify-center rounded-md"
                        style={{
                          backgroundColor: isConnected
                            ? `${color}18`
                            : undefined,
                          color: isConnected ? color : undefined,
                        }}
                        title={perm.label}
                      >
                        <IconComp
                          className={`size-4 ${
                            !isConnected ? "text-muted-foreground/40" : ""
                          }`}
                        />
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
