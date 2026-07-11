import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { TrendIndicator } from "@/components/ui/TrendIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTeacherCourses } from "@/hooks/backend/courses";
import { useStudents } from "@/hooks/backend/students";
import { useRoleStore } from "@/store/roleStore";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { useState } from "react";

export default function TeacherClasses() {
  const navigate = useNavigate();
  const { currentUser } = useRoleStore();
  const { data: courses, isLoading } = useTeacherCourses(currentUser?.id);
  const { data: students } = useStudents();
  const getStudent = (id: string) => students?.find((s) => s.id === id);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedCourseId((prev) => (prev === id ? null : id));
  };

  return (
    <PageLayout>
      <PageHeader
        title="My Classes"
        subtitle="Courses assigned to you this term"
      />

      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
        </div>
      ) : !courses?.length ? (
        <EmptyState
          icon={Users}
          title="No classes assigned"
          description="Contact your school admin to assign classes."
        />
      ) : (
        <div className="space-y-4" data-ocid="classes.list">
          {courses.map((c, i) => {
            const isExpanded = expandedCourseId === c.id;
            return (
              <SectionCard key={c.id}>
                <div className="flex items-start justify-between">
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => toggle(c.id)}
                    data-ocid={`classes.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-base font-bold text-foreground">
                        {c.name}
                      </h2>
                      <Badge variant="neutral">{c.shortCode}</Badge>
                      <Badge variant="info">Grade {c.grade}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {c.subject} · Period {c.period ?? "—"} · Room{" "}
                      {c.room ?? "—"} · {c.studentIds.length} students
                    </p>
                  </button>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate({ to: `/teacher/classes/${c.id}` as never })
                      }
                      data-ocid={`classes.view_detail.${i + 1}`}
                    >
                      View
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                      onClick={() => toggle(c.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 border-t border-border pt-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Student Roster
                    </h3>
                    <div className="space-y-2">
                      {c.studentIds.map((sid) => {
                        const s = getStudent(sid);
                        if (!s) return null;
                        return (
                          <div
                            key={sid}
                            className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
                          >
                            <div className="flex items-center gap-3">
                              <StudentAvatar
                                name={`${s.firstName} ${s.lastName}`}
                                size="sm"
                              />
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {s.firstName} {s.lastName}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge
                                    variant="neutral"
                                    className="text-[10px]"
                                  >
                                    Grade {s.grade}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {s.attendanceRate ?? "—"}% attendance
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <TrendIndicator
                                trend={
                                  s.trajectory === "thriving"
                                    ? "up"
                                    : s.trajectory === "slipping"
                                      ? "down"
                                      : "stable"
                                }
                              />
                              <a
                                href={`/teacher/student/${s.id}`}
                                className="text-coral hover:underline"
                                data-ocid={`classes.view_profile.${sid}`}
                              >
                                View profile
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </SectionCard>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
