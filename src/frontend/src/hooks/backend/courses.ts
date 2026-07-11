import { opt } from "@/lib/candid";
import { demoFallback } from "@/lib/devLog";
import { toNat } from "@/lib/toNat";
import { useQuery } from "@tanstack/react-query";

import { DEMO_COURSES, DEMO_LESSONS, DEMO_UNITS } from "./demo-data";

// ── Hook factory ─────────────────────────────────────────────────────────────

import { getActor, makeQuery, mapCourse } from "./_shared";

export function useTeacherCourses(teacherId?: string) {
  const data = teacherId
    ? DEMO_COURSES.filter(
        (c) => c.teacherId === teacherId || c.coTeacherId === teacherId,
      )
    : DEMO_COURSES;
  return makeQuery(["teacher-courses", teacherId ?? "all"], data);
}

export function useCourses(_teacherId?: string) {
  return useQuery({
    queryKey: ["courses", _teacherId ?? "all"],
    queryFn: async () => {
      const demo = _teacherId
        ? DEMO_COURSES.filter(
            (c) => c.teacherId === _teacherId || c.coTeacherId === _teacherId,
          )
        : DEMO_COURSES;
      const actor = getActor();
      if (!actor) return demo;
      try {
        const raw = (await actor.getCourses(
          _teacherId ? opt(toNat(_teacherId)) : opt(null),
        )) as any[];
        if (!Array.isArray(raw) || raw.length === 0) return demo;
        return raw.map(mapCourse);
      } catch (e) {
        return demoFallback("courses", demo, e);
      }
    },
    staleTime: 60_000,
  });
}

export function useCurriculumOverview() {
  return useQuery({
    queryKey: ["curriculum-overview"],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) return [];
      try {
        return await actor.getCurriculumOverview();
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });
}

export function useCoTeacherClasses(teacherId: string) {
  return useQuery({
    queryKey: ["co-teacher-classes", teacherId],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) return [];
      try {
        return await actor.getCoTeacherClasses(teacherId);
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });
}

export function useUnits(courseId?: string) {
  const filtered = courseId
    ? DEMO_UNITS.filter((u) => u.courseId === courseId)
    : DEMO_UNITS;
  return makeQuery(["units", courseId ?? "all"], filtered);
}

export function useLessons(unitId?: string) {
  const filtered = unitId
    ? DEMO_LESSONS.filter((l) => l.unitId === unitId)
    : DEMO_LESSONS;
  return makeQuery(["lessons", unitId ?? "all"], filtered);
}
