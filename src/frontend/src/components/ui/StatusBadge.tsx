import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  variant: "success" | "warning" | "danger" | "info" | "neutral";
  label: string;
  className?: string;
}

const variantMap = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  neutral: "bg-muted text-muted-foreground",
};

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantMap[variant],
        className,
      )}
      data-ocid="status.badge"
    >
      {label}
    </span>
  );
}
