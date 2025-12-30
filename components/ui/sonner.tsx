"use client";

import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Sonner Toaster Component
 *
 * Replaces deprecated @radix-ui/react-toast (shadcn/ui Toast deprecated Dec 2025)
 * See: https://ui.shadcn.com/docs/components/toast
 *
 * Usage:
 *   import { toast } from "sonner";
 *   toast.success("Task created!");
 *   toast.error("Something went wrong");
 *   toast("Info message");
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
