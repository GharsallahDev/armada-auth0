import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const trustScores = pgTable("trust_scores", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  agentName: text("agent_name").notNull(),
  score: integer("score").notNull().default(0),
  level: integer("level").notNull().default(0),
  lastActionAt: timestamp("last_action_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  agentName: text("agent_name").notNull(),
  action: text("action").notNull(),
  actionType: text("action_type").notNull(), // read | draft | execute
  service: text("service").notNull(), // gmail | calendar | stripe | slack | drive
  trustLevel: integer("trust_level").notNull(),
  details: jsonb("details"),
  tokenUsed: boolean("token_used").default(false),
  cibaRequired: boolean("ciba_required").default(false),
  cibaApproved: boolean("ciba_approved"),
  success: boolean("success").default(true),
  durationMs: integer("duration_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cibaRequests = pgTable("ciba_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  agentName: text("agent_name").notNull(),
  action: text("action").notNull(),
  details: text("details"),
  service: text("service").notNull(),
  status: text("status").notNull().default("pending"), // pending | approved | denied | expired
  expiresAt: timestamp("expires_at").notNull(),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deviceTokens = pgTable("device_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  token: text("token").notNull(),
  platform: text("platform").notNull().default("android"), // android | ios | web
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const connectedServices = pgTable("connected_services", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  provider: text("provider").notNull(), // google | slack
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  scopes: text("scopes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const agentActions = pgTable("agent_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  agentName: text("agent_name").notNull(),
  actionType: text("action_type").notNull(),
  service: text("service").notNull(),
  inputSummary: text("input_summary"),
  outputSummary: text("output_summary"),
  success: boolean("success").default(true),
  durationMs: integer("duration_ms"),
  trustPointsEarned: integer("trust_points_earned").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
