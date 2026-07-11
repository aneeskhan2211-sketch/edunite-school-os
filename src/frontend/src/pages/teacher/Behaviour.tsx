import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useIncidents,
  useLogIncident,
  useUpdateIncidentStatus,
} from "@/hooks/backend/pastoral";
import { useStudents } from "@/hooks/backend/students";
import type { IncidentSeverity, IncidentStatus } from "@/types";
import { AlertTriangle, Clock } from "lucide-react";
import { useState } from "react";

const SEVERITY_BADGE: Record<
  string,
  "danger" | "warning" | "info" | "neutral"
> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "info",
};

const STATUS_OPTIONS: IncidentStatus[] = [
  "logged",
  "routed",
  "under_review",
  "follow_up",
  "closed",
];

export default function TeacherBehaviour() {
  const { data: incidents, isLoading } = useIncidents();
  const { data: students } = useStudents();
  const getStudent = (id: string) => students?.find((s) => s.id === id);

  const [showLogForm, setShowLogForm] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [severity, setSeverity] = useState<IncidentSeverity>("low");
  const [description, setDescription] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const logMutation = useLogIncident();
  const updateStatusMutation = useUpdateIncidentStatus();

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !description.trim()) return;
    const student = students?.find(
      (s) =>
        `${s.firstName ?? ""} ${s.lastName ?? ""}`.toLowerCase() ===
        studentName.trim().toLowerCase(),
    );
    logMutation.mutate(
      {
        studentId: BigInt(student?.id ?? "0"),
        reportedBy: BigInt(1),
        description: description.trim(),
        severity,
        date: new Date().toISOString().slice(0, 10),
      },
      {
        onSuccess: () => {
          setShowLogForm(false);
          setStudentName("");
          setSeverity("low");
          setDescription("");
          setSavedMsg("Incident logged");
          setTimeout(() => setSavedMsg(""), 2000);
        },
      },
    );
  };

  const handleStatusChange = (
    incidentId: string,
    newStatus: IncidentStatus,
  ) => {
    updateStatusMutation.mutate({
      id: BigInt(incidentId),
      newStatus,
      note: "Status updated via teacher view",
      ctx: { role: "teacher", userId: BigInt(1) },
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title="Behaviour"
        subtitle="Incident log and lifecycle"
        actions={
          <Button
            variant="primary"
            size="sm"
            data-ocid="behaviour.log_incident_button"
            onClick={() => setShowLogForm((v) => !v)}
          >
            {showLogForm ? "Cancel" : "Log Incident"}
          </Button>
        }
      />

      {savedMsg ? (
        <p className="text-sm text-success mb-3 transition-opacity duration-150">
          {savedMsg}
        </p>
      ) : null}

      {showLogForm ? (
        <form
          onSubmit={handleLogSubmit}
          className="space-y-3 mb-6 p-4 rounded-lg border border-border bg-card"
          data-ocid="behaviour.log_incident_form"
        >
          <div>
            <Label
              htmlFor="studentName"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Student name
            </Label>
            <Input
              id="studentName"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Student name"
              className="w-full"
              data-ocid="behaviour.log_input.student_name"
            />
          </div>
          <div>
            <Label
              htmlFor="severity"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Severity
            </Label>
            <Select
              value={severity}
              onValueChange={(val) => setSeverity(val as IncidentSeverity)}
            >
              <SelectTrigger
                id="severity"
                className="w-full"
                data-ocid="behaviour.log_input.severity"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Minor</SelectItem>
                <SelectItem value="medium">Moderate</SelectItem>
                <SelectItem value="high">Serious</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label
              htmlFor="description"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full"
              data-ocid="behaviour.log_input.description"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              size="sm"
              disabled={logMutation.isPending}
              data-ocid="behaviour.log_submit_button"
            >
              {logMutation.isPending ? "Saving…" : "Submit"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowLogForm(false)}
              data-ocid="behaviour.log_cancel_link"
            >
              Cancel
            </Button>
          </div>
          {logMutation.isError ? (
            <p className="text-sm text-destructive">
              Failed to log incident. Please try again.
            </p>
          ) : null}
        </form>
      ) : null}

      {isLoading ? (
        <Skeleton rows={5} rowHeight="h-20" />
      ) : !incidents?.length ? (
        <EmptyState
          icon={AlertTriangle}
          title="No incidents recorded"
          description="This is a good sign — no incidents on record."
        />
      ) : (
        <div className="space-y-4" data-ocid="behaviour.incidents_list">
          {incidents.map((inc, i) => {
            const student = getStudent(inc.studentId);
            const isUpdating =
              updateStatusMutation.isPending &&
              updateStatusMutation.variables?.id === BigInt(inc.id);
            return (
              <SectionCard key={inc.id} className="">
                <a
                  href={`/incidents/${inc.id}`}
                  className="block hover:bg-muted/50 rounded-md transition-colors"
                  data-ocid={`behaviour.incident.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">
                          {student
                            ? `${student.firstName} ${student.lastName}`
                            : inc.studentId}
                        </span>
                        <Badge variant={SEVERITY_BADGE[inc.severity]}>
                          {inc.severity}
                        </Badge>
                        <StatusIndicator status={inc.status} />
                        {/* Stop the inline status control from triggering the
                            wrapping incident link when interacted with. */}
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <Select
                            value={inc.status}
                            onValueChange={(val) =>
                              handleStatusChange(inc.id, val as IncidentStatus)
                            }
                            disabled={isUpdating}
                          >
                            <SelectTrigger
                              className="w-auto"
                              data-ocid={`behaviour.incident_status_select.${i + 1}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s.replace(/_/g, "-")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </span>
                        {isUpdating ? (
                          <span className="text-[11px] text-muted-foreground">
                            Updating…
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {inc.description}
                      </p>
                      {/* Timeline */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {inc.timeline.map((entry, ti) => (
                          <div /* biome-ignore lint/suspicious/noArrayIndexKey: static timeline */
                            key={ti}
                            className="flex items-center gap-1"
                          >
                            {ti > 0 ? (
                              <span className="text-muted-foreground/40 text-xs">
                                ›
                              </span>
                            ) : null}
                            <span className="text-[11px] text-muted-foreground capitalize">
                              {entry.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{inc.date}</span>
                      </div>
                    </div>
                  </div>
                </a>
              </SectionCard>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
