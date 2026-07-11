import { StudentProfileSkeleton } from "@/components/PageSkeletons";
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
import { useAttendancePattern } from "@/hooks/backend/attendance";
import { DEMO_STAFF } from "@/hooks/backend/demo-data";
import {
  useCommitments,
  useIncidents,
  useUnderstandingSignals,
} from "@/hooks/backend/pastoral";
import { useStudent } from "@/hooks/backend/students";
import { useMergedStudentGrades } from "@/hooks/useMergedStudentGrades";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  Minus,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import React from "react";

type TabKey =
  | "overview"
  | "grades"
  | "attendance"
  | "behaviour"
  | "commitments"
  | "timeline";

const TAB_ITEMS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: User },
  { key: "grades", label: "Grades", icon: GraduationCap },
  { key: "attendance", label: "Attendance", icon: Calendar },
  { key: "behaviour", label: "Behaviour", icon: ClipboardList },
  { key: "commitments", label: "Commitments", icon: FileText },
  { key: "timeline", label: "Timeline", icon: Clock },
];

function getTrajectoryVariant(
  t?: "thriving" | "steady" | "coasting" | "slipping",
): "success" | "warning" | "danger" | "neutral" {
  switch (t) {
    case "thriving":
      return "success";
    case "slipping":
      return "danger";
    case "coasting":
      return "warning";
    default:
      return "neutral";
  }
}

function getTrajectoryLabel(
  t?: "thriving" | "steady" | "coasting" | "slipping",
): string {
  switch (t) {
    case "thriving":
      return "Thriving";
    case "slipping":
      return "Slipping";
    case "coasting":
      return "Coasting";
    default:
      return "Steady";
  }
}

function getAttendanceVariant(rate: number): "success" | "warning" | "danger" {
  if (rate >= 95) return "success";
  if (rate >= 85) return "warning";
  return "danger";
}

