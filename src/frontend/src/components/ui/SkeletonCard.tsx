import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export function SkeletonCard({ lines = 4, className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border border-border bg-card p-4",
        className,
      )}
      data-ocid="skeleton.card"
    >
      {Array.from({ length: lines }).map((_, lineIdx) => (
        <div
          key={`skeleton-line-${lineIdx}-${lines}`}
          className="skeleton h-4 w-full rounded"
          style={{
            width:
              lineIdx === 0 ? "60%" : lineIdx === lines - 1 ? "40%" : "100%",
          }}
        />
      ))}
    </div>
  );
}
