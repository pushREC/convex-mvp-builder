"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Header } from "@/components/layout/Header";
import { SignInForm } from "@/components/auth/SignInForm";
import { TaskList } from "@/components/tasks/TaskList";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { appConfig } from "@/lib/config";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <AuthLoading>
          <LoadingSkeleton />
        </AuthLoading>

        <Unauthenticated>
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">
              Welcome to {appConfig.name}
            </h1>
            <SignInForm />
          </div>
        </Unauthenticated>

        <Authenticated>
          <TaskList />
        </Authenticated>
      </main>
    </div>
  );
}
