import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TrendIndicator } from "@/components/ui/TrendIndicator";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCourses } from "@/hooks/backend/courses";
import { useGradebook } from "@/hooks/backend/gradebook";
import { useStudents } from "@/hooks/backend/students";
import { useEffect, useState } from "react";

export default function ParentGrades() {
  const { data: students } = useStudents();
  const { data: grades, isLoading } = useGradebook();
  const { data: courses } = useCourses();
  const [selectedId, setSelectedId] = useState<string>("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const demoChildren = students?.slice(0, 3) ?? [];
  useEffect(() => {
    if (demoChildren.length > 0 && !selectedId)
      setSelectedId(demoChildren[0].id);
  }, [demoChildren, selectedId]);

  const childGrades =
    grades?.filter((g: any) => g?.studentId === selectedId) ?? [];
  const courseMap: Record<string, { grades: any[]; course: any }> = {};
  for (const g of childGrades) {
    if (!courseMap[g.courseId]) {
      courseMap[g.courseId] = {
        grades: [],
        course: courses?.find((c: any) => c.id === g.courseId),
      };
    }
    courseMap[g.courseId].grades.push(g);
  }

  const computeAvg = (gs: any[]) => {
    const nums = gs.map((g: any) => g?.score ?? 0);
    return nums.length > 0
      ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
      : 0;
  };
  const toLetter = (score: number) =>
    score >= 90
      ? "A"
      : score >= 80
        ? "B"
        : score >= 70
          ? "C"
          : score >= 60
            ? "D"
            : "F";
  const overallGpa =
    Object.values(courseMap).length > 0
      ? (
          Object.values(courseMap).reduce(
            (sum, { grades: gs }) => sum + computeAvg(gs),
            0,
          ) /
          Object.values(courseMap).length /
          25
        ).toFixed(1)
      : "3.2";
  const safeOverallGpa = Number(overallGpa ?? "3.2");

  return (
    <PageLayout>
      <PageHeader title="Grades" />
      {isLoading ? (
        <SkeletonCard lines={6} />
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {demoChildren.map((s) => (
              <Button
                type="button"
                key={s.id}
                size="sm"
                variant={selectedId === s.id ? "default" : "outline"}
                onClick={() => setSelectedId(s.id)}
              >
                {s.name}
              </Button>
            ))}
          </div>
          <SectionCard>
            <div className="flex items-center gap-3 p-2">
              <div className="text-3xl font-bold text-coral dark:text-coral-mid">
                {safeOverallGpa.toFixed(1)}
              </div>
              <div>
                <StatusBadge
                  variant="success"
                  label={
                    safeOverallGpa >= 3.5
                      ? "A"
                      : safeOverallGpa >= 3.0
                        ? "B"
                        : "C"
                  }
                />
                <p className="text-xs text-muted-foreground mt-0.5">
                  Overall GPA — this term
                </p>
              </div>
            </div>
          </SectionCard>
          {Object.keys(courseMap).length === 0 ? (
            <EmptyState
              title="No grades yet"
              description="Grades will appear here once teachers post them."
            />
          ) : (
            <SectionCard title="Courses" className="p-3">
              <div className="space-y-0.5">
                {Object.entries(courseMap).map(
                  ([courseId, { grades: gs, course }]) => {
                    const avg = computeAvg(gs);
                    const letter = toLetter(avg);
                    const isOpen = expanded === courseId;
                    return (
                      <div key={courseId}>
                        <button
                          type="button"
                          onClick={() => setExpanded(isOpen ? null : courseId)}
                          className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-sm text-foreground">
                              {course?.name || courseId}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Updated recently
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <TrendIndicator
                              direction={
                                avg >= 80 ? "up" : avg >= 70 ? "steady" : "down"
                              }
                            />
                            <StatusBadge
                              variant={
                                letter === "A"
                                  ? "success"
                                  : letter === "B"
                                    ? "info"
                                    : letter === "C"
                                      ? "warning"
                                      : "danger"
                              }
                              label={letter}
                            />
                            <span className="text-muted-foreground text-xs">
                              {isOpen ? "▲" : "▼"}
                            </span>
                          </div>
                        </button>
                        {isOpen && (
                          <div className="ml-4 mb-2">
                            <Table className="text-sm">
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Assignment</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Weight</TableHead>
                                  <TableHead>Score</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {gs.map((g: any) => (
                                  <TableRow key={g.id}>
                                    <TableCell>
                                      {g?.assignmentName ?? "Assignment"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {g?.dueDate ?? "—"}
                                    </TableCell>
                                    <TableCell>{g?.weight ?? 10}%</TableCell>
                                    <TableCell className="font-medium">
                                      {g?.score ?? avg}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </SectionCard>
          )}
        </div>
      )}
    </PageLayout>
  );
}
