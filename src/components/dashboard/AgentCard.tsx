"use client";

import { useState } from "react";
import {
  Brain,
  MessageSquare,
  Calendar,
  DollarSign,
  FileText,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AGENT_DISPLAY,
  AGENT_SERVICES,
  type AgentName,
} from "@/lib/trust/levels";
import { TrustGauge } from "./TrustGauge";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  MessageSquare,
  Calendar,
  DollarSign,
  FileText,
};

interface AgentCardProps {
  agentName: AgentName;
  trust: {
    score: number;
    level: number;
    decayedScore: number;
  };
}

export function AgentCard({ agentName, trust }: AgentCardProps) {
  const [isRevoking, setIsRevoking] = useState(false);
  const display = AGENT_DISPLAY[agentName];
  const services = AGENT_SERVICES[agentName];
  const IconComponent = ICON_MAP[display.icon];

  async function handleRevoke() {
    setIsRevoking(true);
    try {
      await fetch(`/api/trust/${agentName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke" }),
      });
    } catch (error) {
      console.error("Failed to revoke trust:", error);
    } finally {
      setIsRevoking(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          {IconComponent && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <IconComponent className="size-5 text-foreground" />
            </div>
          )}
          <div className="flex-1">
            <CardTitle>{display.label}</CardTitle>
            <CardDescription>{display.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <TrustGauge
          score={trust.decayedScore}
          level={trust.level}
          agentName={agentName}
        />
        {services.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {services.map((service) => (
              <Badge key={service} variant="secondary">
                {service}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-center pb-4">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleRevoke}
          disabled={isRevoking || trust.level === 0}
        >
          {isRevoking ? "Revoking..." : "Revoke Trust"}
        </Button>
      </CardFooter>
    </Card>
  );
}
