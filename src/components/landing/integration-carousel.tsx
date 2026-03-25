"use client";

import { motion } from "framer-motion";

const INTEGRATION_ICONS = [
  { name: "Google", src: "https://cdn-icons-png.flaticon.com/128/2991/2991148.png" },
  { name: "Slack", src: "https://cdn-icons-png.flaticon.com/128/3536/3536505.png" },
  { name: "GitHub", src: "https://cdn-icons-png.flaticon.com/128/733/733553.png" },
  { name: "Discord", src: "https://cdn-icons-png.flaticon.com/128/3670/3670157.png" },
  { name: "Stripe", src: "https://cdn-icons-png.flaticon.com/128/5968/5968382.png" },
  { name: "Notion", src: "https://cdn-icons-png.flaticon.com/128/5968/5968528.png" },
  { name: "Figma", src: "https://cdn-icons-png.flaticon.com/128/5968/5968705.png" },
  { name: "LinkedIn", src: "https://cdn-icons-png.flaticon.com/128/3536/3536505.png" },
  { name: "Spotify", src: "https://cdn-icons-png.flaticon.com/128/3669/3669986.png" },
  { name: "Twitch", src: "https://cdn-icons-png.flaticon.com/128/5968/5968819.png" },
  { name: "Zoom", src: "https://cdn-icons-png.flaticon.com/128/4401/4401470.png" },
  { name: "Salesforce", src: "https://cdn-icons-png.flaticon.com/128/5968/5968914.png" },
  { name: "Jira", src: "https://cdn-icons-png.flaticon.com/128/5968/5968875.png" },
  { name: "Microsoft", src: "https://cdn-icons-png.flaticon.com/128/732/732221.png" },
];

function IconRow({ reverse = false }: { reverse?: boolean }) {
  const icons = [...INTEGRATION_ICONS, ...INTEGRATION_ICONS, ...INTEGRATION_ICONS, ...INTEGRATION_ICONS];
  return (
    <div className="flex gap-6 py-3 overflow-hidden">
      <motion.div
        className="flex gap-6 shrink-0"
        animate={{ x: reverse ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        {icons.map((icon, i) => (
          <div
            key={`${icon.name}-${i}`}
            className="h-14 w-14 rounded-xl bg-card/60 dark:bg-card/40 border border-border/30 backdrop-blur-sm flex items-center justify-center shrink-0 hover:scale-110 hover:border-primary/30 transition-all duration-300"
          >
            <img
              src={icon.src}
              alt={icon.name}
              className="h-7 w-7 object-contain dark:invert dark:opacity-80"
              loading="lazy"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function IntegrationCarousel() {
  return (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-muted/30 backdrop-blur-sm mb-5">
          <span className="text-[12px] font-medium text-muted-foreground">Integrations</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
            Connect to everything
          </span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Your AI employees can securely access 34+ services through Auth0 Token Vault
        </p>
      </motion.div>

      <div className="space-y-2 max-w-6xl mx-auto">
        <IconRow />
        <IconRow reverse />
      </div>
    </section>
  );
}
