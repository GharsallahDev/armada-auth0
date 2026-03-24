"use client";

import useSWR from "swr";
import { HireWizard } from "@/components/dashboard/HireWizard";
import { Sparkles, Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function HirePage() {
  const { data: services, isLoading } = useSWR<{ provider: string; connected: boolean }[]>(
    "/api/services",
    fetcher
  );

  const alwaysConnected = ["slack", "stripe"];
  const connectedProviders = [
    ...alwaysConnected,
    ...(services?.filter((s) => s.connected).map((s) => s.provider) || []),
  ];

  return (
    <div className="min-h-full">
      <div className="border-b border-border/50">
        <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Hire New Employee</h1>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Choose a role template or create a custom AI employee
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <HireWizard connectedProviders={connectedProviders} />
        )}
      </div>
    </div>
  );
}
