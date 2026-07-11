import { Badge } from "@/components/ui/badge";
import type { CommitmentStatus, IncidentStatus } from "@/types";

type Status = IncidentStatus | CommitmentStatus;

const STATUS_CONFIG: Record<
  Status,
  {
    label: string;
    variant: "success" | "warning" | "danger" | "info" | "neutral";
  }
> = {
  logged: { label: "Logged", variant: "info" },
  routed: { label: "Routed", variant: "warning" },
  under_review: { label: "Under Review", variant: "warning" },
  follow_up: { label: "Follow-up", variant: "warning" },
  closed: { label: "Closed", variant: "success" },
  pending: { label: "Pending", variant: "neutral" },
  due_soon: { label: "Due Soon", variant: "warning" },
  overdue: { label: "Overdue", variant: "danger" },
  completed: { label: "Completed", variant: "success" },
};

export function StatusIndicator({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
