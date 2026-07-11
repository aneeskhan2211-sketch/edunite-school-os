import type { Thread } from "@/types";

import { useRole } from "@/hooks/useRole";
import { nsToISODate, opt, variantKey } from "@/lib/candid";
import { demoFallback } from "@/lib/devLog";
import { toNat } from "@/lib/toNat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DEMO_ANNOUNCEMENTS, DEMO_MESSAGES, DEMO_THREADS } from "./demo-data";

// ── Hook factory ─────────────────────────────────────────────────────────────

import {
  getActor,
  makeQuery,
  mapMessage,
  mapThread,
  safeArray,
  safeString,
} from "./_shared";

export function useMessages() {
  const threads: Thread[] = [
    {
      id: "t1",
      subject: "Maya progress update",
      participantIds: ["staff-1", "parent-1"],
      unreadCount: 2,
      createdAt: "2026-06-09T10:00:00Z",
      lastMessage: {
        id: "m1",
        threadId: "t1",
        senderId: "parent-1",
        senderRole: "parent",
        content: "Thank you for reaching out. We are concerned too.",
        sentAt: "2026-06-09T10:30:00Z",
        readBy: ["parent-1"],
      },
    },
    {
      id: "t2",
      subject: "Field trip permission reminder",
      participantIds: ["staff-3", "parent-1"],
      unreadCount: 0,
      createdAt: "2026-06-07T08:00:00Z",
      lastMessage: {
        id: "m2",
        threadId: "t2",
        senderId: "staff-3",
        senderRole: "schoolAdmin",
        content: "Please sign the permission slip by Friday.",
        sentAt: "2026-06-07T08:10:00Z",
        readBy: ["staff-3", "parent-1"],
      },
    },
  ];
  return makeQuery(["messages"], threads);
}

export function useThreads() {
  const { userId } = useRole();
  return useQuery({
    queryKey: ["threads", userId],
    queryFn: async () => {
      const demo =
        typeof DEMO_THREADS !== "undefined" ? (DEMO_THREADS as any[]) : [];
      const actor = getActor();
      if (!actor || !userId) return demo;
      try {
        const me = toNat(userId);
        const raw = safeArray<any>((await actor.getThreads(me)) as any[]);
        return await Promise.all(
          raw.map(async (t: any) => {
            let msgs: any[] = [];
            try {
              msgs = safeArray<any>((await actor.getMessages(t.id)) as any[]);
            } catch {
              msgs = [];
            }
            const sorted = [...msgs].sort((a, b) =>
              a.sentAt < b.sentAt ? 1 : a.sentAt > b.sentAt ? -1 : 0,
            );
            const last = sorted.length > 0 ? sorted[0] : null;
            const unread = msgs.filter(
              (m: any) => m.toId === me && m.isRead === false,
            ).length;
            return mapThread(t, last, unread);
          }),
        );
      } catch (e) {
        return demoFallback("threads", demo, e);
      }
    },
    staleTime: 30_000,
  });
}

export function useThread(threadId: string) {
  return useQuery({
    queryKey: ["thread", threadId],
    queryFn: async () => {
      const demo = {
        thread:
          (typeof DEMO_THREADS !== "undefined"
            ? (DEMO_THREADS as any[])
            : []
          ).find((t: any) => t.id === threadId) ?? null,
        messages:
          (typeof DEMO_MESSAGES !== "undefined"
            ? (DEMO_MESSAGES as any)[threadId]
            : []) ?? [],
      };
      const actor = getActor();
      if (!actor) return demo;
      try {
        const tRaw = await actor.getThread(toNat(threadId));
        const t = Array.isArray(tRaw)
          ? tRaw.length > 0
            ? tRaw[0]
            : null
          : tRaw;
        const msgs = safeArray<any>(
          (await actor.getMessages(toNat(threadId))) as any[],
        );
        const sorted = [...msgs].sort((a, b) =>
          a.sentAt < b.sentAt ? -1 : a.sentAt > b.sentAt ? 1 : 0,
        );
        const last = sorted.length > 0 ? sorted[sorted.length - 1] : null;
        return {
          thread: t ? mapThread(t, last, 0) : demo.thread,
          messages: sorted.map(mapMessage),
        };
      } catch (e) {
        return demoFallback("thread", demo, e);
      }
    },
    staleTime: 30_000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { userId } = useRole();
  return useMutation({
    mutationFn: async (data: { threadId: string; body: string }) => {
      const actor = getActor();
      if (!actor || !userId) return data;
      const result = await actor.replyToThread(
        toNat(data.threadId),
        data.body,
        toNat(userId),
      );
      if (result && typeof result === "object" && "err" in result) {
        throw new Error((result as any).err);
      }
      return data;
    },
    onSettled: (_d, _e, vars) => {
      queryClient.invalidateQueries({ queryKey: ["thread", vars.threadId] });
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();
  const { userId } = useRole();
  return useMutation({
    mutationFn: async (data: {
      participantIds: string[];
      subject: string;
      body: string;
    }) => {
      const actor = getActor();
      if (!actor || !userId) return { ...data, id: `thread-${Date.now()}` };
      const id = await actor.createThread(
        data.participantIds.map((p) => toNat(p)),
        data.subject,
        data.body,
        toNat(userId),
      );
      return { ...data, id: String(id) };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });
}

export function useAnnouncements(role: string) {
  return useQuery({
    queryKey: ["announcements", role],
    queryFn: async () => {
      const demo = (
        typeof DEMO_ANNOUNCEMENTS !== "undefined"
          ? (DEMO_ANNOUNCEMENTS as any[])
          : []
      ).filter((a: any) => (a.targetRoles ?? []).includes(role));
      const actor = getActor();
      if (!actor) return demo;
      try {
        const raw = (await actor.getAnnouncements(
          opt({ [role]: null }),
        )) as any[];
        if (!Array.isArray(raw)) return demo;
        return raw.map((a: any) => ({
          id: String(a.id),
          title: safeString(a.title),
          body: safeString(a.body),
          authorId: `staff-${a.authorId}`,
          priority: variantKey(a.priority),
          date: nsToISODate(a.createdAt),
          targetRoles: safeArray<any>(a.targetRoles).map((r: any) =>
            variantKey(r),
          ),
        }));
      } catch (e) {
        return demoFallback("announcements", demo, e);
      }
    },
    staleTime: 60_000,
  });
}

// Map a backend Candid Notification onto the loosely-typed frontend shape.
