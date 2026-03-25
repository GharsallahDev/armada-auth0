"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Shield, Lock, Smartphone } from "lucide-react";

interface DisplayCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  date?: string;
  className?: string;
  gradient: string;
  iconColor: string;
}

interface DisplayCardsProps {
  cards?: DisplayCard[];
  className?: string;
}

export function DisplayCards({ cards, className }: DisplayCardsProps) {
  const defaultCards: DisplayCard[] = cards || [
    {
      icon: <Shield className="h-4 w-4" />,
      title: "Progressive Trust",
      description: "Agents earn autonomy through proven performance",
      date: "Level 0 → 3",
      gradient: "from-emerald-500/20 to-green-500/20",
      iconColor: "text-emerald-400",
      className: "-rotate-[4deg] translate-x-0 translate-y-0",
    },
    {
      icon: <Lock className="h-4 w-4" />,
      title: "Token Vault",
      description: "Secure OAuth delegation across 34+ services",
      date: "Auth0 Powered",
      gradient: "from-violet-500/20 to-purple-500/20",
      iconColor: "text-violet-400",
      className: "rotate-[2deg] translate-x-6 -translate-y-4",
    },
    {
      icon: <Smartphone className="h-4 w-4" />,
      title: "CIBA Approval",
      description: "Real-time human-in-the-loop for sensitive actions",
      date: "Push Notification",
      gradient: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
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
            "[grid-area:stack] w-[280px] rounded-2xl border backdrop-blur-xl p-5",
            "border-border/60 dark:border-white/[0.08]",
            "bg-card/90 dark:bg-card/80",
            "transition-all duration-500",
            "hover:-translate-y-3 hover:shadow-xl hover:shadow-black/[0.08] dark:hover:shadow-primary/5",
            "hover:border-primary/20 dark:hover:border-primary/15",
            "group cursor-default",
            card.className
          )}
          style={{ zIndex: i }}
        >
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.02] to-violet-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "h-9 w-9 rounded-xl bg-gradient-to-br border flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                card.gradient,
                "border-border/30 dark:border-white/10",
                card.iconColor
              )}>
                {card.icon}
              </div>
              {card.date && (
                <span className="text-[10px] font-semibold text-muted-foreground/50 ml-auto uppercase tracking-wider">
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
