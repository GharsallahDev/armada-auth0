"use client";

import { motion } from "framer-motion";

export function Nav() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2.5">
            <img
              src="/logo-192.png"
              alt="Armada"
              className="h-8 w-8 rounded-lg"
            />
            <span className="text-[16px] font-bold tracking-[-0.03em] text-foreground">
              Armada
            </span>
          </a>
          <div className="hidden sm:flex items-center gap-1 ml-2">
            <a href="#how-it-works" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-muted/50">
              Features
            </a>
            <a href="#trust-levels" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-muted/50">
              Trust Levels
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/auth/login" className="hidden sm:inline-flex text-[13px] text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-muted/50">
            Sign in
          </a>
          <a
            href="/auth/login?screen_hint=signup"
            className="group relative inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-semibold text-foreground bg-gradient-to-b from-white/80 to-white/50 dark:from-white/15 dark:to-white/5 border border-white/60 dark:border-white/15 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.15),inset_0_1px_0_rgba(255,255,255,0.4)] hover:-translate-y-px transition-all duration-200"
          >
            Start Hiring
            <span className="text-[11px] opacity-50 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all duration-200">→</span>
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
