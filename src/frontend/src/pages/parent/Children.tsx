import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { InsightBanner, MetricCard, type Tone } from "@/components/ui/insight";
import { useStudents } from "@/hooks/backend/students";
import { useMergedStudentGrades } from "@/hooks/useMergedStudentGrades";
import { Link } from "@tanstack/react-router";
import { BookOpen, MessageSquareHeart } from "lucide-react";
import { useState } from "react";

// The demo parent's children in the canonical roster. Replaced by a real
// guardian→student link once authentication lands (Phase 3).
const PARENT_CHILD_IDS = ["s1", "s2"];

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

export default function ParentChildren() {
  const { data: allStudents = [] } = useStudents();
  const children = allStudents
    .filter((s) => PARENT_CHILD_IDS.includes(s.id))
    .sort(
      (a, b) => PARENT_CHILD_IDS.indexOf(a.id) - PARENT_CHILD_IDS.indexOf(b.id),
    );

  const [selectedId, setSelectedId] = useState(PARENT_CHILD_IDS[0]);
  const child = children.find((c) => c.id === selectedId) ?? children[0];
  const { grades } = useMergedStudentGrades(child?.id ?? "");

  if (!child) {
    return (
      <PageLayout>
        <PageHeader title="My children" />
        <EmptyState
          icon={BookOpen}
          title="No children linked yet"
          description="Your children's records will appear here once linked."
        />
      </PageLayout>
    );
  }

  const att = child.attendanceRate ?? 0;
  const gpa = child.gpa;
  const needsSupport = att < 85 || (gpa != null && gpa < 2.0);
  const standing = needsSupport ? "Needs support" : "On track";
  const bannerTone: Tone = needsSupport ? "warning" : "success";
  const bannerText = needsSupport
    ? `${child.firstName}'s attendance is ${att}%${
        gpa != null ? ` and GPA is ${gpa.toFixed(1)}` : ""
      } — worth a check-in. The school flags these and a counsellor keeps an eye out.`
    : `${child.firstName} is doing well this term — ${
        gpa != null ? `GPA ${gpa.toFixed(1)}, ` : ""
      }attendance ${att}%. Nothing you need to do right now.`;

  const courseGrades = (grades ?? []).filter((g) => g.courseName);

  return (
    <PageLayout>
      <PageHeader title="My children" />

      {children.length > 1 && (
        <div className="mb-4 flex gap-2">
          {children.map((c) => (
            <Button
              type="button"
              key={c.id}
              size="sm"
              variant={c.id === child.id ? "default" : "outline"}
              onClick={() => setSelectedId(c.id)}
            >
              {c.firstName} {c.lastName}
            </Button>
          ))}
        </div>
      )}

      <div className="space-y-5">
        <InsightBanner tone={bannerTone} icon={MessageSquareHeart}>
          {bannerText}
        </InsightBanner>

        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label="GPA"
            value={gpa != null ? gpa.toFixed(1) : "—"}
            sub={gpa != null ? "this term" : "no grades yet"}
          />
          <MetricCard label="Attendance" value={`${att}%`} sub="this term" />
          <MetricCard
            label="Standing"
            value={standing}
            sub={`Grade ${child.grade}`}
          />
        </div>

        <SectionCard title="Recent grades" className="py-4">
          {courseGrades.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No grades posted yet"
              description="Course grades will appear here once they're entered."
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

        <div className="flex flex-wrap gap-2">
          <Link
            to={`/teacher/student/${child.id}` as never}
            className="rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted/40"
          >
            View full record
          </Link>
          <Link
            to={"/parent/grades" as never}
            className="rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted/40"
          >
            Grades
          </Link>
          <Link
            to={"/parent/attendance" as never}
            className="rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted/40"
          >
            Attendance
          </Link>
          <Link
            to={"/parent/messages" as never}
            className="rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted/40"
          >
            Messages
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