export default function StudentProfilePage() {
  const { studentId } = useParams({
    from: "/teacher/student/$studentId" as any,
  });
  const [activeTab, setActiveTab] = React.useState<TabKey>("overview");

  const studentQuery = useStudent(studentId);
  const { grades: mergedGrades, isLoading: gradesLoading } =
    useMergedStudentGrades(studentId);
  const attendanceQuery = useAttendancePattern(studentId);
  const incidentsQuery = useIncidents(studentId);
  const commitmentsQuery = useCommitments();
  const signalsQuery = useUnderstandingSignals();

  const isLoading =
    studentQuery.isLoading ||
    gradesLoading ||
    attendanceQuery.isLoading ||
    incidentsQuery.isLoading ||
    commitmentsQuery.isLoading;

  const student = studentQuery.data;
  const grades = mergedGrades ?? [];
  const attendance = attendanceQuery.data;
  const incidents = incidentsQuery.data ?? [];
  const commitments =
    commitmentsQuery.data?.filter((c) => c.studentId === studentId) ?? [];
  const signals =
    signalsQuery.data?.filter((s) => s.studentId === studentId) ?? [];

  if (isLoading) {
    return (
      <PageLayout width="wide">
        <PageHeader title="Student Profile" />
        <StudentProfileSkeleton />
      </PageLayout>
    );
  }

  if (!student) {
    return (
      <PageLayout width="wide">
        <PageHeader title="Student Profile" />
        <EmptyState
          icon={User}
          title="Student not found"
          description="We couldn't find a student with that ID."
        />
      </PageLayout>
    );
  }

  const fullName = `${student.firstName} ${student.lastName}`;
  const counsellor = DEMO_STAFF.find((st) => st.id === student.counsellorId);
  // Use the real computed attendance pattern for the KPI so it matches the
  // pattern shown below (avoids the demo vs real mismatch, e.g. 78% vs 75%).
  const attendanceRate =
    attendance?.attendanceRate ?? student.attendanceRate ?? 0;

  const computeGpa = (grades: any[]) => {
    if (!grades.length) return student.gpa;
    const map: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };
    const total = grades.reduce(
      (sum, g) => sum + (map[g.letterGrade?.toUpperCase()] ?? 0),
      0,
    );
    return Number((total / grades.length).toFixed(2));
  };
  const computeTrajectory = (grades: any[]) => {
    if (!grades.length) return student.trajectory;
    const hasGradebook = grades.some((g: any) => g.category === "gradebook");
    if (!hasGradebook) return student.trajectory;
    const avg =
      grades.reduce((sum, g) => sum + (g.percentage ?? 0), 0) / grades.length;
    if (avg < 70) return "slipping";
    if (avg > 85) return "thriving";
    return "steady";
  };

  const derivedGpa = computeGpa(grades);
  const derivedTrajectory = computeTrajectory(grades);

  return (
    <PageLayout width="wide">
      <PageHeader
        title={fullName}
        subtitle={`Grade ${student.grade} · ${student.homeroom}`}
        actions={
          <a
            href="/teacher/classes"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            data-ocid="student.back_button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Classes
          </a>
        }
      />
      {/* Hero row */}
      <div className="mb-6 flex items-start gap-4 rounded-xl border border-border bg-card p-5">
        <StudentAvatar name={fullName} size="lg" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-foreground font-display">
              {fullName}
            </h2>
            {derivedTrajectory ? (
              <StatusBadge
                variant={getTrajectoryVariant(derivedTrajectory)}
                label={getTrajectoryLabel(derivedTrajectory)}
              />
            ) : null}
            {(student.specialPopulations ?? []).map((sp) => (
              <StatusBadge
                key={sp.type}
                variant="info"
                label={
                  sp.type === "iep"
                    ? "IEP"
                    : sp.type === "ell"
                      ? `ELL (WIDA ${sp.wida_level ?? ""})`
                      : sp.type === "gifted"
                        ? "Gifted"
                        : sp.type === "medical_alert"
                          ? "Medical Alert"
                          : sp.type
                }
              />
            ))}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            DOB: {student.dob} · Homeroom: {student.homeroom}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Counsellor:{" "}
            <span className="font-medium text-foreground">
              {counsellor
                ? `${counsellor.firstName} ${counsellor.lastName}`
                : "Unassigned"}
            </span>
          </p>
        </div>
      </div>

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <KPICard
            label="GPA"
            value={derivedGpa?.toFixed(2) ?? "—"}
            trend={
              derivedTrajectory === "thriving"
                ? "up"
                : derivedTrajectory === "slipping"
                  ? "down"
                  : "stable"
            }
            trendDetail={
              derivedTrajectory === "thriving"
                ? "Improving"
                : derivedTrajectory === "slipping"
                  ? "Declining"
                  : "Stable"
            }
          />
          <span className="absolute right-3 top-3">
            {derivedTrajectory === "slipping" ? (
              <TrendingDown className="h-4 w-4 text-destructive" />
            ) : derivedTrajectory === "thriving" ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
          </span>
        </div>
        <KPICard
          label="Attendance"
          value={`${attendanceRate}%`}
          trend={
            attendanceRate >= 95
              ? "up"
              : attendanceRate >= 85
                ? "stable"
                : "down"
          }
          trendDetail={
            attendanceRate >= 95
              ? "Excellent"
              : attendanceRate >= 85
                ? "Good"
                : "At risk"
          }
          delta={attendanceRate < 85 ? "Below 85% threshold" : undefined}
        />
        <KPICard
          label="Active Incidents"
          value={incidents.filter((i) => i.status !== "closed").length}
        />
        <KPICard
          label="Open Commitments"
          value={commitments.filter((c) => c.status !== "completed").length}
        />
      </div>

      {/* Tab nav */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-1">
        {TAB_ITEMS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <Button
              key={tab.key}
              size="sm"
              variant={active ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.key)}
              data-ocid={`student.tab.${tab.key}`}
              type="button"
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <SectionCard title="At a Glance">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Academic Standing
                </span>
                <p className="mt-1 text-sm text-foreground">
                  {derivedTrajectory === "thriving"
                    ? "Consistently strong performance — consider extension work."
                    : derivedTrajectory === "slipping"
                      ? "Recent decline across subjects — check-in recommended."
                      : derivedTrajectory === "coasting"
                        ? "Stable but not reaching potential — engagement opportunity."
                        : "Steady progress across subjects."}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Attendance Pattern
                </span>
                <p className="mt-1 text-sm text-foreground">
                  {attendance
                    ? `${attendance.presentDays} of ${attendance.totalDays} days present (${attendance.attendanceRate}%). ${attendance.isChronicallyAbsent ? "Chronic absence flagged." : ""}`
                    : "No attendance data available."}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Recent Grades">
            {grades.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No grades yet"
                description="Grades will appear here once assignments are scored."
              />
            ) : (
              <div className="space-y-3">
                {grades.map((g) => (
                  <div
                    key={g.courseId}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {g.courseName}
                      </p>
                      <p className="text-xs text-muted-foreground">{g.term}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {g.score != null && !Number.isNaN(g.score)
                          ? `${(g.score ?? 0).toFixed(1)}%`
                          : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {g.letterGrade ?? "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="What needs you">
            {signals.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-success" />
                No active signals for this student.
              </div>
            ) : (
              <div className="space-y-2">
                {signals.map((sig) => (
                  <div
                    key={sig.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <AlertCircle
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                        sig.urgency === "high"
                          ? "text-destructive"
                          : sig.urgency === "medium"
                            ? "text-warning"
                            : "text-info"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {sig.headline}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {sig.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {activeTab === "grades" && (
        <SectionCard title="Grade History">
          {grades.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No grades recorded"
              description="Grade history will appear here once assignments are scored."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((g) => (
                  <TableRow key={g.courseId}>
                    <TableCell className="text-foreground">
                      {g.courseName ?? "Unknown Course"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {g.term}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${
                          g.score != null && !Number.isNaN(g.score)
                            ? g.score >= 90
                              ? "text-success"
                              : g.score >= 70
                                ? "text-warning"
                                : "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {g.score != null && !Number.isNaN(g.score)
                          ? `${(g.score ?? 0).toFixed(1)}%`
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {g.letterGrade ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>
      )}

      {activeTab === "attendance" && (
        <SectionCard title="Attendance Record">
          {attendance ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg border border-border bg-card p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {attendance.presentDays ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Present</div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {attendance.absentDays ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Absent</div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {attendance.tardyDays ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Tardy</div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {attendance.excusedDays ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Excused</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <span className="text-sm font-medium text-foreground">
                  Overall Rate:
                </span>
                <span className="text-lg font-bold text-foreground">
                  {attendance.attendanceRate ?? 0}%
                </span>
                <StatusBadge
                  variant={getAttendanceVariant(attendance.attendanceRate)}
                  label={
                    attendance.isChronicallyAbsent
                      ? "Chronic Absence"
                      : (attendance.attendanceRate ?? 0) >= 95
                        ? "Excellent"
                        : (attendance.attendanceRate ?? 0) >= 85
                          ? "Good"
                          : "At Risk"
                  }
                />
                <TrendIndicator
                  trend={
                    attendance.recentTrend === "improving"
                      ? "up"
                      : attendance.recentTrend === "declining"
                        ? "down"
                        : "stable"
                  }
                  detail={
                    attendance.recentTrend === "improving"
                      ? "Improving"
                      : attendance.recentTrend === "declining"
                        ? "Declining"
                        : "Stable"
                  }
                />
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No attendance data"
              description="Attendance records will appear once recorded."
            />
          )}
        </SectionCard>
      )}

      {activeTab === "behaviour" && (
        <SectionCard title="Behaviour & Incidents">
          {incidents.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No incidents"
              description="No behaviour incidents recorded for this student."
            />
          ) : (
            <div className="space-y-4">
              {incidents.map((inc) => (
                <a
                  key={inc.id}
                  href={`/incidents/${inc.id}`}
                  className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/30"
                  data-ocid={`student.behaviour.incident.item.${inc.id}`}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge
                      variant={
                        inc.severity === "critical"
                          ? "danger"
                          : inc.severity === "high"
                            ? "danger"
                            : inc.severity === "medium"
                              ? "warning"
                              : "neutral"
                      }
                      label={inc.severity ?? "Unknown"}
                    />
                    <StatusBadge
                      variant={
                        inc.status === "closed"
                          ? "success"
                          : inc.status === "routed" ||
                              inc.status === "under_review"
                            ? "warning"
                            : "info"
                      }
                      label={(inc.status ?? "").replace("_", " ")}
                    />
                    <span className="text-xs text-muted-foreground">
                      {inc.date ?? "No date"}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">
                    {inc.description ?? "No description"}
                  </p>
                  {(inc.timeline ?? []).length > 0 && (
                    <div className="mt-3 space-y-2">
                      {inc.timeline.map((entry, _idx) => (
                        <div
                          key={`timeline-${entry.status}-${entry.actor}`}
                          className="flex items-start gap-2 text-xs"
                        >
                          <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                          <div>
                            <span className="font-medium text-foreground">
                              {entry.status}
                            </span>
                            <span className="text-muted-foreground">
                              {" "}
                              — {entry.actor}
                              {entry.note ? ` · ${entry.note}` : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </a>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {activeTab === "timeline" &&
        (() => {
          const timelineEvents = [
            ...incidents.map((inc) => ({
              type: "incident" as const,
              date: inc.date ?? new Date().toISOString(),
              title: inc.severity ?? "Incident",
              description: inc.description,
              actor: (inc as any).loggedBy ?? (inc as any).staffId ?? "Staff",
            })),
            ...commitments.map((com) => ({
              type: "commitment" as const,
              date: com.dueDate ?? new Date().toISOString(),
              title: (com.type ?? "").replace(/_/g, " "),
              description: com.description ?? (com as any).notes ?? "",
              actor: com.ownerId ?? "Staff",
            })),
            ...signals.map((sig) => ({
              type: "signal" as const,
              date:
                (sig as any).detectedAt ??
                (sig as any).createdAt ??
                sig.generatedAt ??
                new Date().toISOString(),
              title: sig.headline,
              description: sig.reason,
              actor: "System",
            })),
          ].sort((a, b) => {
            const aTime = a.date ? new Date(a.date).getTime() : 0;
            const bTime = b.date ? new Date(b.date).getTime() : 0;
            return bTime - aTime;
          });

          return (
            <SectionCard title="Timeline">
              {timelineEvents.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No events yet"
                  description="Notable events for this student will appear here."
                />
              ) : (
                <div>
                  {timelineEvents.map((ev, idx) => (
                    <div
                      key={`${ev.type}-${ev.date}-${idx}`}
                      className="flex items-start gap-3 border-b border-border/50 py-2 last:border-0"
                    >
                      <div
                        className={`mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                          ev.type === "incident"
                            ? "bg-destructive"
                            : ev.type === "commitment"
                              ? "bg-info"
                              : "bg-warning"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-sm font-medium text-foreground">
                            {ev.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {ev.date}
                          </span>
                        </div>
                        {ev.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {ev.description}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs text-muted-foreground/70">
                          {ev.actor}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          );
        })()}

      {activeTab === "commitments" && (
        <SectionCard title="Commitments">
          {commitments.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No commitments"
              description="No open commitments for this student."
            />
          ) : (
            <div className="space-y-3">
              {commitments.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start justify-between rounded-lg border border-border bg-card p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {c.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(c.type ?? "").replace("_", " ")} · Due{" "}
                      {c.dueDate ?? "TBD"}
                    </p>
                  </div>
                  <StatusBadge
                    variant={
                      c.status === "overdue"
                        ? "danger"
                        : c.status === "due_soon"
                          ? "warning"
                          : c.status === "completed"
                            ? "success"
                            : "info"
                    }
                    label={(c.status ?? "").replace("_", " ")}
                  />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}
    </PageLayout>
  );
}
