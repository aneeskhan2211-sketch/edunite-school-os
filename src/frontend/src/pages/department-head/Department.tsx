import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TrendIndicator } from "@/components/ui/TrendIndicator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses } from "@/hooks/backend/courses";
import { useStaff } from "@/hooks/backend/students";
import { BookOpen } from "lucide-react";
import { useState } from "react";

const GRADES = ["All", "9", "10", "11", "12"];

const GRADE_DISTRIBUTIONS: Record<
  string,
  { a: string; b: string; c: string; d: string; f: string }
> = {
  c1: { a: "w-3/4", b: "w-1/2", c: "w-1/4", d: "w-1/6", f: "w-0" },
  c2: { a: "w-1/2", b: "w-2/3", c: "w-1/3", d: "w-1/6", f: "w-0" },
  c3: { a: "w-2/3", b: "w-1/2", c: "w-1/4", d: "w-0", f: "w-0" },
};

export default function DepartmentHeadDepartment() {
  const { data: courses, isLoading } = useCourses();
  const { data: staff } = useStaff();
  const [gradeFilter, setGradeFilter] = useState("All");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const scienceCourses = courses?.filter((c) => c.subject === "Science") ?? [];

  const filteredCourses =
    gradeFilter === "All"
      ? scienceCourses
      : scienceCourses.filter((c) => String(c.grade) === gradeFilter);

  const getTeacherName = (teacherId: string) => {
    const t = staff?.find((s) => s.id === teacherId);
    return t ? `${t.firstName} ${t.lastName}` : "Unassigned";
  };

  const stats = {
    teachers: 4,
    courses: 11,
    avgGpa: 3.2,
    attendance: 91,
  };

  return (
    <PageLayout width="wide">
      <PageHeader
        title="Department"
        subtitle="Science Department — courses, units, and teacher assignments"
      />

      {/* Stats bar */}
      <div className="flex gap-4 mb-5 flex-wrap">
        {[
          { label: "Teachers", value: stats.teachers },
          { label: "Courses", value: stats.courses },
          { label: "Avg GPA", value: stats.avgGpa },
          { label: "Attendance", value: `${stats.attendance}%` },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-border bg-card px-4 py-2"
          >
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-lg font-bold text-foreground font-display">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Grade filter pills */}
      <div className="flex gap-2 mb-5">
        {GRADES.map((g) => (
          <Button
            type="button"
            key={g}
            size="sm"
            variant={gradeFilter === g ? "default" : "outline"}
            onClick={() => setGradeFilter(g)}
            className="rounded-full"
            data-ocid={`dept_head_department.grade_filter.${g?.toLowerCase() ?? g}`}
          >
            {g === "All" ? "All" : `Grade ${g}`}
          </Button>
        ))}
      </div>

      <SectionCard title="Courses">
        {isLoading ? (
          <Skeleton rows={4} rowHeight="h-14" />
        ) : (
          <div
            className="divide-y divide-border"
            data-ocid="dept_head_department.course_list"
          >
            {filteredCourses.map((c, i) => {
              const dist = GRADE_DISTRIBUTIONS[c.id] ?? {
                a: "w-0",
                b: "w-0",
                c: "w-0",
                d: "w-0",
                f: "w-0",
              };
              const isExpanded = expandedCourse === c.id;
              return (
                <div
                  key={c.id}
                  className="py-4"
                  data-ocid={`dept_head_department.course.${i + 1}`}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setExpandedCourse(isExpanded ? null : c.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-foreground">
                        {c.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          variant="neutral"
                          label={`Gr ${c.grade}`}
                        />
                        <StatusBadge
                          variant="info"
                          label={`${c.studentIds?.length ?? 0} enrolled`}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{getTeacherName(c.teacherId)}</span>
                      <span>·</span>
                      <span>Avg: B+</span>
                      <TrendIndicator direction="up" value="2" />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Grade distribution
                      </p>
                      <div className="space-y-1.5">
                        {[
                          { label: "A", width: dist.a, color: "bg-success" },
                          { label: "B", width: dist.b, color: "bg-info" },
                          { label: "C", width: dist.c, color: "bg-warning" },
                          { label: "D", width: dist.d, color: "bg-warning" },
                          {
                            label: "F",
                            width: dist.f,
                            color: "bg-destructive",
                          },
                        ].map((bar) => (
                          <div
                            key={bar.label}
                            className="flex items-center gap-2"
                          >
                            <span className="text-xs text-muted-foreground w-3">
                              {bar.label}
                            </span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${bar.color} ${bar.width} rounded-full`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </PageLayout>
  );
}
