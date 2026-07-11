import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudents } from "@/hooks/backend/students";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Minus, TrendingUp } from "lucide-react";
import { useState } from "react";

interface StudentInsight {
  id: string;
  name: string;
  grade: number;
  renewalDate: string;
  daysToRenewal: number;
  tier: "overdue" | "due-soon" | "upcoming" | "future";
  attendanceRate: number;
  gradeTrajectory: "improving" | "declining" | "stable";
  flags: string[];
  openCommitments: number;
}

function tierBadge(tier: StudentInsight["tier"]) {
  switch (tier) {
    case "overdue":
      return <StatusBadge variant="danger" label="Overdue" />;
    case "due-soon":
      return <StatusBadge variant="warning" label="Due Soon" />;
    case "upcoming":
      return <StatusBadge variant="info" label="Upcoming" />;
    case "future":
      return <StatusBadge variant="neutral" label="Future" />;
  }
}

function attendanceColor(rate: number) {
  if (rate >= 95) return "text-success";
  if (rate >= 85) return "text-warning";
  return "text-destructive";
}

function trajectoryIcon(trajectory: StudentInsight["gradeTrajectory"]) {
  switch (trajectory) {
    case "improving":
      return <ArrowUp className="h-4 w-4 text-success" />;
    case "declining":
      return <ArrowDown className="h-4 w-4 text-destructive" />;
    case "stable":
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
}

function trajectoryLabel(trajectory: StudentInsight["gradeTrajectory"]) {
  switch (trajectory) {
    case "improving":
      return "Improving";
    case "declining":
      return "Declining";
    case "stable":
      return "Stable";
  }
}

function KPICard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant?: "danger" | "warning" | "info" | "neutral";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-foreground font-display">
          {value}
        </span>
        {variant ? <StatusBadge variant={variant} label={label} /> : null}
      </div>
    </div>
  );
}

