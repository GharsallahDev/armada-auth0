"use client";

import { motion } from "framer-motion";
import {
  TRUST_LEVEL_COLORS,
  TRUST_LEVEL_NAMES,
  type TrustLevel,
} from "@/lib/trust/levels";

interface TrustGaugeProps {
  score: number;
  level: number;
  maxScore?: number;
  agentName: string;
}

export function TrustGauge({
  score,
  level,
  maxScore = 750,
}: TrustGaugeProps) {
  const color = TRUST_LEVEL_COLORS[level as TrustLevel] ?? "#ef4444";
  const levelName = TRUST_LEVEL_NAMES[level as TrustLevel] ?? "Unknown";
  const percentage = Math.min(score / maxScore, 1);

  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-white/[0.06]"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-bold"
            style={{ color }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            L{level}
          </motion.span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[12px] font-medium text-neutral-300">
          {score} / {maxScore} pts
        </p>
        <p className="text-[11px] text-neutral-500">{levelName}</p>
      </div>
    </div>
  );
}
