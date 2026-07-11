import { cn } from "@/lib/utils";
import type * as React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  rowHeight?: string;
}

export function Skeleton({
  className,
  rows,
  rowHeight = "h-4",
  ...props
}: SkeletonProps) {
  if (rows) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            /* biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows */
            key={i}
            className={cn(
              "animate-pulse rounded-md bg-muted",
              rowHeight,
              i === rows - 1 ? "w-3/4" : "w-full",
            )}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}
