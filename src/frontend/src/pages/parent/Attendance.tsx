import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAttendance } from "@/hooks/backend/attendance";
import { useStudents } from "@/hooks/backend/students";
import { useEffect, useState } from "react";

export default function ParentAttendance() {
  const { data: students } = useStudents();
  const { data: attendance, isLoading } = useAttendance();
  const [selectedId, setSelectedId] = useState<string>("");

  const demoChildren = students?.slice(0, 3) ?? [];
  useEffect(() => {
    if (demoChildren.length > 0 && !selectedId)
      setSelectedId(demoChildren[0].id);
  }, [demoChildren, selectedId]);

  const childAttendance =
    attendance?.filter((a: any) => a.studentId === selectedId) ?? [];
  const presentCount = childAttendance.filter(
    (a: any) => a.status === "present" || a.status === "excused",
  ).length;
  const attendanceRate =
    childAttendance.length > 0
      ? Math.round((presentCount / childAttendance.length) * 100)
      : 95;
  const rateVariant =
    attendanceRate >= 90
      ? "success"
      : attendanceRate >= 85
        ? "warning"
        : "danger";

  const absences = (childAttendance ?? [])
    .filter((a: any) => a.status !== "present")
    .sort((a: any, b: any) => (b.date > a.date ? 1 : -1));

  // Build calendar for current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const calendarDays: { date: Date | null; status: string }[] = [];
  const startDow = firstDay.getDay(); // 0=Sun
  // Pad start to Monday
  const padStart = startDow === 0 ? 6 : startDow - 1;
  for (let i = 0; i < padStart; i++)
    calendarDays.push({ date: null, status: "pad" });
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) {
      calendarDays.push({ date, status: "weekend" });
      continue;
    }
    const dateStr = date.toISOString().split("T")[0];
    const record = childAttendance.find((a: any) => a.date === dateStr);
    calendarDays.push({
      date,
      status: record?.status || (date <= now ? "present" : "future"),
    });
  }
  const weeks: (typeof calendarDays)[] = [];
  for (let i = 0; i < calendarDays.length; i += 5)
    weeks.push(calendarDays.slice(i, i + 5));

  const dayColor = (status: string) => {
    if (status === "present") return "bg-success/10 text-success";
    if (status === "tardy") return "bg-warning/15 text-warning";
    if (status === "absent") return "bg-destructive/10 text-destructive";
    if (status === "weekend") return "bg-muted text-muted-foreground";
    if (status === "future") return "bg-card text-muted-foreground";
    return "bg-muted";
  };
  // Non-colour cue (WCAG 1.4.1): tardy/absent days carry a letter + label,
  // not colour alone.
  const dayMark = (status: string) =>
    status === "tardy" ? "T" : status === "absent" ? "A" : "";
  const dayLabel = (status: string) =>
    status === "tardy" ? "Tardy" : status === "absent" ? "Absent" : "Present";

  return (
    <PageLayout>
      <PageHeader title="Attendance" />
      {isLoading ? (
        <SkeletonCard lines={5} />
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
              <div className="text-3xl font-bold text-foreground">
                {attendanceRate}%
              </div>
              <div>
                <StatusBadge
                  variant={rateVariant}
                  label={
                    rateVariant === "success"
                      ? "On track"
                      : rateVariant === "warning"
                        ? "Monitor"
                        : "Needs attention"
                  }
                />
                <p className="text-xs text-muted-foreground mt-0.5">
                  Present this term
                </p>
              </div>
            </div>
          </SectionCard>
          {attendanceRate < 85 && (
            <div className="p-3 border-l-4 border-warning/30 bg-warning/15 rounded-lg">
              <p className="font-semibold text-sm text-warning">
                Attendance below recommended 85%
              </p>
              <p className="text-xs text-warning mt-0.5">
                We recommend speaking with the school about attendance support.
              </p>
            </div>
          )}
          <SectionCard
            title={`${now.toLocaleString("default", { month: "long", year: "numeric" })}`}
            className="p-3"
          >
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
                    <TableHead key={d} className="text-center w-1/5">
                      {d}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeks.map((week, weekIdx) => (
                  <TableRow key={`week-${weekIdx}-${week.length}`}>
                    {week.map((day, dayIdx) => (
                      <TableCell
                        key={`day-${weekIdx}-${dayIdx}-${day.status}`}
                        className="text-center"
                      >
                        {day.date && day.status !== "pad" ? (
                          <div
                            className={`relative mx-auto w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium ${dayColor(day.status)}`}
                            title={
                              dayMark(day.status)
                                ? `${day.date.getDate()}: ${dayLabel(day.status)}`
                                : undefined
                            }
                            aria-label={
                              dayMark(day.status)
                                ? `${day.date.getDate()}: ${dayLabel(day.status)}`
                                : undefined
                            }
                          >
                            {day.date.getDate()}
                            {dayMark(day.status) ? (
                              <span
                                aria-hidden
                                className="absolute -bottom-1 -right-1 rounded-full bg-card px-1 text-[8px] font-bold leading-none"
                              >
                                {dayMark(day.status)}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <div className="w-7 h-7" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex gap-3 mt-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />
                Present
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" />
                Tardy (T)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive inline-block" />
                Absent (A)
              </span>
            </div>
          </SectionCard>
          <SectionCard title="Absence Log" className="p-3">
            {absences.length === 0 ? (
              <EmptyState
                title="No absences this term"
                description="Perfect attendance — keep it up!"
              />
            ) : (
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {absences.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.date}</TableCell>
                      <TableCell>
                        <StatusBadge
                          variant={a.status === "tardy" ? "warning" : "danger"}
                          label={a.status}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          variant={a.excused ? "info" : "neutral"}
                          label={a.excused ? "Excused" : "Unexcused"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionCard>
        </div>
      )}
    </PageLayout>
  );
}
