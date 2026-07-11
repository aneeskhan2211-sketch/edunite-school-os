import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCourses } from "@/hooks/backend/courses";
import { useSchedule } from "@/hooks/backend/schedule";
import { useStaff } from "@/hooks/backend/students";
import { useRoleStore } from "@/store/roleStore";
import { useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function StudentSchedule() {
  const [activeTab, setActiveTab] = useState<"today" | "week">("today");
  const { currentUser } = useRoleStore();

  // The student persona maps to a real seeded student (defaults to Maya / s2).
  const rawId = currentUser?.id ?? "";
  const studentId = /[0-9]/.test(rawId) ? rawId : "s2";

  const { data: entries = [], isLoading } = useSchedule(studentId);
  const { data: courses = [] } = useCourses();
  const { data: staff = [] } = useStaff();

  const courseById = new Map(
    courses.map((c: any) => [c.id, c] as [string, any]),
  );
  const staffById = new Map(staff.map((s: any) => [s.id, s] as [string, any]));

  const courseName = (courseId: string) =>
    (courseById.get(courseId) as any)?.name ?? "Free period";
  const teacherName = (courseId: string) => {
    const c = courseById.get(courseId) as any;
    const t = c ? (staffById.get(c.teacherId) as any) : null;
    return t ? `${t.firstName} ${t.lastName}`.trim() : "";
  };

  const jsDay = new Date().getDay(); // 0=Sun … 6=Sat
  const todayNum = jsDay >= 1 && jsDay <= 5 ? jsDay : 1;
  const todayShort = DAYS[todayNum - 1];

  const periods = Array.from(new Set(entries.map((e: any) => e.period))).sort(
    (a: number, b: number) => a - b,
  );
  const todayEntries = entries
    .filter((e: any) => e.day === todayNum)
    .sort((a: any, b: any) => a.period - b.period);

  const cellFor = (period: number, day: number) =>
    entries.find((e: any) => e.period === period && e.day === day) ?? null;

  return (
    <PageLayout width="wide">
      <PageHeader title="My Schedule" />

      <div className="flex gap-2 mb-6">
        {(["today", "week"] as const).map((tab) => (
          <Button
            key={tab}
            type="button"
            size="sm"
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
            data-ocid={`student_schedule.tab.${tab}`}
          >
            {tab === "today" ? "Today" : "This Week"}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <SectionCard title="Schedule">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((k) => (
              <Skeleton key={k} className="h-14 w-full" />
            ))}
          </div>
        </SectionCard>
      ) : activeTab === "today" ? (
        <SectionCard title={`Today's Schedule · ${todayShort}`}>
          {todayEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No classes scheduled today.
            </p>
          ) : (
            <div className="space-y-2" data-ocid="student_schedule.today_list">
              {todayEntries.map((s: any, i: number) => (
                <div
                  key={`${s.period}-${s.day}`}
                  className="flex items-center gap-4 rounded-lg border border-border bg-background px-4 py-3"
                  data-ocid={`student_schedule.period.${i + 1}`}
                >
                  <span className="w-6 text-center text-xs font-bold text-muted-foreground">
                    {s.period}
                  </span>
                  <span className="w-28 shrink-0 text-xs font-mono text-muted-foreground">
                    {s.startTime}–{s.endTime}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {courseName(s.courseId)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {teacherName(s.courseId)
                        ? `${teacherName(s.courseId)} · `
                        : ""}
                      Rm {s.room}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      ) : (
        <SectionCard title="Weekly Schedule">
          <div data-ocid="student_schedule.week_table">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Period</TableHead>
                  {DAYS.map((d) => (
                    <TableHead
                      key={d}
                      className={`text-center ${
                        d === todayShort ? "text-primary" : ""
                      }`}
                    >
                      {d}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period: number) => (
                  <TableRow key={period}>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {period}
                    </TableCell>
                    {DAYS.map((d, idx) => {
                      const entry = cellFor(period, idx + 1);
                      const isTodayCol = idx + 1 === todayNum;
                      return (
                        <TableCell
                          key={d}
                          className={`text-center ${
                            isTodayCol ? "bg-primary/5 dark:bg-primary/10" : ""
                          }`}
                        >
                          {entry ? (
                            <>
                              <p className="text-xs font-medium text-foreground truncate">
                                {courseName(entry.courseId).slice(0, 14)}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                Rm {entry.room}
                              </p>
                            </>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}
    </PageLayout>
  );
}
