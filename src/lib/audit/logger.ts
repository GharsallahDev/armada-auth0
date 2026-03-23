import { db } from "@/lib/db/client";
import { auditLogs, agentActions } from "@/lib/db/schema";
import { addTrustPoints } from "@/lib/trust/engine";
import { TRUST_POINTS } from "@/lib/trust/levels";
import { desc, eq } from "drizzle-orm";

interface LogActionParams {
  userId: string;
  agentName: string;
  action: string;
  actionType: "read" | "draft" | "execute";
  service: string;
  trustLevel: number;
  details?: Record<string, unknown>;
  tokenUsed?: boolean;
  cibaRequired?: boolean;
  cibaApproved?: boolean;
  success?: boolean;
  durationMs?: number;
  inputSummary?: string;
  outputSummary?: string;
}

export async function logAction(params: LogActionParams) {
  const {
    userId,
    agentName,
    action,
    actionType,
    service,
    trustLevel,
    details,
    tokenUsed = false,
    cibaRequired = false,
    cibaApproved,
    success = true,
    durationMs,
    inputSummary,
    outputSummary,
  } = params;

  // Determine trust points earned
  let pointsEarned = 0;
  if (success) {
    switch (actionType) {
      case "read":
        pointsEarned = TRUST_POINTS.READ_SUCCESS;
        break;
      case "draft":
        pointsEarned = TRUST_POINTS.DRAFT_APPROVED;
        break;
      case "execute":
        pointsEarned = cibaApproved
          ? TRUST_POINTS.CIBA_APPROVED
          : TRUST_POINTS.EXECUTION_SUCCESS;
        break;
    }
  }

  // Write audit log
  await db.insert(auditLogs).values({
    userId,
    agentName,
    action,
    actionType,
    service,
    trustLevel,
    details: details ?? null,
    tokenUsed,
    cibaRequired,
    cibaApproved: cibaApproved ?? null,
    success,
    durationMs: durationMs ?? null,
  });

  // Write agent action
  await db.insert(agentActions).values({
    userId,
    agentName,
    actionType,
    service,
    inputSummary: inputSummary ?? null,
    outputSummary: outputSummary ?? null,
    success,
    durationMs: durationMs ?? null,
    trustPointsEarned: pointsEarned,
  });

  // Update trust score if action was successful
  if (success && pointsEarned > 0) {
    await addTrustPoints(userId, agentName, pointsEarned, action);
  }

  return { pointsEarned };
}

export async function getAuditLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  return db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.userId, userId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getAgentActivity(
  userId: string,
  limit: number = 20
) {
  return db
    .select()
    .from(agentActions)
    .where(eq(agentActions.userId, userId))
    .orderBy(desc(agentActions.createdAt))
    .limit(limit);
}
