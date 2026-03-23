import { db } from "./client";
import { agents, trustScores, auditLogs, agentActions } from "./schema";
import { eq, and } from "drizzle-orm";

const DEMO_USER_ID = process.env.DEMO_USER_ID || "auth0|demo";

async function seed() {
  console.log("Seeding demo data...");

  // Clean existing demo agents
  await db.delete(agents).where(eq(agents.userId, DEMO_USER_ID));

  // Create Alex — Sales Development (Senior level)
  const [alex] = await db.insert(agents).values({
    userId: DEMO_USER_ID,
    name: "Alex",
    slug: "alex",
    avatarGradient: "from-indigo-500 to-violet-500",
    role: "Sales Development",
    instructions: "You are Alex, a Sales Development AI employee. Your job is to help with sales operations: managing customer emails, tracking invoices and payments, and scheduling meetings with prospects. Be proactive about following up with leads and maintaining customer relationships. Always check calendar availability before suggesting meeting times.",
    services: ["gmail", "stripe", "calendar"],
    trustPolicy: {},
    status: "active",
  }).returning();

  // Set Alex's trust to Senior level (350 points)
  await db.insert(trustScores).values({
    userId: DEMO_USER_ID,
    agentName: "alex",
    score: 350,
    level: 2,
    lastActionAt: new Date(),
  }).onConflictDoNothing();

  // Create some audit logs for Alex
  const alexActions = [
    { action: "gmail_list_emails", actionType: "read", service: "gmail", trustLevel: 2 },
    { action: "gmail_read_email", actionType: "read", service: "gmail", trustLevel: 2 },
    { action: "stripe_list_payments", actionType: "read", service: "stripe", trustLevel: 2 },
    { action: "calendar_list_events", actionType: "read", service: "calendar", trustLevel: 2 },
    { action: "gmail_draft_email", actionType: "draft", service: "gmail", trustLevel: 2 },
    { action: "stripe_list_customers", actionType: "read", service: "stripe", trustLevel: 2 },
    { action: "calendar_check_availability", actionType: "read", service: "calendar", trustLevel: 2 },
  ];

  for (let i = 0; i < alexActions.length; i++) {
    const action = alexActions[i];
    const createdAt = new Date(Date.now() - (alexActions.length - i) * 3600000); // 1 hour apart
    await db.insert(auditLogs).values({
      userId: DEMO_USER_ID,
      agentName: "alex",
      action: action.action,
      actionType: action.actionType,
      service: action.service,
      trustLevel: action.trustLevel,
      success: true,
      durationMs: Math.floor(Math.random() * 2000) + 500,
      createdAt,
    });
    await db.insert(agentActions).values({
      userId: DEMO_USER_ID,
      agentName: "alex",
      actionType: action.actionType,
      service: action.service,
      success: true,
      durationMs: Math.floor(Math.random() * 2000) + 500,
      trustPointsEarned: action.actionType === "read" ? 5 : action.actionType === "draft" ? 15 : 25,
      createdAt,
    });
  }

  console.log(`Created agent: Alex (Sales Development) — Senior level, ${alexActions.length} audit logs`);

  // Create Jordan — Community Manager (Junior level)
  const [jordan] = await db.insert(agents).values({
    userId: DEMO_USER_ID,
    name: "Jordan",
    slug: "jordan",
    avatarGradient: "from-cyan-500 to-blue-500",
    role: "Community Manager",
    instructions: "You are Jordan, a Community Manager AI employee. Your job is to monitor and engage with the community across Slack and Discord. Read messages, summarize important discussions, and respond to community questions. Keep the team informed about community sentiment and trending topics.",
    services: ["slack", "discord"],
    trustPolicy: {},
    status: "active",
  }).returning();

  // Set Jordan's trust to Junior level (120 points)
  await db.insert(trustScores).values({
    userId: DEMO_USER_ID,
    agentName: "jordan",
    score: 120,
    level: 1,
    lastActionAt: new Date(),
  }).onConflictDoNothing();

  console.log("Created agent: Jordan (Community Manager) — Junior level");

  // Create Atlas — Research Analyst (Probationary)
  await db.insert(agents).values({
    userId: DEMO_USER_ID,
    name: "Atlas",
    slug: "atlas",
    avatarGradient: "from-emerald-500 to-green-500",
    role: "Research Analyst",
    instructions: "You are Atlas, a Research Analyst AI employee. Your job is to help with research by reading and analyzing documents in Google Drive, searching for relevant files, and summarizing findings via email. You're new, so focus on demonstrating your value through thorough, accurate work.",
    services: ["drive", "gmail"],
    trustPolicy: {},
    status: "active",
  });

  await db.insert(trustScores).values({
    userId: DEMO_USER_ID,
    agentName: "atlas",
    score: 25,
    level: 0,
    lastActionAt: new Date(),
  }).onConflictDoNothing();

  console.log("Created agent: Atlas (Research Analyst) — Probationary level");
  console.log("\nDemo seed complete! 3 agents created.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
