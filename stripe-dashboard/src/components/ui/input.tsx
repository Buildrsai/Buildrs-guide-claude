import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-8 w-full rounded-sm border border-border bg-white px-2.5 text-[14px] text-on-surface placeholder:text-muted/70 shadow-card transition-colors focus:border-primary-60 focus:outline-2 focus:outline-offset-0 focus:outline-primary-70/40 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("label-sm block text-muted mb-1", className)}
      {...props}
    />
  );
}

export function NativeSelect({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-8 w-full appearance-none rounded-sm border border-border bg-white px-2.5 text-[14px] text-on-surface shadow-card transition-colors focus:border-primary-60 focus:outline-2 focus:outline-offset-0 focus:outline-primary-70/40 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
