"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030303]">
      <div className="text-center max-w-md px-6">
        <h2 className="text-lg font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-neutral-400 mb-1">
          {error.message || "An unexpected error occurred."}
        </p>
        {error.digest && (
          <p className="text-xs text-neutral-600 mb-4">Error ID: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            Try again
          </button>
          <a
            href="/auth/logout"
            className="px-4 py-2 text-sm font-medium text-neutral-400 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
          >
            Sign out
          </a>
        </div>
      </div>
    </div>
  );
}
