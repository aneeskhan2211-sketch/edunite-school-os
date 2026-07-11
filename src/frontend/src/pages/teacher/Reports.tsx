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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTeacherCourses } from "@/hooks/backend/courses";
import {
  useClassReport,
  useGradebookSummary,
  useStudentReport,
} from "@/hooks/backend/gradebook";
import { useStudents } from "@/hooks/backend/students";
import { useRoleStore } from "@/store/roleStore";
import { Link } from "@tanstack/react-router";
import { BarChart2, Download, FileText, Printer } from "lucide-react";
import { useState } from "react";

function exportCSV(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) =>
      r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function triggerPrint() {
  window.print();
}

export default function TeacherReports() {
  const { currentUser } = useRoleStore();
  const { data: courses, isLoading: loadingCourses } = useTeacherCourses(
    currentUser?.id,
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const courseId = selectedCourseId || courses?.[0]?.id || "";

  const [activeTab, setActiveTab] = useState<"class" | "student">("class");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const { data: summary, isLoading: loadingSummary } =
    useGradebookSummary(courseId);
  const { data: students } = useStudents();
  const { data: _classReport } = useClassReport(courseId);
  const { data: studentReport } = useStudentReport(selectedStudentId);

  const course = courses?.find((c) => c.id === courseId);
  const student = students?.find((s) => s.id === selectedStudentId);

  const handleExportClassCSV = () => {
    if (!summary) return;
    const rows = [
      ["Student", "Current Grade", "Letter", "Trend", "Trend Detail"],
      ...summary.studentSummaries.map((s) => {
        const st = students?.find((x) => x.id === s.studentId);
        const name = st ? `${st.firstName} ${st.lastName}` : s.studentId;
        return [
          name,
          String(s.currentGrade),
          s.letterGrade,
          s.trend,
          s.trendDetail ?? "",
        ];
      }),
    ];
    exportCSV(`${course?.shortCode ?? "class"}_report.csv`, rows);
  };

  const handleExportStudentCSV = () => {
    if (!studentReport || !student) return;
    const rows = [
      ["Metric", "Value"],
      ["Student", `${student.firstName} ${student.lastName}`],
      ["Grade Level", String(student.grade)],
      ["GPA", String(student.gpa ?? "—")],
      ["Attendance Rate", `${student.attendanceRate ?? "—"}%`],
      ["Trajectory", student.trajectory ?? "—"],
      ...studentReport.courseSummaries.map((c) => [
        c.courseName,
        `${c.finalGrade}% (${c.letterGrade})`,
      ]),
    ];
    exportCSV(`${student.firstName}_${student.lastName}_report.csv`, rows);
  };

  return (
    <PageLayout width="wide">
      <PageHeader
        title="Reports"
        subtitle="Class summaries and individual student reports"
      />

      {/* Course selector */}
      {loadingCourses ? (
        <SkeletonCard lines={1} className="mb-5 w-64" />
      ) : (
        <div
          className="flex gap-2 mb-5 flex-wrap"
          data-ocid="reports.course_tabs"
        >
          {courses?.map((c, i) => (
            <Button
              key={c.id}
              type="button"
              size="sm"
              variant={courseId === c.id ? "default" : "outline"}
              onClick={() => {
                setSelectedCourseId(c.id);
                setSelectedStudentId("");
              }}
              data-ocid={`reports.course_tab.${i + 1}`}
            >
              {c.name}
            </Button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex gap-1 mb-5 border-b border-border"
        data-ocid="reports.tabs"
      >
        {(["class", "student"] as const).map((tab) => (
          <Button
            key={tab}
            type="button"
            size="sm"
            variant={activeTab === tab ? "default" : "ghost"}
            onClick={() => setActiveTab(tab)}
            data-ocid={`reports.tab.${tab}`}
          >
            {tab === "class" ? "Class Report" : "Student Report"}
          </Button>
        ))}
      </div>

      {activeTab === "class" && (
        <div className="space-y-5">
          {loadingSummary ? (
            <div className="space-y-3">
              <SkeletonCard lines={1} />
              <SkeletonCard lines={1} />
              <SkeletonCard lines={1} />
            </div>
          ) : !summary ? (
            <EmptyState
              icon={BarChart2}
              title="No data for this course"
              description="Grades and assignments will appear here once recorded."
            />
          ) : (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <KPICard
                  label="Students"
                  value={summary.studentSummaries.length}
                />
                <KPICard
                  label="Class Average"
                  value={`${Math.round(
                    summary.studentSummaries.reduce(
                      (a, s) => a + s.currentGrade,
                      0,
                    ) / (summary.studentSummaries.length || 1),
                  )}%`}
                />
                <KPICard
                  label="Thriving"
                  value={
                    summary.studentSummaries.filter((s) => s.trend === "up")
                      .length
                  }
                  trend="up"
                />
                <KPICard
                  label="Needs Attention"
                  value={
                    summary.studentSummaries.filter((s) => s.trend === "down")
                      .length
                  }
                  trend="down"
                />
              </div>

              {/* Distribution */}
              <SectionCard title="Grade Distribution">
                <div className="space-y-2">
                  {["A", "B", "C", "D", "F"].map((letter) => {
                    const count = summary.studentSummaries.filter((s) =>
                      (s.letterGrade ?? "").startsWith(letter),
                    ).length;
                    const pct =
                      summary.studentSummaries.length > 0
                        ? Math.round(
                            (count / summary.studentSummaries.length) * 100,
                          )
                        : 0;
                    return (
                      <div key={letter} className="flex items-center gap-3">
                        <span className="w-6 text-sm font-medium text-foreground">
                          {letter}
                        </span>
                        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-xs text-muted-foreground">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              {/* Student list */}
              <SectionCard title="Student Performance">
                <div className="overflow-hidden rounded-lg border border-border">
                  <Table>
                    <TableHeader className="bg-muted/60">
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="text-right">Grade</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.studentSummaries.map((ss, i) => {
                        const st = students?.find((s) => s.id === ss.studentId);
                        const name = st
                          ? `${st.firstName} ${st.lastName}`
                          : ss.studentId;
                        return (
                          <TableRow
                            key={ss.studentId}
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedStudentId(ss.studentId);
                              setActiveTab("student");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.click();
                            }}
                            data-ocid={`reports.class_student_row.${i + 1}`}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <StudentAvatar name={name} size="sm" />
                                <span className="font-medium text-foreground">
                                  {name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-bold text-foreground">
                              {ss.currentGrade}%
                              <span className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
                                {ss.letterGrade}
                              </span>
                            </TableCell>
                            <TableCell>
                              <TrendIndicator
                                trend={ss.trend}
                                detail={ss.trendDetail}
                              />
                            </TableCell>
                            <TableCell>
                              <StatusBadge
                                variant={
                                  (ss.letterGrade ?? "").startsWith("A")
                                    ? "success"
                                    : (ss.letterGrade ?? "").startsWith("C")
                                      ? "warning"
                                      : "neutral"
                                }
                                label={
                                  (ss.letterGrade ?? "").startsWith("A")
                                    ? "Exceeding"
                                    : (ss.letterGrade ?? "").startsWith("C")
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
                  onClick={handleExportClassCSV}
                  data-ocid="reports.export_csv_button"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={triggerPrint}
                  data-ocid="reports.print_button"
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "student" && (
        <div className="space-y-5">
          {/* Student selector */}
          <div
            className="flex gap-2 flex-wrap"
            data-ocid="reports.student_selector"
          >
            {summary?.studentSummaries.map((ss, i) => {
              const st = students?.find((s) => s.id === ss.studentId);
              const name = st ? `${st.firstName} ${st.lastName}` : ss.studentId;
              return (
                <Button
                  key={ss.studentId}
                  type="button"
                  size="sm"
                  variant={
                    selectedStudentId === ss.studentId ? "default" : "outline"
                  }
                  onClick={() => setSelectedStudentId(ss.studentId)}
                  data-ocid={`reports.student_chip.${i + 1}`}
                >
                  {name}
                </Button>
              );
            })}
          </div>

          {!selectedStudentId ? (
            <EmptyState
              icon={FileText}
              title="Select a student"
              description="Choose a student above to view their individual report."
            />
          ) : !student ? (
            <SkeletonCard lines={4} />
          ) : (
            <>
              {/* Student header */}
              <div className="flex items-center gap-3">
                <StudentAvatar
                  name={`${student.firstName} ${student.lastName}`}
                  size="lg"
                />
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {student.firstName} {student.lastName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Grade {student.grade} • {student.homeroom} • GPA{" "}
                    {student.gpa ?? "—"}
                  </p>
                </div>
                <Link
                  to={`/report-card/${selectedStudentId}` as never}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                  data-ocid="reports.report_card_link"
                >
                  <FileText className="h-4 w-4" aria-hidden /> Report card
                </Link>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <KPICard label="GPA" value={student.gpa ?? "—"} />
                <KPICard
                  label="Attendance"
                  value={`${student.attendanceRate ?? "—"}%`}
                  trend={
                    (student.attendanceRate ?? 100) >= 90
                      ? "up"
                      : (student.attendanceRate ?? 100) < 85
                        ? "down"
                        : "stable"
                  }
                />
                <KPICard
                  label="Trajectory"
                  value={student.trajectory ?? "—"}
                  trend={
                    student.trajectory === "thriving"
                      ? "up"
                      : student.trajectory === "slipping"
                        ? "down"
                        : "stable"
                  }
                />
                <KPICard
                  label="Current Grade"
                  value={`${
                    summary?.studentSummaries.find(
                      (s) => s.studentId === selectedStudentId,
                    )?.currentGrade ?? "—"
                  }%`}
                />
              </div>

              {/* Courses */}
              <SectionCard title="Course Performance">
                {(studentReport?.courseSummaries ?? []).length ? (
                  <div className="space-y-3">
                    {(studentReport?.courseSummaries ?? []).map((c, i) => (
                      <div
                        key={c.courseId}
                        className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                        data-ocid={`reports.student_course.${i + 1}`}
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {c.courseName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.teacherComment}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">
                            {c.finalGrade}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.letterGrade}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No course data available.
                  </p>
                )}
              </SectionCard>

              {/* Special populations */}
              {(student.specialPopulations ?? []).length > 0 && (
                <SectionCard title="Special Populations">
                  <div className="flex flex-wrap gap-2">
                    {student.specialPopulations.map((sp) => (
                      <StatusBadge
                        key={String(sp)}
                        variant="info"
                        label={
                          sp.type === "iep"
                            ? "IEP"
                            : sp.type === "ell"
                              ? `ELL (WIDA ${sp.wida_level ?? "—"})`
                              : sp.type === "gifted"
                                ? "Gifted"
                                : sp.type === "medical_alert"
                                  ? "Medical Alert"
                                  : sp.type
                        }
                      />
                    ))}
                  </div>
                </SectionCard>
              )}

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportStudentCSV}
                  data-ocid="reports.export_student_csv_button"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={triggerPrint}
                  data-ocid="reports.print_student_button"
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </PageLayout>
  );
}
