"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
          <Button size="sm" asChild className="rounded-lg font-semibold">
            <a href="/auth/login?screen_hint=signup">Start Hiring</a>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
