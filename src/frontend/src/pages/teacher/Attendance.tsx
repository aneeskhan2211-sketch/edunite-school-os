import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { Button } from "@/components/ui/button";
import {
  useAttendanceRoster,
  useSaveAttendance,
} from "@/hooks/backend/attendance";
import { useTeacherCourses } from "@/hooks/backend/courses";
import { useStudents } from "@/hooks/backend/students";
import { useRoleStore } from "@/store/roleStore";
import type { AttendanceStatus } from "@/types";
import { ClipboardCheck } from "lucide-react";
import { useState } from "react";

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: "P",
  absent: "A",
  tardy: "T",
  excused: "E",
  unknown: "?",
};

export default function TeacherAttendance() {
  const { currentUser } = useRoleStore();
  const { data: courses } = useTeacherCourses(currentUser?.id);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const courseId = selectedCourseId || courses?.[0]?.id || "";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const todayIso = new Date().toISOString().slice(0, 10);
  const { data: roster, isLoading } = useAttendanceRoster(courseId, todayIso);
  const { data: students } = useStudents();

  const getStudent = (id: string) => students?.find((s) => s.id === id);

  const [localRoster, setLocalRoster] = useState<
    Record<string, AttendanceStatus>
  >({});

  const setStatus = (recordId: string, status: AttendanceStatus) => {
    setLocalRoster((prev) => ({ ...prev, [recordId]: status }));
  };

  const markAllPresent = () => {
    if (!roster) return;
    const next: Record<string, AttendanceStatus> = {};
    for (const r of roster) {
      next[r.id] = "present";
    }
    setLocalRoster(next);
  };

  const getStatus = (record: { id: string; status: AttendanceStatus }) =>
    localRoster[record.id] ?? record.status;

  const saveAttendance = useSaveAttendance();
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveError, setSaveError] = useState<string>("");

  const handleSave = () => {
    if (!roster) return;
    setSaveStatus("saving");
    setSaveError("");
    const records = roster.map((r) => ({
      studentId: r.studentId,
      date: todayIso,
      status: getStatus(r),
      courseId,
    }));
    saveAttendance.mutate(records, {
      onSuccess: () => {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      },
      onError: (err: any) => {
        setSaveStatus("error");
        setSaveError(err?.message ?? "Failed to save attendance");
      },
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title="Attendance"
        subtitle={`Today, ${today} — mark today's roster`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={markAllPresent}
            data-ocid="attendance.mark_all_present_button"
          >
            Mark all present
          </Button>
        }
      />

      {/* Course selector */}
      <div
        className="flex gap-2 mb-5 flex-wrap"
        data-ocid="attendance.course_tabs"
      >
        {courses?.map((c, i) => (
          <Button
            key={c.id}
            type="button"
            size="sm"
            variant={courseId === c.id ? "default" : "outline"}
            onClick={() => setSelectedCourseId(c.id)}
            data-ocid={`attendance.course_tab.${i + 1}`}
          >
            {c.name}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
          <SkeletonCard lines={1} />
        </div>
      ) : !roster?.length ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No classes today"
          description="No classes are scheduled for today."
        />
      ) : (
        <SectionCard title={`${roster.length} Students`}>
          <div className="space-y-2" data-ocid="attendance.roster_list">
            {roster.map((record, i) => {
              const student = getStudent(record.studentId);
              const name = student
                ? `${student.firstName} ${student.lastName}`
                : record.studentId;
              const status = getStatus(record);
              const rate = student?.attendanceRate;
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                  data-ocid={`attendance.roster_item.${i + 1}`}
                >
                  <div className="flex items-center gap-3">
                    <StudentAvatar name={name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {name}
                      </p>
                      {rate != null ? (
                        <p className="text-xs text-muted-foreground">
                          {rate}% this term
                        </p>
                      ) : null}
                    </div>
                    {rate != null && rate < 85 ? (
                      <span className="inline-flex items-center rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                        {rate}%
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1">
                    {(
                      [
                        "present",
                        "absent",
                        "tardy",
                        "excused",
                      ] as AttendanceStatus[]
                    ).map((s) => (
                      <Button
                        key={s}
                        type="button"
                        size="sm"
                        variant={status === s ? "default" : "outline"}
                        onClick={() => setStatus(record.id, s)}
                        data-ocid={`attendance.status_btn.${s}.${i + 1}`}
                      >
                        {STATUS_LABEL[s]}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-col items-end gap-2">
            {saveStatus === "error" && (
              <p className="text-sm text-destructive">{saveError}</p>
            )}
            {saveStatus === "saved" && (
              <p className="text-sm text-success">Attendance saved</p>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              data-ocid="attendance.save_button"
            >
              {saveStatus === "saving" ? "Saving..." : "Save Attendance"}
            </Button>
          </div>
        </SectionCard>
      )}
    </PageLayout>
  );
}
