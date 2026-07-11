import { toNat } from "@/lib/toNat";
import type { Grade, GradebookSummary } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  DEMO_CLASS_REPORT,
  DEMO_COURSES,
  DEMO_STUDENT_GRADES,
  DEMO_STUDENT_GRADES_NEW,
  DEMO_TEACHER_ASSIGNMENTS,
} from "./demo-data";

// ── Hook factory ─────────────────────────────────────────────────────────────

import {
  getActor,
  makeQuery,
  safeArray,
  safeCourseName,
  safeLetterGrade,
  safeNumber,
  safeString,
} from "./_shared";

export function useGradebook() {
  const grades: Grade[] = [];
  for (const [studentId, courses] of Object.entries(DEMO_STUDENT_GRADES)) {
    for (const course of courses) {
      for (const a of course.assignments) {
        grades.push({
          id: `${studentId}-${course.courseId}-${a.assignmentId}`,
          studentId,
          courseId: course.courseId,
          assignmentId: a.assignmentId,
          value: safeNumber(a.score),
          maxValue: safeNumber(a.maxPoints),
          weight: safeNumber(a.weight),
          gradedAt: safeString(a.dueDate),
          gradedBy: "staff-1",
        });
      }
    }
  }
  return makeQuery(["gradebook"], grades);
}

export function useGradebookSummary(courseId: string, term = "Spring 2026") {
  const course = DEMO_COURSES.find((c) => c.id === courseId);
  const summary: GradebookSummary = {
    courseId,
    term,
    overloaded: courseId === "c1",
    overloadedWeek: courseId === "c1" ? "Week of Jun 9" : undefined,
    studentSummaries: (course?.studentIds ?? []).map((sid, i) => ({
      studentId: sid,
      currentGrade: [92, 71, 84][i % 3] ?? 80,
      letterGrade: ["A", "C+", "B"][i % 3] ?? "B",
      trend: (["up", "down", "stable"] as const)[i % 3],
      trendDetail: [
        "Up from B last term",
        "Down from B+ over 3 weeks",
        "Consistent",
      ][i % 3],
      recentAssignments: [],
    })),
  };
  return makeQuery(["gradebook", courseId, term], summary);
}

export function useStudentGrades(studentId: string) {
  return useQuery({
    queryKey: ["student-grades", studentId],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) {
        return DEMO_STUDENT_GRADES[studentId] ?? [];
      }
      try {
        const result = await actor.getStudentGrades(toNat(studentId));
        if (Array.isArray(result)) {
          return result.map((g: any) => ({
            ...g,
            courseName: safeCourseName(g.courseName),
            letterGrade: safeLetterGrade(g.letterGrade),
            score: safeNumber(g.score),
          }));
        }
        return result;
      } catch {
        return DEMO_STUDENT_GRADES[studentId] ?? [];
      }
    },
    staleTime: 60_000,
  });
}

export function useSaveGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (grade: {
      studentId: string;
      courseId: string;
      assignmentId: string;
      score: number;
      weight: number;
      category: string;
      note?: string;
    }) => {
      const actor = getActor();
      if (!actor) throw new Error("No actor available");
      const result = await actor.saveGrade(grade);
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["gradebook", vars.courseId] });
    },
  });
}

export function useStudentGradesNew(studentId: string) {
  const grades = DEMO_STUDENT_GRADES_NEW[studentId];
  return makeQuery(["student-grades-new", studentId], grades ?? null);
}

export function useClassReport(courseId: string) {
  const report = DEMO_CLASS_REPORT[courseId];
  return makeQuery(["class-report", courseId], report ?? null);
}

