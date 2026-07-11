import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIncident, useUpdateIncidentStatus } from "@/hooks/backend/pastoral";
import { useRole } from "@/hooks/useRole";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  MessageSquare,
  User,
} from "lucide-react";

const statusToVariant = (status: string) => {
  switch (status) {
    case "logged":
    case "routed":
      return "info";
    case "under_review":
      return "warning";
    case "closed":
      return "success";
    case "follow_up":
      return "neutral";
    default:
      return "neutral";
  }
};

export default function IncidentDetailPage() {
  const params = useParams({ strict: false }) as { incidentId?: string };
  const incidentId = params.incidentId || "";
  const navigate = useNavigate();
  const { data: incident, isLoading, error } = useIncident(incidentId);
  const updateStatus = useUpdateIncidentStatus();
  const { role } = useRole();

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader title="Incident Detail" actions={[]} />
        <div className="space-y-4 p-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </PageLayout>
    );
  }

  if (error || !incident) {
    return (
      <PageLayout>
        <PageHeader title="Incident Detail" actions={[]} />
        <EmptyState
          title="Incident not found"
          description="The incident you are looking for does not exist."
          action={{ label: "Go back", onClick: () => navigate({ to: ".." }) }}
        />
      </PageLayout>
    );
  }

  const canReview =
    role === "principal" || role === "schoolAdmin" || role === "counsellor";
  const canAssignConsequence = role === "principal" || role === "schoolAdmin";
  const canClose = role === "principal" || role === "schoolAdmin";
  const statusOrder = [
    "logged",
    "routed",
    "under_review",
    "closed",
    "follow_up",
  ];
  const _currentStatusIndex = statusOrder.indexOf(incident.status);

  return (
    <PageLayout>
      <PageHeader
        title={`Incident — ${incident.id}`}
        actions={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate({ to: ".." })}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        }
      />
      <div className="space-y-4 p-4">
        <SectionCard title="Details">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Student</span>
              <div className="font-medium">
                <a
                  href={`/students/${incident.studentId}`}
                  className="hover:underline"
                >
                  {incident.studentId}
                </a>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Status</span>
              <div>
                <StatusBadge
                  variant={statusToVariant(incident.status)}
                  label={incident.status}
                />
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Severity</span>
              <div className="font-medium">{incident.severity}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Reported by</span>
              <div className="font-medium">{incident.reportedBy}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Date</span>
              <div className="font-medium">
                {new Date(incident.date).toLocaleDateString()}
              </div>
            </div>
            {incident.routedTo && (
              <div>
                <span className="text-muted-foreground">Assigned to</span>
                <div className="font-medium">{incident.routedTo}</div>
              </div>
            )}
          </div>
          <div className="mt-4">
            <span className="text-muted-foreground">Description</span>
            <p className="mt-1 text-sm">{incident.description}</p>
          </div>
        </SectionCard>

        <SectionCard title="Timeline">
          <div className="space-y-2">
            {incident.timeline.map((event, _i) => (
              <div
                key={`${event.status}-${event.timestamp}`}
                className="flex items-start gap-3 text-sm border-l-2 border-border pl-3 py-1"
              >
                <div className="flex-1">
                  <div className="font-medium">{event.status}</div>
                  <div className="text-muted-foreground">
                    {event.actor} — {new Date(event.timestamp).toLocaleString()}
                  </div>
                  {event.note && <p className="mt-1">{event.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {canReview && (
          <SectionCard title="Actions">
            <div className="flex flex-wrap gap-2">
              {(incident.status === "logged" ||
                incident.status === "routed") && (
                <Button
                  size="sm"
                  onClick={() =>
                    updateStatus.mutate({
                      id: BigInt(incident.id),
                      newStatus: "under_review",
                      note: "",
                      ctx: { role, userId: BigInt(0) },
                    })
                  }
                >
                  Mark Under Review
                </Button>
              )}
              {incident.status === "under_review" && canAssignConsequence && (
                <Button
                  size="sm"
                  onClick={() =>
                    updateStatus.mutate({
                      id: BigInt(incident.id),
                      newStatus: "closed",
                      note: "",
                      ctx: { role, userId: BigInt(0) },
                    })
                  }
                >
                  Assign Consequence & Close
                </Button>
              )}
              {incident.status === "closed" && canClose && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateStatus.mutate({
                      id: BigInt(incident.id),
                      newStatus: "follow_up",
                      note: "",
                      ctx: { role, userId: BigInt(0) },
                    })
                  }
                >
                  Create Follow-up
                </Button>
              )}
            </div>
          </SectionCard>
        )}
      </div>
    </PageLayout>
  );
}
