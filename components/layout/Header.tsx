"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Skeleton } from "@/components/ui/skeleton";
import { appConfig } from "@/lib/config";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-bold text-xl hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
          aria-label={`${appConfig.name} home`}
        >
          {appConfig.name}
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-4">
          <AuthLoading>
            <Skeleton className="h-9 w-24" />
          </AuthLoading>

          <Unauthenticated>
            <span className="text-muted-foreground text-sm">
              Sign in to continue
            </span>
          </Unauthenticated>

          <Authenticated>
            <UserInfo />
            <SignOutButton />
          </Authenticated>
        </nav>
      </div>
    </header>
  );
}

function UserInfo() {
  const user = useQuery(api.users.currentUser);

  if (user === undefined) {
    return <Skeleton className="h-4 w-32" />;
  }

  if (user === null) {
    return null;
  }

  return (
    <span className="text-sm text-muted-foreground">
      {user.email ?? user.name ?? "User"}
    </span>
  );
}
