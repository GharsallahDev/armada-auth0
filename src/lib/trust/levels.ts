export const TRUST_LEVELS = {
  READ_ONLY: 0,
  DRAFT: 1,
  EXECUTE_CONFIRM: 2,
  AUTONOMOUS: 3,
} as const;

export const TRUST_THRESHOLDS = {
  [TRUST_LEVELS.READ_ONLY]: 0,
  [TRUST_LEVELS.DRAFT]: 100,
  [TRUST_LEVELS.EXECUTE_CONFIRM]: 300,
  [TRUST_LEVELS.AUTONOMOUS]: 750,
} as const;

export const TRUST_POINTS = {
  READ_SUCCESS: 5,
  DRAFT_APPROVED: 15,
  EXECUTION_SUCCESS: 25,
  CIBA_APPROVED: 30,
} as const;

// Trust decays with a 7-day half-life
export const TRUST_DECAY_HALF_LIFE_DAYS = 7;

export type TrustLevel = (typeof TRUST_LEVELS)[keyof typeof TRUST_LEVELS];

export const TRUST_LEVEL_NAMES: Record<TrustLevel, string> = {
  [TRUST_LEVELS.READ_ONLY]: "Read Only",
  [TRUST_LEVELS.DRAFT]: "Draft & Suggest",
  [TRUST_LEVELS.EXECUTE_CONFIRM]: "Execute with Confirmation",
  [TRUST_LEVELS.AUTONOMOUS]: "Autonomous (Low-Risk)",
};

export const TRUST_LEVEL_COLORS: Record<TrustLevel, string> = {
  [TRUST_LEVELS.READ_ONLY]: "#ef4444",
  [TRUST_LEVELS.DRAFT]: "#f97316",
  [TRUST_LEVELS.EXECUTE_CONFIRM]: "#eab308",
  [TRUST_LEVELS.AUTONOMOUS]: "#22c55e",
};

// Actions that ALWAYS require CIBA regardless of trust level
export const CIBA_REQUIRED_ACTIONS = [
  "send_email_external",
  "create_invoice",
  "send_invoice",
  "schedule_external_meeting",
  "share_document_external",
  "financial_transaction",
] as const;

export type AgentName =
  | "orchestrator"
  | "comms"
  | "scheduler"
  | "finance"
  | "docs";

export const AGENT_SERVICES: Record<AgentName, string[]> = {
  orchestrator: [],
  comms: ["gmail", "slack"],
  scheduler: ["calendar"],
  finance: ["stripe"],
  docs: ["drive"],
};

export const AGENT_DISPLAY: Record<
  AgentName,
  { label: string; icon: string; description: string; color: string }
> = {
  orchestrator: {
    label: "Orchestrator",
    icon: "Brain",
    description: "Routes tasks and coordinates agents",
    color: "#818cf8",
  },
  comms: {
    label: "Comms Agent",
    icon: "MessageSquare",
    description: "Gmail & Slack communications",
    color: "#60a5fa",
  },
  scheduler: {
    label: "Scheduler Agent",
    icon: "Calendar",
    description: "Google Calendar management",
    color: "#a78bfa",
  },
  finance: {
    label: "Finance Agent",
    icon: "DollarSign",
    description: "Stripe invoicing & payments",
    color: "#34d399",
  },
  docs: {
    label: "Docs Agent",
    icon: "FileText",
    description: "Google Drive documents",
    color: "#fb923c",
  },
};
