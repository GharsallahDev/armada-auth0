"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {items.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/50",
              isActive
                ? "text-white bg-indigo-500/[0.08]"
                : "text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04]"
            )}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full bg-indigo-400" />
            )}
            <item.icon className={cn(
              "h-[15px] w-[15px] shrink-0 transition-colors duration-150",
              isActive ? "text-indigo-400" : "text-neutral-600 group-hover:text-neutral-400"
            )} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
