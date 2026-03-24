"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Lock, AlertTriangle, Eye, Edit3, Send, CreditCard,
  Calendar, Trash2, FileText, Users, Zap, ChevronRight,
  ToggleLeft, ToggleRight, Info,
} from "lucide-react";
import { TRUST_LEVEL_NAMES, CIBA_REQUIRED_ACTIONS, TRUST_THRESHOLDS, type TrustLevel } from "@/lib/trust/levels";

const LEVEL_COLORS: Record<number, { text: string; bg: string; border: string }> = {
  0: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  1: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  2: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  3: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

interface Policy {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  level: number;
  category: "access" | "action" | "data" | "communication";
  enabled: boolean;
  cibaRequired: boolean;
}

const defaultPolicies: Policy[] = [
  { id: "read_data", name: "Read Data", description: "Read emails, calendar events, files, and messages from connected services", icon: Eye, level: 0, category: "access", enabled: true, cibaRequired: false },
  { id: "draft_content", name: "Draft Content", description: "Create drafts of emails, documents, and messages for human review", icon: Edit3, level: 1, category: "action", enabled: true, cibaRequired: false },
  { id: "send_internal", name: "Send Internal Messages", description: "Send messages to internal team channels (Slack, Discord)", icon: Send, level: 1, category: "communication", enabled: true, cibaRequired: false },
  { id: "send_external", name: "Send External Emails", description: "Send emails to external recipients outside the organization", icon: Send, level: 2, category: "communication", enabled: true, cibaRequired: true },
  { id: "manage_calendar", name: "Manage Calendar", description: "Create, update, and delete calendar events and meeting invitations", icon: Calendar, level: 2, category: "action", enabled: true, cibaRequired: false },
  { id: "financial_ops", name: "Financial Operations", description: "Create invoices, process payments, and manage Stripe transactions", icon: CreditCard, level: 3, category: "action", enabled: true, cibaRequired: true },
  { id: "delete_data", name: "Delete Data", description: "Permanently delete emails, files, calendar events, or other data", icon: Trash2, level: 3, category: "data", enabled: true, cibaRequired: true },
  { id: "share_external", name: "Share Files Externally", description: "Share Google Drive files or documents with external users", icon: FileText, level: 2, category: "data", enabled: true, cibaRequired: true },
  { id: "manage_users", name: "Manage Team Access", description: "Invite or remove users from shared workspaces and channels", icon: Users, level: 3, category: "access", enabled: false, cibaRequired: true },
  { id: "autonomous_exec", name: "Autonomous Execution", description: "Execute multi-step workflows without per-step human confirmation", icon: Zap, level: 3, category: "action", enabled: true, cibaRequired: false },
];

const categoryLabels: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  access: { label: "Access Control", icon: Shield, color: "text-indigo-400" },
  action: { label: "Action Permissions", icon: Zap, color: "text-amber-400" },
  data: { label: "Data Operations", icon: FileText, color: "text-violet-400" },
  communication: { label: "Communication", icon: Send, color: "text-cyan-400" },
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>(defaultPolicies);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const categories = ["access", "action", "data", "communication"] as const;
  const filteredPolicies = selectedLevel !== null
    ? policies.filter((p) => p.level === selectedLevel)
    : policies;

  function togglePolicy(id: string) {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-border/50 px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
        <div className=" flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Policies</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Permission rules and guardrails for your AI workforce</p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8  space-y-6">
        {/* Trust Level Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {([0, 1, 2, 3] as const).map((level) => {
            const colors = LEVEL_COLORS[level];
            const isSelected = selectedLevel === level;
            const policyCount = policies.filter((p) => p.level === level).length;
            return (
              <button
                key={level}
                onClick={() => setSelectedLevel(isSelected ? null : level)}
                className={`relative group rounded-2xl border p-4 text-left transition-all duration-300 ${
                  isSelected
                    ? `${colors.border} ${colors.bg} shadow-lg`
                    : "border-border/50 bg-card/50 hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${colors.bg} ${colors.text} ${colors.border} border`}>
                    L{level}
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{policyCount} rules</span>
                </div>
                <p className={`text-[13px] font-semibold ${isSelected ? colors.text : "text-foreground"}`}>
                  {TRUST_LEVEL_NAMES[level as TrustLevel]}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {level === 0 ? "Read-only access" : level === 1 ? "Draft & internal" : level === 2 ? "Execute with confirmation" : "Full autonomous"}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1 tabular-nums">
                  ≥ {TRUST_THRESHOLDS[level as TrustLevel]} points
                </p>
              </button>
            );
          })}
        </div>

        {/* CIBA Required Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-5"
        >
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Lock className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-foreground mb-1">Always Requires Human Approval (CIBA)</h3>
              <p className="text-[11px] text-muted-foreground mb-3">These actions always trigger a push notification for approval, regardless of trust level.</p>
              <div className="flex flex-wrap gap-2">
                {CIBA_REQUIRED_ACTIONS.map((action) => (
                  <span key={action} className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Policy Categories */}
        {categories.map((cat) => {
          const catPolicies = filteredPolicies.filter((p) => p.category === cat);
          if (catPolicies.length === 0) return null;
          const catInfo = categoryLabels[cat];
          const CatIcon = catInfo.icon;
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-border/30 flex items-center gap-3">
                <CatIcon className={`h-4 w-4 ${catInfo.color}`} />
                <h3 className="text-[13px] font-semibold text-foreground">{catInfo.label}</h3>
                <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">{catPolicies.length} policies</span>
              </div>
              <div className="divide-y divide-border/20">
                {catPolicies.map((policy) => {
                  const colors = LEVEL_COLORS[policy.level];
                  const Icon = policy.icon;
                  return (
                    <div
                      key={policy.id}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors"
                    >
                      <div className={`h-9 w-9 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
                        <Icon className={`h-4 w-4 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px] font-medium text-foreground">{policy.name}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${colors.bg} ${colors.text} ${colors.border} border`}>
                            L{policy.level}+
                          </span>
                          {policy.cibaRequired && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-0.5">
                              <Lock className="h-2.5 w-2.5" /> CIBA
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{policy.description}</p>
                      </div>
                      <button
                        onClick={() => togglePolicy(policy.id)}
                        className="shrink-0 transition-colors"
                      >
                        {policy.enabled ? (
                          <ToggleRight className="h-7 w-7 text-primary" />
                        ) : (
                          <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        {/* Info Card */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex items-start gap-3">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="text-[12px] text-muted-foreground leading-relaxed">
            <p className="mb-1"><strong className="text-foreground">How Policies Work:</strong></p>
            <p>Each policy defines a minimum trust level required to perform an action. Employees below the required level will be blocked.
            Actions marked with <span className="font-semibold text-amber-400">CIBA</span> always require explicit human approval via push notification,
            even if the employee has reached the required trust level. Trust levels are earned through successful task completion — never manually assigned.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
