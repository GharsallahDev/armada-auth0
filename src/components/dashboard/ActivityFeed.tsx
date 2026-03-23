"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  return `${Math.floor(diffHours / 24)}d ago`;
}

function formatActionType(actionType: string): string {
  return actionType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <ScrollArea className="h-[400px]">
      <div className="divide-y divide-border">
        <AnimatePresence initial={false}>
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Badge variant="secondary" className="shrink-0">{activity.agentName}</Badge>
                <span className="text-sm font-medium text-foreground truncate">{formatActionType(activity.actionType)}</span>
                <Badge variant="outline" className="shrink-0 text-[10px]">{activity.service}</Badge>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {activity.trustPointsEarned > 0 && (
                  <span className="text-xs font-medium text-emerald-400 tabular-nums">+{activity.trustPointsEarned}</span>
                )}
                <span className="text-xs text-muted-foreground tabular-nums">{formatRelativeTime(activity.createdAt)}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {activities.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            No activity yet. Chat with an employee to get started.
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
