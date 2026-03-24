"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  UserPlus,
  ScrollText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TRUST_LEVEL_NAMES, type TrustLevel } from "@/lib/trust/levels";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const mainNav = [
  { href: "/dashboard", label: "Workforce", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/hire", label: "Hire", icon: UserPlus },
  { href: "/dashboard/audit", label: "Audit", icon: ScrollText },
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

export function SidebarNav({ userInitial, userName, userEmail }: SidebarNavProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const { data: agents } = useSWR<Agent[]>("/api/agents", fetcher, { refreshInterval: 10000 });
  const { data: trustData } = useSWR<Record<string, { score: number; level: number; decayedScore: number }>>("/api/trust", fetcher, { refreshInterval: 10000 });
  const activeAgents = agents?.filter((a) => a.status === "active") || [];

  return (
    <aside
      className={cn(
        "shrink-0 flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 ease-in-out relative group/sidebar",
        expanded ? "w-56" : "w-16"
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full border border-border bg-card shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        {expanded ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      {/* Logo */}
      <div className={cn("h-14 flex items-center border-b border-border/50 shrink-0", expanded ? "px-4 gap-2.5" : "px-0 justify-center")}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <img src="/logo-192.png" alt="Armada" className="h-7 w-7 rounded-lg shrink-0" />
          {expanded && (
            <span className="text-[14px] font-bold tracking-tight text-foreground">Armada</span>
          )}
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 py-3 space-y-1 overflow-y-auto overflow-x-hidden px-2">
        {mainNav.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl transition-all duration-200",
                expanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary" />
              )}
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {expanded && (
                <span className="text-[13px] font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}

        {/* Employee list */}
        {activeAgents.length > 0 && (
          <>
            <div className={cn("pt-3 pb-1", expanded ? "px-3" : "px-0")}>
              <div className={cn("h-px bg-border/50 mb-3")} />
              {expanded && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  Employees
                </p>
              )}
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
                    expanded ? "px-3 py-2" : "px-0 py-2 justify-center",
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
                  {expanded && (
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate">{agent.name}</p>
                      {levelName && (
                        <p className="text-[10px] text-muted-foreground/60 truncate">{levelName}</p>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User section */}
      <div className={cn("border-t border-border/50 p-2 space-y-1", expanded ? "" : "flex flex-col items-center")}>
        {expanded ? (
          <>
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-foreground truncate">{userName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-1">
              <a
                href="/auth/logout"
                className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </a>
              <ThemeToggle />
            </div>
          </>
        ) : (
          <>
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-[11px] font-bold text-primary">
              {userInitial}
            </div>
            <a
              href="/auth/logout"
              className="flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </a>
            <ThemeToggle />
          </>
        )}
      </div>
    </aside>
  );
}
