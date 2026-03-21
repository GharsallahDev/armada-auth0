"use client";

import { useState } from "react";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface KillSwitchProps {
  onRevoke: () => void;
}

export function KillSwitch({ onRevoke }: KillSwitchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleConfirm() {
    setIsLoading(true);
    try {
      await fetch("/api/trust/revoke-all", {
        method: "POST",
      });
      onRevoke();
    } catch (error) {
      console.error("Failed to revoke all trust:", error);
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="destructive"
            className="gap-2 border border-red-600/30 bg-red-600 text-white shadow-sm hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            <ShieldOff className="size-4" />
            Kill Switch
          </Button>
        }
      />
      <AlertDialogContent className="max-w-md sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Emergency Trust Revocation</AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately revoke ALL agent trust levels to 0. All agents
            will lose their accumulated trust and revert to read-only access.
            This action cannot be undone. Continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Revoking All Trust..." : "Yes, Revoke All"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
