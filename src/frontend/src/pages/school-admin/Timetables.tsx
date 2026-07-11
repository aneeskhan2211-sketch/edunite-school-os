import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  useGenerateTimetable,
  useMasterTimetable,
  useScheduleConflicts,
} from "@/hooks/backend/schedule";
import { useStaff } from "@/hooks/backend/students";
import { AlertTriangle, CheckCircle2, Loader2, Sparkles } from "lucide-react";

export default function SchoolAdminTimetables() {
  const { data: courses, isLoading } = useCourses();
  const { data: staff } = useStaff();
  const { data: timetable = [] } = useMasterTimetable();
  const { data: conflicts = [] } = useScheduleConflicts();
  const generate = useGenerateTimetable();

  const staffById = Object.fromEntries((staff ?? []).map((s) => [s.id, s]));
  // Course → its timetable slot (period + room) from the master timetable.
  const slotByCourse = Object.fromEntries(
    (timetable ?? []).map((m: any) => [m.courseId, m]),
  );

  return (
    <PageLayout width="full">
      <PageHeader
        title="Timetables"
        subtitle="Course schedule, teacher assignments, and room allocation"
        actions={
          <Button
            type="button"
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
            data-ocid="school_admin_timetables.generate_button"
          >
            {generate.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden />
            )}
            {generate.isPending ? "Generating…" : "Auto-generate timetable"}
          </Button>
        }
      />

      {/* Schedule grid */}
      <SectionCard title="Course Schedule" className="mb-5">
        {isLoading ? (
          <Skeleton rows={5} rowHeight="h-12" />
        ) : (
          <Table aria-label="Course schedule">
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody data-ocid="school_admin_timetables.schedule_table">
              {courses?.map((c, i) => {
                const teacher = staffById[c.teacherId];
                return (
                  <TableRow
                    key={c.id}
                    data-ocid={`school_admin_timetables.row.${i + 1}`}
                  >
                    <TableCell className="font-medium text-foreground">
                      {c.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {slotByCourse[c.id]?.period ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {slotByCourse[c.id]?.room ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {teacher
                        ? `${teacher.firstName} ${teacher.lastName}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral">Gr {c.grade}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      {/* Schedule health — conflict detector */}
      <SectionCard title="Schedule Health">
        {conflicts.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
            No scheduling conflicts detected — every teacher and room is clear.
          </div>
        ) : (
          <div
            className="space-y-2"
            data-ocid="school_admin_timetables.conflicts"
          >
            <p className="text-xs text-muted-foreground mb-1">
              {conflicts.length} conflict
              {conflicts.length > 1 ? "s" : ""} detected:
            </p>
            {conflicts.map((c: string) => (
              <div
                key={c}
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2"
              >
                <AlertTriangle
                  className="h-4 w-4 text-destructive mt-0.5 shrink-0"
                  aria-hidden
                />
                <span className="text-sm text-foreground">{c}</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageLayout>
  );
}
