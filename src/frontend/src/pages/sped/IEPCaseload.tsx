import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCommitments } from "@/hooks/backend/pastoral";
import { useStudents } from "@/hooks/backend/students";
import type { Commitment, Student } from "@/types";
import { FileText } from "lucide-react";
import React, { useMemo, useState } from "react";

interface IEPStudent {
  studentId: string;
  commitmentId: string;
  name: string;
  grade: number;
  renewalDate: string;
  daysToRenewal: number;
  tier: "overdue" | "due-soon" | "upcoming" | "future";
  nextStep: string;
}

const DEMO_GOALS = [
  { text: "Improve reading comprehension by 1.5 grade levels", progress: 65 },
  {
    text: "Develop self-advocacy skills for classroom accommodations",
    progress: 40,
  },
];

const DEMO_ACCOMMODATIONS = [
  "Extended time on assessments (1.5x)",
  "Preferential seating near instruction",
  "Breaks allowed every 30 minutes",
];

const DEMO_SERVICES = [
  "Speech therapy — 2x weekly, 30 min",
  "Occupational therapy — 1x weekly, 45 min",
];

function tierBorder(tier: IEPStudent["tier"]) {
  switch (tier) {
    case "overdue":
      return "border-l-4 border-destructive/30";
    case "due-soon":
      return "border-l-4 border-warning/30";
    case "upcoming":
      return "border-l-4 border-info/30";
    case "future":
      return "border-l-4 border-border";
  }
}

function tierStatus(tier: IEPStudent["tier"]) {
  switch (tier) {
    case "overdue":
      return { variant: "danger" as const, label: "Overdue" };
    case "due-soon":
      return { variant: "warning" as const, label: "Due Soon" };
    case "upcoming":
      return { variant: "info" as const, label: "Upcoming" };
    case "future":
      return { variant: "neutral" as const, label: "Future" };
  }
}

function daysText(days: number, tier: IEPStudent["tier"]) {
  if (days < 0) {
    return (
      <span className="text-destructive font-medium">
        {Math.abs(days)} days overdue
      </span>
    );
  }
  const colorClass =
    tier === "due-soon"
      ? "text-warning"
      : tier === "upcoming"
        ? "text-info"
        : "text-muted-foreground";
  return <span className={`${colorClass} font-medium`}>in {days} days</span>;
}

function KPICard({
  label,
  value,
  badge,
}: {
  label: string;
  value: number;
  badge?: { variant: "danger" | "warning" | "info"; label: string };
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
        {badge ? (
          <StatusBadge variant={badge.variant} label={badge.label} />
        ) : null}
      </div>
    </div>
  );
}

