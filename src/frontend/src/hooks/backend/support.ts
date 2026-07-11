import { demoFallback } from "@/lib/devLog";
import { toNat } from "@/lib/toNat";
import { useQuery } from "@tanstack/react-query";

import { DEMO_STUDENTS } from "./demo-data";

// ── Hook factory ─────────────────────────────────────────────────────────────

import {
  getActor,
  mapAppointment,
  mapComplianceItem,
  mapIntervention,
  safeArray,
} from "./_shared";

export function useCounsellorCaseload(counsellorId: string) {
  return useQuery({
    queryKey: ["counsellor-caseload", counsellorId],
    queryFn: async () => {
      const demo = DEMO_STUDENTS.filter(
        (s) => s.counsellorId === counsellorId,
      ).map((s) => s.id);
      const actor = getActor();
      if (!actor || !counsellorId) return demo;
      try {
        // Backend method is getCaseload (not getCounsellorCaseload); returns
        // CaseloadStudent[] — the page only needs the student-id strings.
        const raw = (await actor.getCaseload(toNat(counsellorId))) as any[];
        if (!Array.isArray(raw)) return demo;
        return raw.map((cs: any) => `s${cs.studentId}`);
      } catch (e) {
        return demoFallback("counsellorCaseload", demo, e);
      }
    },
    staleTime: 60_000,
  });
}

export function useInterventions(counsellorId?: string) {
  return useQuery({
    queryKey: ["interventions", counsellorId ?? "none"],
    queryFn: async () => {
      const actor = getActor();
      if (!actor || !counsellorId) return [];
      try {
        const raw = (await actor.getInterventionsByOwner(
          toNat(counsellorId),
        )) as any[];
        return safeArray<any>(raw).map(mapIntervention);
      } catch (e) {
        return demoFallback("interventions", [], e);
      }
    },
    staleTime: 60_000,
  });
}

export function useAppointments(counsellorId?: string) {
  return useQuery({
    queryKey: ["appointments", counsellorId ?? "none"],
    queryFn: async () => {
      const actor = getActor();
      if (!actor || !counsellorId) return [];
      try {
        const raw = (await actor.getAppointments(toNat(counsellorId))) as any[];
        return safeArray<any>(raw).map(mapAppointment);
      } catch (e) {
        return demoFallback("appointments", [], e);
      }
    },
    staleTime: 60_000,
  });
}

export function useIEPCaseload(spedCoordinatorId: string) {
  return useQuery({
    queryKey: ["iep-caseload", spedCoordinatorId],
    queryFn: async () => {
      const actor = getActor();
      if (!actor || !spedCoordinatorId) return [];
      try {
        return await actor.getIEPCaseload(toNat(spedCoordinatorId));
      } catch (e) {
        return demoFallback("iepCaseload", [], e);
      }
    },
    staleTime: 60_000,
  });
}

export function useComplianceItems(spedId?: string) {
  return useQuery({
    queryKey: ["compliance-items", spedId ?? "none"],
    queryFn: async () => {
      const actor = getActor();
      if (!actor || !spedId) return [];
      try {
        const raw = (await actor.getComplianceItems(toNat(spedId))) as any[];
        return safeArray<any>(raw).map(mapComplianceItem);
      } catch (e) {
        return demoFallback("complianceItems", [], e);
      }
    },
    staleTime: 60_000,
  });
}

export function useSubstituteDayClasses(date: number, substituteId: string) {
  return useQuery({
    queryKey: ["substitute-day-classes", date, substituteId],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) return [];
      try {
        return await actor.getSubstituteDayClasses(BigInt(date), substituteId);
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });
}

export function useSubstituteEndOfDay(date: number, substituteId: string) {
  return useQuery({
    queryKey: ["substitute-end-of-day", date, substituteId],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) return null;
      try {
        return await actor.getSubstituteEndOfDay(BigInt(date), substituteId);
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });
}

export function useHandoffLog(classId: string) {
  return useQuery({
    queryKey: ["handoff-log", classId],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) return [];
      try {
        return await actor.getHandoffLog(classId);
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });
}
