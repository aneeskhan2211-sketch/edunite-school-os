import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWhatNeedsYouToday } from "@/hooks/backend/dashboards";
import type { SignalUrgency } from "@/types";
import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

const URGENCY_BADGE: Record<
  SignalUrgency,
  "danger" | "warning" | "info" | "neutral"
> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "info",
};

export default function PrincipalNeedsAttention() {
  const { data: signals, isLoading } = useWhatNeedsYouToday("principal");
  const filtered =
    signals?.filter(
      (s) =>
        s.type === "risk" || s.urgency === "high" || s.urgency === "critical",
    ) ?? [];

  return (
    <PageLayout>
      <PageHeader
        title="Needs Attention"
        subtitle="Students and situations surfaced by the connected model"
      />

      {isLoading ? (
        <Skeleton rows={4} rowHeight="h-20" />
      ) : !filtered.length ? (
        <EmptyState
          icon={CheckCircle2}
          title="Nothing needs your attention right now"
          description="That’s a good sign. The model will surface anything worth your attention as it arises."
        />
      ) : (
        <div
          className="space-y-3"
          data-ocid="principal_needs_attention.signals_list"
        >
          {filtered.map((sig, i) => (
            <div
              key={sig.id}
              className="rounded-lg border border-border bg-card p-5"
              data-ocid={`principal_needs_attention.signal.${i + 1}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {sig.headline}
                  </span>
                </div>
                <Badge variant={URGENCY_BADGE[sig.urgency]}>
                  {sig.urgency}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground ml-6">{sig.reason}</p>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
