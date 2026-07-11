import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { TrendIndicator } from "@/components/ui/TrendIndicator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses } from "@/hooks/backend/courses";
import { useStaff } from "@/hooks/backend/students";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export default function DepartmentHeadTeachers() {
  const { data: staff, isLoading } = useStaff();
  const { data: courses } = useCourses();
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);

  const scienceTeachers =
    staff?.filter((s) => s.department?.toLowerCase() === "science") ?? [];

  const getTeacherCourses = (teacherId: string) =>
    courses?.filter((c) => c.teacherId === teacherId).slice(0, 3) ?? [];

  return (
    <PageLayout>
      <PageHeader
        title="Teachers"
        subtitle="Science department teacher overview"
      />

      <SectionCard title="Department Teachers">
        {isLoading ? (
          <Skeleton rows={3} rowHeight="h-20" />
        ) : (
          <div
            className="divide-y divide-border"
            data-ocid="dept_head_teachers.teacher_list"
          >
            {scienceTeachers.map((teacher, i) => {
              const teacherCourses = getTeacherCourses(teacher.id);
              const isExpanded = expandedTeacher === teacher.id;
              const name = `${teacher.firstName} ${teacher.lastName}`;
              return (
                <div
                  key={teacher.id}
                  className="py-4"
                  data-ocid={`dept_head_teachers.teacher.${i + 1}`}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() =>
                      setExpandedTeacher(isExpanded ? null : teacher.id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <StudentAvatar name={name} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {teacherCourses.length} course
                            {teacherCourses.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          variant="neutral"
                          label={teacher.roles?.[0] ?? "Teacher"}
                        />
                        <a
                          href="/department-head/messages"
                          className="text-coral hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Message
                        </a>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 ml-11 space-y-2">
                      {teacherCourses.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-foreground">{c.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {c.studentIds?.length ?? 0} enrolled
                            </span>
                            <TrendIndicator direction="up" value="1" />
                          </div>
                        </div>
                      ))}
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
