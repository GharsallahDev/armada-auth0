"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  UserPlus,
  ScrollText,
  Settings,
} from "lucide-react";
import { TRUST_LEVEL_NAMES, type TrustLevel } from "@/lib/trust/levels";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const mainNav = [
  { href: "/dashboard", label: "Workforce", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/hire", label: "Hire Employee", icon: UserPlus },
  { href: "/dashboard/audit", label: "Audit Trail", icon: ScrollText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface Agent {
  slug: string;
  name: string;
  role: string;
  avatarGradient: string;
  status: string;
}

export function SidebarNav() {
  const pathname = usePathname();
  const { data: agents } = useSWR<Agent[]>("/api/agents", fetcher, { refreshInterval: 10000 });
  const { data: trustData } = useSWR<Record<string, { score: number; level: number; decayedScore: number }>>("/api/trust", fetcher, { refreshInterval: 10000 });
  const activeAgents = agents?.filter((a) => a.status === "active") || [];

  return (
    <TooltipProvider delay={300}>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {mainNav.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger
                render={
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                      isActive
                        ? "text-white bg-primary/[0.12]"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  />
                }
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full bg-primary" />
                )}
                <item.icon className={cn(
                  "h-[15px] w-[15px] shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {item.label}
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}

        {activeAgents.length > 0 && (
          <>
            <Separator className="!my-3" />
            <div className="px-3 pb-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Employees ({activeAgents.length})
              </p>
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
                    "group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-150",
                    isActive
                      ? "text-white bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full bg-primary" />
                  )}
                  <div className={cn(
                    "h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0 bg-gradient-to-br",
                    agent.avatarGradient
                  )}>
                    {agent.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{agent.name}</p>
                    <p className="text-[10px] text-muted-foreground/60 truncate">{agent.role}</p>
                  </div>
                  {levelName && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 h-4 shrink-0">
                      {levelName}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </TooltipProvider>
  );
}
