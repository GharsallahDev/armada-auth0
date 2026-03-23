"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockAgents = [
  { name: "Alex", role: "Sales Development", services: ["Gmail", "Stripe", "Calendar"], level: 2, levelName: "Senior", gradient: "from-indigo-500 to-violet-500", score: 350 },
  { name: "Jordan", role: "Community Manager", services: ["Slack", "Discord", "GitHub"], level: 1, levelName: "Junior", gradient: "from-cyan-500 to-blue-500", score: 120 },
  { name: "Atlas", role: "Research Analyst", services: ["Drive", "Gmail"], level: 0, levelName: "Probationary", gradient: "from-emerald-500 to-green-500", score: 25 },
];

export function Terminal() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Card className="shadow-2xl">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-[11px] text-muted-foreground ml-3">Armada — Workforce Dashboard</span>
          </div>

          {/* Content */}
          <CardContent className="p-6 space-y-4">
            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Employees", value: "3" },
                { label: "Avg Trust", value: "165" },
                { label: "Actions Today", value: "47" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="rounded-lg bg-muted/50 border border-border p-3"
                >
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Agent cards */}
            <div className="space-y-2">
              {mockAgents.map((agent, i) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="flex items-center gap-4 p-3.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                    {agent.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-foreground">{agent.name}</span>
                      <Badge
                        variant={
                          agent.level === 0 ? "destructive" :
                          agent.level === 1 ? "secondary" :
                          "outline"
                        }
                        className="text-[10px]"
                      >
                        {agent.levelName}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{agent.role}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {agent.services.map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[12px] font-medium text-muted-foreground">{agent.score} pts</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
