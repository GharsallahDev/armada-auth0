"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowingEffectProps {
  blur?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  movementDuration?: number;
  borderWidth?: number;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function GlowingEffect({
  blur = 0,
  proximity = 64,
  spread = 20,
  variant = "default",
  movementDuration = 2,
  borderWidth = 1,
  className,
  disabled = false,
  children,
}: GlowingEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [glowStyle, setGlowStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (disabled || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      const isNear = distance < proximity + Math.max(rect.width, rect.height) / 2;
      setIsActive(isNear);

      if (isNear) {
        const angle = Math.atan2(distY, distX) * (180 / Math.PI) + 90;
        setGlowStyle({
          "--glow-angle": `${angle}deg`,
          "--glow-spread": `${spread}px`,
          "--glow-blur": `${blur}px`,
        } as React.CSSProperties);
      }
    },
    [disabled, proximity, spread, blur]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const gradientColors =
    variant === "white"
      ? "rgba(255,255,255,0.8), rgba(255,255,255,0.4), transparent, transparent"
      : "rgba(255,120,200,0.6), rgba(255,180,100,0.5), rgba(120,255,200,0.5), rgba(100,180,255,0.6), transparent, transparent";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Glow border */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[inherit] z-0"
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          ...glowStyle,
          padding: borderWidth,
          background: `conic-gradient(from var(--glow-angle, 0deg), ${gradientColors})`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          filter: `blur(${blur}px)`,
        }}
      />
      {/* Outer glow */}
      <motion.div
        className="pointer-events-none absolute -inset-1 rounded-[inherit] z-0"
        animate={{ opacity: isActive ? 0.4 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          ...glowStyle,
          background: `conic-gradient(from var(--glow-angle, 0deg), ${gradientColors})`,
          filter: `blur(${spread}px)`,
        }}
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
