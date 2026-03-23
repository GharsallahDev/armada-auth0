"use client";

import { motion } from "framer-motion";
import { UserPlus, TrendingUp, Smartphone } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    color: "#f87171",
    title: "Hire",
    description:
      "Create an AI employee. Name it, define its role, assign services.",
  },
  {
    number: "02",
    icon: TrendingUp,
    color: "#a78bfa",
    title: "Trust",
    description:
      "Your employee starts at Probation. It earns promotions through successful work.",
  },
  {
    number: "03",
    icon: Smartphone,
    color: "#34d399",
    title: "Control",
    description:
      "Approve sensitive actions from your phone. Terminate anytime.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[13px] font-medium text-primary/50 uppercase tracking-[0.1em] mb-3"
        >
          How it works
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium tracking-[-0.03em] mb-16 leading-tight"
          style={{
            background: "linear-gradient(to bottom, hsl(var(--foreground)), hsl(var(--muted-foreground)))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Progressive trust,
          <br />
          not blind faith.
        </motion.h2>

        <div className="relative">
          {/* Connecting line with color gradient */}
          <div
            className="absolute left-[15px] top-2 bottom-2 w-px"
            style={{
              background:
                "linear-gradient(to bottom, #f8717130, #a78bfa30, #34d39930, transparent)",
            }}
          />

          <div className="space-y-14">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="relative pl-12"
                >
                  {/* Icon on the line */}
                  <div
                    className="absolute left-0 top-0.5 w-[31px] h-[31px] rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${step.color}12`,
                      border: `1px solid ${step.color}25`,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: step.color }} />
                  </div>

                  <p
                    className="text-[11px] font-mono font-medium tracking-wider mb-2"
                    style={{ color: `${step.color}80` }}
                  >
                    {step.number}
                  </p>
                  <h3 className="text-[17px] font-medium text-foreground tracking-[-0.02em] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-muted-foreground tracking-[-0.01em]">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
