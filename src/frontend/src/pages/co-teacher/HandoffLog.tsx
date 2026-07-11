import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight } from "lucide-react";

const HANDOFF_ENTRIES = [
  {
    id: "h1",
    date: "2026-06-10",
    teacher: "Maria Chen",
    note: "Jordan Ellis needs extra time on today’s quiz — IEP accommodation. Seat her near the front.",
    course: "Algebra II",
  },
  {
    id: "h2",
    date: "2026-06-09",
    teacher: "Maria Chen",
    note: "Tyler arrived without materials again. Sent to get them, arrived 10 min late.",
    course: "Algebra II",
  },
  {
    id: "h3",
    date: "2026-06-08",
    teacher: "Maria Chen",
    note: "Pre-Calc group project presentations — Marcus and Aisha are presenting Period 4.",
    course: "Pre-Calculus",
  },
];

export default function HandoffLog() {
  return (
    <PageLayout>
      <PageHeader
        title="Handoff Log"
        subtitle="Notes from the lead teacher for continuity"
      />
      {!HANDOFF_ENTRIES.length ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No handoff notes"
          description="The lead teacher has not left any notes yet."
        />
      ) : (
        <div className="space-y-4" data-ocid="handoff.list">
          {HANDOFF_ENTRIES.map((entry, i) => (
            <SectionCard key={entry.id}>
              <div
                className="flex items-start justify-between gap-4"
                data-ocid={`handoff.item.${i + 1}`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {entry.note}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.teacher} · {entry.course}
                  </p>
                </div>
                <Badge variant="neutral">{entry.date}</Badge>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
