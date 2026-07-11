import { ClassDetailSkeleton } from "@/components/PageSkeletons";
import { PageLayout, SectionCard } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAssignmentsByCourse } from "@/hooks/backend/assignments";
import { useAttendanceRoster } from "@/hooks/backend/attendance";
import { useTeacherCourses } from "@/hooks/backend/courses";
import { DEMO_STUDENTS } from "@/hooks/backend/demo-data";
import { useGradebookSummary } from "@/hooks/backend/gradebook";
import { useIncidents } from "@/hooks/backend/pastoral";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  FileText,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import GradebookGrid from "../../components/gradebook/GradebookGrid";

// ── Demo data lookup helpers ─────────────────────────────────────────

const DEMO_STAFF_MAP: Record<string, string> = {
  "staff-1": "Maria Chen",
  "staff-2": "James Okafor",
  "staff-3": "Patricia Nguyen",
  "staff-4": "Robert Kim",
  "staff-5": "Diana Walsh",
  "staff-6": "James Carter",
};

function studentName(sid: string) {
  const s = DEMO_STUDENTS.find((st) => st.id === sid);
  return s ? `${s.firstName} ${s.lastName}` : sid;
}

function studentInitials(sid: string) {
  const s = DEMO_STUDENTS.find((st) => st.id === sid);
  return s
    ? `${s.firstName[0]}${s.lastName[0]}`
    : sid.slice(0, 2).toUpperCase();
}

type TabKey =
  | "overview"
  | "gradebook"
  | "attendance"
  | "behaviour"
  | "assignments";

const TAB_ITEMS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: BookOpen },
  { key: "gradebook", label: "Gradebook", icon: TrendingUp },
  { key: "attendance", label: "Attendance", icon: ClipboardCheck },
  { key: "behaviour", label: "Behaviour", icon: AlertTriangle },
  { key: "assignments", label: "Assignments", icon: FileText },
];

const SEVERITY_VARIANTS: Record<string, "danger" | "warning" | "neutral"> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
};

// ── Shared student link ───────────────────────────────────────────────

function StudentLink({
  studentId,
  ocid,
}: {
  studentId: string;
  ocid: string;
}) {
  return (
    <Link
      to={`/teacher/student/${studentId}` as never}
      className="text-sm text-primary hover:underline cursor-pointer"
      data-ocid={ocid}
    >
      {studentName(studentId)}
    </Link>
  );
}

// ── Attendance tab ───────────────────────────────────────────────────

