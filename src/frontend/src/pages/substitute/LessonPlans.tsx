import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses } from "@/hooks/backend/courses";
import { FileText } from "lucide-react";

const PLAN_NOTES: Record<
  string,
  { objective: string; activities: string[]; materials: string }
> = {
  c1: {
    objective:
      "Complete Unit 2 practice: quadratic functions in standard form.",
    activities: [
      "Warm-up: 5 review problems on board (10 min)",
      "Independent work: worksheet pp. 34–36 (30 min)",
      "Exit ticket: 2 problems at the door",
    ],
    materials:
      "Worksheet packet on desk. Answer key in top drawer. Calculators in cabinet.",
  },
  c2: {
    objective: "Continue trig unit — students work through Unit 1 problem set.",
    activities: [
      "Review homework answers with class (15 min)",
      "Partner activity: Unit Circle practice sheet (25 min)",
      "Class discussion: reflection",
    ],
    materials:
      "Unit Circle handouts on front table. Projector slides on desktop (labeled SUB).",
  },
  c3: {
    objective: "Lab write-up day for Genetics & Heredity.",
    activities: [
      "Brief review of Mendelian crosses (10 min)",
      "Independent lab write-up (35 min)",
      "Collect completed write-ups",
    ],
    materials:
      "Lab instructions posted on classroom wall. Collect papers in tray on desk.",
  },
};

export default function LessonPlans() {
  const { data: courses, isLoading } = useCourses();

  return (
    <PageLayout>
      <PageHeader
        title="Lesson Plans"
        subtitle="Teacher-prepared plans for each class today"
      />
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            /* biome-ignore lint/suspicious/noArrayIndexKey: static skeleton */
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : (courses ?? []).length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No lesson plans"
          description="No classes assigned for today."
        />
      ) : (
        <div className="space-y-4" data-ocid="lesson-plans.list">
          {(courses ?? []).map((course, i) => {
            const plan = PLAN_NOTES[course.id];
            return (
              <SectionCard
                key={course.id}
                title={`Period ${course.period} — ${course.name}`}
                data-ocid={`lesson-plans.item.${i + 1}`}
              >
                {plan ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Objective
                      </p>
                      <p className="text-sm text-foreground">
                        {plan.objective}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Activities
                      </p>
                      <ol className="list-decimal list-inside space-y-1">
                        {plan.activities.map((act) => (
                          <li key={act} className="text-sm text-foreground">
                            {act}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Materials
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {plan.materials}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No lesson plan provided for this class.
                  </p>
                )}
              </SectionCard>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
