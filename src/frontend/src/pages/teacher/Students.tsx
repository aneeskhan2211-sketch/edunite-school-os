import { StudentsListSkeleton } from "@/components/PageSkeletons";
import { Skeleton } from "@/components/Skeleton";
import { PageLayout, SectionCard } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useStudents } from "@/hooks/backend/students";
import type { Student } from "@/types";
import { Link } from "@tanstack/react-router";
import { ChevronRight, GraduationCap, Search } from "lucide-react";
import { useState } from "react";

const FLAG_VARIANTS: Record<
  string,
  "info" | "neutral" | "warning" | "danger" | "success"
> = {
  IEP: "neutral",
  ELL: "info",
  Gifted: "success",
  "504": "warning",
  "McKinney-Vento": "danger",
};

const TRAJECTORY_VARIANTS: Record<
  string,
  "success" | "warning" | "danger" | "neutral"
> = {
  thriving: "success",
  steady: "neutral",
  coasting: "warning",
  slipping: "danger",
};

function gpaColor(gpa: number): string {
  if (gpa >= 3.5) return "text-success";
  if (gpa >= 2.5) return "text-foreground";
  return "text-destructive";
}

function flagsFromSpecialPops(pops: Student["specialPopulations"]): string[] {
  return pops.map((p) => {
    switch (p.type) {
      case "iep":
        return "IEP";
      case "ell":
        return "ELL";
      case "gifted":
        return "Gifted";
      case "mckinney_vento":
        return "McKinney-Vento";
      case "medical_alert":
        return "Medical Alert";
      case "foster_youth":
        return "Foster Youth";
      default:
        return p.type;
    }
  });
}

function StudentCard({ student }: { student: Student }) {
  const fullName = `${student.firstName} ${student.lastName}`;
  const flags = flagsFromSpecialPops(student.specialPopulations);
  return (
    <Link
      to={"/teacher/student/$studentId" as never}
      params={{ studentId: student.id } as never}
      className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
      data-ocid={`students.item.${student.id}`}
    >
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors duration-150 hover:border-primary/40 hover:bg-card/80 group-focus-visible:border-primary">
        {/* Left: avatar + name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold font-display text-sm">
            {fullName
              .split(" ")
              .map((n) => n?.[0] ?? "")
              .join("")}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate font-display text-sm">
              {fullName}
            </p>
            <p className="text-xs text-muted-foreground">
              Grade {student.grade}
            </p>
          </div>
        </div>

        {/* Center: GPA + attendance */}
        <div className="hidden sm:flex items-center gap-6">
          <div className="text-center">
            <p
              className={`text-sm font-bold font-display ${student.gpa != null ? gpaColor(student.gpa) : "text-muted-foreground"}`}
            >
              {student.gpa != null ? student.gpa.toFixed(1) : "—"}
            </p>
            <p className="text-[11px] text-muted-foreground">GPA</p>
          </div>
          <div className="text-center">
            <p
              className={`text-sm font-bold font-display ${
                (student.attendanceRate ?? 0) >= 90
                  ? "text-success"
                  : (student.attendanceRate ?? 0) >= 85
                    ? "text-warning"
                    : "text-destructive"
              }`}
            >
              {student.attendanceRate ?? 0}%
            </p>
            <p className="text-[11px] text-muted-foreground">Attendance</p>
          </div>
        </div>

        {/* Flags + trajectory */}
        <div className="hidden md:flex items-center gap-2 flex-wrap justify-end max-w-[220px]">
          {student.trajectory ? (
            <Badge
              variant={TRAJECTORY_VARIANTS[student.trajectory] ?? "neutral"}
              className="capitalize text-[10px] px-2 py-0.5"
            >
              {student.trajectory}
            </Badge>
          ) : null}
          {flags.map((flag) => (
            <Badge
              key={flag}
              variant={FLAG_VARIANTS[flag] ?? "neutral"}
              className="text-[10px] px-2 py-0.5"
            >
              {flag}
            </Badge>
          ))}
        </div>

        {/* Arrow */}
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const { data: allStudents, isLoading: loading } = useStudents();

  const filtered = (allStudents ?? []).filter((s) =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageLayout title="Students" subtitle="All students you teach">
      <SectionCard>
        {/* Search */}
        <div className="mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search students…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full"
              aria-label="Search students"
              data-ocid="students.search_input"
            />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <StudentsListSkeleton />
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="students.empty_state"
          >
            <GraduationCap
              className="h-10 w-10 text-muted-foreground/40 mb-3"
              aria-hidden
            />
            <p className="text-sm font-semibold text-foreground mb-1">
              No students match your search
            </p>
            <p className="text-xs text-muted-foreground">
              Try a different name or clear your search
            </p>
          </div>
        ) : (
          <div className="space-y-3" data-ocid="students.list">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs text-muted-foreground">
                {filtered.length} student{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
            {filtered.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}
      </SectionCard>
    </PageLayout>
  );
}
