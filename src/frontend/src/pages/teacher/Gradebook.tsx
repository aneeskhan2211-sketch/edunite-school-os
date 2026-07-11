import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { KPICard } from "@/components/ui/KPICard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { TrendIndicator } from "@/components/ui/TrendIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTeacherCourses } from "@/hooks/backend/courses";
import { useGradebookSummary, useSaveGrade } from "@/hooks/backend/gradebook";
import { useStudents } from "@/hooks/backend/students";
import { useRoleStore } from "@/store/roleStore";
import { AlertTriangle, BookOpen } from "lucide-react";
import { useCallback, useRef, useState } from "react";

type InlineGradeCellProps = {
  value: number;
  studentId: string;
  assignmentId: string;
  courseId: string;
};

function InlineGradeCell({
  value,
  studentId,
  assignmentId,
  courseId,
}: InlineGradeCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const saveGrade = useSaveGrade();
  const originalValue = useRef(value);

  const commit = useCallback(() => {
    const num = Number(draft);
    if (Number.isNaN(num) || draft.trim() === "") {
      setSaveState("error");
      setDraft(String(originalValue.current));
      setTimeout(() => setSaveState("idle"), 1500);
      setEditing(false);
      return;
    }
    if (num === originalValue.current) {
      setEditing(false);
      return;
    }
    setSaveState("saving");
    saveGrade.mutate(
      {
        studentId,
        courseId,
        assignmentId,
        score: num,
        weight: 0,
        category: "",
      },
      {
        onSuccess: () => {
          originalValue.current = num;
          setSaveState("success");
          setTimeout(() => setSaveState("idle"), 1500);
        },
        onError: () => {
          setDraft(String(originalValue.current));
          setSaveState("error");
          setTimeout(() => setSaveState("idle"), 1500);
        },
      },
    );
    setEditing(false);
  }, [draft, studentId, courseId, assignmentId, saveGrade]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      setDraft(String(originalValue.current));
      setEditing(false);
      setSaveState("idle");
    }
  };

  const handleBlur = () => {
    commit();
  };

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <Input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-16 text-right font-mono"
          data-ocid="gradebook.inline_input"
        />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          setEditing(true);
          setDraft(String(originalValue.current));
          setSaveState("idle");
        }}
        className="w-16 text-right font-mono"
        data-ocid="gradebook.inline_grade_button"
      >
        {originalValue.current}%
      </Button>
      {saveState === "saving" && (
        <span className="text-xs text-muted-foreground">Saving…</span>
      )}
      {saveState === "success" && (
        <span className="text-xs text-success">✓</span>
      )}
      {saveState === "error" && (
        <span className="text-xs text-destructive">!</span>
      )}
    </span>
  );
}

export default function TeacherGradebook() {
  const { currentUser } = useRoleStore();
  const { data: courses, isLoading: loadingCourses } = useTeacherCourses(
    currentUser?.id,
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const courseId = selectedCourseId || courses?.[0]?.id || "";
  const { data: summary, isLoading: loadingSummary } =
    useGradebookSummary(courseId);
  const { data: students } = useStudents();

  const getStudent = (id: string) => students?.find((s) => s.id === id);

  return (
    <PageLayout width="wide">
      <PageHeader
        title="Gradebook"
        subtitle="Weighted averages and trajectory at a glance"
      />

      {/* Course selector */}
      {loadingCourses ? (
        <SkeletonCard lines={1} className="mb-5 w-64" />
      ) : (
        <div
          className="flex gap-2 mb-5 flex-wrap"
          data-ocid="gradebook.course_tabs"
        >
          {courses?.map((c, i) => (
            <Button
              key={c.id}
              type="button"
              size="sm"
              variant={courseId === c.id ? "default" : "outline"}
              onClick={() => setSelectedCourseId(c.id)}
              data-ocid={`gradebook.course_tab.${i + 1}`}
            >
              {c.name}
            </Button>
          ))}
        </div>
      )}

      {loadingSummary ? (
        <div className="space-y-3">
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
        </div>
      ) : !summary ? (
        <EmptyState
          icon={BookOpen}
          title="No assignments yet"
          description="Create assignments from the Curriculum page."
        />
      ) : (
        <div className="space-y-5">
          {/* Overload banner */}
          {summary.overloaded ? (
            <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/15 p-4">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
              <p className="text-sm font-medium text-warning">
                Assessment overload this week — consider staggering due dates.
              </p>
            </div>
          ) : null}

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KPICard
              label="Students"
              value={(summary.studentSummaries ?? []).length}
            />
            <KPICard
              label="Class Average"
              value={`${Math.round((summary.studentSummaries ?? []).reduce((a, s) => a + (s.currentGrade ?? 0), 0) / ((summary.studentSummaries ?? []).length || 1))}%`}
            />
            <KPICard
              label="Thriving"
              value={
                (summary.studentSummaries ?? []).filter((s) => s.trend === "up")
                  .length
              }
              trend="up"
            />
            <KPICard
              label="Needs Attention"
              value={
                (summary.studentSummaries ?? []).filter(
                  (s) => s.trend === "down",
                ).length
              }
              trend="down"
            />
          </div>

          {/* Grade table */}
          <SectionCard title="Student Grades">
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Last Grade</TableHead>
                    <TableHead>Weighted Average</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody data-ocid="gradebook.student_rows">
                  {summary.studentSummaries.map((ss, i) => {
                    const student = getStudent(ss.studentId);
                    const name = student
                      ? `${student.firstName} ${student.lastName}`
                      : ss.studentId;
                    return (
                      <TableRow
                        key={ss.studentId}
                        data-ocid={`gradebook.student_row.${i + 1}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StudentAvatar name={name} size="sm" />
                            <span className="font-medium text-foreground">
                              {name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          <InlineGradeCell
                            value={ss.currentGrade}
                            studentId={ss.studentId}
                            assignmentId="current"
                            courseId={courseId}
                          />
                          <span className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
                            {ss.letterGrade ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-foreground">
                          {ss.currentGrade}%
                        </TableCell>
                        <TableCell>
                          <TrendIndicator trend={ss.trend} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            variant={
                              ss.letterGrade.startsWith("A")
                                ? "success"
                                : ss.letterGrade.startsWith("C")
                                  ? "warning"
                                  : "neutral"
                            }
                            label={
                              ss.letterGrade.startsWith("A")
                                ? "Exceeding"
                                : ss.letterGrade.startsWith("C")
                                  ? "Approaching"
                                  : "Meeting"
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </SectionCard>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              data-ocid="gradebook.export_button"
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              data-ocid="gradebook.report_card_button"
            >
              Generate Report Cards
            </Button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
