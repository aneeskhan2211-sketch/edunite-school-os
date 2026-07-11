import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AssignmentV2,
  GradeCategory,
  Score,
  StudentWeightedResult,
} from "../backend";

function getActor() {
  if (typeof window !== "undefined" && (window as any).__ACTOR__) {
    return (window as any).__ACTOR__;
  }
  return null;
}

// The frontend uses string ids like "s2" (student) and "c1" (class), but the
// backend uses Nat ids. Strip any non-digit prefix and convert to BigInt so
// calls don't throw (BigInt("s2") would throw).
function toNat(id: string): bigint {
  const digits = String(id).replace(/[^0-9]/g, "");
  return BigInt(digits.length > 0 ? digits : "0");
}

// Demo data uses bigint IDs to match backend types; frontend components use string IDs
const DEMO_ASSIGNMENTS: AssignmentV2[] = [
  {
    id: 1n,
    classId: 1n,
    categoryId: "cat1",
    name: "HW 1",
    pointsPossible: 10n,
    dueDate: "2026-06-01",
  },
  {
    id: 2n,
    classId: 1n,
    categoryId: "cat2",
    name: "Quiz 1",
    pointsPossible: 20n,
    dueDate: "2026-06-05",
  },
  {
    id: 3n,
    classId: 1n,
    categoryId: "cat3",
    name: "Test 1",
    pointsPossible: 100n,
    dueDate: "2026-06-10",
  },
];

const DEMO_SCORES: Score[] = [
  { id: "sc1", assignmentId: 1n, studentId: 1n, pointsEarned: 9n },
  { id: "sc2", assignmentId: 2n, studentId: 1n, pointsEarned: 18n },
  { id: "sc3", assignmentId: 3n, studentId: 1n, pointsEarned: 85n },
  { id: "sc4", assignmentId: 1n, studentId: 2n, pointsEarned: 7n },
  { id: "sc5", assignmentId: 2n, studentId: 2n, pointsEarned: 12n },
  { id: "sc6", assignmentId: 3n, studentId: 2n, pointsEarned: 65n },
  { id: "sc7", assignmentId: 1n, studentId: 3n, pointsEarned: 8n },
  { id: "sc8", assignmentId: 2n, studentId: 3n, pointsEarned: 16n },
  { id: "sc9", assignmentId: 3n, studentId: 3n, pointsEarned: 78n },
];

const DEMO_CATEGORIES: GradeCategory[] = [
  { id: "cat1", classId: 1n, name: "Homework", weight: 20n },
  { id: "cat2", classId: 1n, name: "Quizzes", weight: 30n },
  { id: "cat3", classId: 1n, name: "Tests", weight: 50n },
];

const DEMO_AVERAGES: StudentWeightedResult[] = [
  { studentId: 1n, overallPercent: 92, letterGrade: "A" },
  { studentId: 2n, overallPercent: 71, letterGrade: "C" },
  { studentId: 3n, overallPercent: 84, letterGrade: "B" },
];

export function useListGradebookAssignments(classId: string) {
  return useQuery<AssignmentV2[]>({
    queryKey: ["assignments", classId],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) return DEMO_ASSIGNMENTS;
      const result = await actor.listGradebookAssignments(toNat(classId));
      return result.map((a: any) => ({
        id: BigInt(a.id),
        classId: BigInt(a.classId),
        categoryId: String(a.categoryId),
        name: String(a.name),
        pointsPossible: BigInt(a.pointsPossible),
        dueDate: a.dueDate?.[0] ? String(a.dueDate[0]) : undefined,
      }));
    },
  });
}

export function useListScoresByClass(classId: string) {
  return useQuery<Score[]>({
    queryKey: ["scores", classId],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) return DEMO_SCORES;
      const result = await actor.listScoresByClass(toNat(classId));
      return result.map((s: any) => ({
        id: String(s.id),
        assignmentId: BigInt(s.assignmentId),
        studentId: BigInt(s.studentId),
        pointsEarned:
          s.pointsEarned?.[0] !== undefined
            ? BigInt(s.pointsEarned[0])
            : undefined,
      }));
    },
  });
}

export function useSetScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assignmentId,
      studentId,
      pointsEarned,
    }: {
      assignmentId: string;
      studentId: string;
      pointsEarned: bigint | null;
      classId: string;
    }) => {
      const actor = getActor();
      if (!actor) throw new Error("No backend actor available");
      const payload = pointsEarned === null ? [] : [pointsEarned];
      await actor.setScore(toNat(assignmentId), toNat(studentId), payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["scores", variables.classId],
      });
      queryClient.invalidateQueries({
        queryKey: ["averages", variables.classId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gradebookSummary", variables.studentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["student-grades", variables.studentId],
      });
    },
  });
}

export function useComputeClassWeightedAverages(classId: string) {
  return useQuery<StudentWeightedResult[]>({
    queryKey: ["averages", classId],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) return DEMO_AVERAGES;
      const result = await actor.computeClassWeightedAverages(toNat(classId));
      return result.map((r: any) => ({
        studentId: BigInt(r.studentId),
        overallPercent: Number(r.overallPercent),
        letterGrade: String(r.letterGrade),
      }));
    },
  });
}

export function useListGradeCategories(classId: string) {
  return useQuery<GradeCategory[]>({
    queryKey: ["categories", classId],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) return DEMO_CATEGORIES;
      const result = await actor.listGradeCategories(toNat(classId));
      return result.map((c: any) => ({
        id: String(c.id),
        classId: BigInt(c.classId),
        name: String(c.name),
        weight: BigInt(c.weight),
      }));
    },
  });
}

export function useCreateGradebookAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      classId,
      categoryId,
      name,
      pointsPossible,
      dueDate,
    }: {
      classId: string;
      categoryId: string;
      name: string;
      pointsPossible: bigint;
      dueDate?: string;
    }) => {
      const actor = getActor();
      if (!actor) return;
      await actor.createGradebookAssignment(
        toNat(classId),
        categoryId,
        name,
        pointsPossible,
        dueDate ? [dueDate] : [],
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["assignments", variables.classId],
      });
      queryClient.invalidateQueries({
        queryKey: ["averages", variables.classId],
      });
    },
  });
}
