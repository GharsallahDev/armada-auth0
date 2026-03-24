"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarBody,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  UserPlus,
  ScrollText,
  Settings,
  LogOut,
  BarChart3,
  Smartphone,
  Shield,
  Bell,
  ListTodo,
  Command,
  PanelLeftClose,
  PanelLeft,
  Pin,
  PinOff,
} from "lucide-react";
import { TRUST_LEVEL_NAMES, type TrustLevel } from "@/lib/trust/levels";
import { useState } from "react";
import { motion } from "framer-motion";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const navCategories = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Workforce", icon: LayoutDashboard, exact: true },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
      { href: "/dashboard/approvals", label: "Approvals", icon: Smartphone },
      { href: "/dashboard/audit", label: "Audit Trail", icon: ScrollText },
    ],
  },
  {
    label: "Governance",
    items: [
      { href: "/dashboard/policies", label: "Policies", icon: Shield },
      { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/dashboard/hire", label: "Hire Employee", icon: UserPlus },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

interface Agent {
  slug: string;
  name: string;
  role: string;
  avatarGradient: string;
  status: string;
}

interface SidebarNavProps {
  userInitial: string;
  userName: string;
  userEmail: string;
}

const LEVEL_DOT: Record<number, string> = {
  0: "bg-red-400",
  1: "bg-amber-400",
  2: "bg-blue-400",
  3: "bg-emerald-400",
};

function SidebarContent({ userInitial, userName, userEmail }: SidebarNavProps) {
  const pathname = usePathname();
  const { open, animate, pinned, setPinned } = useSidebar();
  const { data: agents } = useSWR<Agent[]>("/api/agents", fetcher, { refreshInterval: 10000 });
  const { data: trustData } = useSWR<Record<string, { score: number; level: number; decayedScore: number }>>("/api/trust", fetcher, { refreshInterval: 10000 });
  const activeAgents = agents?.filter((a) => a.status === "active") || [];

  return (
    <div className="flex flex-col h-full">
      {/* Logo + Pin */}
      <div className={cn("flex items-center shrink-0 mb-5", open ? "gap-2.5 px-1" : "justify-center")}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <img src="/logo-192.png" alt="Armada" className="h-8 w-8 rounded-lg shrink-0" />
          <motion.span
            animate={{
              display: animate ? (open ? "inline-block" : "none") : "inline-block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="text-[15px] font-bold tracking-tight text-foreground whitespace-pre"
          >
            Armada
          </motion.span>
        </Link>
        {open && (
          <button
            onClick={() => setPinned(!pinned)}
            className={cn(
              "ml-auto h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0",
              pinned
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/[0.06]"
            )}
            title={pinned ? "Unpin sidebar" : "Pin sidebar open"}
          >
            {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Categorized nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden scrollbar-none">
        {navCategories.map((category) => (
          <div key={category.label}>
            {/* Category label */}
            <motion.div
              animate={{
                display: animate ? (open ? "block" : "none") : "block",
                opacity: animate ? (open ? 1 : 0) : 1,
              }}
              className="px-3 mb-1.5"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40 whitespace-pre">
                {category.label}
              </span>
            </motion.div>

            <div className="space-y-0.5">
              {category.items.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl py-2 transition-all duration-200",
                      open ? "px-3" : "px-0 justify-center",
                      isActive
                        ? "bg-white/[0.08] text-foreground shadow-sm"
                        : "text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.04]"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-4 rounded-full bg-primary"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <item.icon className={cn("h-[16px] w-[16px] shrink-0", isActive && "text-primary")} />
                    <motion.span
                      animate={{
                        display: animate ? (open ? "inline-block" : "none") : "inline-block",
                        opacity: animate ? (open ? 1 : 0) : 1,
                      }}
                      className="text-[13px] font-medium whitespace-pre"
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Employee list */}
        {activeAgents.length > 0 && (
          <div>
            <motion.div
              animate={{
                display: animate ? (open ? "block" : "none") : "block",
                opacity: animate ? (open ? 1 : 0) : 1,
              }}
              className="px-3 mb-1.5"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40 whitespace-pre">
                Employees
              </span>
            </motion.div>

            {!open && (
              <div className="flex justify-center mb-1">
                <div className="h-px w-6 bg-border/30 rounded-full" />
              </div>
            )}

            <div className="space-y-0.5">
              {activeAgents.map((agent) => {
                const isActive = pathname === `/dashboard/employee/${agent.slug}`;
                const trust = trustData?.[agent.slug];
                const levelName = trust ? TRUST_LEVEL_NAMES[trust.level as TrustLevel] : undefined;
                const levelDot = trust ? LEVEL_DOT[trust.level] || LEVEL_DOT[0] : undefined;
                return (
                  <Link
                    key={agent.slug}
                    href={`/dashboard/employee/${agent.slug}`}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-xl transition-all duration-200",
                      open ? "px-3 py-2" : "px-0 py-2 justify-center",
                      isActive
                        ? "bg-white/[0.08] text-foreground"
                        : "text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className={cn(
                        "h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br shadow-sm",
                        agent.avatarGradient
                      )}>
                        {agent.name[0]}
                      </div>
                      {levelDot && (
                        <div className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-sidebar", levelDot)} />
                      )}
                    </div>
                    <motion.div
                      animate={{
                        display: animate ? (open ? "block" : "none") : "block",
                        opacity: animate ? (open ? 1 : 0) : 1,
                      }}
                      className="flex-1 min-w-0 whitespace-pre"
                    >
                      <p className="text-[12px] font-medium truncate">{agent.name}</p>
                      {levelName && (
                        <p className="text-[10px] text-muted-foreground/50 truncate">{levelName}</p>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Cmd+K hint */}
      <motion.div
        animate={{
          display: animate ? (open ? "flex" : "none") : "flex",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="items-center gap-2 px-3 py-2 mb-2 rounded-xl bg-white/[0.04] border border-white/[0.06]"
      >
        <Command className="h-3 w-3 text-muted-foreground/50 shrink-0" />
        <span className="text-[11px] text-muted-foreground/40 whitespace-pre">Press </span>
        <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-muted-foreground/50 border border-white/[0.08] font-mono">
          ⌘K
        </kbd>
      </motion.div>

      {/* User section */}
      <div className="pt-3 border-t border-white/[0.06] space-y-2">
        <div className={cn("flex items-center", open ? "gap-2.5 px-1" : "justify-center")}>
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center text-[11px] font-bold text-white/90 shrink-0">
            {userInitial}
          </div>
          <motion.div
            animate={{
              display: animate ? (open ? "block" : "none") : "block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="flex-1 min-w-0 whitespace-pre"
          >
            <p className="text-[12px] font-medium text-foreground/90 truncate">{userName}</p>
            <p className="text-[10px] text-muted-foreground/50 truncate">{userEmail}</p>
          </motion.div>
        </div>
        <div className={cn("flex items-center", open ? "gap-1 px-1" : "flex-col gap-1 items-center")}>
          <a
            href="/auth/logout"
            className={cn(
              "flex items-center gap-2 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04] transition-colors",
              open ? "flex-1 px-2 py-1.5 text-[12px]" : "h-8 w-8 justify-center"
            )}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <motion.span
              animate={{
                display: animate ? (open ? "inline-block" : "none") : "inline-block",
                opacity: animate ? (open ? 1 : 0) : 1,
              }}
              className="whitespace-pre"
            >
              Sign Out
            </motion.span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export function SidebarNav({ userInitial, userName, userEmail }: SidebarNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody
        className="border-r border-white/[0.06] bg-[#0a0a14]/80 backdrop-blur-2xl"
        style={{ overflow: "hidden" }}
      >
        <SidebarContent
          userInitial={userInitial}
          userName={userName}
          userEmail={userEmail}
        />
      </SidebarBody>
    </Sidebar>
  );
}
