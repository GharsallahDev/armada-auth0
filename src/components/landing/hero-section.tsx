"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.07] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex"
        >
          <Badge variant="outline" className="gap-2 px-4 py-1.5 text-[12px] font-medium mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            AI Workforce Management
          </Badge>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
        >
          <span className="text-foreground">Hire AI Employees.</span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Give them tools.
          </span>
          <br />
          <span className="text-foreground">Watch them earn your trust.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Create AI agents as employees. Connect them to your services.
          Govern them with Progressive Trust. Terminate them with one tap.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center gap-4"
        >
          <Button size="lg" render={<a href="/auth/login" />} className="gap-2 h-12 px-7 text-[14px] font-semibold">
            Start Hiring
            <ArrowRight className="h-4 w-4 group-hover/button:translate-x-0.5 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" render={<a href="#how-it-works" />} className="gap-2 h-12 px-7 text-[14px] font-medium">
            How it Works
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
