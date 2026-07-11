import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { InsightBanner, MetricCard, type Tone } from "@/components/ui/insight";
import { useWhatNeedsYouToday } from "@/hooks/backend/dashboards";
import { useStudent } from "@/hooks/backend/students";
import { useMergedStudentGrades } from "@/hooks/useMergedStudentGrades";
import { useRoleStore } from "@/store/roleStore";
import { BookOpen, Sparkles } from "lucide-react";

const LETTER_VARIANT: Record<
  string,
  "success" | "info" | "warning" | "danger"
> = {
  A: "success",
  B: "info",
  C: "warning",
  D: "danger",
  F: "danger",
};

export default function StudentToday() {
  const { currentUser } = useRoleStore();
  const studentId = currentUser?.id ?? "";
  const { data: self, isLoading: loadingSelf } = useStudent(studentId);
  const { data: signals } = useWhatNeedsYouToday("student");
  const { grades, isLoading: loadingGrades } =
    useMergedStudentGrades(studentId);

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const courseGrades = (grades ?? []).filter((g) => g.courseName);
  const topSignal = signals?.[0];
  const bannerTone: Tone =
    !topSignal || topSignal.type === "celebration" ? "success" : "info";
  const bannerText = topSignal
    ? `${topSignal.headline} — ${topSignal.reason}`
    : "You're on track. Keep showing up and staying on top of your work — nice momentum.";

  if (loadingSelf) {
    return (
      <PageLayout>
        <PageHeader title="Today" subtitle={dateStr} />
        <div className="space-y-4">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={4} />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={`Hi ${currentUser?.firstName ?? "there"}`}
        subtitle={dateStr}
      />

      <div className="space-y-5">
        <InsightBanner tone={bannerTone} icon={Sparkles}>
          {bannerText}
        </InsightBanner>

        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label="GPA"
            value={self?.gpa != null ? self.gpa.toFixed(1) : "—"}
            sub={self?.gpa != null ? "this term" : "no grades yet"}
          />
          <MetricCard
            label="Attendance"
            value={
              self?.attendanceRate != null ? `${self.attendanceRate}%` : "—"
            }
            sub="this term"
          />
          <MetricCard
            label="Courses"
            value={courseGrades.length}
            sub="enrolled"
          />
        </div>

        <SectionCard title="My progress" className="py-4">
          {loadingGrades ? (
            <SkeletonCard lines={3} />
          ) : courseGrades.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No grades posted yet"
              description="Your course grades will appear here once they're entered."
            />
          ) : (
            <ul className="divide-y divide-border">
              {courseGrades.map((g) => {
                const letter = (g.letterGrade ?? "").charAt(0).toUpperCase();
                return (
                  <li
                    key={g.courseId ?? g.courseName}
                    className="flex items-center justify-between py-2.5"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {g.courseName}
                    </span>
                    <div className="flex items-center gap-3">
                      {typeof g.score === "number" && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round(g.score)}%
                        </span>
                      )}
                      {letter && (
                        <StatusBadge
                          variant={LETTER_VARIANT[letter] ?? "neutral"}
                          label={g.letterGrade ?? letter}
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>
    </PageLayout>
  );
}
