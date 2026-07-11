import { cn } from "@/lib/utils";
import { TrendIndicator } from "./TrendIndicator";

export interface KPICardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "stable";
  trendDetail?: string;
  delta?: string;
  className?: string;
}

export function KPICard({
  label,
  value,
  trend,
  trendDetail,
  delta,
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 flex flex-col gap-1",
        className,
      )}
    >
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className="text-3xl font-bold text-foreground font-display">
        {value}
      </span>
      <div className="flex items-center gap-2">
        {trend ? <TrendIndicator trend={trend} detail={trendDetail} /> : null}
        {delta ? (
          <span className="text-xs text-muted-foreground">{delta}</span>
        ) : null}
      </div>
    </div>
  );
}
