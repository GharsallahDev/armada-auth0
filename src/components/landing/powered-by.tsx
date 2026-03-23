"use client";

import { motion } from "framer-motion";
import { Lock, Smartphone, Fingerprint, Shield } from "lucide-react";

const features = [
  {
    icon: Lock,
    color: "#60a5fa",
    label: "Token Vault",
    sublabel: "Connect employees to 34+ services",
  },
  {
    icon: Smartphone,
    color: "#f59e0b",
    label: "CIBA",
    sublabel: "Mobile approval for sensitive actions",
  },
  {
    icon: Fingerprint,
    color: "#a78bfa",
    label: "Universal Login",
    sublabel: "Secure access for your workforce",
  },
  {
    icon: Shield,
    color: "#34d399",
    label: "Progressive Trust",
    sublabel: "Progressive autonomy through proven performance",
  },
];

export function PoweredBy() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-[13px] font-medium text-indigo-400/50 uppercase tracking-[0.1em]">
            Powered by Auth0
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-x-0"
        >
          {features.map((f, i) => (
            <div key={f.label} className="flex items-center">
              {i > 0 && (
                <div className="w-px h-8 bg-white/[0.06] mx-6 hidden sm:block" />
              )}
              <div className="flex items-center gap-3 py-3 px-2">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${f.color}12` }}
                >
                  <f.icon className="h-3.5 w-3.5" style={{ color: f.color }} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#d1d5db] tracking-[-0.01em]">
                    {f.label}
                  </p>
                  <p className="text-[11px] text-[#4b5563] tracking-[-0.01em]">
                    {f.sublabel}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
