import { useRole } from "@/hooks/useRole";
import { demoFallback } from "@/lib/devLog";
import { toNat } from "@/lib/toNat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Hook factory ─────────────────────────────────────────────────────────────

import {
  DEMO_NOTIFICATIONS,
  getActor,
  mapNotification,
  safeArray,
} from "./_shared";

export function useNotifications(userId: string) {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const demo =
        typeof DEMO_NOTIFICATIONS !== "undefined"
          ? (DEMO_NOTIFICATIONS as any[])
          : [];
      const actor = getActor();
      if (!actor || !userId) return demo;
      try {
        const raw = (await actor.getNotifications(toNat(userId))) as any[];
        if (!Array.isArray(raw)) return demo;
        return raw.map(mapNotification);
      } catch (e) {
        return demoFallback("notifications", demo, e);
      }
    },
    staleTime: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const actor = getActor();
      if (!actor) return notificationId;
      const result = await actor.markNotificationRead(toNat(notificationId));
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const prev = queryClient.getQueryData(["notifications"]);
      queryClient.setQueryData(["notifications"], (old: any[] | undefined) => {
        if (!old) return old;
        return old.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        );
      });
      return { prev };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(["notifications"], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { userId } = useRole();
  return useMutation({
    mutationFn: async () => {
      const actor = getActor();
      if (!actor || !userId) return true;
      const result = await actor.markAllNotificationsRead(toNat(userId));
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const prev = queryClient.getQueryData(["notifications"]);
      queryClient.setQueryData(["notifications"], (old: any[] | undefined) => {
        if (!old) return old;
        return old.map((n) => ({ ...n, read: true }));
      });
      return { prev };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(["notifications"], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useUnreadNotificationCount(userId: string) {
  const { data: notifications = [] } = useNotifications(userId);
  return safeArray(notifications).filter((n: any) => !n.read).length;
}
