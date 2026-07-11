import type { Account, Role as BackendRole } from "@/backend";
import { getActor } from "@/hooks/backend/_shared";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * The caller's server-side account (principal -> role + linked user), or null
 * if this authenticated principal hasn't registered yet. Disabled while signed
 * out. This is the source of truth for the signed-in user's role.
 */
export function useMyAccount() {
  const { isAuthenticated } = useInternetIdentity();
  return useQuery({
    queryKey: ["myAccount"],
    queryFn: async () => {
      const actor = getActor();
      if (!actor) return null;
      return (await actor.getMyAccount()) as Account | null;
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

/** Self-claim: bind the signed-in principal to a role + seeded user. */
export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      role: string;
      userId: bigint;
      displayName: string;
    }) => {
      const actor = getActor();
      if (!actor) throw new Error("Not connected to the backend");
      const roleVariant = { [input.role]: null } as unknown as BackendRole;
      const res = (await actor.register(
        roleVariant,
        input.userId,
        input.displayName,
      )) as { ok: Account } | { err: string };
      if ("err" in res) throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myAccount"] }),
  });
}
