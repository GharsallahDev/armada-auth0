export interface AgentToolCall {
  agent: string;
  actionType: "read" | "draft" | "execute";
  actionName: string;
  service: string;
  description: string;
  requiresCiba: boolean;
}

export interface AgentResult {
  success: boolean;
  output: string;
  trustPointsEarned: number;
  error?: string;
}

export interface AgentContext {
  userId: string;
  trustLevel: number;
  connectedServices: string[];
}

export interface CibaRequest {
  id: string;
  agentName: string;
  action: string;
  details: string;
  status: "pending" | "approved" | "denied" | "expired";
  createdAt: Date;
}
