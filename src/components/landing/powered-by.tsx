"use client";

import { motion } from "framer-motion";
import { Lock, Smartphone, Fingerprint, Shield } from "lucide-react";
import { FlickeringGrid } from "@/components/ui/flickering-grid-hero";

const features = [
  {
    icon: Lock,
    gradient: "from-blue-500 to-cyan-500",
    label: "Token Vault",
    sublabel: "Connect employees to 34+ services with secure OAuth delegation",
  },
  {
    icon: Smartphone,
    gradient: "from-amber-500 to-orange-500",
    label: "CIBA",
    sublabel: "Approve sensitive actions from your phone in real-time",
  },
  {
    icon: Fingerprint,
    gradient: "from-violet-500 to-purple-500",
    label: "Universal Login",
    sublabel: "Secure, branded authentication for your entire workforce",
  },
  {
    icon: Shield,
    gradient: "from-emerald-500 to-green-500",
    label: "Progressive Trust",
    sublabel: "Autonomy earned through proven, consistent performance",
  },
];

export function PoweredBy() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* FlickeringGrid background */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <FlickeringGrid
          color="rgb(99, 102, 241)"
          squareSize={4}
          gridGap={6}
          flickerChance={0.3}
          maxOpacity={0.15}
          className="h-full w-full"
        />
      </div>

      {/* Gradient fade edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border border-border/50 bg-muted/20 backdrop-blur-sm mb-8">
            <img
              src="https://pages.okta.com/rs/855-QAH-699/images/email-main-template_auth0-by-okta-logo_black_279x127_3x.png"
              alt="Auth0 by Okta"
              className="h-9 dark:invert"
            />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
              Powered by Auth0
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Enterprise-grade identity infrastructure for your AI workforce
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-5 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-border hover:bg-card/80 transition-all duration-300"
              >
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-[15px] font-semibold text-foreground mb-1.5">
                  {f.label}
                </h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {f.sublabel}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
