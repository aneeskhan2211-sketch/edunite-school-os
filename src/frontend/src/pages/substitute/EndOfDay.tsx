import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCourses } from "@/hooks/backend/courses";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function EndOfDay() {
  const { data: courses, isLoading } = useCourses();
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [incidents, setIncidents] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <PageLayout>
        <div
          className="flex flex-col items-center justify-center py-24 text-center"
          data-ocid="end-of-day.success_state"
        >
          <CheckCircle2 className="h-12 w-12 text-success mb-4" aria-hidden />
          <h2 className="text-xl font-bold text-foreground mb-1">
            End-of-day summary submitted
          </h2>
          <p className="text-sm text-muted-foreground">
            Thank you, Kevin. Have a great evening.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="End of Day"
        subtitle="Submit your end-of-day summary"
      />
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            /* biome-ignore lint/suspicious/noArrayIndexKey: static skeleton */
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          data-ocid="end-of-day.form"
        >
          <SectionCard title="Attendance Taken">
            <ul className="space-y-3">
              {(courses ?? []).map((course, i) => (
                <li
                  key={course.id}
                  className="flex items-center gap-3"
                  data-ocid={`end-of-day.attendance.item.${i + 1}`}
                >
                  <Checkbox
                    id={`att-${course.id}`}
                    checked={attendance[course.id] ?? false}
                    onCheckedChange={(checked: boolean) =>
                      setAttendance((a) => ({
                        ...a,
                        [course.id]: checked,
                      }))
                    }
                    data-ocid={`end-of-day.attendance.checkbox.${i + 1}`}
                  />
                  <Label
                    htmlFor={`att-${course.id}`}
                    className="text-sm text-foreground"
                  >
                    Period {course.period} — {course.name}
                  </Label>
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard title="Incidents to Report">
            <Textarea
              className="w-full resize-none"
              rows={3}
              placeholder="Describe any incidents that occurred today, or leave blank if none."
              value={incidents}
              onChange={(e) => setIncidents(e.target.value)}
              data-ocid="end-of-day.incidents_textarea"
            />
          </SectionCard>
          <SectionCard title="General Notes">
            <Textarea
              className="w-full resize-none"
              rows={4}
              placeholder="Any other notes for the returning teacher…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              data-ocid="end-of-day.notes_textarea"
            />
          </SectionCard>
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="default"
              data-ocid="end-of-day.submit_button"
            >
              Submit Summary
            </Button>
          </div>
        </form>
      )}
    </PageLayout>
  );
}
