"use client";

import { motion } from "framer-motion";
import {
  UserPlus,
  Shield,
  Smartphone,
  TrendingUp,
  Zap,
  Lock,
} from "lucide-react";
import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";
import { DisplayCards } from "@/components/ui/display-cards";

const features: BentoItem[] = [
  {
    title: "Hire in Seconds",
    meta: "3-step wizard",
    description:
      "Create AI employees from predefined roles — engineer, analyst, designer, support. Assign tools, set permissions, deploy instantly.",
    icon: <UserPlus className="w-4 h-4 text-indigo-500" />,
    status: "Core",
    tags: ["Onboarding", "Templates"],
    colSpan: 2,
  },
  {
    title: "Progressive Trust",
    meta: "4 levels",
    description:
      "Employees start at L0 Probation. They earn promotions through successful tasks — never granted, always earned.",
    icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,
    status: "L0 → L3",
    tags: ["Trust", "Governance"],
  },
  {
    title: "Token Vault",
    meta: "34+ services",
    description:
      "Connect employees to Gmail, Slack, GitHub, Stripe, Calendar and more via Auth0 Token Vault. Secure OAuth delegation.",
    icon: <Lock className="w-4 h-4 text-violet-500" />,
    tags: ["Auth0", "OAuth"],
    colSpan: 2,
  },
  {
    title: "CIBA Approval",
    meta: "Real-time",
    description:
      "Sensitive actions trigger push notifications to your phone. Approve or deny from anywhere — your agents wait for you.",
    icon: <Smartphone className="w-4 h-4 text-amber-500" />,
    status: "Secure",
    tags: ["Mobile", "Auth0"],
  },
  {
    title: "Live Monitoring",
    meta: "Real-time",
    description:
      "Watch every action in real-time. Full audit trail, performance metrics, and trust score tracking across your workforce.",
    icon: <Shield className="w-4 h-4 text-sky-500" />,
    status: "Live",
    tags: ["Audit", "Dashboard"],
  },
  {
    title: "Instant Termination",
    meta: "One tap",
    description:
      "Revoke all access and terminate any employee instantly. All tokens invalidated, all sessions killed. You're always in control.",
    icon: <Zap className="w-4 h-4 text-rose-500" />,
    status: "Critical",
    tags: ["Security", "Control"],
    colSpan: 2,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <p className="text-[13px] font-medium text-primary/60 uppercase tracking-[0.15em] mb-4">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
              Everything you need to manage
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-500">
              an AI workforce
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From hiring to termination — full lifecycle management for your AI employees.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <BentoGrid items={features} />
          </motion.div>

          <div className="hidden lg:block w-[340px] shrink-0">
            <DisplayCards />
          </div>
        </div>
      </div>
    </section>
  );
}
