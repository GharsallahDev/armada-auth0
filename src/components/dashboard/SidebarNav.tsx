"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UserPlus,
  ScrollText,
  Settings,
  Bot,
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
  const activeAgents = agents?.filter((a) => a.status === "active") || [];

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {/* Main nav */}
      {mainNav.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
              isActive
                ? "text-white bg-indigo-500/[0.08]"
                : "text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04]"
            )}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full bg-indigo-400" />
            )}
            <item.icon className={cn(
              "h-[15px] w-[15px] shrink-0",
              isActive ? "text-indigo-400" : "text-neutral-600 group-hover:text-neutral-400"
            )} />
            {item.label}
          </Link>
        );
      })}

      {/* Divider + Agent list */}
      {activeAgents.length > 0 && (
        <>
          <div className="pt-3 pb-1 px-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
              Employees
            </p>
          </div>
          {activeAgents.map((agent) => {
            const isActive = pathname === `/dashboard/employee/${agent.slug}`;
            return (
              <Link
                key={agent.slug}
                href={`/dashboard/employee/${agent.slug}`}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-150",
                  isActive
                    ? "text-white bg-white/[0.06]"
                    : "text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04]"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full bg-indigo-400" />
                )}
                <div className={cn(
                  "h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0 bg-gradient-to-br",
                  agent.avatarGradient
                )}>
                  {agent.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{agent.name}</p>
                  <p className="text-[10px] text-neutral-600 truncate">{agent.role}</p>
                </div>
              </Link>
            );
          })}
        </>
      )}
    </nav>
  );
}
