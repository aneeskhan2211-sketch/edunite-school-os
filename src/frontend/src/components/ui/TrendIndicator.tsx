import { cn } from "@/lib/utils";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

export interface TrendIndicatorProps {
  trend?: "up" | "down" | "stable";
  direction?: "up" | "down" | "steady";
  value?: string;
  detail?: string;
  className?: string;
}

export function TrendIndicator({
  trend,
  direction,
  value,
  detail,
  className,
}: TrendIndicatorProps) {
  const effectiveTrend = direction ?? trend ?? "stable";
  const config = {
    up: {
      Icon: TrendingUp,
      color: "text-success",
      label: value ?? "Improving",
    },
    down: {
      Icon: TrendingDown,
      color: "text-destructive",
      label: value ?? "Declining",
    },
    stable: {
      Icon: Minus,
      color: "text-muted-foreground",
      label: value ?? "Stable",
    },
    steady: {
      Icon: Minus,
      color: "text-muted-foreground",
      label: value ?? "Steady",
    },
  }[effectiveTrend];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        config.color,
        className,
      )}
    >
      <config.Icon className="h-3.5 w-3.5" aria-hidden />
      <span>{detail ?? config.label}</span>
    </span>
  );
}