function StudentCard({
  student,
  index,
  isExpanded,
  onToggle,
}: {
  student: StudentInsight;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors"
      data-ocid={`caseload-insight.card.${index + 1}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <Link
            to={"/teacher/student/$studentId" as never}
            params={{ studentId: student.id } as never}
            className="font-semibold text-foreground hover:text-primary transition-colors"
            data-ocid={`caseload-insight.student-link.${index + 1}`}
          >
            {student.name}
          </Link>
          <p className="text-sm text-muted-foreground">Grade {student.grade}</p>
        </div>
        {tierBadge(student.tier)}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Attendance</span>
          <span
            className={`font-medium ${attendanceColor(student.attendanceRate)}`}
          >
            {student.attendanceRate}%
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Grade Trajectory</span>
          <div className="flex items-center gap-1">
            {trajectoryIcon(student.gradeTrajectory)}
            <span className="text-foreground">
              {trajectoryLabel(student.gradeTrajectory)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 pt-1">
          {student.flags.map((flag) => (
            <Badge key={flag} variant="secondary" className="text-xs">
              {flag}
            </Badge>
          ))}
          {student.openCommitments > 0 ? (
            <Badge variant="outline" className="text-xs">
              {student.openCommitments} open
            </Badge>
          ) : null}
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-3 h-auto w-full justify-start px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground"
        onClick={onToggle}
        data-ocid={`caseload-insight.expand.${index + 1}`}
      >
        {isExpanded ? "▲ Hide details" : "▼ Show IEP details"}
      </Button>

      {isExpanded ? (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              IEP Summary
            </h4>
            <p className="text-sm text-muted-foreground">
              Renewal due{" "}
              {student.daysToRenewal < 0
                ? `${Math.abs(student.daysToRenewal)} days overdue`
                : `in ${student.daysToRenewal} days`}
              .{" "}
              {student.daysToRenewal < 0
                ? "Contact family today and schedule meeting."
                : student.daysToRenewal <= 14
                  ? "Send meeting invitation today."
                  : "Begin preparation, notify parent."}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              Goals
            </h4>
            <p className="text-sm text-muted-foreground">
              2 active goals, 1 approaching target
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              Next Step
            </h4>
            <p className="text-sm text-muted-foreground">
              {student.tier === "overdue"
                ? "Renewal overdue — contact family today and schedule meeting"
                : student.tier === "due-soon"
                  ? `${student.daysToRenewal} days to renewal — send meeting invitation today`
                  : student.tier === "upcoming"
                    ? `${Math.ceil(student.daysToRenewal / 7)} weeks — begin preparation, notify parent`
                    : "On schedule — review in 6 weeks"}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function CaseloadInsight() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const { data: allStudents = [], isLoading } = useStudents();

  // IEP renewal dates from shared DEMO_COMMITMENTS (one source of truth)
  const iepRenewalDates: Record<string, string> = {
    s2: "2026-06-20", // Maya Okonkwo
    s3: "2026-06-18", // Tyler Reyes
    s5: "2026-07-10", // Marcus Brown
  };

  const students: StudentInsight[] = allStudents
    .filter((s) => s.specialPopulations?.some((p) => p.type === "iep"))
    .map((s) => {
      const renewalDate = iepRenewalDates[s.id] ?? "2026-09-01";
      const daysToRenewal = Math.round(
        (new Date(renewalDate).getTime() - Date.now()) / 86400000,
      );
      const tier: StudentInsight["tier"] =
        daysToRenewal < 0
          ? "overdue"
          : daysToRenewal <= 14
            ? "due-soon"
            : daysToRenewal <= 45
              ? "upcoming"
              : "future";
      const flags: string[] = [];
      if (s.specialPopulations?.some((p) => p.type === "iep"))
        flags.push("IEP");
      if (s.specialPopulations?.some((p) => p.type === "ell"))
        flags.push("ELL");
      if (s.specialPopulations?.some((p) => p.type === "gifted"))
        flags.push("Gifted");
      if (s.specialPopulations?.some((p) => p.type === "medical_alert"))
        flags.push("Medical");
      const gradeTrajectory: StudentInsight["gradeTrajectory"] =
        s.trajectory === "slipping"
          ? "declining"
          : s.trajectory === "thriving"
            ? "improving"
            : "stable";
      return {
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        grade: s.grade,
        renewalDate,
        daysToRenewal,
        tier,
        attendanceRate: s.attendanceRate ?? 90,
        gradeTrajectory,
        flags,
        openCommitments: 0,
      };
    });

  const total = students.length;
  const renewalsDueThisWeek = students.filter(
    (s) => s.tier === "due-soon",
  ).length;
  const overdueRenewals = students.filter((s) => s.tier === "overdue").length;
  const gradeConcerns = students.filter(
    (s) => s.gradeTrajectory === "declining",
  ).length;
  const attendanceConcerns = students.filter(
    (s) => s.attendanceRate < 85,
  ).length;
  const openCommitments = students.reduce(
    (sum, s) => sum + s.openCommitments,
    0,
  );

  return (
    <PageLayout>
      <PageHeader title="Caseload Insight" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <KPICard label="Total Students" value={total} />
        <KPICard
          label="Renewals Due This Week"
          value={renewalsDueThisWeek}
          variant="warning"
        />
        <KPICard
          label="Overdue Renewals"
          value={overdueRenewals}
          variant="danger"
        />
        <KPICard
          label="Grade Concerns"
          value={gradeConcerns}
          variant="warning"
        />
        <KPICard
          label="Attendance Concerns"
          value={attendanceConcerns}
          variant="danger"
        />
        <KPICard
          label="Open Commitments"
          value={openCommitments}
          variant="info"
        />
      </div>

      <SectionCard>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <Skeleton key={`ci-sk-${n}`} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No students in your caseload"
            description="IEP students will appear here when assigned."
          />
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="caseload-insight.grid"
          >
            {students.map((student, i) => (
              <StudentCard
                key={student.id}
                student={student}
                index={i}
                isExpanded={expandedCard === i}
                onToggle={() => setExpandedCard(expandedCard === i ? null : i)}
              />
            ))}
          </div>
        )}
      </SectionCard>
    </PageLayout>
  );
}
