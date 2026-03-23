"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(var(--primary) / 0.06) 0%, transparent 60%)",
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
              "linear-gradient(to bottom, hsl(var(--foreground)), hsl(var(--muted-foreground)))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Ready to hire your first
          <br />
          AI employee?
        </h2>
        <p className="text-[15px] text-muted-foreground mb-8 tracking-[-0.01em]">
          Deploy agents that respect boundaries, earn trust, and keep you in
          control.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button size="lg" render={<a href="/auth/login?screen_hint=signup" />} className="gap-2 h-10 px-5 text-[14px] font-medium">
            Start Hiring
            <ArrowRight className="h-3.5 w-3.5 group-hover/button:translate-x-0.5 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" render={<a href="/auth/login" />} className="h-10 px-5 text-[14px] font-medium">
            Sign in
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
