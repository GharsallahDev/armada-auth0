"use client";

import useSWR from "swr";
import { HireWizard } from "@/components/dashboard/HireWizard";
import { UserPlus, Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function HirePage() {
  const { data: services, isLoading } = useSWR<{ provider: string; connected: boolean }[]>(
    "/api/services",
    fetcher
  );

  // Always include API-key/bot-token services as connected
  const alwaysConnected = ["slack", "stripe"];
  const connectedProviders = [
    ...alwaysConnected,
    ...(services?.filter((s) => s.connected).map((s) => s.provider) || []),
  ];

  return (
    <div className="min-h-full">
      <div className="border-b border-white/[0.06]">
        <div className="px-8 py-6 max-w-[1400px]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <UserPlus className="h-4.5 w-4.5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Hire New Employee
              </h1>
              <p className="text-[13px] text-neutral-500 mt-0.5">
                Create an AI employee with a specific role and assigned services
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
          </div>
        ) : (
          <HireWizard connectedProviders={connectedProviders} />
        )}
      </div>
    </div>
  );
}
