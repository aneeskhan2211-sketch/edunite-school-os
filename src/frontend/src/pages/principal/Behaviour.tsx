import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useIncidents } from "@/hooks/backend/pastoral";
import type { IncidentSeverity, IncidentStatus } from "@/types";
import { ChevronDown, ChevronUp, ShieldAlert } from "lucide-react";
import { useState } from "react";

const SEV_BADGE: Record<
  IncidentSeverity,
  "danger" | "warning" | "info" | "neutral"
> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "info",
};

const STATUS_BADGE: Record<
  IncidentStatus,
  "danger" | "warning" | "info" | "neutral" | "success"
> = {
  logged: "warning",
  routed: "info",
  under_review: "warning",
  follow_up: "warning",
  closed: "success",
};

export default function PrincipalBehaviour() {
  const { data: incidents, isLoading } = useIncidents();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | "all">(
    "all",
  );
  const [filterSev, setFilterSev] = useState<IncidentSeverity | "all">("all");

  const filtered =
    incidents?.filter((inc) => {
      const statusOk = filterStatus === "all" || inc.status === filterStatus;
      const sevOk = filterSev === "all" || inc.severity === filterSev;
      return statusOk && sevOk;
    }) ?? [];

  return (
    <PageLayout>
      <PageHeader
        title="Behaviour"
        subtitle="All incidents across Lincoln High — sorted by severity"
      />

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <Select
          value={filterStatus}
          onValueChange={(val) =>
            setFilterStatus(val as IncidentStatus | "all")
          }
        >
          <SelectTrigger data-ocid="principal_behaviour.status_filter">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(
              [
                "logged",
                "routed",
                "under_review",
                "follow_up",
                "closed",
              ] as IncidentStatus[]
            ).map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterSev}
          onValueChange={(val) => setFilterSev(val as IncidentSeverity | "all")}
        >
          <SelectTrigger data-ocid="principal_behaviour.severity_filter">
            <SelectValue placeholder="All Severities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            {(["low", "medium", "high", "critical"] as IncidentSeverity[]).map(
              (s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton rows={3} rowHeight="h-20" />
      ) : !filtered.length ? (
        <EmptyState
          icon={ShieldAlert}
          title="No incidents"
          description="No incidents match the current filters."
        />
      ) : (
        <div
          className="space-y-3"
          data-ocid="principal_behaviour.incident_list"
        >
          {filtered.map((inc, i) => (
            <a
              key={inc.id}
              href={`/incidents/${inc.id}`}
              className="block rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
              data-ocid={`principal_behaviour.incident.${i + 1}`}
            >
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 text-left min-h-[44px]"
                onClick={() => setExpanded(expanded === inc.id ? null : inc.id)}
                aria-expanded={expanded === inc.id}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ShieldAlert
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {inc.description}
                    </p>
                    <p className="text-xs text-muted-foreground">{inc.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  <Badge variant={SEV_BADGE[inc.severity]}>
                    {inc.severity}
                  </Badge>
                  <Badge variant={STATUS_BADGE[inc.status]}>
                    {inc.status.replace("_", " ")}
                  </Badge>
                  {expanded === inc.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
              {expanded === inc.id && (
                <div className="px-4 pb-4 border-t border-border pt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Timeline
                  </p>
                  <div className="space-y-2">
                    {inc.timeline?.map((entry, j) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: static timeline list
                      <div key={j} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div>
                          <p className="text-xs text-foreground">
                            {entry.status?.replace("_", " ") ?? ""} ·{" "}
                            {entry.actor ?? ""}
                          </p>
                          {entry.note && (
                            <p className="text-xs text-muted-foreground">
                              {entry.note}
                            </p>
                          )}
                          <p className="text-[11px] text-muted-foreground">
                            {entry.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
