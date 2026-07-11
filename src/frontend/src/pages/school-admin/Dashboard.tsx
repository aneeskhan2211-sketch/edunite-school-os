import { PageLayout, SectionCard } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchoolStats } from "@/hooks/backend/dashboards";
import { useIncidents } from "@/hooks/backend/pastoral";
import { useStaff, useStudents } from "@/hooks/backend/students";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Mail,
  Shield,
  ShieldAlert,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { useMemo } from "react";

interface KpiItem {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  icon: React.ReactNode;
}

interface QuickAction {
  label: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

interface ActivityItem {
  time: string;
  actor: string;
  action: string;
  target: string;
}

export default function SchoolAdminDashboardPage() {
  const statsQ = useSchoolStats();
  const studentsQ = useStudents();
  const staffQ = useStaff();
  const incidentsQ = useIncidents();

  const isLoading =
    statsQ.isLoading ||
    studentsQ.isLoading ||
    staffQ.isLoading ||
    incidentsQ.isLoading;

  const kpis: KpiItem[] = useMemo(() => {
    const stats = statsQ.data;
    return [
      {
        label: "Total Students",
        value: String(studentsQ.data?.length ?? 0),
        change: "+2 this week",
        trend: "up",
        icon: <Users className="size-4" />,
      },
      {
        label: "Total Staff",
        value: String(staffQ.data?.length ?? 0),
        change: "No change",
        trend: "flat",
        icon: <GraduationCap className="size-4" />,
      },
      {
        label: "Attendance Rate",
        value: stats ? `${(stats.attendanceRate ?? 0).toFixed(1)}%` : "—",
        change: "-0.8% vs last week",
        trend: "down",
        icon: <Activity className="size-4" />,
      },
      {
        label: "Open Incidents",
        value: String(
          (incidentsQ.data ?? []).filter((i) => i.status !== "closed").length,
        ),
        change: "-3 resolved",
        trend: "up",
        icon: <ShieldAlert className="size-4" />,
      },
    ];
  }, [statsQ.data, studentsQ.data, staffQ.data, incidentsQ.data]);

  const quickActions: QuickAction[] = [
    {
      label: "Enrol new student",
      description: "Add a student to the system",
      icon: <Users className="size-4" />,
      href: "/school-admin/enrolment",
    },
    {
      label: "Add staff member",
      description: "Invite a new teacher or admin",
      icon: <GraduationCap className="size-4" />,
      href: "/school-admin/staff",
    },
    {
      label: "Configure timetable",
      description: "Set up periods and schedules",
      icon: <Clock className="size-4" />,
      href: "/school-admin/timetables",
    },
    {
      label: "Send announcement",
      description: "Broadcast to staff or parents",
      icon: <Mail className="size-4" />,
      href: "/messages",
    },
    {
      label: "Run report",
      description: "Export attendance or grades",
      icon: <BarChart3 className="size-4" />,
      href: "/school-admin/reports",
    },
    {
      label: "System settings",
      description: "Notification matrix, data & privacy",
      icon: <Wrench className="size-4" />,
      href: "/school-admin/settings",
    },
  ];

  const activities: ActivityItem[] = [
    {
      time: "08:42",
      actor: "Ms. Johnson",
      action: "marked attendance for",
      target: "Grade 10A",
    },
    {
      time: "09:15",
      actor: "Mr. Patel",
      action: "posted grades for",
      target: "Math 101 — Unit 3",
    },
    {
      time: "09:33",
      actor: "Counsellor Lee",
      action: "logged incident for",
      target: "Student #1042",
    },
    {
      time: "10:05",
      actor: "Admin",
      action: "enrolled new student",
      target: "Emma Rodriguez",
    },
    {
      time: "10:48",
      actor: "SPED Coordinator",
      action: "updated IEP for",
      target: "Marcus Chen",
    },
    {
      time: "11:20",
      actor: "Ms. Johnson",
      action: "created assignment",
      target: "English Essay Draft",
    },
    {
      time: "11:55",
      actor: "Principal Anderson",
      action: "approved",
      target: "Science budget request",
    },
  ];

  const healthItems = [
    {
      label: "Database",
      status: "healthy" as const,
      detail: "All systems operational",
    },
    {
      label: "Authentication",
      status: "healthy" as const,
      detail: "Dev mode active",
    },
    {
      label: "Notifications",
      status: "warning" as const,
      detail: "2 queued emails",
    },
    {
      label: "Backup",
      status: "healthy" as const,
      detail: "Last: 6 hours ago",
    },
  ];

  if (isLoading) {
    return (
      <PageLayout
        title="Dashboard"
        subtitle="School overview and quick actions"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((n) => (
              <Skeleton key={`kpi-sk-${n}`} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Dashboard" subtitle="School overview and quick actions">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <SectionCard
            key={kpi.label}
            className="flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              {kpi.icon}
              <span className="text-xs font-medium uppercase tracking-wide">
                {kpi.label}
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {kpi.value}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {kpi.trend === "up" ? (
                <TrendingUp className="size-3.5 text-success" />
              ) : kpi.trend === "down" ? (
                <TrendingUp className="size-3.5 text-destructive rotate-180" />
              ) : (
                <CheckCircle2 className="size-3.5 text-muted-foreground" />
              )}
              <span
                className={`text-xs font-medium ${
                  kpi.trend === "up"
                    ? "text-success"
                    : kpi.trend === "down"
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              >
                {kpi.change}
              </span>
            </div>
          </SectionCard>
        ))}
      </div>

      {/* Two-column: Quick actions + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick actions */}
        <SectionCard title="Quick actions" className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                type="button"
                variant="outline"
                className="h-auto justify-start p-3 text-left"
                data-ocid={`admin.quick_action.${action.label.toLowerCase().replace(/\s+/g, "_")}`}
                asChild
              >
                <a href={action.href} className="flex items-start gap-3">
                  <div className="mt-0.5 text-muted-foreground">
                    {action.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {action.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="size-4 ml-auto shrink-0 text-muted-foreground" />
                </a>
              </Button>
            ))}
          </div>
        </SectionCard>

        {/* Recent activity */}
        <SectionCard title="Recent activity">
          <div className="space-y-3">
            {activities.map((act) => (
              <div
                key={`${act.time}-${act.actor}-${act.target}`}
                className="flex items-start gap-2"
              >
                <span className="text-xs text-muted-foreground font-mono w-10 shrink-0">
                  {act.time}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{act.actor}</span>{" "}
                    <span className="text-muted-foreground">{act.action}</span>{" "}
                    <span className="font-medium">{act.target}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* System health */}
      <SectionCard title="System health">
        <div className="flex flex-wrap gap-3">
          {healthItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                item.status === "healthy"
                  ? "bg-success/10 border-success/30"
                  : "bg-warning/15 border-warning/30"
              }`}
            >
              {item.status === "healthy" ? (
                <Shield className="size-4 text-success" />
              ) : (
                <ShieldAlert className="size-4 text-warning" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageLayout>
  );
}
