"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { PASSWORD_REQUIREMENTS, getPasswordHelpText } from "@/lib/constants";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");

  const handleOAuthSignIn = async (provider: "github") => {
    setIsLoading(true);
    try {
      await signIn(provider);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Sign in failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("flow", mode);

    try {
      await signIn("password", formData);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "signIn" ? "Sign In" : "Sign Up"}</CardTitle>
        <CardDescription>
          {mode === "signIn"
            ? "Sign in to your account"
            : "Create a new account"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* OAuth Providers */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthSignIn("github")}
          disabled={isLoading}
        >
          Continue with GitHub
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              disabled={isLoading}
              minLength={PASSWORD_REQUIREMENTS.minLength}
            />
            {mode === "signUp" && (
              <p className="text-xs text-muted-foreground">
                {getPasswordHelpText()}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? "Loading..."
              : mode === "signIn"
                ? "Sign In"
                : "Sign Up"}
          </Button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center text-sm">
          {mode === "signIn" ? (
            <p>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signUp")}
                className="underline font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                disabled={isLoading}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signIn")}
                className="underline font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                disabled={isLoading}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
