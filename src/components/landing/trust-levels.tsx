"use client";

import { motion } from "framer-motion";

const levels = [
  {
    level: "L0",
    name: "Read Only",
    description: "Observe and report. No write access to any service.",
    color: "#6b7280",
    barWidth: "25%",
    points: "0 pts",
  },
  {
    level: "L1",
    name: "Draft",
    description: "Create drafts in Gmail, Calendar, Docs. Nothing is sent.",
    color: "#60a5fa",
    barWidth: "50%",
    points: "100 pts",
  },
  {
    level: "L2",
    name: "Execute w/ Confirm",
    description: "Send emails, create events, invoice -- with CIBA approval.",
    color: "#a78bfa",
    barWidth: "75%",
    points: "300 pts",
  },
  {
    level: "L3",
    name: "Autonomous",
    description: "Full execution within policy bounds. Earned, never granted.",
    color: "#34d399",
    barWidth: "100%",
    points: "750 pts",
  },
];

export function TrustLevels() {
  return (
    <section id="trust-levels" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[13px] font-medium text-indigo-400/50 uppercase tracking-[0.1em] mb-3"
        >
          Trust levels
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium tracking-[-0.03em] mb-16 leading-tight"
          style={{
            background: "linear-gradient(to bottom, #ffffff, #c7d2fe)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Four levels of earned access.
        </motion.h2>

        <div className="space-y-4">
          {levels.map((level, i) => (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="group relative rounded-xl p-5 transition-colors duration-300"
              style={{
                backgroundColor: `${level.color}06`,
                border: `1px solid ${level.color}12`,
              }}
            >
              <div className="flex items-start gap-5">
                {/* Level indicator */}
                <div className="shrink-0">
                  <span
                    className="text-[20px] font-mono font-bold"
                    style={{ color: `${level.color}90` }}
                  >
                    {level.level}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3 mb-1.5">
                    <h3 className="text-[15px] font-medium text-white tracking-[-0.01em]">
                      {level.name}
                    </h3>
                    <span
                      className="text-[11px] font-mono shrink-0"
                      style={{ color: `${level.color}70` }}
                    >
                      {level.points}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#6b7280] mb-3 tracking-[-0.01em]">
                    {level.description}
                  </p>

                  {/* Progress bar */}
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ backgroundColor: `${level.color}10` }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: level.barWidth }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.3 + i * 0.1,
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: level.color, opacity: 0.6 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Decay note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-[13px] text-[#4b5563] tracking-[-0.01em] inline-flex items-center gap-2">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#4b5563]/30" />
            Trust decays with a 7-day half-life
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#4b5563]/30" />
          </p>
        </motion.div>
      </div>
    </section>
  );
}
