import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  useComputeClassWeightedAverages,
  useCreateGradebookAssignment,
  useListGradeCategories,
  useListGradebookAssignments,
  useListScoresByClass,
  useSetScore,
} from "../../hooks/useGradebook";
import type { Student } from "../../types";

interface GradebookGridProps {
  classId: string;
  students: Student[];
}

export default function GradebookGrid({
  classId,
  students,
}: GradebookGridProps) {
  const { data: assignments = [] } = useListGradebookAssignments(classId);
  const { data: scores = [] } = useListScoresByClass(classId);
  const { data: averages = [] } = useComputeClassWeightedAverages(classId);
  const { data: categories = [] } = useListGradeCategories(classId);
  const setScore = useSetScore();
  const createAssignment = useCreateGradebookAssignment();

  const [newName, setNewName] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newPoints, setNewPoints] = useState("");

  // Local per-cell editing state: key = "assignmentId-studentId"
  const [editing, setEditing] = useState<Record<string, string>>({});

  const scoreMap = useMemo(() => {
    const map = new Map<string, bigint | null>();
    for (const s of scores) {
      const key = `${s.assignmentId}-s${s.studentId}`;
      map.set(key, s.pointsEarned ?? null);
    }
    return map;
  }, [scores]);

  const averageMap = useMemo(() => {
    const map = new Map<
      string,
      { overallPercent: number; letterGrade: string }
    >();
    for (const a of averages) {
      map.set(`s${a.studentId}`, {
        overallPercent: a.overallPercent,
        letterGrade: a.letterGrade,
      });
    }
    return map;
  }, [averages]);

  const commitScore = (
    assignmentId: string,
    studentId: string,
    raw: string,
  ) => {
    const num = raw.trim() === "" ? null : BigInt(raw);
    setScore.mutate({ assignmentId, studentId, pointsEarned: num, classId });
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCategoryId || !newPoints) return;
    createAssignment.mutate({
      classId,
      categoryId: newCategoryId,
      name: newName,
      pointsPossible: BigInt(newPoints),
    });
    setNewName("");
    setNewCategoryId("");
    setNewPoints("");
  };

  const classAverage = useMemo(() => {
    if (averages.length === 0) return null;
    const sum = averages.reduce((acc, a) => acc + a.overallPercent, 0);
    return Math.round((sum / averages.length) * 10) / 10;
  }, [averages]);

  return (
    <div className="space-y-4">
      {/* Category weights header */}
      {categories.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {categories.map((c) => `${c.name} ${Number(c.weight)}%`).join(" · ")}
        </div>
      )}

      {/* Add assignment form */}
      <form
        onSubmit={handleAddAssignment}
        className="flex flex-wrap items-end gap-2"
      >
        <div>
          <label
            htmlFor="gb-name"
            className="block text-xs text-muted-foreground"
          >
            Name
          </label>
          <input
            id="gb-name"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
            placeholder="Assignment name"
          />
        </div>
        <div>
          <label
            htmlFor="gb-category"
            className="block text-xs text-muted-foreground"
          >
            Category
          </label>
          <select
            id="gb-category"
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="">Select...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="gb-points"
            className="block text-xs text-muted-foreground"
          >
            Points
          </label>
          <input
            id="gb-points"
            type="number"
            value={newPoints}
            onChange={(e) => setNewPoints(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-20"
            placeholder="100"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-primary-foreground rounded px-3 py-1 text-sm"
          disabled={createAssignment.isPending}
        >
          Add assignment
        </button>
      </form>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left px-2 py-1 sticky left-0 bg-background min-w-[140px]">
                Student
              </th>
              {assignments.map((a) => (
                <th key={a.id} className="text-center px-2 py-1 min-w-[80px]">
                  <div>{a.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {Number(a.pointsPossible)} pts
                  </div>
                </th>
              ))}
              <th className="text-center px-2 py-1 min-w-[80px]">Overall %</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const avg = averageMap.get(student.id);
              return (
                <tr key={student.id} className="border-b">
                  <td className="px-2 py-1 sticky left-0 bg-background">
                    <Link
                      to={`/teacher/student/${student.id}` as never}
                      className="hover:underline"
                    >
                      {student.firstName} {student.lastName}
                    </Link>
                  </td>
                  {assignments.map((a) => {
                    const key = `${a.id}-${student.id}`;
                    const saved = scoreMap.get(key);
                    const display =
                      key in editing
                        ? editing[key]
                        : saved === null || saved === undefined
                          ? ""
                          : String(saved);
                    return (
                      <td key={a.id} className="px-2 py-1 text-center">
                        <input
                          type="number"
                          min={0}
                          max={Number(a.pointsPossible)}
                          value={display}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          onBlur={() => {
                            if (key in editing) {
                              commitScore(
                                String(a.id),
                                student.id,
                                editing[key],
                              );
                              setEditing((prev) => {
                                const next = { ...prev };
                                delete next[key];
                                return next;
                              });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.currentTarget.blur();
                            }
                          }}
                          className="w-16 text-center border rounded px-1 py-0.5 text-sm"
                          data-ocid={`gradebook.score_input.${student.id}.${a.id}`}
                        />
                      </td>
                    );
                  })}
                  <td className="px-2 py-1 text-center font-medium">
                    {avg ? `${avg.overallPercent}% ${avg.letterGrade}` : "—"}
                  </td>
                </tr>
              );
            })}
            {/* Class average row */}
            <tr className="border-t-2 font-semibold">
              <td className="px-2 py-1 sticky left-0 bg-background">
                Class average
              </td>
              {assignments.map((a) => (
                <td key={a.id} className="px-2 py-1 text-center">
                  —
                </td>
              ))}
              <td className="px-2 py-1 text-center">
                {classAverage !== null ? `${classAverage}%` : "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
