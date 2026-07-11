import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useStudentGradesNew } from "@/hooks/backend/gradebook";
import { useRoleStore } from "@/store/roleStore";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

function letterGrade(pct: number) {
  if (pct >= 93) return { letter: "A", variant: "success" };
  if (pct >= 90) return { letter: "A-", variant: "success" };
  if (pct >= 87) return { letter: "B+", variant: "info" };
  if (pct >= 83) return { letter: "B", variant: "info" };
  if (pct >= 80) return { letter: "B-", variant: "info" };
  if (pct >= 77) return { letter: "C+", variant: "warning" };
  if (pct >= 73) return { letter: "C", variant: "warning" };
  if (pct >= 70) return { letter: "C-", variant: "warning" };
  return { letter: "D/F", variant: "danger" };
}

const VARIANT_CLASSES: Record<string, string> = {
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/10 text-destructive",
};

export default function StudentGrades() {
  const { currentUser } = useRoleStore();
  const { data: gradeData, isLoading } = useStudentGradesNew(
    currentUser?.id ?? "",
  );
  const [selectedTerm, setSelectedTerm] = useState("spring-2026");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const gpa = gradeData?.gpa ?? 0;
  const safeGpa = Number.isFinite(gpa) ? gpa : 0;
  const gpaLetter = gradeData?.letterGrade ?? "N/A";
  const courses = gradeData?.courses ?? [];

  return (
    <PageLayout>
      <PageHeader title="Grades" />
      {isLoading ? (
        <div className="space-y-4">
          <div className="animate-pulse bg-muted h-24 rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-muted h-40 rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <SectionCard className="p-4 mb-4 flex items-center gap-6">
            <div>
              <div className="text-xs text-foreground/60 uppercase tracking-wide mb-0.5">
                Your GPA
              </div>
              <div className="text-4xl font-bold">{safeGpa.toFixed(1)}</div>
            </div>
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full ${VARIANT_CLASSES[safeGpa >= 3.5 ? "success" : safeGpa >= 2.5 ? "info" : safeGpa >= 1.5 ? "warning" : "danger"]}`}
            >
              {gpaLetter}
            </span>
            <div className="ml-auto">
              <div className="flex gap-1">
                {["fall-2025", "spring-2026"].map((t) => (
                  <Button
                    type="button"
                    key={t}
                    size="sm"
                    variant={selectedTerm === t ? "default" : "outline"}
                    onClick={() => setSelectedTerm(t)}
                  >
                    {t === "fall-2025" ? "Fall 2025" : "Spring 2026"}
                  </Button>
                ))}
              </div>
            </div>
          </SectionCard>
          {courses.length === 0 && (
            <div className="text-center py-12 text-foreground/50">
              No grades recorded yet
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c: any) => {
              const gradeVal = Number.isFinite(c.grade) ? c.grade : 0;
              const { letter, variant } = letterGrade(gradeVal);
              const trend: number[] =
                Array.isArray(c.trend) && c.trend.length > 0
                  ? c.trend
                  : [c.grade - 3, c.grade - 1, c.grade];
              const maxT = trend.length > 0 ? Math.max(...trend) : 1;
              const trendUp = trend.length > 2 ? trend[2] > trend[0] : false;
              const trendFlat =
                trend.length > 2 ? Math.abs(trend[2] - trend[0]) <= 1 : true;
              const barColor = trendUp
                ? "bg-success"
                : trendFlat
                  ? "bg-warning"
                  : "bg-destructive";
              return (
                <SectionCard key={c.courseId} className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-base">
                      {c.courseName}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${VARIANT_CLASSES[variant]}`}
                    >
                      {letter}
                    </span>
                  </div>
                  <div className="text-3xl font-bold mb-2">{gradeVal}%</div>
                  <div className="flex items-end gap-1 h-8 mb-2">
                    {trend.map((v) => {
                      const h = Math.max(8, Math.round((v / maxT) * 32));
                      return (
                        <div
                          key={`trend-val-${v}`}
                          className={`w-3 rounded-sm ${barColor}`}
                          style={{ height: h }}
                        />
                      );
                    })}
                  </div>
                  <div className="text-xs text-foreground/50 mb-2">
                    {c.assignmentCount ?? 0} assignments graded
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() =>
                      setExpandedCourse(
                        expandedCourse === c.courseId ? null : c.courseId,
                      )
                    }
                    className="gap-1 px-0 text-xs"
                  >
                    {expandedCourse === c.courseId ? (
                      <>
                        <ChevronDown className="h-3 w-3" /> Hide assignments
                      </>
                    ) : (
                      <>
                        <ChevronRight className="h-3 w-3" /> View assignments
                      </>
                    )}
                  </Button>
                  {expandedCourse === c.courseId && (
                    <div className="mt-2 border-t border-border pt-2 space-y-1">
                      {[
                        { name: "Midterm Exam", earned: 82, total: 100 },
                        { name: "Quiz 1", earned: 41, total: 50 },
                        { name: "Homework", earned: 18, total: 20 },
                      ].map((a) => (
                        <div
                          key={a.name}
                          className="flex items-center justify-between text-xs text-foreground/70"
                        >
                          <span>{a.name}</span>
                          <span>
                            {a.earned}/{a.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              );
            })}
          </div>
        </>
      )}
    </PageLayout>
  );
}
