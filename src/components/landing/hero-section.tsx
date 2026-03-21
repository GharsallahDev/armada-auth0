"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-16 px-6 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.03) 40%, transparent 70%)",
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.06] backdrop-blur-sm px-4 py-1.5 mb-8"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400" />
          </span>
          <span className="text-[13px] text-indigo-300/80 tracking-[-0.01em]">
            Built on Auth0 for AI Agents
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[1.08] tracking-[-0.04em] mb-6"
          style={{
            background:
              "linear-gradient(to bottom, #ffffff, #e0e7ff, rgba(165, 180, 252, 0.7))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          AI agents that earn
          <br />
          your trust, not
          <br />
          demand it.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-[17px] leading-relaxed text-[#8b8fa3] max-w-xl mx-auto mb-10 tracking-[-0.01em]"
        >
          Armada orchestrates a fleet of AI agents across your business tools.
          Every agent starts at zero access and progressively earns permissions
          through successful operations.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center justify-center gap-3"
        >
          <a
            href="/auth/login?screen_hint=signup"
            className="group relative inline-flex items-center justify-center h-10 px-5 rounded-lg text-[14px] font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303]"
          >
            Get started
            <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href="/auth/login"
            className="inline-flex items-center justify-center h-10 px-5 rounded-lg text-[14px] font-medium text-[#c7d2fe] border border-indigo-500/20 hover:bg-indigo-500/[0.06] active:scale-[0.97] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303]"
          >
            Sign in
          </a>
        </motion.div>
      </div>
    </section>
  );
}
