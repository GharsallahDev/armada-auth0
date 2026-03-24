"use client";

import { motion } from "framer-motion";
import { useMotionValue, useMotionTemplate } from "framer-motion";
import { useState, useEffect } from "react";
import { Shield, Eye, FileEdit, CheckCircle, Crown } from "lucide-react";

const levels = [
  {
    level: "L0",
    name: "Probationary",
    description: "Read-only. Observe and report. Zero write access.",
    icon: Eye,
    color: "from-gray-500 to-slate-600",
    iconColor: "#6b7280",
    glowColor: "rgba(107,114,128,0.15)",
    points: "0 pts",
    capabilities: ["Read data", "Generate reports", "Monitor feeds"],
  },
  {
    level: "L1",
    name: "Junior",
    description: "Can draft and create. Nothing sent without review.",
    icon: FileEdit,
    color: "from-blue-500 to-cyan-500",
    iconColor: "#3b82f6",
    glowColor: "rgba(59,130,246,0.15)",
    points: "100 pts",
    capabilities: ["Draft emails", "Create docs", "Stage events"],
  },
  {
    level: "L2",
    name: "Senior",
    description: "Execute with CIBA approval. You confirm from your phone.",
    icon: CheckCircle,
    color: "from-violet-500 to-purple-500",
    iconColor: "#8b5cf6",
    glowColor: "rgba(139,92,246,0.15)",
    points: "300 pts",
    capabilities: ["Send emails", "Create events", "Process invoices"],
  },
  {
    level: "L3",
    name: "Executive",
    description: "Full autonomous access. Earned, never granted.",
    icon: Crown,
    color: "from-emerald-500 to-green-500",
    iconColor: "#34d399",
    glowColor: "rgba(52,211,153,0.15)",
    points: "750 pts",
    capabilities: ["Autonomous ops", "Policy-bound", "Full access"],
  },
];

function TrustCard({
  level,
  index,
}: {
  level: (typeof levels)[0];
  index: number;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [randomString, setRandomString] = useState("");

  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*";
    let str = "";
    for (let i = 0; i < 800; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRandomString(str);
  }, []);

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*";
    let str = "";
    for (let i = 0; i < 800; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRandomString(str);
  }

  const maskImage = useMotionTemplate`radial-gradient(200px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const Icon = level.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onMouseMove={onMouseMove}
      className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-border hover:shadow-lg"
      style={{ boxShadow: `0 0 40px ${level.glowColor}` }}
    >
      {/* Evervault-style encrypted background on hover */}
      <div className="pointer-events-none">
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
          style={{
            maskImage,
            WebkitMaskImage: maskImage,
            background: `linear-gradient(135deg, ${level.glowColor}, transparent)`,
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500"
          style={{ maskImage, WebkitMaskImage: maskImage }}
        >
          <p className="absolute inset-0 text-[10px] break-words whitespace-pre-wrap text-foreground font-mono leading-tight p-4">
            {randomString}
          </p>
        </motion.div>
      </div>

      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className="h-11 w-11 rounded-xl backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${level.glowColor}, ${level.glowColor.replace('0.15', '0.05')})`,
              boxShadow: `0 4px 16px ${level.glowColor}, inset 0 1px 1px rgba(255,255,255,0.15)`,
            }}
          >
            <Icon className="h-5 w-5" style={{ color: level.iconColor }} strokeWidth={1.5} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              {level.points}
            </span>
            <span className={`text-sm font-bold font-mono bg-gradient-to-r ${level.color} bg-clip-text text-transparent`}>
              {level.level}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-1.5">
          {level.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {level.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {level.capabilities.map((cap) => (
            <span
              key={cap}
              className="text-[11px] px-2.5 py-1 rounded-full bg-muted/80 text-muted-foreground border border-border/50"
            >
              {cap}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function TrustLevels() {
  return (
    <section id="trust-levels" className="py-24 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium text-primary/60 uppercase tracking-[0.15em] mb-4">
            Progressive Trust
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
              Trust is earned,
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-500">
              never granted
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Four levels of progressive autonomy. Each level unlocked through proven performance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {levels.map((level, i) => (
            <TrustCard key={level.level} level={level} index={i} />
          ))}
        </div>

        {/* Trust decay note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-border/50 bg-muted/30 backdrop-blur-sm">
            <Shield className="h-3.5 w-3.5 text-primary/60" />
            <span className="text-[13px] text-muted-foreground">
              Trust decays with a 7-day half-life — agents must continuously perform
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
