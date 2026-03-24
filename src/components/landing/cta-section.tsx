"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RetroGrid } from "@/components/ui/retro-grid";

export function CtaSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* RetroGrid background */}
      <RetroGrid angle={65} className="opacity-30 dark:opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center relative z-10"
      >
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
            Ready to hire your
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-500">
            first AI employee?
          </span>
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
          Deploy agents that respect boundaries, earn trust, and keep you in
          control — powered by Auth0.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="inline-block group relative bg-gradient-to-b from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
            <Button
              variant="ghost"
              asChild
              className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md bg-background/95 hover:bg-background/100 text-foreground transition-all duration-300 group-hover:-translate-y-0.5 border border-primary/10"
            >
              <a href="/auth/login?screen_hint=signup">
                <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                  Start Hiring
                </span>
                <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </a>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="lg"
            asChild
            className="text-muted-foreground hover:text-foreground text-base"
          >
            <a href="/auth/login">Sign in</a>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
