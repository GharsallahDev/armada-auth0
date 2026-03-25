"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlipWords } from "@/components/ui/flip-words";
import { SplineScene } from "@/components/landing/spline-scene";

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-indigo-950/40 dark:text-indigo-200/20"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Animated SVG paths background */}
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-0">
          {/* Left side — text content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="flex-1 text-center lg:text-left max-w-2xl"
          >
            {/* Premium pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/[0.08] to-violet-500/[0.08] backdrop-blur-md mb-8 shadow-sm shadow-primary/5"
            >
              <div className="relative flex h-5 w-5 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="relative h-5 w-5 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
                  <Zap className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              <span className="text-[13px] font-semibold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                The Future of AI Workforce
              </span>
              <div className="h-4 w-px bg-primary/20" />
              <span className="text-[11px] font-medium text-muted-foreground">
                Trusted by teams worldwide
              </span>
            </motion.div>

            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-5 tracking-tighter">
              <motion.span
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 25, delay: 0.1 }}
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/80"
              >
                Hire an AI
              </motion.span>
              <br />
              <FlipWords
                words={["Engineer", "Analyst", "Designer", "Marketer", "Support Rep"]}
                duration={2500}
                className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-500"
              />
            </h1>

            {/* Subtitle — more impactful */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed"
            >
              Deploy AI employees that connect to your services, earn trust through
              performance, and operate under your control — <span className="text-foreground font-medium">always.</span>
            </motion.p>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex items-center gap-5 mb-10 justify-center lg:justify-start"
            >
              {[
                { icon: Shield, text: "Progressive Trust" },
                { icon: Bot, text: "34+ Integrations" },
                { icon: Zap, text: "Real-time CIBA" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-1.5 text-muted-foreground/70">
                  <item.icon className="h-3.5 w-3.5 text-primary/60" />
                  <span className="text-[12px] font-medium">{item.text}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
            >
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
                <a href="#how-it-works">See How it Works</a>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right side — Spline 3D scene with fade-out at feet */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
            className="flex-1 w-full h-[400px] md:h-[500px] lg:h-[600px] relative"
          >
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />

            {/* Bottom fade — hides the cut-off feet with a smooth gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10" />

            {/* Subtle glow behind the robot */}
            <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