export function useStudentReport(studentId: string) {
  return useQuery({
    queryKey: ["studentReport", studentId],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) {
        return {
          studentId,
          termId: "spring-2026",
          courseSummaries: [
            {
              courseId: "course-1",
              courseName: "Math 101",
              finalGrade: 82,
              letterGrade: "B",
              teacherComment: "Good progress this term.",
            },
            {
              courseId: "course-2",
              courseName: "English 10",
              finalGrade: 91,
              letterGrade: "A-",
              teacherComment: "Excellent work.",
            },
            {
              courseId: "course-3",
              courseName: "Biology",
              finalGrade: 71,
              letterGrade: "C",
              teacherComment: "Areas for improvement identified.",
            },
          ],
          attendanceSummary: { present: 42, absent: 3, tardy: 1, rate: 91.3 },
          behaviourSummary: { incidents: 0, followUpsComplete: 0 },
        };
      }
      try {
        const result = await actor.getStudentReport(toNat(studentId));
        if (result && typeof result === "object") {
          return {
            ...result,
            courseSummaries: safeArray(result.courseSummaries).map(
              (c: any) => ({
                ...c,
                courseName: safeString(c.courseName),
                letterGrade: safeLetterGrade(c.letterGrade),
                finalGrade: safeNumber(c.finalGrade),
                teacherComment: safeString(c.teacherComment),
              }),
            ),
          };
        }
        return result;
      } catch {
        return {
          studentId,
          termId: "spring-2026",
          courseSummaries: [
            {
              courseId: "course-1",
              courseName: "Math 101",
              finalGrade: 82,
              letterGrade: "B",
              teacherComment: "Good progress this term.",
            },
            {
              courseId: "course-2",
              courseName: "English 10",
              finalGrade: 91,
              letterGrade: "A-",
              teacherComment: "Excellent work.",
            },
            {
              courseId: "course-3",
              courseName: "Biology",
              finalGrade: 71,
              letterGrade: "C",
              teacherComment: "Areas for improvement identified.",
            },
          ],
          attendanceSummary: { present: 42, absent: 3, tardy: 1, rate: 91.3 },
          behaviourSummary: { incidents: 0, followUpsComplete: 0 },
        };
      }
    },
    staleTime: 60000,
  });
}

// Map backend Candid Message / Thread onto the frontend shapes.

export function useClassGradebook(courseId: string, term = "Spring 2026") {
  return useQuery({
    queryKey: ["class-gradebook", courseId, term],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) {
        const report = DEMO_CLASS_REPORT[courseId];
        return report ?? null;
      }
      try {
        const result = await actor.getClassGradebook(toNat(courseId), term);
        if (result && typeof result === "object" && "students" in result) {
          return {
            ...result,
            students: safeArray(result.students).map((s: any) => ({
              ...s,
              name: safeString(s.name),
              letterGrade: safeLetterGrade(s.letterGrade),
              grade: safeNumber(s.grade),
              attendanceRate: safeNumber(s.attendanceRate),
              status: safeString(s.status),
            })),
          };
        }
        return result;
      } catch {
        const report = DEMO_CLASS_REPORT[courseId];
        return report ?? null;
      }
    },
    staleTime: 60_000,
  });
}

export function useStudentTranscript(studentId: string) {
  return useQuery({
    queryKey: ["student-transcript", studentId],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) {
        return null;
      }
      try {
        return await actor.getStudentTranscript(toNat(studentId));
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });
}

export function useReportCard(studentId: string, term: string) {
  return useQuery({
    queryKey: ["report-card", studentId, term],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) {
        return null;
      }
      try {
        return await actor.getReportCard(toNat(studentId), term);
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });
}

export function useTeacherGradesToEnter(teacherId?: string) {
  const assignments = teacherId
    ? DEMO_TEACHER_ASSIGNMENTS.filter((a) => {
        const course = DEMO_COURSES.find((c) => c.id === a.courseId);
        return course?.teacherId === teacherId;
      })
    : DEMO_TEACHER_ASSIGNMENTS;
  // Count assignments that have submissions but aren't fully graded
  const toEnter = assignments.filter(
    (a) => a.submissionCount > 0 && a.submissionCount < a.totalStudents,
  ).length;
  return makeQuery(["teacher-grades-to-enter", teacherId ?? "all"], toEnter);
}

// ── Conference Booking ───────────────────────────────────────────────────────
