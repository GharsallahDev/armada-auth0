"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  AGENT_DISPLAY,
  TRUST_LEVEL_COLORS,
  type AgentName,
  type TrustLevel,
} from "@/lib/trust/levels";

interface Activity {
  id: string;
  agentName: string;
  actionType: string;
  service: string;
  outputSummary: string | null;
  trustPointsEarned: number;
  createdAt: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatActionType(actionType: string): string {
  return actionType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <ScrollArea className="h-[400px] w-full">
      <div className="flex flex-col gap-1 p-1">
        <AnimatePresence initial={false}>
          {activities.map((activity) => {
            const agentDisplay =
              AGENT_DISPLAY[activity.agentName as AgentName];
            const agentLabel = agentDisplay?.label ?? activity.agentName;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="shrink-0">
                        {agentLabel}
                      </Badge>
                      <span className="text-sm font-medium text-foreground truncate">
                        {formatActionType(activity.actionType)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{activity.service}</span>
                      {activity.outputSummary && (
                        <>
                          <span>-</span>
                          <span className="truncate">
                            {activity.outputSummary}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                    {activity.trustPointsEarned > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        +{activity.trustPointsEarned} pts
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {activities.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            No activity yet
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
