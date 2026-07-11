import type { StudentGradeView, StudentGradebookClassSummary } from "@/backend";
import { toNat } from "@/lib/toNat";
import { useQuery } from "@tanstack/react-query";
import { getActor } from "./backend/_shared";
import { useStudentGrades } from "./backend/gradebook";

export function useMergedStudentGrades(studentId: string) {
  const oldGradesQuery = useStudentGrades(studentId);

  const gradebookSummaryQuery = useQuery({
    queryKey: ["gradebookSummary", studentId],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) return [] as StudentGradebookClassSummary[];
      return actor.getStudentGradebookSummary(toNat(studentId));
    },
    staleTime: 60_000,
  });

  const isLoading = oldGradesQuery.isLoading || gradebookSummaryQuery.isLoading;

  if (!oldGradesQuery.data) {
    return { grades: undefined, isLoading };
  }

  // Map old grades by courseId (bigint)
  const oldMap = new Map<bigint, StudentGradeView>();
  for (const g of oldGradesQuery.data) {
    oldMap.set(g.courseId, g);
  }

  const merged: StudentGradeView[] = [];

  // Start with gradebook summaries
  for (const summary of gradebookSummaryQuery.data ?? []) {
    const existing = oldMap.get(summary.classId);
    if (existing) {
      merged.push({
        ...existing,
        score: summary.weightedPercentage ?? 0,
        letterGrade: summary.letterGrade ?? "",
      });
      oldMap.delete(summary.classId);
    } else {
      merged.push({
        weight: 1,
        assignmentName: "",
        term: "Current",
        score: summary.weightedPercentage ?? 0,
        courseName: summary.className ?? "",
        courseId: summary.classId,
        letterGrade: summary.letterGrade ?? "",
      });
    }
  }

  // Append any remaining old grades that don't have gradebook data
  for (const g of oldMap.values()) {
    merged.push(g);
  }

  return { grades: merged, isLoading };
}
