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
} from "lucide-react";
import { TRUST_LEVEL_NAMES, type TrustLevel } from "@/lib/trust/levels";
import { useState } from "react";
import { motion } from "framer-motion";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const mainNav = [
  { href: "/dashboard", label: "Workforce", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
  { href: "/dashboard/approvals", label: "Approvals", icon: Smartphone },
  { href: "/dashboard/audit", label: "Audit", icon: ScrollText },
  { href: "/dashboard/policies", label: "Policies", icon: Shield },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/hire", label: "Hire", icon: UserPlus },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
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

function SidebarContent({ userInitial, userName, userEmail }: SidebarNavProps) {
  const pathname = usePathname();
  const { open, animate } = useSidebar();
  const { data: agents } = useSWR<Agent[]>("/api/agents", fetcher, { refreshInterval: 10000 });
  const { data: trustData } = useSWR<Record<string, { score: number; level: number; decayedScore: number }>>("/api/trust", fetcher, { refreshInterval: 10000 });
  const activeAgents = agents?.filter((a) => a.status === "active") || [];

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center shrink-0 mb-6", open ? "gap-2.5" : "justify-center")}>
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
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
        {mainNav.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl py-2.5 transition-all duration-200",
                open ? "px-3" : "px-0 justify-center",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
              )}
              <item.icon className="h-[18px] w-[18px] shrink-0" />
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

        {/* Employee list */}
        {activeAgents.length > 0 && (
          <>
            <div className={cn("pt-4 pb-1", open ? "px-1" : "px-0")}>
              <div className="h-px bg-border/50 mb-3" />
              <motion.span
                animate={{
                  display: animate ? (open ? "block" : "none") : "block",
                  opacity: animate ? (open ? 1 : 0) : 1,
                }}
                className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-2 whitespace-pre"
              >
                Employees
              </motion.span>
            </div>
            {activeAgents.map((agent) => {
              const isActive = pathname === `/dashboard/employee/${agent.slug}`;
              const trust = trustData?.[agent.slug];
              const levelName = trust ? TRUST_LEVEL_NAMES[trust.level as TrustLevel] : undefined;
              return (
                <Link
                  key={agent.slug}
                  href={`/dashboard/employee/${agent.slug}`}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-xl transition-all duration-200",
                    open ? "px-3 py-2" : "px-0 py-2 justify-center",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 bg-gradient-to-br shadow-sm",
                    agent.avatarGradient
                  )}>
                    {agent.name[0]}
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
                      <p className="text-[10px] text-muted-foreground/60 truncate">{levelName}</p>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="pt-3 border-t border-border/50 space-y-2">
        <div className={cn("flex items-center", open ? "gap-2.5 px-1" : "justify-center")}>
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0 backdrop-blur-sm">
            {userInitial}
          </div>
          <motion.div
            animate={{
              display: animate ? (open ? "block" : "none") : "block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="flex-1 min-w-0 whitespace-pre"
          >
            <p className="text-[12px] font-medium text-foreground truncate">{userName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
          </motion.div>
        </div>
        <div className={cn("flex items-center", open ? "gap-1 px-1" : "flex-col gap-1 items-center")}>
          <a
            href="/auth/logout"
            className={cn(
              "flex items-center gap-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
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
        className="border-r border-border/50 bg-card/30 backdrop-blur-xl"
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
