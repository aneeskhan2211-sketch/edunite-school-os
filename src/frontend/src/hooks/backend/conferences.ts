import { useMutation, useQueryClient } from "@tanstack/react-query";

// ── Hook factory ─────────────────────────────────────────────────────────────

import { DEMO_BOOKINGS, DEMO_SLOTS, getActor, makeQuery } from "./_shared";

export function useConferenceSlots(teacherId?: string) {
  const data = teacherId
    ? DEMO_SLOTS.filter(
        (s) => s.teacherId === teacherId && s.status === "available",
      )
    : DEMO_SLOTS.filter((s) => s.status === "available");
  return makeQuery(["conference-slots", teacherId ?? "all"], data);
}

export function useAvailableSlots(teacherId?: string) {
  const data = teacherId
    ? DEMO_SLOTS.filter(
        (s) => s.teacherId === teacherId && s.status === "available",
      )
    : DEMO_SLOTS.filter((s) => s.status === "available");
  return makeQuery(["conference-slots", teacherId ?? "all"], data);
}

export function useMyBookings(parentId: string) {
  const data = DEMO_BOOKINGS.filter((b) => b.parentId === parentId);
  return makeQuery(["conference-bookings", parentId], data);
}

export function useBookConference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slotId,
      parentId,
      studentId,
    }: {
      slotId: bigint;
      parentId: string;
      studentId: string;
    }) => {
      const actor = getActor();
      if (!actor) {
        // Demo fallback: mutate local state
        const slot = DEMO_SLOTS.find((s) => s.id === slotId);
        if (slot) {
          slot.status = "booked";
          slot.parentId = parentId;
          slot.bookedBy = parentId;
          DEMO_BOOKINGS.push({
            id: BigInt(DEMO_BOOKINGS.length + 1),
            slotId,
            studentId,
            teacherId: slot.teacherId,
            parentId,
            status: "confirmed",
            bookedAt: BigInt(Date.now()),
            notificationSent: false,
          });
        }
        return { ok: true };
      }
      const result = await actor.bookConference(slotId, parentId, studentId);
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conference-slots"] });
      queryClient.invalidateQueries({ queryKey: ["conference-bookings"] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      const actor = getActor();
      if (!actor) {
        const booking = DEMO_BOOKINGS.find((b) => b.id === bookingId);
        if (booking) {
          booking.status = "cancelled";
          const slot = DEMO_SLOTS.find((s) => s.id === booking.slotId);
          if (slot) {
            slot.status = "available";
            slot.parentId = "";
            slot.bookedBy = undefined;
          }
        }
        return { ok: true };
      }
      const result = await actor.cancelBooking(bookingId);
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conference-slots"] });
      queryClient.invalidateQueries({ queryKey: ["conference-bookings"] });
    },
  });
}
