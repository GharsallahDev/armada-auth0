"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Nav() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2.5">
            <img
              src="/logo-192.png"
              alt="Armada"
              className="h-6 w-6 rounded-md"
            />
            <span className="text-[15px] font-medium tracking-[-0.02em] text-foreground">
              Armada
            </span>
          </a>
          <div className="hidden sm:flex items-center gap-1 ml-2">
            <Button variant="ghost" size="sm" render={<a href="#how-it-works" />}>
              How it Works
            </Button>
            <Button variant="ghost" size="sm" render={<a href="#trust-levels" />}>
              Trust Levels
            </Button>
            <Button variant="ghost" size="sm" render={<a href="#integrations" />}>
              Integrations
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" render={<a href="/auth/login" />} className="hidden sm:inline-flex">
            Sign in
          </Button>
          <Button render={<a href="/auth/login?screen_hint=signup" />}>
            Start Hiring
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
