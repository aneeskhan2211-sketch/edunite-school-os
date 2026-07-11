import type { Commitment, Incident, UnderstandingSignal } from "@/types";

import { useRole } from "@/hooks/useRole";
import { opt } from "@/lib/candid";
import { demoFallback } from "@/lib/devLog";
import { buildRoleContext } from "@/lib/roleContext";
import { toNat } from "@/lib/toNat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DEMO_COMMITMENTS, DEMO_SIGNALS } from "./demo-data";

// ── Hook factory ─────────────────────────────────────────────────────────────

import {
  getActor,
  makeQuery,
  mapCommitment,
  mapIncident,
  mapSignal,
  safeArray,
  safeString,
} from "./_shared";

export function useIncident(incidentId: string) {
  const incidents: Incident[] = [
    {
      id: "inc1",
      studentId: "s2",
      reportedBy: "staff-1",
      date: "2026-06-08",
      description: "Verbal altercation in hallway near locker area.",
      severity: "medium",
      status: "routed",
      routedTo: "staff-7",
      timeline: [
        {
          status: "logged",
          timestamp: "2026-06-08T09:30:00Z",
          actor: "staff-1",
        },
        {
          status: "routed",
          timestamp: "2026-06-08T09:45:00Z",
          actor: "system",
          note: "Auto-routed to counsellor",
        },
      ],
    },
    {
      id: "inc2",
      studentId: "s3",
      reportedBy: "staff-4",
      date: "2026-06-10",
      description:
        "Late to class without hall pass, second occurrence this week.",
      severity: "low",
      status: "closed",
      timeline: [
        {
          status: "logged",
          timestamp: "2026-06-10T11:00:00Z",
          actor: "staff-4",
        },
        {
          status: "closed",
          timestamp: "2026-06-10T14:00:00Z",
          actor: "staff-5",
          note: "Resolved with student",
        },
      ],
    },
  ];
  const demoData = incidents.find((i) => i.id === incidentId) ?? null;
  return useQuery({
    queryKey: ["incident", incidentId],
    queryFn: async (): Promise<Incident | null> => {
      const actor = getActor();
      if (!actor) return demoData;
      try {
        const r = await actor.getIncident(toNat(incidentId));
        const val = Array.isArray(r) ? (r.length > 0 ? r[0] : null) : r;
        return val ? mapIncident(val) : demoData;
      } catch (e) {
        return demoFallback("incident", demoData, e);
      }
    },
    staleTime: 60_000,
  });
}

export function useIncidents(studentId?: string) {
  const { role, userId } = useRole();
  const incidents: Incident[] = [
    {
      id: "inc1",
      studentId: "s2",
      reportedBy: "staff-1",
      date: "2026-06-08",
      description: "Verbal altercation in hallway near locker area.",
      severity: "medium",
      status: "routed",
      routedTo: "staff-7",
      timeline: [
        {
          status: "logged",
          timestamp: "2026-06-08T09:30:00Z",
          actor: "staff-1",
        },
        {
          status: "routed",
          timestamp: "2026-06-08T09:45:00Z",
          actor: "system",
          note: "Auto-routed to counsellor",
        },
      ],
    },
    {
      id: "inc2",
      studentId: "s3",
      reportedBy: "staff-4",
      date: "2026-06-10",
      description:
        "Late to class without hall pass, second occurrence this week.",
      severity: "low",
      status: "closed",
      timeline: [
        {
          status: "logged",
          timestamp: "2026-06-10T11:00:00Z",
          actor: "staff-4",
        },
        {
          status: "closed",
          timestamp: "2026-06-10T14:00:00Z",
          actor: "staff-5",
          note: "Resolved with student",
        },
      ],
    },
  ];
  const demoFiltered = studentId
    ? incidents.filter((i) => i.studentId === studentId)
    : incidents;
  return useQuery({
    queryKey: ["incidents", studentId ?? "all", role],
    queryFn: async (): Promise<Incident[]> => {
      const actor = getActor();
      if (!actor) return demoFiltered;
      try {
        const ctx = buildRoleContext(role, userId);
        const raw = (
          studentId
            ? await actor.listIncidentsByStudent(toNat(studentId), ctx)
            : await actor.listIncidentsForRole(ctx)
        ) as any[];
        if (!Array.isArray(raw)) return demoFiltered;
        return raw.map(mapIncident);
      } catch (e) {
        return demoFallback("incidents", demoFiltered, e);
      }
    },
    staleTime: 60_000,
  });
}

// Map a backend Candid Commitment onto the frontend Commitment shape.

