export const dynamic = "force-dynamic";

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();
  if (!session) redirect("/");

  const initial = session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || "U";
  const displayName = session.user?.name || session.user?.email || "User";

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-60 shrink-0 flex flex-col border-r border-border bg-card">
        <div className="px-5 h-14 flex items-center gap-2.5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img src="/logo-192.png" alt="Armada" className="h-7 w-7 rounded-md" />
            <div>
              <span className="text-[15px] font-semibold tracking-tight text-foreground">Armada</span>
              <span className="text-[10px] text-muted-foreground block -mt-0.5">AI Workforce Manager</span>
            </div>
          </Link>
        </div>
        <SidebarNav />
        <div className="border-t border-border p-3 space-y-2">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-[10px] font-semibold">{initial}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate leading-tight">{displayName}</p>
              <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">{session.user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="flex-1 justify-start text-muted-foreground" asChild>
              <a href="/auth/logout">
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Sign Out
              </a>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