function AttendanceTab({ classId }: { classId: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: records = [] } = useAttendanceRoster(classId, today);
  const presentCount = records.filter((r) => r.status === "present").length;
  const rate =
    records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;

  const STATUS_LABEL: Record<string, string> = {
    present: "Present",
    absent: "Absent",
    tardy: "Tardy",
    excused: "Excused",
  };
  const STATUS_VARIANT: Record<
    string,
    "success" | "danger" | "warning" | "neutral"
  > = {
    present: "success",
    absent: "danger",
    tardy: "warning",
    excused: "neutral",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-success/10 border border-success/20 px-4 py-3">
        <p className="text-sm font-medium text-foreground">
          Today's Attendance Rate
        </p>
        <p
          className={`text-lg font-bold font-display ${rate >= 90 ? "text-success" : rate >= 80 ? "text-warning" : "text-destructive"}`}
        >
          {rate}%
        </p>
      </div>
      {records.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-10 text-center"
          data-ocid="class_detail.attendance.empty_state"
        >
          <ClipboardCheck
            className="h-8 w-8 text-muted-foreground/40 mb-2"
            aria-hidden
          />
          <p className="text-sm text-muted-foreground">No records for today</p>
        </div>
      ) : (
        <Table aria-label="Attendance roster">
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((rec, i) => (
              <TableRow
                key={rec.id}
                data-ocid={`class_detail.attendance.item.${i + 1}`}
              >
                <TableCell className="font-medium">
                  <StudentLink
                    studentId={rec.studentId}
                    ocid={`class_detail.attendance.student_link.${i + 1}`}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={STATUS_VARIANT[rec.status] ?? "neutral"}
                    className="text-[10px] capitalize"
                  >
                    {STATUS_LABEL[rec.status] ?? rec.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// ── Behaviour tab ────────────────────────────────────────────────────

function BehaviourTab({ studentIds }: { studentIds: string[] }) {
  const { data: allIncidents = [] } = useIncidents();
  const incidents = allIncidents.filter((inc) =>
    studentIds.includes(inc.studentId),
  );
  if (incidents.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        data-ocid="class_detail.behaviour.empty_state"
      >
        <AlertTriangle
          className="h-8 w-8 text-muted-foreground/40 mb-2"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">
          No behaviour incidents recorded for this class.
        </p>
      </div>
    );
  }
  return (
    <Table aria-label="Behaviour incidents">
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incidents.map((inc, i) => (
          <TableRow
            key={inc.id}
            data-ocid={`class_detail.behaviour.item.${i + 1}`}
          >
            <TableCell>
              <StudentLink
                studentId={inc.studentId}
                ocid={`class_detail.behaviour.student_link.${i + 1}`}
              />
            </TableCell>
            <TableCell className="text-muted-foreground">{inc.date}</TableCell>
            <TableCell>
              <Badge
                variant={
                  SEVERITY_VARIANTS[
                    inc.severity as keyof typeof SEVERITY_VARIANTS
                  ] ?? "neutral"
                }
              >
                {inc.severity}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {inc.description}
            </TableCell>
            <TableCell className="capitalize text-muted-foreground">
              {inc.status}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ── Assignments tab ──────────────────────────────────────────────────

function AssignmentsTab({ classId }: { classId: string }) {
  const { data: assignments = [] } = useAssignmentsByCourse(classId);
  if (assignments.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        data-ocid="class_detail.assignments.empty_state"
      >
        <FileText
          className="h-8 w-8 text-muted-foreground/40 mb-2"
          aria-hidden
        />
        <p className="text-sm font-medium text-muted-foreground">
          No assignments yet
        </p>
      </div>
    );
  }
  return (
    <Table aria-label="Assignments">
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((a, i) => (
          <TableRow
            key={a.id}
            data-ocid={`class_detail.assignments.item.${i + 1}`}
          >
            <TableCell className="font-medium text-foreground">
              {a.title}
            </TableCell>
            <TableCell className="text-muted-foreground">{a.dueDate}</TableCell>
            <TableCell>
              {a.isHighStakes ? (
                <Badge variant="warning">High Stakes</Badge>
              ) : (
                <Badge variant="neutral">Standard</Badge>
              )}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {a.maxPoints}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ── Main page ────────────────────────────────────────────────────────

export default function ClassDetailPage() {
  const { classId } = useParams({ from: "/teacher/classes/$classId" as never });
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const { data: allCourses = [], isLoading: coursesLoading } =
    useTeacherCourses();
  const course = allCourses.find((c) => c.id === classId);
  const teacherName =
    DEMO_STAFF_MAP[course?.teacherId ?? ""] ?? course?.teacherId ?? "Unknown";

  if (coursesLoading) {
    return (
      <PageLayout width="wide">
        <ClassDetailSkeleton />
      </PageLayout>
    );
  }

  if (!course) {
    return (
      <PageLayout width="wide">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen
            className="h-10 w-10 text-muted-foreground/40 mb-3"
            aria-hidden
          />
          <p className="text-base font-medium text-muted-foreground">
            Class not found.
          </p>
          <Link
            to={"/teacher/classes" as never}
            className="text-coral hover:underline"
            data-ocid="class_detail.back_link"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to Classes
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout width="wide">
      {/* Back link + title */}
      <div className="mb-6">
        <Link
          to={"/teacher/classes" as never}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          data-ocid="class_detail.back_link"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          All Classes
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-display">
              {course.name}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {course.subject} · {teacherName} · Period {course.period} · Room{" "}
              {course.room}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 border border-border px-3 py-2 shrink-0">
            <Users className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="text-sm font-bold text-foreground font-display">
              {course.studentIds.length}
            </span>
            <span className="text-xs text-muted-foreground">students</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Class sections"
        className="flex items-center gap-1 mb-6 overflow-x-auto border-b border-border pb-0 -mb-px"
      >
        {TAB_ITEMS.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            type="button"
            role="tab"
            size="sm"
            variant={activeTab === key ? "default" : "ghost"}
            aria-selected={activeTab === key}
            onClick={() => setActiveTab(key)}
            className="whitespace-nowrap"
            data-ocid={`class_detail.tab.${key}`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {label}
          </Button>
        ))}
      </div>

      {/* Tab content */}
      <SectionCard>
        {activeTab === "overview" && (
          <div className="space-y-5">
            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Subject", value: course.subject },
                { label: "Teacher", value: teacherName },
                { label: "Period", value: `Period ${course.period}` },
                { label: "Room", value: course.room },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-muted/40 px-4 py-3">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-1">
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-foreground font-display">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Roster */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Roster · {course.studentIds.length} students
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {course.studentIds.map((sid, i) => (
                  <div
                    key={sid}
                    className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-background px-3 py-2"
                    data-ocid={`class_detail.roster.item.${i + 1}`}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold font-display">
                      {studentInitials(sid)}
                    </div>
                    <StudentLink
                      studentId={sid}
                      ocid={`class_detail.roster.student_link.${i + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "gradebook" && (
          <GradebookGrid
            classId={classId}
            students={DEMO_STUDENTS.filter((s) =>
              course.studentIds.includes(s.id),
            )}
          />
        )}
        {activeTab === "attendance" && <AttendanceTab classId={classId} />}
        {activeTab === "behaviour" && (
          <BehaviourTab studentIds={course.studentIds} />
        )}
        {activeTab === "assignments" && <AssignmentsTab classId={classId} />}
      </SectionCard>
    </PageLayout>
  );
}
