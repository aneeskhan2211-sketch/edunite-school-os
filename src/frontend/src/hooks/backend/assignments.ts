import { toNat } from "@/lib/toNat";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  DEMO_ASSIGNMENTS,
  DEMO_COURSES,
  DEMO_STUDENT_ASSIGNMENTS,
  DEMO_TEACHER_ASSIGNMENTS,
} from "./demo-data";

// ── Hook factory ─────────────────────────────────────────────────────────────

import { getActor, makeQuery } from "./_shared";

export function useAssignments(studentId?: string) {
  const filtered = studentId
    ? DEMO_ASSIGNMENTS.filter((a) => {
        const studentCourses = DEMO_COURSES.filter((c) =>
          c.studentIds.includes(studentId),
        ).map((c) => c.id);
        return studentCourses.includes(a.courseId);
      })
    : DEMO_ASSIGNMENTS;
  return makeQuery(["assignments", studentId ?? "all"], filtered);
}

export function useTeacherAssignments(teacherId?: string) {
  const filtered = teacherId
    ? DEMO_TEACHER_ASSIGNMENTS.filter((a) => {
        const course = DEMO_COURSES.find((c) => c.id === a.courseId);
        return course?.teacherId === teacherId;
      })
    : DEMO_TEACHER_ASSIGNMENTS;
  return makeQuery(["teacher-assignments", teacherId ?? "all"], filtered);
}

export function useStudentAssignmentsWithStatus(studentId?: string) {
  const filtered = studentId
    ? DEMO_STUDENT_ASSIGNMENTS.filter((a) => {
        const studentCourses = DEMO_COURSES.filter((c) =>
          c.studentIds.includes(studentId),
        ).map((c) => c.id);
        return studentCourses.includes(a.courseId);
      })
    : DEMO_STUDENT_ASSIGNMENTS;
  return makeQuery(
    ["student-assignments-status", studentId ?? "all"],
    filtered,
  );
}

export function useCreateAssignment() {
  return useMutation({
    mutationFn: async (data: any) => ({
      ...data,
      id: `assign-${Date.now()}`,
      submissionCount: 0,
    }),
  });
}

export function useDeleteAssignment() {
  return useMutation({ mutationFn: async (id: string) => id });
}

export function useUpdateAssignment() {
  return useMutation({ mutationFn: async (data: any) => data });
}

export function useAssignmentsByCourse(courseId: string, term = "Spring 2026") {
  return useQuery({
    queryKey: ["assignments-by-course", courseId, term],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) {
        return DEMO_ASSIGNMENTS.filter((a) => a.courseId === courseId);
      }
      try {
        return await actor.getAssignmentsByCourse(toNat(courseId), term);
      } catch {
        return DEMO_ASSIGNMENTS.filter((a) => a.courseId === courseId);
      }
    },
    staleTime: 60_000,
  });
}
