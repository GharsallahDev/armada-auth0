"use client"

import React from "react"
import { cx } from "class-variance-authority"
import { AnimatePresence, motion } from "framer-motion"
import { Send, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrbProps {
  dimension?: string
  className?: string
  tones?: {
    base?: string
    accent1?: string
    accent2?: string
    accent3?: string
  }
  spinDuration?: number
}

const ColorOrb: React.FC<OrbProps> = ({
  dimension = "192px",
  className,
  tones,
  spinDuration = 20,
}) => {
  const fallbackTones = {
    base: "oklch(95% 0.02 264.695)",
    accent1: "oklch(75% 0.15 350)",
    accent2: "oklch(80% 0.12 200)",
    accent3: "oklch(78% 0.14 280)",
  }

  const palette = { ...fallbackTones, ...tones }
  const dimValue = parseInt(dimension.replace("px", ""), 10)
  const blurStrength = dimValue < 50 ? Math.max(dimValue * 0.008, 1) : Math.max(dimValue * 0.015, 4)
  const contrastStrength = dimValue < 50 ? Math.max(dimValue * 0.004, 1.2) : Math.max(dimValue * 0.008, 1.5)
  const pixelDot = dimValue < 50 ? Math.max(dimValue * 0.004, 0.05) : Math.max(dimValue * 0.008, 0.1)
  const shadowRange = dimValue < 50 ? Math.max(dimValue * 0.004, 0.5) : Math.max(dimValue * 0.008, 2)
  const maskRadius = dimValue < 30 ? "0%" : dimValue < 50 ? "5%" : dimValue < 100 ? "15%" : "25%"
  const adjustedContrast = dimValue < 30 ? 1.1 : dimValue < 50 ? Math.max(contrastStrength * 1.2, 1.3) : contrastStrength

  return (
    <div
      className={cn("color-orb", className)}
      style={{
        width: dimension,
        height: dimension,
        "--base": palette.base,
        "--accent1": palette.accent1,
        "--accent2": palette.accent2,
        "--accent3": palette.accent3,
        "--spin-duration": `${spinDuration}s`,
        "--blur": `${blurStrength}px`,
        "--contrast": adjustedContrast,
        "--dot": `${pixelDot}px`,
        "--shadow": `${shadowRange}px`,
        "--mask": maskRadius,
      } as React.CSSProperties}
    >
      <style jsx>{`
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }
        .color-orb {
          display: grid;
          grid-template-areas: "stack";
          overflow: hidden;
          border-radius: 50%;
          position: relative;
          transform: scale(1.1);
        }
        .color-orb::before,
        .color-orb::after {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          transform: translateZ(0);
        }
        .color-orb::before {
          background:
            conic-gradient(from calc(var(--angle) * 2) at 25% 70%, var(--accent3), transparent 20% 80%, var(--accent3)),
            conic-gradient(from calc(var(--angle) * 2) at 45% 75%, var(--accent2), transparent 30% 60%, var(--accent2)),
            conic-gradient(from calc(var(--angle) * -3) at 80% 20%, var(--accent1), transparent 40% 60%, var(--accent1)),
            conic-gradient(from calc(var(--angle) * 2) at 15% 5%, var(--accent2), transparent 10% 90%, var(--accent2)),
            conic-gradient(from calc(var(--angle) * 1) at 20% 80%, var(--accent1), transparent 10% 90%, var(--accent1)),
            conic-gradient(from calc(var(--angle) * -2) at 85% 10%, var(--accent3), transparent 20% 80%, var(--accent3));
          box-shadow: inset var(--base) 0 0 var(--shadow) calc(var(--shadow) * 0.2);
          filter: blur(var(--blur)) contrast(var(--contrast));
          animation: spin var(--spin-duration) linear infinite;
        }
        .color-orb::after {
          background-image: radial-gradient(circle at center, var(--base) var(--dot), transparent var(--dot));
          background-size: calc(var(--dot) * 2) calc(var(--dot) * 2);
          backdrop-filter: blur(calc(var(--blur) * 2)) contrast(calc(var(--contrast) * 2));
          mix-blend-mode: overlay;
        }
        .color-orb[style*="--mask: 0%"]::after { mask-image: none; }
        .color-orb:not([style*="--mask: 0%"])::after { mask-image: radial-gradient(black var(--mask), transparent 75%); }
        @keyframes spin { to { --angle: 360deg; } }
        @media (prefers-reduced-motion: reduce) { .color-orb::before { animation: none; } }
      `}</style>
    </div>
  )
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

const AI_RESPONSES: Record<string, string> = {
  default: "I can help you manage your AI workforce. Try asking about agent status, recent activity, or how to connect new services via Token Vault.",
  status: "All systems operational. 3 agents active, 1 idle. Nova is handling social media scheduling, Atlas is processing Q1 invoices, and Relay is monitoring the support inbox.",
  help: "Here's what I can help with:\n\n- Agent status & activity\n- Token Vault connections\n- Permission management\n- Trust level overviews\n- Quick actions on any agent",
  agents: "Your active workforce:\n\n- Nova (Marketing) — scheduling posts via Buffer + LinkedIn\n- Atlas (Finance) — reconciling Stripe payments\n- Cipher (Compliance) — running weekly audit\n- Relay (Support) — monitoring Gmail inbox",
}

function getResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes("status") || lower.includes("how are")) return AI_RESPONSES.status
  if (lower.includes("help") || lower.includes("what can")) return AI_RESPONSES.help
  if (lower.includes("agent") || lower.includes("workforce") || lower.includes("employee")) return AI_RESPONSES.agents
  return AI_RESPONSES.default
}

