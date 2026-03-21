import { db } from "@/lib/db/client";
import { trustScores, auditLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  TRUST_LEVELS,
  TRUST_THRESHOLDS,
  TRUST_DECAY_HALF_LIFE_DAYS,
  CIBA_REQUIRED_ACTIONS,
  type AgentName,
  type TrustLevel,
} from "./levels";

function applyDecay(score: number, lastActionAt: Date | null): number {
  if (!lastActionAt) return score;
  const daysSinceLastAction =
    (Date.now() - lastActionAt.getTime()) / (1000 * 60 * 60 * 24);
  const decayFactor = Math.pow(
    0.5,
    daysSinceLastAction / TRUST_DECAY_HALF_LIFE_DAYS
  );
  return Math.floor(score * decayFactor);
}

function scoreToLevel(score: number): TrustLevel {
  if (score >= TRUST_THRESHOLDS[TRUST_LEVELS.AUTONOMOUS])
    return TRUST_LEVELS.AUTONOMOUS;
  if (score >= TRUST_THRESHOLDS[TRUST_LEVELS.EXECUTE_CONFIRM])
    return TRUST_LEVELS.EXECUTE_CONFIRM;
  if (score >= TRUST_THRESHOLDS[TRUST_LEVELS.DRAFT]) return TRUST_LEVELS.DRAFT;
  return TRUST_LEVELS.READ_ONLY;
}

export async function getTrustScore(
  userId: string,
  agentName: AgentName
): Promise<{ score: number; level: TrustLevel; decayedScore: number }> {
  const rows = await db
    .select()
    .from(trustScores)
    .where(
      and(
        eq(trustScores.userId, userId),
        eq(trustScores.agentName, agentName)
      )
    )
    .limit(1);

  if (rows.length === 0) {
    return { score: 0, level: TRUST_LEVELS.READ_ONLY, decayedScore: 0 };
  }

  const row = rows[0];
  const decayedScore = applyDecay(row.score, row.lastActionAt);
  const level = scoreToLevel(decayedScore);

  return { score: row.score, level, decayedScore };
}

export async function getAllTrustScores(
  userId: string
): Promise<
  Record<AgentName, { score: number; level: TrustLevel; decayedScore: number }>
> {
  const agents: AgentName[] = ["comms", "scheduler", "finance", "docs"];
  const result: Record<string, { score: number; level: TrustLevel; decayedScore: number }> = {};

  for (const agent of agents) {
    result[agent] = await getTrustScore(userId, agent);
  }

  return result as Record<
    AgentName,
    { score: number; level: TrustLevel; decayedScore: number }
  >;
}

export async function addTrustPoints(
  userId: string,
  agentName: AgentName,
  points: number,
  action: string
): Promise<{ newScore: number; newLevel: TrustLevel }> {
  const existing = await db
    .select()
    .from(trustScores)
    .where(
      and(
        eq(trustScores.userId, userId),
        eq(trustScores.agentName, agentName)
      )
    )
    .limit(1);

  let newScore: number;

  if (existing.length === 0) {
    newScore = points;
    await db.insert(trustScores).values({
      userId,
      agentName,
      score: newScore,
      level: scoreToLevel(newScore),
      lastActionAt: new Date(),
    });
  } else {
    const decayed = applyDecay(existing[0].score, existing[0].lastActionAt);
    newScore = decayed + points;
    await db
      .update(trustScores)
      .set({
        score: newScore,
        level: scoreToLevel(newScore),
        lastActionAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(trustScores.userId, userId),
          eq(trustScores.agentName, agentName)
        )
      );
  }

  return { newScore, newLevel: scoreToLevel(newScore) };
}

export async function revokeTrust(
  userId: string,
  agentName: AgentName
): Promise<void> {
  await db
    .update(trustScores)
    .set({ score: 0, level: 0, updatedAt: new Date() })
    .where(
      and(
        eq(trustScores.userId, userId),
        eq(trustScores.agentName, agentName)
      )
    );

  await db.insert(auditLogs).values({
    userId,
    agentName,
    action: "trust_revoked",
    actionType: "execute",
    service: "system",
    trustLevel: 0,
    details: { reason: "manual_revoke" },
  });
}

export async function revokeAllTrust(userId: string): Promise<void> {
  const agents: AgentName[] = ["comms", "scheduler", "finance", "docs"];
  for (const agent of agents) {
    await revokeTrust(userId, agent);
  }
}

export function canPerformAction(
  trustLevel: TrustLevel,
  actionType: "read" | "draft" | "execute",
  actionName?: string
): { allowed: boolean; requiresCiba: boolean; reason: string } {
  // Check if CIBA is always required for this action
  if (
    actionName &&
    CIBA_REQUIRED_ACTIONS.includes(actionName as (typeof CIBA_REQUIRED_ACTIONS)[number])
  ) {
    return {
      allowed: trustLevel >= TRUST_LEVELS.DRAFT,
      requiresCiba: true,
      reason: `Action "${actionName}" always requires human approval via CIBA`,
    };
  }

  switch (actionType) {
    case "read":
      return {
        allowed: true,
        requiresCiba: false,
        reason: "Read actions are always allowed",
      };
    case "draft":
      return {
        allowed: trustLevel >= TRUST_LEVELS.DRAFT,
        requiresCiba: false,
        reason:
          trustLevel >= TRUST_LEVELS.DRAFT
            ? "Draft allowed at current trust level"
            : "Insufficient trust level for drafting. Need Level 1 (Draft).",
      };
    case "execute":
      if (trustLevel >= TRUST_LEVELS.AUTONOMOUS) {
        return {
          allowed: true,
          requiresCiba: false,
          reason: "Autonomous execution at trust level 3",
        };
      }
      if (trustLevel >= TRUST_LEVELS.EXECUTE_CONFIRM) {
        return {
          allowed: true,
          requiresCiba: true,
          reason: "Execution requires confirmation at trust level 2",
        };
      }
      return {
        allowed: false,
        requiresCiba: false,
        reason: "Insufficient trust level for execution. Need Level 2+.",
      };
    default:
      return { allowed: false, requiresCiba: false, reason: "Unknown action type" };
  }
}
