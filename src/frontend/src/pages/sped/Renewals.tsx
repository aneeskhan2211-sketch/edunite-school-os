import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommitments } from "@/hooks/backend/pastoral";
import { useStudents } from "@/hooks/backend/students";
import { CheckCircle } from "lucide-react";

function daysUntil(date: string | undefined) {
  if (!date) return 0;
  const parsed = new Date(date).getTime();
  if (Number.isNaN(parsed)) return 0;
  return Math.ceil((parsed - Date.now()) / 86_400_000);
}

function nextStep(days: number): string {
  if (days < 0) return "Overdue — contact administrator immediately";
  if (days <= 5) return "Draft meeting agenda today";
  if (days <= 14) return "Draft meeting agenda";
  if (days <= 30) return "Schedule IEP meeting";
  return "Monitor — meeting window opens soon";
}

export default function Renewals() {
  const { data: commitments, isLoading: loadingCommitments } = useCommitments();
  const { data: students, isLoading: loadingStudents } = useStudents();

  const renewals = (commitments ?? [])
    .filter((c) => c?.type === "iep_renewal")
    .sort((a, b) => {
      const aTime = a?.dueDate ? new Date(a.dueDate).getTime() : 0;
      const bTime = b?.dueDate ? new Date(b.dueDate).getTime() : 0;
      return aTime - bTime;
    });

  const studentName = (id: string) => {
    const s = (students ?? []).find((s) => s?.id === id);
    return s ? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || id : id;
  };

  const isLoading = loadingCommitments || loadingStudents;

  // Add Alex Thompson as the prominent demo case
  const demoRenewals =
    renewals.length > 0
      ? renewals
      : [
          {
            id: "demo-r1",
            studentId: "s2",
            dueDate: new Date(Date.now() + 12 * 86_400_000)
              .toISOString()
              .slice(0, 10),
            description: "IEP annual renewal",
            type: "iep_renewal" as const,
            ownerId: "staff-8",
            status: "due_soon" as const,
          },
        ];

  return (
    <PageLayout>
      <PageHeader
        title="IEP Renewals"
        subtitle="Urgency-ordered renewals with contextual next steps"
      />
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            /* biome-ignore lint/suspicious/noArrayIndexKey: static skeleton */
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : demoRenewals.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="No renewals due in 60 days"
          description="All IEPs are current."
        />
      ) : (
        <SectionCard>
          <ul className="divide-y divide-border" data-ocid="renewals.list">
            {demoRenewals.map((renewal, i) => {
              const days = daysUntil(
                renewal?.dueDate ??
                  (new Date().toISOString().slice(0, 10) as string),
              );
              const variant =
                days < 0
                  ? "danger"
                  : days <= 14
                    ? "danger"
                    : days <= 30
                      ? "warning"
                      : "success";
              return (
                <li
                  key={renewal.id}
                  className="py-4"
                  data-ocid={`renewals.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {studentName(renewal?.studentId ?? "")}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Renewal due in {days} days — {nextStep(days) ?? ""}
                      </p>
                    </div>
                    <Badge variant={variant}>
                      {days < 0 ? "Overdue" : `${days}d`}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      )}
    </PageLayout>
  );
}