export function useCommitments(ownerId?: string) {
  const { userId } = useRole();
  // No explicit owner => scope to the current user's own commitments.
  const effectiveOwner = ownerId ?? userId ?? null;
  return useQuery({
    queryKey: ["commitments", effectiveOwner ?? "all"],
    queryFn: async (): Promise<Commitment[]> => {
      const demo = ownerId
        ? DEMO_COMMITMENTS.filter((c) => c.ownerId === ownerId)
        : DEMO_COMMITMENTS;
      const actor = getActor();
      if (!actor || !effectiveOwner) return demo;
      try {
        const raw = (await actor.listCommitmentsByOwner(
          toNat(effectiveOwner),
          opt(null),
        )) as any[];
        if (!Array.isArray(raw)) return demo;
        return raw.map(mapCommitment);
      } catch (e) {
        return demoFallback("commitments", demo, e);
      }
    },
    staleTime: 60_000,
  });
}

// Map a backend Candid UnderstandingSignal onto the frontend shape.

export function useUnderstandingSignals() {
  const { role, userId } = useRole();
  return useQuery({
    queryKey: ["signals", role],
    queryFn: async (): Promise<UnderstandingSignal[]> => {
      const actor = getActor();
      if (!actor) return DEMO_SIGNALS;
      try {
        const ctx = buildRoleContext(role, userId);
        const raw = (await actor.listSignalsByRole(ctx)) as any[];
        if (!Array.isArray(raw)) return DEMO_SIGNALS;
        return raw.map(mapSignal);
      } catch (e) {
        return demoFallback("signals", DEMO_SIGNALS, e);
      }
    },
    staleTime: 60_000,
  });
}

export function useEarlyWarning() {
  return useQuery({
    queryKey: ["early-warning"],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) return [];
      try {
        const raw = (await actor.getEarlyWarningRoster()) as any[];
        return safeArray<any>(raw).map((s: any) => ({
          studentId: `s${s.studentId}`,
          name: safeString(s.name),
          grade: Number(s.grade),
          tier: Number(s.tier),
          attendanceRate: Math.round(Number(s.attendanceRate)),
          incidentCount: Number(s.incidentCount),
          avgGrade: Number(s.avgGrade),
          flags: safeArray<string>(s.flags),
        }));
      } catch (e) {
        return demoFallback("earlyWarning", [], e);
      }
    },
    staleTime: 60_000,
  });
}

export function useLogIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      studentId: bigint;
      reportedBy: bigint;
      description: string;
      severity: string;
      date: string;
    }) => {
      const actor = getActor();
      if (!actor) throw new Error("No actor available");
      const result = await actor.logIncident(data, {
        role: "teacher",
        userId: data.reportedBy,
      });
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}

export function useUpdateIncidentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      newStatus,
      note,
      ctx,
    }: {
      id: bigint;
      newStatus: string;
      note: string;
      ctx: { role: string; userId: bigint };
    }) => {
      const actor = getActor();
      if (!actor) throw new Error("No actor available");
      const result = await actor.updateIncidentStatus(id, newStatus, note, ctx);
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onMutate: async ({ id, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ["incidents"] });
      const prev = queryClient.getQueryData(["incidents"]);
      queryClient.setQueryData(["incidents"], (old: any[]) => {
        if (!old) return old;
        return old.map((inc: any) =>
          inc.id === id ? { ...inc, status: newStatus } : inc,
        );
      });
      return { prev };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(["incidents"], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}

export function useCreateCommitment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      commitmentType: string;
      ownerId: bigint;
      studentId: bigint;
      dueDate: bigint;
      description: string;
    }) => {
      const actor = getActor();
      if (!actor) throw new Error("No actor available");
      const result = await actor.createCommitment(data);
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commitments"] });
    },
  });
}

export function useUpdateCommitment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: bigint;
      status: string;
    }) => {
      const actor = getActor();
      if (!actor) throw new Error("No actor available");
      const result = await actor.updateCommitmentStatus(id, status);
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commitments"] });
    },
  });
}

export function useTeacherOpenCommitments(teacherId?: string) {
  const filtered = teacherId
    ? DEMO_COMMITMENTS.filter(
        (c) => c.ownerId === teacherId && c.status !== "completed",
      )
    : DEMO_COMMITMENTS.filter((c) => c.status !== "completed");
  return makeQuery(["teacher-open-commitments", teacherId ?? "all"], filtered);
}

export function useIncidentsByType() {
  const data = [
    { type: "Minor disruption", count: 3 },
    { type: "Tardy (no pass)", count: 2 },
    { type: "Verbal altercation", count: 1 },
    { type: "Property damage", count: 0 },
  ];
  return makeQuery(["incidents-by-type"], data);
}

export function useCommitmentsDueThisWeek() {
  const today = new Date();
  const weekEnd = new Date(today.getTime() + 7 * 86400000);
  const data = DEMO_COMMITMENTS.filter((c) => {
    if (c.status === "completed") return false;
    const due = new Date(c.dueDate);
    return due >= today && due <= weekEnd;
  }).map((c) => ({
    id: c.id,
    description: c.description,
    dueDate: c.dueDate,
    status: c.status,
    studentId: c.studentId,
  }));
  return makeQuery(["commitments-due-this-week"], data);
}
