"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.06) 0%, transparent 60%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center relative z-10"
      >
        <h2
          className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium tracking-[-0.03em] mb-4 leading-tight"
          style={{
            background:
              "linear-gradient(to bottom, #ffffff, #c7d2fe, rgba(165, 180, 252, 0.6))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Ready to command
          <br />
          your AI fleet?
        </h2>
        <p className="text-[15px] text-[#7a7e91] mb-8 tracking-[-0.01em]">
          Deploy agents that respect boundaries, earn trust, and keep you in
          control.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a
            href="/auth/login?screen_hint=signup"
            className="group inline-flex items-center justify-center h-10 px-5 rounded-lg text-[14px] font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303]"
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
        </div>
      </motion.div>
    </section>
  );
}
