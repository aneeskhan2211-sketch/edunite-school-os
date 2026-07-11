import { MorningPictureSkeleton } from "@/components/PageSkeletons";
import { PageLayout, SectionCard } from "@/components/layout/PageLayout";
import {
  DistributionBar,
  InsightBanner,
  MetricCard,
  type PriorityItem,
  PriorityList,
  type Segment,
  type Tone,
} from "@/components/ui/insight";
import { useWhatNeedsYouToday } from "@/hooks/backend/dashboards";
import {
  useCommitmentsDueThisWeek,
  useIncidents,
} from "@/hooks/backend/pastoral";
import { useStudents } from "@/hooks/backend/students";
import { useRoleStore } from "@/store/roleStore";
import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleCheck,
  Clock,
  Flag,
  Sparkles,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";

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

function studentTone(attendance: number, gpa?: number): Tone {
  if (attendance < 85 || (gpa != null && gpa < 2.0)) return "danger";
  if (attendance < 90 || (gpa != null && gpa < 2.5)) return "warning";
  return "success";
}

export default function MorningPicturePage() {
  const { currentRole, currentUser } = useRoleStore();
  const { data: roster, isLoading: loadingRoster } = useStudents();
  const { data: signals, isLoading: loadingSignals } =
    useWhatNeedsYouToday(currentRole);
  const { data: incidents } = useIncidents();
  const { data: commitmentsDue } = useCommitmentsDueThisWeek();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const students = roster ?? [];
  const studentCount = students.length;

  // School-wide figures computed from real student records.
  const avgAttendance = studentCount
    ? Math.round(
        students.reduce((s, x) => s + (x.attendanceRate ?? 0), 0) /
          studentCount,
      )
    : null;
  const withGpa = students.filter((s) => s.gpa != null);
  const avgGpa = withGpa.length
    ? (withGpa.reduce((s, x) => s + (x.gpa ?? 0), 0) / withGpa.length).toFixed(
        2,
      )
    : null;

  const tones = students.map((s) =>
    studentTone(s.attendanceRate ?? 100, s.gpa ?? undefined),
  );
  const onTrack = tones.filter((t) => t === "success").length;
  const watch = tones.filter((t) => t === "warning").length;
  const atRisk = tones.filter((t) => t === "danger").length;
  const healthSegments: Segment[] = [
    { label: "On track", value: onTrack, tone: "success", icon: CircleCheck },
    { label: "Watch", value: watch, tone: "warning", icon: AlertTriangle },
    { label: "At risk", value: atRisk, tone: "danger", icon: AlertCircle },
  ];

  const activeIncidents = (incidents ?? []).filter(
    (i) => i.status !== "closed",
  ).length;

  // Attendance by grade — grouped from real records.
  const byGrade = useMemo(() => {
    const map = new Map<number, { sum: number; n: number }>();
    for (const s of students) {
      const g = s.grade ?? 0;
      const e = map.get(g) ?? { sum: 0, n: 0 };
      e.sum += s.attendanceRate ?? 0;
      e.n += 1;
      map.set(g, e);
    }
    return [...map.entries()]
      .map(([grade, { sum, n }]) => ({ grade, rate: Math.round(sum / n) }))
      .sort((a, b) => a.grade - b.grade);
  }, [students]);

  const topSignal = signals?.[0];
  const bannerTone: Tone = !topSignal
    ? "success"
    : topSignal.type === "celebration"
      ? "success"
      : topSignal.urgency === "critical" || topSignal.urgency === "high"
        ? "warning"
        : "info";
  const bannerText = topSignal
    ? `${topSignal.headline} — ${topSignal.reason}`
    : `Attendance is ${avgAttendance ?? "—"}% school-wide and ${atRisk} student${
        atRisk === 1 ? "" : "s"
      } need attention today. The day looks steady.`;

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

  if (loadingRoster || loadingSignals) {
    return (
      <PageLayout title="Morning Picture" width="wide">
        <MorningPictureSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Morning Picture"
      subtitle="What needs the school today"
      width="wide"
    >
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">
          {greeting}, {currentUser?.firstName ?? "Principal"}
        </h2>
        <p className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="space-y-5">
        <InsightBanner tone={bannerTone}>{bannerText}</InsightBanner>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard
            label="Attendance"
            value={avgAttendance != null ? `${avgAttendance}%` : "—"}
            sub="school-wide"
          />
          <MetricCard
            label="Avg GPA"
            value={avgGpa ?? "—"}
            sub={avgGpa ? "where graded" : "no grades yet"}
          />
          <MetricCard
            label="Active incidents"
            value={activeIncidents}
            sub={activeIncidents ? "open" : "none open"}
          />
          <MetricCard
            label="Students at risk"
            value={atRisk}
            sub={`of ${studentCount}`}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard title="School health" className="py-4">
            {studentCount === 0 ? (
              <p className="text-sm text-muted-foreground">
                No student data yet.
              </p>
            ) : (
              <DistributionBar segments={healthSegments} />
            )}
          </SectionCard>

          <SectionCard title="Attendance by grade" className="py-4">
            {byGrade.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <div className="space-y-2.5">
                {byGrade.map((g) => {
                  const tone = studentTone(g.rate);
                  const fill =
                    tone === "success"
                      ? "bg-success"
                      : tone === "warning"
                        ? "bg-warning"
                        : "bg-destructive";
                  const text =
                    tone === "success"
                      ? "text-success"
                      : tone === "warning"
                        ? "text-warning"
                        : "text-destructive";
                  return (
                    <div key={g.grade}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Grade {g.grade}
                        </span>
                        <span className={text}>{g.rate}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className={`h-1.5 rounded-full ${fill}`}
                          style={{ width: `${Math.min(g.rate, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="What needs you today" className="py-4">
          {priorityItems.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-success">
              <UserCheck className="h-4 w-4" aria-hidden />
              Nothing urgent — the school is running smoothly.
            </div>
          ) : (
            <PriorityList items={priorityItems} />
          )}
        </SectionCard>

        <SectionCard title="Across the school this week" className="py-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Incidents to route
              </h3>
              {activeIncidents === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No open incidents.
                </p>
              ) : (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Flag className="h-4 w-4 text-warning" aria-hidden />
                  {activeIncidents} open incident
                  {activeIncidents === 1 ? "" : "s"} awaiting follow-up
                </div>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Commitments due this week
              </h3>
              {(commitmentsDue ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nothing due this week.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {(commitmentsDue ?? []).slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-start gap-1.5 text-xs"
                    >
                      <Clock
                        className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="truncate text-foreground">
                          {c.description}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Due{" "}
                          {c.dueDate
                            ? new Date(c.dueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "TBD"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SectionCard>
      </div>
    </PageLayout>
  );
}
