"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export function SignOutButton() {
  const { signOut } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Sign out failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleSignOut} disabled={isLoading}>
      {isLoading ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
