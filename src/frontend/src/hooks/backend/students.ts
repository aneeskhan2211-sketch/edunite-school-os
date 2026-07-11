import type { AttendanceRecord, Commitment, Grade, Incident } from "@/types";

import { useRole } from "@/hooks/useRole";
import { unwrapOpt } from "@/lib/candid";
import { demoFallback } from "@/lib/devLog";
import { buildRoleContext } from "@/lib/roleContext";
import { toNat } from "@/lib/toNat";
import { useQuery } from "@tanstack/react-query";

import { DEMO_STAFF, DEMO_STUDENTS } from "./demo-data";

// ── Hook factory ─────────────────────────────────────────────────────────────

import {
  getActor,
  makeQuery,
  mapRosterRow,
  mapStaff,
  mapStudentRecord,
} from "./_shared";

export function useStudents(_page = 0, _pageSize = 20) {
  const { role, userId } = useRole();
  return useQuery({
    queryKey: ["students", String(_page)],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) return DEMO_STUDENTS;
      try {
        const ctx = buildRoleContext(role, userId);
        const raw = (await actor.getStudentRoster(ctx)) as any[];
        if (!Array.isArray(raw) || raw.length === 0) return DEMO_STUDENTS;
        return raw.map(mapRosterRow);
      } catch (e) {
        return demoFallback("students", DEMO_STUDENTS, e);
      }
    },
    staleTime: 60_000,
  });
}

export function useStudent(id: string) {
  const { role, userId } = useRole();
  return useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      const demo = DEMO_STUDENTS.find((s) => s.id === id) ?? null;
      const actor = getActor();
      if (!actor) return demo;
      const ctx = buildRoleContext(role, userId);
      // Primary: direct record lookup (FERPA-filtered by role).
      try {
        const rec = unwrapOpt<any>(await actor.getStudent(toNat(id), ctx));
        if (rec) return mapStudentRecord(rec);
      } catch (e) {
        demoFallback("student", demo, e);
      }
      // Fallback: the roster carries every visible student (with GPA +
      // attendance), so a FERPA-null / decode hiccup never 404s a real student.
      try {
        const roster = (await actor.getStudentRoster(ctx)) as any[];
        const row = Array.isArray(roster)
          ? roster.find((r) => `s${r.student.id}` === id)
          : undefined;
        if (row) return mapRosterRow(row);
      } catch (e) {
        return demoFallback("student", demo, e);
      }
      return demo;
    },
    staleTime: 60_000,
  });
}

export function useStudentProfile(studentId: string) {
  const student = DEMO_STUDENTS.find((s) => s.id === studentId);
  const profile = student
    ? {
        ...student,
        grades: [] as Grade[],
        attendance: [] as AttendanceRecord[],
        incidents: [] as Incident[],
        commitments: [] as Commitment[],
      }
    : null;
  return makeQuery(["student-profile", studentId], profile);
}

export function useStaff() {
  return useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) return DEMO_STAFF;
      try {
        const raw = (await actor.getStaffMembers()) as any[];
        if (!Array.isArray(raw) || raw.length === 0) return DEMO_STAFF;
        return raw.map(mapStaff);
      } catch (e) {
        return demoFallback("staff", DEMO_STAFF, e);
      }
    },
    staleTime: 60_000,
  });
}
