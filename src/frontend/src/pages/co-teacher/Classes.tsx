import { PageHeader, PageLayout } from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import { useCourses } from "@/hooks/backend/courses";
import { useRoleStore } from "@/store/roleStore";
import { Users } from "lucide-react";

export default function CoTeacherClasses() {
  const { currentUser } = useRoleStore();
  const { data: courses } = useCourses(currentUser?.id);

  return (
    <PageLayout>
      <PageHeader title="Classes" subtitle="Courses you co-teach this term" />
      {!courses?.length ? (
        <EmptyState icon={Users} title="No classes assigned" />
      ) : (
        <div className="space-y-4" data-ocid="co_classes.list">
          {courses.map((c, i) => (
            <div
              key={c.id}
              className="rounded-xl border border-border bg-card p-5"
              data-ocid={`co_classes.item.${i + 1}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-bold text-foreground">
                  {c.name}
                </h2>
                <Badge variant="neutral">{c.shortCode}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {c.subject} · Period {c.period} · {c.studentIds.length} students
              </p>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
