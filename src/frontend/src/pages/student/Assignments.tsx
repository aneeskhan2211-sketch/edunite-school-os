import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStudentAssignmentsWithStatus } from "@/hooks/backend/assignments";
import { useRoleStore } from "@/store/roleStore";
import { CheckCircle, ChevronDown, ChevronRight, Send } from "lucide-react";
import { useState } from "react";

type Tab = "upcoming" | "all" | "submitted";

const _TYPE_LABELS: Record<string, string> = {
  homework: "Homework",
  quiz: "Quiz",
  test: "Test",
  project: "Project",
  essay: "Essay",
};

function relDate(ts: number): { label: string; cls: string } {
  const d = Math.ceil((ts - Date.now()) / 86400000);
  if (d < 0) return { label: "Overdue", cls: "text-destructive font-medium" };
  if (d === 0) return { label: "Due today", cls: "text-warning font-medium" };
  if (d === 1) return { label: "Due tomorrow", cls: "text-warning" };
  return { label: `In ${d} days`, cls: "text-foreground/60" };
}

export default function StudentAssignments() {
  const { currentUser } = useRoleStore();
  const { data: assignments = [], isLoading } = useStudentAssignmentsWithStatus(
    currentUser?.id,
  );
  const [tab, setTab] = useState<Tab>("upcoming");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submittedLocally, setSubmittedLocally] = useState<Set<string>>(
    new Set(),
  );
  const [submissionText, setSubmissionText] = useState<Record<string, string>>(
    {},
  );

  const upcoming = assignments
    .filter(
      (a: any) =>
        a.submissionStatus === "notSubmitted" && !submittedLocally.has(a.id),
    )
    .sort((a: any, b: any) => a.dueDate - b.dueDate);
  const submitted = assignments.filter(
    (a: any) =>
      a.submissionStatus !== "notSubmitted" || submittedLocally.has(a.id),
  );
  const all = assignments;

  const list =
    tab === "upcoming" ? upcoming : tab === "submitted" ? submitted : all;

  const grouped =
    tab === "all"
      ? list.reduce((acc: Record<string, any[]>, a: any) => {
          const k = a.courseName || "Other";
          if (!acc[k]) acc[k] = [];
          acc[k].push(a);
          return acc;
        }, {})
      : null;

  const handleSubmit = (id: string) => {
    setSubmittedLocally((prev) => new Set([...prev, id]));
    setExpandedId(null);
  };

  const tabs: Tab[] = ["upcoming", "all", "submitted"];
  const tabLabels = {
    upcoming: "Upcoming",
    all: "All",
    submitted: "Submitted",
  };

  const renderRow = (a: any) => {
    const isSubmitted =
      a.submissionStatus !== "notSubmitted" || submittedLocally.has(a.id);
    const { label, cls } = relDate(a.dueDate);
    return (
      <div
        key={a.id}
        className="border border-border rounded-lg mb-2 overflow-hidden"
      >
        <button
          type="button"
          onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50"
        >
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded flex-shrink-0">
            {a.courseName}
          </span>
          <span className="flex-1 font-medium text-sm">{a.title}</span>
          <span className={`text-xs ${cls} flex-shrink-0`}>{label}</span>
          <span className="text-xs text-foreground/50 flex-shrink-0">
            {a.points}pts
          </span>
          {isSubmitted ? (
            <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
          ) : expandedId === a.id ? (
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
          )}
        </button>
        {expandedId === a.id && (
          <div className="px-4 pb-3 border-t border-border">
            {a.description && (
              <p className="text-sm text-foreground/70 mt-2 mb-3">
                {a.description}
              </p>
            )}
            {isSubmitted ? (
              <div className="flex items-center gap-2 text-sm text-success mt-2">
                <CheckCircle className="h-4 w-4" /> Submitted
                {a.earnedPoints != null && (
                  <span className="text-foreground/60 ml-2">
                    {a.earnedPoints}/{a.points} points
                  </span>
                )}
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <Textarea
                  placeholder="Type your submission here..."
                  value={submissionText[a.id] || ""}
                  onChange={(e) =>
                    setSubmissionText((prev) => ({
                      ...prev,
                      [a.id]: e.target.value,
                    }))
                  }
                  className="w-full resize-none min-h-[80px]"
                />
                <Button type="button" onClick={() => handleSubmit(a.id)}>
                  <Send className="h-3 w-3" /> Submit
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <PageLayout>
      <PageHeader title="Assignments" />
      <div className="flex gap-1 border-b border-border mb-4">
        {tabs.map((t) => (
          <Button
            type="button"
            key={t}
            size="sm"
            variant={tab === t ? "default" : "ghost"}
            onClick={() => setTab(t)}
          >
            {tabLabels[t]}
          </Button>
        ))}
      </div>
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse bg-muted h-14 rounded-lg" />
          ))}
        </div>
      )}
      {!isLoading && list.length === 0 && (
        <div className="text-center py-12 text-foreground/50">
          {tab === "upcoming"
            ? "No upcoming assignments"
            : tab === "submitted"
              ? "Nothing submitted yet"
              : "No assignments"}
        </div>
      )}
      {!isLoading && !grouped && list.map((a: any) => renderRow(a))}
      {!isLoading &&
        grouped &&
        Object.entries(grouped).map(([course, items]) => (
          <div key={course} className="mb-4">
            <div className="text-sm font-semibold text-foreground/60 uppercase tracking-wide mb-2">
              {course}
            </div>
            {(items as any[]).map((a) => renderRow(a))}
          </div>
        ))}
    </PageLayout>
  );
}
