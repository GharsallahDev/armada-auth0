"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ConnectCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Completing connection...");

  useEffect(() => {
    async function completeConnection() {
      // Extract connect_code from URL fragment (#connect_code=...)
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const connectCode = params.get("connect_code");
      const state = params.get("state");

      if (!connectCode) {
        setStatus("Missing connect_code. Connection may have been cancelled.");
        setTimeout(() => router.push("/dashboard/settings?error=missing_code"), 2000);
        return;
      }

      try {
        const res = await fetch("/api/services/connect/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connect_code: connectCode, state }),
        });

        const data = await res.json();

        if (res.ok) {
          const connection = data.connection || state || "unknown";
          router.push(`/dashboard/settings?connected=${encodeURIComponent(connection)}`);
        } else {
          console.error("Complete failed:", data);
          setStatus("Failed to complete connection.");
          setTimeout(
            () => router.push(`/dashboard/settings?error=connect_complete_failed&detail=${encodeURIComponent(data.error || "")}`),
            2000
          );
        }
      } catch (err) {
        console.error("Callback error:", err);
        setStatus("An error occurred.");
        setTimeout(() => router.push("/dashboard/settings?error=connect_failed"), 2000);
      }
    }

    completeConnection();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4" />
        <p className="text-zinc-400">{status}</p>
      </div>
    </div>
  );
}
