import { cn } from "@/lib/utils";
import type * as React from "react";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
} as const;

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  return (
    /* biome-ignore lint/a11y/useSemanticElements: role=status is a valid live region */
    <div role="status" aria-label="Loading" {...props}>
      <div
        className={cn(
          "animate-spin rounded-full border-primary border-t-transparent",
          SIZE_CLASSES[size],
          className,
        )}
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
