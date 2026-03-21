"use client";

import { motion } from "framer-motion";
import { Shield, Mail, CreditCard, Calendar, FileText } from "lucide-react";

const agents = [
  {
    name: "Communications",
    icon: Mail,
    color: "#60a5fa",
    trust: "L2",
    status: "Active",
    actions: "1,247",
    service: "Gmail + Slack",
  },
  {
    name: "Scheduler",
    icon: Calendar,
    color: "#c084fc",
    trust: "L3",
    status: "Autonomous",
    actions: "892",
    service: "Calendar",
  },
  {
    name: "Finance",
    icon: CreditCard,
    color: "#34d399",
    trust: "L1",
    status: "Draft Only",
    actions: "341",
    service: "Stripe",
  },
  {
    name: "Documents",
    icon: FileText,
    color: "#fb923c",
    trust: "L2",
    status: "Confirmed",
    actions: "576",
    service: "Drive",
  },
];

function AgentDisplayCard({
  agent,
  index,
}: {
  agent: (typeof agents)[0];
  index: number;
}) {
  const Icon = agent.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="relative rounded-xl p-5 backdrop-blur-sm cursor-default select-none transition-colors duration-300"
      style={{
        backgroundColor: `${agent.color}08`,
        border: `1px solid ${agent.color}18`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${agent.color}15` }}
          >
            <Icon className="h-4 w-4" style={{ color: agent.color }} />
          </div>
          <div>
            <p className="text-[14px] font-medium text-white tracking-[-0.01em]">
              {agent.name}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: `${agent.color}99` }}>
              {agent.service}
            </p>
          </div>
        </div>
        <span
          className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md"
          style={{
            color: agent.color,
            backgroundColor: `${agent.color}15`,
          }}
        >
          {agent.trust}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping"
              style={{ backgroundColor: agent.color }}
            />
            <span
              className="relative inline-flex rounded-full h-1.5 w-1.5"
              style={{ backgroundColor: agent.color }}
            />
          </span>
          <span className="text-[12px] text-[#9ca3af]">{agent.status}</span>
        </div>
        <span className="text-[12px] text-[#6b7280]">
          {agent.actions} ops
        </span>
      </div>
    </motion.div>
  );
}

export function Terminal() {
  return (
    <div className="w-full max-w-4xl mx-auto relative">
      {/* Central glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.06) 0%, transparent 60%)",
        }}
      />

      {/* Section label */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-indigo-400" />
          <p className="text-[13px] font-medium text-indigo-300/60 uppercase tracking-[0.1em]">
            Your Agent Fleet
          </p>
        </div>
        <p className="text-[14px] text-[#6b7280] tracking-[-0.01em]">
          Four specialized agents, each earning trust independently
        </p>
      </motion.div>

      {/* Agent grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {agents.map((agent, i) => (
          <AgentDisplayCard key={agent.name} agent={agent} index={i} />
        ))}
      </div>

      {/* Orchestrator bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-3 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.03] backdrop-blur-sm p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-white tracking-[-0.01em]">
                Orchestrator
              </p>
              <p className="text-[11px] text-indigo-400/50">
                Routes tasks to the right agent based on intent and trust
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            {agents.map((a) => (
              <div key={a.name} className="flex items-center gap-1.5">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: a.color }}
                />
                <span className="text-[11px] text-[#6b7280]">{a.name.slice(0, 4)}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