function IEPDetailPanel() {
  return (
    <div className="mt-4 space-y-4 border-t border-border pt-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Goals</h4>
        <ul className="space-y-2">
          {DEMO_GOALS.map((g, i) => (
            <li key={g.text || i} className="text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-foreground">{g.text}</span>
                <span className="text-xs text-muted-foreground">
                  {g.progress}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${g.progress}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">
          Accommodations
        </h4>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          {DEMO_ACCOMMODATIONS.map((a, i) => (
            <li key={a || i}>{a}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Services</h4>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          {DEMO_SERVICES.map((s, i) => (
            <li key={s || i}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function computeTier(days: number): IEPStudent["tier"] {
  if (days < 0) return "overdue";
  if (days <= 7) return "due-soon";
  if (days <= 45) return "upcoming";
  return "future";
}

function computeNextStep(tier: IEPStudent["tier"], days: number): string {
  if (tier === "overdue")
    return `Renewal ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue — contact family today and schedule meeting`;
  if (tier === "due-soon")
    return `${days} day${days !== 1 ? "s" : ""} to renewal — send meeting invitation today`;
  if (tier === "upcoming")
    return `${Math.ceil(days / 7)} week${Math.ceil(days / 7) !== 1 ? "s" : ""} — begin preparation, notify parent`;
  return "On schedule — review in 6 weeks";
}

function buildIEPStudents(
  commitments: Commitment[],
  studentList: Student[],
  overrides: Record<string, { renewalDate: string }>,
): IEPStudent[] {
  const studentMap = new Map(studentList.map((s) => [s.id, s]));
  return commitments
    .filter((c) => c.type === "iep_renewal" && c.studentId)
    .map((c) => {
      const student = studentMap.get(c.studentId!);
      if (!student) return null;
      const renewalDate = overrides[c.id]?.renewalDate ?? c.dueDate;
      const daysToRenewal = Math.round(
        (new Date(renewalDate).getTime() - Date.now()) / 86_400_000,
      );
      const tier = computeTier(daysToRenewal);
      return {
        studentId: student.id,
        commitmentId: c.id,
        name: `${student.firstName} ${student.lastName}`,
        grade: student.grade,
        renewalDate,
        daysToRenewal,
        tier,
        nextStep: computeNextStep(tier, daysToRenewal),
      } satisfies IEPStudent;
    })
    .filter((x): x is IEPStudent => x !== null);
}

export default function IEPCaseload() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editDate, setEditDate] = useState("");
  // Local overrides for renewed / updated dates (UI-only until backend mutation exists)
  const [dateOverrides, setDateOverrides] = useState<
    Record<string, { renewalDate: string }>
  >({});
  const [renewedIds, setRenewedIds] = useState<Set<string>>(new Set());

  const { data: allCommitments = [], isLoading: commitmentsLoading } =
    useCommitments();
  const { data: allStudents = [], isLoading: studentsLoading } = useStudents();
  const isLoading = commitmentsLoading || studentsLoading;

  const baseStudents = useMemo(
    () => buildIEPStudents(allCommitments, allStudents, dateOverrides),
    [allCommitments, allStudents, dateOverrides],
  );

  // Apply renewed status on top
  const students = useMemo(
    () =>
      baseStudents.map((s) => {
        if (!renewedIds.has(s.commitmentId)) return s;
        const renewalDate = "2027-06-15";
        const daysToRenewal = Math.round(
          (new Date(renewalDate).getTime() - Date.now()) / 86_400_000,
        );
        return {
          ...s,
          tier: "future" as const,
          daysToRenewal,
          renewalDate,
          nextStep: "On schedule — review in 6 weeks",
        };
      }),
    [baseStudents, renewedIds],
  );

  const sorted = [...students].sort((a, b) => {
    const order = { overdue: 0, "due-soon": 1, upcoming: 2, future: 3 };
    return order[a.tier] - order[b.tier];
  });

  const total = students.length;
  const dueThisWeek = students.filter((s) => s.tier === "due-soon").length;
  const overdue = students.filter((s) => s.tier === "overdue").length;
  const upcoming = students.filter((s) => s.tier === "upcoming").length;

  function handleMarkRenewed(commitmentId: string) {
    setRenewedIds((prev) => new Set([...prev, commitmentId]));
    setExpandedRow(null);
  }

  function handleUpdateDate(commitmentId: string) {
    if (!editDate) return;
    setDateOverrides((prev) => ({
      ...prev,
      [commitmentId]: { renewalDate: editDate },
    }));
    setEditingRow(null);
    setEditDate("");
  }

  return (
    <PageLayout width="wide">
      <PageHeader title="IEP Caseload" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total IEP Students" value={total} />
        <KPICard
          label="Due This Week"
          value={dueThisWeek}
          badge={{ variant: "danger", label: "Action needed" }}
        />
        <KPICard
          label="Overdue"
          value={overdue}
          badge={{ variant: "danger", label: "Urgent" }}
        />
        <KPICard
          label="Upcoming"
          value={upcoming}
          badge={{ variant: "info", label: "Soon" }}
        />
      </div>

      <SectionCard>
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <Skeleton
                key={`iep-sk-${n}`}
                className="h-14 w-full rounded-lg"
              />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No IEP students assigned"
            description="Students with active IEPs will appear here."
          />
        ) : (
          <Table data-ocid="iep-caseload.table">
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Renewal Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Step</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((student, i) => {
                const status = tierStatus(student.tier);
                const isExpanded = expandedRow === i;
                const isEditing = editingRow === i;
                return (
                  <React.Fragment key={student.commitmentId}>
                    <TableRow
                      className={`cursor-pointer hover:bg-muted/40 transition-colors ${tierBorder(student.tier)}`}
                      onClick={() => setExpandedRow(isExpanded ? null : i)}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ")
                          setExpandedRow(isExpanded ? null : i);
                      }}
                      data-ocid={`iep-caseload.row.${i + 1}`}
                    >
                      <TableCell className="font-medium text-foreground">
                        {student.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.grade}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.renewalDate}
                      </TableCell>
                      <TableCell>
                        {daysText(student.daysToRenewal, student.tier)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          variant={status.variant}
                          label={status.label}
                        />
                      </TableCell>
                      <TableCell className="text-foreground max-w-xs">
                        {student.nextStep}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkRenewed(student.commitmentId);
                            }}
                            data-ocid={`iep-caseload.renew_button.${i + 1}`}
                          >
                            Mark Renewed
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingRow(isEditing ? null : i);
                              setEditDate(student.renewalDate);
                            }}
                            data-ocid={`iep-caseload.update_date_button.${i + 1}`}
                          >
                            Update Date
                          </Button>
                        </div>
                        {isEditing ? (
                          <div
                            className="mt-2 flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            <Input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              data-ocid={`iep-caseload.date_input.${i + 1}`}
                            />
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              onClick={() =>
                                handleUpdateDate(student.commitmentId)
                              }
                            >
                              Save
                            </Button>
                          </div>
                        ) : null}
                      </TableCell>
                    </TableRow>
                    {isExpanded ? (
                      <TableRow>
                        <TableCell colSpan={7} className="px-2 pb-4">
                          <IEPDetailPanel />
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </PageLayout>
  );
}
