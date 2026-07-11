import { demoFallback } from "@/lib/devLog";
import { toNat } from "@/lib/toNat";
import type { AttendancePattern, AttendanceRecord } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  DEMO_ATTENDANCE_RECORDS,
  DEMO_COURSES,
  DEMO_SCHEDULE,
  DEMO_STUDENTS,
} from "./demo-data";

// ── Hook factory ─────────────────────────────────────────────────────────────

import { getActor, makeQuery } from "./_shared";

export function useAttendance() {
  const allRecords = Object.values(DEMO_ATTENDANCE_RECORDS).flat();
  return makeQuery(["attendance"], allRecords);
}

export function useAttendanceRoster(
  courseId: string,
  date = new Date().toISOString().slice(0, 10),
) {
  const course = DEMO_COURSES.find((c) => c.id === courseId);
  const records: AttendanceRecord[] = (course?.studentIds ?? []).map(
    (sid, i) => ({
      id: `att-${courseId}-${sid}`,
      studentId: sid,
      courseId,
      date,
      status: (["present", "present", "tardy", "absent"] as const)[i % 4],
      recordedBy: course?.teacherId ?? "staff-1",
    }),
  );
  return makeQuery(["attendance-roster", courseId, date], records);
}

export function useAttendancePattern(studentId: string) {
  return useQuery({
    queryKey: ["attendance-pattern", studentId],
    queryFn: async (): Promise<AttendancePattern> => {
      const demo = (): AttendancePattern => {
        const student = DEMO_STUDENTS.find((s) => s.id === studentId);
        const rate = student?.attendanceRate ?? 93;
        return {
          studentId,
          totalDays: 120,
          presentDays: Math.round((rate / 100) * 120),
          absentDays: Math.round(((100 - rate) / 100) * 120),
          excusedDays: 2,
          tardyDays: 3,
          attendanceRate: rate,
          isChronicallyAbsent: rate < 80,
          recentTrend:
            rate < 82 ? "declining" : rate > 90 ? "stable" : "improving",
        };
      };
      const actor = getActor();
      if (!actor) return demo();
      try {
        // Optional date args use [] (Candid `none`) — app uses the raw actor.
        const records = (await actor.listAttendanceByStudent(
          toNat(studentId),
          [] as any,
          [] as any,
        )) as any[];
        if (!Array.isArray(records) || records.length === 0) return demo();
        const statusKey = (s: any): string =>
          s && typeof s === "object"
            ? (Object.keys(s)[0] ?? "present")
            : String(s);
        const isPresent = (s: any) => {
          const k = statusKey(s);
          return k === "present" || k === "excused";
        };
        let present = 0;
        let absent = 0;
        let excused = 0;
        let tardy = 0;
        for (const r of records) {
          switch (statusKey(r.status)) {
            case "present":
              present++;
              break;
            case "absent":
              absent++;
              break;
            case "excused":
              excused++;
              break;
            case "tardy":
              tardy++;
              break;
          }
        }
        const total = records.length;
        const rate = total === 0 ? 100 : ((present + excused) / total) * 100;
        const sorted = [...records].sort((a, b) =>
          a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
        );
        const half = Math.floor(sorted.length / 2) || 1;
        const rateOf = (rs: any[]) => {
          if (rs.length === 0) return 100;
          let p = 0;
          for (const r of rs) if (isPresent(r.status)) p++;
          return (p / rs.length) * 100;
        };
        const diff = rateOf(sorted.slice(0, half)) - rateOf(sorted.slice(half));
        const recentTrend: "improving" | "stable" | "declining" =
          diff > 5 ? "improving" : diff < -5 ? "declining" : "stable";
        return {
          studentId,
          totalDays: total,
          presentDays: present,
          absentDays: absent,
          excusedDays: excused,
          tardyDays: tardy,
          attendanceRate: Math.round(rate),
          isChronicallyAbsent: rate < 80,
          recentTrend,
        };
      } catch (e) {
        return demoFallback("attendancePattern", demo(), e);
      }
    },
    staleTime: 60_000,
  });
}

// Map a backend Candid Incident onto the frontend Incident shape.

export function useStudentAttendance(studentId: string) {
  const records = DEMO_ATTENDANCE_RECORDS[studentId] ?? [];
  return makeQuery(["student-attendance", studentId], records);
}

export function useSaveAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      records: {
        studentId: string;
        date: string;
        status: "present" | "absent" | "tardy" | "excused" | "unknown";
        courseId: string;
      }[],
    ) => {
      const actor = getActor();
      if (!actor) throw new Error("No actor available");
      const result = await actor.batchRecordAttendance(records);
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onMutate: async (records) => {
      const courseId = records[0]?.courseId ?? "";
      const date = records[0]?.date ?? "";
      await queryClient.cancelQueries({
        queryKey: ["attendance-roster", courseId, date],
      });
      const prev = queryClient.getQueryData([
        "attendance-roster",
        courseId,
        date,
      ]);
      queryClient.setQueryData(
        ["attendance-roster", courseId, date],
        (old: any[]) => {
          if (!old) return old;
          return old.map((r: any) => {
            const update = records.find((rec) => rec.studentId === r.studentId);
            return update ? { ...r, status: update.status } : r;
          });
        },
      );
      return { prev, courseId, date };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(
          ["attendance-roster", context.courseId, context.date],
          context.prev,
        );
      }
    },
    onSettled: (_data, _err, vars) => {
      const courseId = vars[0]?.courseId ?? "";
      const date = vars[0]?.date ?? "";
      queryClient.invalidateQueries({
        queryKey: ["attendance-roster", courseId, date],
      });
    },
  });
}

export function useTeacherAttendanceToTake(teacherId?: string) {
  const courses = teacherId
    ? DEMO_COURSES.filter(
        (c) => c.teacherId === teacherId || c.coTeacherId === teacherId,
      )
    : DEMO_COURSES;
  // Demo: assume attendance not yet taken for courses whose period hasn't passed
  const today = new Date().getDay();
  const toTake = courses.filter((c) => {
    const schedule = DEMO_SCHEDULE.find(
      (s) => s.courseId === c.id && s.day === today,
    );
    return schedule !== undefined;
  });
  return makeQuery(
    ["teacher-attendance-to-take", teacherId ?? "all"],
    toTake.length,
  );
}

export function useAttendanceByGrade() {
  const data = [
    { grade: 9, rate: 96.2, present: 48, absent: 2 },
    { grade: 10, rate: 88.0, present: 44, absent: 6 },
    { grade: 11, rate: 94.5, present: 38, absent: 2 },
    { grade: 12, rate: 97.1, present: 34, absent: 1 },
  ];
  return makeQuery(["attendance-by-grade"], data);
}
