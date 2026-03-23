export const dynamic = "force-dynamic";

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { SidebarNav } from "@/components/dashboard/SidebarNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/");
  }

  const initial = session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || "U";
  const displayName = session.user?.name || session.user?.email || "User";

  return (
    <div className="flex h-screen bg-[#030303]">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0a0a0a]">
        {/* Logo */}
        <div className="px-5 h-14 flex items-center gap-2.5 border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img
              src="/logo-192.png"
              alt="Armada"
              className="h-7 w-7 rounded-md"
            />
            <div>
              <span className="text-[15px] font-semibold tracking-tight text-white">
                Armada
              </span>
              <span className="text-[10px] text-neutral-600 block -mt-0.5">
                AI Workforce Manager
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <SidebarNav />

        {/* User section */}
        <div className="mt-auto border-t border-white/[0.06] p-3 space-y-2">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="h-7 w-7 rounded-full bg-white/[0.08] flex items-center justify-center text-[11px] font-semibold text-neutral-300 shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-neutral-200 truncate leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-neutral-600 truncate leading-tight mt-0.5">
                {session.user.email}
              </p>
            </div>
          </div>
          <a
            href="/auth/logout"
            className="flex items-center gap-2.5 px-4 py-1.5 text-[13px] font-medium text-neutral-600 hover:text-neutral-400 transition-colors duration-150 rounded-lg hover:bg-white/[0.03]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[#030303]">{children}</main>
    </div>
  );
}
