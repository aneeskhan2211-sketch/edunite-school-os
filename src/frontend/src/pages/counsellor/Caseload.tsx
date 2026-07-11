import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DistributionBar,
  InsightBanner,
  MetricCard,
  type Segment,
  type Tone,
} from "@/components/ui/insight";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateCommitment,
  useUnderstandingSignals,
} from "@/hooks/backend/pastoral";
import { useStudents } from "@/hooks/backend/students";
import { useCounsellorCaseload } from "@/hooks/backend/support";
import { useRoleStore } from "@/store/roleStore";
import { Link } from "@tanstack/react-router";
import { AlertCircle, AlertTriangle, CircleCheck, Users } from "lucide-react";
import { useState } from "react";

function healthTone(attendance: number, gpa?: number | null): Tone {
  if (attendance < 85 || (gpa != null && gpa < 2.0)) return "danger";
  if (attendance < 90 || (gpa != null && gpa < 2.5)) return "warning";
  return "success";
}

const TRAJECTORY_LABEL: Record<string, string> = {
  thriving: "Thriving",
  slipping: "Declining",
  steady: "Steady",
  coasting: "Coasting",
};

const TRAJECTORY_VARIANT: Record<
  string,
  "success" | "danger" | "warning" | "neutral"
> = {
  thriving: "success",
  slipping: "danger",
  steady: "neutral",
  coasting: "warning",
};

