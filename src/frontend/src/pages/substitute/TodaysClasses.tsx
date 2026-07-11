import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses } from "@/hooks/backend/courses";
import { useStudents } from "@/hooks/backend/students";
import { useRoleStore } from "@/store/roleStore";
import { AlertTriangle } from "lucide-react";

const MUST_KNOWS = [
  {
    studentId: "s5",
    type: "Medical Alert",
    detail:
      "Marcus Johnson — carry epinephrine auto-injector. Located in main office. Allergy: peanuts.",
  },
];

export default function TodaysClasses() {
  const { currentUser } = useRoleStore();
  const { data: courses, isLoading: loadingCourses } = useCourses();
  const { data: students, isLoading: loadingStudents } = useStudents();

  const isLoading = loadingCourses || loadingStudents;

  return (
    <PageLayout>
      <PageHeader
        title="Today's Classes"
        subtitle={`Good morning, ${currentUser?.firstName ?? "there"}. Here's your day.`}
      />
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            /* biome-ignore lint/suspicious/noArrayIndexKey: static skeleton */
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className="rounded-xl border border-warning/30 bg-warning/15 p-4"
            data-ocid="todays-classes.must-knows.section"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-warning" aria-hidden />
              <span className="font-semibold text-sm text-foreground">
                Must-Knows
              </span>
            </div>
            {MUST_KNOWS.map((mk) => (
              <p key={mk.studentId} className="text-sm text-foreground">
                <span className="font-medium">{mk.type}:</span> {mk.detail}
              </p>
            ))}
          </div>
          <SectionCard title="Schedule">
            <ul
              className="divide-y divide-border"
              data-ocid="todays-classes.schedule.list"
            >
              {(courses ?? []).map((course, i) => {
                const enrolled = (students ?? []).filter((s) =>
                  course.studentIds.includes(s.id),
                );
                return (
                  <li
                    key={course.id}
                    className="py-4"
                    data-ocid={`todays-classes.item.${i + 1}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground">
                          Period {course.period} — {course.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Room {course.room} · {enrolled.length} students
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {course.subject}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </div>
      )}
    </PageLayout>
  );
}
