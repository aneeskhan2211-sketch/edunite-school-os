import { demoFallback } from "@/lib/devLog";
import { toNat } from "@/lib/toNat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DEMO_SCHEDULE } from "./demo-data";
import type { ScheduleEntry } from "./types";

// ── Hook factory ─────────────────────────────────────────────────────────────

import { getActor, mapMeeting, safeArray } from "./_shared";

export function useSchedule(studentId?: string) {
  return useQuery({
    queryKey: ["schedule", studentId ?? "all"],
    queryFn: async (): Promise<ScheduleEntry[]> => {
      const actor = getActor();
      if (!actor || !studentId) return DEMO_SCHEDULE;
      try {
        const raw = (await actor.getStudentSchedule(toNat(studentId))) as any[];
        if (!Array.isArray(raw) || raw.length === 0) return DEMO_SCHEDULE;
        return raw.map(mapMeeting);
      } catch (e) {
        return demoFallback("schedule", DEMO_SCHEDULE, e);
      }
    },
    staleTime: 60_000,
  });
}

export function useTeacherSchedule(teacherId?: string) {
  return useQuery({
    queryKey: ["teacher-schedule", teacherId ?? "none"],
    queryFn: async (): Promise<ScheduleEntry[]> => {
      const actor = getActor();
      if (!actor || !teacherId) return [];
      try {
        const raw = (await actor.getTeacherSchedule(toNat(teacherId))) as any[];
        return safeArray<any>(raw).map(mapMeeting);
      } catch (e) {
        return demoFallback("teacherSchedule", [], e);
      }
    },
    staleTime: 60_000,
  });
}

export function useMasterTimetable() {
  return useQuery({
    queryKey: ["master-timetable"],
    queryFn: async (): Promise<ScheduleEntry[]> => {
      const actor = getActor();
      if (!actor) return DEMO_SCHEDULE;
      try {
        const raw = (await actor.getMasterTimetable()) as any[];
        return safeArray<any>(raw).map(mapMeeting);
      } catch (e) {
        return demoFallback("masterTimetable", DEMO_SCHEDULE, e);
      }
    },
    staleTime: 60_000,
  });
}

export function useScheduleConflicts() {
  return useQuery({
    queryKey: ["schedule-conflicts"],
    queryFn: async (): Promise<string[]> => {
      const actor = getActor();
      if (!actor) return [];
      try {
        return safeArray<string>(
          (await actor.detectScheduleConflicts()) as any[],
        );
      } catch (e) {
        return demoFallback("scheduleConflicts", [], e);
      }
    },
    staleTime: 60_000,
  });
}

export function useGenerateTimetable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const actor = getActor();
      if (!actor) throw new Error("No actor available");
      const result = await actor.generateTimetable();
      if (result && typeof result === "object" && "err" in result) {
        throw new Error((result as any).err);
      }
      return result;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["master-timetable"] });
      queryClient.invalidateQueries({ queryKey: ["schedule-conflicts"] });
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-schedule"] });
    },
  });
}
