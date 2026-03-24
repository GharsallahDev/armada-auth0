"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DisplayCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  date?: string;
  className?: string;
}

interface DisplayCardsProps {
  cards?: DisplayCard[];
  className?: string;
}

export function DisplayCards({ cards, className }: DisplayCardsProps) {
  const defaultCards: DisplayCard[] = cards || [
    {
      icon: <span className="text-lg">🛡️</span>,
      title: "Progressive Trust",
      description: "Agents earn autonomy through proven performance",
      date: "Level 0 → 3",
      className: "-rotate-[4deg] translate-x-0 translate-y-0",
    },
    {
      icon: <span className="text-lg">🔑</span>,
      title: "Token Vault",
      description: "Secure OAuth delegation across 34+ services",
      date: "Auth0 Powered",
      className: "rotate-[2deg] translate-x-6 -translate-y-4",
    },
    {
      icon: <span className="text-lg">📱</span>,
      title: "CIBA Approval",
      description: "Real-time human-in-the-loop for sensitive actions",
      date: "Push Notification",
      className: "-rotate-[1deg] translate-x-12 -translate-y-8",
    },
  ];

  return (
    <div className={cn("relative grid [grid-template-areas:'stack'] place-items-center", className)}>
      {defaultCards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.15 }}
          className={cn(
            "[grid-area:stack] w-[280px] rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-5",
            "transition-all duration-500 hover:-translate-y-3 hover:shadow-xl hover:shadow-primary/5",
            "group cursor-default",
            card.className
          )}
          style={{ zIndex: i }}
        >
          {/* Gradient fade on right */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-card/80 to-transparent rounded-r-2xl pointer-events-none opacity-60" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/10 flex items-center justify-center">
                {card.icon}
              </div>
              {card.date && (
                <span className="text-[10px] font-medium text-muted-foreground/60 ml-auto">
                  {card.date}
                </span>
              )}
            </div>
            <h4 className="text-[14px] font-semibold text-foreground mb-1">{card.title}</h4>
            <p className="text-[12px] text-muted-foreground leading-relaxed">{card.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
