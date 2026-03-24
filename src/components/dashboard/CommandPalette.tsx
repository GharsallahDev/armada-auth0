"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, LayoutDashboard, UserPlus, ScrollText, Settings,
  MessageCircle, Zap, Shield, Send, BarChart3, Smartphone,
  Bell, ListTodo,
} from "lucide-react";

interface Action {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  shortcut?: string;
  type: string;
  href?: string;
}

const actions: Action[] = [
  { icon: LayoutDashboard, label: "Go to Workforce", description: "View your AI employees", shortcut: "G W", type: "Navigation", href: "/dashboard" },
  { icon: BarChart3, label: "Analytics", description: "Workforce performance & trust metrics", shortcut: "G D", type: "Navigation", href: "/dashboard/analytics" },
  { icon: ListTodo, label: "Task Queue", description: "Monitor active work & task history", shortcut: "G T", type: "Navigation", href: "/dashboard/tasks" },
  { icon: Smartphone, label: "Approvals", description: "CIBA authorization requests", shortcut: "G P", type: "Navigation", href: "/dashboard/approvals" },
  { icon: ScrollText, label: "Audit Trail", description: "Complete log of agent actions", shortcut: "G A", type: "Navigation", href: "/dashboard/audit" },
  { icon: Shield, label: "Policies", description: "Permission rules & guardrails", type: "Navigation", href: "/dashboard/policies" },
  { icon: Bell, label: "Notifications", description: "System alerts & activity", shortcut: "G N", type: "Navigation", href: "/dashboard/notifications" },
  { icon: UserPlus, label: "Hire Employee", description: "Create a new AI agent", shortcut: "G H", type: "Action", href: "/dashboard/hire" },
  { icon: Settings, label: "Settings", description: "Manage connections & config", shortcut: "G S", type: "Navigation", href: "/dashboard/settings" },
  { icon: MessageCircle, label: "Chat with Agent", description: "Open agent conversation", type: "Action" },
  { icon: Zap, label: "Revoke All Trust", description: "Emergency kill switch", type: "Danger" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query
    ? actions.filter(
        (a) =>
          a.label.toLowerCase().includes(query.toLowerCase()) ||
          a.description.toLowerCase().includes(query.toLowerCase())
      )
    : actions;

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery("");
        setSelectedIndex(0);
      }
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  function handleSelect(action: Action) {
    setIsOpen(false);
    if (action.href) router.push(action.href);
  }

  function handleKeyNav(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex]);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyNav}
                  placeholder="Search actions..."
                  className="flex-1 bg-transparent border-none outline-none text-[14px] text-foreground placeholder:text-muted-foreground/50"
                />
                {query ? (
                  <Send className="h-4 w-4 text-primary" />
                ) : (
                  <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border/30 font-mono">
                    ESC
                  </kbd>
                )}
              </div>

              {/* Results */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-h-[320px] overflow-y-auto py-2 px-2"
              >
                {filtered.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.label}
                      variants={itemVariants}
                      onClick={() => handleSelect(action)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        selectedIndex === i
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:bg-muted/30"
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedIndex === i ? "bg-primary/20" : "bg-muted/50"
                      }`}>
                        <Icon className={`h-4 w-4 ${selectedIndex === i ? "text-primary" : ""}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate">{action.label}</p>
                        <p className="text-[11px] text-muted-foreground/60 truncate">{action.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground/50 border border-border/20">
                          {action.type}
                        </span>
                        {action.shortcut && (
                          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground/60 border border-border/30 font-mono">
                            {action.shortcut}
                          </kbd>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-[13px] text-muted-foreground/50">No results found</p>
                  </div>
                )}
              </motion.div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <kbd className="text-[9px] px-1 py-0.5 rounded bg-muted/50 text-muted-foreground/50 border border-border/30 font-mono">↑</kbd>
                    <kbd className="text-[9px] px-1 py-0.5 rounded bg-muted/50 text-muted-foreground/50 border border-border/30 font-mono">↓</kbd>
                    <span className="text-[10px] text-muted-foreground/40 ml-1">navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="text-[9px] px-1 py-0.5 rounded bg-muted/50 text-muted-foreground/50 border border-border/30 font-mono">↵</kbd>
                    <span className="text-[10px] text-muted-foreground/40 ml-1">select</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground/50 border border-border/30 font-mono">⌘K</kbd>
                  <span className="text-[10px] text-muted-foreground/40 ml-1">toggle</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
