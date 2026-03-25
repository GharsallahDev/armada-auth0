export const dynamic = "force-dynamic";

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { MorphPanel } from "@/components/dashboard/MorphPanel";

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
      <SidebarNav
        userInitial={initial}
        userName={displayName}
        userEmail={session.user.email || ""}
      />
      <main className="flex-1 overflow-auto">{children}</main>
      <CommandPalette />
      <MorphPanel />
    </div>
  );
}