export default function Caseload() {
  const { currentUser } = useRoleStore();
  const { data: caseloadIds, isLoading: loadingCaseload } =
    useCounsellorCaseload(currentUser?.id ?? "");
  const { data: students, isLoading: loadingStudents } = useStudents();
  const { data: signals, isLoading: loadingSignals } =
    useUnderstandingSignals();
  const createCommitment = useCreateCommitment();

  const [showFollowUpForm, setShowFollowUpForm] = useState<
    Record<string, boolean>
  >({});
  const [followUpType, setFollowUpType] = useState<Record<string, string>>({});
  const [followUpDate, setFollowUpDate] = useState<Record<string, string>>({});
  const [followUpSuccess, setFollowUpSuccess] = useState<
    Record<string, boolean>
  >({});

  const isLoading = loadingCaseload || loadingStudents || loadingSignals;

  const caseload = (students ?? [])
    .filter((s) => (caseloadIds ?? []).includes(s.id))
    .sort((a, b) => {
      const urgency: Record<string, number> = {
        risk: 0,
        workload: 1,
        opportunity: 2,
        celebration: 3,
      };
      const aSignal = (signals ?? []).find((sig) => sig.studentId === a.id);
      const bSignal = (signals ?? []).find((sig) => sig.studentId === b.id);
      return (
        (urgency[aSignal?.type ?? "celebration"] ?? 3) -
        (urgency[bSignal?.type ?? "celebration"] ?? 3)
      );
    });

  const tones = caseload.map((s) => healthTone(s.attendanceRate ?? 100, s.gpa));
  const stable = tones.filter((t) => t === "success").length;
  const watch = tones.filter((t) => t === "warning").length;
  const priority = tones.filter((t) => t === "danger").length;
  const healthSegments: Segment[] = [
    { label: "Stable", value: stable, tone: "success", icon: CircleCheck },
    { label: "Watch", value: watch, tone: "warning", icon: AlertTriangle },
    { label: "Priority", value: priority, tone: "danger", icon: AlertCircle },
  ];
  const topRisk = caseload.find(
    (s) => healthTone(s.attendanceRate ?? 100, s.gpa) === "danger",
  );
  const bannerTone: Tone = priority > 0 ? "warning" : "info";
  const bannerText = topRisk
    ? `${topRisk.firstName} ${topRisk.lastName} needs a touchpoint — attendance ${topRisk.attendanceRate ?? 0}%${
        topRisk.gpa != null ? `, GPA ${topRisk.gpa.toFixed(1)}` : ""
      }. ${priority} student${priority === 1 ? "" : "s"} on priority today.`
    : `Your caseload of ${caseload.length} is steady — no students in the priority tier right now.`;

  const toggleFollowUp = (studentId: string) => {
    setShowFollowUpForm((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
    setFollowUpSuccess((prev) => ({ ...prev, [studentId]: false }));
  };

  const submitFollowUp = async (studentId: string) => {
    if (!currentUser?.id) return;
    const type = followUpType[studentId] ?? "Check-in";
    const dueDate = followUpDate[studentId];
    if (!dueDate) return;
    await createCommitment.mutateAsync({
      commitmentType: type,
      ownerId: BigInt(currentUser.id),
      studentId: BigInt(studentId),
      dueDate: BigInt(new Date(dueDate).getTime()),
      description: `${type} for student ${studentId}`,
    });
    setShowFollowUpForm((prev) => ({ ...prev, [studentId]: false }));
    setFollowUpSuccess((prev) => ({ ...prev, [studentId]: true }));
    setTimeout(() => {
      setFollowUpSuccess((prev) => ({ ...prev, [studentId]: false }));
    }, 1500);
  };

  return (
    <PageLayout>
      <PageHeader
        title="Caseload"
        subtitle="Your assigned students, sorted by urgency"
      />

      {!isLoading && caseload.length > 0 && (
        <div className="mb-5 space-y-5">
          <InsightBanner tone={bannerTone}>{bannerText}</InsightBanner>
          <div className="grid grid-cols-3 gap-3">
            <MetricCard
              label="Caseload"
              value={caseload.length}
              sub="students"
            />
            <MetricCard
              label="Priority"
              value={priority}
              sub={priority ? "need a touchpoint" : "none"}
            />
            <MetricCard label="Stable" value={stable} sub="on track" />
          </div>
          <SectionCard title="Caseload health" className="py-4">
            <DistributionBar segments={healthSegments} />
          </SectionCard>
        </div>
      )}

      <SectionCard>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((key) => (
              <div
                key={key}
                className="animate-pulse h-16 w-full rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : caseload.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students assigned to your caseload"
            description="Your caseload is empty."
          />
        ) : (
          <ul className="divide-y divide-border" data-ocid="caseload.list">
            {caseload.map((student, i) => {
              const signal = (signals ?? []).find(
                (sig) => sig.studentId === student.id,
              );
              const trajectory = student.trajectory ?? "steady";
              return (
                <li
                  key={student.id}
                  className="py-4"
                  data-ocid={`caseload.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        to={`/teacher/student/${student.id}` as never}
                        text-coral
                        data-ocid={`caseload.student_link.${i + 1}`}
                      >
                        {student.firstName} {student.lastName}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Grade {student.grade}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge
                        variant={TRAJECTORY_VARIANT[trajectory] ?? "default"}
                        label={TRAJECTORY_LABEL[trajectory] ?? trajectory}
                      />
                      {signal ? (
                        <StatusBadge
                          variant={
                            signal.type === "risk"
                              ? "danger"
                              : signal.type === "opportunity"
                                ? "success"
                                : signal.type === "celebration"
                                  ? "info"
                                  : "warning"
                          }
                          label={signal.type}
                        />
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFollowUp(student.id)}
                      data-ocid={`caseload.followup_button.${i + 1}`}
                    >
                      Follow-up
                    </Button>
                    {followUpSuccess[student.id] && (
                      <span className="text-sm text-success">
                        Follow-up created
                      </span>
                    )}
                  </div>

                  {showFollowUpForm[student.id] && (
                    <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`followup-type-${student.id}`}
                          className="text-sm font-medium text-foreground"
                        >
                          Type
                        </Label>
                        <Select
                          value={followUpType[student.id] ?? "Check-in"}
                          onValueChange={(val) =>
                            setFollowUpType((prev) => ({
                              ...prev,
                              [student.id]: val,
                            }))
                          }
                        >
                          <SelectTrigger
                            id={`followup-type-${student.id}`}
                            data-ocid={`caseload.followup_type.${i + 1}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Check-in">Check-in</SelectItem>
                            <SelectItem value="Intervention">
                              Intervention
                            </SelectItem>
                            <SelectItem value="Referral">Referral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`followup-date-${student.id}`}
                          className="text-sm font-medium text-foreground"
                        >
                          Due date
                        </Label>
                        <Input
                          id={`followup-date-${student.id}`}
                          type="date"
                          value={followUpDate[student.id] ?? ""}
                          onChange={(e) =>
                            setFollowUpDate((prev) => ({
                              ...prev,
                              [student.id]: e.target.value,
                            }))
                          }
                          data-ocid={`caseload.followup_date.${i + 1}`}
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => submitFollowUp(student.id)}
                        disabled={
                          createCommitment.isPending ||
                          !followUpDate[student.id]
                        }
                        data-ocid={`caseload.followup_submit.${i + 1}`}
                      >
                        {createCommitment.isPending
                          ? "Saving…"
                          : "Create follow-up"}
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </PageLayout>
  );
}
