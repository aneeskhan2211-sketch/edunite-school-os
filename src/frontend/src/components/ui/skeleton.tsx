import { cn } from "@/lib/utils";

interface SkeletonProps extends React.ComponentProps<"div"> {
  rows?: number;
  rowHeight?: string;
}

function Skeleton({ className, rows, rowHeight, ...props }: SkeletonProps) {
  if (rows && rows > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            /* biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows */
            key={i}
            data-slot="skeleton"
            className={cn(
              "bg-accent animate-pulse rounded-md",
              rowHeight ?? "h-10",
              className,
            )}
            {...props}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", rowHeight, className)}
      {...props}
    />
  );
}

export { Skeleton };
