import type {
  DepartmentStats,
  Role,
  SchoolStats,
  UnderstandingSignal,
} from "@/types";

import { useRole } from "@/hooks/useRole";
import { demoFallback } from "@/lib/devLog";
import { buildRoleContext } from "@/lib/roleContext";
import { useQuery } from "@tanstack/react-query";

import {
  DEMO_COMMITMENTS,
  DEMO_MORNING_PICTURE,
  DEMO_SIGNALS,
  DEMO_STAFF,
  DEMO_STUDENTS,
} from "./demo-data";

// ── Hook factory ─────────────────────────────────────────────────────────────

import { getActor, makeQuery, mapSignal } from "./_shared";

export function useDepartmentStats(department?: string) {
  const departments = ["Mathematics", "Science", "English", "History", "Arts"];
  const stats: DepartmentStats[] = departments.map((d, i) => ({
    department: d,
    teacherCount: [4, 3, 5, 3, 2][i] ?? 3,
    courseCount: [6, 5, 7, 4, 3][i] ?? 4,
    avgGpa: [3.2, 3.4, 3.1, 3.3, 3.5][i] ?? 3.2,
    attendanceRate: [94, 96, 92, 95, 97][i] ?? 94,
  }));
  const filtered = department
    ? stats.filter((s) => s.department === department)
    : stats;
  return makeQuery(["department-stats", department ?? "all"], filtered);
}

export function useSchoolStats() {
  const stats: SchoolStats = {
    totalStudents: DEMO_STUDENTS.length,
    totalStaff: DEMO_STAFF.length,
    attendanceRate: 93,
    avgGpa: 3.3,
    activeIncidents: 1,
    openCommitments: DEMO_COMMITMENTS.filter((c) => c.status !== "completed")
      .length,
  };
  return makeQuery(["school-stats"], stats);
}

export function useWhatNeedsYouToday(role: string) {
  const { userId } = useRole();
  return useQuery({
    queryKey: ["what-needs-you", role],
    queryFn: async (): Promise<UnderstandingSignal[]> => {
      const demo = DEMO_SIGNALS.filter((s) =>
        s.forRoles.includes(role as Role),
      );
      const actor = getActor();
      if (!actor) return demo;
      try {
        const ctx = buildRoleContext(role as Role, userId);
        const raw = (await actor.listSignalsByRole(ctx)) as any[];
        if (!Array.isArray(raw)) return demo;
        return raw.map(mapSignal);
      } catch (e) {
        return demoFallback("whatNeedsYouToday", demo, e);
      }
    },
    staleTime: 60_000,
  });
}

export function useMorningPicture() {
  return makeQuery(["morning-picture"], DEMO_MORNING_PICTURE);
}

export function useDistrictHealthSummary() {
  return useQuery({
    queryKey: ["district-health-summary"],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) {
        return {
          attendanceRate: 89.5,
          averageGPA: 2.8,
          incidentCount: 14n,
          enrollmentCount: 50n,
          staffCount: 20n,
          schoolName: "Lincoln High School",
        };
      }
      try {
        return await actor.getDistrictHealthSummary();
      } catch {
        return {
          attendanceRate: 89.5,
          averageGPA: 2.8,
          incidentCount: 14n,
          enrollmentCount: 50n,
          staffCount: 20n,
          schoolName: "Lincoln High School",
        };
      }
    },
    staleTime: 60_000,
  });
}
