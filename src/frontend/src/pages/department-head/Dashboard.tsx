import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { KPICard } from "@/components/ui/KPICard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TrendIndicator } from "@/components/ui/TrendIndicator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCourses } from "@/hooks/backend/courses";
import {
  useDepartmentStats,
  useWhatNeedsYouToday,
} from "@/hooks/backend/dashboards";
import { useStaff } from "@/hooks/backend/students";

export default function DepartmentHeadDashboard() {
  const { data: signals, isLoading: sigLoad } =
    useWhatNeedsYouToday("departmentHead");
  const { data: deptStatsArr, isLoading: statsLoad } = useDepartmentStats();
  const { data: courses } = useCourses();
  const { data: staff } = useStaff();

  const deptStats = deptStatsArr?.[0];
  const isLoading = sigLoad || statsLoad;
  const teachers =
    staff?.filter((s: any) => s.role?.toLowerCase() === "teacher") || [];
  staff?.filter((s: any) => s.role === "teacher" || s.role === "Teacher") || [];

  const urgencyBorder = (urgency: string) => {
    if (urgency === "critical") return "border-l-4 border-destructive/30";
    if (urgency === "important") return "border-l-4 border-warning/30";
    return "border-l-4 border-info/30";
  };

  return (
    <PageLayout width="wide">
      <PageHeader title="Department Overview" subtitle="English Department" />

      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={4} />
          <SkeletonCard lines={3} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="Teachers" value={String(teachers.length || 4)} />
            <KPICard
              label="Courses This Term"
              value={String(courses?.length || 11)}
            />
            <KPICard
              label="Avg GPA"
              value={deptStats?.avgGpa?.toFixed(1) ?? "3.2"}
              trend="up"
              trendDetail="+0.1 from last term"
            />
            <KPICard
              label="Attendance Rate"
              value={`${deptStats?.attendanceRate?.toFixed(0) ?? "91"}%`}
              trend="stable"
            />
          </div>

          <SectionCard title="Needs Your Attention">
            {!signals || signals.length === 0 ? (
              <EmptyState
                title="All courses on track"
                description="No issues need your attention right now."
              />
            ) : (
              <div className="space-y-3">
                {signals.slice(0, 5).map((s: any) => (
                  <div
                    key={s.id}
                    className={`p-4 bg-card rounded-lg ${urgencyBorder(s.urgency)}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {s.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {s.description}
                        </p>
                      </div>
                      <StatusBadge
                        variant={
                          s.urgency === "critical"
                            ? "danger"
                            : s.urgency === "important"
                              ? "warning"
                              : "info"
                        }
                        label={s.type ?? s.signalType ?? "signal"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Course Performance">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-foreground">
                    Course
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Teacher
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Avg Grade
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Trend
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(courses || []).slice(0, 8).map((c: any) => {
                  const teacher = staff?.find((s: any) => s.id === c.teacherId);
                  return (
                    <TableRow key={c.id} className="hover:bg-muted">
                      <TableCell className="text-foreground">
                        {c.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {teacher?.name || "TBD"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant="success" label="B+" />
                      </TableCell>
                      <TableCell>
                        <TrendIndicator direction="steady" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </SectionCard>
        </div>
      )}
    </PageLayout>
  );
}
