import { TeacherTodaySkeleton } from "@/components/PageSkeletons";
import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  DistributionBar,
  InsightBanner,
  MetricCard,
  type PriorityItem,
  PriorityList,
  type Segment,
  type Tone,
} from "@/components/ui/insight";
import { useTeacherCourses } from "@/hooks/backend/courses";
import { useWhatNeedsYouToday } from "@/hooks/backend/dashboards";
import { useTeacherGradesToEnter } from "@/hooks/backend/gradebook";
import { useTeacherOpenCommitments } from "@/hooks/backend/pastoral";
import { useStudents } from "@/hooks/backend/students";
import { useRoleStore } from "@/store/roleStore";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SIGNAL_ICON: Record<string, LucideIcon> = {
  risk: AlertCircle,
  opportunity: Sparkles,
  celebration: CheckCircle2,
  workload: AlertTriangle,
  commitment_due: CalendarDays,
  continuity: CalendarDays,
  pattern: AlertCircle,
};

const SIGNAL_TONE: Record<string, Tone> = {
  risk: "danger",
  opportunity: "info",
  celebration: "success",
  workload: "warning",
  commitment_due: "warning",
  continuity: "neutral",
  pattern: "info",
};

export default function TeacherToday() {
  const { currentUser } = useRoleStore();
  const { data: signals, isLoading: loadingSignals } =
    useWhatNeedsYouToday("teacher");
  const { data: courses, isLoading: loadingCourses } = useTeacherCourses(
    currentUser?.id,
  );
  const { data: roster } = useStudents();
  const { data: openCommitments } = useTeacherOpenCommitments(currentUser?.id);
  const { data: gradesToEnter } = useTeacherGradesToEnter(currentUser?.id);

  const isLoading = loadingSignals || loadingCourses;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const commitmentsCount = openCommitments?.length ?? 0;
  const gradesCount = gradesToEnter ?? 0;

  // The teacher's students: roster entries enrolled in any of their courses.
  const myStudentIds = new Set(
    (courses ?? []).flatMap((c) => c.studentIds ?? []),
  );
  const myStudents = (roster ?? []).filter((s) => myStudentIds.has(s.id));
  const studentCount = myStudents.length;

  // Average attendance across the teacher's students (real, computed).
  const avgAttendance = studentCount
    ? Math.round(
        myStudents.reduce((sum, s) => sum + (s.attendanceRate ?? 0), 0) /
          studentCount,
      )
    : null;

  // Class-health tiers from real attendance + GPA (GPA only counts when known).
  const tier = (s: (typeof myStudents)[number]): Tone => {
    const att = s.attendanceRate ?? 100;
    const gpa = s.gpa;
    if (att < 85 || (gpa != null && gpa < 2.0)) return "danger";
    if (att < 90 || (gpa != null && gpa < 2.5)) return "warning";
    return "success";
  };
  const tiers = myStudents.map(tier);
  const onTrack = tiers.filter((t) => t === "success").length;
  const watch = tiers.filter((t) => t === "warning").length;
  const atRisk = tiers.filter((t) => t === "danger").length;
  const healthSegments: Segment[] = [
    { label: "On track", value: onTrack, tone: "success", icon: CircleCheck },
    { label: "Watch", value: watch, tone: "warning", icon: AlertTriangle },
    { label: "At risk", value: atRisk, tone: "danger", icon: AlertCircle },
  ];

  // Top signal drives the insight banner.
  const topSignal = signals?.[0];
  const bannerTone: Tone = !topSignal
    ? "success"
    : topSignal.type === "celebration"
      ? "success"
      : topSignal.urgency === "critical" || topSignal.urgency === "high"
        ? "warning"
        : "info";

  const priorityItems: PriorityItem[] = (signals ?? []).slice(0, 5).map(
    (sig): PriorityItem => ({
      id: sig.id,
      icon: SIGNAL_ICON[sig.type] ?? AlertCircle,
      tone: SIGNAL_TONE[sig.type] ?? "info",
      title: sig.headline,
      subtitle: sig.reason,
      to: sig.studentId ? `/teacher/student/${sig.studentId}` : undefined,
    }),
  );

  if (isLoading) {
    return (
      <PageLayout>
        <TeacherTodaySkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={`Good morning, ${currentUser?.firstName ?? "Teacher"}`}
        subtitle={today}
      />

      <div className="space-y-5">
        <InsightBanner tone={bannerTone}>
          {topSignal
            ? `${topSignal.headline} — ${topSignal.reason}`
            : "You're up to date. Nothing needs you right now — a calm start to the day."}
        </InsightBanner>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard
            label="Avg attendance"
            value={avgAttendance != null ? `${avgAttendance}%` : "—"}
            sub={
              avgAttendance == null
                ? "no data yet"
                : `across ${studentCount} students`
            }
          />
          <MetricCard
            label="Students"
            value={studentCount}
            sub={`${courses?.length ?? 0} classes`}
          />
          <MetricCard
            label="Grades to enter"
            value={gradesCount}
            sub={gradesCount ? "pending" : "all entered"}
          />
          <MetricCard
            label="Open commitments"
            value={commitmentsCount}
            sub={commitmentsCount ? "due soon" : "none open"}
          />
        </div>

        {studentCount > 0 && (
          <SectionCard title="Class health" className="py-4">
            <DistributionBar segments={healthSegments} />
          </SectionCard>
        )}

        <SectionCard title="What needs you today" className="py-4">
          {loadingSignals ? (
            <TeacherTodaySkeleton />
          ) : priorityItems.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Nothing needs you right now"
              description="You're up to date. Great start to the day."
            />
          ) : (
            <PriorityList items={priorityItems} />
          )}
        </SectionCard>

        <SectionCard title="Today's classes" className="py-4">
          {!courses?.length ? (
            <EmptyState
              icon={CalendarDays}
              title="No classes today"
              description="Check your timetable for schedule details."
            />
          ) : (
            <div className="divide-y divide-border">
              {courses.map((c) => {
                const flaggedCount = (c.studentIds ?? []).filter((sid) => {
                  const s = myStudents.find((m) => m.id === sid);
                  return s && tier(s) !== "success";
                }).length;
                return (
                  <Link
                    key={c.id}
                    to={`/teacher/classes/${c.id}` as never}
                    className="flex items-center justify-between rounded-sm px-1 py-2.5 transition-colors hover:bg-muted/30"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {c.name}
                        </p>
                        <span className="inline-flex items-center rounded bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                          Grade {c.grade}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground">
                          P{c.period ?? "—"} · Room {c.room ?? "—"}
                        </span>
                        <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                          <Users className="h-3 w-3" aria-hidden />
                          {(c.studentIds ?? []).length}
                        </span>
                        {flaggedCount > 0 && (
                          <span className="text-[11px] font-medium text-warning">
                            {flaggedCount} flagged
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight
                      className="ml-2 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </PageLayout>
  );
}
