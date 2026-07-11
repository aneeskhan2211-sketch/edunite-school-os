import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWhatNeedsYouToday } from "@/hooks/backend/dashboards";
import { useCommitments } from "@/hooks/backend/pastoral";
import { CheckCircle } from "lucide-react";

const DUE_COMMITMENTS = [
  { id: "c-james", label: "James Wilson follow-up", due: "Tomorrow" },
  { id: "c-maria", label: "Maria Chen parent call", due: "In 2 days" },
];

export default function NeedsAttention() {
  const { data: signals, isLoading: loadingSignals } =
    useWhatNeedsYouToday("counsellor");
  const { data: commitments, isLoading: loadingCommitments } = useCommitments();

  const isLoading = loadingSignals || loadingCommitments;

  const dueSoon = [
    ...DUE_COMMITMENTS,
    ...(commitments ?? [])
      .filter((c) => c.status === "due_soon")
      .map((c) => ({ id: c.id, label: c.description, due: c.dueDate })),
  ];

  return (
    <PageLayout>
      <PageHeader
        title="Needs Attention"
        subtitle="Signals and commitments requiring action today"
      />
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (signals ?? []).length === 0 && dueSoon.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="Your caseload is calm."
          description="No signals or commitments need attention right now."
        />
      ) : (
        <div className="space-y-4">
          {(signals ?? []).length > 0 && (
            <SectionCard title="Signals">
              <ul
                className="divide-y divide-border"
                data-ocid="needs-attention.signals.list"
              >
                {(signals ?? []).map((sig, i) => (
                  <li
                    key={sig.id}
                    className="py-3 flex items-start gap-3"
                    data-ocid={`needs-attention.signals.item.${i + 1}`}
                  >
                    <Badge
                      variant={sig.urgency === "high" ? "danger" : "warning"}
                    >
                      {sig.urgency}
                    </Badge>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm">
                        {sig.headline}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {sig.reason}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
          {dueSoon.length > 0 && (
            <SectionCard title="Commitments Due Soon">
              <ul
                className="divide-y divide-border"
                data-ocid="needs-attention.commitments.list"
              >
                {dueSoon.map((c, i) => (
                  <li
                    key={c.id}
                    className="py-3 flex items-center justify-between gap-3"
                    data-ocid={`needs-attention.commitments.item.${i + 1}`}
                  >
                    <p className="text-sm text-foreground">{c.label}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {c.due}
                    </span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
        </div>
      )}
    </PageLayout>
  );
}
