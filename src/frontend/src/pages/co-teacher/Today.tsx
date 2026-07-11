import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses } from "@/hooks/backend/courses";
import { useWhatNeedsYouToday } from "@/hooks/backend/dashboards";
import { useRoleStore } from "@/store/roleStore";
import { CalendarDays, CheckCircle2 } from "lucide-react";

export default function CoTeacherToday() {
  const { currentUser } = useRoleStore();
  const { data: signals, isLoading } = useWhatNeedsYouToday(
    currentUser?.roles?.[0] ?? "coTeacher",
  );
  const { data: courses } = useCourses(currentUser?.id);

  return (
    <PageLayout>
      <PageHeader
        title={`Good morning, ${currentUser?.firstName ?? "Co-Teacher"}`}
        subtitle="Where your contribution is needed today"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Where Contribution Needed">
          {isLoading ? (
            <Skeleton rows={3} rowHeight="h-12" />
          ) : !signals?.length ? (
            <EmptyState
              icon={CheckCircle2}
              title="Nothing needs you right now"
              description="All contributions are up to date."
            />
          ) : (
            <div className="space-y-3">
              {(signals ?? []).slice(0, 3).map((s, i) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-border bg-background p-3"
                  data-ocid={`co_teacher_today.signal.${i + 1}`}
                >
                  <p className="text-sm font-medium text-foreground">
                    {s?.headline ?? ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {s?.reason ?? ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
        <SectionCard title="Assigned Classes">
          {!courses?.length ? (
            <EmptyState icon={CalendarDays} title="No classes assigned" />
          ) : (
            <div
              className="space-y-2"
              data-ocid="co_teacher_today.classes_list"
            >
              {courses.map((c, i) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center py-2 border-b border-border last:border-0"
                  data-ocid={`co_teacher_today.class.${i + 1}`}
                >
                  <span className="text-sm font-medium">{c.name}</span>
                  <Badge variant="neutral">
                    {(c?.studentIds ?? []).length} students
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </PageLayout>
  );
}