export function MorphPanel() {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const [showForm, setShowForm] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [isThinking, setIsThinking] = React.useState(false)

  const triggerClose = React.useCallback(() => {
    setShowForm(false)
    textareaRef.current?.blur()
  }, [])

  const triggerOpen = React.useCallback(() => {
    setShowForm(true)
    setTimeout(() => textareaRef.current?.focus())
  }, [])

  const handleSend = React.useCallback(() => {
    const text = input.trim()
    if (!text || isThinking) return

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsThinking(true)

    setTimeout(() => {
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: getResponse(text) }
      setMessages((prev) => [...prev, aiMsg])
      setIsThinking(false)
    }, 800 + Math.random() * 600)
  }, [input, isThinking])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isThinking])

  React.useEffect(() => {
    function clickOutsideHandler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node) && showForm) {
        triggerClose()
      }
    }
    document.addEventListener("mousedown", clickOutsideHandler)
    return () => document.removeEventListener("mousedown", clickOutsideHandler)
  }, [showForm, triggerClose])

  const hasMessages = messages.length > 0

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        ref={wrapperRef}
        data-panel
        className="bg-background relative flex flex-col overflow-hidden border shadow-lg"
        initial={false}
        animate={{
          width: showForm ? FORM_WIDTH : "auto",
          height: showForm ? FORM_HEIGHT : 44,
          borderRadius: showForm ? 16 : 22,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.8, delay: showForm ? 0 : 0.08 }}
      >
        {/* Collapsed dock bar */}
        {!showForm && (
          <button
            type="button"
            onClick={triggerOpen}
            className="flex h-[44px] w-full items-center justify-center whitespace-nowrap select-none cursor-pointer hover:bg-muted/30 dark:hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center justify-center gap-2 px-3">
              <ColorOrb dimension="24px" tones={{ base: "oklch(22.64% 0 0)" }} />
              <span className="text-sm font-medium text-foreground">Ask AI</span>
              {messages.length > 0 && (
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
          </button>
        )}

        {/* Expanded chat */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 dark:border-white/[0.06] shrink-0">
                <div className="flex items-center gap-2">
                  <ColorOrb dimension="20px" tones={{ base: "oklch(22.64% 0 0)" }} />
                  <span className="text-[13px] font-semibold text-foreground">Armada AI</span>
                </div>
                <button
                  onClick={triggerClose}
                  className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted/40 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-none">
                {!hasMessages && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-6">
                    <ColorOrb dimension="40px" tones={{ base: "oklch(22.64% 0 0)" }} className="mb-3" />
                    <p className="text-[13px] font-medium text-foreground mb-1">How can I help?</p>
                    <p className="text-[11px] text-muted-foreground/50 max-w-[200px]">
                      Ask about your agents, services, permissions, or anything else.
                    </p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted/40 dark:bg-white/[0.06] text-foreground rounded-bl-sm border border-border/20 dark:border-white/[0.06]"
                    )}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-muted/40 dark:bg-white/[0.06] rounded-2xl rounded-bl-sm px-3 py-2 border border-border/20 dark:border-white/[0.06]">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-3 py-2 border-t border-border/30 dark:border-white/[0.06] shrink-0">
                <div className="flex items-center gap-2">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    rows={1}
                    className="flex-1 resize-none rounded-lg bg-muted/20 dark:bg-white/[0.03] px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground/40 outline-none border border-border/30 dark:border-white/[0.06] focus:border-primary/30 transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                      if (e.key === "Escape") triggerClose()
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isThinking}
                    className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isThinking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

const FORM_WIDTH = 380
const FORM_HEIGHT = 440

export default MorphPanel
