"use client";

import { motion } from "framer-motion";

export function Nav() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#030303]/80 backdrop-blur-md border-b border-white/[0.06]"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2.5">
            <img
              src="/logo-192.png"
              alt="Armada"
              className="h-6 w-6 rounded-md"
            />
            <span className="text-[15px] font-medium tracking-[-0.02em] text-white">
              Armada
            </span>
          </a>
          <div className="hidden sm:flex items-center gap-5 ml-2">
            <a
              href="#how-it-works"
              className="text-[13px] text-[#6b7280] hover:text-indigo-300 transition-colors"
            >
              How it Works
            </a>
            <a
              href="#trust-levels"
              className="text-[13px] text-[#6b7280] hover:text-indigo-300 transition-colors"
            >
              Trust Levels
            </a>
            <a
              href="#integrations"
              className="text-[13px] text-[#6b7280] hover:text-indigo-300 transition-colors"
            >
              Integrations
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/auth/login"
            className="text-[13px] text-[#9ca3af] hover:text-white transition-colors hidden sm:block"
          >
            Sign in
          </a>
          <a
            href="/auth/login?screen_hint=signup"
            className="inline-flex items-center justify-center h-8 px-3.5 rounded-lg text-[13px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[0.97] transition-all shadow-sm shadow-indigo-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            Start Hiring
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
