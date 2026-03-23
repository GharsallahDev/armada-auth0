"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AGENT_COLOR_PALETTE } from "@/lib/trust/levels";

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
    <div className="h-[400px] overflow-y-auto scrollbar-thin">
      <div className="flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {activities.map((activity) => {
            const agentLabel = activity.agentName;
            const agentColor = "#818cf8"; // default indigo

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium shrink-0"
                        style={{
                          backgroundColor: `${agentColor}15`,
                          color: agentColor,
                        }}
                      >
                        {agentLabel}
                      </span>
                      <span className="text-[13px] font-medium text-neutral-200 truncate">
                        {formatActionType(activity.actionType)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                      <span>{activity.service}</span>
                      {activity.outputSummary && (
                        <>
                          <span className="text-neutral-600">·</span>
                          <span className="truncate">
                            {activity.outputSummary}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[11px] text-neutral-600">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                    {activity.trustPointsEarned > 0 && (
                      <span className="text-[11px] font-medium text-emerald-400/80">
                        +{activity.trustPointsEarned} pts
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {activities.length === 0 && (
          <div className="flex items-center justify-center py-12 text-[13px] text-neutral-600">
            No activity yet
          </div>
        )}
      </div>
    </div>
  );
}
